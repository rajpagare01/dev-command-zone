import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/page-shell";
import { ProjectsPage } from "@/components/projects/projects-page";
export const Route = createFileRoute("/_authenticated/projects")({ head: () => ({ meta: [{ title: "Projects — DevCommand" }, { name: "description", content: "Keep active builds, links, and delivery progress together." }, { property: "og:title", content: "Projects — DevCommand" }, { property: "og:description", content: "Keep active builds, links, and delivery progress together." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: () => <PageShell><ProjectsPage /></PageShell> });
