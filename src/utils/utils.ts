import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { redirect } from "next/navigation";
import type { FieldValue } from "@/types/smart-receipt";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createFormDataFromRecord(
  record: Record<string, unknown>,
): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(record)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        formData.append(key, v);
      }
    } else {
      formData.append(key, value as string);
    }
  }
  return formData;
}

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

export function findCurrencyCode(data: FieldValue): string | undefined {
  if (data.kind === "currency") {
    return data.value.currencyCode;
  }

  if (data.kind === "object") {
    for (const key in data.properties) {
      const value = data.properties[key];
      const currencyCode = findCurrencyCode(value);
      if (currencyCode) {
        return currencyCode;
      }
    }
  } else if (data.kind === "array") {
    for (const value of data.values) {
      const currencyCode = findCurrencyCode(value);
      if (currencyCode) {
        return currencyCode;
      }
    }
  }
}

export function addTimeToDateIfExists(date: Date, time?: string): Date {
  if (!time) {
    return date;
  }

  const [hours, minutes, seconds] = time.split(":").map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, seconds);

  return newDate;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatName(name: string): string {
  return name
    .split(" ")
    .map((part) => capitalize(part.toLowerCase().trim()))
    .join(" ")
    .trim();
}
