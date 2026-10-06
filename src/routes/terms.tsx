import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions - DevCommand" },
      { name: "description", content: "Terms and Conditions for DevCommand." },
      { property: "og:title", content: "Terms and Conditions - DevCommand" },
      { property: "og:description", content: "Terms and Conditions for DevCommand." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">
          Terms and Conditions
        </h1>
        <div className="prose prose-invert max-w-none text-muted-foreground">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          <p className="mb-4">
            Please read these Terms and Conditions carefully before using the DevCommand service.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="mb-4">
            By accessing or using our service, you agree to be bound by these Terms. If you disagree
            with any part of the terms, you may not access the service.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Use of Service</h2>
          <p className="mb-4">
            You are responsible for your use of the service and for any content you provide,
            including compliance with applicable laws, rules, and regulations.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. User Accounts</h2>
          <p className="mb-4">
            When you create an account with us, you must provide accurate and complete information.
            You are responsible for safeguarding the password that you use to access the service.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account immediately, without prior notice or liability,
            for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </div>
      </div>
    </PageShell>
  ),
});
