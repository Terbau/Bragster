"use client";

import { LoadingButton } from "@/components/LoadingButton/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface SpaceNameDialogProps {
  open: boolean;
  title: string;
  description: string;
  submitLabel: string;
  initialName?: string;
  /** Resolves when saved, and throws with a message when it fails */
  onSubmit: (name: string) => Promise<void>;
  onClose: () => void;
}

/** Names a new space, or renames one */
export const SpaceNameDialog = ({
  open,
  title,
  description,
  submitLabel,
  initialName = "",
  onSubmit,
  onClose,
}: SpaceNameDialogProps) => {
  const [name, setName] = useState(initialName);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const submit = () =>
    startTransition(async () => {
      try {
        await onSubmit(name.trim());
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) submit();
          }}
        >
          <section className="space-y-2">
            <label htmlFor="space-name" className="text-sm font-semibold">
              Name
            </label>
            <Input
              id="space-name"
              value={name}
              maxLength={60}
              placeholder="Thursday padel"
              autoFocus
              onChange={(event) => setName(event.target.value)}
            />
          </section>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              disabled={!name.trim()}
              isLoading={isPending}
            >
              {submitLabel}
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
