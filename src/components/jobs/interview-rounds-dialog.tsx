import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CalendarClock, Loader2, MoreHorizontal, Pencil, Plus, RotateCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { createInterviewRound, deleteInterviewRound, interviewQueries, updateInterviewRound } from "@/services/interviews";
import { INTERVIEW_STATUSES, type InterviewRound, type InterviewRoundRequest, type InterviewStatus, type JobApplication } from "@/types/jobs";
import { interviewTone, jobLabel } from "./job-labels";

const errMsg = (e: unknown) => (e instanceof ApiError ? (e.status === 404 ? "Not found. It may have been deleted." : e.message) : "Something went wrong. Please try again.");
const fmt = (d: string | null) => (d ? new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "Not scheduled");
const toRequest = (r: InterviewRound): InterviewRoundRequest => ({ roundNumber: r.roundNumber, roundType: r.roundType, scheduledAt: r.scheduledAt, status: r.status, feedback: r.feedback, notes: r.notes });

type FormState = { roundNumber: string; roundType: string; scheduledAt: string; status: InterviewStatus; feedback: string; notes: string };

function RoundForm({ round, nextNumber, onCancel, onSubmit }: { round: InterviewRound | null; nextNumber: number; onCancel: () => void; onSubmit: (d: InterviewRoundRequest) => Promise<void> }) {
  const [f, setF] = useState<FormState>(() => round
    ? { roundNumber: String(round.roundNumber), roundType: round.roundType, scheduledAt: round.scheduledAt?.slice(0, 16) ?? "", status: round.status, feedback: round.feedback ?? "", notes: round.notes ?? "" }
    : { roundNumber: String(nextNumber), roundType: "", scheduledAt: "", status: "SCHEDULED", feedback: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const v: Record<string, string> = {};
    const n = Number(f.roundNumber);
    if (!Number.isInteger(n) || n <= 0) v["roundNumber"] = "Round number must be a positive whole number";
    if (!f.roundType.trim()) v["roundType"] = "Round type is required";
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    try {
      // datetime-local gives "YYYY-MM-DDTHH:mm"; backend expects LocalDateTime "YYYY-MM-DDTHH:mm:ss".
      await onSubmit({ roundNumber: n, roundType: f.roundType.trim(), scheduledAt: f.scheduledAt ? (f.scheduledAt.length === 16 ? `${f.scheduledAt}:00` : f.scheduledAt) : null, status: f.status, feedback: f.feedback.trim() || null, notes: f.notes.trim() || null });
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setErrors(err.fieldErrors);
    } finally { setSubmitting(false); }
  }
  const err = (k: string) => errors[k] && <p className="text-xs text-danger">{errors[k]}</p>;

  return <form onSubmit={submit} noValidate className="space-y-4 rounded-md border border-border bg-surface-subtle p-4">
    <p className="font-display text-sm font-semibold">{round ? `Edit round ${round.roundNumber}` : "New interview round"}</p>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5"><Label htmlFor="ir-number">Round number<span className="text-danger"> *</span></Label><Input id="ir-number" type="number" min={1} step={1} value={f.roundNumber} onChange={(e) => set("roundNumber", e.target.value)} aria-invalid={!!errors["roundNumber"]} />{err("roundNumber")}</div>
      <div className="space-y-1.5"><Label htmlFor="ir-type">Round type<span className="text-danger"> *</span></Label><Input id="ir-type" placeholder="Technical" value={f.roundType} onChange={(e) => set("roundType", e.target.value)} aria-invalid={!!errors["roundType"]} />{err("roundType")}</div>
      <div className="space-y-1.5"><Label htmlFor="ir-when">Scheduled at</Label><Input id="ir-when" type="datetime-local" value={f.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} />{err("scheduledAt")}</div>
      <div className="space-y-1.5"><Label htmlFor="ir-status">Status<span className="text-danger"> *</span></Label><Select value={f.status} onValueChange={(v) => set("status", v as InterviewStatus)}><SelectTrigger id="ir-status"><SelectValue /></SelectTrigger><SelectContent>{INTERVIEW_STATUSES.map((s) => <SelectItem key={s} value={s}>{jobLabel(s)}</SelectItem>)}</SelectContent></Select>{err("status")}</div>
    </div>
    <div className="space-y-1.5"><Label htmlFor="ir-feedback">Feedback</Label><Textarea id="ir-feedback" rows={2} value={f.feedback} onChange={(e) => set("feedback", e.target.value)} />{err("feedback")}</div>
    <div className="space-y-1.5"><Label htmlFor="ir-notes">Notes</Label><Textarea id="ir-notes" rows={2} placeholder="Prepare Spring Boot and DSA" value={f.notes} onChange={(e) => set("notes", e.target.value)} />{err("notes")}</div>
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={submitting} onClick={onCancel}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{round ? "Save round" : "Add round"}</Button></div>
  </form>;
}

export function InterviewRoundsDialog({ job, onOpenChange }: { job: JobApplication | null; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const jobId = job?.id ?? 0;
  const [mode, setMode] = useState<"list" | "add" | InterviewRound>("list");
  const [deleting, setDeleting] = useState<InterviewRound | null>(null);
  useEffect(() => { setMode("list"); setDeleting(null); }, [jobId]);

  const rounds = useQuery({ ...interviewQueries.list(jobId), enabled: !!job });
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: interviewQueries.list(jobId).queryKey }), qc.invalidateQueries({ queryKey: ["analytics"] })]);

  const save = useMutation({
    mutationFn: ({ roundId, data }: { roundId?: number | undefined; data: InterviewRoundRequest }) => (roundId ? updateInterviewRound(jobId, roundId, data) : createInterviewRound(jobId, data)),
    onSuccess: async (_d, { roundId }) => { toast.success(roundId ? "Interview round updated" : "Interview round added"); setMode("list"); await refresh(); },
    onError: (e) => toast.error(e instanceof ApiError && e.fieldErrors && Object.keys(e.fieldErrors).length ? "Please fix the highlighted fields." : errMsg(e)),
  });
  const remove = useMutation({
    mutationFn: (roundId: number) => deleteInterviewRound(jobId, roundId),
    onSuccess: async () => { toast.success("Interview round deleted"); setDeleting(null); await refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });

  const sorted = [...(rounds.data ?? [])].sort((a, b) => a.roundNumber - b.roundNumber);
  const nextNumber = sorted.reduce((m, r) => Math.max(m, r.roundNumber), 0) + 1;
  const busy = save.isPending || remove.isPending;

  return <Dialog open={!!job} onOpenChange={(o) => !busy && onOpenChange(o)}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>Interview rounds</DialogTitle><DialogDescription>{job ? `${job.role} at ${job.company}` : ""}</DialogDescription></DialogHeader>

      {mode !== "list" ? <RoundForm key={mode === "add" ? "add" : mode.id} round={mode === "add" ? null : mode} nextNumber={nextNumber} onCancel={() => setMode("list")} onSubmit={async (d) => { await save.mutateAsync({ roundId: mode === "add" ? undefined : mode.id, data: d }); }} />
      : rounds.isPending ? <div className="space-y-3" aria-busy="true" aria-label="Loading interview rounds">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      : rounds.isError ? <div role="alert" className="flex flex-col items-center gap-3 p-6 text-center"><AlertCircle className="size-6 text-danger" /><p className="text-sm text-muted-foreground">{errMsg(rounds.error)}</p><Button size="sm" variant="outline" onClick={() => void rounds.refetch()}><RotateCw />Retry</Button></div>
      : sorted.length === 0 ? <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border p-8 text-center"><CalendarClock className="size-6 text-primary" /><p className="font-display font-semibold">No interview rounds yet</p><Button onClick={() => setMode("add")}><Plus />Add interview round</Button></div>
      : <ul className={cn("space-y-3", rounds.isFetching && "opacity-60")}>{sorted.map((r) => <li key={r.id} className="rounded-md border border-border bg-surface-subtle p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><p className="font-medium">Round {r.roundNumber} · {r.roundType}</p><p className="mt-0.5 text-xs text-muted-foreground">{fmt(r.scheduledAt)}</p></div>
            <div className="flex items-center gap-1">
              <span className={cn("inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium", interviewTone[r.status])}>{jobLabel(r.status)}</span>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for round ${r.roundNumber}`} disabled={busy}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Change status</DropdownMenuLabel>
                {INTERVIEW_STATUSES.map((s) => <DropdownMenuItem key={s} disabled={s === r.status} onSelect={() => save.mutate({ roundId: r.id, data: { ...toRequest(r), status: s } })}>{jobLabel(s)}</DropdownMenuItem>)}
                <DropdownMenuSeparator /><DropdownMenuItem onSelect={() => setMode(r)}><Pencil />Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => setDeleting(r)}><Trash2 />Delete</DropdownMenuItem>
              </DropdownMenuContent></DropdownMenu>
            </div>
          </div>
          {r.feedback && <p className="mt-2 text-sm"><span className="text-muted-foreground">Feedback: </span>{r.feedback}</p>}
          {r.notes && <p className="mt-1 text-sm"><span className="text-muted-foreground">Notes: </span>{r.notes}</p>}
        </li>)}</ul>}

      {deleting && <div role="alertdialog" aria-label="Confirm delete" className="flex flex-col gap-3 rounded-md border border-danger/30 bg-danger/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm">Delete round {deleting.roundNumber} ({deleting.roundType})? This can’t be undone.</p><div className="flex gap-2"><Button size="sm" variant="outline" disabled={remove.isPending} onClick={() => setDeleting(null)}>Cancel</Button><Button size="sm" className="bg-danger text-foreground hover:bg-danger/90" disabled={remove.isPending} onClick={() => remove.mutate(deleting.id)}>{remove.isPending ? "Deleting…" : "Delete"}</Button></div></div>}

      {mode === "list" && sorted.length > 0 && <DialogFooter><Button onClick={() => setMode("add")}><Plus />Add interview round</Button></DialogFooter>}
    </DialogContent>
  </Dialog>;
}
