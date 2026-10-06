import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, CheckCircle2, Copy, RefreshCw, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { identityQueries, bootstrapTelegram, deleteIdentity } from "@/services/identities";

export function TelegramCard() {
  const queryClient = useQueryClient();
  const [bootstrapToken, setBootstrapToken] = useState<string | null>(null);

  const { data: identities, isLoading: isLoadingIdentities } = useQuery(
    identityQueries.identities(),
  );

  const telegramIdentity = identities?.find((id) => id.provider === "TELEGRAM" && id.verified);

  const bootstrapMutation = useMutation({
    mutationFn: bootstrapTelegram,
    onSuccess: (data) => {
      setBootstrapToken(data.token);
      toast.success("Bootstrap token generated");
    },
    onError: () => {
      toast.error("Failed to generate Telegram token");
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: deleteIdentity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: identityQueries.all() });
      setBootstrapToken(null);
      toast.success("Telegram disconnected successfully");
    },
    onError: () => {
      toast.error("Failed to disconnect Telegram");
    },
  });

  const handleCopy = () => {
    if (bootstrapToken) {
      navigator.clipboard.writeText(`/bootstrap ${bootstrapToken}`);
      toast.success("Command copied to clipboard");
    }
  };

  if (isLoadingIdentities) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="p-2 bg-muted rounded-md animate-pulse">
            <div className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="h-5 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (telegramIdentity) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="p-2 bg-primary/10 text-primary rounded-md">
            <Send className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>Telegram Connected</CardTitle>
              <Badge
                variant="default"
                className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            <CardDescription>
              Your DevCommand Telegram bot can now receive natural-language commands.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <span className="text-muted-foreground">Linked Account: </span>
            <span className="font-medium">{telegramIdentity.providerIdentity}</span>
          </div>
        </CardContent>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={disconnectMutation.isPending}>
                {disconnectMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Disconnect
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect Telegram?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will immediately revoke access. You will no longer be able to use Telegram
                  commands for this account until you reconnect.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => disconnectMutation.mutate(telegramIdentity.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <div className="p-2 bg-primary/10 text-primary rounded-md">
          <Send className="h-6 w-6" />
        </div>
        <div className="space-y-1.5 flex-1">
          <CardTitle>Telegram</CardTitle>
          <CardDescription>
            Connect your Telegram account to manage DevCommand using natural-language commands.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {!bootstrapToken ? (
          <Button onClick={() => bootstrapMutation.mutate()} disabled={bootstrapMutation.isPending}>
            {bootstrapMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Connect Telegram
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-primary" />
                Connect your Telegram account
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-1">
                <li>Open your DevCommand Telegram bot.</li>
                <li>Send this command:</li>
              </ol>
              <div className="mt-3 flex items-center gap-2">
                <code className="px-3 py-1.5 bg-background rounded border text-sm font-mono flex-1">
                  /bootstrap {bootstrapToken}
                </code>
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-1 mt-3">
                <li value={3}>Return here after linking your account.</li>
              </ol>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="w-3 h-3" />
                <span>This token expires shortly.</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: identityQueries.all() })}
              >
                I've connected my account
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => bootstrapMutation.mutate()}
                disabled={bootstrapMutation.isPending}
              >
                Regenerate token
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
