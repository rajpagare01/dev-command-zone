import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowDownWideNarrow, ArrowUpNarrowWide, ChevronLeft, ChevronRight, CircleDot, ExternalLink, FolderKanban, Github, ListChecks, MoreHorizontal, Pencil, Plus, RotateCw, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { createProject, deleteProject, projectQueries, updateProject, updateProjectStatus, type ProjectView } from "@/services/projects";
import { PROJECT_SORT_FIELDS, PROJECT_STATUSES, type Project, type ProjectRequest, type ProjectSortField, type ProjectStatus } from "@/types/projects";
import { ProjectFormDialog } from "./project-form-dialog";
import { fmtDate, Pill, projectSortLabel, projectStatusLabel, projectStatusTone } from "./project-labels";
import { ProjectTasksPanel } from "./project-tasks/project-tasks-panel";

const PAGE_SIZE = 12;
const ALL = "all";
type Tab = "all" | ProjectView;
const TABS: { id: Tab; label: string }[] = [{ id: "all", label: "All" }, { id: "active", label: "Active" }, { id: "completed", label: "Completed" }];

function useDebounced<T>(value: T, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}
const errMsg = (e: unknown) => (e instanceof ApiError ? (e.status === 404 ? "Project not found. It may have been deleted." : e.message) : "Something went wrong. Please try again.");

