import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/services/api";
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type DailyTask,
  type DailyTaskRequest,
  type DailyTaskStatus,
  type TaskCategory,
  type TaskPriority,
} from "@/types/tasks";
import { taskLabel } from "./task-labels";

type FormState = {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: DailyTaskStatus;
  dueDate: string;
};
const emptyForm: FormState = {
  title: "",
  description: "",
  category: "DSA",
  priority: "MEDIUM",
  status: "TODO",
  dueDate: "",
};
const fromTask = (t: DailyTask): FormState => ({
  title: t.title,
  description: t.description ?? "",
  category: t.category,
  priority: t.priority,
  status: t.status,
  dueDate: t.dueDate?.slice(0, 10) ?? "",
});

function validate(f: FormState) {
  const e: Record<string, string> = {};
  if (!f.title.trim()) e["title"] = "Title is required";
  else if (f.title.trim().length > 255) e["title"] = "Title must be 255 characters or fewer";
  return e;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  task: DailyTask | null;
  onSubmit: (data: DailyTaskRequest) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(task ? fromTask(task) : emptyForm);
      setErrors({});
    }
  }, [open, task]);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || null,
      });
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setErrors(err.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  }

  const err = (k: string) =>
    errors[k] && (
      <p id={`task-${k}-err`} className="text-xs text-danger">
        {errors[k]}
      </p>
    );
  const select = <T extends string>(
    key: "category" | "priority" | "status",
    text: string,
    values: readonly T[],
    value: T,
    onChange: (v: T) => void,
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={`task-${key}`}>
        {text}
        <span className="text-danger"> *</span>
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger id={`task-${key}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {values.map((x) => (
            <SelectItem key={x} value={x}>
              {taskLabel(x)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {err(key)}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "Add task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update every detail of this task." : "Plan something you want to get done."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">
              Title<span className="text-danger"> *</span>
            </Label>
            <Input
              id="task-title"
              maxLength={255}
              placeholder="Solve 3 DSA problems"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              aria-invalid={!!errors["title"]}
              aria-describedby={errors["title"] ? "task-title-err" : undefined}
            />
            {err("title")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              rows={3}
              placeholder="Practice arrays and sliding window"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
            {err("description")}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {select("category", "Category", TASK_CATEGORIES, form.category, (v) =>
              set("category", v),
            )}
            {select("priority", "Priority", TASK_PRIORITIES, form.priority, (v) =>
              set("priority", v),
            )}
            {select("status", "Status", TASK_STATUSES, form.status, (v) => set("status", v))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-dueDate">Due date</Label>
            <Input
              id="task-dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
            {err("dueDate")}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              {task ? "Save changes" : "Add task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
