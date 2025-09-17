"use client";

import type { User } from "@/lib/generated/prisma";
import { cn } from "@/utils/utils";
import { useState, type ComponentProps } from "react";
import { Avatar } from "../Avatar/Avatar";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Info } from "lucide-react";
import { Tooltip } from "../Tooltip";
import { HorizontalScrollArea } from "../HorizontalScrollArea/HorizontalScrollArea";

interface FixedUserSelectBarProps extends ComponentProps<"div"> {
  users: User[];
  onSelectedUserIdsChange?: (userIds: string[]) => void;
  onActiveChange?: (isActive: boolean) => void;
}

export const FixedUserSelectBar = ({
  users,
  onSelectedUserIdsChange,
  onActiveChange,
  className,
  ...props
}: FixedUserSelectBarProps) => {
  const [isActive, setIsActive] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleActiveChange = (active: boolean) => {
    if (!active) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }

    setIsActive(active);
    onActiveChange?.(active);
  };

  const handleOnToggleGroupChange = (items: string[]) => {
    if (items.length > 0) {
      handleActiveChange(true);
    }

    setSelectedUsers(items);
    onSelectedUserIdsChange?.(items);
  };

  return (
    <div
      className={cn(
        "fixed bg-primary-foreground border-2 rounded-full px-4 h-16 py-3 z-10 bottom-0 left-1/2 -translate-x-1/2 -translate-y-4 flex flex-row items-center max-w-[95%]",
        // !isActive ? "border-transparent" : "border-green-700",
        className,
      )}
      {...props}
    >
      <div className="h-full flex flex-row items-center gap-2 shrink-0">
        <Switch checked={isActive} onCheckedChange={handleActiveChange} />
        <Separator orientation="vertical" className="mx-1 text-slate-300" />
      </div>

      <HorizontalScrollArea className="flex-1 min-w-0">
        <ToggleGroup
          type="multiple"
          className="flex flex-row items-center gap-2 py-1 px-1"
          value={selectedUsers}
          onValueChange={handleOnToggleGroupChange}
        >
          {users.map((user, index) => (
            <ToggleGroupItem
              key={`${user.id}-${index}`}
              value={user.id}
              className="rounded-full p-0 data-[state=on]:ring-2 data-[state=on]:ring-foreground/40 data-[state=off]:opacity-20"
            >
              <Avatar email={user.email} src={user.avatarUrl} />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </HorizontalScrollArea>

      <div className="h-full flex flex-row items-center gap-2 shrink-0">
        <Separator orientation="vertical" className="text-slate-300 mx-1" />
        <Tooltip text="Toggle users you want to quickly assign to items. When clicking an item that is already assigned to someone, only the selected users will be assigned.">
          <Info className="h-6 w-6 text-foreground/60" />
        </Tooltip>
      </div>
    </div>
  );
};
