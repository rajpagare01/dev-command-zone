import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowDownWideNarrow, ArrowUpNarrowWide, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Gauge, GraduationCap, MoreHorizontal, Pencil, Plus, RotateCw, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { completeLearningTopic, createLearningTopic, deleteLearningTopic, learningQueries, updateLearningProgress, updateLearningTopic, type LearningView } from "@/services/learning";
import { LEARNING_SORT_FIELDS, LEARNING_STATUSES, type LearningSortField, type LearningStatus, type LearningTopic, type LearningTopicRequest } from "@/types/learning";
import { LearningFormDialog } from "./learning-form-dialog";
import { ProgressDialog } from "./progress-dialog";
import { sortLabel, statusLabel, statusTone } from "./learning-labels";

const PAGE_SIZE = 10;
const ALL = "all";
type Tab = "all" | LearningView;
const TABS: { id: Tab; label: string }[] = [{ id: "all", label: "All" }, { id: "in-progress", label: "In progress" }, { id: "completed", label: "Completed" }];

function useDebounced<T>(value: T, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}
const Pill = ({ className, children }: { className: string; children: string }) => <span className={cn("inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium", className)}>{children}</span>;
const errMsg = (e: unknown) => (e instanceof ApiError ? (e.status === 404 ? "Topic not found. It may have been deleted." : e.message) : "Something went wrong. Please try again.");
const hours = (h: number | null) => (h == null ? "—" : `${h}h`);

