import { PageHeader } from "@/components/common/page-header";
import { LeetCodeCard } from "./leetcode-card";
import { TelegramCard } from "./telegram-card";

export function IntegrationsPage() {
  return (
    <div className="space-y-6 animate-page-in">
      <PageHeader
        title="Integrations"
        description="Connect external services to automatically sync your developer activity."
      />

      <div className="space-y-6">
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
            Development
          </h2>
          <div className="grid gap-6">
            <LeetCodeCard />
            <TelegramCard />
          </div>
        </div>
      </div>
    </div>
  );
}
