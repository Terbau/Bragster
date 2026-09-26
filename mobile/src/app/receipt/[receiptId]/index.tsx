import { router, Stack, useLocalSearchParams } from "expo-router";
import { ChevronRight, Pencil, Plus } from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { ErrorState } from "@/components/ErrorState";
import { ReceiptCard } from "@/components/receipt/ReceiptCard";
import { AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/color-scheme";
import { formatDate } from "@/lib/format";
import { useCreateSmartReceipt, useReceipt } from "@/lib/queries";

export default function ReceiptScreen() {
  const { receiptId } = useLocalSearchParams<{ receiptId: string }>();
  const { colors } = useColors();
  const { data, error, isPending, refetch, isRefetching } = useReceipt(receiptId);
  const createSmartReceipt = useCreateSmartReceipt();

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  const { receipt, isOwner } = data;

  const handleCreateSmartReceipt = () =>
    createSmartReceipt.mutate(receipt.id, {
      onSuccess: (smartReceipt) =>
        router.push({
          pathname: "/smart-receipt/[smartReceiptId]",
          params: { smartReceiptId: smartReceipt.id, setup: "true" },
        }),
    });

  return (
    <>
      <Stack.Screen options={{ title: receipt.merchantName }} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-6 p-4 pb-10"
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.mutedForeground}
          />
        }
      >
        {isOwner && (
          <Button
            icon={Pencil}
            onPress={() =>
              router.push({
                pathname: "/receipt/[receiptId]/edit",
                params: { receiptId: receipt.id },
              })
            }
          >
            Edit receipt
          </Button>
        )}

        <ReceiptCard
          receipt={receipt}
          onEditItemGroup={
            isOwner
              ? (itemGroup) =>
                  router.push({
                    pathname: "/receipt/[receiptId]/edit",
                    params: { receiptId: receipt.id, itemGroupId: itemGroup.id },
                  })
              : undefined
          }
        />

        <View className="gap-2 rounded-xl border border-border p-4">
          <Text className="text-xl font-medium">Smart Receipts</Text>
          <Text className="text-sm text-muted-foreground">
            Below you will find all smart receipts associated with this receipt.
          </Text>
          {isOwner && (
            <Button
              variant="outline"
              icon={Plus}
              className="mb-2 mt-2"
              isLoading={createSmartReceipt.isPending}
              onPress={handleCreateSmartReceipt}
            >
              Create new
            </Button>
          )}
          <Separator />
          {receipt.smartReceipts.length > 0 ? (
            <View className="mt-2 gap-2">
              {receipt.smartReceipts.map((smartReceipt) => (
                <Pressable
                  key={smartReceipt.id}
                  onPress={() =>
                    router.push({
                      pathname: "/smart-receipt/[smartReceiptId]",
                      params: { smartReceiptId: smartReceipt.id },
                    })
                  }
                  className="flex-row items-center justify-between gap-2 rounded-md border border-border p-2 active:bg-accent"
                >
                  <AvatarGroup
                    users={smartReceipt.users}
                    guests={smartReceipt.guests}
                    size="sm"
                  />
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm">{formatDate(smartReceipt.createdAt)}</Text>
                    <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text className="mt-2 text-sm text-muted-foreground">
              No smart receipts found.
            </Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}
