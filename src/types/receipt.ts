import { Prisma } from "@/lib/generated/prisma";

export const receiptInclude = Prisma.validator<Prisma.ReceiptInclude>()({
  createdBy: true,
  itemGroups: {
    include: {
      items: {
        include: {
          supplements: {
            include: {
              translations: true,
            },
          },
        },
      },
      translations: true,
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
    guests: true,
    payments: {
      include: {
        user: true,
      },
    },
    guestPayments: {
      include: {
        guest: true,
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
    guests: true,
    receipt: true,
  });

export type SmartReceiptWithUsers = Prisma.SmartReceiptGetPayload<{
  include: typeof smartReceiptWithUsersInclude;
}>;

export const smartReceiptWithPaymentsInclude = Prisma.validator<Prisma.SmartReceiptInclude>()({
  payments: {
    include: {
      user: true,
    },
  },
  guestPayments: {
    include: {
      guest: true,
    },
  },
});

export type SmartReceiptWithPayments = Prisma.SmartReceiptGetPayload<{
  include: typeof smartReceiptWithPaymentsInclude;
}>;
