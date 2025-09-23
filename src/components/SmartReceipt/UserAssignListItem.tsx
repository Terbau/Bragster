import { cn } from "@/utils/utils";
import { useId, type ComponentProps } from "react";
import { NumberInput } from "../Form/Fields/NumberInput";
import { Avatar } from "../Avatar/Avatar";
import type { SmartReceiptGuest, User } from "@/lib/generated/prisma";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface UserAssignListItemProps extends ComponentProps<"li"> {
  user?: User;
  guest?: SmartReceiptGuest;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  isAdvancedMode?: boolean;
}

export const UserAssignListItem = ({
  user,
  guest,
  checked,
  onCheckedChange,
  isAdvancedMode = false,
  className,
  ...props
}: UserAssignListItemProps) => {
  const id = useId();

  if (!user && !guest) {
    throw new Error("Either user or guest must be provided");
  }

  return (
    <li
      className={cn(
        "flex flex-row items-center gap-1 justify-between",
        className,
      )}
      {...props}
    >
      <Label htmlFor={id} className="flex flex-row items-center gap-2">
        {guest ? (
          <>
            <Avatar email={guest.name} />
            <span className="font-regular text-sm sm:text-base">
              {guest.name}
              <span className="text-muted-foreground ml-1 text-xs sm:text-sm">
                (Guest)
              </span>
            </span>
          </>
        ) : (
          <>
            <Avatar src={user?.avatarUrl} email={user?.email} />
            <span className="font-regular text-sm sm:text-base">
              {user?.email}
            </span>
          </>
        )}
      </Label>

      {!isAdvancedMode ? (
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      ) : (
        <span className="flex flex-row items-center gap-1">
          <NumberInput className="max-w-16" />
          <span>%</span>
        </span>
      )}
    </li>
  );
};
