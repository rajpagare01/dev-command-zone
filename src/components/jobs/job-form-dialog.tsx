import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/services/api";
import { APPLICATION_STATUSES, type ApplicationStatus, type JobApplication, type JobApplicationRequest } from "@/types/jobs";
import { jobLabel } from "./job-labels";

type FormState = { company: string; role: string; location: string; jobUrl: string; source: string; salary: string; applicationDate: string; status: ApplicationStatus; notes: string };
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const emptyForm = (): FormState => ({ company: "", role: "", location: "", jobUrl: "", source: "", salary: "", applicationDate: today(), status: "APPLIED", notes: "" });
const fromJob = (j: JobApplication): FormState => ({ company: j.company, role: j.role, location: j.location ?? "", jobUrl: j.jobUrl ?? "", source: j.source ?? "", salary: j.salary ?? "", applicationDate: j.applicationDate.slice(0, 10), status: j.status, notes: j.notes ?? "" });

function validate(f: FormState) {
  const e: Record<string, string> = {};
  if (!f.company.trim()) e["company"] = "Company is required";
  if (!f.role.trim()) e["role"] = "Role is required";
  if (!f.applicationDate) e["applicationDate"] = "Application date is required";
  if (f.jobUrl.trim()) { try { new URL(f.jobUrl.trim()); } catch { e["jobUrl"] = "Enter a valid URL (https://…)"; } }
  return e;
}

export function JobFormDialog({ open, onOpenChange, job, onSubmit }: { open: boolean; onOpenChange: (o: boolean) => void; job: JobApplication | null; onSubmit: (data: JobApplicationRequest) => Promise<void> }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (open) { setForm(job ? fromJob(job) : emptyForm()); setErrors({}); } }, [open, job]);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const opt = (s: string) => s.trim() || null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const v = validate(form); setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    try {
      await onSubmit({ company: form.company.trim(), role: form.role.trim(), location: opt(form.location), jobUrl: opt(form.jobUrl), source: opt(form.source), salary: opt(form.salary), applicationDate: form.applicationDate, status: form.status, notes: opt(form.notes) });
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setErrors(err.fieldErrors);
    } finally { setSubmitting(false); }
  }

  const err = (k: string) => errors[k] && <p id={`job-${k}-err`} className="text-xs text-danger">{errors[k]}</p>;
  const field = (k: "company" | "role" | "location" | "jobUrl" | "source" | "salary", text: string, placeholder: string, required = false, type = "text") => <div className="space-y-1.5">
    <Label htmlFor={`job-${k}`}>{text}{required && <span className="text-danger"> *</span>}</Label>
    <Input id={`job-${k}`} type={type} placeholder={placeholder} value={form[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `job-${k}-err` : undefined} />{err(k)}
  </div>;

  return <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><DialogTitle>{job ? "Edit application" : "Add application"}</DialogTitle><DialogDescription>{job ? "Update every detail of this application." : "Track a new opportunity in your pipeline."}</DialogDescription></DialogHeader>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {field("company", "Company", "Example Corp", true)}
          {field("role", "Role", "Java Backend Developer", true)}
          {field("location", "Location", "Indore")}
          {field("source", "Source", "LinkedIn")}
          {field("salary", "Salary", "6-8 LPA")}
          {field("jobUrl", "Job URL", "https://example.com/job", false, "url")}
          <div className="space-y-1.5"><Label htmlFor="job-applicationDate">Application date<span className="text-danger"> *</span></Label><Input id="job-applicationDate" type="date" value={form.applicationDate} onChange={(e) => set("applicationDate", e.target.value)} aria-invalid={!!errors["applicationDate"]} />{err("applicationDate")}</div>
          <div className="space-y-1.5"><Label htmlFor="job-status">Status<span className="text-danger"> *</span></Label><Select value={form.status} onValueChange={(v) => set("status", v as ApplicationStatus)}><SelectTrigger id="job-status"><SelectValue /></SelectTrigger><SelectContent>{APPLICATION_STATUSES.map((s) => <SelectItem key={s} value={s}>{jobLabel(s)}</SelectItem>)}</SelectContent></Select>{err("status")}</div>
        </div>
        <div className="space-y-1.5"><Label htmlFor="job-notes">Notes</Label><Textarea id="job-notes" rows={3} placeholder="Applied through company portal" value={form.notes} onChange={(e) => set("notes", e.target.value)} />{err("notes")}</div>
        <DialogFooter><Button type="button" variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{job ? "Save changes" : "Add application"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
