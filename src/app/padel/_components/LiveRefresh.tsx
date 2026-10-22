"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Reloads the page's data now and then while it's open, and on coming back */
export const LiveRefresh = ({
  intervalMs = 15000,
}: { intervalMs?: number }) => {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const interval = setInterval(refresh, intervalMs);
    // Phones pause the page when the screen locks
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, intervalMs]);
  return null;
};
