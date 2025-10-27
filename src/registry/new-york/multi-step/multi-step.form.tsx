import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import type {
  InferMultiStepDefaults,
  InferMultiStepNextFn,
  MultiStepPartArray,
} from "./multi-step";

export function MultiStepFormPart<TPart extends MultiStepPartArray[number]>({
  part,
  defaults,
  children,
  next,
  ...restProps
}: Omit<React.ComponentProps<"form">, "part"> & {
  part: TPart;
  defaults: InferMultiStepDefaults<[TPart], TPart["id"]>;
  next: InferMultiStepNextFn<[TPart], TPart["id"]>;
}) {
  const form = useForm({
    resolver: zodResolver(part.output),
    defaultValues: defaults,
  });

  return (
    <Form {...form}>
      <form
        data-slot="multistep-part-form"
        onSubmit={form.handleSubmit(next)}
        {...restProps}
      >
        {children}
      </form>
    </Form>
  );
}
