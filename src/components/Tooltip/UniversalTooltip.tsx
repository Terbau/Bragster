import type { ComponentProps, FC, ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/utils/utils";

interface UniversalTooltipProps extends ComponentProps<typeof Popover> {
  text: string;
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

export const UniversalTooltip: FC<UniversalTooltipProps> = ({
  text,
  children,
  asChild,
  className,
  ...props
}) => {
  return (
    <Popover {...props}>
      <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>
      <PopoverContent className={cn("text-sm", className)}>{text}</PopoverContent>
    </Popover>
  );
};
