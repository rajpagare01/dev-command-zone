import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "./page-header";

export function ComingSoonPage({
  title,
  description,
  icon: Icon,
  features,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}) {
  return (
    <div className="space-y-8 animate-page-in">
      <PageHeader title={title} description={description} />
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid min-h-[440px] lg:grid-cols-[1.1fr_.9fr]">
            <div className="flex flex-col justify-center p-7 sm:p-12">
              <span className="mb-7 grid size-14 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Icon className="size-7" />
              </span>
              <Badge
                variant="outline"
                className="mb-4 w-fit border-primary/25 bg-primary/5 text-primary"
              >
                Coming next
              </Badge>
              <h2 className="max-w-xl font-display text-2xl font-semibold text-foreground sm:text-3xl">
                A focused workspace for {title.toLowerCase()}.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
                The foundation is ready for your Spring Boot API. No placeholder actions or
                fabricated results are connected.
              </p>
            </div>
            <div className="border-t border-border bg-surface-subtle p-7 sm:p-10 lg:border-l lg:border-t-0">
              <p className="mb-6 text-xs font-semibold uppercase text-muted-foreground">
                Planned workspace
              </p>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm text-secondary-foreground"
                  >
                    <span className="grid size-6 place-items-center rounded bg-success/10 text-success">
                      <Check className="size-3.5" />
                    </span>
                    {feature}
                    <ArrowRight className="ml-auto size-4 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
