"use client";

import { SiGithub } from "@icons-pack/react-simple-icons";
import { CheckIcon, ExternalLinkIcon } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const ORG_ROLES = Object.freeze([
  "CEO",
  "CTO",
  "Lead",
  "Staff",
  "Developer",
  "Intern",
]);

const parts = Object.freeze([
  defineMultiStepPart({
    id: "name-step",
    title: "What is your name?",
    output: z.object({
      lastName: z.string().min(1),
      firstName: z.string().min(1),
    }),
    defaults: (data) => ({
      firstName: data.firstName || "John",
      lastName: data.lastName || "Doe",
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
    id: "org-step",
    title: "What about your organization?",
    output: z.object({
      name: z.string().min(1, "Organization name is required"),
      role: z.enum(ORG_ROLES),
    }),
    defaults: (data) => ({
      name: data.name || String(),
      role: data.role || "Developer",
    }),
    render: (props) => (
      <MultiStepFormPart {...props}>
        <OrgFormContent />
        <MultiStepFooter>
          <MultiStepBackButton />
          <MultiStepNextButton />
        </MultiStepFooter>
      </MultiStepFormPart>
    ),
  }),

  defineMultiStepPart({
    id: "success-panel",
    indicator: <CheckIcon />,
    title: "Welcome aboard!",
    defaults: () => undefined as never,
    render: ({ next }) => (
      <div>
        <span className="flex items-center gap-2">
          Please make sure all your information is correct before submitting.
        </span>
        <MultiStepFooter>
          <MultiStepBackButton />
          <MultiStepNextButton onClick={() => next()} />
        </MultiStepFooter>
      </div>
    ),
  }),
]);

function DeliverWizard() {
  return (
    <div className="before:absolute before:-inset-px before:bg-linear-to-br before:from-primary/60 before:to-accent before:to-40% before:-z-5 before:rounded-lg relative max-w-sm w-full">
      <MultiStep
        parts={parts}
        className="max-w-sm w-full bg-linear-to-br from-card to-background p-6 rounded-lg relative"
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
  );
}

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
        className="flex items-center gap-3 font-medium cursor-pointer active:scale-98"
        asChild
      >
        <a href={GITHUB_REPO_URL}>
          <SiGithub className="size-4" />
          Visit the Repository
          <ExternalLinkIcon />
        </a>
      </Button>
      <DeliverWizard />
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

function OrgFormContent() {
  const form = useFormContext<InferMultiStepOutput<Parts, "org-step">>();

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Organization Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What is your role?</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ORG_ROLES.map((role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    className="cursor-pointer"
                  >
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
