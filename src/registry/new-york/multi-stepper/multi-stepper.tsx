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
  defaultValues?: Partial<z.infer<TFormData>>;
  render: React.FC<{
    form: ReturnType<typeof useForm<z.infer<TFormData>>>;
    part: MultiStepPart<TFormData>;
  }>;
};

/** Extracts the merged result of all steps through forming an intersection. */
export type MultiStepMergedResult<TParts extends MultiStepPartArray> =
  MergeUnionToObject<z.infer<TParts[number]["formData"]>>;

export type MultiStepperResult<TParts extends MultiStepPartArray> = {
  merged: MultiStepMergedResult<TParts>;
  parts: {
    [K in MultiStep<TParts>]: InferMultiStepFormData<TParts, K>;
  };
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
    opacity: 0,
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
    opacity: 0,
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
}: React.ComponentProps<"div"> & {
  parts: TParts;
  defaultStep?: MultiStep<TParts>;
  step?: MultiStep<TParts>;
  onStepChange?: (step: MultiStep<TParts>) => void;
  onFinish?: (data: MultiStepperResult<TParts>) => void;
}) {
  const directionRef = React.useRef(0);
  const [_step, _setStep] = React.useState(defaultStep);
  const resultRef = React.useRef<Partial<MultiStepperResult<TParts>>>({});

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
        onFinishRef.current?.(resultRef.current as MultiStepperResult<TParts>);
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
        onComplete(data) {
          const p = (resultRef.current.parts ??
            {}) as MultiStepperResult<TParts>["parts"];
          p[_step] = data;
          resultRef.current.parts = p as MultiStepperResult<TParts>["parts"];
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
    <AnimatePresence custom={multiStep.direction}>
      {multiStep.parts.map((part) =>
        part.id === multiStep.controls.step ? (
          <MultiStepPart parts={multiStep.parts} step={part.id} key={part.id} />
        ) : null
      )}
    </AnimatePresence>
  );
}

function MultiStepPart<
  TParts extends MultiStepPartArray,
  TStep extends MultiStep<TParts>
>({
  parts,
  step,
  children,
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
    defaultValues: part.defaultValues,
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
