import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "./password-field";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/services/api";

export function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const next: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next["email"] = "Enter a valid email address.";
    if (!password) next["password"] = "Password is required.";
    setErrors(next);
    setMessage("");
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      await login({ email, password });
      toast.success("Welcome back to DevCommand.");
      await navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      const text =
        apiError?.status === 401 || apiError?.status === 403
          ? "Invalid email or password."
          : (apiError?.message ?? "Unable to sign in. Please try again.");
      setMessage(text);
      toast.error(text);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
      <div className="mb-8">
        <p className="mb-3 font-mono text-xs text-primary">// WELCOME_BACK</p>
        <h1 className="font-display text-2xl font-semibold leading-snug">Sign in to DevCommand</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Continue managing your developer journey.
        </p>
      </div>
      <form onSubmit={submit} noValidate className="space-y-5">
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
              aria-describedby={errors["email"] ? "email-error" : undefined}
            />
          </div>
          {errors["email"] && (
            <p id="email-error" role="alert" className="text-xs text-danger">
              {errors["email"]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordField
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={!!errors["password"]}
            aria-describedby={errors["password"] ? "password-error" : undefined}
          />
          {errors["password"] && (
            <p id="password-error" role="alert" className="text-xs text-danger">
              {errors["password"]}
            </p>
          )}
        </div>
        <Button className="h-11 w-full font-mono" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
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
        Don’t have an account?{" "}
        <Link to="/register" className="inline-flex min-h-11 items-center font-medium text-success hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Create one
        </Link>
      </p>
    </>
  );
}
