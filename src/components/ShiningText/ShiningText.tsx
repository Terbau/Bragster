import { cn } from "@/utils/utils";
import type { ComponentProps, ElementType } from "react";

type ShiningTextProps<T extends ElementType> = {
  as?: T;
} & ComponentProps<T>;

export const ShiningText = <T extends ElementType = "p">({
  as,
  className,
  ...props
}: ShiningTextProps<T>) => {
  const Component = as || "p";
  return (
    <Component
      {...props}
      className={cn(
        "tracking-tight animate-shine !bg-clip-text text-transparent",
        "[background:radial-gradient(circle_at_center,rgba(255,255,255,0.90),transparent)_-200%_50%_/_200%_100%_no-repeat,rgba(0,0,0,0.80)]",
        "dark:[background:radial-gradient(circle_at_center,rgba(0,0,0,0.80),transparent)_-200%_50%_/_200%_100%_no-repeat,rgba(255,255,255,0.90)]",
        className,
      )}
    />
  );
};
