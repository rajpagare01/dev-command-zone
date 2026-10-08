import { createFileRoute } from "@tanstack/react-router";
import { LearningPage } from "@/components/learning/learning-page";
export const Route = createFileRoute("/_authenticated/learning")({
  head: () => ({
    meta: [
      { title: "Learning - DevCommand" },
      {
        name: "description",
        content: "Turn technologies and topics into visible, consistent progress.",
      },
      { property: "og:title", content: "Learning - DevCommand" },
      {
        property: "og:description",
        content: "Turn technologies and topics into visible, consistent progress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    
      <LearningPage />
    
  ),
});
