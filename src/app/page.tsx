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
import { Button } from "@/components/ui/button";
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
  type InferMultiStepNextFn,
  type InferMultiStepOutput,
  MultiStep,
  MultiStepBackButton,
  MultiStepCurrentPart,
  MultiStepFooter,
  MultiStepNextButton,
  MultiStepTitle,
} from "@/registry/new-york/multi-step/multi-step";
import { MultiStepFormPart } from "@/registry/new-york/multi-step/multi-step.form";
import { MultiStepIndicator } from "@/registry/new-york/multi-step/multi-step.indicator";

type Parts = typeof parts;

const parts = Object.freeze([
  defineMultiStepPart({
    id: "name-step",
    indicator: <User2Icon />,
    title: "What is your name?",
    output: z.object({
      lastName: z.string().min(1),
      firstName: z.string().min(1),
    }),
    defaults: (data) => ({
      lastName: data.lastName || String(),
      firstName: data.firstName || String(),
    }),
    render: (props) => (
      <MultiStepFormPart {...props}>
        <NameFormContent />
        <MultiStepFooter>
          <MultiStepBackButton />
          <MultiStepNextButton />
        </MultiStepFooter>
      </MultiStepFormPart>
    ),
  }),

  defineMultiStepPart({
    id: "address-step",
    indicator: <HomeIcon />,
    title: "Where should we deliver to?",
    output: z.object({
      address: z.string().min(3),
      city: z.string().min(3),
    }),
    defaults: (data) => ({
      address: data.address || String(),
      city: data.city || String(),
    }),
    render: (props) => (
      <MultiStepFormPart {...props}>
        <AddressFormContent />
        <MultiStepFooter>
          <MultiStepBackButton />
          <MultiStepNextButton />
        </MultiStepFooter>
      </MultiStepFormPart>
    ),
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
        <MultiStepFooter>
          <MultiStepNextButton onClick={() => next()} />
        </MultiStepFooter>
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
          <MultiStepCurrentPart className="[&_form]:space-y-5" />
        </MultiStep>
      </div>
    </div>
  );
}

function NameFormContent() {
  const form = useFormContext<InferMultiStepOutput<Parts, "name-step">>();

  return (
    <>
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
    </>
  );
}

function AddressFormContent() {
  const form = useFormContext<InferMultiStepOutput<Parts, "address-step">>();

  return (
    <>
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input {...field} />
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
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
