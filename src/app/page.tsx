"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HomeIcon, MailIcon, SendIcon, User2Icon } from "lucide-react";
import { resolve } from "path";
import { type DefaultValues, useForm } from "react-hook-form";
import z from "zod";
import { partial } from "zod/mini";
import {
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
  MultiStepPart,
  MultiStepTitle,
} from "@/registry/new-york/multi-step/multi-step";
import { MultiStepIndicator } from "@/registry/new-york/multi-step/multi-step.indicator";

const parts = Object.freeze([
  defineMultiStepPart({
    id: "success-panel",
    indicator: <SendIcon />,
    title: "Success!",
    output: z.object({
      name: z.string().optional(),
    }),
    defaults: (data) => ({
      name: data.name || String(),
    }),
    compute: async () => {
      // Mutate some things and return the result
      await new Promise((r) => setTimeout(r, 1_000));

      return { isValid: true };
    },
    render: ({ defaults: defaultValues, next, part }) => {
      const form = useForm({
        resolver: zodResolver(part.output),
        defaultValues,
      });
      return <form onSubmit={form.handleSubmit(next)}>Success!</form>;
    },
  }),
]);

export default function Home() {
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
          <MultiStepFooter />
        </MultiStep>
      </div>
    </div>
  );
}
