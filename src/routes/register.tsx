import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";
import { authStorage } from "@/services/auth-storage";
export const Route = createFileRoute("/register")({
  ssr: false,
  beforeLoad: () => {
    if (authStorage.getToken()) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Create Account - DevCommand" },
      { name: "description", content: "Create your DevCommand developer workspace." },
      { property: "og:title", content: "Create Account - DevCommand" },
      { property: "og:description", content: "Create your DevCommand developer workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  ),
});
