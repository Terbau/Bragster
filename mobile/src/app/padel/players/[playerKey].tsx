import { router, Stack, useLocalSearchParams } from "expo-router";
import { ChevronRight, Trophy } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/color-scheme";
import { formatDate } from "@/lib/format";
import {
  differencePerMatch,
  formatLabel,
  formatPlayTime,
  formatRallyLength,
  LONG_RALLY_SECONDS,
  SHORT_RALLY_SECONDS,
  ordinal,
  percent,
  pointShare,
  signed,
} from "@/lib/padel";
import { usePadelPlayerProfile } from "@/lib/queries";
import type {
  PadelMatchOutcome,
  PadelPlayerProfile,
  PadelPlayerRelation,
  PadelPlayerVideoStats,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const tabular = { fontVariant: ["tabular-nums" as const] };

export default function PadelPlayerScreen() {
  const { playerKey } = useLocalSearchParams<{ playerKey: string }>();
  const { data, error, isPending, refetch } = usePadelPlayerProfile(playerKey);

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  return <Profile profile={data} />;
}

const openPlayer = (key: string) =>
  router.push({ pathname: "/padel/players/[playerKey]", params: { playerKey: key } });

const changeClass = (change: number) =>
  change > 0
    ? "text-green-700 dark:text-green-400"
    : change < 0
      ? "text-red-700 dark:text-red-400"
      : "text-muted-foreground";

function Profile({ profile }: { profile: PadelPlayerProfile }) {
  const insets = useSafeAreaInsets();
  const { colors } = useColors();
  const { refetch, isRefetching } = usePadelPlayerProfile(profile.key);
  const lastChange = profile.history[0]?.ratingChange ?? 0;

  return (
    <>
      <Stack.Screen options={{ title: profile.name }} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-8 p-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.mutedForeground}
          />
        }
      >
        <View className="items-center gap-1 pt-2">
          <Text className="text-xs text-muted-foreground">Rating</Text>
          <Text className="text-6xl font-semibold leading-[68px]">
            {profile.rating}
          </Text>
          {profile.history.length > 0 && (
            <Text className={cn("text-sm", changeClass(lastChange))}>
              {signed(lastChange)}{" "}
              <Text className="text-sm text-muted-foreground">last game</Text>
            </Text>
          )}
          <Text className="mt-1 text-sm text-muted-foreground">
            {ordinal(profile.ratingRank)} of {profile.playerCount} · Last played{" "}
            {formatDate(profile.lastPlayedAt)}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-3">
          <StatTile
            label="Games"
            value={String(profile.games)}
            detail={`${profile.gamesWon} won`}
          />
          <StatTile
            label="Matches"
            value={String(profile.matches)}
            detail={`${profile.wins} W · ${profile.draws} D · ${profile.losses} L`}
          />
          <StatTile
            label="Matches won"
            value={percent(profile.wins, profile.matches)}
          />
          <StatTile
            label="Points won"
            value={pointShare(profile)}
            detail={`${differencePerMatch(profile)} per match`}
          />
        </View>

        <Section
          title="Form"
          aside={`Last ${profile.form.length}, newest first`}
        >
          <View className="flex-row flex-wrap gap-1.5">
            {profile.form.map((outcome, index) => (
              <FormBadge
                // biome-ignore lint/suspicious/noArrayIndexKey: matches in order
                key={index}
                outcome={outcome}
              />
            ))}
          </View>
        </Section>

        {(profile.bestPartner ||
          profile.favouriteOpponent ||
          profile.toughestOpponent) && (
          <View className="gap-2">
            {profile.bestPartner && (
              <Highlight
                label="Best partner"
                relation={profile.bestPartner}
                detail="together"
              />
            )}
            {profile.favouriteOpponent && (
              <Highlight
                label="Favourite opponent"
                relation={profile.favouriteOpponent}
                detail="against"
              />
            )}
            {profile.toughestOpponent && (
              <Highlight
                label="Toughest opponent"
                relation={profile.toughestOpponent}
                detail="against"
              />
            )}
          </View>
        )}

        {profile.video && <VideoStats video={profile.video} />}

        <RelationList title="Partners" relations={profile.partners} />
        <RelationList title="Opponents" relations={profile.opponents} />

        <Section title="Games">
          <View className="overflow-hidden rounded-xl border border-border bg-card">
            {profile.history.map((game, index) => (
              <Pressable
                key={game.gameId}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/padel/[gameId]",
                    params: { gameId: game.gameId },
                  })
                }
                className={cn(
                  "flex-row items-center gap-3 px-4 py-3 active:bg-accent",
                  index > 0 && "border-t border-border",
                )}
              >
                <View className="w-9 items-center">
                  {game.isFinished && game.rank === 1 ? (
                    <Icon as={Trophy} size={20} className="text-amber-500" />
                  ) : (
                    <Text className="text-sm font-semibold">
                      {ordinal(game.rank)}
                    </Text>
                  )}
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-medium" numberOfLines={1}>
                    {game.name}
                  </Text>
                  <Text
                    className="text-xs text-muted-foreground"
                    numberOfLines={1}
                  >
                    {formatDate(game.createdAt)} · {formatLabel(game.format)} ·{" "}
                    {ordinal(game.rank)} of {game.playerCount}
                    {game.isFinished ? "" : " so far"} · {game.total} p
                  </Text>
                </View>
                <Text
                  className={cn("text-sm", changeClass(game.ratingChange))}
                  style={tabular}
                >
                  {signed(game.ratingChange)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>
      </ScrollView>
    </>
  );
}

