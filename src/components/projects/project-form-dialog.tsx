import { useEffect, useState, type ComponentProps, type FormEvent } from "react";
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
  PROJECT_STATUSES,
  type Project,
  type ProjectRequest,
  type ProjectStatus,
} from "@/types/projects";
import { projectStatusLabel } from "./project-labels";

type FormState = {
  name: string;
  description: string;
  githubUrl: string;
  liveUrl: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
};
const emptyForm: FormState = {
  name: "",
  description: "",
  githubUrl: "",
  liveUrl: "",
  status: "PLANNING",
  startDate: "",
  endDate: "",
};
const fromProject = (p: Project): FormState => ({
  name: p.name,
  description: p.description ?? "",
  githubUrl: p.githubUrl ?? "",
  liveUrl: p.liveUrl ?? "",
  status: p.status,
  startDate: p.startDate?.slice(0, 10) ?? "",
  endDate: p.endDate?.slice(0, 10) ?? "",
});
const ISO = /^\d{4}-\d{2}-\d{2}$/;

function validate(f: FormState) {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e["name"] = "Name is required";
  if (!f.status) e["status"] = "Status is required";
  if (f.startDate && !ISO.test(f.startDate)) e["startDate"] = "Use a valid date (YYYY-MM-DD)";
  if (f.endDate && !ISO.test(f.endDate)) e["endDate"] = "Use a valid date (YYYY-MM-DD)";
  return e;
}

/** Builds the request; empty optional fields are omitted entirely. */
function toRequest(f: FormState): ProjectRequest {
  const r: ProjectRequest = { name: f.name.trim(), status: f.status };
  const d = f.description.trim(),
    g = f.githubUrl.trim(),
    l = f.liveUrl.trim();
  if (d) r.description = d;
  if (g) r.githubUrl = g;
  if (l) r.liveUrl = l;
  if (f.startDate) r.startDate = f.startDate;
  if (f.endDate) r.endDate = f.endDate;
  return r;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  project: Project | null;
  onSubmit: (data: ProjectRequest) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (open) {
      setForm(project ? fromProject(project) : emptyForm);
      setErrors({});
    }
  }, [open, project]);
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
      await onSubmit(toRequest(form));
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setErrors(err.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  }

  const err = (k: string) =>
    errors[k] && (
      <p id={`pj-${k}-err`} className="text-xs text-danger">
        {errors[k]}
      </p>
    );
  const field = (
    k: "name" | "githubUrl" | "liveUrl" | "startDate" | "endDate",
    label: string,
    required: boolean,
    props: ComponentProps<typeof Input>,
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={`pj-${k}`}>
        {label}
        {required && <span className="text-danger"> *</span>}
      </Label>
      <Input
        id={`pj-${k}`}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `pj-${k}-err` : undefined}
        {...props}
      />
      {err(k)}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "Add project"}</DialogTitle>
          <DialogDescription>
            {project ? "Update every detail of this project." : "Track something you are building."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
            {field("name", "Name", true, { placeholder: "DevCommand Dashboard" })}
            <div className="space-y-1.5">
              <Label htmlFor="pj-status">
                Status<span className="text-danger"> *</span>
              </Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as ProjectStatus)}>
                <SelectTrigger id="pj-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {projectStatusLabel[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("status")}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pj-description">Description</Label>
            <Textarea
              id="pj-description"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
            {err("description")}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("githubUrl", "GitHub URL", false, {
              type: "url",
              placeholder: "https://github.com/…",
            })}
            {field("liveUrl", "Live URL", false, { type: "url", placeholder: "https://…" })}
            {field("startDate", "Start date", false, { type: "date" })}
            {field("endDate", "End date", false, { type: "date" })}
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
              {project ? "Save changes" : "Add project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
