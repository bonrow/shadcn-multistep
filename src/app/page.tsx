"use client";

import { SiGithub } from "@icons-pack/react-simple-icons";
import {
  CheckIcon,
  ExternalLinkIcon,
  HomeIcon,
  SendIcon,
  User2Icon,
} from "lucide-react";
import { useFormContext } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
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

const GITHUB_REPO_URL = "https://github.com/bonrow/shadcn-multistep";

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
      lastName: data.lastName || "John",
      firstName: data.firstName || "Doe",
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
          <MultiStepBackButton />
          <MultiStepNextButton onClick={() => next()} />
        </MultiStepFooter>
      </div>
    ),
  }),
]);

export default function Home() {
  return (
    <div className="w-full h-dvh flex items-center justify-center flex-col gap-12 p-5 md:p-2">
      <h1 className="text-3xl/tight font-semibold tracking-tight">
        Create beautiful multi-step forms and wizards <br />
        in minutes.{" "}
        <span className="font-normal text-muted-foreground">
          Skip the unnecessary boilerplate.
        </span>
      </h1>
      <Button
        variant="secondary"
        className="flex items-center gap-3 tracking-tight font-medium text-base cursor-pointer active:scale-98"
        asChild
      >
        <a href={GITHUB_REPO_URL}>
          <SiGithub className="size-4" />
          Visit the Repository
          <ExternalLinkIcon />
        </a>
      </Button>
      <div className="max-w-sm w-full bg-linear-to-br from-card to-background p-6 rounded-lg relative before:absolute before:-inset-px before:bg-linear-to-br before:from-primary/60 before:to-accent before:to-40% before:-z-5 before:rounded-lg">
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
              <Input placeholder="First Name" {...field} />
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
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input placeholder="Last Name" {...field} />
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
  );
}