export function LearningPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("all");
  const [searchInput, setSearchInput] = useState("");
  const [techInput, setTechInput] = useState("");
  const [progressInput, setProgressInput] = useState("");
  const [status, setStatus] = useState<LearningStatus | undefined>();
  const [sortBy, setSortBy] = useState<LearningSortField>("createdAt");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const search = useDebounced(searchInput.trim());
  const technology = useDebounced(techInput.trim());
  const progressRaw = useDebounced(progressInput.trim());
  const progressNum = progressRaw === "" ? undefined : Number(progressRaw);
  const progress = progressNum !== undefined && Number.isInteger(progressNum) && progressNum >= 0 && progressNum <= 100 ? progressNum : undefined;
  const progressInvalid = progressRaw !== "" && progress === undefined;

  // Page resets to 0 in the same render whenever search/filter/sort change — no stale double request.
  const filterKey = JSON.stringify([search, technology, progress, status, sortBy, direction]);
  const [pageState, setPageState] = useState({ key: filterKey, page: 0 });
  const page = pageState.key === filterKey ? pageState.page : 0;
  const setPage = (p: number) => setPageState({ key: filterKey, page: p });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LearningTopic | null>(null);
  const [deleting, setDeleting] = useState<LearningTopic | null>(null);
  const [progressing, setProgressing] = useState<LearningTopic | null>(null);

  const list = useQuery({ ...learningQueries.list({ search, technology, status, progress, page, size: PAGE_SIZE, sortBy, direction }), enabled: tab === "all" && !progressInvalid });
  const view = useQuery({ ...learningQueries.view(tab === "all" ? "in-progress" : tab), enabled: tab !== "all" });
  const hasFilters = !!(searchInput || techInput || progressInput || status);

  // Invalidating analytics makes the Dashboard refetch on next visit.
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: learningQueries.all }), qc.invalidateQueries({ queryKey: ["analytics"] })]);
  const applyServer = (t: LearningTopic) => qc.setQueriesData<{ content: LearningTopic[] } | LearningTopic[]>({ queryKey: learningQueries.all }, (old) => {
    if (!old) return old;
    const swap = (arr: LearningTopic[]) => arr.map((x) => (x.id === t.id ? t : x));
    return Array.isArray(old) ? swap(old) : { ...old, content: swap(old.content) };
  });

  const save = useMutation({
    mutationFn: ({ id, data }: { id?: number | undefined; data: LearningTopicRequest }) => (id ? updateLearningTopic(id, data) : createLearningTopic(data)),
    onSuccess: async (_d, { id }) => { toast.success(id ? "Topic updated" : "Topic added"); setFormOpen(false); await refresh(); },
    onError: (e) => toast.error(e instanceof ApiError && e.fieldErrors && Object.keys(e.fieldErrors).length ? "Please fix the highlighted fields." : errMsg(e)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteLearningTopic(id),
    onSuccess: async () => {
      toast.success("Topic deleted"); setDeleting(null);
      if (tab === "all" && list.data && list.data.content.length === 1 && page > 0) setPage(page - 1);
      await refresh();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const setProgressM = useMutation({
    mutationFn: ({ id, value }: { id: number; value: number }) => updateLearningProgress(id, value),
    onSuccess: async (t) => { applyServer(t); setProgressing(null); toast.success(`Progress saved · ${t.progress}% · ${statusLabel[t.status]}`); await refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });
  const complete = useMutation({
    mutationFn: (id: number) => completeLearningTopic(id),
    onSuccess: async (t) => { applyServer(t); toast.success(`Completed “${t.topic}”`); await refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const clearFilters = () => { setSearchInput(""); setTechInput(""); setProgressInput(""); setStatus(undefined); };
  const q = tab === "all" ? list : view;
  const rows: LearningTopic[] | undefined = tab === "all" ? list.data?.content : view.data;
  const filtering = tab === "all" && hasFilters;
  const emptyText: Record<Tab, string> = { all: "No learning topics yet", "in-progress": "Nothing in progress", completed: "No completed topics yet" };

  const RowActions = ({ t }: { t: LearningTopic }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${t.topic}`} disabled={complete.isPending && complete.variables === t.id}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
    <DropdownMenuItem onSelect={() => setProgressing(t)}><Gauge />Update progress</DropdownMenuItem>
    <DropdownMenuItem disabled={t.status === "COMPLETED"} onSelect={() => complete.mutate(t.id)}><CheckCircle2 />Mark complete</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => { setEditing(t); setFormOpen(true); }}><Pencil />Edit</DropdownMenuItem>
    <DropdownMenuSeparator /><DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => setDeleting(t)}><Trash2 />Delete</DropdownMenuItem>
  </DropdownMenuContent></DropdownMenu>;
  const Title = ({ t }: { t: LearningTopic }) => <div className="min-w-0"><p className="font-medium text-foreground">{t.resourceUrl ? <a href={t.resourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-primary hover:underline">{t.topic}<ExternalLink className="size-3" /></a> : t.topic}</p><p className="mt-0.5 text-xs text-muted-foreground">{t.technology}</p>{t.notes && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{t.notes}</p>}</div>;
  const Bar = ({ t }: { t: LearningTopic }) => <div className="flex min-w-[120px] items-center gap-2"><Progress value={Math.max(0, Math.min(100, t.progress))} aria-label={`${t.progress}% complete`} /><span className="w-9 shrink-0 text-right font-mono text-xs text-muted-foreground">{t.progress}%</span></div>;

  return <div className="space-y-6 animate-page-in">
    <PageHeader title="Learning" description="Turn technologies and topics into visible, consistent progress." action={<Button onClick={openAdd}><Plus />Add topic</Button>} />

    <div role="tablist" aria-label="Learning views" className="inline-flex flex-wrap gap-1 rounded-md border border-border bg-card p-1">
      {TABS.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn("rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", tab === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>{t.label}</button>)}
    </div>

    {tab === "all" && <Card><CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_160px_150px_110px_150px_auto_auto]">
      <div className="relative sm:col-span-2 xl:col-span-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search technology or topic" placeholder="Search technology or topic" className="pl-9" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} /></div>
      <Input aria-label="Technology" placeholder="Technology (exact)" value={techInput} onChange={(e) => setTechInput(e.target.value)} />
      <Select value={status ?? ALL} onValueChange={(v) => setStatus(v === ALL ? undefined : (v as LearningStatus))}><SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>All statuses</SelectItem>{LEARNING_STATUSES.map((s) => <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>)}</SelectContent></Select>
      <Input aria-label="Progress (exact %)" placeholder="Progress %" type="number" min={0} max={100} value={progressInput} onChange={(e) => setProgressInput(e.target.value)} aria-invalid={progressInvalid} />
      <Select value={sortBy} onValueChange={(v) => setSortBy(v as LearningSortField)}><SelectTrigger aria-label="Sort by"><SelectValue /></SelectTrigger><SelectContent>{LEARNING_SORT_FIELDS.map((f) => <SelectItem key={f} value={f}>{sortLabel[f]}</SelectItem>)}</SelectContent></Select>
      <Button variant="outline" onClick={() => setDirection((d) => (d === "asc" ? "desc" : "asc"))} aria-label={`Sort direction: ${direction === "asc" ? "ascending" : "descending"}`}>{direction === "asc" ? <ArrowUpNarrowWide /> : <ArrowDownWideNarrow />}{direction === "asc" ? "Asc" : "Desc"}</Button>
      {hasFilters && <Button variant="ghost" onClick={clearFilters}><X />Clear</Button>}
      {progressInvalid && <p className="text-xs text-danger sm:col-span-2 xl:col-span-7">Progress filter must be a whole number from 0 to 100.</p>}
    </CardContent></Card>}

    <Card><CardContent className="p-0">
      {tab === "all" && progressInvalid ? <div className="p-10 text-center text-sm text-muted-foreground">Enter a valid progress value to filter.</div>
      : q.isPending ? <div className="space-y-3 p-5" aria-busy="true" aria-label="Loading topics">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      : q.isError ? <div role="alert" className="flex flex-col items-center gap-3 p-10 text-center"><AlertCircle className="size-6 text-danger" /><p className="text-sm text-muted-foreground">{errMsg(q.error)}</p><Button size="sm" variant="outline" onClick={() => void q.refetch()}><RotateCw />Retry</Button></div>
      : rows && rows.length === 0 ? <div className="flex flex-col items-center gap-3 p-12 text-center"><span className="grid size-12 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary"><GraduationCap className="size-6" /></span><p className="font-display font-semibold">{filtering ? "No topics match these filters" : emptyText[tab]}</p>{filtering ? <Button variant="outline" onClick={clearFilters}>Clear filters</Button> : <Button onClick={openAdd}><Plus />Add topic</Button>}</div>
      : rows && <div className={cn("transition-opacity", q.isFetching && "opacity-60")}>
        <div className="hidden overflow-x-auto md:block"><table className="data-table w-full text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">{["Topic", "Progress", "Status", "Hours", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{rows.map((t) => <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface-subtle">
            <td className="max-w-md px-4 py-3"><Title t={t} /></td><td className="px-4 py-3"><Bar t={t} /></td>
            <td className="px-4 py-3"><Pill className={statusTone[t.status]}>{statusLabel[t.status]}</Pill></td><td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{hours(t.hoursSpent)}</td>
            <td className="px-2 py-3 text-right"><RowActions t={t} /></td>
          </tr>)}</tbody></table></div>
        <ul className="divide-y divide-border md:hidden">{rows.map((t) => <li key={t.id} className="space-y-2 p-4"><div className="flex items-start justify-between gap-2"><Title t={t} /><RowActions t={t} /></div><Bar t={t} /><div className="flex flex-wrap items-center gap-2"><Pill className={statusTone[t.status]}>{statusLabel[t.status]}</Pill><span className="text-xs text-muted-foreground">{hours(t.hoursSpent)}</span></div></li>)}</ul>
        {tab === "all" && list.data ? <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row"><span>{list.data.totalElements} topic{list.data.totalElements === 1 ? "" : "s"} · Page {list.data.number + 1} of {Math.max(1, list.data.totalPages)}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={list.data.number === 0 || list.isFetching} onClick={() => setPage(list.data.number - 1)}><ChevronLeft />Previous</Button><Button variant="outline" size="sm" disabled={list.data.last || list.isFetching} onClick={() => setPage(list.data.number + 1)}>Next<ChevronRight /></Button></div></div>
          : <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">{rows.length} topic{rows.length === 1 ? "" : "s"}</div>}
      </div>}
    </CardContent></Card>

    <LearningFormDialog open={formOpen} onOpenChange={setFormOpen} topic={editing} onSubmit={async (d) => { await save.mutateAsync({ id: editing?.id, data: d }); }} />
    <ProgressDialog topic={progressing} onOpenChange={(o) => !o && setProgressing(null)} onSubmit={async (value) => { if (progressing) await setProgressM.mutateAsync({ id: progressing.id, value }); }} />

    <AlertDialog open={!!deleting} onOpenChange={(o) => !o && !remove.isPending && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this topic?</AlertDialogTitle><AlertDialogDescription>“{deleting?.topic}” will be permanently removed. This can’t be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel><AlertDialogAction disabled={remove.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={(e) => { e.preventDefault(); if (deleting) remove.mutate(deleting.id); }}>{remove.isPending ? "Deleting…" : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
