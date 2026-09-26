import { router } from "expo-router";
import {
  CircleDollarSign,
  type LucideIcon,
  Pencil,
  Share,
  User,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { View } from "react-native";
import { CurrencyForm } from "@/components/smart-receipt/CurrencyForm";
import { PermissionsForm } from "@/components/smart-receipt/PermissionsForm";
import { SmartReceiptSheet } from "@/components/smart-receipt/SmartReceiptSheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";

// The website's sidebar. The accordion sections are shown stacked instead.
export default function PropertiesScreen() {
  return (
    <SmartReceiptSheet>
      {({ smartReceipt, viewer }) => {
        const formsDisabled = !viewer.isOwner;
        const params = { smartReceiptId: smartReceipt.id };

        return (
          <>
            <Text className="text-sm text-muted-foreground">
              Below you will find all details related to this smart receipt.
              Please note that if you would like to change receipt specific
              properties, you must do it on the original receipt page.
            </Text>

            <Section
              icon={User}
              label="Users"
              description="Manage users associated with this smart receipt."
            >
              <Button
                variant="outline"
                icon={Pencil}
                onPress={() =>
                  router.push({ pathname: "/smart-receipt/[smartReceiptId]/users", params })
                }
              >
                Manage Users
              </Button>
              <Button
                variant="outline"
                icon={Share}
                onPress={() =>
                  router.push({ pathname: "/smart-receipt/[smartReceiptId]/invite", params })
                }
              >
                Invite Users
              </Button>
            </Section>

            <Separator />

            <Section
              icon={CircleDollarSign}
              label="Currency"
              description="Currency related properties for this smart receipt."
            >
              <CurrencyForm smartReceipt={smartReceipt} disabled={formsDisabled} />
            </Section>

            <Separator />

            <Section
              icon={Pencil}
              label="Permissions"
              description="Manage permissions for this smart receipt."
            >
              <PermissionsForm smartReceipt={smartReceipt} disabled={formsDisabled} />
            </Section>
          </>
        );
      }}
    </SmartReceiptSheet>
  );
}

function Section({
  icon,
  label,
  description,
  children,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-4">
      <View className="flex-row gap-2">
        <Icon as={icon} size={22} />
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-medium">{label}</Text>
          <Text className="text-xs text-muted-foreground">{description}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}
