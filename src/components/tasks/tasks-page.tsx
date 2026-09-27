import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, CheckSquare2, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Play, Plus, RotateCw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { completeTask, createTask, deleteTask, startTask, taskQueries, updateTask, type TaskView } from "@/services/tasks";
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES, type DailyTask, type DailyTaskRequest, type DailyTaskStatus, type TaskCategory, type TaskPriority } from "@/types/tasks";
import { TaskFormDialog } from "./task-form-dialog";
import { taskLabel } from "./task-labels";

const PAGE_SIZE = 10;
const ALL = "all";
type Tab = "all" | TaskView;
const TABS: { id: Tab; label: string }[] = [{ id: "all", label: "All" }, { id: "today", label: "Today" }, { id: "upcoming", label: "Upcoming" }, { id: "completed", label: "Completed" }];
const priorityTone: Record<TaskPriority, string> = { LOW: "bg-muted text-muted-foreground border-border", MEDIUM: "bg-warning/10 text-warning border-warning/20", HIGH: "bg-danger/10 text-danger border-danger/20" };
const statusTone: Record<DailyTaskStatus, string> = { TODO: "bg-info/10 text-info border-info/20", IN_PROGRESS: "bg-warning/10 text-warning border-warning/20", COMPLETED: "bg-success/10 text-success border-success/20" };

