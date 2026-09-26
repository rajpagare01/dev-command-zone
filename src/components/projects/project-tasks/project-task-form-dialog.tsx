import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/services/api";
import { PROJECT_TASK_PRIORITIES, PROJECT_TASK_STATUSES, type ProjectTask, type ProjectTaskPriority, type ProjectTaskRequest, type ProjectTaskStatus } from "@/types/projects";
import { taskPriorityLabel, taskStatusLabel } from "./project-task-labels";

type FormState = { title: string; description: string; status: ProjectTaskStatus; priority: ProjectTaskPriority; dueDate: string };
const emptyForm: FormState = { title: "", description: "", status: "TODO", priority: "MEDIUM", dueDate: "" };
const fromTask = (t: ProjectTask): FormState => ({ title: t.title, description: t.description ?? "", status: t.status, priority: t.priority, dueDate: t.dueDate?.slice(0, 10) ?? "" });

export function ProjectTaskFormDialog({ open, onOpenChange, task, onSubmit }: { open: boolean; onOpenChange: (o: boolean) => void; task: ProjectTask | null; onSubmit: (data: ProjectTaskRequest) => Promise<void> }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (open) { setForm(task ? fromTask(task) : emptyForm); setErrors({}); } }, [open, task]);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const v: Record<string, string> = {};
    if (!form.title.trim()) v["title"] = "Title is required";
    if (form.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.dueDate)) v["dueDate"] = "Use a valid date (YYYY-MM-DD)";
    setErrors(v);
    if (Object.keys(v).length) return;
    const r: ProjectTaskRequest = { title: form.title.trim(), status: form.status, priority: form.priority };
    const d = form.description.trim(); if (d) r.description = d; if (form.dueDate) r.dueDate = form.dueDate;
    setSubmitting(true);
    try { await onSubmit(r); }
    catch (err) { if (err instanceof ApiError && err.fieldErrors) setErrors(err.fieldErrors); }
    finally { setSubmitting(false); }
  }
  const err = (k: string) => errors[k] && <p id={`pt-${k}-err`} className="text-xs text-danger">{errors[k]}</p>;

  return <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader><DialogTitle>{task ? "Edit task" : "Add task"}</DialogTitle><DialogDescription>{task ? "Update every detail of this task." : "Add a task to this project."}</DialogDescription></DialogHeader>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5"><Label htmlFor="pt-title">Title<span className="text-danger"> *</span></Label><Input id="pt-title" value={form.title} onChange={(e) => set("title", e.target.value)} aria-invalid={!!errors["title"]} aria-describedby={errors["title"] ? "pt-title-err" : undefined} placeholder="Design database schema" />{err("title")}</div>
        <div className="space-y-1.5"><Label htmlFor="pt-description">Description</Label><Textarea id="pt-description" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />{err("description")}</div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5"><Label htmlFor="pt-status">Status<span className="text-danger"> *</span></Label><Select value={form.status} onValueChange={(v) => set("status", v as ProjectTaskStatus)}><SelectTrigger id="pt-status"><SelectValue /></SelectTrigger><SelectContent>{PROJECT_TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{taskStatusLabel[s]}</SelectItem>)}</SelectContent></Select>{err("status")}</div>
          <div className="space-y-1.5"><Label htmlFor="pt-priority">Priority<span className="text-danger"> *</span></Label><Select value={form.priority} onValueChange={(v) => set("priority", v as ProjectTaskPriority)}><SelectTrigger id="pt-priority"><SelectValue /></SelectTrigger><SelectContent>{PROJECT_TASK_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{taskPriorityLabel[p]}</SelectItem>)}</SelectContent></Select>{err("priority")}</div>
          <div className="space-y-1.5"><Label htmlFor="pt-dueDate">Due date</Label><Input id="pt-dueDate" type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} aria-invalid={!!errors["dueDate"]} />{err("dueDate")}</div>
        </div>
        <DialogFooter><Button type="button" variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{task ? "Save changes" : "Add task"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
