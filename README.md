# bonrow's shadcn-multistep

Create stunning wizards and multi-step forms in a handful of minutes. 
Completely type-safe. In **React** using **shadcn**, **zod** and **react-hook-form**.

## Installation
```bash
# pnpm
pnpm dlx shadcn@latest add https://shadcn-multistep.vercel.app/r/multi-step.json

# npm
npx shadcn@latest add https://shadcn-multistep.vercel.app/r/multi-step.json

# Bun
bunx --bun shadcn@latest add https://shadcn-multistep.vercel.app/r/multi-step.json
```

> [!IMPORTANT]
> This project is still very early stage, but works after intensive manual tests. Automatic tests and a proper README are also planned.

## Example
```tsx
import {
  defineMultiStepPart,
  type InferMultiStepOutput,
  MultiStep,
  MultiStepBackButton,
  MultiStepCurrentPart,
  MultiStepFooter,
  MultiStepNextButton,
  MultiStepTitle,
} from "@/components/multi-step";
import { MultiStepFormPart } from "@/components/multi-step.form";
import { MultiStepIndicator } from "@/components/multi-step.indicator";

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
  // ... more steps here ...
]);

function DeliverWizard() {
  return (
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
  );
}
```


## Breakdown
```tsx
import {
  defineMultiStepPart,
  type InferMultiStepOutput,
  MultiStep,
  MultiStepBackButton,
  MultiStepCurrentPart,
  MultiStepFooter,
  MultiStepNextButton,
  MultiStepTitle,
} from "@/components/multi-step";
import { MultiStepFormPart } from "@/components/multi-step.form";
import { MultiStepIndicator } from "@/components/multi-step.indicator";

const parts = Object.freeze([
  defineMultiStepPart({
    id: "name-step",
    indicator: <User2Icon />,
    title: "What is your name?",
    // We can optionally omit both `output` and `defaults`. Not every step
    // requires to return any result.
    output: z.object({
      lastName: z.string().min(1),
      firstName: z.string().min(1),
    }),
    defaults: (data) => ({
      lastName: data.lastName || "John",
      firstName: data.firstName || "Doe",
    }),
    // We can omit compute if we don't want to compute anything after.
    // The `compute` function is triggered using the renderer's props.next(...)
    compute: async ({ inputs, part }) => {
      // We could do some computing or IO here. Like doing a useMutation
      // or fetching data based on the inputs. During this time, the stepper
      // is disabled. Like using this "expensive computation":
      await new Promise((r) => setTimeout(r, 1_000));
      // We have to return isValid: true/false to indicate if the step is valid
      // and whether to continue to the next step. We can also add custom fields
      // that are used as the promise result of the renderer's props.next(...).
      return { isValid: true };
    },
    // The render `props` is destructable into `{ context, defaults, next, part }`
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

  // ... more steps here ...
]);

function DeliverWizard() {
  return (
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
  );
}
```