const Pill = ({ className, children }: { className: string; children: string }) => <span className={cn("inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium", className)}>{children}</span>;
const fmtDate = (d: string | null) => (d ? new Date(`${d.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—");
const fmtDateTime = (d: string | null) => (d ? new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—");
const errMsg = (e: unknown) => (e instanceof ApiError ? (e.status === 404 ? "Task not found. It may have been deleted." : e.message) : "Something went wrong. Please try again.");

export function TasksPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("all");
  const [category, setCategory] = useState<TaskCategory | undefined>();
  const [priority, setPriority] = useState<TaskPriority | undefined>();
  const [status, setStatus] = useState<DailyTaskStatus | undefined>();
  const [dueDate, setDueDate] = useState("");
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DailyTask | null>(null);
  const [deleting, setDeleting] = useState<DailyTask | null>(null);

  useEffect(() => { setPage(0); }, [category, priority, status, dueDate]);

  const list = useQuery({ ...taskQueries.list({ category, priority, status, dueDate: dueDate || undefined, page, size: PAGE_SIZE }), enabled: tab === "all" });
  const view = useQuery({ ...taskQueries.view(tab === "all" ? "today" : tab), enabled: tab !== "all" });
  const hasFilters = !!(category || priority || status || dueDate);

  // Invalidating analytics makes the Dashboard refetch on next visit.
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: taskQueries.all }), qc.invalidateQueries({ queryKey: ["analytics"] })]);

  const save = useMutation({
    mutationFn: ({ id, data }: { id?: number | undefined; data: DailyTaskRequest }) => (id ? updateTask(id, data) : createTask(data)),
    onSuccess: async (_d, { id }) => { toast.success(id ? "Task updated" : "Task added"); setFormOpen(false); await refresh(); },
    onError: (e) => toast.error(e instanceof ApiError && e.fieldErrors && Object.keys(e.fieldErrors).length ? "Please fix the highlighted fields." : errMsg(e)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: async () => {
      toast.success("Task deleted"); setDeleting(null);
      if (tab === "all" && list.data && list.data.content.length === 1 && page > 0) setPage(page - 1);
      await refresh();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const action = useMutation({
    mutationFn: ({ id, kind }: { id: number; kind: "start" | "complete" }) => (kind === "start" ? startTask(id) : completeTask(id)),
    onSuccess: async (t, { kind }) => {
      // Apply the returned task immediately, then refetch views it may have moved between.
      qc.setQueriesData<{ content: DailyTask[] } | DailyTask[]>({ queryKey: taskQueries.all }, (old) => {
        if (!old) return old;
        const swap = (arr: DailyTask[]) => arr.map((x) => (x.id === t.id ? t : x));
        return Array.isArray(old) ? swap(old) : { ...old, content: swap(old.content) };
      });
      toast.success(kind === "start" ? `Started “${t.title}”` : `Completed “${t.title}”`);
      await refresh();
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const clearFilters = () => { setCategory(undefined); setPriority(undefined); setStatus(undefined); setDueDate(""); };
  const q = tab === "all" ? list : view;
  const rows: DailyTask[] | undefined = tab === "all" ? list.data?.content : view.data;

  const RowActions = ({ t }: { t: DailyTask }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${t.title}`} disabled={action.isPending && action.variables?.id === t.id}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
    <DropdownMenuItem disabled={t.status !== "TODO"} onSelect={() => action.mutate({ id: t.id, kind: "start" })}><Play />Start</DropdownMenuItem>
    <DropdownMenuItem disabled={t.status === "COMPLETED"} onSelect={() => action.mutate({ id: t.id, kind: "complete" })}><CheckCircle2 />Complete</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => { setEditing(t); setFormOpen(true); }}><Pencil />Edit</DropdownMenuItem>
    <DropdownMenuSeparator /><DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => setDeleting(t)}><Trash2 />Delete</DropdownMenuItem>
  </DropdownMenuContent></DropdownMenu>;

  const Title = ({ t }: { t: DailyTask }) => <div className="min-w-0"><p className={cn("font-medium text-foreground", t.status === "COMPLETED" && "text-muted-foreground line-through")}>{t.title}</p>{t.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>}</div>;
  const filtering = tab === "all" && hasFilters;
  const emptyText: Record<Tab, string> = { all: "No tasks yet", today: "Nothing due today", upcoming: "No upcoming tasks", completed: "No completed tasks yet" };

  return <div className="space-y-6 animate-page-in">
    <PageHeader title="Tasks" description="Plan today, organize what is next, and close the loop on completed work." action={<Button onClick={openAdd}><Plus />Add task</Button>} />

    <div role="tablist" aria-label="Task views" className="inline-flex flex-wrap gap-1 rounded-md border border-border bg-card p-1">
      {TABS.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn("rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", tab === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>{t.label}</button>)}
    </div>

    {tab === "all" && <Card><CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[160px_160px_160px_180px_auto]">
      <Select value={category ?? ALL} onValueChange={(v) => setCategory(v === ALL ? undefined : (v as TaskCategory))}><SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>All categories</SelectItem>{TASK_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{taskLabel(c)}</SelectItem>)}</SelectContent></Select>
      <Select value={priority ?? ALL} onValueChange={(v) => setPriority(v === ALL ? undefined : (v as TaskPriority))}><SelectTrigger aria-label="Priority"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>All priorities</SelectItem>{TASK_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{taskLabel(p)}</SelectItem>)}</SelectContent></Select>
      <Select value={status ?? ALL} onValueChange={(v) => setStatus(v === ALL ? undefined : (v as DailyTaskStatus))}><SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>All statuses</SelectItem>{TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{taskLabel(s)}</SelectItem>)}</SelectContent></Select>
      <Input type="date" aria-label="Due date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      {hasFilters && <Button variant="ghost" onClick={clearFilters}><X />Clear</Button>}
    </CardContent></Card>}

    <Card><CardContent className="p-0">
      {q.isPending ? <div className="space-y-3 p-5" aria-busy="true" aria-label="Loading tasks">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      : q.isError ? <div role="alert" className="flex flex-col items-center gap-3 p-10 text-center"><AlertCircle className="size-6 text-danger" /><p className="text-sm text-muted-foreground">{errMsg(q.error)}</p><Button size="sm" variant="outline" onClick={() => void q.refetch()}><RotateCw />Retry</Button></div>
      : rows && rows.length === 0 ? <div className="flex flex-col items-center gap-3 p-12 text-center"><span className="grid size-12 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary"><CheckSquare2 className="size-6" /></span><p className="font-display font-semibold">{filtering ? "No tasks match these filters" : emptyText[tab]}</p>{filtering ? <Button variant="outline" onClick={clearFilters}>Clear filters</Button> : <Button onClick={openAdd}><Plus />Add task</Button>}</div>
      : rows && <div className={cn("transition-opacity", q.isFetching && "opacity-60")}>
        <div className="hidden overflow-x-auto md:block"><table className="data-table w-full text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">{["Task", "Category", "Priority", "Status", "Due", "Completed", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{rows.map((t) => <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface-subtle">
            <td className="max-w-md px-4 py-3"><Title t={t} /></td><td className="px-4 py-3 text-muted-foreground">{taskLabel(t.category)}</td>
            <td className="px-4 py-3"><Pill className={priorityTone[t.priority]}>{taskLabel(t.priority)}</Pill></td><td className="px-4 py-3"><Pill className={statusTone[t.status]}>{taskLabel(t.status)}</Pill></td>
            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{fmtDate(t.dueDate)}</td><td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{fmtDateTime(t.completedAt)}</td>
            <td className="px-2 py-3 text-right"><RowActions t={t} /></td>
          </tr>)}</tbody></table></div>
        <ul className="divide-y divide-border md:hidden">{rows.map((t) => <li key={t.id} className="space-y-2 p-4"><div className="flex items-start justify-between gap-2"><Title t={t} /><RowActions t={t} /></div><div className="flex flex-wrap items-center gap-2"><Pill className={priorityTone[t.priority]}>{taskLabel(t.priority)}</Pill><Pill className={statusTone[t.status]}>{taskLabel(t.status)}</Pill><span className="text-xs text-muted-foreground">{taskLabel(t.category)}</span></div><p className="text-xs text-muted-foreground">Due {fmtDate(t.dueDate)}{t.completedAt ? ` · Completed ${fmtDateTime(t.completedAt)}` : ""}</p></li>)}</ul>
        {tab === "all" && list.data ? <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row"><span>{list.data.totalElements} task{list.data.totalElements === 1 ? "" : "s"} · Page {list.data.number + 1} of {Math.max(1, list.data.totalPages)}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={list.data.number === 0 || list.isFetching} onClick={() => setPage(list.data.number - 1)}><ChevronLeft />Previous</Button><Button variant="outline" size="sm" disabled={list.data.last || list.isFetching} onClick={() => setPage(list.data.number + 1)}>Next<ChevronRight /></Button></div></div>
          : <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">{rows.length} task{rows.length === 1 ? "" : "s"}</div>}
      </div>}
    </CardContent></Card>

    <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} task={editing} onSubmit={async (d) => { await save.mutateAsync({ id: editing?.id, data: d }); }} />

    <AlertDialog open={!!deleting} onOpenChange={(o) => !o && !remove.isPending && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this task?</AlertDialogTitle><AlertDialogDescription>“{deleting?.title}” will be permanently removed. This can’t be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel><AlertDialogAction disabled={remove.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={(e) => { e.preventDefault(); if (deleting) remove.mutate(deleting.id); }}>{remove.isPending ? "Deleting…" : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
