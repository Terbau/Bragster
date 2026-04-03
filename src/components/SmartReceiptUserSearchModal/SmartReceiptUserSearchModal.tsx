"use client";

import { useEffect, useState, useTransition, type ComponentProps } from "react";
import type { Popover } from "../ui/popover";
import { TextInput } from "../Form/Fields/TextInput";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "../Spinner";
import { searchUsers } from "@/app/actions";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../ui/command";
import { AlertCircleIcon, Check, UserRoundPlus } from "lucide-react";
import type {
  SmartReceipt,
  SmartReceiptGuest,
  User as UserType,
} from "@/lib/generated/prisma";
import { cn, formatName } from "@/utils/utils";
import {
  addGuestToSmartReceipt,
  addUserToSmartReceipt,
  checkGuestNameValidity,
  removeUserFromSmartReceipt,
} from "@/app/smart-receipt/[smartReceiptId]/actions";
import { useRouter } from "next/navigation";
import { SeparatorWithText } from "../ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { LoadingButton } from "../LoadingButton/LoadingButton";
import { SmartReceiptUserSearchModalListItem } from "./SmartReceiptUserSearchModalListItem";
import { SmartReceiptUserSearchModalExistingList } from "./SmartReceiptUserSearchModalExistingList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";

interface SmartReceiptUserSearchModalProps
  extends Omit<ComponentProps<typeof Popover>, "open" | "onOpenChange"> {
  smartReceiptId: SmartReceipt["id"];
  users: UserType[];
  guests: SmartReceiptGuest[];
  formDisabled?: boolean;
  currentUserIsOwner?: boolean;
  currentUser?: UserType;
}

