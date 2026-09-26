import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowDownUp, BriefcaseBusiness, CalendarClock, ChevronLeft, ChevronRight, ExternalLink, MoreHorizontal, Pencil, Plus, RotateCw, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { createJob, deleteJob, jobQueries, updateJob, updateJobStatus } from "@/services/jobs";
import { APPLICATION_STATUSES, JOB_SORT_FIELDS, type ApplicationStatus, type JobApplication, type JobApplicationRequest, type JobSortField, type SortDirection } from "@/types/jobs";
import { InterviewRoundsDialog } from "./interview-rounds-dialog";
import { JobFormDialog } from "./job-form-dialog";
import { applicationTone, jobLabel } from "./job-labels";

const PAGE_SIZE = 20;
const ALL = "all";
const sortLabel: Record<JobSortField, string> = { createdAt: "Date added", applicationDate: "Application date", company: "Company", status: "Status" };

const Pill = ({ s }: { s: ApplicationStatus }) => <span className={cn("inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium", applicationTone[s])}>{jobLabel(s)}</span>;
const fmtDate = (d: string) => new Date(`${d.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
const errMsg = (e: unknown) => (e instanceof ApiError ? (e.status === 404 ? "Application not found. It may have been deleted." : e.message) : "Something went wrong. Please try again.");

type TextKey = "search" | "company" | "role" | "source";
interface JobQuery { search: string; company: string; role: string; source: string; status: ApplicationStatus | undefined; page: number; size: number; sortBy: JobSortField; direction: SortDirection }
const EMPTY_TEXT: Record<TextKey, string> = { search: "", company: "", role: "", source: "" };
const INITIAL: JobQuery = { ...EMPTY_TEXT, status: undefined, page: 0, size: PAGE_SIZE, sortBy: "createdAt", direction: "desc" };
const DEBOUNCE_MS = 400;

export function JobsPage() {
  const qc = useQueryClient();
  // Single source of truth for the request. Text boxes keep a local draft that is committed (trimmed, page reset) after a debounce.
  const [query, setQuery] = useState<JobQuery>(INITIAL);
  const [draft, setDraft] = useState<Record<TextKey, string>>(EMPTY_TEXT);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [deleting, setDeleting] = useState<JobApplication | null>(null);
  const [interviewsFor, setInterviewsFor] = useState<JobApplication | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setQuery((q) => {
      const next = { search: draft.search.trim(), company: draft.company.trim(), role: draft.role.trim(), source: draft.source.trim() };
      const changed = (Object.keys(next) as TextKey[]).some((k) => next[k] !== q[k]);
      return changed ? { ...q, ...next, page: 0 } : q;
    }), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [draft]);

  /** Any non-page change resets to page 0 in the same update, so no request is ever sent with new filters on an old page. */
  const update = (patch: Partial<Omit<JobQuery, "page">>) => setQuery((q) => ({ ...q, ...patch, page: 0 }));
  const setPage = (page: number) => setQuery((q) => ({ ...q, page }));
  const setText = (k: TextKey, v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const { status, sortBy, direction, page } = query;

  const list = useQuery(jobQueries.list(query));
  const hasFilters = !!(draft.search || draft.company || draft.role || draft.source || status);

  // Invalidating analytics makes the Dashboard refetch on next visit.
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: jobQueries.all }), qc.invalidateQueries({ queryKey: ["analytics"] })]);

  const save = useMutation({
    mutationFn: ({ id, data }: { id?: number | undefined; data: JobApplicationRequest }) => (id ? updateJob(id, data) : createJob(data)),
    onSuccess: async (_d, { id }) => { toast.success(id ? "Application updated" : "Application added"); setFormOpen(false); await refresh(); },
    onError: (e) => toast.error(e instanceof ApiError && e.fieldErrors && Object.keys(e.fieldErrors).length ? "Please fix the highlighted fields." : errMsg(e)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteJob(id),
    onSuccess: async () => {
      toast.success("Application deleted"); setDeleting(null);
      if (list.data && list.data.content.length === 1 && page > 0) setPage(page - 1);
      await refresh();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const changeStatus = useMutation({
    mutationFn: ({ id, status: s }: { id: number; status: ApplicationStatus }) => updateJobStatus(id, s),
    onSuccess: async (j) => {
      qc.setQueriesData<{ content: JobApplication[] }>({ queryKey: [...jobQueries.all, "list"] }, (old) => old && { ...old, content: old.content.map((x) => (x.id === j.id ? j : x)) });
      toast.success(`${j.company} moved to ${jobLabel(j.status)}`);
      await refresh();
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const clearFilters = () => { setDraft(EMPTY_TEXT); update({ ...EMPTY_TEXT, status: undefined }); };
  const rows = list.data?.content;

  const RowActions = ({ j }: { j: JobApplication }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${j.company}`} disabled={changeStatus.isPending && changeStatus.variables?.id === j.id}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
    <DropdownMenuItem onSelect={() => setInterviewsFor(j)}><CalendarClock />View interviews</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => { setEditing(j); setFormOpen(true); }}><Pencil />Edit</DropdownMenuItem>
    <DropdownMenuSeparator /><DropdownMenuLabel className="text-xs text-muted-foreground">Move to</DropdownMenuLabel>
    {APPLICATION_STATUSES.map((s) => <DropdownMenuItem key={s} disabled={s === j.status} onSelect={() => changeStatus.mutate({ id: j.id, status: s })}>{jobLabel(s)}</DropdownMenuItem>)}
    <DropdownMenuSeparator /><DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => setDeleting(j)}><Trash2 />Delete</DropdownMenuItem>
  </DropdownMenuContent></DropdownMenu>;

  const Title = ({ j }: { j: JobApplication }) => <div className="min-w-0"><p className="font-medium text-foreground">{j.role}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><span className="truncate">{j.company}{j.location ? ` · ${j.location}` : ""}</span>{j.jobUrl && <a href={j.jobUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${j.company} job posting`} className="text-primary hover:underline"><ExternalLink className="size-3" /></a>}</p></div>;

  return <div className="space-y-6 animate-page-in">
    <PageHeader title="Job Applications" description="Manage every opportunity and interview stage in one clear pipeline." action={<Button onClick={openAdd}><Plus />Add application</Button>} />

    <Card><CardContent className="space-y-3 p-4">
      <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search applications" placeholder="Search company, role, notes…" className="pl-9" value={draft.search} onChange={(e) => setText("search", e.target.value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_160px_180px_auto_auto]">
        <Input aria-label="Filter by company" placeholder="Company" value={draft.company} onChange={(e) => setText("company", e.target.value)} />
        <Input aria-label="Filter by role" placeholder="Role" value={draft.role} onChange={(e) => setText("role", e.target.value)} />
        <Input aria-label="Filter by source" placeholder="Source" value={draft.source} onChange={(e) => setText("source", e.target.value)} />
        <Select value={status ?? ALL} onValueChange={(v) => update({ status: v === ALL ? undefined : (v as ApplicationStatus) })}><SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>All statuses</SelectItem>{APPLICATION_STATUSES.map((s) => <SelectItem key={s} value={s}>{jobLabel(s)}</SelectItem>)}</SelectContent></Select>
        <Select value={sortBy} onValueChange={(v) => update({ sortBy: v as JobSortField })}><SelectTrigger aria-label="Sort by"><SelectValue /></SelectTrigger><SelectContent>{JOB_SORT_FIELDS.map((f) => <SelectItem key={f} value={f}>Sort: {sortLabel[f]}</SelectItem>)}</SelectContent></Select>
        <Button variant="outline" onClick={() => update({ direction: direction === "asc" ? "desc" : "asc" })} aria-label={`Sort direction: ${direction === "asc" ? "ascending" : "descending"}`}><ArrowDownUp />{direction === "asc" ? "Asc" : "Desc"}</Button>
        {hasFilters && <Button variant="ghost" onClick={clearFilters}><X />Clear</Button>}
      </div>
    </CardContent></Card>

    <Card><CardContent className="p-0">
      {list.isPending ? <div className="space-y-3 p-5" aria-busy="true" aria-label="Loading applications">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      : list.isError ? <div role="alert" className="flex flex-col items-center gap-3 p-10 text-center"><AlertCircle className="size-6 text-danger" /><p className="text-sm text-muted-foreground">{errMsg(list.error)}</p><Button size="sm" variant="outline" onClick={() => void list.refetch()}><RotateCw />Retry</Button></div>
      : rows && rows.length === 0 ? <div className="flex flex-col items-center gap-3 p-12 text-center"><span className="grid size-12 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary"><BriefcaseBusiness className="size-6" /></span><p className="font-display font-semibold">{hasFilters ? "No applications match these filters" : "No applications yet"}</p>{hasFilters ? <Button variant="outline" onClick={clearFilters}>Clear filters</Button> : <Button onClick={openAdd}><Plus />Add application</Button>}</div>
      : rows && list.data && <div className={cn("transition-opacity", list.isFetching && "opacity-60")}>
        <div className="hidden overflow-x-auto md:block"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">{["Role", "Status", "Source", "Salary", "Applied", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{rows.map((j) => <tr key={j.id} className="border-b border-border last:border-0 hover:bg-surface-subtle">
            <td className="max-w-md px-4 py-3"><Title j={j} /></td><td className="px-4 py-3"><Pill s={j.status} /></td>
            <td className="px-4 py-3 text-muted-foreground">{j.source ?? "—"}</td><td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{j.salary ?? "—"}</td>
            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{fmtDate(j.applicationDate)}</td>
            <td className="whitespace-nowrap px-2 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => setInterviewsFor(j)}><CalendarClock />Interviews</Button><RowActions j={j} /></td>
          </tr>)}</tbody></table></div>
        <ul className="divide-y divide-border md:hidden">{rows.map((j) => <li key={j.id} className="space-y-2 p-4"><div className="flex items-start justify-between gap-2"><Title j={j} /><RowActions j={j} /></div><div className="flex flex-wrap items-center gap-2"><Pill s={j.status} />{j.source && <span className="text-xs text-muted-foreground">{j.source}</span>}{j.salary && <span className="text-xs text-muted-foreground">· {j.salary}</span>}</div><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">Applied {fmtDate(j.applicationDate)}</p><Button variant="outline" size="sm" onClick={() => setInterviewsFor(j)}><CalendarClock />Interviews</Button></div></li>)}</ul>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row"><span>{list.data.totalElements} application{list.data.totalElements === 1 ? "" : "s"} · Page {list.data.number + 1} of {Math.max(1, list.data.totalPages)}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={list.data.number === 0 || list.isFetching} onClick={() => setPage(list.data.number - 1)}><ChevronLeft />Previous</Button><Button variant="outline" size="sm" disabled={list.data.last || list.isFetching} onClick={() => setPage(list.data.number + 1)}>Next<ChevronRight /></Button></div></div>
      </div>}
    </CardContent></Card>

    <JobFormDialog open={formOpen} onOpenChange={setFormOpen} job={editing} onSubmit={async (d) => { await save.mutateAsync({ id: editing?.id, data: d }); }} />
    <InterviewRoundsDialog job={interviewsFor} onOpenChange={(o) => !o && setInterviewsFor(null)} />

    <AlertDialog open={!!deleting} onOpenChange={(o) => !o && !remove.isPending && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this application?</AlertDialogTitle><AlertDialogDescription>“{deleting?.role}” at {deleting?.company} and its interview rounds will be permanently removed. This can’t be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel><AlertDialogAction disabled={remove.isPending} className="bg-danger text-foreground hover:bg-danger/90" onClick={(e) => { e.preventDefault(); if (deleting) remove.mutate(deleting.id); }}>{remove.isPending ? "Deleting…" : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
