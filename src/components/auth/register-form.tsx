import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight, Check, Loader2, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "./password-field";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/services/api";

export function RegisterForm() {
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Upper & lowercase", ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "A number", ok: /\d/.test(password) },
  ];
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const confirm = String(data.get("confirm") ?? "");
    const next: Record<string, string> = {};
    if (name.length < 2) next["name"] = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next["email"] = "Enter a valid email address.";
    if (!checks.every((c) => c.ok)) next["password"] = "Password does not meet all requirements.";
    if (confirm !== password) next["confirm"] = "Passwords do not match.";
    setErrors(next);
    setMessage("");
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      await register({ name, email, password });
      toast.success("Registration successful. You can now sign in.");
      await navigate({ to: "/login", search: { redirect: undefined }, replace: true });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      if (apiError?.fieldErrors) setErrors((current) => ({ ...current, ...apiError.fieldErrors }));
      const text =
        apiError?.status === 409
          ? "Email already registered."
          : (apiError?.message ?? "Unable to create your account. Please try again.");
      setMessage(text);
      toast.error(text);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
      <div className="mb-7">
        <p className="mb-3 font-mono text-xs text-primary">// CREATE_WORKSPACE</p>
        <h1 className="font-display text-2xl font-semibold leading-snug">Start your journey</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your personal developer command center.
        </p>
      </div>
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              autoComplete="name"
              className="pl-9"
              placeholder="Your name"
              aria-invalid={!!errors["name"]}
              aria-describedby={errors["name"] ? "name-error" : undefined}
            />
          </div>
          {errors["name"] && (
            <p id="name-error" role="alert" className="text-xs text-danger">
              {errors["name"]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="pl-9"
              placeholder="you@example.com"
              aria-invalid={!!errors["email"]}
              aria-describedby={errors["email"] ? "register-email-error" : undefined}
            />
          </div>
          {errors["email"] && (
            <p id="register-email-error" role="alert" className="text-xs text-danger">
              {errors["email"]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordField
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors["password"]}
            aria-describedby="password-requirements"
          />
          {errors["password"] && (
            <p role="alert" className="text-xs text-danger">
              {errors["password"]}
            </p>
          )}
          <div
            id="password-requirements"
            aria-live="polite"
            className="flex flex-wrap gap-x-4 gap-y-1"
          >
            {checks.map((check) => (
              <span
                key={check.label}
                className={
                  check.ok
                    ? "flex items-center gap-1 text-[11px] text-success"
                    : "flex items-center gap-1 text-[11px] text-muted-foreground"
                }
              >
                <Check className="size-3" />
                {check.label}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <PasswordField
            id="confirm"
            name="confirm"
            autoComplete="new-password"
            placeholder="Repeat your password"
            aria-invalid={!!errors["confirm"]}
            aria-describedby={errors["confirm"] ? "confirm-error" : undefined}
          />
          {errors["confirm"] && (
            <p id="confirm-error" role="alert" className="text-xs text-danger">
              {errors["confirm"]}
            </p>
          )}
        </div>
        <Button className="h-11 w-full font-mono" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight />
            </>
          )}
        </Button>
        {message && (
          <p
            role="status"
            className="rounded-md border border-info/20 bg-info/10 p-3 text-sm text-info"
          >
            {message}
          </p>
        )}
      </form>
      <p className="mt-8 border-t border-border pt-7 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          search={{ redirect: undefined }}
          className="inline-flex min-h-11 items-center font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
