"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/utils/utils";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref,
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

interface SeparatorWithTextProps
  extends React.ComponentPropsWithoutRef<typeof Separator> {
  text: string;
}

const SeparatorWithText = ({
  text,
  orientation,
  decorative,
  className,
  ...props
}: SeparatorWithTextProps) => {
  return (
    <div className={cn("flex items-center gap-4", className)} {...props}>
      <Separator
        className="flex-1"
        orientation={orientation}
        decorative={decorative}
      />
      <span className="text-muted-foreground text-sm">{text}</span>
      <Separator
        className="flex-1"
        orientation={orientation}
        decorative={decorative}
      />
    </div>
  );
};

SeparatorWithText.displayName = "SeparatorWithText";

export { Separator, SeparatorWithText };
