import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Calculator, Calendar, CircleAlert, CircleX, Settings } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import {
  QUICK_ASSIGN_BAR_HEIGHT,
  QuickAssignBar,
  type QuickAssignState,
} from "@/components/smart-receipt/QuickAssignBar";
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
import { getSmartReceiptSummary } from "@/lib/smart-receipt";
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
  const [quickAssign, setQuickAssign] = useState<QuickAssignState>({
    active: false,
    userIds: [],
    guestIds: [],
  });

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

  const handleItemPress = (item: ReceiptItem) => {
    if (quickAssign.active) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updatePayments.mutate({
        itemId: item.id,
        userIds: quickAssign.userIds,
        guestIds: quickAssign.guestIds,
      });
      return;
    }
    router.push({
      pathname: "/smart-receipt/[smartReceiptId]/assign",
      params: { smartReceiptId, itemId: item.id },
    });
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
            ? QUICK_ASSIGN_BAR_HEIGHT + insets.bottom + 32
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
                interpreted. You can manually change item sums on the{" "}
                <Text
                  className="text-sm text-blue-500 dark:text-blue-400"
                  onPress={() =>
                    router.push({
                      pathname: "/receipt/[receiptId]",
                      params: { receiptId: receipt.id },
                    })
                  }
                >
                  original receipt page
                </Text>
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
              {quickAssign.active && (
                <Text className="text-sm text-green-600 dark:text-green-400">
                  {" "}
                  (Quick Assign Active)
                </Text>
              )}
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
        <QuickAssignBar
          users={smartReceipt.users}
          guests={smartReceipt.guests}
          value={quickAssign}
          onChange={setQuickAssign}
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
