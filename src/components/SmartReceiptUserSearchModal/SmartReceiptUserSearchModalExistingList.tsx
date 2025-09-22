import { useQuery } from "@tanstack/react-query";
import type { User } from "@/lib/generated/prisma";
import { getSmartReceiptsForUser } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { Accordion } from "../ui/accordion";
import { SmartReceiptUserSearchModalExistingListItem } from "./SmartReceiptUserSearchModalExistingListItem";
import { Spinner } from "../Spinner";

interface SmartReceiptUserSearchModalExistingListProps {
  currentUser: User;
  smartReceiptId: string;
  formDisabled?: boolean;
  currentUserIsOwner?: boolean;
}

export const SmartReceiptUserSearchModalExistingList = ({
  currentUser,
  smartReceiptId,
  formDisabled = false,
  currentUserIsOwner = false,
}: SmartReceiptUserSearchModalExistingListProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["smart-receipts"],
    queryFn: async () => await getSmartReceiptsForUser(currentUser.id),
  });

  return (
    <>
      {isLoading && <Spinner className="h-5 w-5 mx-auto" />}
      {data && data.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No smart receipts found.
        </p>
      )}
      {data && data.length > 0 && (
        <Accordion type="single" collapsible className="[]">
          {data
            ?.filter((smartReceipt) => smartReceipt.id !== smartReceiptId)
            .map((smartReceipt) => (
              <SmartReceiptUserSearchModalExistingListItem
                key={smartReceipt.id}
                currentSmartReceiptId={smartReceiptId}
                smartReceipt={smartReceipt}
                formDisabled={formDisabled}
                currentUserIsOwner={currentUserIsOwner}
                currentUser={currentUser}
                className="last:border-b-0"
              />
            ))}
        </Accordion>
      )}
    </>
  );
};
