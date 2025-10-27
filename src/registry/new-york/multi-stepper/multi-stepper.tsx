"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { type FieldValues, useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  MultiStepperPartProvider,
  MultiStepperProvider,
  useMultiStepper,
  useMultiStepperPart,
  useMultiStepperPartUnsafe,
} from "./multi-stepper.context";
import { ObservableMultiStepperControls } from "./multi-stepper.controls";

//! You should move these type helpers to a separate file if you plan to reuse them
// biome-ignore lint/suspicious/noExplicitAny: needed for type helper
type UnionKeys<U> = U extends any ? keyof U : never;
type MergeUnionToObject<U> = {
  [K in UnionKeys<U>]: K extends keyof U ? U[K] : never;
};

// biome-ignore lint/suspicious/noExplicitAny: not needed
type FormSchema = z.ZodType<any, FieldValues>;

/** Readonly array with readonly parts (useful for freezed constants). */
// biome-ignore lint/suspicious/noExplicitAny: needed for deep reference (render->part)
export type MultiStepPartArray = ReadonlyArray<Readonly<MultiStepPart<any>>>;

/** Extracts a union of all the IDs in `TPart`. */
export type MultiStep<TParts extends MultiStepPartArray> = TParts[number]["id"];

/** Infers the `formData` of `TStep` in `TParts`, or returns `never`. */
export type InferMultiStepFormData<
  TParts extends MultiStepPartArray,
  TStep extends MultiStep<TParts>
> = z.infer<Extract<TParts[number], { id: TStep }>["formData"]>;

/** Data representation of a single **part** in a multi-stepper. */
export type MultiStepPart<TFormData extends FormSchema = FormSchema> = {
  id: string;
  title: React.ReactNode;
  formData: TFormData;
  icon?: React.ReactNode;
  defaultValues?: (
    data: Partial<z.infer<TFormData>>
  ) => Partial<z.infer<TFormData>>;
  render: React.FC<{
    form: ReturnType<typeof useForm<z.infer<TFormData>>>;
    part: MultiStepPart<TFormData>;
  }>;
};

/** Extracts the merged result of all steps through forming an intersection. */
export type MultiStepperMergedResult<TParts extends MultiStepPartArray> =
  MergeUnionToObject<z.infer<TParts[number]["formData"]>>;

export type MultiStepperPartsResult<TParts extends MultiStepPartArray> = {
  [K in MultiStep<TParts>]: InferMultiStepFormData<TParts, K>;
};

export type MultiStepperCheckedResult<TParts extends MultiStepPartArray> = {
  merged: MultiStepperMergedResult<TParts>;
  parts: MultiStepperPartsResult<TParts>;
};

export type MultiStepperUncheckedResult<TParts extends MultiStepPartArray> = {
  merged: Partial<MultiStepperMergedResult<TParts>>;
  parts: Partial<MultiStepperCheckedResult<TParts>["parts"]>;
};

/** Type helper to define a multi step part with proper generics. */
export const defineMultiStepPart = <TFormData extends FormSchema>(
  part: MultiStepPart<TFormData>
): MultiStepPart<TFormData> => part;

