"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckIcon,
  HomeIcon,
  MailIcon,
  SendIcon,
  User2Icon,
} from "lucide-react";
import { resolve } from "path";
import { type DefaultValues, useForm, useFormContext } from "react-hook-form";
import z from "zod";
import { partial } from "zod/mini";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  defineMultiStepPart,
  MultiStep,
  MultiStepCurrentPart,
  MultiStepFooter,
  MultiStepTitle,
} from "@/registry/new-york/multi-step/multi-step";
import { MultiStepIndicator } from "@/registry/new-york/multi-step/multi-step.indicator";

const parts = Object.freeze([
  defineMultiStepPart({
    id: "name-step",
    indicator: <User2Icon />,
    title: "What is your name?",
    output: z.object({
      lastName: z.string(),
      firstName: z.string(),
    }),
    defaults: (data) => ({
      lastName: data.lastName || String(),
      firstName: data.firstName || String(),
    }),
    render: ({ defaults, next, part }) => {
      if (!part.output) throw new Error("Part must have output");
      const form = useForm({
        resolver: zodResolver(part.output),
        defaultValues: defaults,
      });
      return (
        <Form {...form}>
          <NameForm next={next} />
          <MultiStepFooter />
        </Form>
      );
    },
  }),

  defineMultiStepPart({
    id: "success-panel",
    indicator: <SendIcon />,
    title: "Success!",
    defaults: () => undefined as never,
    render: ({ next }) => (
      <div>
        <span className="flex items-center gap-2">
          <CheckIcon />
          Success!
        </span>
        <MultiStepFooter onNext={() => next()} />
      </div>
    ),
  }),
]);

export default function Home() {
  // Use mutation query

  return (
    <div>
      Hello world
      <div className="absolute left-1/2 top-1/2 -translate-1/2 w-sm bg-card p-6 rounded-lg">
        <MultiStep
          parts={parts}
          onFinish={({ partial, complete }) => {
            // Prints the stepper's partial result with everything gathered.
            console.log("Partial result:", partial());

            // Prints the stepper's complete result and throws an error if it's not complete.
            console.log("Full result:", complete());
          }}
        >
          <MultiStepIndicator />
          <MultiStepTitle />
          <MultiStepCurrentPart />
        </MultiStep>
      </div>
    </div>
  );
}

function NameForm({
  next,
}: {
  next: (data: { firstName: string; lastName: string }) => void;
}) {
  const form = useFormContext<{
    firstName: string;
    lastName: string;
  }>();

  return (
    <form onSubmit={form.handleSubmit(next)}>
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  );
}
