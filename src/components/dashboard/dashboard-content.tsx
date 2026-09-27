import type { ReactNode } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertCircle, BookOpen, Briefcase, CalendarDays, Code2, FolderKanban, ListChecks, Plus, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { analyticsQueries } from "@/services/analytics";

type Tone = "blue" | "green" | "amber" | "violet" | "red";
const toneBg: Record<Tone, string> = { blue: "bg-info/10 text-info", green: "bg-success/10 text-success", amber: "bg-warning/10 text-warning", violet: "bg-primary/10 text-primary", red: "bg-danger/10 text-danger" };
const dot: Record<Tone, string> = { blue: "bg-info", green: "bg-success", amber: "bg-warning", violet: "bg-primary", red: "bg-danger" };

const num = (v: number | undefined) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const show = (v: number | undefined) => (num(v) === undefined ? "—" : String(v));
const pct = (a?: number, b?: number) => (num(a) !== undefined && num(b) ? Math.round(((a as number) / (b as number)) * 100) : undefined);
const clampPct = (v?: number) => (num(v) === undefined ? undefined : Math.max(0, Math.min(100, Math.round(v as number))));

function greeting() { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; }

function SectionError({ onRetry }: { onRetry: () => void }) {
  return <div role="alert" className="flex flex-col items-center gap-3 rounded-md border border-danger/20 bg-danger/5 p-6 text-center"><AlertCircle className="size-5 text-danger" /><p className="text-sm text-muted-foreground">Unable to load analytics</p><Button size="sm" variant="outline" onClick={onRetry}><RotateCw />Retry</Button></div>;
}
function SectionEmpty({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{text}</div>;
}
function Rows({ n = 4 }: { n?: number }) { return <div className="space-y-3" aria-busy="true" aria-label="Loading">{Array.from({ length: n }, (_, i) => <Skeleton key={i} className="h-11 w-full" />)}</div>; }

function Section<T>({ title, subtitle, query, isEmpty, empty, children }: { title: string; subtitle: string; query: UseQueryResult<T>; isEmpty: (d: T) => boolean; empty: string; children: (d: T) => ReactNode }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle><p className="text-sm text-muted-foreground">{subtitle}</p></CardHeader><CardContent>
    {query.isPending ? <Rows /> : query.isError ? <SectionError onRetry={() => void query.refetch()} /> : isEmpty(query.data) ? <SectionEmpty text={empty} /> : children(query.data)}
  </CardContent></Card>;
}

function StatRow({ label, value, tone }: { label: string; value: number | undefined; tone: Tone }) {
  return <div className="flex items-center rounded-md border border-border bg-surface-subtle p-3"><span className={cn("mr-3 size-2 rounded-full", dot[tone])} /><span className="flex-1 text-sm text-muted-foreground">{label}</span><span className="font-display text-lg font-semibold">{show(value)}</span></div>;
}
function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-border bg-surface-subtle p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-display text-xl font-semibold">{value}</p></div>;
}

