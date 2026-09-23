import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";
export const Route = createFileRoute("/register")({ head: () => ({ meta: [{ title: "Create Account — DevCommand" }, { name: "description", content: "Create your DevCommand developer workspace." }, { property: "og:title", content: "Create Account — DevCommand" }, { property: "og:description", content: "Create your DevCommand developer workspace." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: () => <AuthLayout><RegisterForm /></AuthLayout> });
