import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "@/components/integrations/integrations-page";

export const Route = createFileRoute("/_authenticated/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations - DevCommand" },
      { property: "og:title", content: "Integrations - DevCommand" },
      { property: "og:description", content: "Connect external services to sync your developer activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "description",
        content: "Connect external services to automatically sync your developer activity.",
      },
    ],
  }),
  component: () => (
    
      <IntegrationsPage />
    
  ),
});
