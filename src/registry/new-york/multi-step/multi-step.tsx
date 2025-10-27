"use client";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type MultiStepContext,
  MultiStepPartProvider,
  MultiStepProvider,
  useMultiStep,
  useMultiStepPartUnsafe,
} from "./multi-step.context";
import { ObservableMultiStepControls } from "./multi-step.controls";

//! You should move these type helpers to a separate file if you plan to reuse them
// biome-ignore lint/suspicious/noExplicitAny: needed for type helper
type UnionKeys<U> = U extends any ? keyof U : never;
type MergeUnionToObject<U> = {
  // biome-ignore lint/suspicious/noExplicitAny: needed for type helper
  [K in UnionKeys<U>]: U extends any
    ? K extends keyof U
      ? U[K]
      : never
    : never;
};

/** Readonly array with readonly parts (useful for freezed constants). */
// biome-ignore lint/suspicious/noExplicitAny: needed for deep reference (render->part)
export type MultiStepPartArray = ReadonlyArray<Readonly<MultiStepPart<any>>>;

/** Extracts a union of all the IDs in `TPart`. */
export type MultiStep<TParts extends MultiStepPartArray> = TParts[number]["id"];

/** Infers the `output` of `TStep` in `TParts`, or returns `never`. */
export type InferMultiStepOutput<
  TParts extends MultiStepPartArray,
  TStep extends MultiStep<TParts>
> = z.infer<Extract<TParts[number], { id: TStep }>["output"]>;

/** Data representation of a single **part** in a multi-stepper. */
export type MultiStepPart<
  TOutput extends z.ZodType = z.ZodType,
  TId extends string = string,
  TRenderArgs = MultiStepPartDefaultRenderProps<TOutput>
> = {
  id: TId;
  title: React.ReactNode;
  indicator?: React.ReactNode;
  defaultValues?: (
    data: Partial<z.infer<TOutput>>
  ) => Partial<z.infer<TOutput>>;
  render: React.FC<TRenderArgs>;
} & (
  | { hasOutput: true; output: TOutput }
  | { hasOutput: false; output?: TOutput }
);

export type MultiStepPartDefaultRenderProps<TOutput extends z.ZodType> = {
  stepper: MultiStepContext;
  defaultValues: Partial<z.infer<TOutput>>;
  part: MultiStepPart<TOutput>;
};

/** Extracts the merged result of all steps through forming an intersection. */
export type MultiStepMergedResult<TParts extends MultiStepPartArray> =
  MergeUnionToObject<FilterOutput<TParts[number]>>;

type FilterOutput<T> = T extends { hasOutput: true; output: infer TOutput }
  ? unknown extends z.infer<TOutput>
    ? never
    : z.infer<TOutput>
  : never;

export type MultiStepPartsResult<TParts extends MultiStepPartArray> = {
  [K in MultiStep<TParts> as Extract<
    TParts[number],
    { id: K }
  >["hasOutput"] extends true
    ? K
    : never]: InferMultiStepOutput<TParts, K>;
};

export type MultiStepCheckedResult<TParts extends MultiStepPartArray> = {
  merged: MultiStepMergedResult<TParts>;
  parts: MultiStepPartsResult<TParts>;
};

export type MultiStepUncheckedResult<TParts extends MultiStepPartArray> = {
  merged: Partial<MultiStepMergedResult<TParts>>;
  parts: Partial<MultiStepCheckedResult<TParts>["parts"]>;
};

export const defineMultiStepParts = <TParts extends MultiStepPartArray>(
  parts: TParts
) => parts;

/** Type helper to define a multi step part with proper generics. */
export const defineMultiStepPart = <
  TOutput extends z.ZodType,
  TId extends string
>(
  part: MultiStepPart<TOutput, TId>
): MultiStepPart<TOutput, TId> => part;

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