export function ProjectsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("all");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<ProjectStatus | undefined>();
  const [sortBy, setSortBy] = useState<ProjectSortField>("createdAt");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const search = useDebounced(searchInput.trim());
  // Page resets to 0 in the same render when search/filter/sort change; paging keeps them.
  const filterKey = JSON.stringify([search, status, sortBy, direction]);
  const [pageState, setPageState] = useState({ key: filterKey, page: 0 });
  const page = pageState.key === filterKey ? pageState.page : 0;
  const setPage = (p: number) => setPageState({ key: filterKey, page: p });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [tasksFor, setTasksFor] = useState<Project | null>(null);

  const list = useQuery({ ...projectQueries.list({ search, status, page, size: PAGE_SIZE, sortBy, direction }), enabled: tab === "all" });
  const view = useQuery({ ...projectQueries.view(tab === "all" ? "active" : tab), enabled: tab !== "all" });
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: projectQueries.all }), qc.invalidateQueries({ queryKey: ["analytics"] })]);

  const save = useMutation({
    mutationFn: ({ id, data }: { id?: number | undefined; data: ProjectRequest }) => (id ? updateProject(id, data) : createProject(data)),
    onSuccess: async (_d, { id }) => { toast.success(id ? "Project updated" : "Project added"); setFormOpen(false); await refresh(); },
    onError: (e) => toast.error(e instanceof ApiError && e.fieldErrors && Object.keys(e.fieldErrors).length ? "Please fix the highlighted fields." : errMsg(e)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: async () => {
      toast.success("Project deleted"); setDeleting(null);
      if (tab === "all" && list.data && list.data.content.length === 1 && page > 0) setPage(page - 1);
      await Promise.all([refresh(), qc.invalidateQueries({ queryKey: ["project-tasks"] })]);
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const changeStatus = useMutation({
    mutationFn: ({ id, value }: { id: number; value: ProjectStatus }) => updateProjectStatus(id, value),
    onSuccess: async (p) => { toast.success(`Status: ${projectStatusLabel[p.status]}`); await refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const clearFilters = () => { setSearchInput(""); setStatus(undefined); };
  const hasFilters = !!(searchInput || status);
  const q = tab === "all" ? list : view;
  const rows = tab === "all" ? list.data?.content : view.data;
  const emptyText: Record<Tab, string> = { all: "No projects yet", active: "No active projects", completed: "No completed projects yet" };

  const Actions = ({ p }: { p: Project }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${p.name}`} disabled={changeStatus.isPending && changeStatus.variables?.id === p.id}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
    <DropdownMenuItem onSelect={() => setTasksFor(p)}><ListChecks />Open tasks</DropdownMenuItem>
    <DropdownMenuSub><DropdownMenuSubTrigger><CircleDot />Change status</DropdownMenuSubTrigger><DropdownMenuSubContent>{PROJECT_STATUSES.map((s) => <DropdownMenuItem key={s} disabled={s === p.status} onSelect={() => changeStatus.mutate({ id: p.id, value: s })}>{projectStatusLabel[s]}</DropdownMenuItem>)}</DropdownMenuSubContent></DropdownMenuSub>
    <DropdownMenuItem onSelect={() => { setEditing(p); setFormOpen(true); }}><Pencil />Edit</DropdownMenuItem>
    <DropdownMenuSeparator /><DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => setDeleting(p)}><Trash2 />Delete</DropdownMenuItem>
  </DropdownMenuContent></DropdownMenu>;

  return <div className="space-y-6 animate-page-in">
    <PageHeader title="Projects" description="Keep active builds, links, and delivery progress together." action={<Button onClick={openAdd}><Plus />Add project</Button>} />

    <div role="tablist" aria-label="Project views" className="inline-flex flex-wrap gap-1 rounded-md border border-border bg-card p-1">
      {TABS.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn("rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", tab === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>{t.label}</button>)}
    </div>

    {tab === "all" && <Card><CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_170px_150px_auto_auto]">
      <div className="relative sm:col-span-2 lg:col-span-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search project name" placeholder="Search project name" className="pl-9" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} /></div>
      <Select value={status ?? ALL} onValueChange={(v) => setStatus(v === ALL ? undefined : (v as ProjectStatus))}><SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>All statuses</SelectItem>{PROJECT_STATUSES.map((s) => <SelectItem key={s} value={s}>{projectStatusLabel[s]}</SelectItem>)}</SelectContent></Select>
      <Select value={sortBy} onValueChange={(v) => setSortBy(v as ProjectSortField)}><SelectTrigger aria-label="Sort by"><SelectValue /></SelectTrigger><SelectContent>{PROJECT_SORT_FIELDS.map((f) => <SelectItem key={f} value={f}>{projectSortLabel[f]}</SelectItem>)}</SelectContent></Select>
      <Button variant="outline" onClick={() => setDirection((d) => (d === "asc" ? "desc" : "asc"))} aria-label={`Sort direction: ${direction === "asc" ? "ascending" : "descending"}`}>{direction === "asc" ? <ArrowUpNarrowWide /> : <ArrowDownWideNarrow />}{direction === "asc" ? "Asc" : "Desc"}</Button>
      {hasFilters && <Button variant="ghost" onClick={clearFilters}><X />Clear</Button>}
    </CardContent></Card>}

    {q.isPending ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading projects">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-44 w-full" />)}</div>
    : q.isError ? <Card><CardContent role="alert" className="flex flex-col items-center gap-3 p-10 text-center"><AlertCircle className="size-6 text-danger" /><p className="text-sm text-muted-foreground">{errMsg(q.error)}</p><Button size="sm" variant="outline" onClick={() => void q.refetch()}><RotateCw />Retry</Button></CardContent></Card>
    : rows && rows.length === 0 ? <Card><CardContent className="flex flex-col items-center gap-3 p-12 text-center"><span className="grid size-12 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary"><FolderKanban className="size-6" /></span><p className="font-display font-semibold">{tab === "all" && hasFilters ? "No projects match these filters" : emptyText[tab]}</p>{tab === "all" && hasFilters ? <Button variant="outline" onClick={clearFilters}>Clear filters</Button> : <Button onClick={openAdd}><Plus />Add project</Button>}</CardContent></Card>
    : rows && <div className={cn("space-y-4 transition-opacity", q.isFetching && "opacity-60")}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((p) => <Card key={p.id} className="flex flex-col transition-all hover:border-primary/25"><CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h2 className="truncate font-display font-semibold">{p.name}</h2><div className="mt-1.5"><Pill className={projectStatusTone[p.status]}>{projectStatusLabel[p.status]}</Pill></div></div><Actions p={p} /></div>
        {p.description ? <p className="line-clamp-3 text-sm text-muted-foreground">{p.description}</p> : <p className="text-sm italic text-muted-foreground/70">No description</p>}
        <dl className="grid grid-cols-2 gap-2 text-xs"><div><dt className="text-muted-foreground">Start</dt><dd className="mt-0.5 font-medium">{fmtDate(p.startDate)}</dd></div><div><dt className="text-muted-foreground">End</dt><dd className="mt-0.5 font-medium">{fmtDate(p.endDate)}</dd></div></dl>
        <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs">
          {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"><Github className="size-3.5" />GitHub</a>}
          {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"><ExternalLink className="size-3.5" />Live</a>}
          <span className="ml-auto text-muted-foreground">Updated {fmtDate(p.updatedAt)}</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setTasksFor(p)}><ListChecks />Open tasks</Button>
      </CardContent></Card>)}</div>
      {tab === "all" && list.data ? <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row"><span>{list.data.totalElements} project{list.data.totalElements === 1 ? "" : "s"} · Page {list.data.number + 1} of {Math.max(1, list.data.totalPages)}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={list.data.number === 0 || list.isFetching} onClick={() => setPage(list.data.number - 1)}><ChevronLeft />Previous</Button><Button variant="outline" size="sm" disabled={list.data.last || list.isFetching} onClick={() => setPage(list.data.number + 1)}>Next<ChevronRight /></Button></div></div>
        : <p className="text-sm text-muted-foreground">{rows.length} project{rows.length === 1 ? "" : "s"}</p>}
    </div>}

    <ProjectFormDialog open={formOpen} onOpenChange={setFormOpen} project={editing} onSubmit={async (d) => { await save.mutateAsync({ id: editing?.id, data: d }); }} />
    <ProjectTasksPanel project={tasksFor} onOpenChange={(o) => { if (!o) { setTasksFor(null); void qc.invalidateQueries({ queryKey: ["analytics"] }); } }} />
    <AlertDialog open={!!deleting} onOpenChange={(o) => !o && !remove.isPending && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this project?</AlertDialogTitle><AlertDialogDescription>“{deleting?.name}” and all of its tasks will be permanently removed. This can’t be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel><AlertDialogAction disabled={remove.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={(e) => { e.preventDefault(); if (deleting) remove.mutate(deleting.id); }}>{remove.isPending ? "Deleting…" : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
