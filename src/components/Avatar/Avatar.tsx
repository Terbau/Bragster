import type { ComponentProps } from "react";
import {
  AvatarFallback,
  AvatarImage,
  Avatar as ShadcnAvatar,
} from "../ui/avatar";
import { Tooltip } from "../Tooltip";
import { cn } from "@/utils/utils";

interface AvatarProps extends ComponentProps<typeof ShadcnAvatar> {
  src?: string | null;
  email?: string;
  withTooltip?: boolean;
  hasBorder?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Avatar = ({
  src,
  email,
  withTooltip = false,
  hasBorder = false,
  className,
  size = "md",
  ...props
}: AvatarProps) => {
  const fallback = email ? email.substring(0, 2).toUpperCase() : undefined;

  const sizeClass = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }[size];

  const textSizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  if (withTooltip) {
    return (
      <Tooltip text={email || "N/A"}>
        <ShadcnAvatar
          {...props}
          className={cn(
            sizeClass,
            { "border-2 border-foreground": hasBorder },
            className,
          )}
        >
          <AvatarImage src={src ?? undefined} />
          <AvatarFallback className={cn("bg-gray-600", textSizeClass)}>
            {fallback || "??"}
          </AvatarFallback>
        </ShadcnAvatar>
      </Tooltip>
    );
  }

  return (
    <ShadcnAvatar
      {...props}
      className={cn(
        sizeClass,
        { "border-2 border-foreground": hasBorder },
        className,
      )}
    >
      <AvatarImage src={src ?? undefined} />
      <AvatarFallback className={cn("bg-slate-300", textSizeClass)}>
        {fallback || "??"}
      </AvatarFallback>
    </ShadcnAvatar>
  );
};
