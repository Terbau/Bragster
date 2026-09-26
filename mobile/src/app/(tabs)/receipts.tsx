import { router } from "expo-router";
import {
  ChevronRight,
  Crown,
  Receipt,
  ScanLine,
  Search,
  Users,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, SectionList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { useColors } from "@/lib/color-scheme";
import { formatCurrency, formatDate } from "@/lib/format";
import { useReceipts } from "@/lib/queries";
import type { ReceiptWithItems, SmartReceiptWithItemsUsers } from "@/lib/types";

type Tab = "all" | "my" | "shared";

type Row =
  | { type: "smart"; smartReceipt: SmartReceiptWithItemsUsers }
  | { type: "receipt"; receipt: ReceiptWithItems };

export default function ReceiptsScreen() {
  const { status } = useAuth();
  const insets = useSafeAreaInsets();

  if (status !== "signedIn") {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <SignInPrompt
          icon={Receipt}
          title="Smart Receipt"
          description="Sign in to scan receipts, split them with friends and see who owes what."
        />
      </View>
    );
  }

  return <ReceiptList />;
}

function ReceiptList() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { colors } = useColors();
  const { data, error, isPending, refetch, isRefetching } = useReceipts();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const sections = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const smartReceipts = (data?.smartReceipts ?? []).filter((smartReceipt) =>
      smartReceipt.receipt.merchantName.toLowerCase().includes(query),
    );
    const receipts = (data?.receipts ?? []).filter((receipt) =>
      receipt.merchantName.toLowerCase().includes(query),
    );

    const result: { key: string; title: string; data: Row[] }[] = [];
    if (activeTab !== "my" && smartReceipts.length > 0) {
      result.push({
        key: "shared",
        title: `Shared (${smartReceipts.length})`,
        data: smartReceipts.map((smartReceipt) => ({ type: "smart", smartReceipt })),
      });
    }
    if (activeTab !== "shared" && receipts.length > 0) {
      result.push({
        key: "my",
        title: `My Receipts (${receipts.length})`,
        data: receipts.map((receipt) => ({ type: "receipt", receipt })),
      });
    }
    return result;
  }, [data, searchQuery, activeTab]);

  const header = (
    <View className="gap-6 pb-6">
      <View className="gap-4">
        <View>
          <Text className="text-3xl font-bold tracking-tight">Receipts</Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            All your scanned receipts in one place.
          </Text>
        </View>
        <Button icon={ScanLine} size="lg" onPress={() => router.push("/scan")}>
          Scan New Receipt
        </Button>
      </View>

      <View className="flex-row gap-3">
        <StatCard
          icon={Receipt}
          value={(data?.receipts.length ?? 0) + (data?.smartReceipts.length ?? 0)}
          label="Total receipts"
        />
        <StatCard
          icon={Users}
          value={data?.smartReceipts.length ?? 0}
          label="Shared receipts"
        />
      </View>

      <View className="gap-3">
        <View className="justify-center">
          <View className="absolute left-3 z-10">
            <Icon as={Search} size={16} className="text-muted-foreground" />
          </View>
          <Input
            placeholder="Search by merchant…"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="pl-9"
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>
        <SegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: "all", label: "All" },
            { value: "my", label: "My Receipts" },
            { value: "shared", label: "Shared" },
          ]}
        />
      </View>
    </View>
  );

  return (
    <SectionList
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingBottom: 24,
        paddingHorizontal: 20,
      }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      sections={sections}
      keyExtractor={(row) =>
        row.type === "smart" ? `smart-${row.smartReceipt.id}` : row.receipt.id
      }
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={header}
      renderSectionHeader={({ section }) => (
        <View className="mb-3 mt-2 flex-row items-center gap-1.5">
          <Icon
            as={section.key === "shared" ? Users : Receipt}
            size={16}
            className="text-muted-foreground"
          />
          <Text className="text-sm font-medium text-muted-foreground">
            {section.title}
          </Text>
        </View>
      )}
      SectionSeparatorComponent={() => <View className="h-2" />}
      ItemSeparatorComponent={() => <View className="h-2" />}
      renderItem={({ item: row }) =>
        row.type === "smart" ? (
          <SmartReceiptRow
            smartReceipt={row.smartReceipt}
            isOwner={row.smartReceipt.receipt.userId === user?.id}
          />
        ) : (
          <ReceiptRow receipt={row.receipt} />
        )
      }
      ListEmptyComponent={
        isPending ? (
          <Spinner className="py-16" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <View className="items-center py-16">
            <Icon as={Receipt} size={40} className="mb-3 text-muted-foreground opacity-30" />
            <Text className="text-sm font-medium text-muted-foreground">
              No receipts found
            </Text>
            <Text className="mt-1 text-xs text-muted-foreground">
              {searchQuery ? "Try a different search term." : "Scan a receipt to get started."}
            </Text>
          </View>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.mutedForeground}
        />
      }
    />
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: typeof Receipt;
  value: number;
  label: string;
}) {
  return (
    <View className="flex-1 flex-row items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
      <Icon as={icon} size={20} className="text-muted-foreground" />
      <View>
        <Text className="text-2xl font-bold leading-7">{value}</Text>
        <Text className="mt-1 text-xs text-muted-foreground">{label}</Text>
      </View>
    </View>
  );
}

