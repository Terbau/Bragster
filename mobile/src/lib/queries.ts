import {
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
    queryFn: () => api<ReceiptDetailResponse>(`/api/mobile/receipts/${receiptId}`),
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
    queryFn: () => api<User[]>("/api/mobile/users/search", { query: { q: query } }),
    enabled: query.length > 2,
  });

export const useGuestNameValidity = (smartReceiptId: string, name: string) =>
  useQuery({
    queryKey: ["guest-name", smartReceiptId, name],
    queryFn: () =>
      api<GuestNameValidity>(`/api/mobile/smart-receipts/${smartReceiptId}/guests`, {
        query: { name },
      }),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.smartReceipt(smartReceiptId) }),
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
      const previous = queryClient.getQueryData<SmartReceiptDetailResponse>(key);

      if (previous) {
        const smartReceipt = previous.smartReceipt;
        queryClient.setQueryData<SmartReceiptDetailResponse>(key, {
          ...previous,
          smartReceipt: {
            ...smartReceipt,
            payments: [
              ...smartReceipt.payments.filter((p) => p.receiptItemId !== itemId),
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
        queryClient.isMutating({ mutationKey: paymentsMutationKey(smartReceiptId) }) <= 1
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
      api(smartReceiptPath(smartReceiptId, "/currency"), { method: "PUT", body }),
    "Currency updated",
  );

export const useResetTotalPrice = (smartReceiptId: string) =>
  useSmartReceiptMutation(
    smartReceiptId,
    () => api(smartReceiptPath(smartReceiptId, "/total-price"), { method: "DELETE" }),
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
      api(smartReceiptPath(smartReceiptId, `/users/${userId}`), { method: "DELETE" }),
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
          void queryClient.invalidateQueries({ queryKey: ["guest-name", smartReceiptId] });
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
    (token: string) => api(`/api/mobile/invite-links/${token}`, { method: "POST" }),
    "You have joined the smart receipt",
  );

export const useConvertCurrency = () =>
  useMutation({
    mutationFn: (body: { from: string; to: string; amount: number }) =>
      api<{ currencyCode: string; amount: number }>("/api/mobile/currency/convert", {
        method: "POST",
        body,
      }),
    onError: (error) => toast.error(getErrorMessage(error)),
  });

export function useCreateSmartReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (receiptId: string) =>
      api<SmartReceiptWithUsers>(`/api/mobile/receipts/${receiptId}/smart-receipts`, {
        method: "POST",
      }),
    onSuccess: (_result, receiptId) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.receipt(receiptId) }),
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
        queryClient.invalidateQueries({ queryKey: queryKeys.receipt(receiptId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.receipts }),
        queryClient.invalidateQueries({ queryKey: ["smart-receipt"] }),
      ]);
      toast.success("Receipt updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
