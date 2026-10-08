import type { ReactNode } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  BookOpen,
  Briefcase,
  CalendarDays,
  Code2,
  FolderKanban,
  ListChecks,
  Plus,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { analyticsQueries } from "@/services/analytics";
import { PriorityFocus, SystemStatus } from "@/components/dashboard/priority-focus";

type Tone = "blue" | "green" | "amber" | "violet" | "red";
const toneBg: Record<Tone, string> = {
  blue: "bg-info/10 text-info",
  green: "bg-success/10 text-success",
  amber: "bg-warning/10 text-warning",
  violet: "bg-primary/10 text-primary",
  red: "bg-danger/10 text-danger",
};
const dot: Record<Tone, string> = {
  blue: "bg-info",
  green: "bg-success",
  amber: "bg-warning",
  violet: "bg-primary",
  red: "bg-danger",
};

const num = (v: number | undefined) =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;
const show = (v: number | undefined) => (num(v) === undefined ? "-" : String(v));
const pct = (a?: number, b?: number) =>
  num(a) !== undefined && num(b) ? Math.round(((a as number) / (b as number)) * 100) : undefined;
const clampPct = (v?: number) =>
  num(v) === undefined ? undefined : Math.max(0, Math.min(100, Math.round(v as number)));

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function SectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-md border border-danger/20 bg-danger/5 p-6 text-center"
    >
      <AlertCircle className="size-5 text-danger" />
      <p className="text-sm text-muted-foreground">Unable to load analytics</p>
      <Button size="sm" variant="outline" className="h-11 min-w-11 sm:h-8" onClick={onRetry}>
        <RotateCw />
        Retry
      </Button>
    </div>
  );
}
type EmptyGuidance = {
  title: string;
  description: string;
  action: string;
  to: "/tasks" | "/dsa" | "/jobs" | "/learning" | "/projects";
  icon: typeof Code2;
};
function SectionEmpty({ title, description, action, to, icon: Icon }: EmptyGuidance) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-3 py-3 [overflow-wrap:anywhere]">
      <span className="grid size-9 place-items-center rounded-md bg-surface-subtle text-muted-foreground" aria-hidden="true"><Icon className="size-4" /></span>
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" className="mt-1 h-auto min-h-11 max-w-full whitespace-normal text-left sm:min-h-9" asChild>
        <Link to={to}><Plus />{action}</Link>
      </Button>
    </div>
  );
}
type SectionLayout = "tasks" | "dsa" | "jobs" | "learning" | "projects";
function SectionSkeleton({ layout, title }: { layout: SectionLayout; title: string }) {
  const summary = layout === "tasks" || layout === "dsa";
  const progress = layout !== "dsa" && layout !== "jobs";
  const count = layout === "tasks" ? 3 : layout === "dsa" ? 6 : layout === "learning" ? 4 : 5;
  return (
    <div className="min-w-0 space-y-4" role="status" aria-label={`Loading ${title}`}>
      <span className="sr-only">Loading {title}</span>
      <div className="space-y-4" aria-hidden="true">
        {summary && <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => <div key={i} className="min-w-0 rounded-md border border-border bg-surface-subtle p-3"><Skeleton className="h-3 w-16 max-w-full" /><Skeleton className="mt-2 h-6 w-12 max-w-full" /></div>)}
        </div>}
        {progress && <div className="space-y-2"><div className="flex items-center justify-between gap-4"><Skeleton className="h-4 w-32 max-w-full" /><Skeleton className="h-3 w-8 shrink-0" /></div><Skeleton className="h-2 w-full" /></div>}
        {layout === "learning" && <div className="rounded-md border border-border bg-surface-subtle p-3"><Skeleton className="h-3 w-20 max-w-full" /><Skeleton className="mt-2 h-6 w-16 max-w-full" /></div>}
        <div className={cn("grid gap-2", layout === "dsa" && "sm:grid-cols-2")}>
          {Array.from({ length: count }, (_, i) => <div key={i} className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-surface-subtle p-3"><Skeleton className="size-2 shrink-0" /><Skeleton className={cn("h-4 min-w-0 max-w-full", i % 2 ? "w-20" : "w-24")} /><Skeleton className="ml-auto h-7 w-8 shrink-0" /></div>)}
        </div>
      </div>
    </div>
  );
}

