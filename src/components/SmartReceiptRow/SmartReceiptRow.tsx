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
        "flex flex-row items-center justify-between border px-2 py-1 rounded-sm",
        className,
      )}
      {...props}
    >
      <AvatarGroup users={smartReceipt.users} className="scale-75" />
      <span className="text-sm text-foreground">
        {formatDate(smartReceipt.createdAt)}
      </span>
    </li>
  );
};
