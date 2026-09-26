import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowDownWideNarrow, ArrowUpNarrowWide, ChevronLeft, ChevronRight, Flag, ListChecks, MoreHorizontal, Pencil, Plus, RotateCw, Trash2, X, CircleDot } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { createProjectTask, deleteProjectTask, projectTaskQueries, updateProjectTask, updateProjectTaskPriority, updateProjectTaskStatus, type ProjectTaskView } from "@/services/project-tasks";
import { PROJECT_TASK_PRIORITIES, PROJECT_TASK_SORT_FIELDS, PROJECT_TASK_STATUSES, type Project, type ProjectTask, type ProjectTaskPriority, type ProjectTaskRequest, type ProjectTaskSortField, type ProjectTaskStatus } from "@/types/projects";
import { fmtDate, Pill } from "../project-labels";
import { ProjectTaskFormDialog } from "./project-task-form-dialog";
import { taskPriorityLabel, taskPriorityTone, taskSortLabel, taskStatusLabel, taskStatusTone } from "./project-task-labels";

const PAGE_SIZE = 10;
const ALL = "all";
type Tab = "all" | ProjectTaskView;
const TABS: { id: Tab; label: string }[] = [{ id: "all", label: "All" }, { id: "pending", label: "Pending" }, { id: "completed", label: "Completed" }];
const errMsg = (e: unknown) => (e instanceof ApiError ? (e.status === 404 ? "Task or project not found. It may have been deleted." : e.message) : "Something went wrong. Please try again.");

export function ProjectTasksPanel({ project, onOpenChange }: { project: Project | null; onOpenChange: (o: boolean) => void }) {
  return <Dialog open={!!project} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
      <DialogHeader><DialogTitle>{project?.name ?? "Tasks"}</DialogTitle><DialogDescription>Tasks for this project.</DialogDescription></DialogHeader>
      {project && <TasksBody key={project.id} projectId={project.id} />}
    </DialogContent>
  </Dialog>;
}

