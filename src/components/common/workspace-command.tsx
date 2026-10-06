import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, BriefcaseBusiness, CheckSquare2, Code2, FolderKanban, GraduationCap, LayoutDashboard, RotateCw, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";

const destinations = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, key: "H" },
  { label: "DSA", to: "/dsa", icon: Code2, key: "D" },
  { label: "Tasks", to: "/tasks", icon: CheckSquare2, key: "T" },
  { label: "Jobs", to: "/jobs", icon: BriefcaseBusiness, key: "J" },
  { label: "Learning", to: "/learning", icon: GraduationCap, key: "L" },
  { label: "Projects", to: "/projects", icon: FolderKanban, key: "P" },
  { label: "Analytics", to: "/analytics", icon: BarChart3, key: "A" },
  { label: "Settings", to: "/settings", icon: Settings, key: "S" },
] as const;

export function WorkspaceCommand() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const client = useQueryClient();
  useEffect(() => {
    let prefixAt = 0;
    const onKey = (event: KeyboardEvent) => {
      if (event.isComposing) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        prefixAt = 0;
        setOpen((value) => !value);
        return;
      }
      const target = event.target;
      if (open || event.metaKey || event.ctrlKey || event.altKey || (target instanceof HTMLElement && (target.closest("input,textarea,select,[contenteditable=true],[role=dialog],[role=combobox]")))) {
        prefixAt = 0;
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
  }, [navigate, open]);

  return <>
    <Button variant="outline" onClick={() => setOpen(true)} aria-label="Search commands and routes" aria-keyshortcuts="Meta+K Control+K" className="h-9 min-w-0 gap-2 bg-surface-subtle px-3 text-muted-foreground lg:w-64 lg:justify-start">
      <Search className="size-4 shrink-0" /><span className="hidden lg:inline">Search commands…</span><kbd className="ml-auto hidden rounded-sm border border-border px-1.5 font-mono text-[10px] lg:inline">⌘K / Ctrl K</kbd>
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">DevCommand commands</DialogTitle>
        <DialogDescription className="sr-only">Search workspace routes and actions.</DialogDescription>
        <Command>
          <CommandInput placeholder="Where next?" aria-label="Search workspace commands" className="pr-12" />
          <CommandList>
            <CommandEmpty>No matching commands.</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {destinations.map((item) => <CommandItem key={item.to} value={item.label} onSelect={() => { setOpen(false); void navigate({ to: item.to }); }} className="py-3"><item.icon /><span>{item.label}</span><CommandShortcut>G {item.key}</CommandShortcut></CommandItem>)}
            </CommandGroup>
            <CommandGroup heading="Actions">
              <CommandItem value="Refresh dashboard sync analytics tasks" onSelect={() => { setOpen(false); void client.invalidateQueries({ queryKey: ["analytics"] }); void client.invalidateQueries({ queryKey: ["tasks"] }); }} className="py-3"><RotateCw />Refresh dashboard data</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  </>;
}