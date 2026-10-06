import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  AlertCircle,
  BookOpen,
  Briefcase,
  Code2,
  FolderKanban,
  ListChecks,
  RotateCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { analyticsPageQuery } from "@/services/analytics";
import type { AnalyticsPageData } from "@/services/analytics";

type Tone = "blue" | "green" | "amber" | "violet" | "red" | "muted";
const toneBg: Record<Tone, string> = {
  blue: "bg-info/10 text-info",
  green: "bg-success/10 text-success",
  amber: "bg-warning/10 text-warning",
  violet: "bg-primary/10 text-primary",
  red: "bg-danger/10 text-danger",
  muted: "bg-muted text-muted-foreground",
};
const dot: Record<Tone, string> = {
  blue: "bg-info",
  green: "bg-success",
  amber: "bg-warning",
  violet: "bg-primary",
  red: "bg-danger",
  muted: "bg-muted-foreground",
};
const toneVar: Record<Tone, string> = {
  blue: "var(--info)",
  green: "var(--success)",
  amber: "var(--warning)",
  violet: "var(--primary)",
  red: "var(--danger)",
  muted: "var(--muted-foreground)",
};

const axisTick = { fill: "var(--muted-foreground)", fontSize: 11 };
const clampPct = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

function StatRow({ label, value, tone }: { label: string; value: number; tone: Tone }) {
  return (
    <div className="flex items-center rounded-md border border-border bg-surface-subtle p-2.5">
      <span className={cn("mr-3 size-2 rounded-full", dot[tone])} />
      <span className="flex-1 text-sm text-muted-foreground">{label}</span>
      <span className="font-display text-lg font-semibold">{value}</span>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-subtle p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function ChartTip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label !== undefined && label !== "" && (
        <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2 text-popover-foreground">
          <span
            className="size-2 rounded-full"
            style={{ background: entry.color ?? entry.payload?.fill }}
          />
          {entry.name}: <span className="font-mono">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  tone,
  children,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <span className={cn("grid size-8 place-items-center rounded-md", toneBg[tone])}>
            <Icon className="size-4" />
          </span>
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function KpiCard({
  title,
  icon: Icon,
  tone,
  rows,
}: {
  title: string;
  icon: LucideIcon;
  tone: Tone;
  rows: { label: string; value: number }[];
}) {
  return (
    <Card className="transition-colors hover:border-foreground/15">
      <CardContent className="p-5">
        <div className="flex items-center gap-2.5">
          <span className={cn("grid size-9 place-items-center rounded-md", toneBg[tone])}>
            <Icon className="size-4.5" />
          </span>
          <p className="font-display font-semibold">{title}</p>
        </div>
        <div className="mt-4 space-y-2">
          {rows.map((r) => (
            <StatRow key={r.label} {...r} tone={tone} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6 animate-page-in" aria-busy="true" aria-label="Loading analytics">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-5" aria-hidden="true">
              <Skeleton className="size-9" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-96 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
      <Skeleton className="h-80 w-full rounded-lg" />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-md border border-danger/20 bg-danger/5 p-10 text-center animate-page-in"
    >
      <AlertCircle className="size-6 text-danger" />
      <p className="font-display font-semibold">Unable to load analytics</p>
      <p className="text-sm text-muted-foreground">
        Something went wrong while fetching your analytics. Please try again.
      </p>
      <Button variant="outline" onClick={onRetry}>
        <RotateCw />
        Retry
      </Button>
    </div>
  );
}

export function AnalyticsPage() {
  const query = useQuery(analyticsPageQuery());

  if (query.isPending) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;

  const { overview: o, dsa, tasks, jobs, learning, projects } = query.data;

  const kpis: {
    title: string;
    icon: LucideIcon;
    tone: Tone;
    rows: { label: string; value: number }[];
  }[] = [
    {
      title: "DSA",
      icon: Code2,
      tone: "blue",
      rows: [
        { label: "Total problems", value: dsa.totalProblems },
        { label: "Solved problems", value: dsa.solvedProblems },
        { label: "Pending problems", value: dsa.pendingProblems },
      ],
    },
    {
      title: "Tasks",
      icon: ListChecks,
      tone: "green",
      rows: [
        { label: "Total tasks", value: o.totalTasks },
        { label: "Completed tasks", value: o.completedTasks },
        { label: "Pending tasks", value: o.pendingTasks },
      ],
    },
    {
      title: "Jobs",
      icon: Briefcase,
      tone: "amber",
      rows: [
        { label: "Applications", value: o.totalJobApplications },
        { label: "Active applications", value: o.activeJobApplications },
      ],
    },
    {
      title: "Learning",
      icon: BookOpen,
      tone: "violet",
      rows: [
        { label: "Topics", value: o.totalLearningTopics },
        { label: "Completed topics", value: o.completedLearningTopics },
      ],
    },
    {
      title: "Projects",
      icon: FolderKanban,
      tone: "blue",
      rows: [
        { label: "Projects", value: o.totalProjects },
        { label: "Active projects", value: o.activeProjects },
        { label: "Completed projects", value: o.completedProjects },
      ],
    },
    {
      title: "Project Tasks",
      icon: ListChecks,
      tone: "green",
      rows: [
        { label: "Total tasks", value: o.totalProjectTasks },
        { label: "Completed tasks", value: o.completedProjectTasks },
      ],
    },
  ];

  const difficultyData = [
    { name: "Easy", problems: dsa.easyProblems, fill: toneVar.green },
    { name: "Medium", problems: dsa.mediumProblems, fill: toneVar.amber },
    { name: "Hard", problems: dsa.hardProblems, fill: toneVar.red },
  ];
  const taskStatusData = [
    { name: "To do", value: tasks.todoTasks, fill: toneVar.blue },
    { name: "In progress", value: tasks.inProgressTasks, fill: toneVar.amber },
    { name: "Completed", value: tasks.completedTasks, fill: toneVar.green },
  ];
  const pipelineData = [
    { name: "Saved", value: jobs.saved, fill: toneVar.muted },
    { name: "Applied", value: jobs.applied, fill: toneVar.blue },
    { name: "Screening", value: jobs.screening, fill: toneVar.violet },
    { name: "Interview", value: jobs.interview, fill: toneVar.amber },
    { name: "Offer", value: jobs.offer, fill: toneVar.green },
    { name: "Rejected", value: jobs.rejected, fill: toneVar.red },
    { name: "Withdrawn", value: jobs.withdrawn, fill: toneVar.muted },
  ];
  const techData = learning.technologyBreakdown.map((t) => ({
    name: t.technology,
    topics: t.topicCount,
    completed: t.completedCount,
  }));
  const projectRate = clampPct(projects.projectTaskCompletionRate);
  const learningProgress = clampPct(learning.averageProgress);

  return (
    <div className="space-y-6 animate-page-in">
      <PageHeader
        title="Analytics"
        description="Track your overall development progress and activity."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            <RotateCw className={cn("size-4", query.isFetching && "animate-spin")} />
            {query.isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Overview">
        {kpis.map((k) => (
          <KpiCard key={k.title} {...k} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="DSA"
          subtitle="Problem difficulty and momentum"
          icon={Code2}
          tone="blue"
        >
          {dsa.totalProblems === 0 ? (
            <Empty text="No DSA problems yet. Add your first problem to see the breakdown." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={difficultyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis
                    allowDecimals={false}
                    width={32}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "var(--surface-subtle)" }} />
                  <Bar dataKey="problems" name="Problems" barSize={44} radius={[4, 4, 0, 0]}>
                    {difficultyData.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-3">
                <Mini label="Solved today" value={String(dsa.solvedToday)} />
                <Mini label="This week" value={String(dsa.solvedThisWeek)} />
                <Mini label="This month" value={String(dsa.solvedThisMonth)} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <StatRow label="Solved" value={dsa.solvedProblems} tone="blue" />
                <StatRow label="Pending" value={dsa.pendingProblems} tone="violet" />
                <StatRow label="Revision" value={dsa.revisionProblems} tone="amber" />
                <StatRow label="Mastered" value={dsa.masteredProblems} tone="green" />
              </div>
            </>
          )}
        </SectionCard>

        <SectionCard
          title="Tasks"
          subtitle="Status and daily workload"
          icon={ListChecks}
          tone="green"
        >
          {tasks.totalTasks === 0 ? (
            <Empty text="No tasks yet. Add your first task to see the breakdown." />
          ) : (
            <div className="grid items-center gap-6 sm:grid-cols-[220px_1fr]">
              <div className="relative mx-auto w-full max-w-[220px]">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {taskStatusData.map((s) => (
                        <Cell key={s.name} fill={s.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <p className="font-display text-2xl font-semibold">{tasks.totalTasks}</p>
                    <p className="text-xs text-muted-foreground">total tasks</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <StatRow label="Due today" value={tasks.tasksDueToday} tone="amber" />
                <StatRow label="Overdue" value={tasks.overdueTasks} tone="red" />
                <StatRow label="Completed today" value={tasks.completedToday} tone="green" />
                <StatRow label="To do" value={tasks.todoTasks} tone="blue" />
                <StatRow label="In progress" value={tasks.inProgressTasks} tone="amber" />
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Job pipeline"
          subtitle="Applications by stage"
          icon={Briefcase}
          tone="amber"
        >
          {jobs.totalApplications === 0 ? (
            <Empty text="No applications yet. Add your first application to see the pipeline." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={pipelineData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={86}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "var(--surface-subtle)" }} />
                  <Bar dataKey="value" name="Applications" barSize={14} radius={[0, 4, 4, 0]}>
                    {pipelineData.map((s) => (
                      <Cell key={s.name} fill={s.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="grid gap-2 sm:grid-cols-3">
                <StatRow label="Interview rounds" value={jobs.interviewRounds} tone="blue" />
                <StatRow label="Upcoming interviews" value={jobs.upcomingInterviews} tone="amber" />
                <StatRow
                  label="Completed interviews"
                  value={jobs.completedInterviews}
                  tone="green"
                />
              </div>
            </>
          )}
        </SectionCard>

        <SectionCard title="Learning" subtitle="Topics by technology" icon={BookOpen} tone="violet">
          {learning.totalTopics === 0 ? (
            <Empty text="No learning topics yet. Add your first topic to see progress." />
          ) : (
            <>
              {techData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(160, techData.length * 48)}>
                  <BarChart
                    data={techData}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={axisTick}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={axisTick}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "var(--surface-subtle)" }} />
                    <Bar
                      dataKey="topics"
                      name="Topics"
                      fill="var(--primary)"
                      barSize={10}
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="completed"
                      name="Completed"
                      fill="var(--success)"
                      barSize={10}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty text="No technology breakdown available yet." />
              )}
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">Average progress</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {learningProgress}%
                  </span>
                </div>
                <Progress value={learningProgress} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <StatRow label="Not started" value={learning.notStarted} tone="blue" />
                <StatRow label="In progress" value={learning.inProgress} tone="amber" />
                <StatRow label="Completed" value={learning.completed} tone="green" />
                <StatRow label="On hold" value={learning.onHold} tone="red" />
                <StatRow label="Hours spent" value={learning.totalHoursSpent} tone="violet" />
              </div>
            </>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Projects"
        subtitle="Delivery status and task completion"
        icon={FolderKanban}
        tone="blue"
      >
        {projects.totalProjects === 0 ? (
          <Empty text="No projects yet. Add your first project to see delivery stats." />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <StatRow label="Planning" value={projects.planning} tone="blue" />
              <StatRow label="In progress" value={projects.inProgress} tone="amber" />
              <StatRow label="Completed" value={projects.completed} tone="green" />
              <StatRow label="On hold" value={projects.onHold} tone="red" />
              <StatRow label="Archived" value={projects.archived} tone="violet" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">Project tasks completed</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {projects.completedProjectTasks}/{projects.totalProjectTasks} · {projectRate}%
                  </span>
                </div>
                <Progress value={projectRate} />
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <StatRow label="To do" value={projects.todoProjectTasks} tone="blue" />
                <StatRow label="In progress" value={projects.inProgressProjectTasks} tone="amber" />
                <StatRow label="Completed" value={projects.completedProjectTasks} tone="green" />
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
