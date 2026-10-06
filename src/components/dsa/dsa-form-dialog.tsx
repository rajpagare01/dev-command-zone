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
  DSA_DIFFICULTIES,
  DSA_STATUSES,
  type DsaDifficulty,
  type DsaProblem,
  type DsaProblemRequest,
  type DsaStatus,
} from "@/types/dsa";
import { label } from "./dsa-labels";

type FormState = {
  title: string;
  platform: string;
  problemUrl: string;
  topic: string;
  difficulty: DsaDifficulty;
  status: DsaStatus;
  dateSolved: string;
  timeTaken: string;
  notes: string;
  revisionDate: string;
};
const emptyForm: FormState = {
  title: "",
  platform: "",
  problemUrl: "",
  topic: "",
  difficulty: "EASY",
  status: "TODO",
  dateSolved: "",
  timeTaken: "",
  notes: "",
  revisionDate: "",
};
const fromProblem = (p: DsaProblem): FormState => ({
  title: p.title,
  platform: p.platform,
  problemUrl: p.problemUrl ?? "",
  topic: p.topic,
  difficulty: p.difficulty,
  status: p.status,
  dateSolved: p.dateSolved ?? "",
  timeTaken: p.timeTaken?.toString() ?? "",
  notes: p.notes ?? "",
  revisionDate: p.revisionDate ?? "",
});
const orNull = (s: string) => (s.trim() ? s.trim() : null);

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.title.trim()) e["title"] = "Title is required";
  if (!f.platform.trim()) e["platform"] = "Platform is required";
  if (!f.topic.trim()) e["topic"] = "Topic is required";
  if (f.problemUrl.trim() && !/^https?:\/\/\S+$/i.test(f.problemUrl.trim()))
    e["problemUrl"] = "Enter a valid URL (https://…)";
  if (f.timeTaken.trim()) {
    const n = Number(f.timeTaken);
    if (!Number.isInteger(n) || n <= 0) e["timeTaken"] = "Must be a positive whole number";
  }
  return e;
}

export function DsaFormDialog({
  open,
  onOpenChange,
  problem,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  problem: DsaProblem | null;
  onSubmit: (data: DsaProblemRequest) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(problem ? fromProblem(problem) : emptyForm);
      setErrors({});
    }
  }, [open, problem]);

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
        platform: form.platform.trim(),
        problemUrl: orNull(form.problemUrl),
        topic: form.topic.trim(),
        difficulty: form.difficulty,
        status: form.status,
        dateSolved: orNull(form.dateSolved),
        timeTaken: form.timeTaken.trim() ? Number(form.timeTaken) : null,
        notes: orNull(form.notes),
        revisionDate: orNull(form.revisionDate),
      });
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setErrors(err.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  }

  const field = (
    key: keyof FormState,
    text: string,
    props: { type?: string; placeholder?: string; required?: boolean } = {},
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={`dsa-${key}`}>
        {text}
        {props.required && <span className="text-danger"> *</span>}
      </Label>
      <Input
        id={`dsa-${key}`}
        type={props.type ?? "text"}
        placeholder={props.placeholder}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `dsa-${key}-err` : undefined}
      />
      {errors[key] && (
        <p id={`dsa-${key}-err`} className="text-xs text-danger">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{problem ? "Edit problem" : "Add problem"}</DialogTitle>
          <DialogDescription>
            {problem
              ? "Update every detail of this problem."
              : "Log a new problem to your tracker."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {field("title", "Title", { required: true, placeholder: "Two Sum" })}
          <div className="grid gap-4 sm:grid-cols-2">
            {field("platform", "Platform", { required: true, placeholder: "LeetCode" })}
            {field("topic", "Topic", { required: true, placeholder: "Arrays" })}
          </div>
          {field("problemUrl", "Problem URL", {
            type: "url",
            placeholder: "https://leetcode.com/problems/two-sum",
          })}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dsa-difficulty">
                Difficulty<span className="text-danger"> *</span>
              </Label>
              <Select
                value={form.difficulty}
                onValueChange={(v) => set("difficulty", v as DsaDifficulty)}
              >
                <SelectTrigger id="dsa-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DSA_DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {label(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors["difficulty"] && (
                <p className="text-xs text-danger">{errors["difficulty"]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dsa-status">
                Status<span className="text-danger"> *</span>
              </Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as DsaStatus)}>
                <SelectTrigger id="dsa-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DSA_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {label(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors["status"] && <p className="text-xs text-danger">{errors["status"]}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {field("dateSolved", "Date solved", { type: "date" })}
            {field("revisionDate", "Revision date", { type: "date" })}
            {field("timeTaken", "Time (min)", { type: "number", placeholder: "15" })}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dsa-notes">Notes</Label>
            <Textarea
              id="dsa-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Approach, complexity, gotchas…"
            />
            {errors["notes"] && <p className="text-xs text-danger">{errors["notes"]}</p>}
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
              {problem ? "Save changes" : "Add problem"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
