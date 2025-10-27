import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { type DefaultValues, type FieldValues, useForm } from "react-hook-form";
import type z from "zod";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type {
  MultiStepPart,
  MultiStepPartDefaultRenderProps,
} from "./multi-step";
import { useMultiStep, useMultiStepPart } from "./multi-step.context";

// biome-ignore lint/suspicious/noExplicitAny: not needed
type FormOutputSchema = z.ZodType<any, FieldValues>;

export type MultiStepPartFormRenderProps<TOutput extends FormOutputSchema> =
  MultiStepPartDefaultRenderProps<TOutput> & {
    form: ReturnType<typeof useForm<z.infer<TOutput>>>;
  };

/** Type helper to define a multi step part with proper generics. */
export function defineMultiStepFormPart<
  const TId extends string,
  const TOutput extends FormOutputSchema
>({
  render: RenderComposed,
  ...restPart
}: Omit<
  Extract<
    MultiStepPart<TOutput, TId, MultiStepPartFormRenderProps<TOutput>>,
    { hasOutput: true }
  >,
  "hasOutput"
>): Extract<MultiStepPart<TOutput, TId>, { hasOutput: true }> {
  return {
    ...restPart,
    hasOutput: true,
    render: ({ defaultValues, ...rest }) => {
      if (!rest.part.hasOutput)
        throw new Error("MultiStepFormPart requires an output schema");

      // biome-ignore lint/suspicious/noExplicitAny: too complex
      const form = useForm<any>({
        resolver: zodResolver(rest.part.output),
        defaultValues: defaultValues as DefaultValues<typeof defaultValues>,
      });
      return (
        <MultiStepPartForm form={form}>
          <RenderComposed form={form} defaultValues={defaultValues} {...rest} />
        </MultiStepPartForm>
      );
    },
  };
}

export function MultiStepPartForm({
  className,
  children,
  form,
  ...restProps
}: React.ComponentProps<"form"> & {
  form: ReturnType<typeof useForm>;
}) {
  const multiStep = useMultiStep();
  const thisPart = useMultiStepPart();

  return (
    <Form {...form}>
      <form
        id={thisPart.id}
        className={cn("space-y-4", className)}
        onSubmit={form.handleSubmit(multiStep.onComplete)}
        {...restProps}
      >
        {children}
      </form>
    </Form>
  );
}