export function MultiStep<TParts extends MultiStepPartArray>({
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
    partial(): MultiStepUncheckedResult<TParts>;
    /** Returns the stepper's complete result and throws an error if it's not complete. */
    complete(): MultiStepCheckedResult<TParts>;
  }) => void;
}) {
  const directionRef = React.useRef(0);
  const [_step, _setStep] = React.useState(defaultStep);
  const resultRef = React.useRef<Partial<MultiStepUncheckedResult<TParts>>>({});

  if (_step == null) throw new Error("MultiStep requires at least one step");

  const onFinishRef = React.useRef(onFinish);
  onFinishRef.current = onFinish;

  const onStepChangeRef = React.useRef(onStepChange);
  onStepChangeRef.current = onStepChange;

  React.useEffect(() => {
    if (step === undefined) return;
    _setStep(step);
  }, [step]);

  const controls = React.useMemo(() => {
    // Ensure each part has a unique ID
    const seenIds = new Set<string>();
    for (const part of parts) {
      if (seenIds.has(part.id))
        throw new Error(`Duplicate part ID found: "${part.id}"`);
      seenIds.add(part.id);
    }

    return new ObservableMultiStepControls<TParts>({
      parts,
      step: _step,
      onFinish() {
        const res = resultRef.current;
        onFinishRef.current?.({
          partial: () => res as MultiStepUncheckedResult<TParts>,
          complete: () => {
            const resultParts = res.parts;
            if (!resultParts) throw new Error("No parts data available.");
            const notCompletePart = parts.find(
              (p) => p.hasOutput && !(p.id in resultParts)
            );
            if (notCompletePart)
              throw new Error(`Part "${notCompletePart.id}" is not complete.`);
            return res as unknown as MultiStepCheckedResult<TParts>;
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
    <MultiStepProvider
      value={{
        parts,
        step: _step,
        direction: directionRef.current,
        controls,
        result: () => resultRef.current,
        onComplete: (data) => {
          const part = controls.part();
          if (part.hasOutput) {
            const p = (resultRef.current.parts ??
              {}) as MultiStepUncheckedResult<TParts>["parts"];
            p[_step as keyof typeof p] = data;
            resultRef.current.parts =
              p as MultiStepUncheckedResult<TParts>["parts"];
            resultRef.current.merged = {
              ...resultRef.current.merged,
              ...data,
            };
          }
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
    </MultiStepProvider>
  );
}

export function MultiStepCurrentPart(
  props: Omit<React.ComponentProps<typeof motion.div>, "children">
) {
  const multiStep = useMultiStep();

  return (
    <div className="relative">
      <AnimatePresence custom={multiStep.direction}>
        {multiStep.parts.map((part) =>
          part.id === multiStep.controls.step ? (
            <MultiStepPart
              parts={multiStep.parts}
              step={part.id}
              key={part.id}
              {...props}
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
  const multiStep = useMultiStep();

  const part = parts.find((s) => s.id === step);
  if (!part) throw new Error(`Step with id "${step}" does not exist.`);

  const resultParts = multiStep.result().parts ?? {};

  const defaultValues = part.defaultValues
    ? part.defaultValues(
        part.id in resultParts
          ? resultParts[part.id as keyof typeof resultParts]
          : {}
      )
    : {};

  return (
    <MultiStepPartProvider value={part}>
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
        <part.render
          stepper={multiStep}
          defaultValues={defaultValues}
          part={part}
        />
      </motion.div>
    </MultiStepPartProvider>
  );
}

export function MultiStepTitle({
  className,
  children,
  ...restProps
}: React.ComponentProps<"h3">) {
  const MultiStep = useMultiStep();
  const singleStep = useMultiStepPartUnsafe();

  // If this title is used within a part, use that part here, otherwise
  // use the current active step (used within MultiStep directly).
  // This is useful to allow for titles to be used within steps to have them
  // within the animation (which may be accessible though!).
  const current = singleStep?.id ?? MultiStep.controls.step;
  const part = MultiStep.controls.parts.find((p) => p.id === current);

  if (!part) throw new Error("MultiStepTitle must be used within a step");

  return (
    <h3
      className={cn("text-lg font-medium flex items-center gap-2", className)}
      {...restProps}
    >
      {children}
      <span>{part.title}</span>
    </h3>
  );
}

export function MultiStepFooter({
  className,
  ...restProps
}: Omit<React.ComponentProps<"div">, "children">) {
  const multiStep = useMultiStep();

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
          Complete
          <ArrowRightIcon />
        </Button>
      )}
    </div>
  );
}
