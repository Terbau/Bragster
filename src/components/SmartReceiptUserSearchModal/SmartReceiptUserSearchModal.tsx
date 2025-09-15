"use client";

import { useState, useTransition, type ComponentProps } from "react";
import type { Popover } from "../ui/popover";
import { TextInput } from "../Form/Fields/TextInput";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Spinner } from "../Spinner";
import { searchUsers } from "@/app/actions";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Check, X } from "lucide-react";
import type { SmartReceipt, User } from "@/lib/generated/prisma";
import { cn } from "@/utils/utils";
import {
  addUserToSmartReceipt,
  removeUserFromSmartReceipt,
} from "@/app/smart-receipt/[smartReceiptId]/actions";
import { useRouter } from "next/navigation";
import { Separator } from "../ui/separator";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../ui/button";

interface SmartReceiptUserSearchModalProps
  extends Omit<ComponentProps<typeof Popover>, "open" | "onOpenChange"> {
  smartReceiptId: SmartReceipt["id"];
  selectedUsers: User[];
}

export const SmartReceiptUserSearchModal = ({
  smartReceiptId,
  selectedUsers,
  ...props
}: SmartReceiptUserSearchModalProps) => {
  const [query, setQuery] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [pendingMutations, setPendingMutations] = useState<string[]>([]);
  const [transitionIsPending, startTransition] = useTransition();
  const router = useRouter();

  const rerender = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["user-search", query],
    queryFn: async () => await searchUsers(query),
  });

  const { mutate: mutateAddUser } = useMutation({
    mutationFn: async (userId: User["id"]) => {
      setPendingMutations((prev) => [...prev, userId]);

      try {
        await addUserToSmartReceipt(smartReceiptId, userId);
      } finally {
        setPendingMutations((prev) => prev.filter((id) => id !== userId));
      }
    },
    onSuccess: () => rerender(),
  });

  const { mutate: mutateRemoveUser } = useMutation({
    mutationFn: async (userId: User["id"]) => {
      setPendingMutations((prev) => [...prev, userId]);

      try {
        await removeUserFromSmartReceipt(smartReceiptId, userId);
      } finally {
        setPendingMutations((prev) => prev.filter((id) => id !== userId));
      }
    },
    onSuccess: () => rerender(),
  });

  const handleUserSelect = (userId: User["id"]) => {
    if (pendingMutations.includes(userId)) {
      return;
    }

    const isSelected = selectedUsers.find((u) => u.id === userId);
    if (isSelected) {
      mutateRemoveUser(userId);
    } else {
      mutateAddUser(userId);
    }
  };

  const getIcon = (userId: string) => {
    const hasPendingMutation = pendingMutations.includes(userId);

    if (hasPendingMutation) {
      return <Spinner className="ml-auto" />;
    }

    return (
      <Check
        className={cn(
          "ml-auto",
          selectedUsers.find((u) => u.id === userId)
            ? "opacity-100"
            : "opacity-0",
        )}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full group">
        <TextInput
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setPopoverOpen(true);
            setQuery(e.target.value);
          }}
        />

        <div
          className={cn(
            "absolute z-10 -bottom-1 translate-y-full hidden w-full",
            { "group-focus-within:flex": query.length > 2 },
          )}
        >
          {isLoading ? (
            <div className="w-full flex items-center justify-center bg-popover border rounded-md py-2">
              <Spinner />
            </div>
          ) : (
            <Command className="w-full border">
              {/* <CommandInput /> */}
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {data?.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={() => handleUserSelect(user.id)}
                    >
                      {user.email}
                      {getIcon(user.id)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </div>
      </div>
      <Separator />
      <ul className="flex flex-col gap-2">
        {selectedUsers.map((user) => (
          <li
            key={user.id}
            className={cn("text-sm flex flex-row gap-1 items-center p-1", {})}
          >
            <Avatar src={user.avatarUrl} email={user.email} />
            <span className="font-regular">{user.email}</span>
            <Button
              variant="destructive"
              size="iconSm"
              className="ml-auto"
              onClick={() => handleUserSelect(user.id)}
              disabled={pendingMutations.includes(user.id)}
            >
              {pendingMutations.includes(user.id) ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};
