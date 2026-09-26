import * as Clipboard from "expo-clipboard";
import { CircleCheck, Copy, Share as ShareIcon } from "lucide-react-native";
import { useState } from "react";
import { Share, View } from "react-native";
import { SmartReceiptSheet } from "@/components/smart-receipt/SmartReceiptSheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useCreateInviteLink } from "@/lib/queries";
import { EXPIRATION_OPTIONS } from "@/lib/smart-receipt";
import { toast } from "@/lib/toast";
import type { InviteLinkExpiration, SmartReceiptDetailResponse } from "@/lib/types";

export default function InviteScreen() {
  return <SmartReceiptSheet>{(data) => <InviteForm data={data} />}</SmartReceiptSheet>;
}

function InviteForm({ data }: { data: SmartReceiptDetailResponse }) {
  const { smartReceipt, viewer } = data;
  const [expirationTime, setExpirationTime] = useState<InviteLinkExpiration>("NEVER");
  const createInviteLink = useCreateInviteLink(smartReceipt.id);
  const inviteUrl = createInviteLink.data?.url;
  const formDisabled = !viewer.isOwner;

  const copyLink = async () => {
    if (inviteUrl) {
      await Clipboard.setStringAsync(inviteUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const shareLink = () => {
    if (inviteUrl) {
      void Share.share({
        message: `Join "${smartReceipt.receipt.merchantName}" on Bragster to split the receipt: ${inviteUrl}`,
        url: inviteUrl,
      });
    }
  };

  return (
    <>
      <Text className="text-sm text-muted-foreground">
        Create an invite link to share with others! People without an account can
        join as guests on the website.
      </Text>

      {!inviteUrl ? (
        <>
          <View>
            <Label>Link expires after</Label>
            <RadioGroup
              options={EXPIRATION_OPTIONS}
              value={expirationTime}
              onChange={setExpirationTime}
              disabled={formDisabled}
            />
          </View>
          <Button
            isLoading={createInviteLink.isPending}
            disabled={formDisabled}
            onPress={() => createInviteLink.mutate(expirationTime)}
          >
            Create Invite Link
          </Button>
        </>
      ) : (
        <>
          <Separator />
          <View className="flex-row items-center gap-1.5">
            <Icon as={CircleCheck} size={22} className="text-green-400" />
            <Text className="text-sm">Link created successfully!</Text>
          </View>
          <View className="rounded-lg border border-input bg-muted/40 px-3 py-3">
            <Text selectable className="text-sm">
              {inviteUrl}
            </Text>
          </View>
          <View className="flex-row gap-3">
            <Button variant="outline" icon={Copy} className="flex-1" onPress={copyLink}>
              Copy
            </Button>
            <Button icon={ShareIcon} className="flex-1" onPress={shareLink}>
              Share
            </Button>
          </View>
        </>
      )}
    </>
  );
}
