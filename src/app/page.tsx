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
  MultiStepperTitle,
} from "@/registry/new-york/multi-stepper/multi-stepper";

const parts = Object.freeze([
  defineMultiStepPart({
    id: "step-1",
    title: "What's your email?",
    formData: z.object({
      email: z.email("Invalid email address").min(2, "Email is required"),
    }),
    defaultValues: (data) => ({
      email: data.email || String(),
    }),
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
    title: "Where should we deliver to?",
    formData: z.object({
      address: z.string().min(2),
      city: z.string().min(2),
    }),
    defaultValues: (data) => ({
      address: data.address || String(),
      city: data.city || String(),
    }),
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
  defineMultiStepPart({
    id: "step-3",
    title: "Select a username",
    formData: z.object({
      username: z.string().min(2),
    }),
    defaultValues: (data) => ({
      username: data.username || String(),
    }),
    render: ({ form }) => (
      <MultiStepperPartForm form={form}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
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
      <div className="absolute left-1/2 top-1/2 -translate-1/2 w-sm bg-card p-6 rounded-lg">
        <MultiStepper
          parts={parts}
          onFinish={({ partial, complete }) => {
            // Prints the stepper's partial result with everything gathered.
            console.log("Partial result:", partial());

            // Prints the stepper's complete result and throws an error if it's not complete.
            console.log("Full result:", complete());
          }}
        >
          <MultiStepperTitle />
          <MultiStepperCurrentStep />
          <MultiStepperFooter />
        </MultiStepper>
      </div>
    </div>
  );
}
