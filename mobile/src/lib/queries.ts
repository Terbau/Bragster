import {
  keepPreviousData,
  type QueryKey,
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, getErrorMessage } from "./api";
import type { toEditPayload } from "./receipt-draft";
import { toast } from "./toast";
import type {
  AllowedPaymentEditor,
  GuestNameValidity,
  InviteLinkExpiration,
  PadelFormat,
  PadelGame,
  PadelMatchRating,
  PadelPlayerProfile,
  PadelPlayerSummary,
  PadelSpaceDetails,
  PadelSpaceSummary,
  PreviousPadelPlayer,
  ReceiptDetailResponse,
  ReceiptsResponse,
  SmartReceiptDetailResponse,
  SmartReceiptWithUsers,
  User,
} from "./types";

export const queryKeys = {
  receipts: ["receipts"] as const,
  receipt: (receiptId: string) => ["receipt", receiptId] as const,
  smartReceipt: (smartReceiptId: string) =>
    ["smart-receipt", smartReceiptId] as const,
  smartReceipts: ["smart-receipts"] as const,
  padelSpaces: ["padel-spaces"] as const,
  padelSpace: (spaceId: string) => ["padel-space", spaceId] as const,
  /** Without a space, every space's games */
  padelGames: (spaceId?: string) =>
    spaceId ? (["padel-games", spaceId] as const) : (["padel-games"] as const),
  padelGame: (gameId: string) => ["padel-game", gameId] as const,
  /** Without a space, every space's players */
  padelPlayers: (spaceId?: string) =>
    spaceId
      ? (["padel-players", spaceId] as const)
      : (["padel-players"] as const),
  /** Ratings change with every score, so they all start with this */
  padelStats: ["padel-stats"] as const,
  padelSpaceStats: (spaceId: string) => ["padel-stats", spaceId] as const,
  padelPlayer: (spaceId: string, key: string) =>
    ["padel-stats", spaceId, key] as const,
  padelPlayersShare: (spaceId: string) =>
    ["padel-players-share", spaceId] as const,
};

// Queries

export const useReceipts = () =>
  useQuery({
    queryKey: queryKeys.receipts,
    queryFn: () => api<ReceiptsResponse>("/api/mobile/receipts"),
  });

export const useReceipt = (receiptId: string) =>
  useQuery({
    queryKey: queryKeys.receipt(receiptId),
    queryFn: () =>
      api<ReceiptDetailResponse>(`/api/mobile/receipts/${receiptId}`),
  });

export const useSmartReceipt = (
  smartReceiptId: string,
  { pollWhileTranslating = false } = {},
) =>
  useQuery({
    queryKey: queryKeys.smartReceipt(smartReceiptId),
    queryFn: () =>
      api<SmartReceiptDetailResponse>(
        `/api/mobile/smart-receipts/${smartReceiptId}`,
      ),
    // Translations are created in the background after a scan
    refetchInterval: (query) =>
      pollWhileTranslating && query.state.data?.isTranslating ? 3000 : false,
  });

/** All smart receipts the signed in user takes part in */
export const useMySmartReceipts = () =>
  useQuery({
    queryKey: queryKeys.smartReceipts,
    queryFn: () => api<SmartReceiptWithUsers[]>("/api/mobile/smart-receipts"),
  });

export const useUserSearch = (query: string) =>
  useQuery({
    queryKey: ["user-search", query],
    queryFn: () =>
      api<User[]>("/api/mobile/users/search", { query: { q: query } }),
    enabled: query.length > 2,
  });

export const useGuestNameValidity = (smartReceiptId: string, name: string) =>
  useQuery({
    queryKey: ["guest-name", smartReceiptId, name],
    queryFn: () =>
      api<GuestNameValidity>(
        `/api/mobile/smart-receipts/${smartReceiptId}/guests`,
        {
          query: { name },
        },
      ),
    enabled: name.trim().length >= 2,
  });

export const useInviteLink = (token: string | undefined) =>
  useQuery({
    queryKey: ["invite-link", token],
    queryFn: () =>
      api<{ valid: boolean; reason?: string; smartReceiptId?: string }>(
        `/api/mobile/invite-links/${token}`,
      ),
    enabled: !!token,
  });

// Mutations

