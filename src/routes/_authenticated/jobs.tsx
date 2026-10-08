import { createFileRoute } from "@tanstack/react-router";
import { JobsPage } from "@/components/jobs/jobs-page";
export const Route = createFileRoute("/_authenticated/jobs")({
  head: () => ({
    meta: [
      { title: "Job Applications - DevCommand" },
      {
        name: "description",
        content: "Manage every opportunity and interview stage in one clear pipeline.",
      },
      { property: "og:title", content: "Job Applications - DevCommand" },
      {
        property: "og:description",
        content: "Manage every opportunity and interview stage in one clear pipeline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    
      <JobsPage />
    
  ),
});
