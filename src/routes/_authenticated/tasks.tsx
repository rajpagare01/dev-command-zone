import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare2 } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ComingSoonPage } from "@/components/common/coming-soon";
export const Route = createFileRoute("/tasks")({ head: () => ({ meta: [{ title: "Tasks — DevCommand" }, { name: "description", content: "Plan today, organize what is next, and close the loop on completed work." }, { property: "og:title", content: "Tasks — DevCommand" }, { property: "og:description", content: "Plan today, organize what is next, and close the loop on completed work." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: () => <PageShell><ComingSoonPage title="Tasks" description="Plan today, organize what is next, and close the loop on completed work." icon={CheckSquare2} features={["Today", "Upcoming", "Completed", "Priority levels", "Categories"]} /></PageShell> });
