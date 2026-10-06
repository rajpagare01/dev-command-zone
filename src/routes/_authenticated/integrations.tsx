import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/page-shell";
import { IntegrationsPage } from "@/components/integrations/integrations-page";

export const Route = createFileRoute("/_authenticated/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations - DevCommand" },
      {
        name: "description",
        content: "Connect external services to automatically sync your developer activity.",
      },
    ],
  }),
  component: () => (
    <PageShell>
      <IntegrationsPage />
    </PageShell>
  ),
});
