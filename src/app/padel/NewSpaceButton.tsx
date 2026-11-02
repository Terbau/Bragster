"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { padelSpacePath } from "./_components/padelFormat";
import { createPadelSpace } from "./actions";
import { SpaceNameDialog } from "./SpaceNameDialog";

export const NewSpaceButton = ({
  variant = "default",
}: {
  variant?: "default" | "outline";
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1" />
        New space
      </Button>
      <SpaceNameDialog
        open={open}
        title="New space"
        description="A space is for a group that plays together. Its games, players and ratings are kept apart from your other spaces."
        submitLabel="Create space"
        onSubmit={async (name) => {
          const { id } = await createPadelSpace({ name });
          router.push(padelSpacePath(id));
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
};
