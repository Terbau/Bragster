import { Label } from "@/components/ui/label";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { cn } from "@/utils/utils";
import { type ComponentProps, forwardRef, useId } from "react";
import type { BaseInputProps } from ".";

export type TextareaProps = ComponentProps<typeof ShadcnTextarea> &
  BaseInputProps;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ required, label, description, error, className, ...props }, ref) => {
    const id = useId();
    return (
      <div>
        {label && (
          <>
            <span className="flex flex-row items-center gap-1">
              <Label htmlFor={id}>{label}</Label>
              {required && (
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
              )}
            </span>
            {description && (
              <p className="text-xs text-muted-foreground line mt-0.5 ml-px">
                {description}
              </p>
            )}
          </>
        )}
        <ShadcnTextarea
          ref={ref}
          id={id}
          required={required}
          className={cn("h-20 resize-none", { "mt-1.5": label }, className)}
          {...props}
        />
        {error && <span className="ml-1 text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
