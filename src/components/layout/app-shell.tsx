import { useState, type ReactNode, useEffect, useRef } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BriefcaseBusiness,
  CheckSquare2,
  ChevronDown,
  ChevronLeft,
  Code2,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Plug,
} from "lucide-react";
import { Brand } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/devcommand";
import { useAuth } from "@/context/auth-context";
import { WorkspaceCommand } from "@/components/common/workspace-command";

const nav: NavigationItem[] = [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }];
const workNav: NavigationItem[] = [
  { label: "DSA", path: "/dsa", icon: Code2 },
  { label: "Tasks", path: "/tasks", icon: CheckSquare2 },
  { label: "Jobs", path: "/jobs", icon: BriefcaseBusiness },
  { label: "Learning", path: "/learning", icon: GraduationCap },
  { label: "Projects", path: "/projects", icon: FolderKanban },
];
const insightNav: NavigationItem[] = [{ label: "Analytics", path: "/analytics", icon: BarChart3 }];

function SidebarContent({
  collapsed = false,
  onNavigate,
  name,
  email,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  name: string;
  email: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const linkClass = (active: boolean) =>
    cn(
      "group relative flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none before:absolute before:left-0 before:h-4 before:w-0.5 before:rounded-full before:bg-primary before:transition-[transform,opacity] before:duration-150 motion-reduce:before:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:h-9",
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-primary/20 before:scale-y-100 before:opacity-100"
        : "text-muted-foreground before:scale-y-50 before:opacity-0 hover:bg-sidebar-accent/70 hover:text-foreground",
      collapsed && "justify-center px-0 before:left-0",
    );
  const item = (entry: NavigationItem) => {
    const active = pathname === entry.path || pathname.startsWith(`${entry.path}/`);
    const content = (
      <Link
        to={entry.path}
        onClick={onNavigate}
        className={linkClass(active)}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? entry.label : undefined}
      >
        <entry.icon className={cn("size-[17px] shrink-0", active && "text-primary")} />
        {!collapsed && <span>{entry.label}</span>}
      </Link>
    );
    return collapsed ? (
      <Tooltip key={entry.path}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{entry.label}</TooltipContent>
      </Tooltip>
    ) : (
      <div key={entry.path}>{content}</div>
    );
  };
  const group = (label: string, items: NavigationItem[]) => (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 pb-1 pt-4 font-mono text-[10px] font-semibold uppercase text-muted-foreground">
          {label}
        </p>
      )}
      {items.map(item)}
    </div>
  );
  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 items-center border-b border-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <Brand compact={collapsed} />
      </div>
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Main navigation">
        {nav.map(item)}
        {group("Work", workNav)}
        {group("Insights", insightNav)}
      </nav>
      <div className="border-t border-border p-3">
        {!collapsed && (
          <p className="px-3 pb-1 font-mono text-[10px] font-semibold uppercase text-muted-foreground">
            System
          </p>
        )}
        <Link
          to="/integrations"
          onClick={onNavigate}
          className={linkClass(pathname.startsWith("/integrations"))}
        >
          <Plug
            className={cn(
              "size-[17px] shrink-0",
              pathname.startsWith("/integrations") && "text-primary",
            )}
          />
          {!collapsed && <span>Integrations</span>}
        </Link>
        <Link to="/settings" onClick={onNavigate} className={linkClass(pathname === "/settings")}>
          <Settings
            className={cn("size-[17px] shrink-0", pathname === "/settings" && "text-primary")}
          />
          {!collapsed && <span>Settings</span>}
        </Link>
        {!collapsed && (
          <div className="mt-3 flex items-center gap-3 rounded-md border border-border bg-surface-subtle p-3">
            <Avatar className="size-8">
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mainRef = useRef<HTMLElement>(null);
  
  const name = currentUser?.name ?? "Developer";
  const email = currentUser?.email ?? "";
  const firstName = name.split(" ")[0] ?? name;
  
  const signOut = async () => {
    logout();
    await navigate({ to: "/login", search: { redirect: undefined }, replace: true });
  };

  useEffect(() => {
    // Safety focus management for keyboard navigation
    // When the route changes, move focus to the main content area
    // to avoid focus being trapped in the sidebar/header.
    if (mainRef.current) {
      mainRef.current.focus({ preventScroll: true });
    }
  }, [pathname]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-sidebar transition-[width] duration-200 md:block",
            collapsed ? "w-[72px]" : "w-60",
          )}
        >
          <SidebarContent collapsed={collapsed} name={name} email={email} />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCollapsed((v) => !v)}
            className="absolute -right-3 top-20 size-6 rounded-md bg-card"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={cn("size-3 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </aside>
        <div
          className={cn(
            "transition-[padding] duration-200",
            collapsed ? "md:pl-[72px]" : "md:pl-60",
          )}
        >
          <header className="sticky top-0 z-30 grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-terminal-chrome/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11 shrink-0 md:hidden"
                  aria-label="Open navigation"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent onNavigate={() => setMobileOpen(false)} name={name} email={email} />
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <p className="truncate font-mono text-xs font-medium text-foreground">Developer workspace</p>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                Plan, practice, learn, and ship.
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <WorkspaceCommand />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" aria-label="Account menu" className="h-11 min-w-11 gap-2 px-2 sm:h-10">
                    <Avatar className="size-7 shrink-0">
                      <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-28 truncate text-sm sm:inline">{firstName}</span>
                    <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>
                    <span className="block truncate">{name}</span>
                    <span className="block truncate font-normal text-muted-foreground">
                      {email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings />
                      Account & settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => void signOut()}>
                    <LogOut />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main 
            id="main-content"
            ref={mainRef}
            tabIndex={-1}
            className="mx-auto w-full max-w-[1560px] p-4 outline-none sm:p-6 lg:p-8"
          >
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
