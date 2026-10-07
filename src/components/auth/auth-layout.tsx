import type { ReactNode } from "react";
import { Terminal } from "lucide-react";
import { Brand } from "@/components/common/brand";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:p-6">
      <section aria-label="DevCommand account" className="auth-terminal w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-terminal animate-page-in">
        <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border bg-terminal-chrome px-4 py-2">
          <div aria-hidden="true" className="flex shrink-0 gap-2">
            <span className="size-2.5 rounded-full bg-terminal-red" />
            <span className="size-2.5 rounded-full bg-terminal-yellow" />
            <span className="size-2.5 rounded-full bg-terminal-green" />
          </div>
          <span className="min-w-0 truncate font-mono text-[10px] text-muted-foreground">devcommand / account</span>
        </div>
        <div className="p-6 sm:p-10">
          <Brand className="mb-9" />
          {children}
        </div>
        <footer className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border bg-code-surface px-4 py-3 font-mono text-[10px] leading-4 text-muted-foreground">
          <span className="flex shrink-0 items-center gap-1.5 text-primary"><Terminal className="size-3" /> PERSONAL WORKSPACE</span>
          <span className="min-w-0">Designed for the journey.</span>
        </footer>
      </section>
    </main>
  );
}
