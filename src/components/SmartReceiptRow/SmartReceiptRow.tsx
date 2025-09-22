import type { SmartReceiptWithUsers } from "@/types/receipt";
import { cn } from "@/utils/utils";
import type { ComponentProps } from "react";
import { AvatarGroup } from "../AvatarGroup/AvatarGroup";
import { formatDate } from "@/utils/date";

interface SmartReceiptListRowProps extends ComponentProps<"li"> {
  smartReceipt: SmartReceiptWithUsers;
}

export const SmartReceiptListRow = ({
  smartReceipt,
  className,
  ...props
}: SmartReceiptListRowProps) => {
  return (
    <li
      className={cn(
        "flex flex-row items-center justify-between border px-2 py-2 rounded-sm",
        className,
      )}
      {...props}
    >
      <AvatarGroup
        users={smartReceipt.users}
        guests={smartReceipt.guests}
        // className="scale-75"
        size="sm"
      />
      <span className="text-sm text-foreground whitespace-nowrap">
        {formatDate(smartReceipt.createdAt)}
      </span>
    </li>
  );
};
