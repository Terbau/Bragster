"use client";

import { type ComponentProps, useContext } from "react";
import { FixedBarContext } from "./providers";
import { Toaster as OriginalToaster } from "@/components/ui/sonner";

export const Toaster = ({
  ...props
}: Omit<ComponentProps<typeof OriginalToaster>, "mobileOffset">) => {
  const ctx = useContext(FixedBarContext);

  return <OriginalToaster mobileOffset={ctx?.height} {...props} />;
};
