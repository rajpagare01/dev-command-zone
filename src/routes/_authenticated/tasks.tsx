import { createFileRoute } from "@tanstack/react-router";
import { TasksPage } from "@/components/tasks/tasks-page";
export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks - DevCommand" },
      {
        name: "description",
        content: "Plan today, organize what is next, and close the loop on completed work.",
      },
      { property: "og:title", content: "Tasks - DevCommand" },
      {
        property: "og:description",
        content: "Plan today, organize what is next, and close the loop on completed work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    
      <TasksPage />
    
  ),
});
