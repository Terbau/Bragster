import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fixedDecimal = (num: number, decimalPlaces: number) => {
  const factor = decimalPlaces >= 0 ? 10 ** decimalPlaces : 1;
  const result = Math.round(num * factor) / factor;
  return Number.isNaN(result) ? 0 : result;
};

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Same normalization as the server uses for guest names */
export function formatName(name: string): string {
  return name
    .split(" ")
    .map((part) => capitalize(part.toLowerCase().trim()))
    .join(" ")
    .trim();
}

/** Parses user input like "12,50" or "12.5" */
export function parseAmount(value: string): number | null {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  if (normalized === "") {
    return null;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
