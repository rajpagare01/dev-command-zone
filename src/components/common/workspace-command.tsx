import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, BriefcaseBusiness, CheckSquare2, Clock3, Code2, FolderKanban, GraduationCap, Keyboard, LayoutDashboard, RotateCw, Search, Settings, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const destinations = [
  { id: "dashboard", label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, key: "H" },
  { id: "dsa", label: "DSA", to: "/dsa", icon: Code2, key: "D" },
  { id: "tasks", label: "Tasks", to: "/tasks", icon: CheckSquare2, key: "T" },
  { id: "jobs", label: "Jobs", to: "/jobs", icon: BriefcaseBusiness, key: "J" },
  { id: "learning", label: "Learning", to: "/learning", icon: GraduationCap, key: "L" },
  { id: "projects", label: "Projects", to: "/projects", icon: FolderKanban, key: "P" },
  { id: "analytics", label: "Analytics", to: "/analytics", icon: BarChart3, key: "A" },
  { id: "settings", label: "Settings", to: "/settings", icon: Settings, key: "S" },
] as const;
type Destination = (typeof destinations)[number];

export const SHORTCUTS_TOGGLE_EVENT = "devcommand:toggle-shortcuts";
export const SHORTCUTS_STATE_EVENT = "devcommand:shortcuts-state";
const PREFS_KEY = "devcommand.palette";
const MAX_RECENT = 5;
interface PalettePrefs { recent: string[]; favorites: string[] }
const validIds = new Set<string>(destinations.map((d) => d.id));

function readPrefs(): PalettePrefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return { recent: [], favorites: [] };
    const parsed = JSON.parse(raw) as Partial<PalettePrefs>;
    const clean = (list: unknown) => (Array.isArray(list) ? list.filter((id): id is string => typeof id === "string" && validIds.has(id)) : []);
    return { recent: clean(parsed.recent).slice(0, MAX_RECENT), favorites: clean(parsed.favorites) };
  } catch {
    return { recent: [], favorites: [] };
  }
}

const shortcutRows = [
  { keys: ["⌘", "K"], alt: ["Ctrl", "K"], label: "Open command palette" },
  { keys: ["G", "D"], label: "Go to DSA" },
  { keys: ["G", "T"], label: "Go to Tasks" },
  { keys: ["G", "J"], label: "Go to Jobs" },
  { keys: ["?"], label: "Open or close this help" },
];

function Keys({ keys }: { keys: string[] }) {
  return <span className="flex items-center gap-1">{keys.map((k) => <kbd key={k} className="min-w-6 rounded-sm border border-border bg-surface-subtle px-1.5 py-0.5 text-center font-mono text-xs">{k}</kbd>)}</span>;
}

