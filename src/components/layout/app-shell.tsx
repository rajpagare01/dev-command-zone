import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Bell, BriefcaseBusiness, CheckSquare2, ChevronDown, ChevronLeft, Code2, FolderKanban, GraduationCap, LayoutDashboard, LogOut, Menu, Search, Settings, UserRound } from "lucide-react";
import { Brand } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/devcommand";

const nav: NavigationItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }, { label: "DSA", path: "/dsa", icon: Code2 },
  { label: "Jobs", path: "/jobs", icon: BriefcaseBusiness }, { label: "Learning", path: "/learning", icon: GraduationCap },
  { label: "Projects", path: "/projects", icon: FolderKanban }, { label: "Tasks", path: "/tasks", icon: CheckSquare2 },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
];

function SidebarContent({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const linkClass = (active: boolean) => cn("group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-all", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground", collapsed && "justify-center px-0");
  const item = (entry: NavigationItem) => { const active = pathname === entry.path; const content = <Link to={entry.path} onClick={onNavigate} className={linkClass(active)} aria-current={active ? "page" : undefined}><entry.icon className="size-[18px] shrink-0" />{!collapsed && <span>{entry.label}</span>}</Link>; return collapsed ? <Tooltip key={entry.path}><TooltipTrigger asChild>{content}</TooltipTrigger><TooltipContent side="right">{entry.label}</TooltipContent></Tooltip> : <div key={entry.path}>{content}</div>; };
  return <div className="flex h-full flex-col"><div className={cn("flex h-16 items-center border-b border-border px-4", collapsed && "justify-center px-0")}><Brand compact={collapsed} /></div>
    <nav className="flex-1 space-y-1 p-3" aria-label="Main navigation">{nav.map(item)}</nav>
    <div className="border-t border-border p-3"><Link to="/settings" onClick={onNavigate} className={linkClass(pathname === "/settings")}><Settings className="size-[18px] shrink-0" />{!collapsed && <span>Settings</span>}</Link>
      {!collapsed && <div className="mt-3 flex items-center gap-3 rounded-md border border-border bg-surface-subtle p-3"><Avatar className="size-8"><AvatarFallback>RP</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate text-sm font-medium">Raj Pagare</p><p className="truncate text-xs text-muted-foreground">Developer</p></div></div>}
    </div></div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false); const [mobileOpen, setMobileOpen] = useState(false);
  return <TooltipProvider><div className="min-h-screen bg-background text-foreground">
    <aside className={cn("fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-sidebar transition-[width] duration-200 md:block", collapsed ? "w-[72px]" : "w-60")}><SidebarContent collapsed={collapsed} /><Button variant="outline" size="icon" onClick={() => setCollapsed((v) => !v)} className="absolute -right-3 top-20 size-6 rounded-full bg-card" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}><ChevronLeft className={cn("size-3 transition-transform", collapsed && "rotate-180")} /></Button></aside>
    <div className={cn("transition-[padding] duration-200", collapsed ? "md:pl-[72px]" : "md:pl-60")}>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-lg sm:px-6 lg:px-8">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation"><Menu /></Button></SheetTrigger><SheetContent side="left" className="w-72 p-0"><SheetTitle className="sr-only">Navigation</SheetTitle><SidebarContent onNavigate={() => setMobileOpen(false)} /></SheetContent></Sheet>
        <div className="relative hidden w-full max-w-sm sm:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-9 bg-surface-subtle pl-9" placeholder="Search DevCommand..." aria-label="Search" /><kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd></div>
        <div className="ml-auto flex items-center gap-1"><Button variant="ghost" size="icon" className="relative" aria-label="Notifications"><Bell /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" /></Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-10 gap-2 px-2"><Avatar className="size-7"><AvatarFallback>RP</AvatarFallback></Avatar><span className="hidden text-sm sm:inline">Raj</span><ChevronDown className="size-3 text-muted-foreground" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56"><DropdownMenuLabel><span className="block">Raj Pagare</span><span className="font-normal text-muted-foreground">Personal workspace</span></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem><UserRound />Profile</DropdownMenuItem><DropdownMenuItem asChild><Link to="/settings"><Settings />Settings</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem asChild><Link to="/login"><LogOut />Sign out</Link></DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div></header>
      <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
    </div></div></TooltipProvider>;
}