/** Refreshes everything that shows data from this smart receipt */
const useInvalidateSmartReceipt = (smartReceiptId: string) => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.smartReceipt(smartReceiptId),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts }),
      queryClient.invalidateQueries({ queryKey: queryKeys.smartReceipts }),
      queryClient.invalidateQueries({ queryKey: ["receipt"] }),
    ]);
};

function useSmartReceiptMutation<TVariables, TResult>(
  smartReceiptId: string,
  mutationFn: (variables: TVariables) => Promise<TResult>,
  successMessage?: string | ((variables: TVariables) => string),
) {
  const invalidate = useInvalidateSmartReceipt(smartReceiptId);
  return useMutation({
    mutationFn,
    onSuccess: async (_result, variables) => {
      await invalidate();
      if (successMessage) {
        toast.success(
          typeof successMessage === "function"
            ? successMessage(variables)
            : successMessage,
        );
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

const smartReceiptPath = (smartReceiptId: string, path = "") =>
  `/api/mobile/smart-receipts/${smartReceiptId}${path}`;

interface PaymentVariables {
  itemId: string;
  userIds: string[];
  guestIds: string[];
}

const paymentsMutationKey = (smartReceiptId: string): QueryKey => [
  "payments",
  smartReceiptId,
];

/** Assigns users/guests to an item, updating the UI optimistically */
export function useUpdatePayments(smartReceiptId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.smartReceipt(smartReceiptId);

  return useMutation({
    mutationKey: paymentsMutationKey(smartReceiptId),
    mutationFn: ({ itemId, userIds, guestIds }: PaymentVariables) =>
      api(smartReceiptPath(smartReceiptId, `/items/${itemId}/payments`), {
        method: "PUT",
        body: { userIds, guestIds },
      }),
    onMutate: async ({ itemId, userIds, guestIds }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous =
        queryClient.getQueryData<SmartReceiptDetailResponse>(key);

      if (previous) {
        const smartReceipt = previous.smartReceipt;
        queryClient.setQueryData<SmartReceiptDetailResponse>(key, {
          ...previous,
          smartReceipt: {
            ...smartReceipt,
            payments: [
              ...smartReceipt.payments.filter(
                (p) => p.receiptItemId !== itemId,
              ),
              ...smartReceipt.users
                .filter((user) => userIds.includes(user.id))
                .map((user) => ({
                  id: `optimistic-${itemId}-${user.id}`,
                  userId: user.id,
                  smartReceiptId,
                  receiptItemId: itemId,
                  user,
                })),
            ],
            guestPayments: [
              ...smartReceipt.guestPayments.filter(
                (p) => p.receiptItemId !== itemId,
              ),
              ...smartReceipt.guests
                .filter((guest) => guestIds.includes(guest.id))
                .map((guest) => ({
                  id: `optimistic-${itemId}-${guest.id}`,
                  guestId: guest.id,
                  smartReceiptId,
                  receiptItemId: itemId,
                  guest,
                })),
            ],
          },
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
      toast.error("Failed to update payment");
    },
    onSettled: () => {
      // Avoid overwriting optimistic updates of other assignments in flight
      if (
        queryClient.isMutating({
          mutationKey: paymentsMutationKey(smartReceiptId),
        }) <= 1
      ) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}

/** Ids of items whose assignment is being saved */
export const usePendingPaymentItemIds = (smartReceiptId: string) =>
  useMutationState({
    filters: {
      mutationKey: paymentsMutationKey(smartReceiptId),
      status: "pending",
    },
    select: (mutation) => (mutation.state.variables as PaymentVariables).itemId,
  });

export const useUpdateCurrency = (smartReceiptId: string) =>
  useSmartReceiptMutation(
    smartReceiptId,
    (body: { currencyCode: string; totalPrice?: number }) =>
      api(smartReceiptPath(smartReceiptId, "/currency"), {
        method: "PUT",
        body,
      }),
    "Currency updated",
  );

export const useResetTotalPrice = (smartReceiptId: string) =>
  useSmartReceiptMutation(
    smartReceiptId,
    () =>
      api(smartReceiptPath(smartReceiptId, "/total-price"), {
        method: "DELETE",
      }),
    "Total sum reset",
  );

export const useUpdatePermissions = (smartReceiptId: string) =>
  useSmartReceiptMutation(
    smartReceiptId,
    (allowedPaymentEditors: AllowedPaymentEditor) =>
      api(smartReceiptPath(smartReceiptId, "/permissions"), {
        method: "PUT",
        body: { allowedPaymentEditors },
      }),
    "Permissions updated",
  );

export const useAddUser = (smartReceiptId: string) =>
  useSmartReceiptMutation(
    smartReceiptId,
    (userId: string) =>
      api(smartReceiptPath(smartReceiptId, "/users"), {
        method: "POST",
        body: { userId },
      }),
    "User added",
  );

export const useRemoveUser = (smartReceiptId: string) =>
  useSmartReceiptMutation(
    smartReceiptId,
    (userId: string) =>
      api(smartReceiptPath(smartReceiptId, `/users/${userId}`), {
        method: "DELETE",
      }),
    "User removed",
  );

export const useAddGuest = (smartReceiptId: string) => {
  const queryClient = useQueryClient();
  const mutation = useSmartReceiptMutation(
    smartReceiptId,
    (name: string) =>
      api(smartReceiptPath(smartReceiptId, "/guests"), {
        method: "POST",
        body: { name },
      }),
    "Guest added",
  );
  return {
    ...mutation,
    mutate: (name: string, options?: { onSuccess?: () => void }) =>
      mutation.mutate(name, {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: ["guest-name", smartReceiptId],
          });
          options?.onSuccess?.();
        },
      }),
  };
};

export const useRemoveGuest = (smartReceiptId: string) =>
  useSmartReceiptMutation(
    smartReceiptId,
    (guestId: string) =>
      api(smartReceiptPath(smartReceiptId, `/guests/${guestId}`), {
        method: "DELETE",
      }),
    "Guest removed",
  );

export const useAddParticipants = (smartReceiptId: string) =>
  useSmartReceiptMutation(
    smartReceiptId,
    (body: { userIds: string[]; guestNames: string[] }) =>
      api(smartReceiptPath(smartReceiptId, "/participants"), {
        method: "POST",
        body,
      }),
    "Users and guests added successfully",
  );

export const useCreateInviteLink = (smartReceiptId: string) =>
  useMutation({
    mutationFn: (expirationTime: InviteLinkExpiration) =>
      api<{ token: string; url: string }>(
        smartReceiptPath(smartReceiptId, "/invite-links"),
        { method: "POST", body: { expirationTime } },
      ),
    onError: (error) => toast.error(getErrorMessage(error)),
  });

export const useJoinWithInviteLink = (smartReceiptId: string) =>
  useSmartReceiptMutation(
    smartReceiptId,
    (token: string) =>
      api(`/api/mobile/invite-links/${token}`, { method: "POST" }),
    "You have joined the smart receipt",
  );

export const useConvertCurrency = () =>
  useMutation({
    mutationFn: (body: { from: string; to: string; amount: number }) =>
      api<{ currencyCode: string; amount: number }>(
        "/api/mobile/currency/convert",
        {
          method: "POST",
          body,
        },
      ),
    onError: (error) => toast.error(getErrorMessage(error)),
  });

export function useCreateSmartReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (receiptId: string) =>
      api<SmartReceiptWithUsers>(
        `/api/mobile/receipts/${receiptId}/smart-receipts`,
        {
          method: "POST",
        },
      ),
    onSuccess: (_result, receiptId) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.receipt(receiptId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.receipts }),
      ]),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Saves edit mode: the complete receipt at once */
export function useEditReceipt(receiptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReturnType<typeof toEditPayload>) =>
      api(`/api/mobile/receipts/${receiptId}`, { method: "PUT", body }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.receipt(receiptId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.receipts }),
        queryClient.invalidateQueries({ queryKey: ["smart-receipt"] }),
      ]);
      toast.success("Receipt updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// Padel spaces

const spacePath = (spaceId: string, path = "") =>
  `/api/mobile/padel/spaces/${spaceId}${path}`;

/** The spaces the user owns, hosts or plays in, the most recently used first */
export const usePadelSpaces = () =>
  useQuery({
    queryKey: queryKeys.padelSpaces,
    queryFn: () => api<PadelSpaceSummary[]>("/api/mobile/padel/spaces"),
  });

export const usePadelSpace = (spaceId: string) =>
  useQuery({
    queryKey: queryKeys.padelSpace(spaceId),
    queryFn: () => api<PadelSpaceDetails>(spacePath(spaceId)),
  });

export function useCreatePadelSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      api<{ id: string }>("/api/mobile/padel/spaces", {
        method: "POST",
        body: { name },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.padelSpaces }),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Saves a change to the space, and shows the space it returns */
function useSpaceMutation<TVariables>(
  spaceId: string,
  mutationFn: (variables: TVariables) => Promise<PadelSpaceDetails>,
  successMessage?: (variables: TVariables) => string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (space, variables) => {
      queryClient.setQueryData(queryKeys.padelSpace(spaceId), space);
      void queryClient.invalidateQueries({ queryKey: queryKeys.padelSpaces });
      if (successMessage) toast.success(successMessage(variables));
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export const useRenamePadelSpace = (spaceId: string) =>
  useSpaceMutation(
    spaceId,
    (name: string) =>
      api<PadelSpaceDetails>(spacePath(spaceId), {
        method: "PATCH",
        body: { name },
      }),
    () => "Space renamed",
  );

export const useAddPadelHost = (spaceId: string) =>
  useSpaceMutation(
    spaceId,
    (user: { id: string; email: string }) =>
      api<PadelSpaceDetails>(spacePath(spaceId, "/hosts"), {
        method: "POST",
        body: { userId: user.id },
      }),
    (user) => `${user.email} can now host games`,
  );

export const useRemovePadelHost = (spaceId: string) =>
  useSpaceMutation(
    spaceId,
    (user: { id: string; email: string }) =>
      api<PadelSpaceDetails>(spacePath(spaceId, `/hosts/${user.id}`), {
        method: "DELETE",
      }),
    (user) => `${user.email} no longer hosts games`,
  );

export const useLinkPadelPlayer = (spaceId: string) =>
  useSpaceMutation(
    spaceId,
    ({ name, user }: { name: string; user: { id: string; email: string } }) =>
      api<PadelSpaceDetails>(spacePath(spaceId, "/links"), {
        method: "POST",
        body: { name, userId: user.id },
      }),
    ({ name, user }) => `${name} is linked to ${user.email}`,
  );

export const useUnlinkPadelPlayer = (spaceId: string) =>
  useSpaceMutation(
    spaceId,
    (link: { key: string; name: string }) =>
      api<PadelSpaceDetails>(
        spacePath(spaceId, `/links/${encodeURIComponent(link.key)}`),
        {
          method: "DELETE",
        },
      ),
    (link) => `${link.name} is no longer linked`,
  );

/** Deletes the space as the owner, or leaves it as anyone else */
export function useRemovePadelSpace(
  spaceId: string,
  action: "delete" | "leave",
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      action === "delete"
        ? api(spacePath(spaceId), { method: "DELETE" })
        : api(spacePath(spaceId, "/leave"), { method: "POST" }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.padelSpace(spaceId) });
      queryClient.removeQueries({ queryKey: queryKeys.padelGames(spaceId) });
      return queryClient.invalidateQueries({ queryKey: queryKeys.padelSpaces });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// Padel games

const padelPath = (gameId: string, path = "") =>
  `/api/mobile/padel/games/${gameId}${path}`;

/** The space's games, the newest first */
export const usePadelGames = (spaceId: string) =>
  useQuery({
    queryKey: queryKeys.padelGames(spaceId),
    queryFn: () => api<PadelGame[]>(spacePath(spaceId, "/games")),
  });

export const usePadelGame = (gameId: string) => {
  const queryClient = useQueryClient();
  /** The game from a list of games, which has everything but the role */
  const fromList = () => {
    for (const [key, games] of queryClient.getQueriesData<PadelGame[]>({
      queryKey: queryKeys.padelGames(),
    })) {
      const game = games?.find((g) => g.id === gameId);
      if (game)
        return {
          game,
          updatedAt: queryClient.getQueryState(key)?.dataUpdatedAt,
        };
    }
    return undefined;
  };
  return useQuery({
    queryKey: queryKeys.padelGame(gameId),
    queryFn: () => api<PadelGame>(padelPath(gameId)),
    // The list has the complete games, so a game opens instantly
    initialData: () => {
      const found = fromList();
      const role = found
        ? queryClient
            .getQueryData<PadelSpaceSummary[]>(queryKeys.padelSpaces)
            ?.find((space) => space.id === found.game.spaceId)?.role
        : undefined;
      return found && role ? { ...found.game, role } : undefined;
    },
    initialDataUpdatedAt: () => fromList()?.updatedAt,
  });
};

/**
 * The ratings in every played match of the game, by match id. Refetched
 * whenever the game changes, and with the other stats.
 */
export const usePadelMatchRatings = (
  game: Pick<PadelGame, "id" | "updatedAt">,
) =>
  useQuery({
    queryKey: [
      ...queryKeys.padelStats,
      "match-ratings",
      game.id,
      game.updatedAt,
    ],
    queryFn: () =>
      api<Record<string, PadelMatchRating>>(padelPath(game.id, "/ratings")),
    placeholderData: keepPreviousData,
  });

/** Everyone who has played in the space, the most recent first */
export const usePreviousPadelPlayers = (spaceId: string) =>
  useQuery({
    queryKey: queryKeys.padelPlayers(spaceId),
    queryFn: () => api<PreviousPadelPlayer[]>(spacePath(spaceId, "/players")),
  });

/** Everyone who has played in the space, highest rating first */
export const usePadelPlayerSummaries = (spaceId: string) =>
  useQuery({
    queryKey: queryKeys.padelSpaceStats(spaceId),
    queryFn: () => api<PadelPlayerSummary[]>(spacePath(spaceId, "/stats")),
  });

/** The live link to the players list, `shareToken` is null when it's off */
export const usePadelPlayersSharing = (spaceId: string) =>
  useQuery({
    queryKey: queryKeys.padelPlayersShare(spaceId),
    queryFn: () =>
      api<{ shareToken: string | null }>(spacePath(spaceId, "/share")),
  });

/** Turns the live link to the players list on or off */
export function useSetPadelPlayersSharing(spaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isShared: boolean) =>
      api<{ shareToken: string | null }>(spacePath(spaceId, "/share"), {
        method: "PUT",
        body: { isShared },
      }),
    onSuccess: (sharing) =>
      queryClient.setQueryData(queryKeys.padelPlayersShare(spaceId), sharing),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** `key` is the player's name in lower case */
export const usePadelPlayerProfile = (spaceId: string, key: string) =>
  useQuery({
    queryKey: queryKeys.padelPlayer(spaceId, key),
    queryFn: () =>
      api<PadelPlayerProfile>(
        spacePath(spaceId, `/stats/${encodeURIComponent(key)}`),
      ),
  });

export interface CreatePadelGameBody {
  name: string;
  format: PadelFormat;
  playerNames: string[];
  courts: number;
  courtNames: string[];
  pointsPerMatch: number;
  /** Mexicano only */
  plannedRounds?: number;
  /** Players who sit out the extra round, see `padelExtraSitOuts` */
  sitOutMore?: string[];
}

export function useCreatePadelGame(spaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePadelGameBody) =>
      api<{ id: string }>(spacePath(spaceId, "/games"), {
        method: "POST",
        body,
      }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.padelGames(spaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.padelPlayers(spaceId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.padelSpaces }),
      ]),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

interface PadelScoreVariables {
  matchId: string;
  team1Score: number | null;
  team2Score: number | null;
}

const padelScoreMutationKey = (gameId: string): QueryKey => [
  "padel-score",
  gameId,
];

/** Saves a match score, updating the UI optimistically */
export function useUpdatePadelScore(gameId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.padelGame(gameId);

  return useMutation({
    mutationKey: padelScoreMutationKey(gameId),
    mutationFn: ({ matchId, team1Score, team2Score }: PadelScoreVariables) =>
      api(padelPath(gameId, `/matches/${matchId}`), {
        method: "PUT",
        body: { team1Score, team2Score },
      }),
    onMutate: async ({ matchId, team1Score, team2Score }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PadelGame>(key);
      if (previous) {
        queryClient.setQueryData<PadelGame>(key, {
          ...previous,
          rounds: previous.rounds.map((round) => ({
            ...round,
            matches: round.matches.map((match) =>
              match.id === matchId
                ? { ...match, team1Score, team2Score }
                : match,
            ),
          })),
        });
      }
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
      toast.error(getErrorMessage(error));
    },
    onSettled: () => {
      // Avoid overwriting optimistic updates of other scores in flight
      if (
        queryClient.isMutating({
          mutationKey: padelScoreMutationKey(gameId),
        }) <= 1
      ) {
        void queryClient.invalidateQueries({ queryKey: key });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.padelGames(),
        });
        void queryClient.invalidateQueries({ queryKey: queryKeys.padelStats });
      }
    },
  });
}

export function useReorderPadelRounds(gameId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roundIds: string[]) =>
      api<PadelGame>(padelPath(gameId, "/rounds"), {
        method: "PUT",
        body: { roundIds },
      }),
    onSuccess: (game) => {
      queryClient.setQueryData(queryKeys.padelGame(gameId), game);
      void queryClient.invalidateQueries({ queryKey: queryKeys.padelGames() });
      toast.success("Order of rounds saved");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Plays everyone with everyone again, once every match has been played */
export function useAddPadelSeries(gameId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<PadelGame>(padelPath(gameId, "/series"), { method: "POST" }),
    onSuccess: (game) => {
      queryClient.setQueryData(queryKeys.padelGame(gameId), game);
      void queryClient.invalidateQueries({ queryKey: queryKeys.padelGames() });
      toast.success("New series started");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/**
 * Ends the round being played. Its matches without a score aren't played, and
 * their players get their average for them.
 */
export function useEndPadelRound(gameId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roundId: string) =>
      api<PadelGame>(padelPath(gameId, `/rounds/${roundId}/end`), {
        method: "POST",
      }),
    onSuccess: (game) => {
      queryClient.setQueryData(queryKeys.padelGame(gameId), game);
      void queryClient.invalidateQueries({ queryKey: queryKeys.padelGames() });
      toast.success("Round ended");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Ends the series being played (a Mexicano: the game) early */
export function useEndPadelSeries(gameId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<PadelGame>(padelPath(gameId, "/series/end"), { method: "POST" }),
    onSuccess: (game) => {
      queryClient.setQueryData(queryKeys.padelGame(gameId), game);
      void queryClient.invalidateQueries({ queryKey: queryKeys.padelGames() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.padelStats });
      toast.success(game.format === "MEXICANO" ? "Game ended" : "Series ended");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Removes the series being played, when none of it has been played */
export function useRemovePadelSeries(gameId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<PadelGame>(padelPath(gameId, "/series"), { method: "DELETE" }),
    onSuccess: (game) => {
      queryClient.setQueryData(queryKeys.padelGame(gameId), game);
      void queryClient.invalidateQueries({ queryKey: queryKeys.padelGames() });
      toast.success("Series removed");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export interface UpdatePadelGameBody {
  name?: string;
  /** New names for players, by id */
  players?: { id: string; name: string }[];
  courtNames?: string[];
  /** Mexicano only */
  plannedRounds?: number;
}

/** Renames the game or players, names the courts or changes Mexicano rounds */
export function useUpdatePadelGame(gameId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePadelGameBody) =>
      api<PadelGame>(padelPath(gameId), { method: "PATCH", body }),
    onSuccess: (game) => {
      queryClient.setQueryData(queryKeys.padelGame(gameId), game);
      void queryClient.invalidateQueries({ queryKey: queryKeys.padelGames() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.padelPlayers(),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.padelStats });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Turns the live link on or off */
export function useSetPadelSharing(gameId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isShared: boolean) =>
      api<PadelGame>(padelPath(gameId, "/share"), {
        method: "PUT",
        body: { isShared },
      }),
    onSuccess: (game) => {
      queryClient.setQueryData(queryKeys.padelGame(gameId), game);
      void queryClient.invalidateQueries({ queryKey: queryKeys.padelGames() });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeletePadelGame(gameId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api(padelPath(gameId), { method: "DELETE" }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.padelGame(gameId) });
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.padelGames() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.padelPlayers() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.padelStats }),
        queryClient.invalidateQueries({ queryKey: queryKeys.padelSpaces }),
      ]);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
