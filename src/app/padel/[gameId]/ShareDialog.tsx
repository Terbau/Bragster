"use client";

import { LoadingButton } from "@/components/LoadingButton/LoadingButton";
import { QrCode } from "@/components/QrCode/QrCode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { PadelGameWithRounds } from "@/types/padel";
import { formatPadelResults } from "@/utils/padel";
import { Copy, ExternalLink, Radio, Share2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { setPadelGameSharing } from "../actions";

interface ShareDialogProps {
  open: boolean;
  game: PadelGameWithRounds;
  onGameChange: (game: PadelGameWithRounds) => void;
  onClose: () => void;
}

export const ShareDialog = ({
  open,
  game,
  onGameChange,
  onClose,
}: ShareDialogProps) => {
  const [isPending, startTransition] = useTransition();
  // Set after mount, so server and browser render the same
  const [origin, setOrigin] = useState("");
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanShare(typeof navigator.share === "function");
  }, []);

  const liveUrl =
    game.shareToken && origin
      ? `${origin}/padel/live/${game.shareToken}`
      : null;
  const results = formatPadelResults(game, liveUrl ?? undefined);

  const setSharing = (isShared: boolean) =>
    startTransition(async () => {
      try {
        onGameChange(await setPadelGameSharing(game.id, isShared));
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    });

  const copy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch {
      toast.error("Could not copy to the clipboard");
    }
  };

  const share = async (text: string) => {
    try {
      await navigator.share({ text });
    } catch {
      // Closing the share sheet throws, which needs no message
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <DialogDescription>
            Let the other players follow the game, or send the results to the
            group chat.
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-3">
          <h3 className="font-semibold flex items-center gap-1.5">
            <Radio className="w-4 h-4" />
            Live link
          </h3>
          {liveUrl ? (
            <>
              <p className="text-sm text-muted-foreground">
                Anyone with the link sees the rounds and the leaderboard update
                as you enter scores, without signing in. Let them scan the code:
              </p>
              <QrCode
                value={liveUrl}
                className="w-44 h-44 mx-auto rounded-lg border border-border"
              />
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={liveUrl}
                  onFocus={(event) => event.target.select()}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  aria-label="Copy link"
                  onClick={() => copy(liveUrl, "Link copied")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  aria-label="Open the live page"
                  asChild
                >
                  <a href={liveUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
              <LoadingButton
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                isLoading={isPending}
                onClick={() => setSharing(false)}
              >
                Stop sharing
              </LoadingButton>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Make a link where everyone can follow the rounds and the
                leaderboard on their own phone, without signing in. Only you can
                change the scores.
              </p>
              <LoadingButton
                isLoading={isPending}
                onClick={() => setSharing(true)}
              >
                Create live link
              </LoadingButton>
            </>
          )}
        </section>

        <section className="space-y-3 border-t border-border pt-5">
          <h3 className="font-semibold flex items-center gap-1.5">
            <Share2 className="w-4 h-4" />
            Results
          </h3>
          <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/60 p-3 font-sans text-sm">
            {results}
          </pre>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => copy(results, "Results copied")}
            >
              <Copy className="w-4 h-4 mr-1.5" />
              Copy
            </Button>
            {canShare && (
              <Button className="flex-1" onClick={() => share(results)}>
                <Share2 className="w-4 h-4 mr-1.5" />
                Share
              </Button>
            )}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
};
