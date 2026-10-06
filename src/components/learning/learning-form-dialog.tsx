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
  LEARNING_STATUSES,
  type LearningStatus,
  type LearningTopic,
  type LearningTopicRequest,
} from "@/types/learning";
import { statusLabel } from "./learning-labels";

type FormState = {
  technology: string;
  topic: string;
  progress: string;
  status: LearningStatus;
  hoursSpent: string;
  resourceUrl: string;
  notes: string;
};
const emptyForm: FormState = {
  technology: "",
  topic: "",
  progress: "0",
  status: "NOT_STARTED",
  hoursSpent: "",
  resourceUrl: "",
  notes: "",
};
const fromTopic = (t: LearningTopic): FormState => ({
  technology: t.technology,
  topic: t.topic,
  progress: String(t.progress),
  status: t.status,
  hoursSpent: t.hoursSpent == null ? "" : String(t.hoursSpent),
  resourceUrl: t.resourceUrl ?? "",
  notes: t.notes ?? "",
});

function validate(f: FormState) {
  const e: Record<string, string> = {};
  if (!f.technology.trim()) e["technology"] = "Technology is required";
  if (!f.topic.trim()) e["topic"] = "Topic is required";
  const p = Number(f.progress);
  if (f.progress.trim() === "" || !Number.isFinite(p)) e["progress"] = "Progress is required";
  else if (p < 0 || p > 100) e["progress"] = "Progress must be between 0 and 100";
  if (f.hoursSpent.trim() !== "") {
    const h = Number(f.hoursSpent);
    if (!Number.isFinite(h) || h < 0) e["hoursSpent"] = "Hours spent must be 0 or more";
  }
  if (f.resourceUrl.trim()) {
    try {
      new URL(f.resourceUrl.trim());
    } catch {
      e["resourceUrl"] = "Enter a valid URL";
    }
  }
  return e;
}

export function LearningFormDialog({
  open,
  onOpenChange,
  topic,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  topic: LearningTopic | null;
  onSubmit: (data: LearningTopicRequest) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (open) {
      setForm(topic ? fromTopic(topic) : emptyForm);
      setErrors({});
    }
  }, [open, topic]);
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
        technology: form.technology.trim(),
        topic: form.topic.trim(),
        progress: Number(form.progress),
        status: form.status,
        hoursSpent: form.hoursSpent.trim() === "" ? null : Number(form.hoursSpent),
        resourceUrl: form.resourceUrl.trim() || null,
        notes: form.notes.trim() || null,
      });
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setErrors(err.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  }

  const err = (k: string) =>
    errors[k] && (
      <p id={`lt-${k}-err`} className="text-xs text-danger">
        {errors[k]}
      </p>
    );
  const field = (
    k: "technology" | "topic" | "progress" | "hoursSpent" | "resourceUrl",
    label: string,
    required: boolean,
    props: React.ComponentProps<typeof Input>,
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={`lt-${k}`}>
        {label}
        {required && <span className="text-danger"> *</span>}
      </Label>
      <Input
        id={`lt-${k}`}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `lt-${k}-err` : undefined}
        {...props}
      />
      {err(k)}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{topic ? "Edit topic" : "Add topic"}</DialogTitle>
          <DialogDescription>
            {topic ? "Update every detail of this topic." : "Track something new you are learning."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("technology", "Technology", true, { placeholder: "Spring Boot" })}
            {field("topic", "Topic", true, { placeholder: "Spring Security" })}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {field("progress", "Progress (%)", true, {
              type: "number",
              min: 0,
              max: 100,
              step: 1,
              inputMode: "numeric",
            })}
            <div className="space-y-1.5">
              <Label htmlFor="lt-status">
                Status<span className="text-danger"> *</span>
              </Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as LearningStatus)}>
                <SelectTrigger id="lt-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEARNING_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabel[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("status")}
            </div>
            {field("hoursSpent", "Hours spent", false, {
              type: "number",
              min: 0,
              step: 0.5,
              inputMode: "decimal",
              placeholder: "2.5",
            })}
          </div>
          {field("resourceUrl", "Resource URL", false, { type: "url", placeholder: "https://…" })}
          <div className="space-y-1.5">
            <Label htmlFor="lt-notes">Notes</Label>
            <Textarea
              id="lt-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
            {err("notes")}
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
              {topic ? "Save changes" : "Add topic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
