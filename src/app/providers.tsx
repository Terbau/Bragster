"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useState } from "react";
import { SessionProvider } from "next-auth/react";

type FixedBarContextType = {
  height: number;
  setHeight: (height: number) => void;
};

export const FixedBarContext = createContext<FixedBarContextType | undefined>(
  undefined,
);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000 },
        },
      }),
  );
  const [height, setHeight] = useState(0);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <FixedBarContext.Provider value={{ height, setHeight }}>
          {children}
        </FixedBarContext.Provider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
