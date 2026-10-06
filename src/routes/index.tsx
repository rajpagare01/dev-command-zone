import { createFileRoute, redirect } from "@tanstack/react-router";
import { authStorage } from "@/services/auth-storage";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: authStorage.getToken() ? "/dashboard" : "/login" });
  },
  head: () => ({
    meta: [
      { title: "DevCommand - Personal Developer Command Center" },
      { name: "description", content: "Manage your developer journey from one focused workspace." },
      { property: "og:title", content: "DevCommand - Personal Developer Command Center" },
      {
        property: "og:description",
        content: "Manage your developer journey from one focused workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => null,
});
