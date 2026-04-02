"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/LoadingButton/LoadingButton";
import { CircleDollarSign, Sparkles, Users } from "lucide-react";
import type { SmartReceiptAllowedPaymentEditor } from "@/lib/generated/prisma";
import type { SmartReceiptWithItemsUsers } from "@/types/receipt";
import type { User } from "@/lib/generated/prisma";
import { QuickSetupStep1, type QuickSetupStep1Handle } from "./QuickSetupStep1";
import { QuickSetupStep2 } from "./QuickSetupStep2";
import { updateSmartReceiptPermissions } from "./actions";

interface QuickSetupWizardProps {
  smartReceipt: SmartReceiptWithItemsUsers;
  currentUser: User;
}

const TOTAL_STEPS = 2;

const stepMeta = [
  {
    icon: CircleDollarSign,
    title: "Set Currency & Total",
    subtitle:
      "Use the currency your bank transaction shows, and set the sum to the amount charged from your account.",
  },
  {
    icon: Users,
    title: "Add People & Permissions",
    subtitle: "Invite participants and set who can edit payments.",
  },
];

export function QuickSetupWizard({
  smartReceipt,
  currentUser,
}: QuickSetupWizardProps) {
  const router = useRouter();
  const [_, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<SmartReceiptAllowedPaymentEditor>(
      smartReceipt.allowedPaymentEditors,
    );

  const step1Ref = useRef<QuickSetupStep1Handle>(null);

  const rerender = () => {
    startTransition(() => router.refresh());
  };

  const handleNext = () => {
    step1Ref.current?.submit();
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("smartReceiptId", smartReceipt.id);
      formData.set("allowedPaymentEditors", selectedPermission);
      await updateSmartReceiptPermissions(formData);
      rerender();
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => setIsOpen(false);
  const handleBack = () => setCurrentStep(1);

  const handleStep1Success = () => {
    rerender();
    setCurrentStep(2);
  };

  const progressValue = (currentStep / TOTAL_STEPS) * 100;
  const meta = stepMeta[currentStep - 1];
  const StepIcon = meta.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl">Quick Setup</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {TOTAL_STEPS}
          </p>
        </DialogHeader>

        <Progress value={progressValue} className="h-1.5" />

        <div className="flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3">
          <StepIcon className="h-5 w-5 mt-0.5 text-primary shrink-0" />
          <div>
            <p className="font-medium text-sm">{meta.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {meta.subtitle}
            </p>
          </div>
        </div>

        <div className="min-h-[200px]">
          {currentStep === 1 && (
            <QuickSetupStep1
              ref={step1Ref}
              smartReceipt={smartReceipt}
              onSuccess={handleStep1Success}
              onLoadingChange={setIsSubmitting}
            />
          )}
          {currentStep === 2 && (
            <QuickSetupStep2
              smartReceipt={smartReceipt}
              currentUser={currentUser}
              selectedPermission={selectedPermission}
              onPermissionChange={setSelectedPermission}
            />
          )}
        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between gap-2 mt-2">
          <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
            Skip
          </Button>
          <div className="flex items-center gap-2">
            {currentStep === 2 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
            {currentStep === 1 && (
              <LoadingButton
                variant="default"
                isLoading={isSubmitting}
                onClick={handleNext}
              >
                Next
              </LoadingButton>
            )}
            {currentStep === 2 && (
              <LoadingButton
                variant="default"
                isLoading={isSubmitting}
                onClick={handleFinish}
              >
                Finish
              </LoadingButton>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
