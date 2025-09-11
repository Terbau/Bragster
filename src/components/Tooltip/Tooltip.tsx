import type { FC, ReactNode } from "react";
import {
  TooltipProvider,
  Tooltip as OriginalTooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface TooltipProps {
  text: string;
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

export const Tooltip: FC<TooltipProps> = ({
  text,
  children,
  asChild,
  className,
}) => {
  return (
    <TooltipProvider>
      <OriginalTooltip>
        <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
        <TooltipContent className={className}>{text}</TooltipContent>
      </OriginalTooltip>
    </TooltipProvider>
  );
};
