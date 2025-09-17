"use server";

import { getSession } from "@/lib/auth";
import { openAI, OPENAI_MODEL_NAME } from "@/lib/azure/openai";
import type {
  ReceiptItemGroupTranslation,
  ReceiptItemSupplementTranslation,
} from "@/lib/generated/prisma";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

const SYSTEM_PROMPT_TRANSLATION = `You are an AI assistant that exist for the purpose of making sense of receipt items. All receipts might come in any language, and receipt items might be called different things. In your response to all user inputs, the following rules count: Each line in the user message is a new item name. The line will consist of first an ID of the item (in hexstring), then a separator using a semicolon character, then the item title.

The response should contain an object containing a property "items" that is a list of items. An item should exist for each line in the user input.

An item should consist of:
- id: The id that the item has.
- label: A label for the item that should resemble a sort of category. An example for this is if the input is the name of a bottle of wine. Then you can set this to "Wine". If its any beer, set it to "Beer". If its broccoli, set it "Vegetables". If its a pizza, set it to "Pizza".
- translation: A translation of the item title into english that describes the item well. If its the name of lets say a wine bottle, then you shouldn't translate it. If the item is in english, then just set this to the same as the input item title.
- translatedLanguage: The language in ISO 639 format that the item was translated from.
- lightModeLabelHexColor: The light mode color in hex that you think represents the category (label) you chose earlier the best.
- darkModeLabelHexColor: The dark mode color in hex that you think represents the category (label) you chose earlier the best.

Rules you have to follow:
- WHEN TRANSLATING, ALWAYS TRANSLATE TO ENGLISH, NO OTHER LANGUAGE!`;

interface ItemTranslation {
  id: string;
  label: string;
  translation: string;
  language: string;
  lightModeLabelHexColor: string;
  darkModeLabelHexColor: string;
}

export const translateItemTitles = async (
  translationStrings: string[], // Each string should be in the format "id; item title"
): Promise<ItemTranslation[]> => {
  const response = await openAI.chat.completions.create({
    messages: [
      { role: "system", content: SYSTEM_PROMPT_TRANSLATION },
      { role: "user", content: translationStrings.join("\n") },
    ],
    model: OPENAI_MODEL_NAME,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ItemTranslation",
        schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  label: { type: "string" },
                  translation: { type: "string" },
                  language: { type: "string" },
                  lightModeLabelHexColor: { type: "string" },
                  darkModeLabelHexColor: { type: "string" },
                },
                required: [
                  "id",
                  "label",
                  "translation",
                  "language",
                  "lightModeLabelHexColor",
                  "darkModeLabelHexColor",
                ],
              },
            },
          },
          required: ["items"],
          additionalProperties: false,
        },
      },
    },
  });

  if (!response.choices[0]?.message?.content) {
    throw new Error("No response from OpenAI");
  }

  const items = JSON.parse(response.choices[0].message.content) as {
    items: ItemTranslation[];
  };

  return items.items;
};

export const translateReceiptItemGroups = async (
  receiptItemGroupIds: string[],
): Promise<ReceiptItemGroupTranslation[]> => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const receiptItemGroups = await prisma.receiptItemGroup.findMany({
    where: { id: { in: receiptItemGroupIds } },
    include: { receipt: true },
  });

  if (!receiptItemGroups) {
    throw new Error("Receipt item groups not found");
  }

  if (receiptItemGroups.some((group) => group.receipt.userId !== user.id)) {
    throw new Error(
      "You are not allowed to get a translation for these item groups",
    );
  }

  const translationStrings = receiptItemGroups.map((group) => {
    return `${group.id}; ${group.description}`;
  });

  const translations = await translateItemTitles(translationStrings);

  const translationRows =
    await prisma.receiptItemGroupTranslation.createManyAndReturn({
      data: translations
        .map((t) => ({
          itemGroupId: t.id,
          label: t.label,
          description: t.translation,
          language: t.language,
          lightModeLabelHexColor: t.lightModeLabelHexColor,
          darkModeLabelHexColor: t.darkModeLabelHexColor,
        })),
    });

  return translationRows;
};

export const translateReceiptItemSupplements = async (
  receiptItemSupplementIds: string[],
): Promise<ReceiptItemSupplementTranslation[]> => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const receiptItemSupplements = await prisma.receiptItemSupplement.findMany({
    where: { id: { in: receiptItemSupplementIds } },
    include: {
      item: { include: { itemGroup: { include: { receipt: true } } } },
    },
  });

  if (!receiptItemSupplements) {
    throw new Error("Receipt item supplements not found");
  }

  if (
    receiptItemSupplements.some(
      (supplement) => supplement.item.itemGroup.receipt.userId !== user.id,
    )
  ) {
    throw new Error(
      "You are not allowed to get a translation for these item supplements",
    );
  }

  const translationStrings = receiptItemSupplements.map((supplement) => {
    return `${supplement.id}; ${supplement.description}`;
  });

  const translations = await translateItemTitles(translationStrings);

  const translationRows =
    await prisma.receiptItemSupplementTranslation.createManyAndReturn({
      data: translations
        .map((t) => ({
          supplementId: t.id,
          label: t.label,
          description: t.translation,
          language: t.language,
          lightModeLabelHexColor: t.lightModeLabelHexColor,
          darkModeLabelHexColor: t.darkModeLabelHexColor,
        })),
    });

  return translationRows;
};
