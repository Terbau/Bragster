import type { ComponentProps } from "react";
import type { ButtonProps } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { LoadingButton } from "../LoadingButton/LoadingButton";

export interface AlertDialogAction {
  variant?: ButtonProps["variant"];
  label: string;
  isLoading?: boolean;
  onClick: () => void;
}

export interface AlertDialogProps extends ComponentProps<typeof Dialog> {
  title?: string;
  description?: string;
  actions: AlertDialogAction[];
}

export const AlertDialog = ({
  title,
  description,
  ...props
}: AlertDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent>
        {title && <DialogTitle>{title}</DialogTitle>}
        {description && <DialogDescription>{description}</DialogDescription>}
        <div className="flex flex-row items-center justify-end w-full mt-4 gap-2">
          {props.actions.map((action, index) => (
            <LoadingButton
              key={`${action.label}-${index}`}
              variant={action.variant ?? "secondary"}
              isLoading={action.isLoading ?? false}
              onClick={action.onClick}
            >
              {action.label}
            </LoadingButton>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
