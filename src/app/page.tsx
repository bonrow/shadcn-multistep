"use client";

import {
  CheckCircleIcon,
  CheckIcon,
  FileInputIcon,
  HomeIcon,
  MailIcon,
  SendIcon,
  User2Icon,
  UserIcon,
} from "lucide-react";
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
  MultiStep,
  MultiStepCurrentPart,
  MultiStepFooter,
  MultiStepTitle,
} from "@/registry/new-york/multi-step/multi-step";
import { defineMultiStepFormPart } from "@/registry/new-york/multi-step/multi-step.form";
import { MultiStepIndicator } from "@/registry/new-york/multi-step/multi-step.indicator";

const parts = Object.freeze([
  defineMultiStepFormPart({
    id: "step-1",
    indicator: <MailIcon />,
    title: "What's your email?",
    output: z.object({
      email: z.email("Invalid email address").min(2, "Email is required"),
    }),
    defaultValues: (data) => ({
      email: data.email || String(),
    }),
    render: ({ form }) => (
      <>
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
      </>
    ),
  }),
  defineMultiStepFormPart({
    id: "step-2",
    indicator: <HomeIcon />,
    title: "Where should we deliver to?",
    output: z.object({
      address: z.string().min(2),
      city: z.string().min(2),
    }),
    defaultValues: (data) => ({
      address: data.address || String(),
      city: data.city || String(),
    }),
    render: ({ form }) => (
      <>
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
      </>
    ),
  }),
  defineMultiStepFormPart({
    id: "step-3",
    indicator: <User2Icon />,
    title: "Select a username",
    output: z.object({
      username: z.string().min(2),
    }),
    defaultValues: (data) => ({
      username: data.username || String(),
    }),
    render: ({ form }) => (
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
    ),
  }),
  defineMultiStepPart({
    id: "success-panel",
    indicator: <SendIcon />,
    title: "Success!",
    hasOutput: false,
    render: () => (
      <div>You have successfully completed the multi-step form!</div>
    ),
  }),
] as const);

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
