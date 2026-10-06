import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Code2, ExternalLink, RefreshCw, Unplug, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { leetcodeService, leetcodeQueries } from "@/services/leetcode";
import { ApiError } from "@/services/api";

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number | undefined;
  highlight?: "green" | "amber" | "red" | "blue";
}) {
  const tones = {
    green: "text-success",
    amber: "text-warning",
    red: "text-danger",
    blue: "text-info",
  };
  return (
    <div className="rounded-md border border-border bg-surface-subtle p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 font-display text-xl font-semibold ${highlight ? tones[highlight] : "text-foreground"}`}
      >
        {value ?? "-"}
      </p>
    </div>
  );
}

export function LeetCodeCard() {
  const queryClient = useQueryClient();
  const { data: integration, isPending, isError, error } = useQuery(leetcodeQueries.integration());

  const [usernameInput, setUsernameInput] = useState("");
  const [showDisconnect, setShowDisconnect] = useState(false);

  const refreshQueries = () => {
    queryClient.invalidateQueries({ queryKey: leetcodeQueries.all });
    queryClient.invalidateQueries({ queryKey: ["analytics", "overview"] });
    queryClient.invalidateQueries({ queryKey: ["analytics", "dsa"] });
  };

  const connectMutation = useMutation({
    mutationFn: leetcodeService.connect,
    onSuccess: () => {
      toast.success("LeetCode connected successfully");
      setUsernameInput("");
      refreshQueries();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to connect LeetCode");
    },
  });

  const syncMutation = useMutation({
    mutationFn: leetcodeService.sync,
    onSuccess: () => {
      toast.success("LeetCode statistics synced");
      refreshQueries();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to sync LeetCode statistics");
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: leetcodeService.disconnect,
    onSuccess: () => {
      toast.success("LeetCode integration removed");
      setShowDisconnect(false);
      refreshQueries();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to disconnect LeetCode");
    },
  });

  const isNotFound = isError && error instanceof ApiError && error.status === 404;

  if (isPending) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Skeleton className="size-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Not connected state
  if (isNotFound || !integration) {
    return (
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-surface-subtle text-muted-foreground">
            <Code2 className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">LeetCode</CardTitle>
            <CardDescription className="mt-1">
              Practice DSA and track your problem-solving stats automatically.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="leetcode-username">LeetCode Username</Label>
                <Input
                  id="leetcode-username"
                  placeholder="e.g. neal_wu"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  disabled={connectMutation.isPending}
                />
              </div>
              <Button
                onClick={() => connectMutation.mutate({ username: usernameInput.trim() })}
                disabled={!usernameInput.trim() || connectMutation.isPending}
                className="shrink-0"
              >
                {connectMutation.isPending ? "Connecting..." : "Connect LeetCode"}
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              We only use your public username to fetch your solved problem statistics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Connected state
  return (
    <>
      <Card className="border-primary/20 shadow-sm transition-colors hover:border-primary/30">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-md border border-success/20 bg-success/10 text-success">
            <CheckCircle2 className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-lg">LeetCode</CardTitle>
              <div className="flex items-center gap-2 text-xs font-medium text-success">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-success"></span>
                </span>
                Connected
              </div>
            </div>
            <CardDescription className="mt-1">
              Username: <span className="font-medium text-foreground">{integration.username}</span>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total Solved" value={integration.totalSolved} highlight="blue" />
            <Stat label="Easy" value={integration.easy} highlight="green" />
            <Stat label="Medium" value={integration.medium} highlight="amber" />
            <Stat label="Hard" value={integration.hard} highlight="red" />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-5">
            <div className="text-sm text-muted-foreground">
              Last synced:{" "}
              {integration.lastSyncedAt
                ? new Date(integration.lastSyncedAt).toLocaleString()
                : "Never"}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {integration.profileUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={integration.profileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 size-3.5" />
                    Profile
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
              >
                <RefreshCw
                  className={`mr-2 size-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`}
                />
                {syncMutation.isPending ? "Syncing..." : "Sync Now"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger/10 hover:text-danger"
                onClick={() => setShowDisconnect(true)}
              >
                <Unplug className="mr-2 size-3.5" />
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDisconnect} onOpenChange={setShowDisconnect}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect LeetCode?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your connected LeetCode account from DevCommand. Your locally tracked
              DSA problems will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnectMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                disconnectMutation.mutate();
              }}
              disabled={disconnectMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
