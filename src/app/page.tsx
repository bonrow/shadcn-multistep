"use client";

import z from "zod";
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
  MultiStepper,
  MultiStepperCurrentStep,
  MultiStepperFooter,
  MultiStepperPartForm,
} from "@/registry/new-york/multi-stepper/multi-stepper";

const parts = Object.freeze([
  defineMultiStepPart({
    id: "step-1",
    title: "Step 1",
    formData: z.object({
      email: z.string().min(2),
    }),
    defaultValues: { email: "" },
    render: ({ form }) => (
      <MultiStepperPartForm form={form}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </MultiStepperPartForm>
    ),
  }),
  defineMultiStepPart({
    id: "step-2",
    title: "Step 2",
    formData: z.object({
      address: z.string().min(2),
      city: z.string().min(2),
    }),
    defaultValues: { address: "", city: "" },
    render: ({ form }) => (
      <MultiStepperPartForm form={form}>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </MultiStepperPartForm>
    ),
  }),
] as const);

export default function Home() {
  return (
    <div>
      Hello world
      <MultiStepper
        parts={parts}
        className="absolute left-1/2 top-1/2 -translate-1/2 w-sm bg-card p-6 rounded-lg"
      >
        <MultiStepperCurrentStep />
        <MultiStepperFooter />
      </MultiStepper>
    </div>
  );
}
