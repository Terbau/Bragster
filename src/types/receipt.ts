import { Prisma } from "@/lib/generated/prisma";

export const receiptInclude = Prisma.validator<Prisma.ReceiptInclude>()({
  itemGroups: {
    include: {
      items: {
        include: {
          supplements: true,
        },
      },
    },
  },
});

export type ReceiptWithItems = Prisma.ReceiptGetPayload<{
  include: typeof receiptInclude;
}>;

export const smartReceiptInclude =
  Prisma.validator<Prisma.SmartReceiptInclude>()({
    receipt: {
      include: receiptInclude,
    },
    users: true,
    payments: {
      include: {
        user: true,
      },
    },
  });

export type SmartReceiptWithItemsUsers = Prisma.SmartReceiptGetPayload<{
  include: typeof smartReceiptInclude;
}>;

export const receiptIncludeItemCount =
  Prisma.validator<Prisma.ReceiptInclude>()({
    itemGroups: {
      select: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    },
  });

export type ReceiptWithItemCount = Prisma.ReceiptGetPayload<{
  include: typeof receiptIncludeItemCount;
}>;

export const smartReceiptWithUsersInclude =
  Prisma.validator<Prisma.SmartReceiptInclude>()({
    users: true,
  });

export type SmartReceiptWithUsers = Prisma.SmartReceiptGetPayload<{
  include: typeof smartReceiptWithUsersInclude;
}>;
