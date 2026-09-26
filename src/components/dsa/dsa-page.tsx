import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle2, ChevronLeft, ChevronRight, Code2, ExternalLink, MoreHorizontal, Pencil, Plus, RotateCcw, RotateCw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { createDsaProblem, deleteDsaProblem, dsaQueries, reviseDsaProblem, solveDsaProblem, updateDsaProblem } from "@/services/dsa";
import { DSA_DIFFICULTIES, DSA_SORT_FIELDS, DSA_STATUSES, type DsaDifficulty, type DsaListParams, type DsaProblem, type DsaProblemRequest, type DsaSortField, type DsaStatus } from "@/types/dsa";
import { DsaFormDialog } from "./dsa-form-dialog";
import { label } from "./dsa-labels";

const PAGE_SIZE = 10;
const ALL = "all";
const diffTone: Record<DsaDifficulty, string> = { EASY: "bg-success/10 text-success border-success/20", MEDIUM: "bg-warning/10 text-warning border-warning/20", HARD: "bg-danger/10 text-danger border-danger/20" };
const statusTone: Record<DsaStatus, string> = { TODO: "bg-muted text-muted-foreground border-border", SOLVED: "bg-success/10 text-success border-success/20", REVISION: "bg-warning/10 text-warning border-warning/20", MASTERED: "bg-primary/10 text-primary border-primary/20" };
const sortLabels: Record<DsaSortField, string> = { createdAt: "Created", updatedAt: "Updated", title: "Title", dateSolved: "Date solved", revisionDate: "Revision date", difficulty: "Difficulty", status: "Status" };

