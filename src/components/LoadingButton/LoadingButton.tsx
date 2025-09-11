import { forwardRef } from "react";
import { buttonVariants, type ButtonProps } from "../ui/button";
import { cn } from "@/utils/utils";
import { Slot } from "@radix-ui/react-slot";
import { Icon } from "@iconify/react";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  disableOnLoad?: boolean;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      isLoading = false,
      className,
      variant,
      size,
      disableOnLoad = true,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          "flex flex-row gap-1 items-center",
          "disabled:cursor-not-allowed"
        )}
        disabled={disabled || (disableOnLoad && isLoading)}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <Icon icon="line-md:loading-loop" className="animate-spin" />
        )}
        <span>{children}</span>
      </Comp>
    );
  },
);
LoadingButton.displayName = "LoadingButton";