function TasksBody({ projectId }: { projectId: number }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("all");
  const [status, setStatus] = useState<ProjectTaskStatus | undefined>();
  const [priority, setPriority] = useState<ProjectTaskPriority | undefined>();
  const [sortBy, setSortBy] = useState<ProjectTaskSortField>("createdAt");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const filterKey = JSON.stringify([status, priority, sortBy, direction]);
  const [pageState, setPageState] = useState({ key: filterKey, page: 0 });
  const page = pageState.key === filterKey ? pageState.page : 0;
  const setPage = (p: number) => setPageState({ key: filterKey, page: p });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectTask | null>(null);
  const [deleting, setDeleting] = useState<ProjectTask | null>(null);

  const list = useQuery({ ...projectTaskQueries.list(projectId, { status, priority, page, size: PAGE_SIZE, sortBy, direction }), enabled: tab === "all" });
  const view = useQuery({ ...projectTaskQueries.view(projectId, tab === "all" ? "pending" : tab), enabled: tab !== "all" });
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: projectTaskQueries.project(projectId) }), qc.invalidateQueries({ queryKey: ["analytics"] })]);

  const save = useMutation({
    mutationFn: ({ id, data }: { id?: number | undefined; data: ProjectTaskRequest }) => (id ? updateProjectTask(projectId, id, data) : createProjectTask(projectId, data)),
    onSuccess: async (_d, { id }) => { toast.success(id ? "Task updated" : "Task added"); setFormOpen(false); await refresh(); },
    onError: (e) => toast.error(e instanceof ApiError && e.fieldErrors && Object.keys(e.fieldErrors).length ? "Please fix the highlighted fields." : errMsg(e)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteProjectTask(projectId, id),
    onSuccess: async () => { toast.success("Task deleted"); setDeleting(null); if (tab === "all" && list.data && list.data.content.length === 1 && page > 0) setPage(page - 1); await refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });
  const setStatusM = useMutation({
    mutationFn: ({ id, value }: { id: number; value: ProjectTaskStatus }) => updateProjectTaskStatus(projectId, id, value),
    onSuccess: async (t) => { toast.success(`Status: ${taskStatusLabel[t.status]}`); await refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });
  const setPriorityM = useMutation({
    mutationFn: ({ id, value }: { id: number; value: ProjectTaskPriority }) => updateProjectTaskPriority(projectId, id, value),
    onSuccess: async (t) => { toast.success(`Priority: ${taskPriorityLabel[t.priority]}`); await refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });

  const q = tab === "all" ? list : view;
  const rows = tab === "all" ? list.data?.content : view.data;
  const hasFilters = !!(status || priority);
  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const busy = (id: number) => (setStatusM.isPending && setStatusM.variables?.id === id) || (setPriorityM.isPending && setPriorityM.variables?.id === id);

  const Actions = ({ t }: { t: ProjectTask }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${t.title}`} disabled={busy(t.id)}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
    <DropdownMenuSub><DropdownMenuSubTrigger><CircleDot />Status</DropdownMenuSubTrigger><DropdownMenuSubContent>{PROJECT_TASK_STATUSES.map((s) => <DropdownMenuItem key={s} disabled={s === t.status} onSelect={() => setStatusM.mutate({ id: t.id, value: s })}>{taskStatusLabel[s]}</DropdownMenuItem>)}</DropdownMenuSubContent></DropdownMenuSub>
    <DropdownMenuSub><DropdownMenuSubTrigger><Flag />Priority</DropdownMenuSubTrigger><DropdownMenuSubContent>{PROJECT_TASK_PRIORITIES.map((p) => <DropdownMenuItem key={p} disabled={p === t.priority} onSelect={() => setPriorityM.mutate({ id: t.id, value: p })}>{taskPriorityLabel[p]}</DropdownMenuItem>)}</DropdownMenuSubContent></DropdownMenuSub>
    <DropdownMenuItem onSelect={() => { setEditing(t); setFormOpen(true); }}><Pencil />Edit</DropdownMenuItem>
    <DropdownMenuSeparator /><DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => setDeleting(t)}><Trash2 />Delete</DropdownMenuItem>
  </DropdownMenuContent></DropdownMenu>;

  return <div className="min-w-0 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div role="tablist" aria-label="Task views" className="inline-flex gap-1 rounded-md border border-border bg-card p-1">
        {TABS.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn("rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", tab === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>{t.label}</button>)}
      </div>
      <Button size="sm" onClick={openAdd}><Plus />Add task</Button>
    </div>

    {tab === "all" && <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto]">
      <Select value={status ?? ALL} onValueChange={(v) => setStatus(v === ALL ? undefined : (v as ProjectTaskStatus))}><SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>All statuses</SelectItem>{PROJECT_TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{taskStatusLabel[s]}</SelectItem>)}</SelectContent></Select>
      <Select value={priority ?? ALL} onValueChange={(v) => setPriority(v === ALL ? undefined : (v as ProjectTaskPriority))}><SelectTrigger aria-label="Priority"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>All priorities</SelectItem>{PROJECT_TASK_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{taskPriorityLabel[p]}</SelectItem>)}</SelectContent></Select>
      <Select value={sortBy} onValueChange={(v) => setSortBy(v as ProjectTaskSortField)}><SelectTrigger aria-label="Sort by"><SelectValue /></SelectTrigger><SelectContent>{PROJECT_TASK_SORT_FIELDS.map((f) => <SelectItem key={f} value={f}>{taskSortLabel[f]}</SelectItem>)}</SelectContent></Select>
      <Button variant="outline" onClick={() => setDirection((d) => (d === "asc" ? "desc" : "asc"))} aria-label={`Sort direction: ${direction === "asc" ? "ascending" : "descending"}`}>{direction === "asc" ? <ArrowUpNarrowWide /> : <ArrowDownWideNarrow />}{direction === "asc" ? "Asc" : "Desc"}</Button>
      {hasFilters && <Button variant="ghost" onClick={() => { setStatus(undefined); setPriority(undefined); }}><X />Clear</Button>}
    </div>}

    <div className="rounded-md border border-border">
      {q.isPending ? <div className="space-y-3 p-4" aria-busy="true" aria-label="Loading tasks">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-11 w-full" />)}</div>
      : q.isError ? <div role="alert" className="flex flex-col items-center gap-3 p-8 text-center"><AlertCircle className="size-6 text-danger" /><p className="text-sm text-muted-foreground">{errMsg(q.error)}</p><Button size="sm" variant="outline" onClick={() => void q.refetch()}><RotateCw />Retry</Button></div>
      : rows && rows.length === 0 ? <div className="flex flex-col items-center gap-3 p-10 text-center"><ListChecks className="size-6 text-primary" /><p className="font-display font-semibold">{tab === "all" && hasFilters ? "No tasks match these filters" : tab === "pending" ? "No pending tasks" : tab === "completed" ? "No completed tasks yet" : "No tasks yet"}</p>{tab === "all" && !hasFilters && <Button size="sm" onClick={openAdd}><Plus />Add task</Button>}</div>
      : rows && <div className={cn("transition-opacity", q.isFetching && "opacity-60")}>
        <ul className="divide-y divide-border">{rows.map((t) => <li key={t.id} className="flex items-start justify-between gap-3 p-3">
          <div className="min-w-0 space-y-1.5"><p className={cn("font-medium", t.status === "DONE" && "text-muted-foreground line-through")}>{t.title}</p>{t.description && <p className="line-clamp-2 text-xs text-muted-foreground">{t.description}</p>}
            <div className="flex flex-wrap items-center gap-2"><Pill className={taskStatusTone[t.status]}>{taskStatusLabel[t.status]}</Pill><Pill className={taskPriorityTone[t.priority]}>{taskPriorityLabel[t.priority]}</Pill><span className="text-xs text-muted-foreground">Due {fmtDate(t.dueDate)}</span></div></div>
          <Actions t={t} />
        </li>)}</ul>
        {tab === "all" && list.data ? <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-3 py-2 text-sm text-muted-foreground sm:flex-row"><span>{list.data.totalElements} task{list.data.totalElements === 1 ? "" : "s"} · Page {list.data.number + 1} of {Math.max(1, list.data.totalPages)}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={list.data.number === 0 || list.isFetching} onClick={() => setPage(list.data.number - 1)}><ChevronLeft />Previous</Button><Button variant="outline" size="sm" disabled={list.data.last || list.isFetching} onClick={() => setPage(list.data.number + 1)}>Next<ChevronRight /></Button></div></div>
          : <div className="border-t border-border px-3 py-2 text-sm text-muted-foreground">{rows.length} task{rows.length === 1 ? "" : "s"}</div>}
      </div>}
    </div>

    <ProjectTaskFormDialog open={formOpen} onOpenChange={setFormOpen} task={editing} onSubmit={async (d) => { await save.mutateAsync({ id: editing?.id, data: d }); }} />
    <AlertDialog open={!!deleting} onOpenChange={(o) => !o && !remove.isPending && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this task?</AlertDialogTitle><AlertDialogDescription>“{deleting?.title}” will be permanently removed. This can’t be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel><AlertDialogAction disabled={remove.isPending} className="bg-danger text-foreground hover:bg-danger/90" onClick={(e) => { e.preventDefault(); if (deleting) remove.mutate(deleting.id); }}>{remove.isPending ? "Deleting…" : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
