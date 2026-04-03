"use client";

import { useState, type ComponentProps } from "react";
import { ReceiptList } from "./ReceiptList";
import type {
  ReceiptWithItems,
  SmartReceiptWithItemsUsers,
} from "@/types/receipt";
import { ScanReceiptModal } from "./ScanReceiptModal";
import { Receipt, Search, Users } from "lucide-react";
import { cn } from "@/utils/utils";
import type { Session } from "next-auth";

interface ReceiptViewProps extends ComponentProps<"div"> {
  currentUser: Session["user"];
  receipts: ReceiptWithItems[];
  smartReceipts: SmartReceiptWithItemsUsers[];
}

export const ReceiptView = ({
  currentUser,
  receipts,
  smartReceipts,
  className,
  ...props
}: ReceiptViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All" },
    { id: "my", label: "My Receipts" },
    { id: "shared", label: "Shared" },
  ];

  return (
    <div className={cn("min-h-screen", className)} {...props}>
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              All your scanned receipts in one place.
            </p>
          </div>
          <ScanReceiptModal />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center gap-4">
            <Receipt className="w-5 h-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-2xl font-bold leading-none">
                {receipts.length + smartReceipts.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total receipts
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center gap-4">
            <Users className="w-5 h-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-2xl font-bold leading-none">
                {smartReceipts.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Shared receipts
              </p>
            </div>
          </div>
        </div>

        {/* Search + Tabs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search by merchant…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex bg-muted rounded-lg p-1 gap-1 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <ReceiptList
          currentUser={currentUser}
          receipts={receipts}
          smartReceipts={smartReceipts}
          activeTab={activeTab}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};