/** [Framer Motion] used to animate the multi-step form */
const slideVariants = {
  enter: (direction: number) => ({
    position: "absolute",
    x: direction > 0 ? "100%" : "-100%",
  }),
  center: {
    position: "relative",
    x: 0,
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: (direction: number) => ({
    position: "absolute",
    x: direction < 0 ? "100%" : "-100%",
    transition: { duration: 0.3 },
  }),
};

export function MultiStepper<TParts extends MultiStepPartArray>({
  parts,
  step,
  defaultStep = parts[0]?.id,
  onStepChange,
  onFinish,
  className,
  ...restProps
}: React.ComponentProps<"section"> & {
  parts: TParts;
  defaultStep?: MultiStep<TParts>;
  step?: MultiStep<TParts>;
  onStepChange?: (step: MultiStep<TParts>) => void;
  onFinish?: (result: {
    /** Returns the stepper's partial result with everything gathered. */
    partial(): MultiStepperUncheckedResult<TParts>;
    /** Returns the stepper's complete result and throws an error if it's not complete. */
    complete(): MultiStepperCheckedResult<TParts>;
  }) => void;
}) {
  const directionRef = React.useRef(0);
  const [_step, _setStep] = React.useState(defaultStep);
  const resultRef = React.useRef<Partial<MultiStepperUncheckedResult<TParts>>>(
    {}
  );

  if (_step == null) throw new Error("MultiStepper requires at least one step");

  const onFinishRef = React.useRef(onFinish);
  onFinishRef.current = onFinish;

  const onStepChangeRef = React.useRef(onStepChange);
  onStepChangeRef.current = onStepChange;

  React.useEffect(() => {
    if (step === undefined) return;
    _setStep(step);
  }, [step]);

  const controls = React.useMemo(() => {
    return new ObservableMultiStepperControls<TParts>({
      parts,
      step: _step,
      onFinish() {
        const res = resultRef.current;
        onFinishRef.current?.({
          partial: () => res as MultiStepperUncheckedResult<TParts>,
          complete: () => {
            const resultParts = res.parts;
            if (!resultParts) throw new Error("No parts data available.");
            const notCompletePart = parts.find((p) => !(p.id in resultParts));
            if (notCompletePart)
              throw new Error(`Part "${notCompletePart.id}" is not complete.`);
            return res as MultiStepperCheckedResult<TParts>;
          },
        });
      },
      onStepChange(newStep) {
        const currentIndex = this.index();
        const newIndex = this.parts.findIndex((p) => p.id === newStep);
        if (newIndex === -1) throw new Error("Step not found in parts");
        directionRef.current = newIndex > currentIndex ? 1 : -1;
        _setStep(newStep);
        onStepChangeRef.current?.(newStep);
      },
    });
  }, [parts, _step]);

  return (
    <MultiStepperProvider
      value={{
        parts,
        step: _step,
        direction: directionRef.current,
        controls,
        result: () => resultRef.current,
        onComplete(data) {
          const p = (resultRef.current.parts ??
            {}) as MultiStepperUncheckedResult<TParts>["parts"];
          p[_step] = data;
          resultRef.current.parts =
            p as MultiStepperUncheckedResult<TParts>["parts"];
          resultRef.current.merged = {
            ...resultRef.current.merged,
            ...data,
          };
          //* Remove this if you don't want to auto-complete on last step submission
          controls.next();
        },
      }}
    >
      <section
        className={cn(
          "flex flex-col gap-6 overflow-hidden relative",
          className
        )}
        {...restProps}
      />
    </MultiStepperProvider>
  );
}

export function MultiStepperCurrentStep() {
  const multiStep = useMultiStepper();

  return (
    <div className="relative">
      <AnimatePresence custom={multiStep.direction}>
        {multiStep.parts.map((part) =>
          part.id === multiStep.controls.step ? (
            <MultiStepPart
              parts={multiStep.parts}
              step={part.id}
              key={part.id}
            />
          ) : null
        )}
      </AnimatePresence>
    </div>
  );
}

function MultiStepPart<
  TParts extends MultiStepPartArray,
  TStep extends MultiStep<TParts>
>({
  parts,
  step,
  children,
  className,
  ...restProps
}: React.ComponentProps<typeof motion.div> & {
  parts: TParts;
  step: TStep;
}) {
  const multiStep = useMultiStepper();

  const part = parts.find((s) => s.id === step);
  if (!part) throw new Error(`Step with id "${step}" does not exist.`);

  const form = useForm({
    resolver: zodResolver(part.formData),
    defaultValues: part.defaultValues?.(
      multiStep.result().parts?.[part.id] ?? {}
    ),
  });

  return (
    <MultiStepperPartProvider value={part}>
      <motion.div
        key={part.id}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        custom={multiStep.direction}
        className={cn("relative w-full", className)}
        {...restProps}
      >
        <part.render form={form} part={part} />
      </motion.div>
    </MultiStepperPartProvider>
  );
}

export function MultiStepperPartForm({
  form,
  className,
  children,
  ...restProps
}: React.ComponentProps<"form"> & {
  // biome-ignore lint/suspicious/noExplicitAny: not needed
  form: ReturnType<typeof useForm<any>>;
}) {
  const multiStep = useMultiStepper();
  const thisPart = useMultiStepperPart();

  return (
    <Form {...form}>
      <form
        id={thisPart.id}
        className={cn("space-y-4", className)}
        onSubmit={form.handleSubmit(multiStep.onComplete)}
        {...restProps}
      >
        {children}
      </form>
    </Form>
  );
}

export function MultiStepperTitle({
  className,
  children,
  ...restProps
}: React.ComponentProps<"h3">) {
  const multiStepper = useMultiStepper();
  const singleStep = useMultiStepperPartUnsafe();

  // If this title is used within a part, use that part here, otherwise
  // use the current active step (used within MultiStepper directly).
  // This is useful to allow for titles to be used within steps to have them
  // within the animation (which may be accessible though!).
  const current = singleStep?.id ?? multiStepper.controls.step;
  const part = multiStepper.controls.parts.find((p) => p.id === current);

  if (!part) throw new Error("MultiStepperTitle must be used within a step");

  return (
    <h3
      className={cn("text-lg font-medium flex items-center gap-2", className)}
      {...restProps}
    >
      {children}
      {part.icon}
      <span>{part.title}</span>
    </h3>
  );
}

export function MultiStepperFooter({
  className,
  ...restProps
}: Omit<React.ComponentProps<"div">, "children">) {
  const multiStep = useMultiStepper();

  return (
    <div
      className={cn(
        "flex items-center gap-2 justify-end *:not-disabled:cursor-pointer",
        className
      )}
      {...restProps}
    >
      {multiStep.controls.hasPrevious() && (
        <Button
          type="button"
          variant="secondary"
          onClick={() => multiStep.controls.back()}
        >
          <ArrowLeftIcon />
          Back
        </Button>
      )}
      {multiStep.controls.hasNext() ? (
        <Button type="submit" form={multiStep.controls.part().id}>
          Next
          <ArrowRightIcon />
        </Button>
      ) : (
        <Button type="submit" form={multiStep.controls.part().id}>
          Finish
          <ArrowRightIcon />
        </Button>
      )}
    </div>
  );
}
