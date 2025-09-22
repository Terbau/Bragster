import type { SmartReceiptGuest, User } from "@/lib/generated/prisma";
import { Avatar } from "../Avatar/Avatar";
import type { ComponentProps } from "react";
import { cn } from "@/utils/utils";

interface AvatarGroupProps extends ComponentProps<"div"> {
  users: User[];
  guests?: SmartReceiptGuest[];
  maxVisible?: number;
  showMoreCount?: boolean;
  size?: "sm" | "md" | "lg";
}

export const AvatarGroup = ({
  users,
  guests = [],
  maxVisible = 3,
  showMoreCount = true,
  size = "md",
  ...props
}: AvatarGroupProps) => {
  const visibleUsers = users.slice(0, maxVisible);
  const visibleGuests = guests.slice(0, maxVisible - visibleUsers.length);
  const hiddenCount =
    users.length - visibleUsers.length + guests.length - visibleGuests.length;

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

  return (
    <div className={cn("flex items-center", props.className)} {...props}>
      <ul className="flex flex-row items-center">
        {visibleUsers.map((user, index) => (
          <li key={user.id} style={{ marginLeft: index > 0 ? "-12px" : "0" }}>
            <Avatar
              src={user.avatarUrl}
              email={user.email}
              hasBorder
              size={size}
            />
          </li>
        ))}
        {visibleGuests.map((guest, index) => (
          <li
            key={guest.id}
            style={{
              marginLeft: index > 0 || visibleUsers.length > 0 ? "-12px" : "0",
            }}
          >
            <Avatar email={guest.name} hasBorder size={size} />
          </li>
        ))}
        {showMoreCount && hiddenCount > 0 && (
          <li
            className={cn(
              sizeClass,
              "flex items-center justify-center bg-slate-900 dark:bg-gray-800 rounded-full z-10 border border-foreground",
            )}
            style={{ marginLeft: "-12px" }}
          >
            <span
              className={cn(
                textSizeClass,
                "text-secondary dark:text-slate-300",
              )}
            >
              +{hiddenCount}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
};
