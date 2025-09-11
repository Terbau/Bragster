"use client";

import type {
  ReceiptWithItems,
  SmartReceiptWithItemsUsers,
} from "@/types/receipt";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import type { User } from "@supabase/supabase-js";
import {
  Calendar,
  ChevronRight,
  Crown,
  DollarSign,
  Receipt,
  Store,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";

interface ReceiptListProps {
  currentUser: User;
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

  return (
    <>
      {/* Receipt Lists */}
      <div className="space-y-6">
        {/* Smart Receipts */}
        {(activeTab === "all" || activeTab === "shared") && (
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Shared Receipts ({filteredSmartReceipts.length})
            </h2>
            <div className="grid gap-4">
              {filteredSmartReceipts.map((smartReceipt) => (
                <Link
                  href={`/smart-receipt/${smartReceipt.id}`}
                  key={smartReceipt.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-black dark:text-white">
                              {smartReceipt.receipt.merchantName}
                            </h3>
                            {currentUser.id === smartReceipt.receipt.userId ? (
                              <div className="inline-flex items-center space-x-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                                <Crown className="w-3 h-3" />
                                <span>Created by you</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                                <UserPlus className="w-3 h-3" />
                                <span>
                                  Added by{" "}
                                  {smartReceipt.receipt.createdBy.email}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Shared with {smartReceipt.users.length} people
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(smartReceipt.receipt.receiptDate)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-black dark:text-white">
                            {formatCurrency(
                              smartReceipt.receipt.totalPrice,
                              smartReceipt.receipt.currencyCode ?? "EUR",
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Your share:{" "}
                            {/* {formatCurrency(
                              smartReceipt.payments.find(
                                (p) => p.userId === "1",
                              )?.amount || 0,
                            )} */}
                          </span>
                        </div>
                      </div>

                      {/* User avatars */}
                      <div className="flex items-center space-x-2 mt-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Participants:
                        </span>
                        <div className="flex -space-x-2">
                          {smartReceipt.users.slice(0, 3).map((user) => (
                            <div
                              key={user.id}
                              className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-medium"
                            >
                              {user.email.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {smartReceipt.users.length > 3 && (
                            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium">
                              +{smartReceipt.users.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Personal Receipts */}
        {(activeTab === "all" || activeTab === "my") && (
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              My Receipts ({filteredReceipts.length})
            </h2>
            <div className="grid gap-4">
              {filteredReceipts.map((receipt) => (
                <Link
                  href={`/receipt/${receipt.id}`}
                  key={receipt.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <Store className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-black dark:text-white">
                            {receipt.merchantName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {receipt.receiptType}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(receipt.receiptDate)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-black dark:text-white">
                            {formatCurrency(
                              receipt.totalPrice,
                              receipt.currencyCode ?? "EUR",
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Receipt className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {receipt.itemGroups.length} item groups
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {((activeTab === "my" && filteredReceipts.length === 0) ||
          (activeTab === "shared" && filteredSmartReceipts.length === 0) ||
          (activeTab === "all" &&
            filteredReceipts.length === 0 &&
            filteredSmartReceipts.length === 0)) && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
              No receipts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery
                ? "Try adjusting your search terms."
                : "Start by scanning your first receipt."}
            </p>
            <Receipt className="w-5 h-5 mr-2" />
          </div>
        )}
      </div>
    </>
  );
};
