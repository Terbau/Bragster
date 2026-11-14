import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeftRight, ChevronRight } from "lucide-react-native";
import { type ReactNode, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { RatingComparisonChart } from "@/components/padel/RatingComparisonChart";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { formatDate } from "@/lib/format";
import {
  differencePerMatch,
  getRatingPoints,
  isMatchPlayed,
  isMatchSkipped,
  ordinal,
  percent,
  playerKey,
  pointShare,
} from "@/lib/padel";
import {
  usePadelGames,
  usePadelPlayerProfile,
  usePadelPlayerSummaries,
} from "@/lib/queries";
import type { PadelGame, PadelPlayerProfile, PadelRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

const tabular = { fontVariant: ["tabular-nums" as const] };

/** The two players' colors, the same in light and dark mode */
const COLORS = { a: "#6366f1", b: "#f97316" };

type Slot = "a" | "b";

/**
 * Two players side by side: against each other, together, their stats and
 * their ratings over time. `a` and `b` are the players' keys, a missing one
 * is picked first.
 */
export default function ComparePlayersScreen() {
  const { spaceId, a, b } = useLocalSearchParams<{
    spaceId: string;
    a?: string;
    b?: string;
  }>();
  const [picking, setPicking] = useState<Slot | null>(null);
  const slot = picking ?? (!a ? "a" : !b ? "b" : null);

  return (
    <>
      <Stack.Screen options={{ title: "Compare" }} />
      {slot || !a || !b ? (
        <PlayerPicker
          spaceId={spaceId}
          exclude={slot === "a" ? b : a}
          onPick={(key) => {
            router.setParams({ [slot ?? "b"]: key });
            setPicking(null);
          }}
        />
      ) : (
        <Comparison spaceId={spaceId} a={a} b={b} onChange={setPicking} />
      )}
    </>
  );
}

function PlayerPicker({
  spaceId,
  exclude,
  onPick,
}: {
  spaceId: string;
  exclude: string | undefined;
  onPick: (key: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { data, error, isPending, refetch } = usePadelPlayerSummaries(spaceId);

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  const players = data.filter((player) => player.key !== exclude);
  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerClassName="p-5"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      data={players}
      keyExtractor={(player) => player.key}
      ListHeaderComponent={
        <Text className="pb-3 text-sm text-muted-foreground">
          Who do you want to compare with?
        </Text>
      }
      ListEmptyComponent={
        <Text className="text-sm text-muted-foreground">
          Nobody else has played in this space yet.
        </Text>
      }
      renderItem={({ item, index }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() => onPick(item.key)}
          className={cn(
            "flex-row items-center gap-3 border-x border-border bg-card px-4 py-3 active:bg-accent",
            index === 0 && "rounded-t-xl border-t",
            index === players.length - 1 && "rounded-b-xl border-b",
            index > 0 && "border-t",
          )}
        >
          <Text className="flex-1 font-medium" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-sm text-muted-foreground" style={tabular}>
            {item.rating} · {item.games} {item.games === 1 ? "game" : "games"}
          </Text>
          <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
        </Pressable>
      )}
    />
  );
}

/** A match the two played against each other, from `a`'s side */
interface Meeting {
  id: string;
  game: PadelGame;
  aTeam: string[];
  bTeam: string[];
  aScore: number;
  bScore: number;
}

/** The matches the two played against each other, the newest first */
const getMeetings = (games: PadelGame[], a: string, b: string): Meeting[] =>
  games.flatMap((game) => {
    const keys = new Map(
      game.players.map((player) => [player.id, playerKey(player.name)]),
    );
    const names = new Map(
      game.players.map((player) => [player.id, player.name]),
    );
    const has = (team: string[], key: string) =>
      team.some((id) => keys.get(id) === key);
    return game.rounds
      .slice()
      .sort((x, y) => y.series - x.series || y.position - x.position)
      .flatMap((round) => round.matches)
      .flatMap((match) => {
        if (!isMatchPlayed(match) || isMatchSkipped(match)) return [];
        const aIsTeam1 = has(match.team1, a) && has(match.team2, b);
        const aIsTeam2 = has(match.team2, a) && has(match.team1, b);
        if (!aIsTeam1 && !aIsTeam2) return [];
        const teamNames = (team: string[]) =>
          team.map((id) => names.get(id) ?? "?");
        return [
          {
            id: match.id,
            game,
            aTeam: teamNames(aIsTeam1 ? match.team1 : match.team2),
            bTeam: teamNames(aIsTeam1 ? match.team2 : match.team1),
            aScore: (aIsTeam1 ? match.team1Score : match.team2Score) ?? 0,
            bScore: (aIsTeam1 ? match.team2Score : match.team1Score) ?? 0,
          },
        ];
      });
  });

const winShare = (record: PadelRecord) =>
  record.matches > 0 ? record.wins / record.matches : 0;
const pointsShare = (record: PadelRecord) =>
  record.pointsWon + record.pointsLost > 0
    ? record.pointsWon / (record.pointsWon + record.pointsLost)
    : 0;
const perMatch = (record: PadelRecord) =>
  record.matches > 0
    ? (record.pointsWon - record.pointsLost) / record.matches
    : 0;

function Comparison({
  spaceId,
  a,
  b,
  onChange,
}: {
  spaceId: string;
  a: string;
  b: string;
  onChange: (slot: Slot) => void;
}) {
  const insets = useSafeAreaInsets();
  const profileA = usePadelPlayerProfile(spaceId, a);
  const profileB = usePadelPlayerProfile(spaceId, b);
  const { data: games } = usePadelGames(spaceId);
  const meetings = useMemo(() => getMeetings(games ?? [], a, b), [games, a, b]);

  if (profileA.isPending || profileB.isPending) {
    return <Spinner className="flex-1" />;
  }
  const error = profileA.error ?? profileB.error;
  if (error || !profileA.data || !profileB.data) {
    return (
      <ErrorState
        error={error}
        onRetry={() => {
          void profileA.refetch();
          void profileB.refetch();
        }}
      />
    );
  }
  const pa = profileA.data;
  const pb = profileB.data;
  const versus = pa.opponents.find((relation) => relation.key === pb.key);
  const together = pa.partners.find((relation) => relation.key === pb.key);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-8 p-5"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <View className="flex-row items-stretch gap-3">
        <PlayerHeader
          profile={pa}
          color={COLORS.a}
          onChange={() => onChange("a")}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Swap the players"
          hitSlop={8}
          onPress={() => router.setParams({ a: b, b: a })}
          className="self-center active:opacity-50"
        >
          <Icon
            as={ArrowLeftRight}
            size={18}
            className="text-muted-foreground"
          />
        </Pressable>
        <PlayerHeader
          profile={pb}
          color={COLORS.b}
          onChange={() => onChange("b")}
        />
      </View>

      <Section title="Against each other">
        {versus ? (
          <View className="gap-3 rounded-xl border border-border bg-card px-4 py-4">
            <View className="flex-row items-end justify-between">
              <Score
                value={versus.wins}
                label={`${pa.name} won`}
                color={COLORS.a}
              />
              <Score value={versus.draws} label="Draws" />
              <Score
                value={versus.losses}
                label={`${pb.name} won`}
                color={COLORS.b}
                alignEnd
              />
            </View>
            <ShareBar
              share={pointsShare(versus)}
              label={`${pa.name} won ${pointShare(versus)} of the points in ${versus.matches} ${versus.matches === 1 ? "match" : "matches"}`}
            />
          </View>
        ) : (
          <Text className="text-sm text-muted-foreground">
            {"They haven't played against each other yet."}
          </Text>
        )}
      </Section>

      <Section title="Together">
        {together ? (
          <View className="gap-1 rounded-xl border border-border bg-card px-4 py-4">
            <Text className="text-2xl font-semibold" style={tabular}>
              {percent(together.wins, together.matches)}{" "}
              <Text className="text-sm font-normal text-muted-foreground">
                of {together.matches}{" "}
                {together.matches === 1 ? "match" : "matches"} won
              </Text>
            </Text>
            <Text className="text-sm text-muted-foreground" style={tabular}>
              {together.wins}-{together.draws}-{together.losses} ·{" "}
              {pointShare(together)} of the points ·{" "}
              {differencePerMatch(together)} per match
            </Text>
            <Text className="mt-1 text-xs text-muted-foreground">
              On their own, {pa.name} wins {percent(pa.wins, pa.matches)} and{" "}
              {pb.name} {percent(pb.wins, pb.matches)} of their matches.
            </Text>
          </View>
        ) : (
          <Text className="text-sm text-muted-foreground">
            {"They haven't played together yet."}
          </Text>
        )}
      </Section>

      <Section title="Side by side">
        <View className="overflow-hidden rounded-xl border border-border bg-card">
          <StatRow
            isFirst
            label="Rating"
            a={String(pa.rating)}
            b={String(pb.rating)}
            better={pa.rating - pb.rating}
          />
          <StatRow
            label="Rank"
            a={ordinal(pa.ratingRank)}
            b={ordinal(pb.ratingRank)}
            better={pb.ratingRank - pa.ratingRank}
          />
          <StatRow label="Games" a={String(pa.games)} b={String(pb.games)} />
          <StatRow
            label="Games won"
            a={String(pa.gamesWon)}
            b={String(pb.gamesWon)}
            better={pa.gamesWon - pb.gamesWon}
          />
          <StatRow
            label="Matches won"
            a={percent(pa.wins, pa.matches)}
            b={percent(pb.wins, pb.matches)}
            better={winShare(pa) - winShare(pb)}
          />
          <StatRow
            label="Points won"
            a={pointShare(pa)}
            b={pointShare(pb)}
            better={pointsShare(pa) - pointsShare(pb)}
          />
          <StatRow
            label="+/- per match"
            a={differencePerMatch(pa)}
            b={differencePerMatch(pb)}
            better={perMatch(pa) - perMatch(pb)}
          />
          <StatRow
            label="Form"
            a={pa.form.slice(0, 5).join(" ") || "–"}
            b={pb.form.slice(0, 5).join(" ") || "–"}
          />
          <StatRow
            label="Best partner"
            a={pa.bestPartner?.name ?? "–"}
            b={pb.bestPartner?.name ?? "–"}
          />
        </View>
      </Section>

      <Section title="Rating over time">
        <RatingComparisonChart
          series={[
            { name: pa.name, color: COLORS.a, points: getRatingPoints(pa) },
            { name: pb.name, color: COLORS.b, points: getRatingPoints(pb) },
          ]}
        />
      </Section>

      {meetings.length > 0 && (
        <Section
          title="Matches against each other"
          aside={meetings.length > 10 ? "The latest 10" : undefined}
        >
          <View className="overflow-hidden rounded-xl border border-border bg-card">
            {meetings.slice(0, 10).map((meeting, index) => (
              <Pressable
                key={meeting.id}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/padel/[gameId]",
                    params: { gameId: meeting.game.id },
                  })
                }
                className={cn(
                  "flex-row items-center gap-3 px-4 py-2.5 active:bg-accent",
                  index > 0 && "border-t border-border",
                )}
              >
                <Outcome aScore={meeting.aScore} bScore={meeting.bScore} />
                <View className="min-w-0 flex-1">
                  <Text className="text-sm" numberOfLines={1}>
                    {meeting.aTeam.join(" & ")}{" "}
                    <Text className="text-sm font-semibold" style={tabular}>
                      {meeting.aScore}–{meeting.bScore}
                    </Text>{" "}
                    {meeting.bTeam.join(" & ")}
                  </Text>
                  <Text
                    className="text-xs text-muted-foreground"
                    numberOfLines={1}
                  >
                    {formatDate(meeting.game.createdAt)} · {meeting.game.name}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Section>
      )}
    </ScrollView>
  );
}

function PlayerHeader({
  profile,
  color,
  onChange,
}: {
  profile: PadelPlayerProfile;
  color: string;
  onChange: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Picks another player"
      onPress={onChange}
      className="flex-1 items-center gap-1 rounded-xl border border-border bg-card px-3 py-4 active:bg-accent"
      style={{ borderTopColor: color, borderTopWidth: 3 }}
    >
      <Text className="text-center font-semibold" numberOfLines={1}>
        {profile.name}
      </Text>
      <Text className="text-3xl font-semibold" style={tabular}>
        {profile.rating}
      </Text>
      <Text className="text-xs text-muted-foreground">
        {ordinal(profile.ratingRank)} of {profile.playerCount}
      </Text>
      <Text className="mt-1 text-xs font-medium" style={{ color }}>
        Change
      </Text>
    </Pressable>
  );
}

function Score({
  value,
  label,
  color,
  alignEnd = false,
}: {
  value: number;
  label: string;
  color?: string;
  alignEnd?: boolean;
}) {
  const align = color
    ? alignEnd
      ? "items-end"
      : "items-start"
    : "items-center";
  return (
    <View className={cn("min-w-0 flex-1", align)}>
      <Text
        className={cn("font-semibold", color ? "text-4xl" : "text-2xl")}
        style={[tabular, color ? { color } : undefined]}
      >
        {value}
      </Text>
      <Text className="text-xs text-muted-foreground" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** The share of the points, in the players' colors */
function ShareBar({ share, label }: { share: number; label: string }) {
  return (
    <View className="gap-1.5">
      <View className="h-2 flex-row overflow-hidden rounded-full">
        <View style={{ flex: share, backgroundColor: COLORS.a }} />
        <View style={{ flex: 1 - share, backgroundColor: COLORS.b }} />
      </View>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

/** `better` is positive when a's value is better, negative when b's is */
function StatRow({
  label,
  a,
  b,
  better = 0,
  isFirst = false,
}: {
  label: string;
  a: string;
  b: string;
  better?: number;
  isFirst?: boolean;
}) {
  return (
    <View
      className={cn(
        "flex-row items-center px-4 py-2.5",
        !isFirst && "border-t border-border",
      )}
    >
      <Text
        className={cn(
          "flex-1 text-sm",
          better > 0 ? "font-semibold" : "text-muted-foreground",
        )}
        style={[tabular, better > 0 ? { color: COLORS.a } : undefined]}
        numberOfLines={1}
      >
        {a}
      </Text>
      <Text className="flex-1 text-center text-xs text-muted-foreground">
        {label}
      </Text>
      <Text
        className={cn(
          "flex-1 text-right text-sm",
          better < 0 ? "font-semibold" : "text-muted-foreground",
        )}
        style={[tabular, better < 0 ? { color: COLORS.b } : undefined]}
        numberOfLines={1}
      >
        {b}
      </Text>
    </View>
  );
}

function Outcome({ aScore, bScore }: { aScore: number; bScore: number }) {
  const outcome = aScore > bScore ? "W" : aScore < bScore ? "L" : "D";
  return (
    <View
      className="h-7 w-7 items-center justify-center rounded-md"
      style={{
        backgroundColor:
          outcome === "W" ? COLORS.a : outcome === "L" ? COLORS.b : "#9ca3af",
      }}
      accessibilityLabel={
        outcome === "W" ? "Won" : outcome === "L" ? "Lost" : "Draw"
      }
    >
      <Text className="text-xs font-semibold text-white">{outcome}</Text>
    </View>
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