function Section<T>({
  title,
  subtitle,
  query,
  isEmpty,
  empty,
  layout,
  children,
}: {
  title: string;
  subtitle: string;
  query: UseQueryResult<T>;
  isEmpty: (d: T) => boolean;
  empty: EmptyGuidance;
  layout: SectionLayout;
  children: (d: T) => ReactNode;
}) {
  const phase = query.isPending ? "loading" : query.isError ? "error" : isEmpty(query.data) ? "empty" : "ready";
  return (
    <Card className="min-w-0 [overflow-wrap:anywhere]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent aria-busy={query.isPending}>
        <div key={phase} className="min-w-0 animate-dashboard-section" data-dashboard-state={phase}>
        {query.isPending ? (
          <SectionSkeleton layout={layout} title={title} />
        ) : query.isError ? (
          <SectionError onRetry={() => void query.refetch()} />
        ) : isEmpty(query.data) ? (
          <SectionEmpty {...empty} />
        ) : (
          children(query.data)
        )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value, tone }: { label: string; value: number | undefined; tone: Tone }) {
  return (
    <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_minmax(0,auto)] items-center gap-2 rounded-md border border-border bg-surface-subtle p-3">
      <span className={cn("size-2 shrink-0 rounded-full", dot[tone])} />
      <span className="min-w-0 text-sm text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right font-display text-lg font-semibold">{show(value)}</span>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-surface-subtle p-3 [overflow-wrap:anywhere]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}

export function DashboardContent() {
  const { currentUser } = useAuth();
  const firstName = currentUser?.name.split(" ")[0] ?? "Developer";
  const overview = useQuery(analyticsQueries.overview());
  const dsa = useQuery(analyticsQueries.dsa());
  const tasks = useQuery(analyticsQueries.tasks());
  const jobs = useQuery(analyticsQueries.jobs());
  const learning = useQuery(analyticsQueries.learning());
  const projects = useQuery(analyticsQueries.projects());
  const today = new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const o = overview.data;
  const isNewUser =
    !!o &&
    [
      o.totalDsaProblems,
      o.totalTasks,
      o.totalJobApplications,
      o.totalLearningTopics,
      o.totalProjects,
    ].every((v) => !v);
  const kpis: { label: string; value: string; sub: string; icon: typeof Code2; tone: Tone }[] = o
    ? [
        {
          label: "DSA Solved",
          value: `${show(o.solvedDsaProblems)} / ${show(o.totalDsaProblems)}`,
          sub: "problems",
          icon: Code2,
          tone: "blue",
        },
        {
          label: "Tasks Completed",
          value: `${show(o.completedTasks)} / ${show(o.totalTasks)}`,
          sub: `${show(o.pendingTasks)} pending`,
          icon: ListChecks,
          tone: "green",
        },
        {
          label: "Active Applications",
          value: show(o.activeJobApplications),
          sub: `${show(o.totalJobApplications)} total`,
          icon: Briefcase,
          tone: "amber",
        },
        {
          label: "Learning Completed",
          value: `${show(o.completedLearningTopics)} / ${show(o.totalLearningTopics)}`,
          sub: "topics",
          icon: BookOpen,
          tone: "violet",
        },
        {
          label: "Active Projects",
          value: show(o.activeProjects),
          sub: `${show(o.totalProjects)} total`,
          icon: FolderKanban,
          tone: "blue",
        },
      ]
    : [];

  return (
    <div className="dashboard-arrival min-w-0 space-y-6">
      <header className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
        <div className="min-w-0">
          <h1 className="break-words font-display text-2xl font-semibold text-foreground [overflow-wrap:anywhere] sm:text-[28px]">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            Your development workspace for today.
          </p>
        </div>
        <div className="flex h-9 w-fit shrink-0 items-center gap-2 rounded-md border border-border bg-card px-3 text-xs text-muted-foreground sm:text-sm">
          <CalendarDays className="size-4" />
          {today}
        </div>
      </header>

      <SystemStatus signals={[overview, dsa, tasks, jobs, learning, projects]} />
      <PriorityFocus solvedToday={dsa.data?.solvedToday} dsaError={dsa.isError} dsaPending={dsa.isPending} />

      <div className="grid gap-6 xl:grid-cols-2">
        <Section
          title="Today’s focus"
          subtitle="Tasks due and completed today"
          query={tasks}
          isEmpty={(d) => !d.totalTasks}
          layout="tasks"
          empty={{ title: "Plan your first task", description: "Add a task with a due date to give today a clear starting point.", action: "Open Tasks", to: "/tasks", icon: ListChecks }}
        >
          {(d) => {
            const p = pct(d.completedTasks, d.totalTasks);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Mini label="Due today" value={show(d.tasksDueToday)} />
                  <Mini label="Done today" value={show(d.completedToday)} />
                  <Mini label="Overdue" value={show(d.overdueTasks)} />
                </div>
                {p !== undefined && (
                  <div className="flex items-center gap-4">
                    <Progress value={p} />
                    <span className="shrink-0 text-xs text-muted-foreground">{p}% complete</span>
                  </div>
                )}
                <div className="space-y-2">
                  <StatRow label="To do" value={d.todoTasks} tone="blue" />
                  <StatRow label="In progress" value={d.inProgressTasks} tone="amber" />
                  <StatRow label="Completed" value={d.completedTasks} tone="green" />
                </div>
              </div>
            );
          }}
        </Section>
        <Section
          title="Problem-solving focus"
          subtitle="Recent DSA momentum"
          query={dsa}
          isEmpty={(d) => !d.totalProblems}
          layout="dsa"
          empty={{ title: "Start your problem-solving practice", description: "Add a problem to track solutions, difficulty, and revisions.", action: "Open DSA", to: "/dsa", icon: Code2 }}
        >
          {(d) => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Mini label="Today" value={show(d.solvedToday)} />
                <Mini label="This week" value={show(d.solvedThisWeek)} />
                <Mini label="This month" value={show(d.solvedThisMonth)} />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <StatRow label="Easy" value={d.easyProblems} tone="green" />
                <StatRow label="Medium" value={d.mediumProblems} tone="amber" />
                <StatRow label="Hard" value={d.hardProblems} tone="red" />
                <StatRow label="Solved" value={d.solvedProblems} tone="blue" />
                <StatRow label="Pending" value={d.pendingProblems} tone="violet" />
                <StatRow label="Revision" value={d.revisionProblems} tone="amber" />
              </div>
            </div>
          )}
        </Section>
      </div>

      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        aria-label="Key metrics"
        aria-busy={overview.isPending}
      >
        {overview.isPending ? (
          Array.from({ length: 5 }, (_, i) => (
            <Card key={i}>
              <CardContent className="min-w-0 p-5">
                {i === 0 && <span className="sr-only" role="status">Loading key metrics</span>}
                <div aria-hidden="true"><Skeleton className="size-9" /><Skeleton className="mt-4 h-4 w-24 max-w-full" /><div className="mt-1 flex flex-wrap items-end justify-between gap-3"><Skeleton className="h-7 w-20 max-w-full" /><Skeleton className="h-3 w-12 max-w-full" /></div></div>
              </CardContent>
            </Card>
          ))
        ) : overview.isError ? (
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5">
            <SectionError onRetry={() => void overview.refetch()} />
          </div>
        ) : (
          kpis.map((k) => (
            <Card key={k.label} className="animate-dashboard-section transition-colors hover:border-foreground/15">
              <CardContent className="p-5">
                <span className={cn("grid size-9 place-items-center rounded-md", toneBg[k.tone])}>
                  <k.icon className="size-4" />
                </span>
                <p className="mt-4 text-xs font-medium text-muted-foreground">{k.label}</p>
                <div className="mt-1 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                  <p className="min-w-0 break-words font-display text-xl font-semibold [overflow-wrap:anywhere]">{k.value}</p>
                  <p className="min-w-0 break-words pb-0.5 text-xs text-muted-foreground">{k.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {isNewUser && (
        <Card className="border-primary/20">
          <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display font-semibold">No activity yet</p>
              <p className="text-sm text-muted-foreground">
                Start by adding your first task or DSA problem using the quick actions below.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Section
          title="Job Applications"
          subtitle="Current pipeline snapshot"
          query={jobs}
          isEmpty={(d) => !d.totalApplications}
          layout="jobs"
          empty={{ title: "Begin your application pipeline", description: "Save a role or add an application to follow its progress through interviews and offers.", action: "Open Jobs", to: "/jobs", icon: Briefcase }}
        >
          {(d) => (
            <div className="space-y-2">
              <StatRow label="Applied" value={d.applied} tone="blue" />
              <StatRow label="Screening" value={d.screening} tone="violet" />
              <StatRow label="Interview" value={d.interview} tone="amber" />
              <StatRow label="Offer" value={d.offer} tone="green" />
              <StatRow label="Rejected" value={d.rejected} tone="red" />
            </div>
          )}
        </Section>
        <Section
          title="Learning Progress"
          subtitle="Topics and time invested"
          query={learning}
          isEmpty={(d) => !d.totalTopics}
          layout="learning"
          empty={{ title: "Choose your next learning topic", description: "Add a technology and topic to track your progress and time invested.", action: "Open Learning", to: "/learning", icon: BookOpen }}
        >
          {(d) => {
            const avg = clampPct(d.averageProgress);
            return (
              <div className="space-y-4">
                {avg !== undefined && (
                  <div>
                    <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-sm">
                      <span className="font-medium">Average progress</span>
                      <span className="font-mono text-xs text-muted-foreground">{avg}%</span>
                    </div>
                    <Progress value={avg} />
                  </div>
                )}
                <Mini
                  label="Hours spent"
                  value={num(d.totalHoursSpent) === undefined ? "-" : `${d.totalHoursSpent}h`}
                />
                <div className="space-y-2">
                  <StatRow label="Not started" value={d.notStarted} tone="blue" />
                  <StatRow label="In progress" value={d.inProgress} tone="amber" />
                  <StatRow label="Completed" value={d.completed} tone="green" />
                  <StatRow label="On hold" value={d.onHold} tone="red" />
                </div>
              </div>
            );
          }}
        </Section>
        <Section
          title="Projects"
          subtitle="What you’re building"
          query={projects}
          isEmpty={(d) => !d.totalProjects}
          layout="projects"
          empty={{ title: "Give your next project a home", description: "Add a project, then break the work into tasks you can move forward.", action: "Open Projects", to: "/projects", icon: FolderKanban }}
        >
          {(d) => {
            const rate =
              clampPct(d.projectTaskCompletionRate) ??
              pct(d.completedProjectTasks, d.totalProjectTasks);
            return (
              <div className="space-y-4">
                {rate !== undefined && (
                  <div>
                    <div className="mb-2 grid grid-cols-1 gap-1 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,auto)] sm:items-center sm:gap-2">
                      <span className="font-medium">Project tasks done</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {show(d.completedProjectTasks)}/{show(d.totalProjectTasks)} · {rate}%
                      </span>
                    </div>
                    <Progress value={rate} />
                  </div>
                )}
                <div className="space-y-2">
                  <StatRow label="Planning" value={d.planning} tone="blue" />
                  <StatRow label="In progress" value={d.inProgress} tone="amber" />
                  <StatRow label="Completed" value={d.completed} tone="green" />
                  <StatRow label="On hold" value={d.onHold} tone="red" />
                  <StatRow label="Archived" value={d.archived} tone="violet" />
                </div>
              </div>
            );
          }}
        </Section>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <p className="text-sm text-muted-foreground">Open a workspace and add your next item.</p>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {(
            [
              { label: "DSA problem", to: "/dsa" },
              { label: "Job application", to: "/jobs" },
              { label: "Learning topic", to: "/learning" },
              { label: "Task", to: "/tasks" },
              { label: "Project", to: "/projects" },
            ] as const
          ).map((item) => (
            <Button key={item.to} variant="outline" className="h-auto min-h-11 min-w-0 justify-start whitespace-normal text-left sm:min-h-9" asChild>
              <Link to={item.to}>
                <Plus />
                {item.label}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