export function DashboardContent() {
  const { currentUser } = useAuth(); const firstName = currentUser?.name.split(" ")[0] ?? "Developer";
  const overview = useQuery(analyticsQueries.overview());
  const dsa = useQuery(analyticsQueries.dsa());
  const tasks = useQuery(analyticsQueries.tasks());
  const jobs = useQuery(analyticsQueries.jobs());
  const learning = useQuery(analyticsQueries.learning());
  const projects = useQuery(analyticsQueries.projects());
  const today = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  const o = overview.data;
  const isNewUser = !!o && [o.totalDsaProblems, o.totalTasks, o.totalJobApplications, o.totalLearningTopics, o.totalProjects].every((v) => !v);
  const kpis: { label: string; value: string; sub: string; icon: typeof Code2; tone: Tone }[] = o ? [
    { label: "DSA Solved", value: `${show(o.solvedDsaProblems)} / ${show(o.totalDsaProblems)}`, sub: "problems", icon: Code2, tone: "blue" },
    { label: "Tasks Completed", value: `${show(o.completedTasks)} / ${show(o.totalTasks)}`, sub: `${show(o.pendingTasks)} pending`, icon: ListChecks, tone: "green" },
    { label: "Active Applications", value: show(o.activeJobApplications), sub: `${show(o.totalJobApplications)} total`, icon: Briefcase, tone: "amber" },
    { label: "Learning Completed", value: `${show(o.completedLearningTopics)} / ${show(o.totalLearningTopics)}`, sub: "topics", icon: BookOpen, tone: "violet" },
    { label: "Active Projects", value: show(o.activeProjects), sub: `${show(o.totalProjects)} total`, icon: FolderKanban, tone: "blue" },
  ] : [];

  return <div className="space-y-6 animate-page-in">
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"><div className="min-w-0"><h1 className="truncate font-display text-2xl font-semibold text-foreground sm:text-[28px]">{greeting()}, {firstName}</h1><p className="mt-1.5 text-sm leading-6 text-muted-foreground">Your development workspace for today.</p></div><div className="flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-card px-3 text-xs text-muted-foreground sm:text-sm"><CalendarDays className="size-4" />{today}</div></header>

    <div className="grid gap-6 xl:grid-cols-2">
      <Section title="Today’s focus" subtitle="Tasks due and completed today" query={tasks} isEmpty={(d) => !d.totalTasks} empty="No tasks yet. Add your first task to plan your day.">{(d) => { const p = pct(d.completedTasks, d.totalTasks); return <div className="space-y-4"><div className="grid grid-cols-3 gap-3"><Mini label="Due today" value={show(d.tasksDueToday)} /><Mini label="Done today" value={show(d.completedToday)} /><Mini label="Overdue" value={show(d.overdueTasks)} /></div>{p !== undefined && <div className="flex items-center gap-4"><Progress value={p} /><span className="shrink-0 text-xs text-muted-foreground">{p}% complete</span></div>}<div className="space-y-2"><StatRow label="To do" value={d.todoTasks} tone="blue" /><StatRow label="In progress" value={d.inProgressTasks} tone="amber" /><StatRow label="Completed" value={d.completedTasks} tone="green" /></div></div>; }}</Section>
      <Section title="Problem-solving focus" subtitle="Recent DSA momentum" query={dsa} isEmpty={(d) => !d.totalProblems} empty="No DSA problems yet. Add your first problem to start tracking.">{(d) => <div className="space-y-4"><div className="grid grid-cols-3 gap-3"><Mini label="Today" value={show(d.solvedToday)} /><Mini label="This week" value={show(d.solvedThisWeek)} /><Mini label="This month" value={show(d.solvedThisMonth)} /></div><div className="grid grid-cols-2 gap-2"><StatRow label="Easy" value={d.easyProblems} tone="green" /><StatRow label="Medium" value={d.mediumProblems} tone="amber" /><StatRow label="Hard" value={d.hardProblems} tone="red" /><StatRow label="Solved" value={d.solvedProblems} tone="blue" /><StatRow label="Pending" value={d.pendingProblems} tone="violet" /><StatRow label="Revision" value={d.revisionProblems} tone="amber" /></div></div>}</Section>
    </div>

    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" aria-label="Key metrics">
      {overview.isPending ? Array.from({ length: 5 }, (_, i) => <Card key={i}><CardContent className="space-y-4 p-5" aria-busy="true"><Skeleton className="size-10" /><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-20" /></CardContent></Card>)
        : overview.isError ? <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5"><SectionError onRetry={() => void overview.refetch()} /></div>
        : kpis.map((k) => <Card key={k.label} className="transition-colors hover:border-foreground/15"><CardContent className="p-5"><span className={cn("grid size-9 place-items-center rounded-md", toneBg[k.tone])}><k.icon className="size-4" /></span><p className="mt-4 text-xs font-medium text-muted-foreground">{k.label}</p><div className="mt-1 flex items-end justify-between gap-3"><p className="font-display text-xl font-semibold">{k.value}</p><p className="pb-0.5 text-xs text-muted-foreground">{k.sub}</p></div></CardContent></Card>)}
    </section>

    {isNewUser && <Card className="border-primary/20"><CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-display font-semibold">No activity yet</p><p className="text-sm text-muted-foreground">Start by adding your first task or DSA problem using the quick actions below.</p></div></CardContent></Card>}

    <div className="grid gap-6 lg:grid-cols-3">
      <Section title="Job Applications" subtitle="Current pipeline snapshot" query={jobs} isEmpty={(d) => !d.totalApplications} empty="No applications yet.">{(d) => <div className="space-y-2"><StatRow label="Applied" value={d.applied} tone="blue" /><StatRow label="Screening" value={d.screening} tone="violet" /><StatRow label="Interview" value={d.interview} tone="amber" /><StatRow label="Offer" value={d.offer} tone="green" /><StatRow label="Rejected" value={d.rejected} tone="red" /></div>}</Section>
      <Section title="Learning Progress" subtitle="Topics and time invested" query={learning} isEmpty={(d) => !d.totalTopics} empty="No learning topics yet.">{(d) => { const avg = clampPct(d.averageProgress); return <div className="space-y-4">{avg !== undefined && <div><div className="mb-2 flex justify-between text-sm"><span className="font-medium">Average progress</span><span className="font-mono text-xs text-muted-foreground">{avg}%</span></div><Progress value={avg} /></div>}<Mini label="Hours spent" value={num(d.totalHoursSpent) === undefined ? "—" : `${d.totalHoursSpent}h`} /><div className="space-y-2"><StatRow label="Not started" value={d.notStarted} tone="blue" /><StatRow label="In progress" value={d.inProgress} tone="amber" /><StatRow label="Completed" value={d.completed} tone="green" /><StatRow label="On hold" value={d.onHold} tone="red" /></div></div>; }}</Section>
      <Section title="Projects" subtitle="What you’re building" query={projects} isEmpty={(d) => !d.totalProjects} empty="No projects yet.">{(d) => { const rate = clampPct(d.projectTaskCompletionRate) ?? pct(d.completedProjectTasks, d.totalProjectTasks); return <div className="space-y-4">{rate !== undefined && <div><div className="mb-2 flex justify-between text-sm"><span className="font-medium">Project tasks done</span><span className="font-mono text-xs text-muted-foreground">{show(d.completedProjectTasks)}/{show(d.totalProjectTasks)} · {rate}%</span></div><Progress value={rate} /></div>}<div className="space-y-2"><StatRow label="Planning" value={d.planning} tone="blue" /><StatRow label="In progress" value={d.inProgress} tone="amber" /><StatRow label="Completed" value={d.completed} tone="green" /><StatRow label="On hold" value={d.onHold} tone="red" /><StatRow label="Archived" value={d.archived} tone="violet" /></div></div>; }}</Section>
    </div>

    <Card><CardHeader><CardTitle>Quick actions</CardTitle><p className="text-sm text-muted-foreground">Open a workspace and add your next item.</p></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{([{ label: "DSA problem", to: "/dsa" }, { label: "Job application", to: "/jobs" }, { label: "Learning topic", to: "/learning" }, { label: "Task", to: "/tasks" }, { label: "Project", to: "/projects" }] as const).map((item) => <Button key={item.to} variant="outline" className="justify-start" asChild><Link to={item.to}><Plus />{item.label}</Link></Button>)}</CardContent></Card>
  </div>;
}
