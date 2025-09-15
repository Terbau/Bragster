"use client";

import { useState, type ComponentProps } from "react";
import { ReceiptList } from "./ReceiptList";
import type {
  ReceiptWithItems,
  SmartReceiptWithItemsUsers,
} from "@/types/receipt";
import { ScanReceiptModal } from "./ScanReceiptModal";
import { DollarSign, Receipt, Search, Users } from "lucide-react";
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

  return (
    <div
      className={cn("min-h-screen bg-white dark:bg-black", className)}
      {...props}
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Your Receipts
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage and track all your scanned receipts
              </p>
            </div>
            <ScanReceiptModal />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search receipts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "all"
                  ? "bg-white dark:bg-black text-black dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              All Receipts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("my")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "my"
                  ? "bg-white dark:bg-black text-black dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              My Receipts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shared")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "shared"
                  ? "bg-white dark:bg-black text-black dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Shared
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total Receipts
                </p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {receipts.length + smartReceipts.length}
                </p>
              </div>
              <Receipt className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total Spent
                </p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {/* {formatCurrency(
                    mockReceipts.reduce((sum, r) => sum + r.totalPrice, 0) +
                      mockSmartReceipts.reduce(
                        (sum, sr) => sum + sr.receipt.totalPrice,
                        0,
                      ),
                  )} */}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Shared Receipts
                </p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {smartReceipts.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

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
