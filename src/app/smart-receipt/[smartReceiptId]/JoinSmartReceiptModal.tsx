"use client";

import { TextInput } from "@/components/Form/Fields/TextInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { SeparatorWithText } from "@/components/ui/separator";
import type { User } from "@/lib/generated/prisma";
import type { SmartReceiptWithUsers } from "@/types/receipt";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, CircleX, TriangleAlert } from "lucide-react";
import { signIn } from "next-auth/react";
import { useEffect, useState, useTransition } from "react";
import {
  checkGuestNameValidity,
  joinSmartReceiptAsGuestUsingInviteToken,
  joinSmartReceiptUsingInviteToken,
} from "./actions";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/LoadingButton/LoadingButton";
import { Spinner } from "@/components/Spinner";
import { formatName } from "@/utils/utils";
import { toast } from "sonner";

interface JoinSmartReceiptModalProps {
  valid: boolean | null;
  reason: string | null;
  token: string;
  smartReceipt: SmartReceiptWithUsers;
  user?: User;
}

export const JoinSmartReceiptModal = ({
  valid,
  reason,
  token,
  smartReceipt,
  user,
}: JoinSmartReceiptModalProps) => {
  const router = useRouter();
  const [isPendingJoinAsSignedInTransition, startTransitionJoinAsSignedIn] =
    useTransition();
  const [isPendingJoinAsGuestTransition, startTransitionJoinAsGuest] =
    useTransition();

  const [isOpen, setIsOpen] = useState(true);
  const [guestName, setGuestName] = useState("");

  const {
    data: validateGuestNameData,
    isLoading: isLoadingGuestNameValidation,
  } = useQuery({
    queryKey: ["validate-guest-name", guestName],
    queryFn: async () =>
      await checkGuestNameValidity(smartReceipt.id, guestName),
    enabled: guestName.length > 0 && formatName(guestName).length >= 2,
  });

  const { mutate: mutateJoinSignedIn, isPending: isPendingSignedIn } =
    useMutation({
      mutationFn: async (token: string) =>
        await joinSmartReceiptUsingInviteToken(token),
      onSuccess: () => {
        startTransitionJoinAsSignedIn(() => {
          router.refresh();
        });
        toast.success("You have joined the smart receipt");
      },
    });

  const { mutate: mutateJoinAsGuest, isPending: isPendingJoinAsGuest } =
    useMutation({
      mutationFn: async ({
        token,
        guestName,
      }: { token: string; guestName: string }) =>
        await joinSmartReceiptAsGuestUsingInviteToken(token, guestName),
      onSuccess: () => {
        startTransitionJoinAsGuest(() => {
          router.refresh();
        });
        toast.success("You have joined the smart receipt as a guest");
      },
    });

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogTitle>Join Smart Receipt</DialogTitle>
        <DialogDescription className="flex flex-row gap-2 items-center">
          {!valid && <CircleX className="h-5 w-5 text-red-500" />}
          {!valid ? reason : "You can join this smart receipt!"}
        </DialogDescription>
        <div className="flex flex-col gap-4">
          {user ? (
            <LoadingButton
              isLoading={isPendingJoinAsSignedInTransition || isPendingSignedIn}
              onClick={() => mutateJoinSignedIn(token)}
            >
              Join as {user?.email}
            </LoadingButton>
          ) : (
            <Button onClick={() => signIn("auth0")}>
              Sign in for best experience
            </Button>
          )}
          <SeparatorWithText text="or" />
          <div className="flex flex-col gap-2">
            <div className="relative">
              <TextInput
                placeholder="Enter your name..."
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {validateGuestNameData?.valid &&
                  !isLoadingGuestNameValidation &&
                  guestName.length > 0 &&
                  formatName(guestName).length >= 2 && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                {isLoadingGuestNameValidation && (
                  <Spinner className="h-4 w-4" />
                )}
              </span>
            </div>
            {validateGuestNameData?.valid === false &&
              validateGuestNameData?.existing && (
                <p className="text-muted-foreground text-xs">
                  <TriangleAlert className="inline h-4 w-4 mr-1 text-orange-400" />
                  A guest by this name already exists. Are you sure you want to
                  register as this guest?
                </p>
              )}
            <LoadingButton
              variant="outline"
              isLoading={isPendingJoinAsGuestTransition || isPendingJoinAsGuest}
              onClick={() => mutateJoinAsGuest({ token, guestName })}
              disabled={
                guestName.length === 0 ||
                (validateGuestNameData?.valid === false &&
                  validateGuestNameData?.existing !== true)
              }
            >
              Join as guest
            </LoadingButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
