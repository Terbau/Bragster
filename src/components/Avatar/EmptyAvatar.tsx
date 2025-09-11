import type { ComponentProps } from "react";

interface EmptyAvatarProps extends ComponentProps<"div"> {}

export const EmptyAvatar = ({ className, ...props }: EmptyAvatarProps) => {
  return (
    <div
      className={`flex items-center justify-center w-10 h-10 rounded-full border border-dashed bg-muted-foreground/5 ${className}`}
      {...props}
    />
  );
};
