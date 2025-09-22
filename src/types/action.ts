import { z } from "zod";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type ActionReturn<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

export const UpdateCurrencySchema = z.object({
  smartReceiptId: z.string(),
  currencyCode: z.string().min(3).max(3),
  totalPrice: z.coerce.number().min(0).optional(),
});

export const UpdateSmartReceiptPermissionsSchema = z.object({
  smartReceiptId: z.string(),
  allowedPaymentEditors: z.enum(["OWNER", "AUTHENTICATED_USERS", "GUESTS", "ANYONE"]),
});

export const CalculateSumSchema = z.object({
  currencyToConvertTo: z.string().min(3).max(3),
  currencyToConvertFrom: z.string().min(3).max(3),
  amount: z.coerce.number().min(0),
});

export const UpdateSmartReceiptItemGroupSchema = z.object({
  description: z.string().optional(),
  quantity: z.coerce.number().min(0).optional(),
  price: z.coerce.number().min(0).optional(),
});

export const CreateSmartReceiptInviteLinkSchema = z.object({
  smartReceiptId: z.string(),
  expirationTime: z.enum([
    "ONE_HOUR",
    "ONE_DAY",
    "SEVEN_DAYS",
    "THIRTY_DAYS",
    "NEVER",
  ]),
});
