import { forwardRef } from "react";
import type { ControllerRenderProps } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/utils/utils";
import { Calendar, type CalendarProps } from "../../ui/calendar";
import { Label } from "../../ui/label";
import type { BaseInputProps } from ".";

export type BaseDatepickerProps = {
  value?: Date;
  onChange?: ControllerRenderProps["onChange"];
} & Omit<CalendarProps, "onSelect" | "selected" | "onSelect" | "mode">;

export const BaseDatepicker = forwardRef<
  HTMLButtonElement,
  BaseDatepickerProps
>(({ value, onChange, ...props }, ref) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] pl-3 text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          {value ? format(value, "PPP") : <span>Pick a date</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={(value) =>
            value > new Date() || value < new Date("1900-01-01")
          }
          {...props}
        />
      </PopoverContent>
    </Popover>
  );
});
BaseDatepicker.displayName = "BaseDatepicker";

export type DatepickerProps = {
  required?: boolean;
} & BaseDatepickerProps &
  BaseInputProps;

export const Datepicker = forwardRef<HTMLButtonElement, DatepickerProps>(
  ({ label, description, required, error, ...props }, ref) => {
    return (
      <div>
        {label && (
          <>
            <span className="flex flex-row items-center gap-1">
              <Label>{label}</Label>
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
        <BaseDatepicker ref={ref} {...props} />
        {error && <span className="ml-1 text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);