const Pill = ({ className, children }: { className: string; children: string }) => <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-xs font-medium", className)}>{children}</span>;
const fmtDate = (d: string | null) => (d ? new Date(`${d.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—");
const errMsg = (e: unknown) => (e instanceof ApiError ? (e.status === 404 ? "Problem not found. It may have been deleted." : e.message) : "Something went wrong. Please try again.");

function useDebounced(value: string, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export function DsaPage() {
  const qc = useQueryClient();
  const [topicInput, setTopicInput] = useState("");
  const [platformInput, setPlatformInput] = useState("");
  const topic = useDebounced(topicInput.trim());
  const platform = useDebounced(platformInput.trim());
  const [difficulty, setDifficulty] = useState<DsaDifficulty | undefined>();
  const [status, setStatus] = useState<DsaStatus | undefined>();
  const [sortBy, setSortBy] = useState<DsaSortField>("createdAt");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DsaProblem | null>(null);
  const [deleting, setDeleting] = useState<DsaProblem | null>(null);

  useEffect(() => { setPage(0); }, [topic, platform, difficulty, status, sortBy, direction]);

  const params: DsaListParams = { topic: topic || undefined, platform: platform || undefined, difficulty, status, page, size: PAGE_SIZE, sortBy, direction };
  const list = useQuery(dsaQueries.list(params));
  const hasFilters = !!(topic || platform || difficulty || status);

  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: dsaQueries.all }), qc.invalidateQueries({ queryKey: ["analytics"] })]);

  const save = useMutation({
    mutationFn: ({ id, data }: { id?: number | undefined; data: DsaProblemRequest }) => (id ? updateDsaProblem(id, data) : createDsaProblem(data)),
    onSuccess: async (_d, { id }) => { toast.success(id ? "Problem updated" : "Problem added"); setFormOpen(false); await refresh(); },
    onError: (e) => { if (!(e instanceof ApiError && e.fieldErrors && Object.keys(e.fieldErrors).length)) toast.error(errMsg(e)); else toast.error("Please fix the highlighted fields."); },
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteDsaProblem(id),
    onSuccess: async () => {
      toast.success("Problem deleted"); setDeleting(null);
      if (list.data && list.data.content.length === 1 && page > 0) setPage(page - 1);
      await refresh();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const action = useMutation({
    mutationFn: ({ id, kind }: { id: number; kind: "solve" | "revise" }) => (kind === "solve" ? solveDsaProblem(id) : reviseDsaProblem(id)),
    onSuccess: async (p, { kind }) => { toast.success(kind === "solve" ? `Marked “${p.title}” solved` : `Marked “${p.title}” for revision`); await refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const clearFilters = () => { setTopicInput(""); setPlatformInput(""); setDifficulty(undefined); setStatus(undefined); };
  const data = list.data;

  const RowActions = ({ p }: { p: DsaProblem }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${p.title}`} disabled={action.isPending && action.variables?.id === p.id}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
    <DropdownMenuItem disabled={p.status === "SOLVED"} onSelect={() => action.mutate({ id: p.id, kind: "solve" })}><CheckCircle2 />Mark solved</DropdownMenuItem>
    <DropdownMenuItem disabled={p.status === "REVISION"} onSelect={() => action.mutate({ id: p.id, kind: "revise" })}><RotateCcw />Mark for revision</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => { setEditing(p); setFormOpen(true); }}><Pencil />Edit</DropdownMenuItem>
    <DropdownMenuSeparator /><DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => setDeleting(p)}><Trash2 />Delete</DropdownMenuItem>
  </DropdownMenuContent></DropdownMenu>;

  const Title = ({ p }: { p: DsaProblem }) => p.problemUrl
    ? <a href={p.problemUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary">{p.title}<ExternalLink className="size-3.5 text-muted-foreground" /></a>
    : <span className="font-medium text-foreground">{p.title}</span>;

  return <div className="space-y-6 animate-page-in">
    <PageHeader title="DSA Tracker" description="Track every problem you solve and build consistent problem-solving habits." action={<Button onClick={openAdd}><Plus />Add problem</Button>} />

    <Card><CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_150px_150px_170px_auto]">
      <Input aria-label="Filter by topic (exact match)" placeholder="Topic (exact), e.g. Arrays" value={topicInput} onChange={(e) => setTopicInput(e.target.value)} />
      <Input aria-label="Filter by platform (exact match)" placeholder="Platform (exact), e.g. LeetCode" value={platformInput} onChange={(e) => setPlatformInput(e.target.value)} />
      <Select value={difficulty ?? ALL} onValueChange={(v) => setDifficulty(v === ALL ? undefined : (v as DsaDifficulty))}><SelectTrigger aria-label="Difficulty"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>All difficulties</SelectItem>{DSA_DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{label(d)}</SelectItem>)}</SelectContent></Select>
      <Select value={status ?? ALL} onValueChange={(v) => setStatus(v === ALL ? undefined : (v as DsaStatus))}><SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>All statuses</SelectItem>{DSA_STATUSES.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}</SelectContent></Select>
      <div className="flex gap-2"><Select value={sortBy} onValueChange={(v) => setSortBy(v as DsaSortField)}><SelectTrigger aria-label="Sort by"><SelectValue /></SelectTrigger><SelectContent>{DSA_SORT_FIELDS.map((f) => <SelectItem key={f} value={f}>{sortLabels[f]}</SelectItem>)}</SelectContent></Select><Button variant="outline" size="icon" aria-label={direction === "asc" ? "Sort ascending" : "Sort descending"} onClick={() => setDirection(direction === "asc" ? "desc" : "asc")}>{direction === "asc" ? <ArrowUp /> : <ArrowDown />}</Button></div>
      {hasFilters && <Button variant="ghost" onClick={clearFilters}><X />Clear</Button>}
    </CardContent></Card>

    <Card><CardContent className="p-0">
      {list.isPending ? <div className="space-y-3 p-5" aria-busy="true" aria-label="Loading problems">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      : list.isError ? <div role="alert" className="flex flex-col items-center gap-3 p-10 text-center"><AlertCircle className="size-6 text-danger" /><p className="text-sm text-muted-foreground">{errMsg(list.error) || "Unable to load problems"}</p><Button size="sm" variant="outline" onClick={() => void list.refetch()}><RotateCw />Retry</Button></div>
      : data && data.content.length === 0 ? <div className="flex flex-col items-center gap-3 p-12 text-center"><span className="grid size-12 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary"><Code2 className="size-6" /></span><p className="font-display font-semibold">{hasFilters ? "No problems match these filters" : "No problems yet"}</p><p className="max-w-sm text-sm text-muted-foreground">{hasFilters ? "Try different filters, or clear them to see everything." : "Log your first problem to start building your streak."}</p>{hasFilters ? <Button variant="outline" onClick={clearFilters}>Clear filters</Button> : <Button onClick={openAdd}><Plus />Add problem</Button>}</div>
      : data && <div className={cn("transition-opacity", list.isFetching && "opacity-60")}>
        <div className="hidden overflow-x-auto md:block"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">{["Title", "Platform", "Topic", "Difficulty", "Status", "Solved", "Revision", "Time", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{data.content.map((p) => <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-subtle">
            <td className="px-4 py-3"><Title p={p} /></td><td className="px-4 py-3 text-muted-foreground">{p.platform}</td><td className="px-4 py-3 text-muted-foreground">{p.topic}</td>
            <td className="px-4 py-3"><Pill className={diffTone[p.difficulty]}>{label(p.difficulty)}</Pill></td><td className="px-4 py-3"><Pill className={statusTone[p.status]}>{label(p.status)}</Pill></td>
            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{fmtDate(p.dateSolved)}</td><td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{fmtDate(p.revisionDate)}</td>
            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.timeTaken ? `${p.timeTaken}m` : "—"}</td><td className="px-2 py-3 text-right"><RowActions p={p} /></td>
          </tr>)}</tbody></table></div>
        <ul className="divide-y divide-border md:hidden">{data.content.map((p) => <li key={p.id} className="space-y-2 p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><Title p={p} /><p className="mt-0.5 text-xs text-muted-foreground">{p.platform} · {p.topic}</p></div><RowActions p={p} /></div><div className="flex flex-wrap items-center gap-2"><Pill className={diffTone[p.difficulty]}>{label(p.difficulty)}</Pill><Pill className={statusTone[p.status]}>{label(p.status)}</Pill>{p.timeTaken ? <span className="font-mono text-xs text-muted-foreground">{p.timeTaken}m</span> : null}</div><p className="text-xs text-muted-foreground">Solved {fmtDate(p.dateSolved)} · Revision {fmtDate(p.revisionDate)}</p></li>)}</ul>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row"><span>{data.totalElements} problem{data.totalElements === 1 ? "" : "s"} · Page {data.number + 1} of {Math.max(1, data.totalPages)}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={data.number === 0 || list.isFetching} onClick={() => setPage(data.number - 1)}><ChevronLeft />Previous</Button><Button variant="outline" size="sm" disabled={data.last || list.isFetching} onClick={() => setPage(data.number + 1)}>Next<ChevronRight /></Button></div></div>
      </div>}
    </CardContent></Card>

    <DsaFormDialog open={formOpen} onOpenChange={setFormOpen} problem={editing} onSubmit={async (d) => { await save.mutateAsync({ id: editing?.id, data: d }); }} />

    <AlertDialog open={!!deleting} onOpenChange={(o) => !o && !remove.isPending && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this problem?</AlertDialogTitle><AlertDialogDescription>“{deleting?.title}” will be permanently removed. This can’t be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel><AlertDialogAction disabled={remove.isPending} className="bg-danger text-foreground hover:bg-danger/90" onClick={(e) => { e.preventDefault(); if (deleting) remove.mutate(deleting.id); }}>{remove.isPending ? "Deleting…" : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
