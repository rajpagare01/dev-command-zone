import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
export const Route = createFileRoute("/login")({ head: () => ({ meta: [{ title: "Login — DevCommand" }, { name: "description", content: "Sign in to your DevCommand developer workspace." }, { property: "og:title", content: "Login — DevCommand" }, { property: "og:description", content: "Sign in to your DevCommand developer workspace." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: () => <AuthLayout><LoginForm /></AuthLayout> });
