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

const ReceiptSupplementEditSchema = z.object({
  description: z.string().trim().min(1).max(200),
  price: z.number().finite(),
});

export const ReceiptItemGroupEditSchema = z.object({
  /** Missing for items added while editing */
  id: z.string().optional(),
  description: z.string().trim().min(1).max(200),
  /** Price of the whole line. May be negative for discounts and corrections. */
  price: z.number().finite(),
  quantity: z.number().finite().positive().max(10000),
  quantityUnit: z.string().trim().max(20).nullable(),
  /** Supplements (e.g. bottle deposit) added to each unit */
  supplements: z.array(ReceiptSupplementEditSchema).max(10),
});

/** The complete, edited receipt. Item groups that are left out are removed. */
export const EditReceiptSchema = z
  .object({
    merchantName: z.string().trim().min(1).max(200),
    receiptDate: z.coerce.date().nullable(),
    totalPrice: z.number().finite().min(0),
    currencyCode: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .nullable(),
    itemGroups: z.array(ReceiptItemGroupEditSchema).max(500),
  })
  .superRefine((receipt, ctx) => {
    const ids = receipt.itemGroups.flatMap((group) => (group.id ? [group.id] : []));
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Duplicate items" });
    }
    for (const group of receipt.itemGroups) {
      // Whole quantities become one assignable unit each
      if (Number.isInteger(group.quantity) && group.quantity > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Quantity can be at most 100",
        });
      }
    }
  });
