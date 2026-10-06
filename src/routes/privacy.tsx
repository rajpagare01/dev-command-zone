import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - DevCommand" },
      { name: "description", content: "Privacy Policy for DevCommand." },
    ],
  }),
  component: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none text-muted-foreground">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          <p className="mb-4">
            At DevCommand, we take your privacy seriously. This Privacy Policy explains how we
            collect, use, and protect your personal information.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            1. Information We Collect
          </h2>
          <p className="mb-4">
            We collect information you provide directly to us, such as when you create an account,
            update your profile, or use our services.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            2. How We Use Your Information
          </h2>
          <p className="mb-4">
            We use the information we collect to provide, maintain, and improve our services, as
            well as to communicate with you.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect the security
            of your personal information.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at
            support@devcommand.com.
          </p>
        </div>
      </div>
    </PageShell>
  ),
});
