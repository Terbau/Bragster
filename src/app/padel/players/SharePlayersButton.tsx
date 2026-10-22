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
import { Copy, ExternalLink, Share2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { padelPlayersLivePath } from "../_components/padelFormat";
import { getPadelPlayersSharing, setPadelPlayersSharing } from "../actions";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

/**
 * Turns the live link to the players list on or off, and shows it. The link
 * is loaded when the dialog opens, so the list works even if this fails.
 */
export const SharePlayersButton = () => {
  const [open, setOpen] = useState(false);
  // Undefined until loaded
  const [shareToken, setShareToken] = useState<string | null>();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // Set after mount, so server and browser render the same
  const [origin, setOrigin] = useState("");
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (!open) return;
    let isCurrent = true;
    setLoadError(null);
    getPadelPlayersSharing()
      .then(({ shareToken }) => isCurrent && setShareToken(shareToken))
      .catch((error) => isCurrent && setLoadError(errorMessage(error)));
    return () => {
      isCurrent = false;
    };
  }, [open]);
  useEffect(() => {
    setOrigin(window.location.origin);
    setCanShare(typeof navigator.share === "function");
  }, []);

  const liveUrl =
    shareToken && origin
      ? `${origin}${padelPlayersLivePath(shareToken)}`
      : null;

  const setSharing = (isShared: boolean) =>
    startTransition(async () => {
      try {
        setShareToken((await setPadelPlayersSharing(isShared)).shareToken);
      } catch (error) {
        toast.error(errorMessage(error));
      }
    });

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy to the clipboard");
    }
  };

  const share = async (url: string) => {
    try {
      await navigator.share({ text: `Padel ratings: ${url}` });
    } catch {
      // Closing the share sheet throws, which needs no message
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="self-start sm:self-auto"
        onClick={() => setOpen(true)}
      >
        <Share2 className="w-4 h-4 mr-1.5" />
        Share
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share the players</DialogTitle>
            <DialogDescription>
              Let your friends see everyone&apos;s rating and stats, without
              signing in.
            </DialogDescription>
          </DialogHeader>

          {loadError ? (
            <p className="text-sm text-destructive">
              Could not load the link: {loadError}
            </p>
          ) : shareToken === undefined ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : liveUrl ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Anyone with the link sees this list and every player&apos;s
                page, and they update as you enter scores. Your games and videos
                stay private. Let them scan the code:
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
                  onClick={() => copy(liveUrl)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  aria-label="Open the shared page"
                  asChild
                >
                  <a href={liveUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 justify-between">
                <LoadingButton
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  isLoading={isPending}
                  onClick={() => setSharing(false)}
                >
                  Stop sharing
                </LoadingButton>
                {canShare && (
                  <Button size="sm" onClick={() => share(liveUrl)}>
                    <Share2 className="w-4 h-4 mr-1.5" />
                    Share link
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Stopping turns the link off for good. Sharing again makes a new
                one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Make a link to this list, where everyone can check their own and
                each other&apos;s rating, form, partners and opponents. Your
                games and videos stay private, and only you can change anything.
              </p>
              <LoadingButton
                isLoading={isPending}
                onClick={() => setSharing(true)}
              >
                Create live link
              </LoadingButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
