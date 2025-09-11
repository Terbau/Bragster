import type { User } from "@/lib/generated/prisma";
import { Avatar } from "../Avatar/Avatar";
import type { ComponentProps } from "react";
import { cn } from "@/utils/utils";

interface AvatarGroupProps extends ComponentProps<"div"> {
  users: User[];
  maxVisible?: number;
  showMoreCount?: boolean;
}

export const AvatarGroup = ({
  users,
  maxVisible = 3,
  showMoreCount = true,
  ...props
}: AvatarGroupProps) => {
  const visibleUsers = users.slice(0, maxVisible);
  const hiddenCount = users.length - visibleUsers.length;

  return (
    <div className={cn("flex items-center", props.className)} {...props}>
      <ul className="flex flex-row items-center">
        {visibleUsers.map((user, index) => (
          <li key={user.id} style={{ marginLeft: index > 0 ? "-12px" : "0" }}>
            <Avatar email={user.email} hasBorder />
          </li>
        ))}
        {showMoreCount && hiddenCount > 0 && (
          <li
            className="flex items-center justify-center w-10 h-10 bg-slate-900 rounded-full z-10 border border-foreground"
            style={{ marginLeft: "-12px" }}
          >
            <span className="text-sm text-secondary">+{hiddenCount}</span>
          </li>
        )}
      </ul>
    </div>
  );
};
