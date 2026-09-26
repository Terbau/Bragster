import { router } from "expo-router";
import { CircleDollarSign, Sparkles, Users } from "lucide-react-native";
import { useRef, useState } from "react";
import { View } from "react-native";
import {
  CurrencyForm,
  type CurrencyFormHandle,
} from "@/components/smart-receipt/CurrencyForm";
import { SmartReceiptSheet } from "@/components/smart-receipt/SmartReceiptSheet";
import { UserManagement } from "@/components/smart-receipt/UserManagement";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup } from "@/components/ui/radio-group";
import { SeparatorWithText } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useUpdatePermissions } from "@/lib/queries";
import { PERMISSION_OPTIONS } from "@/lib/smart-receipt";
import type { AllowedPaymentEditor, SmartReceiptDetailResponse } from "@/lib/types";

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

export default function SetupScreen() {
  return <SmartReceiptSheet>{(data) => <QuickSetup data={data} />}</SmartReceiptSheet>;
}

function QuickSetup({ data }: { data: SmartReceiptDetailResponse }) {
  const { smartReceipt, viewer } = data;
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permission, setPermission] = useState<AllowedPaymentEditor>(
    smartReceipt.allowedPaymentEditors,
  );
  const currencyFormRef = useRef<CurrencyFormHandle>(null);
  const updatePermissions = useUpdatePermissions(smartReceipt.id);
  const meta = stepMeta[step - 1];

  const handleNext = async () => {
    setIsSubmitting(true);
    const saved = await currencyFormRef.current?.submit();
    setIsSubmitting(false);
    if (saved) {
      setStep(2);
    }
  };

  const handleFinish = () => {
    if (permission === smartReceipt.allowedPaymentEditors) {
      router.back();
      return;
    }
    updatePermissions.mutate(permission, { onSuccess: () => router.back() });
  };

  return (
    <>
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Icon as={Sparkles} size={20} />
          <Text className="text-xl font-semibold">Quick Setup</Text>
        </View>
        <Text className="text-sm text-muted-foreground">
          Step {step} of {TOTAL_STEPS}
        </Text>
      </View>

      <Progress value={(step / TOTAL_STEPS) * 100} className="h-1.5" />

      <View className="flex-row items-start gap-3 rounded-lg bg-muted/50 px-4 py-3">
        <Icon as={meta.icon} size={20} className="mt-0.5" />
        <View className="flex-1">
          <Text className="text-sm font-medium">{meta.title}</Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">{meta.subtitle}</Text>
        </View>
      </View>

      {step === 1 ? (
        <CurrencyForm ref={currencyFormRef} smartReceipt={smartReceipt} compact />
      ) : (
        <View className="gap-4">
          <UserManagement smartReceipt={smartReceipt} isOwner={viewer.isOwner} />
          <SeparatorWithText text="Payment permissions" />
          <View>
            <Label>Who can edit payments?</Label>
            <RadioGroup
              options={PERMISSION_OPTIONS}
              value={permission}
              onChange={setPermission}
            />
          </View>
        </View>
      )}

      <View className="flex-row items-center justify-between gap-2">
        <Button
          variant="ghost"
          disabled={isSubmitting || updatePermissions.isPending}
          onPress={() => router.back()}
        >
          Skip
        </Button>
        <View className="flex-row items-center gap-2">
          {step === 2 && (
            <Button
              variant="outline"
              disabled={updatePermissions.isPending}
              onPress={() => setStep(1)}
            >
              Back
            </Button>
          )}
          {step === 1 ? (
            <Button isLoading={isSubmitting} onPress={handleNext}>
              Next
            </Button>
          ) : (
            <Button isLoading={updatePermissions.isPending} onPress={handleFinish}>
              Finish
            </Button>
          )}
        </View>
      </View>
    </>
  );
}
