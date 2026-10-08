import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/page-shell";
import { SettingsPage } from "@/components/settings/settings-page";
export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings - DevCommand" },
      {
        name: "description",
        content: "Review your DevCommand account, session, and workspace environment.",
      },
      { property: "og:title", content: "Settings - DevCommand" },
      {
        property: "og:description",
        content: "Review your DevCommand account, session, and workspace environment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PageShell>
      <SettingsPage />
    </PageShell>
  ),
});