export function WorkspaceCommand() {
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [prefs, setPrefs] = useState<PalettePrefs>({ recent: [], favorites: [] });
  const navigate = useNavigate();
  const client = useQueryClient();

  useEffect(() => { setPrefs(readPrefs()); }, []);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (helpOpen && document.activeElement instanceof HTMLElement) returnFocus.current = document.activeElement;
    window.dispatchEvent(new CustomEvent(SHORTCUTS_STATE_EVENT, { detail: helpOpen }));
  }, [helpOpen]);
  useEffect(() => {
    const toggle = () => { setOpen(false); setHelpOpen((v) => !v); };
    window.addEventListener(SHORTCUTS_TOGGLE_EVENT, toggle);
    return () => window.removeEventListener(SHORTCUTS_TOGGLE_EVENT, toggle);
  }, []);
  const update = useCallback((fn: (p: PalettePrefs) => PalettePrefs) => {
    setPrefs((current) => {
      const next = fn(current);
      try { window.localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  }, []);

  const go = (item: Destination) => {
    setOpen(false);
    update((p) => ({ ...p, recent: [item.id, ...p.recent.filter((id) => id !== item.id)].slice(0, MAX_RECENT) }));
    void navigate({ to: item.to });
  };
  const toggleFavorite = (id: string) => update((p) => ({ ...p, favorites: p.favorites.includes(id) ? p.favorites.filter((f) => f !== id) : [...p.favorites, id] }));

  useEffect(() => {
    let prefixAt = 0;
    const onKey = (event: KeyboardEvent) => {
      if (event.isComposing) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        prefixAt = 0;
        setHelpOpen(false);
        setOpen((value) => !value);
        return;
      }
      const target = event.target;
      if (event.key === "?" && helpOpen) {
        event.preventDefault();
        setHelpOpen(false);
        return;
      }
      if (open || helpOpen || event.metaKey || event.ctrlKey || event.altKey || (target instanceof HTMLElement && target.closest("input,textarea,select,[contenteditable=true],[role=dialog],[role=combobox]"))) {
        prefixAt = 0;
        return;
      }
      if (event.key === "?") {
        event.preventDefault();
        prefixAt = 0;
        setHelpOpen(true);
        return;
      }
      const destination = destinations.find((item) => item.key.toLowerCase() === event.key.toLowerCase());
      if (prefixAt && Date.now() - prefixAt < 1000 && destination) {
        event.preventDefault();
        prefixAt = 0;
        void navigate({ to: destination.to });
      } else {
        prefixAt = event.key.toLowerCase() === "g" ? Date.now() : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, open, helpOpen]);

  const byId = (ids: string[]) => ids.map((id) => destinations.find((d) => d.id === id)).filter((d): d is Destination => Boolean(d));
  const favorites = byId(prefs.favorites);
  const recent = byId(prefs.recent);

  const row = (item: Destination, group: string) => {
    const fav = prefs.favorites.includes(item.id);
    return (
      <CommandItem key={`${group}-${item.id}`} value={`${group} ${item.label}`} onSelect={() => go(item)} className="group py-3">
        <item.icon /><span>{item.label}</span>
        <CommandShortcut>G {item.key}</CommandShortcut>
        <button
          type="button"
          aria-label={fav ? `Remove ${item.label} from favorites` : `Add ${item.label} to favorites`}
          aria-pressed={fav}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFavorite(item.id); }}
          className={cn("ml-2 grid size-6 place-items-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", fav ? "text-warning" : "opacity-0 group-hover:opacity-100 group-data-[selected=true]:opacity-100 focus-visible:opacity-100")}
        >
          <Star className={cn("size-3.5", fav && "fill-current")} />
        </button>
      </CommandItem>
    );
  };

  return <>
    <Button variant="outline" onClick={() => setOpen(true)} aria-label="Search commands and routes" aria-keyshortcuts="Meta+K Control+K" className="h-9 min-w-0 gap-2 bg-surface-subtle px-3 text-muted-foreground lg:w-64 lg:justify-start">
      <Search className="size-4 shrink-0" /><span className="hidden lg:inline">Search commands…</span>
    </Button>
    <Button variant="ghost" size="icon" onClick={(event) => { event.currentTarget.focus(); setHelpOpen(true); }} aria-label="Keyboard shortcuts" aria-keyshortcuts="?" className="hidden size-9 text-muted-foreground sm:inline-flex">
      <Keyboard className="size-4" />
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">DevCommand commands</DialogTitle>
        <DialogDescription className="sr-only">Search workspace routes and actions. Star a route to pin it to favorites.</DialogDescription>
        <Command>
          <CommandInput placeholder="Where next?" aria-label="Search workspace commands" className="pr-12" />
          <CommandList>
            <CommandEmpty>No matching commands.</CommandEmpty>
            {favorites.length > 0 && <CommandGroup heading="Favorites">{favorites.map((item) => row(item, "favorite"))}</CommandGroup>}
            {recent.length > 0 && <CommandGroup heading={<span className="inline-flex items-center gap-1.5"><Clock3 className="size-3" />Recent</span>}>{recent.map((item) => row(item, "recent"))}</CommandGroup>}
            <CommandGroup heading="Workspaces">{destinations.map((item) => row(item, "workspace"))}</CommandGroup>
            <CommandGroup heading="Actions">
              <CommandItem value="Refresh dashboard sync analytics tasks" onSelect={() => { setOpen(false); void client.invalidateQueries({ queryKey: ["analytics"] }); void client.invalidateQueries({ queryKey: ["tasks"] }); }} className="py-3"><RotateCw />Refresh dashboard data</CommandItem>
              <CommandItem value="Keyboard shortcuts help" onSelect={() => { setOpen(false); setHelpOpen(true); }} className="py-3"><Keyboard />Keyboard shortcuts<CommandShortcut>?</CommandShortcut></CommandItem>
              {recent.length > 0 && <CommandItem value="Clear recent commands" onSelect={() => update((p) => ({ ...p, recent: [] }))} className="py-3"><Clock3 />Clear recent commands</CommandItem>}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(event) => { event.preventDefault(); (event.currentTarget as HTMLElement).focus(); }}
        onCloseAutoFocus={(event) => {
          const target = returnFocus.current;
          if (target && target.isConnected) { event.preventDefault(); target.focus(); }
          returnFocus.current = null;
        }}
      >
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Press Escape, ? or click outside to close. Press G, then a letter within one second to jump between workspaces.</DialogDescription>
        </DialogHeader>
        <ul className="divide-y divide-border rounded-md border border-border">
          {shortcutRows.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <span>{s.label}</span>
              <span className="flex items-center gap-2">
                <Keys keys={s.keys} />
                {s.alt && <><span className="text-xs text-muted-foreground">or</span><Keys keys={s.alt} /></>}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  </>;
}