function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-baseline justify-between">
        <Text className="font-semibold">{title}</Text>
        {aside && (
          <Text className="text-xs text-muted-foreground">{aside}</Text>
        )}
      </View>
      {children}
    </View>
  );
}

function StatTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <View className="min-w-[45%] flex-1 rounded-xl border border-border bg-card px-4 py-3">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="mt-0.5 text-2xl font-semibold">{value}</Text>
      {detail && (
        <Text className="mt-0.5 text-xs text-muted-foreground">{detail}</Text>
      )}
    </View>
  );
}

const outcomeStyles: Record<
  PadelMatchOutcome,
  { label: string; box: string; text: string }
> = {
  W: {
    label: "Won",
    box: "bg-green-600 dark:bg-green-500",
    text: "text-white dark:text-green-950",
  },
  D: { label: "Draw", box: "bg-muted", text: "text-muted-foreground" },
  L: {
    label: "Lost",
    box: "bg-red-600 dark:bg-red-500",
    text: "text-white dark:text-red-950",
  },
};

function FormBadge({ outcome }: { outcome: PadelMatchOutcome }) {
  const style = outcomeStyles[outcome];
  return (
    <View
      accessibilityLabel={style.label}
      className={cn("h-8 w-8 items-center justify-center rounded-md", style.box)}
    >
      <Text className={cn("text-xs font-semibold", style.text)}>{outcome}</Text>
    </View>
  );
}

function Highlight({
  label,
  relation,
  detail,
}: {
  label: string;
  relation: PadelPlayerRelation;
  detail: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => openPlayer(relation.key)}
      className="flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 active:bg-accent"
    >
      <View className="min-w-0 flex-1">
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <Text className="font-semibold" numberOfLines={1}>
          {relation.name}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {pointShare(relation)} of the points {detail} · {relation.matches}{" "}
          matches
        </Text>
      </View>
      <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}

function RelationList({
  title,
  relations,
}: {
  title: string;
  relations: PadelPlayerRelation[];
}) {
  return (
    <Section title={title} aside="Matches · W-D-L · +/- per match">
      {relations.length === 0 ? (
        <Text className="text-sm text-muted-foreground">Nobody yet.</Text>
      ) : (
        <View className="overflow-hidden rounded-xl border border-border bg-card">
          {relations.map((relation, index) => (
            <Pressable
              key={relation.key}
              accessibilityRole="button"
              onPress={() => openPlayer(relation.key)}
              className={cn(
                "flex-row items-center gap-3 px-4 py-2.5 active:bg-accent",
                index > 0 && "border-t border-border",
              )}
            >
              <Text className="flex-1 text-sm font-medium" numberOfLines={1}>
                {relation.name}
              </Text>
              <Text
                className="w-7 text-right text-sm text-muted-foreground"
                style={tabular}
              >
                {relation.matches}
              </Text>
              <Text
                className="w-16 text-right text-sm text-muted-foreground"
                style={tabular}
              >
                {relation.wins}-{relation.draws}-{relation.losses}
              </Text>
              <Text className="w-12 text-right text-sm" style={tabular}>
                {differencePerMatch(relation)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </Section>
  );
}

function VideoStats({ video }: { video: PadelPlayerVideoStats }) {
  const longest = video.longestRallyWon;
  return (
    <Section
      title="From the videos"
      aside={`${video.matches} filmed ${video.matches === 1 ? "match" : "matches"}`}
    >
      <View className="gap-3">
        <View className="flex-row flex-wrap gap-3">
          <StatTile
            label="Rallies"
            value={String(video.rallies)}
            detail={`${formatPlayTime(video.playTime)} in play`}
          />
          <StatTile
            label="Average rally"
            value={formatRallyLength(video.averageRally)}
            detail={
              video.longestRally
                ? `Longest ${formatRallyLength(video.longestRally.duration)}`
                : undefined
            }
          />
          <StatTile
            label="Long rallies won"
            value={percent(video.longWon, video.longDecided)}
            detail={`${formatRallyLength(LONG_RALLY_SECONDS)} or more`}
          />
          <StatTile
            label="Quick points won"
            value={percent(video.shortWon, video.shortDecided)}
            detail={`Under ${formatRallyLength(SHORT_RALLY_SECONDS)}`}
          />
        </View>
        <Text className="text-xs text-muted-foreground">
          Who won is known for {video.decided} of the {video.rallies} rallies.
        </Text>
        {longest && (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/padel/[gameId]/videos/[recordingId]",
                params: {
                  gameId: longest.gameId,
                  recordingId: longest.recordingId,
                  rallyId: longest.rallyId,
                },
              })
            }
            className="flex-row items-center justify-between rounded-xl border border-border bg-card px-4 py-3 active:bg-accent"
          >
            <Text className="text-sm">
              Watch the longest rally won ({formatRallyLength(longest.duration)})
            </Text>
            <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
          </Pressable>
        )}
      </View>
    </Section>
  );
}
