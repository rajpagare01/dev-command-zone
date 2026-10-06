import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Activity, ArrowRight, Check, Code2, ListChecks, Loader2, Play, RotateCw, Server } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { completeTask, startTask, taskQueries } from "@/services/tasks";
import type { DailyTask } from "@/types/tasks";
import { useEffect, useState } from "react";
import { SHORTCUTS_STATE_EVENT, SHORTCUTS_TOGGLE_EVENT } from "@/components/common/workspace-command";

type SyncSignal = { isFetching: boolean; isError: boolean; isSuccess: boolean; dataUpdatedAt: number };

export function SystemStatus({ signals }: { signals: SyncSignal[] }) {
  const syncing = signals.some((signal) => signal.isFetching);
  const failures = signals.filter((signal) => signal.isError).length;
  const healthy = signals.every((signal) => signal.isSuccess);
  const lastSync = Math.max(0, ...signals.map((signal) => signal.dataUpdatedAt));
  const backend = import.meta.env["VITE_API_URL"] ?? "http://localhost:8080";
  let host = "Not configured";
  try { host = new URL(backend).host; } catch { /* Do not display invalid configuration. */ }
  const label = syncing ? "Syncing" : failures ? "Requests failed" : healthy ? "API responding" : "Not checked";
  return <div role="status" className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3 text-xs text-muted-foreground">
    <span className="flex items-center gap-2"><Activity className={syncing ? "size-3.5 text-info" : failures ? "size-3.5 text-warning" : healthy ? "size-3.5 text-success" : "size-3.5"} /><span className="font-medium text-foreground">{label}</span></span>
    <span className="flex items-center gap-2"><Server className="size-3.5" /><span className="font-mono">{host}</span></span>
    <span className="flex items-center gap-2 sm:ml-auto"><RotateCw className={syncing ? "size-3.5 animate-spin motion-reduce:animate-none" : "size-3.5"} />{lastSync ? `Last response ${new Date(lastSync).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "Awaiting first response"}</span>
  </div>;
}

export function PriorityFocus({ solvedToday, dsaError, dsaPending }: { solvedToday: number | undefined; dsaError: boolean; dsaPending: boolean }) {
  const client = useQueryClient();
  const active = useQuery(taskQueries.list({ priority: "HIGH", status: "IN_PROGRESS" }));
  const queued = useQuery(taskQueries.list({ priority: "HIGH", status: "TODO" }));
  const task = active.data?.content[0] ?? queued.data?.content[0];
  const loading = active.isPending || queued.isPending;
  const error = active.isError || queued.isError;
  const mutation = useMutation({
    mutationFn: (item: DailyTask) => item.status === "IN_PROGRESS" ? completeTask(item.id) : startTask(item.id),
    onSuccess: () => {
      toast.success("Task updated");
      void client.invalidateQueries({ queryKey: ["tasks"] });
      void client.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (failure: Error) => toast.error(failure.message),
  });
  return <section aria-label="Priority focus">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-base font-semibold">Priority focus</h2>
      <div className="flex gap-2">
        {([{ to: "/dsa", label: "DSA", key: "D" }, { to: "/tasks", label: "Tasks", key: "T" }, { to: "/jobs", label: "Jobs", key: "J" }] as const).map((item) => <Button key={item.to} variant="ghost" size="sm" className="h-8 gap-2 px-2" asChild><Link to={item.to}>{item.label}<kbd className="rounded-sm border border-border px-1 font-mono text-[10px] text-muted-foreground">G {item.key}</kbd></Link></Button>)}
        <ShortcutsToggle />
      </div>
    </div>
    <div className="divide-y divide-border border-y border-border">
      <div className="flex flex-wrap items-center gap-3 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-info/10 text-info"><Code2 className="size-4" /></span>
        <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">Problem-solving · Today</p><p className="mt-1 text-sm font-medium">{dsaPending ? "Loading DSA activity…" : dsaError ? "DSA activity unavailable" : solvedToday === undefined ? "Problem-solving workspace" : `${solvedToday} ${solvedToday === 1 ? "problem" : "problems"} solved today`}</p></div>
        <Button variant="outline" size="sm" asChild><Link to="/dsa">Open DSA<ArrowRight /></Link></Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 py-4" aria-busy={loading || mutation.isPending}>
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-warning/10 text-warning"><ListChecks className="size-4" /></span>
        <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">Daily task · High priority</p>{loading ? <Skeleton className="mt-2 h-4 w-40" /> : <p className="mt-1 break-words text-sm font-medium">{error ? "Priority tasks unavailable" : task?.title ?? "No open high-priority tasks"}</p>}{task && !error && !loading && <p className="mt-1 text-xs text-muted-foreground">{task.status === "IN_PROGRESS" ? "In progress" : "To do"}{task.dueDate ? ` · Due ${task.dueDate}` : ""}</p>}</div>
        {error ? <Button variant="outline" size="sm" onClick={() => { void active.refetch(); void queued.refetch(); }}><RotateCw />Retry</Button> : task && !loading ? <Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate(task)}>{mutation.isPending ? <Loader2 className="animate-spin" /> : task.status === "IN_PROGRESS" ? <Check /> : <Play />}{task.status === "IN_PROGRESS" ? "Complete" : "Start task"}</Button> : <Button variant="outline" size="sm" asChild><Link to="/tasks">Open tasks<ArrowRight /></Link></Button>}
      </div>
    </div>
  </section>;
}
function ShortcutsToggle() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const sync = (event: Event) => setOpen(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener(SHORTCUTS_STATE_EVENT, sync);
    return () => window.removeEventListener(SHORTCUTS_STATE_EVENT, sync);
  }, []);
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-2 px-2"
      aria-label={open ? "Hide keyboard shortcuts" : "Show keyboard shortcuts"}
      aria-pressed={open}
      aria-haspopup="dialog"
      aria-keyshortcuts="?"
      onClick={(event) => { event.currentTarget.focus(); window.dispatchEvent(new Event(SHORTCUTS_TOGGLE_EVENT)); }}
    >
      Shortcuts<kbd aria-hidden="true" className="rounded-sm border border-border px-1 font-mono text-[10px] text-muted-foreground">?</kbd>
    </Button>
  );
}
