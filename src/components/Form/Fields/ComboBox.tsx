"use client";

import { type ComponentProps, forwardRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/utils/utils";
import type { ControllerRenderProps } from "react-hook-form";
import { Label } from "@/components/ui/label";
import type { BaseInputProps } from ".";

export interface ComboBoxItem {
  label: string;
  value: string;
  keywords?: string[];
}

interface ComboBoxBaseProps extends ComponentProps<typeof Popover> {
  items: ComboBoxItem[];
  value?: string;
  autoFocus?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}

export const ComboBoxBase = forwardRef<HTMLButtonElement, ComboBoxBaseProps>(
  ({ items, defaultOpen = false, value, autoFocus, onValueChange, disabled = false }, ref) => {
    const [open, setOpen] = useState(autoFocus || defaultOpen);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            // biome-ignore lint/a11y/useSemanticElements: <is fine>
            role="combobox"
            disabled={disabled}
            aria-expanded={open}
            className="w-full justify-between font-normal focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {value
              ? items.find((item) => item.value === value)?.label
              : "Select..."}
            <ChevronsUpDown className="ml-auto opacity-50 h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command
            autoFocus={autoFocus}
            filter={(value, search, keywords) =>
              `${value}${keywords?.join(" ") ?? ""}`
                .toLowerCase()
                .includes(search.toLowerCase())
                ? 1
                : 0
            }
          >
            <CommandInput placeholder="Search..." className="h-9" />
            <CommandList>
              <CommandEmpty>Nothing found.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    keywords={item.keywords}
                    onSelect={(currentValue) => {
                      onValueChange?.(
                        currentValue === value ? "" : currentValue,
                      );
                      setOpen(false);
                    }}
                  >
                    {item.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === item.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

ComboBoxBase.displayName = "ComboBoxBase";

export type ComboboxProps = {
  required?: boolean;
  disabled?: boolean;
  onChange?: ControllerRenderProps["onChange"];
  autoFocus?: boolean;
} & Omit<ComponentProps<typeof ComboBoxBase>, "onValueChange"> &
  BaseInputProps;

export const ComboBox = forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    { label, description, error, required, onChange, autoFocus, disabled = false, ...props },
    ref,
  ) => {
    return (
      <div>
        {label && (
          <>
            <span
              className={cn("flex flex-row items-center gap-1", {
                "mb-1.5": !description,
              })}
            >
              <Label>{label}</Label>
              {required && (
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
              )}
            </span>
            {description && (
              <p className="text-xs text-muted-foreground line mt-0.5 ml-px mb-1.5">
                {description}
              </p>
            )}
          </>
        )}
        <ComboBoxBase
          ref={ref}
          onValueChange={onChange}
          autoFocus={autoFocus}
          disabled={disabled}
          {...props}
        />
        {error && <span className="ml-1 text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);

ComboBox.displayName = "ComboBox";
