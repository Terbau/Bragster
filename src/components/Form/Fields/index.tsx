import { Input as ShadcnInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/utils";
import { type ComponentProps, type FC, forwardRef, useId } from "react";
import { TextInput, type TextInputProps } from "./TextInput";
import { NumberInput, type NumberInputProps } from "./NumberInput";
import { Textarea, type TextareaProps } from "./Textarea";
import { Select, type SelectProps } from "./Select";
import { ComboBox, type ComboboxProps } from "./ComboBox";
import { Datepicker, type DatepickerProps } from "./Datepicker";
import {
  type Control,
  Controller,
  type FieldValue,
  type FormState,
  type UseFormRegister,
  type FieldValues,
} from "react-hook-form";
import { FileInput, type FileInputProps } from "./FileInput";

export interface InputFieldContext<T extends FieldValues> {
  name: FieldValue<T>;
  register: UseFormRegister<T>;
  control: Control<T>;
  state: FormState<T>;
  defaultValue: FieldValue<T>;
  disabled?: boolean;
}
export type InputProducerResult<F extends FieldValues> = FC<
  InputFieldContext<F>
>;

export type BaseInputProps = {
  label?: string;
  description?: string;
  error?: string;
};

export type InputProps = ComponentProps<typeof ShadcnInput> & BaseInputProps;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, description, error, className, required, ...props }, ref) => {
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
        <ShadcnInput
          ref={ref}
          id={id}
          required={required}
          className={cn("h-10", { "mt-1.5": label }, className)}
          {...props}
        />
        {error && <span className="ml-1 text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";

// Helper functions

export function createTextInput<F extends FieldValues>({
  ...props
}: Omit<TextInputProps, "error">): InputProducerResult<F> {
  return function FormTextInput({ name, state, control, disabled }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TextInput
            {...props}
            disabled={disabled}
            error={state.errors[name]?.message}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
    );
  };
}

export function createNumberInput<F extends FieldValues>({
  ...props
}: Omit<NumberInputProps, "error">): InputProducerResult<F> {
  return function FormNumberInput({ name, state, control, disabled }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <NumberInput
            {...props}
            disabled={disabled}
            error={state.errors[name]?.message}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = value === "" ? null : Number(value);
              field.onChange(numValue);
            }}
            value={field.value ?? ""}
          />
        )}
      />
    );
  };
}

export function createTextareaInput<F extends FieldValues>({
  ...props
}: Omit<TextareaProps, "error">): InputProducerResult<F> {
  return function FormTextareaInput({ name, state, control, disabled }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Textarea
            {...props}
            disabled={disabled}
            error={state.errors[name]?.message}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
    );
  };
}

export function createSelectInput<F extends FieldValues>({
  ...props
}: Omit<SelectProps, "error">): InputProducerResult<F> {
  return function FormSelectInput({ name, state, control, disabled }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            {...props}
            disabled={disabled}
            error={state.errors[name]?.message}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
    );
  };
}

export function createComboboxInput<F extends FieldValues>({
  ...props
}: Omit<ComboboxProps, "error">): InputProducerResult<F> {
  return function FormComboboxInput({ name, state, control, disabled }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <ComboBox
            {...props}
            disabled={disabled}
            error={state.errors[name]?.message}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
    );
  };
}

export function createDatepickerInput<F extends FieldValues>({
  ...props
}: Omit<DatepickerProps, "error">): InputProducerResult<F> {
  return function FormDatepickerInput({ name, state, control, disabled }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Datepicker
            {...props}
            disabled={disabled}
            error={state.errors[name]?.message}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
    );
  };
}

export function createFileInput<F extends FieldValues>({
  ...props
}: Omit<FileInputProps, "error">): InputProducerResult<F> {
  return function FormFileInput({ name, state, control, disabled }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FileInput
            {...props}
            disabled={disabled}
            error={state.errors[name]?.message}
            onChange={field.onChange}
          />
        )}
      />
    );
  };
}
