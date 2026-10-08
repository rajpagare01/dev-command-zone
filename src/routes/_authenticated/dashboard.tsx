import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/page-shell";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard - DevCommand" },
      {
        name: "description",
        content:
          "Your developer activity, focus, learning, applications, and projects at a glance.",
      },
      { property: "og:title", content: "Dashboard - DevCommand" },
      { property: "og:description", content: "Your developer activity at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PageShell>
      <DashboardContent />
    </PageShell>
  ),
});
