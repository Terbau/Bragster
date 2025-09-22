"use client";

import {
  type ComponentProps,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  useRef,
  type Ref,
  forwardRef,
  useImperativeHandle,
} from "react";
import { cn, createFormDataFromRecord } from "@/utils/utils";
import type { InputProducerResult } from "./Fields";
import type { z, ZodEffects, ZodObject, ZodRawShape } from "zod";
import {
  type DefaultValues,
  useForm,
  type UseFormReturn,
  type UseFormSetValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "../LoadingButton/LoadingButton";
import { Button } from "../ui/button";
import { Tooltip } from "../Tooltip";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";

export interface FormButton
  extends Omit<ComponentPropsWithoutRef<typeof LoadingButton>, "children"> {
  label?: string;
}

export interface StandardFormProps<
  T extends ZodRawShape,
  ActionReturnType = unknown,
> extends Omit<ComponentPropsWithoutRef<"form">, "onSubmit" | "action"> {
  schema: ZodEffects<ZodObject<T>> | ZodObject<T>;
  fields: Partial<{
    [K in keyof z.infer<ZodObject<T>>]: InputProducerResult<
      z.infer<ZodObject<T>>
    >;
  }>;
  defaultValues?: DefaultValues<z.infer<ZodObject<T>>>;
  title?: string;
  description?: string;
  disableSubmitWhenClean?: boolean;
  submitLabel?: string;
  submitIsLoading?: boolean;
  onSubmit?: (
    data: z.infer<ZodObject<T>>,
    form: UseFormReturn<z.infer<ZodObject<T>>>,
  ) => void;
  action?: (formData: FormData) => Promise<ActionReturnType>;
  onActionLoading?: (isLoading: boolean) => void;
  onActionResult?: (result: Awaited<ActionReturnType> | undefined) => void;
  extraFieldButtons?: Partial<
    Record<
      keyof z.infer<ZodObject<T>>,
      (ComponentProps<typeof Button> & { tooltip?: string })[]
    >
  >;
  extraButtons?: FormButton[];
  formDisabled?: boolean;
  formDisabledTitle?: string;
  formDisabledReason?: string;
}

export type StandardFormHandle<T extends ZodRawShape> = {
  submit: () => void;
  setValue: UseFormSetValue<z.infer<ZodObject<T>>>;
};

export const StandardFormInner = <
  T extends z.ZodRawShape,
  ActionReturnType = unknown,
>(
  {
    schema,
    fields,
    defaultValues,
    title,
    description,
    disableSubmitWhenClean = true,
    submitLabel = "Submit",
    submitIsLoading = false,
    onSubmit,
    action,
    onActionLoading,
    onActionResult,
    extraFieldButtons,
    extraButtons,
    formDisabled = false,
    formDisabledTitle = "Disabled",
    formDisabledReason = "You do not have permission.",
    className,
    ...props
  }: StandardFormProps<T, ActionReturnType>,
  ref: Ref<StandardFormHandle<T>>,
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<z.infer<ZodObject<T>>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useImperativeHandle(ref, () => ({
    submit: () => formRef.current?.requestSubmit(),
    setValue: form.setValue,
  }));

  const components = useMemo(
    () =>
      Object.entries(fields).map(([name, fc]) => {
        if (!fc) {
          throw new Error();
        }
        const Component: InputProducerResult<z.infer<z.ZodObject<T>>> = fc;
        const CreatedComponent = (
          <Component
            defaultValue={form.formState.defaultValues?.[name]}
            key={name}
            name={name}
            register={form.register}
            control={form.control}
            state={form.formState}
            disabled={formDisabled}
          />
        );

        if (!extraFieldButtons?.[name]) return CreatedComponent;

        return (
          <div
            key={`fieldcontainer-${name}`}
            className="flex flex-row gap-1 items-end"
          >
            {CreatedComponent}
            {extraFieldButtons?.[name]?.map(
              ({ className, tooltip, disabled, ...buttonProps }, index) => {
                const buttonComponent = (
                  <Button
                    type="button"
                    key={`extra-field-button-${name}-${index + 1}`}
                    className={cn("shrink-0", className)}
                    disabled={formDisabled || disabled}
                    {...buttonProps}
                  />
                );

                if (!tooltip) return buttonComponent;

                return (
                  <Tooltip
                    key={`extra-field-button-tooltip-${name}-${index + 1}`}
                    text={tooltip}
                    asChild
                  >
                    {buttonComponent}
                  </Tooltip>
                );
              },
            )}
          </div>
        );
      }),
    [
      fields,
      form.formState,
      form.control,
      form.register,
      extraFieldButtons,
      formDisabled,
    ],
  );

  return (
    <form
      ref={formRef}
      className={cn("flex flex-col gap-4", className)}
      onSubmit={(e) => {
        return form.handleSubmit(async (values) => {
          setIsSubmitting(true);
          onActionLoading?.(true);

          try {
            onSubmit?.(values, form);
            const actionResult = await action?.(
              createFormDataFromRecord(values),
            );
            onActionResult?.(actionResult);
          } finally {
            setIsSubmitting(false);
            onActionLoading?.(false);
          }
        })(e);
      }}
      {...props}
    >
      {formDisabled && (formDisabledTitle || formDisabledReason) && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          {formDisabledTitle && <AlertTitle>{formDisabledTitle}</AlertTitle>}
          {formDisabledReason && (
            <AlertDescription>{formDisabledReason}</AlertDescription>
          )}
        </Alert>
      )}
      {(title || description) && (
        <div className="flex flex-col gap-2 mb-2">
          {title && <h2 className="text-2xl font-bold">{title}</h2>}
          {description && (
            <p className="text-sm text-foreground/60">{description}</p>
          )}
        </div>
      )}
      {components}
      {(onSubmit || action || (extraButtons?.length ?? 0) > 0) && (
        <div className="flex flex-row gap-2">
          {(onSubmit || action) && (
            <LoadingButton
              type="submit"
              disabled={
                formDisabled ||
                (disableSubmitWhenClean && !form.formState.isDirty)
              }
              variant="default"
              isLoading={submitIsLoading || isSubmitting}
            >
              {submitLabel}
            </LoadingButton>
          )}
          {extraButtons?.map(({ label, disabled, ...buttonProps }) => (
            <LoadingButton
              key={label}
              disabled={formDisabled || disabled}
              {...buttonProps}
            >
              {label}
            </LoadingButton>
          ))}
        </div>
      )}
    </form>
  );
};

export const StandardForm = forwardRef(StandardFormInner) as <
  T extends z.ZodRawShape,
  ActionReturnType = unknown,
>(
  props: StandardFormProps<T, ActionReturnType> & {
    ref?: Ref<StandardFormHandle<T>>;
  },
) => ReturnType<typeof StandardFormInner>;
