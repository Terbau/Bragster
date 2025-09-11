import { cn } from "@/utils/utils";
import type { ComponentProps } from "react";
import { NumberInput } from "../Form/Fields/NumberInput";
import { Avatar } from "../Avatar/Avatar";
import type { User } from "@/lib/generated/prisma";
import { Switch } from "../ui/switch";

interface UserAssignListItemProps extends ComponentProps<"li"> {
  user: User;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  isAdvancedMode?: boolean;
}

export const UserAssignListItem = ({
  user,
  checked,
  onCheckedChange,
  isAdvancedMode = false,
  className,
  ...props
}: UserAssignListItemProps) => {
  return (
    <li
      className={cn(
        "flex flex-row items-center gap-1 justify-between",
        className,
      )}
      {...props}
    >
      <span className="flex flex-row items-center gap-2">
        <Avatar email={user.email} />
        <span className="font-regular">{user.email}</span>
      </span>

      {!isAdvancedMode ? (
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      ) : (
        <span className="flex flex-row items-center gap-1">
          <NumberInput className="max-w-16" />
          <span>%</span>
        </span>
      )}
    </li>
  );
};
