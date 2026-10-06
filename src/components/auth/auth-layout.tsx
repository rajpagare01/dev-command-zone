import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Code2, FolderKanban, Terminal } from "lucide-react";
import { Brand } from "@/components/common/brand";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden border-r border-border bg-auth-panel p-12 lg:flex lg:flex-col">
        <div className="auth-grid absolute inset-0 opacity-40" />
        <div className="relative z-10">
          <Link to="/dashboard">
            <Brand />
          </Link>
        </div>
        <div className="relative z-10 my-auto max-w-xl">
          <div className="mb-8 flex items-center gap-2 text-xs font-medium text-primary">
            <span className="size-1.5 rounded-full bg-success" />
            YOUR WORKSPACE, ONE COMMAND AWAY
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.08] text-foreground">
            Build momentum.
            <br />
            <span className="text-muted-foreground">Ship what matters.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
            Your personal developer command center for focused learning, deliberate practice, and
            meaningful progress.
          </p>
          <div className="mt-12 overflow-hidden rounded-lg border border-border bg-code-surface shadow-card">
            <div className="flex h-10 items-center gap-2 border-b border-border px-4">
              <span className="size-2.5 rounded-full bg-danger/70" />
              <span className="size-2.5 rounded-full bg-warning/70" />
              <span className="size-2.5 rounded-full bg-success/70" />
              <span className="ml-2 text-xs text-muted-foreground">devcommand - workspace</span>
            </div>
            <div className="space-y-4 p-5 font-mono text-sm">
              <p>
                <span className="text-success">➜</span>{" "}
                <span className="text-primary">~/workspace</span> devcommand focus
              </p>
              <p className="text-muted-foreground">
                <CheckCircle2 className="mr-2 inline size-4 text-success" />
                Plan today’s focused work
              </p>
              <p className="text-muted-foreground">
                <Code2 className="mr-2 inline size-4 text-primary" />
                Track deliberate practice
              </p>
              <p className="text-muted-foreground">
                <FolderKanban className="mr-2 inline size-4 text-warning" />
                Move projects toward delivery
              </p>
              <p>
                <span className="text-success">➜</span>{" "}
                <span className="text-primary">~/workspace</span>{" "}
                <span className="inline-block h-4 w-2 bg-muted-foreground align-middle" />
              </p>
            </div>
          </div>
        </div>
        <p className="relative z-10 flex items-center gap-2 text-xs text-muted-foreground">
          <Terminal className="size-3.5" />
          Designed for the journey, not just the destination.
        </p>
      </section>
      <section className="flex min-h-screen items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