export const SmartReceiptUserSearchModal = ({
  smartReceiptId,
  users,
  guests,
  formDisabled = false,
  currentUserIsOwner = false,
  currentUser,
}: SmartReceiptUserSearchModalProps) => {
  const [query, setQuery] = useState("");
  const [guestName, setGuestName] = useState("");
  const [debouncedGuestName, setDebouncedGuestName] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedGuestName(guestName), 400);
    return () => clearTimeout(id);
  }, [guestName]);

  const [pendingMutations, setPendingMutations] = useState<string[]>([]);
  const [_, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();

  const rerender = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["user-search", query],
    queryFn: async () => await searchUsers(query),
  });

  const {
    data: validateGuestNameData,
    isLoading: isLoadingGuestNameValidation,
  } = useQuery({
    queryKey: ["validate-guest-name", debouncedGuestName],
    queryFn: async () =>
      await checkGuestNameValidity(smartReceiptId, debouncedGuestName),
    enabled: debouncedGuestName.length > 0 && formatName(debouncedGuestName).length >= 2,
  });

  const { mutate: mutateAddUser } = useMutation({
    mutationFn: async (userId: UserType["id"]) => {
      setPendingMutations((prev) => [...prev, userId]);

      try {
        await addUserToSmartReceipt(smartReceiptId, userId);
      } finally {
        setPendingMutations((prev) => prev.filter((id) => id !== userId));
      }
    },
    onSuccess: () => {
      rerender();
      toast.success("User added");
    },
  });

  const { mutate: mutateRemoveUser } = useMutation({
    mutationFn: async (userId: UserType["id"]) => {
      setPendingMutations((prev) => [...prev, userId]);

      try {
        await removeUserFromSmartReceipt(smartReceiptId, userId);
      } finally {
        setPendingMutations((prev) => prev.filter((id) => id !== userId));
      }
    },
    onSuccess: () => {
      rerender();
      toast.success("User removed");
    },
  });

  const { mutate: mutateAddGuest, isPending: mutateAddGuestIsPending } =
    useMutation({
      mutationFn: async (name: string) =>
        await addGuestToSmartReceipt(smartReceiptId, name),
      onSuccess: () => {
        setGuestName("");
        rerender();

        toast.success("Guest added");
        queryClient.invalidateQueries({
          queryKey: ["validate-guest-name", guestName],
        });
      },
    });

  const getIcon = (userId: string) => {
    const hasPendingMutation = pendingMutations.includes(userId);

    if (hasPendingMutation) {
      return <Spinner className="ml-auto" />;
    }

    return (
      <Check
        className={cn(
          "ml-auto",
          users.find((u) => u.id === userId) ? "opacity-100" : "opacity-0",
        )}
      />
    );
  };

  const handleUserSelect = (userId: UserType["id"]) => {
    if (pendingMutations.includes(userId)) {
      return;
    }

    const isSelected = users.find((u) => u.id === userId);
    if (isSelected) {
      mutateRemoveUser(userId);
    } else {
      mutateAddUser(userId);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-1">
      {formDisabled && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Disabled</AlertTitle>
          <AlertDescription>
            You do not have permission to manage users on this smart receipt.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="add">Add users</TabsTrigger>
          <TabsTrigger value="manage">Manage users</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="w-full flex flex-col gap-4">
          <SeparatorWithText text="Add users" />
          <div className="relative w-full group">
            <TextInput
              placeholder="Search for users to add..."
              disabled={formDisabled}
              value={query}
              onChange={(e) => {
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

          <SeparatorWithText text="Or add guests" />

          <div>
            <div className="flex flex-row gap-1 items-center w-full [&>div]:w-full">
              <div className="relative [&>div]:w-full">
                <TextInput
                  placeholder="Guest name..."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="[&>input]:w-full"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {validateGuestNameData?.valid &&
                    !isLoadingGuestNameValidation &&
                    guestName.length > 0 &&
                    formatName(guestName).length >= 2 && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  {isLoadingGuestNameValidation && (
                    <Spinner className="h-4 w-4" />
                  )}
                </span>
              </div>
              <LoadingButton
                size="icon"
                variant="outline"
                className="px-3"
                isLoading={mutateAddGuestIsPending}
                disabled={
                  formatName(guestName).length < 2 ||
                  formDisabled ||
                  validateGuestNameData?.valid === false
                }
                onClick={() => mutateAddGuest(guestName)}
              >
                {!mutateAddGuestIsPending && (
                  <UserRoundPlus className="h-4 w-4" />
                )}
              </LoadingButton>
            </div>
            {!isLoadingGuestNameValidation &&
              validateGuestNameData?.valid === false &&
              validateGuestNameData?.existing === true && (
                <p className="text-red-400 text-xs sm:text-sm mt-2">
                  Guest by this name already exists.
                </p>
              )}
          </div>

          {currentUser && (
            <>
              <SeparatorWithText text="Or add from existing smart receipt" />
              <SmartReceiptUserSearchModalExistingList
                currentUser={currentUser}
                smartReceiptId={smartReceiptId}
                formDisabled={formDisabled}
                currentUserIsOwner={currentUserIsOwner}
              />
            </>
          )}
        </TabsContent>
        <TabsContent value="manage" className="w-full">
          <div className="flex flex-col gap-2 rounded-md">
            {/* <div className="flex flex-row gap-2 items-center">
                <User className="h-6 w-6" />
                <h3 className="font-medium text-xl">Users</h3>
              </div> */}
            {/* <Separator className="bg-muted-foreground/50" /> */}
            <ul className="flex flex-col gap-2">
              {users.map((user) => (
                <SmartReceiptUserSearchModalListItem
                  key={user.id}
                  user={user}
                  smartReceiptId={smartReceiptId}
                  formDisabled={formDisabled}
                  currentUserIsOwner={currentUserIsOwner}
                />
              ))}
            </ul>

            {guests.length > 0 && (
              <ul className="flex flex-col gap-2">
                {guests.map((guest) => (
                  <SmartReceiptUserSearchModalListItem
                    key={guest.id}
                    guest={guest}
                    smartReceiptId={smartReceiptId}
                    formDisabled={formDisabled}
                    currentUserIsOwner={currentUserIsOwner}
                  />
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* <SeparatorWithText text="Users" className="mt-2" /> */}
      {/* <Separator className="my-2" /> */}
    </div>
  );
};
