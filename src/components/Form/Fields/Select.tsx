import type { ControllerRenderProps } from "react-hook-form";
import { cn } from "@/utils/utils";
import {
  Select as ShadcnSelect,
  SelectItem as ShadcnSelectItem,
  SelectGroup as ShadcnSelectGroup,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { type ComponentProps, forwardRef, useCallback, useId } from "react";
import type { BaseInputProps } from ".";

export type SelectItem = {
  label: string;
  value: string;
};

export type SelectGroup = {
  label: string;
  items: SelectItem[];
};

export type SelectProps = {
  items?: SelectItem[] | SelectGroup[];
  onChange?: ControllerRenderProps["onChange"];
} & ComponentProps<typeof ShadcnSelect> &
  BaseInputProps;

function isGroupedItems(
  items: SelectItem[] | SelectGroup[] | undefined,
): items is SelectGroup[] {
  return Array.isArray(items) && items.length > 0 && "items" in items[0];
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    { items, onChange, required, label, description, error, value, ...props },
    ref,
  ) => {
    const id = useId();

    const isGrouped = isGroupedItems(items);

    const renderItems = useCallback((items: SelectItem[]) => {
      return items.map((item) => (
        <ShadcnSelectItem key={item.value} value={item.value}>
          {item.label}
        </ShadcnSelectItem>
      ));
    }, []);

    const createGroups = useCallback(
      (groups: SelectGroup[]) => {
        return groups.map((group) => (
          <ShadcnSelectGroup key={group.label}>
            {renderItems(group.items)}
          </ShadcnSelectGroup>
        ));
      },
      [renderItems],
    );

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
        <ShadcnSelect
          defaultValue={value}
          value={value}
          onValueChange={onChange}
          required={required}
          {...props}
        >
          <SelectTrigger
            ref={ref}
            className={cn("h-10", { "mt-1.5": label })}
            aria-invalid={error ? "true" : "false"}
          >
            <SelectValue placeholder="Choose a value" />
          </SelectTrigger>
          <SelectContent>
            {isGrouped
              ? createGroups(items as SelectGroup[])
              : renderItems(items ?? [])}
          </SelectContent>
        </ShadcnSelect>
        {error && <span className="ml-1 text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);
Select.displayName = "Select";
