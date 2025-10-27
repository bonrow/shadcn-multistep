import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { type DefaultValues, useForm } from "react-hook-form";
import type z from "zod";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type {
  MultiStepPart,
  MultiStepPartDefaultRenderProps,
  OutputSchema,
} from "./multi-stepper";
import { useMultiStepper, useMultiStepperPart } from "./multi-stepper.context";

export type MultiStepPartFormRenderProps<TOutput extends OutputSchema> =
  MultiStepPartDefaultRenderProps<TOutput> & {
    form: ReturnType<typeof useForm<z.infer<TOutput>>>;
  };

/** Type helper to define a multi step part with proper generics. */
export function defineMultiStepFormPart<TOutput extends OutputSchema>({
  render: RenderComposed,
  ...restPart
}: Omit<MultiStepPart<TOutput>, "render"> & {
  render: React.FC<MultiStepPartFormRenderProps<TOutput>>;
}): MultiStepPart<TOutput> {
  return {
    ...restPart,
    render: ({ defaultValues, ...rest }) => {
      // biome-ignore lint/suspicious/noExplicitAny: too complex
      const form = useForm<any>({
        resolver: zodResolver(rest.part.output),
        defaultValues: defaultValues as DefaultValues<typeof defaultValues>,
      });
      return (
        <MultiStepperPartForm form={form}>
          <RenderComposed form={form} defaultValues={defaultValues} {...rest} />
        </MultiStepperPartForm>
      );
    },
  };
}

export function MultiStepperPartForm({
  className,
  children,
  form,
  ...restProps
}: React.ComponentProps<"form"> & {
  form: ReturnType<typeof useForm>;
}) {
  const multiStep = useMultiStepper();
  const thisPart = useMultiStepperPart();

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
