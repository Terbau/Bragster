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
}

export const Avatar = ({
  src,
  email,
  withTooltip = false,
  hasBorder = false,
  className,
  ...props
}: AvatarProps) => {
  const fallback = email ? email.substring(0, 2).toUpperCase() : undefined;

  if (withTooltip) {
    return (
      <Tooltip text={email || "N/A"}>
        <ShadcnAvatar
          {...props}
          className={cn({ "border-2 border-foreground": hasBorder }, className)}
        >
          <AvatarImage src={src ?? undefined} />
          <AvatarFallback className="bg-gray-600">
            {fallback || "??"}
          </AvatarFallback>
        </ShadcnAvatar>
      </Tooltip>
    );
  }

  return (
    <ShadcnAvatar
      {...props}
      className={cn({ "border-2 border-foreground": hasBorder }, className)}
    >
      <AvatarImage src={src ?? undefined} />
      <AvatarFallback className="bg-slate-300">
        {fallback || "??"}
      </AvatarFallback>
    </ShadcnAvatar>
  );
};
