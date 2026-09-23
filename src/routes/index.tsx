import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => { throw redirect({ to: "/dashboard" }); },
  head: () => ({ meta: [
    { title: "DevCommand — Personal Developer Command Center" },
    { name: "description", content: "Manage your developer journey from one focused workspace." },
    { property: "og:title", content: "DevCommand — Personal Developer Command Center" },
    { property: "og:description", content: "Manage your developer journey from one focused workspace." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => null,
});
