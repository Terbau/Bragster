"use client";

import type {
  ReceiptWithItems,
  SmartReceiptWithItemsUsers,
} from "@/types/receipt";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { ChevronRight, Crown, Receipt, Users } from "lucide-react";
import type { Session } from "next-auth";
import Link from "next/link";
import { cn } from "@/utils/utils";

interface ReceiptListProps {
  currentUser: Session["user"];
  receipts: ReceiptWithItems[];
  smartReceipts: SmartReceiptWithItemsUsers[];
  activeTab?: string;
  searchQuery?: string;
}

export const ReceiptList = ({
  currentUser,
  receipts,
  smartReceipts,
  activeTab = "all",
  searchQuery = "",
}: ReceiptListProps) => {
  const filteredReceipts = receipts.filter((receipt) =>
    receipt.merchantName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredSmartReceipts = smartReceipts.filter((smartReceipt) =>
    smartReceipt.receipt.merchantName
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const showSmart = activeTab === "all" || activeTab === "shared";
  const showMy = activeTab === "all" || activeTab === "my";
  const isEmpty =
    (showSmart ? filteredSmartReceipts.length : 0) +
      (showMy ? filteredReceipts.length : 0) ===
    0;

  return (
    <div className="space-y-8">
      {/* Smart Receipts */}
      {showSmart && filteredSmartReceipts.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            Shared ({filteredSmartReceipts.length})
          </h2>
          <ul className="space-y-2">
            {filteredSmartReceipts.map((smartReceipt) => {
              const isOwner =
                currentUser.id === smartReceipt.receipt.userId;
              return (
                <li key={smartReceipt.id}>
                  <Link
                    href={`/smart-receipt/${smartReceipt.id}`}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 hover:border-foreground/20 hover:shadow-sm transition-all group"
                  >
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">
                          {smartReceipt.receipt.merchantName}
                        </span>
                        {isOwner && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground border border-border rounded-full px-2 py-0.5 shrink-0">
                            <Crown className="w-3 h-3" />
                            Owner
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{formatDate(smartReceipt.receipt.receiptDate)}</span>
                        <span>·</span>
                        <span>{smartReceipt.users.length} people</span>
                      </div>
                    </div>

                    {/* Amount + chevron */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-medium tabular-nums">
                        {formatCurrency(
                          smartReceipt.updatedTotalPrice ??
                            smartReceipt.receipt.totalPrice,
                          smartReceipt.updatedCurrencyCode ??
                            smartReceipt.receipt.currencyCode ??
                            "EUR",
                        )}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Personal Receipts */}
      {showMy && filteredReceipts.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <Receipt className="w-4 h-4" />
            My Receipts ({filteredReceipts.length})
          </h2>
          <ul className="space-y-2">
            {filteredReceipts.map((receipt) => (
              <li key={receipt.id}>
                <Link
                  href={`/receipt/${receipt.id}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 hover:border-foreground/20 hover:shadow-sm transition-all group"
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm truncate block">
                      {receipt.merchantName}
                    </span>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>{formatDate(receipt.receiptDate)}</span>
                      <span>·</span>
                      <span
                        className={cn(
                          receipt.itemGroups.length === 1
                            ? "hidden"
                            : undefined,
                        )}
                      >
                        {receipt.itemGroups.length} groups
                      </span>
                    </div>
                  </div>

                  {/* Amount + chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium tabular-nums">
                      {formatCurrency(
                        receipt.totalPrice,
                        receipt.currencyCode ?? "EUR",
                      )}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-16 text-muted-foreground">
          <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No receipts found</p>
          <p className="text-xs mt-1">
            {searchQuery
              ? "Try a different search term."
              : "Scan a receipt to get started."}
          </p>
        </div>
      )}
    </div>
  );
};