function RowShell({
  icon,
  onPress,
  children,
  amount,
}: {
  icon: typeof Receipt;
  onPress: () => void;
  children: React.ReactNode;
  amount: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 active:bg-accent"
    >
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon as={icon} size={16} className="text-muted-foreground" />
      </View>
      <View className="min-w-0 flex-1">{children}</View>
      <View className="flex-row items-center gap-3">
        <Text className="text-sm font-medium" style={{ fontVariant: ["tabular-nums"] }}>
          {amount}
        </Text>
        <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
      </View>
    </Pressable>
  );
}

function SmartReceiptRow({
  smartReceipt,
  isOwner,
}: {
  smartReceipt: SmartReceiptWithItemsUsers;
  isOwner: boolean;
}) {
  return (
    <RowShell
      icon={Users}
      onPress={() =>
        router.push({
          pathname: "/smart-receipt/[smartReceiptId]",
          params: { smartReceiptId: smartReceipt.id },
        })
      }
      amount={formatCurrency(
        smartReceipt.updatedTotalPrice ?? smartReceipt.receipt.totalPrice,
        smartReceipt.updatedCurrencyCode ?? smartReceipt.receipt.currencyCode ?? "EUR",
      )}
    >
      <View className="flex-row items-center gap-2">
        <Text className="shrink text-sm font-medium" numberOfLines={1}>
          {smartReceipt.receipt.merchantName}
        </Text>
        {isOwner && (
          <View className="flex-row items-center gap-1 rounded-full border border-border px-2 py-0.5">
            <Icon as={Crown} size={12} className="text-muted-foreground" />
            <Text className="text-[11px] text-muted-foreground">Owner</Text>
          </View>
        )}
      </View>
      <Text className="mt-0.5 text-xs text-muted-foreground">
        {formatDate(smartReceipt.receipt.receiptDate)} ·{" "}
        {smartReceipt.users.length + smartReceipt.guests.length} people
      </Text>
    </RowShell>
  );
}

function ReceiptRow({ receipt }: { receipt: ReceiptWithItems }) {
  return (
    <RowShell
      icon={Receipt}
      onPress={() =>
        router.push({
          pathname: "/receipt/[receiptId]",
          params: { receiptId: receipt.id },
        })
      }
      amount={formatCurrency(receipt.totalPrice, receipt.currencyCode ?? "EUR")}
    >
      <Text className="text-sm font-medium" numberOfLines={1}>
        {receipt.merchantName}
      </Text>
      <Text className="mt-0.5 text-xs text-muted-foreground">
        {formatDate(receipt.receiptDate)}
        {receipt.itemGroups.length > 1 ? ` · ${receipt.itemGroups.length} groups` : ""}
      </Text>
    </RowShell>
  );
}
