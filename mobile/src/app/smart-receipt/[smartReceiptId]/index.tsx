import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Calculator, Calendar, CircleAlert, CircleX, Settings } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import {
  ASSIGN_DOCK_HEIGHT,
  AssignDock,
  type AssignSelection,
  EMPTY_SELECTION,
} from "@/components/smart-receipt/AssignDock";
import {
  type ItemAssignees,
  SmartReceiptItemGroup,
} from "@/components/smart-receipt/SmartReceiptItemGroup";
import { TranslationStatus } from "@/components/smart-receipt/TranslationStatus";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { useColors } from "@/lib/color-scheme";
import { formatAmount, formatDate } from "@/lib/format";
import {
  useInviteLink,
  useJoinWithInviteLink,
  usePendingPaymentItemIds,
  useSmartReceipt,
  useUpdatePayments,
} from "@/lib/queries";
import { calculatePayments, getSmartReceiptSummary } from "@/lib/smart-receipt";
import type { ReceiptItem } from "@/lib/types";

export default function SmartReceiptScreen() {
  const { smartReceiptId, setup, inviteToken } = useLocalSearchParams<{
    smartReceiptId: string;
    setup?: string;
    inviteToken?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { colors } = useColors();
  const { user } = useAuth();

  const [translationTimedOut, setTranslationTimedOut] = useState(false);
  const { data, error, isPending, refetch, isRefetching } = useSmartReceipt(
    smartReceiptId,
    { pollWhileTranslating: !translationTimedOut },
  );
  const updatePayments = useUpdatePayments(smartReceiptId);
  const pendingItemIds = usePendingPaymentItemIds(smartReceiptId);
  const [selection, setSelection] = useState<AssignSelection>(EMPTY_SELECTION);
  const isAssigning = selection.userIds.length + selection.guestIds.length > 0;

  const isOwner = data?.viewer.isOwner ?? false;

  // Open the quick setup once, right after a receipt has been scanned
  const hasOpenedSetup = useRef(false);
  useEffect(() => {
    if (setup === "true" && isOwner && !hasOpenedSetup.current) {
      hasOpenedSetup.current = true;
      router.push({
        pathname: "/smart-receipt/[smartReceiptId]/setup",
        params: { smartReceiptId },
      });
    }
  }, [setup, isOwner, smartReceiptId]);

  const assigneesByItem = useMemo(() => {
    const map = new Map<string, ItemAssignees>();
    const entry = (itemId: string) => {
      let assignees = map.get(itemId);
      if (!assignees) {
        assignees = { users: [], guests: [] };
        map.set(itemId, assignees);
      }
      return assignees;
    };
    for (const payment of data?.smartReceipt.payments ?? []) {
      entry(payment.receiptItemId).users.push(payment.user);
    }
    for (const payment of data?.smartReceipt.guestPayments ?? []) {
      entry(payment.receiptItemId).guests.push(payment.guest);
    }
    return map;
  }, [data?.smartReceipt.payments, data?.smartReceipt.guestPayments]);

  const getAssignees = useCallback(
    (itemId: string) => assigneesByItem.get(itemId) ?? { users: [], guests: [] },
    [assigneesByItem],
  );

  const openAssignSheet = (item: ReceiptItem) =>
    router.push({
      pathname: "/smart-receipt/[smartReceiptId]/assign",
      params: { smartReceiptId, itemId: item.id },
    });

  // With people selected in the dock, a tap adds them to the item, or removes
  // them if they are all on it already. Without a selection it opens the sheet.
  const handleItemPress = (item: ReceiptItem) => {
    if (!isAssigning) {
      openAssignSheet(item);
      return;
    }

    const current = getAssignees(item.id);
    const userIds = current.users.map((u) => u.id);
    const guestIds = current.guests.map((g) => g.id);
    const allSelectedOnItem =
      selection.userIds.every((id) => userIds.includes(id)) &&
      selection.guestIds.every((id) => guestIds.includes(id));

    void Haptics.impactAsync(
      allSelectedOnItem
        ? Haptics.ImpactFeedbackStyle.Soft
        : Haptics.ImpactFeedbackStyle.Medium,
    );
    updatePayments.mutate(
      allSelectedOnItem
        ? {
            itemId: item.id,
            userIds: userIds.filter((id) => !selection.userIds.includes(id)),
            guestIds: guestIds.filter((id) => !selection.guestIds.includes(id)),
          }
        : {
            itemId: item.id,
            userIds: [...new Set([...userIds, ...selection.userIds])],
            guestIds: [...new Set([...guestIds, ...selection.guestIds])],
          },
    );
  };

  const openProperties = () =>
    router.push({
      pathname: "/smart-receipt/[smartReceiptId]/properties",
      params: { smartReceiptId },
    });

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  const { smartReceipt, viewer, isTranslating } = data;
  const receipt = smartReceipt.receipt;
  const summary = getSmartReceiptSummary(smartReceipt);
  const payments = calculatePayments(smartReceipt, summary.priceFactor);

  return (
    <>
      <Stack.Screen
        options={{
          title: receipt.merchantName,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Smart receipt properties"
              hitSlop={10}
              onPress={openProperties}
              className="active:opacity-50"
            >
              <Icon as={Settings} size={22} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-4 p-4"
        contentContainerStyle={{
          paddingBottom: viewer.canEditPayments
            ? ASSIGN_DOCK_HEIGHT + insets.bottom + 16
            : insets.bottom + 24,
        }}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.mutedForeground}
          />
        }
      >
        {inviteToken && !viewer.isParticipant && (
          <JoinCard
            smartReceiptId={smartReceiptId}
            token={inviteToken}
            email={user?.email}
          />
        )}

        {isTranslating && (
          <TranslationStatus
            timedOut={translationTimedOut}
            onTimeout={() => setTranslationTimedOut(true)}
          />
        )}

        <Card className="gap-5 p-4">
          {!summary.isCorrectSum && (
            <Alert
              variant="destructive"
              title="Total sum doesn't match the sum computed from the items"
            >
              <Text className="text-sm text-destructive">
                One or more receipt items were most likely incorrectly
                interpreted.{" "}
                {viewer.isOwner ? (
                  <Text
                    className="text-sm text-blue-500 dark:text-blue-400"
                    onPress={() =>
                      router.push({
                        pathname: "/receipt/[receiptId]/edit",
                        params: { receiptId: receipt.id },
                      })
                    }
                  >
                    Edit the receipt
                  </Text>
                ) : (
                  "The owner can fix it by editing the receipt"
                )}
                .
              </Text>
            </Alert>
          )}

          <View className="gap-2">
            {viewer.isParticipant && user && (
              <Text className="text-sm text-muted-foreground">
                Joined as {user.email}
              </Text>
            )}
            <Text className="text-2xl font-semibold">{receipt.merchantName}</Text>
            <View className="flex-row items-center gap-1">
              <Icon as={Calendar} size={16} className="text-muted-foreground" />
              <Text className="text-sm text-muted-foreground">
                {formatDate(receipt.receiptDate)}
              </Text>
            </View>
            <Button
              variant="outline"
              icon={Calculator}
              className="mt-2"
              onPress={() =>
                router.push({
                  pathname: "/smart-receipt/[smartReceiptId]/payments",
                  params: { smartReceiptId },
                })
              }
            >
              Payment Calculations
            </Button>
          </View>

          <View className="gap-4">
            {receipt.itemGroups.map((itemGroup) => (
              <SmartReceiptItemGroup
                key={itemGroup.id}
                itemGroup={itemGroup}
                currencyCode={summary.currencyCode}
                priceFactor={summary.priceFactor}
                getAssignees={getAssignees}
                pendingItemIds={pendingItemIds}
                canEditPayments={viewer.canEditPayments}
                onItemPress={handleItemPress}
                onItemLongPress={openAssignSheet}
              />
            ))}
          </View>

          <View className="gap-1 border-y border-dashed border-foreground/15 py-4">
            <View className="flex-row items-center justify-between gap-2">
              <View className="flex-row items-center gap-1">
                <Text className="font-bold">Total</Text>
                {!summary.isCorrectSum && (
                  <Icon as={CircleAlert} size={18} className="text-red-400" />
                )}
              </View>
              <View className="flex-row items-center gap-2">
                {!summary.isCorrectSum && (
                  <Badge>{`Computed sum: ${formatAmount(summary.totalPriceFromItems)}`}</Badge>
                )}
                <Text className="font-bold">
                  {formatAmount(summary.totalPrice, summary.currencyCode)}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs">Items</Text>
              <Text className="text-xs">
                {summary.amountItemsPaid} / {summary.amountItems}
              </Text>
            </View>
          </View>

          <Text className="text-xs text-muted-foreground">Receipt ID: {receipt.id}</Text>
        </Card>
      </ScrollView>

      {viewer.canEditPayments && (
        <AssignDock
          users={smartReceipt.users}
          guests={smartReceipt.guests}
          selection={selection}
          onSelectionChange={setSelection}
          amounts={{ ...payments.users, ...payments.guests }}
          currencyCode={summary.currencyCode}
          amountItemsPaid={summary.amountItemsPaid}
          amountItems={summary.amountItems}
        />
      )}
    </>
  );
}

function JoinCard({
  smartReceiptId,
  token,
  email,
}: {
  smartReceiptId: string;
  token: string;
  email?: string;
}) {
  const { data: validity, isPending } = useInviteLink(token);
  const join = useJoinWithInviteLink(smartReceiptId);
  const isValid = validity?.valid && validity.smartReceiptId === smartReceiptId;

  return (
    <Card className="gap-3 p-4">
      <Text className="text-lg font-semibold">Join Smart Receipt</Text>
      {isPending ? (
        <Spinner />
      ) : isValid ? (
        <>
          <Text className="text-sm text-muted-foreground">
            You can join this smart receipt!
          </Text>
          <Button isLoading={join.isPending} onPress={() => join.mutate(token)}>
            {`Join as ${email ?? "yourself"}`}
          </Button>
        </>
      ) : (
        <View className="flex-row items-center gap-2">
          <Icon as={CircleX} size={18} className="text-red-500" />
          <Text className="text-sm text-muted-foreground">
            {validity?.reason ?? "Invalid invite link"}
          </Text>
        </View>
      )}
    </Card>
  );
}
