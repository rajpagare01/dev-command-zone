import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/page-shell";
import { DsaPage } from "@/components/dsa/dsa-page";
export const Route = createFileRoute("/_authenticated/dsa")({
  head: () => ({
    meta: [
      { title: "DSA Tracker - DevCommand" },
      {
        name: "description",
        content: "Track every problem you solve and build consistent problem-solving habits.",
      },
      { property: "og:title", content: "DSA Tracker - DevCommand" },
      {
        property: "og:description",
        content: "Track every problem you solve and build consistent problem-solving habits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PageShell>
      <DsaPage />
    </PageShell>
  ),
});
