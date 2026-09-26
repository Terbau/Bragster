import { fixedDecimal } from "./utils";

export const formatCurrency = (amount: number, currency = "EUR") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    // Unknown currency codes throw
    return formatAmount(amount, currency);
  }
};

/** "12.50 NOK" */
export const formatAmount = (amount: number, currencyCode?: string | null) =>
  `${fixedDecimal(amount, 2).toFixed(2)}${currencyCode ? ` ${currencyCode}` : ""}`;

const toDate = (date: Date | string | null | undefined) =>
  date ? new Date(date) : null;

export const formatDate = (value: Date | string | null | undefined) => {
  const date = toDate(value);
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatTime = (value: Date | string | null | undefined) => {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
