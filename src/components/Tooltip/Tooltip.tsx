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
  triggerClassName?: string;
}

export const Tooltip: FC<TooltipProps> = ({
  text,
  children,
  asChild,
  className,
  triggerClassName,
}) => {
  return (
    <TooltipProvider>
      <OriginalTooltip>
        <TooltipTrigger asChild={asChild} className={triggerClassName}>
          {children}
        </TooltipTrigger>
        <TooltipContent className={className}>{text}</TooltipContent>
      </OriginalTooltip>
    </TooltipProvider>
  );
};
