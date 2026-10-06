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
import { ApiError } from "@/services/api";
import type { LearningTopic } from "@/types/learning";

export function ProgressDialog({
  topic,
  onOpenChange,
  onSubmit,
}: {
  topic: LearningTopic | null;
  onOpenChange: (o: boolean) => void;
  onSubmit: (progress: number) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (topic) {
      setValue(String(topic.progress));
      setError(null);
    }
  }, [topic]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const p = Number(value);
    if (value.trim() === "" || !Number.isFinite(p)) return setError("Progress is required");
    if (p < 0 || p > 100) return setError("Progress must be between 0 and 100");
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(p);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors?.["progress"])
        setError(err.fieldErrors["progress"]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={!!topic} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update progress</DialogTitle>
          <DialogDescription>
            {topic ? `${topic.technology} · ${topic.topic}` : ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="lt-progress-only">Progress (%)</Label>
            <Input
              id="lt-progress-only"
              type="number"
              min={0}
              max={100}
              step={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? "lt-progress-only-err" : undefined}
              autoFocus
            />
            {error && (
              <p id="lt-progress-only-err" className="text-xs text-danger">
                {error}
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Status updates automatically based on your progress.
          </p>
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
              {submitting && <Loader2 className="animate-spin" />}Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
