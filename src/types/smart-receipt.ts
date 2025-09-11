import { IMAGE_SCHEMA } from "@/utils/zodUtils";
import { z, type ZodType } from "zod";

export const ReceiptUploadSchema = z.object({
  file: IMAGE_SCHEMA,
});

export const BaseFieldSchema = z.object({
  kind: z.string(),
  content: z.string(),
  confidence: z.number(),
});

export type BaseField = z.infer<typeof BaseFieldSchema>;

export const CurrencyFieldSchema = BaseFieldSchema.extend({
  kind: z.literal("currency"),
  value: z.object({
    amount: z.number(),
    currencyCode: z.string(),
  }),
});

export type CurrencyField = z.infer<typeof CurrencyFieldSchema>;

export const NumberFieldSchema = BaseFieldSchema.extend({
  kind: z.literal("number"),
  value: z.number(),
});

export type NumberField = z.infer<typeof NumberFieldSchema>;

export const StringFieldSchema = BaseFieldSchema.extend({
  kind: z.literal("string"),
  value: z.string(),
});

export type StringField = z.infer<typeof StringFieldSchema>;

export const AddressFieldSchema = BaseFieldSchema.extend({
  kind: z.literal("address"),
  value: z.object({
    road: z.string().optional(),
    city: z.string().optional(),
    streetAddress: z.string(),
    house: z.string().optional(),
    postalCode: z.string().optional(),
    state: z.string().optional(),
    houseNumber: z.string().optional(),
  }),
});

export type AddressField = z.infer<typeof AddressFieldSchema>;

export const DateFieldSchema = BaseFieldSchema.extend({
  kind: z.literal("date"),
  value: z.coerce.date(),
});

export type DateField = z.infer<typeof DateFieldSchema>;

export const TimeFieldSchema = BaseFieldSchema.extend({
  kind: z.literal("time"),
  value: z.string(), // HH:mm:ss
});

export type TimeField = z.infer<typeof TimeFieldSchema>;

export const PhoneNumberFieldSchema = BaseFieldSchema.extend({
  kind: z.literal("phoneNumber"),
  value: z.string(),
});

export type PhoneNumberField = z.infer<typeof PhoneNumberFieldSchema>;

export const CountryRegionFieldSchema = BaseFieldSchema.extend({
  kind: z.literal("countryRegion"),
  value: z.string(),
});

export type CountryRegionField = z.infer<typeof CountryRegionFieldSchema>;

export type FieldValue =
  | CurrencyField
  | NumberField
  | StringField
  | AddressField
  | DateField
  | TimeField
  | PhoneNumberField
  | CountryRegionField
  | ObjectField
  | ArrayField;

export type ObjectField = BaseField & {
  kind: "object";
  properties: Record<string, FieldValue>;
};

export type ArrayField = BaseField & {
  kind: "array";
  values: FieldValue[];
};

export const FieldValueSchema: ZodType<FieldValue> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    CurrencyFieldSchema,
    NumberFieldSchema,
    StringFieldSchema,
    AddressFieldSchema,
    DateFieldSchema,
    TimeFieldSchema,
    PhoneNumberFieldSchema,
    ObjectFieldSchema,
    ArrayFieldSchema,
    CountryRegionFieldSchema,
  ]),
);

export const ObjectFieldSchema = BaseFieldSchema.extend({
  kind: z.literal("object"),
  properties: z.record(FieldValueSchema),
});

export const ArrayFieldSchema = BaseFieldSchema.extend({
  kind: z.literal("array"),
  values: z.array(FieldValueSchema),
});

export const AzureReceiptSchema = z.object({
  docType: z.string(),
  fields: z.object({
    CountryRegion: CountryRegionFieldSchema.optional(),
    Items: z.object({
      kind: z.literal("array"),
      values: z.array(
        z.object({
          kind: z.literal("object"),
          properties: z.object({
            Description: FieldValueSchema.optional(),
            Price: FieldValueSchema.optional(),
            Quantity: FieldValueSchema.optional(),
            QuantityUnit: FieldValueSchema.optional(),
            TotalPrice: FieldValueSchema.optional(),
          }),
          content: z.string(),
          confidence: z.number(),
        }),
      ),
    }),
    MerchantAddress: FieldValueSchema.optional(),
    MerchantName: FieldValueSchema,
    MerchantPhoneNumber: FieldValueSchema.optional(),
    ReceiptType: FieldValueSchema.optional(),
    TaxDetails: z
      .object({
        kind: z.literal("array"),
        values: z.array(
          z.object({
            kind: z.literal("object"),
            properties: z.object({
              Amount: FieldValueSchema.optional(), // There is always at least one of these properties with Amount
              NetAmount: FieldValueSchema.optional(),
              Rate: FieldValueSchema.optional(),
            }),
            content: z.string(),
            confidence: z.number(),
          }),
        ),
      })
      .optional(),
    Total: FieldValueSchema,
    TotalTax: FieldValueSchema.optional(),
    TransactionDate: FieldValueSchema,
    TransactionTime: FieldValueSchema,
  }),
});

export type AzureReceipt = z.infer<typeof AzureReceiptSchema>;
