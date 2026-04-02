"use client";

import type { SmartReceiptGuest, User } from "@/lib/generated/prisma";
import { cn } from "@/utils/utils";
import { useContext, useEffect, useState, type ComponentProps } from "react";
import { Avatar } from "../Avatar/Avatar";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Info } from "lucide-react";
import { HorizontalScrollArea } from "../HorizontalScrollArea/HorizontalScrollArea";
import { UniversalTooltip } from "../Tooltip/UniversalTooltip";
import { FixedBarContext } from "@/app/providers";

interface FixedUserSelectBarProps extends ComponentProps<"div"> {
  users: User[];
  guests: SmartReceiptGuest[];
  onSelectedUserIdsChange?: (userIds: string[]) => void;
  onSelectedGuestIdsChange?: (guestIds: string[]) => void;
  onActiveChange?: (isActive: boolean) => void;
}

export const FixedUserSelectBar = ({
  users,
  guests,
  onSelectedUserIdsChange,
  onSelectedGuestIdsChange,
  onActiveChange,
  className,
  ...props
}: FixedUserSelectBarProps) => {
  const [isActive, setIsActive] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const fixedBarCtx = useContext(FixedBarContext);

  const handleActiveChange = (active: boolean, addAll: boolean) => {
    const newUsers = !active
      ? []
      : addAll
        ? users.map((user) => user.id)
        : selectedUsers;
    const newGuests = !active
      ? []
      : addAll
        ? guests.map((guest) => guest.id)
        : selectedGuests;

    setSelectedUsers(newUsers);
    setSelectedGuests(newGuests);
    onSelectedUserIdsChange?.(newUsers);
    onSelectedGuestIdsChange?.(newGuests);

    setIsActive(active);
    onActiveChange?.(active);
  };

  const handleOnToggleGroupUsersChange = (items: string[]) => {
    if (items.length > 0) {
      handleActiveChange(true, selectedGuests.length > 0);
    }

    setSelectedUsers(items);
    onSelectedUserIdsChange?.(items);
  };

  const handleOnToggleGroupGuestsChange = (items: string[]) => {
    if (items.length > 0) {
      handleActiveChange(true, selectedUsers.length > 0);
    }

    setSelectedGuests(items);
    onSelectedGuestIdsChange?.(items);
  };

  useEffect(() => {
    if (fixedBarCtx) {
      fixedBarCtx.setHeight(110);
    }
  }, [fixedBarCtx]);

  return (
    <div
      className={cn(
        "fixed bg-primary-foreground border-2 rounded-full px-4 h-20 py-2 z-20 bottom-0 left-1/2 -translate-x-1/2 -translate-y-4 flex flex-row items-center max-w-[95%]",
        // !isActive ? "border-transparent" : "border-green-700",
        className,
      )}
      {...props}
    >
      <div className="h-full flex flex-row items-center gap-2 shrink-0">
        <Switch
          checked={isActive}
          onCheckedChange={(checked) => handleActiveChange(checked, true)}
        />
        <Separator orientation="vertical" className="mx-1 text-slate-300" />
      </div>

      <HorizontalScrollArea className="flex-1 min-w-0">
        <div className="flex flex-row items-center py-1 px-1 gap-2">
          <ToggleGroup
            type="multiple"
            className="flex flex-row items-center gap-2"
            value={selectedUsers}
            onValueChange={handleOnToggleGroupUsersChange}
          >
            {users.map((user) => (
              <ToggleGroupItem
                key={user.id}
                value={user.id}
                className="rounded-xl px-1.5 py-1 h-auto flex flex-col items-center gap-0.5 data-[state=on]:ring-2 data-[state=on]:ring-foreground/40 data-[state=off]:opacity-20"
              >
                <Avatar email={user.email} src={user.avatarUrl} size="sm" />
                <span className="text-[10px] leading-none max-w-[52px] truncate">
                  {user.email.split("@")[0]}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup
            type="multiple"
            className="flex flex-row items-center gap-2"
            value={selectedGuests}
            onValueChange={handleOnToggleGroupGuestsChange}
          >
            {guests.map((guest) => (
              <ToggleGroupItem
                key={guest.id}
                value={guest.id}
                className="rounded-xl px-1.5 py-1 h-auto flex flex-col items-center gap-0.5 data-[state=on]:ring-2 data-[state=on]:ring-foreground/40 data-[state=off]:opacity-20"
              >
                <Avatar email={guest.name} size="sm" />
                <span className="text-[10px] leading-none max-w-[52px] truncate">
                  {guest.name}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </HorizontalScrollArea>

      <div className="h-full flex flex-row items-center gap-2 shrink-0">
        <Separator orientation="vertical" className="text-slate-300 mx-1" />
        <UniversalTooltip text="Toggle users you want to quickly assign to items. When clicking an item that is already assigned to someone, only the selected users will be assigned.">
          <Info className="h-6 w-6 text-foreground/60" />
        </UniversalTooltip>
      </div>
    </div>
  );
};
