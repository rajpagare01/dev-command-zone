import { CheckCircle2, CircleUserRound, KeyRound, LogOut, MonitorCog, Server } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";

function SettingRow({ icon: Icon, label, value, status }: { icon: typeof Server; label: string; value: string; status?: string }) {
  return <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 border-b border-border py-4 last:border-0 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"><span className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-surface-subtle text-muted-foreground"><Icon className="size-4" /></span><div className="min-w-0"><p className="text-sm font-medium text-foreground">{label}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{value}</p></div>{status && <span className="col-start-2 inline-flex w-fit items-center gap-1.5 text-xs text-success sm:col-start-auto"><CheckCircle2 className="size-3.5" />{status}</span>}</div>;
}

export function SettingsPage() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const name = currentUser?.name ?? "Developer";
  const email = currentUser?.email ?? "Not available";
  const signOut = async () => { logout(); await navigate({ to: "/login", search: { redirect: undefined }, replace: true }); };

  return <div className="space-y-6 animate-page-in">
    <PageHeader title="Settings" description="Review your account, connection, and workspace environment." />
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.65fr)]">
      <Card><CardHeader><CardTitle>Account</CardTitle><p className="text-sm text-muted-foreground">Identity provided by your authenticated session.</p></CardHeader><CardContent>
        <div className="flex min-w-0 items-center gap-4 border-b border-border pb-5"><Avatar className="size-11 shrink-0"><AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate font-display font-semibold">{name}</p><p className="truncate text-sm text-muted-foreground">{email}</p></div></div>
        <SettingRow icon={CircleUserRound} label="Display name" value={name} />
        <SettingRow icon={KeyRound} label="Authentication" value="JWT bearer session managed securely by DevCommand" {...(isAuthenticated ? { status: "Active" } : {})} />
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Workspace</CardTitle><p className="text-sm text-muted-foreground">Current frontend environment and connection state.</p></CardHeader><CardContent>
        <SettingRow icon={Server} label="Spring Boot API" value="Requests use the centralized authenticated client" status="Configured" />
        <SettingRow icon={MonitorCog} label="Appearance" value="Dark workspace theme" status="Active" />
        <div className="mt-5 rounded-md border border-border bg-surface-subtle p-4"><p className="text-sm font-medium">Preferences stay intentional</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Additional preferences will appear here only when backend support exists. Nothing on this page pretends to save unsupported settings.</p></div>
      </CardContent></Card>
    </div>
    <Card><CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5"><div className="min-w-0"><p className="font-medium">End this session</p><p className="mt-1 text-sm text-muted-foreground">Sign out and clear local session data on this device.</p></div><Button variant="outline" onClick={() => void signOut()}><LogOut />Sign out</Button></CardContent></Card>
  </div>;
}