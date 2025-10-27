"use client";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { type ComponentProps } from "react";
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

// ########################### <TYPE HELPERS>  ###########################
// Move these helpers if you find them useful elsewhere
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

type GetPartiableKeys<TObj> = {
  [K in keyof TObj]: TObj[K] extends undefined ? K : never;
}[keyof TObj];

type WithRequired<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

type DefaultValues<
  TObject,
  _TPartKeys extends keyof TObject = GetPartiableKeys<TObject>,
> = TObject & Partial<Pick<TObject, _TPartKeys>>;
// ########################### </ TYPE HELPERS>  ###########################

export type MultiStepOutput = z.ZodType | undefined;

export type MultiStepPartFromStep<
  TParts extends MultiStepPartArray,
  TStep extends MultiStep<TParts>,
> = Extract<TParts[number], { id: TStep }>;

export type MultiStepPartArray = ReadonlyArray<
  // biome-ignore lint/suspicious/noExplicitAny: simplicity
  Readonly<MultiStepPart<any, any, any, any, any>>
>;

/** Extracts a union of all the IDs in `TPart`. */
export type MultiStep<TParts extends MultiStepPartArray> = TParts[number]["id"];

export type InferMultiStepPartByStep<
  TParts extends MultiStepPartArray,
  TStep extends MultiStep<TParts>,
> = Extract<TParts[number], { id: TStep }>;

/** Infers the `output` of `TStep` in `TParts`, or returns `never`. */
export type InferMultiStepOutput<
  TParts extends MultiStepPartArray,
  TStep extends MultiStep<TParts>,
> = z.infer<NonNullable<InferMultiStepPartByStep<TParts, TStep>["output"]>>;

export type InferMultiStepNextFn<
  TParts extends MultiStepPartArray,
  TStep extends MultiStep<TParts>,
> = InferMultiStepRenderProps<TParts, TStep>["next"];

export type InferMultiStepDefaults<
  TParts extends MultiStepPartArray,
  TStep extends MultiStep<TParts>,
> = InferMultiStepRenderProps<TParts, TStep>["defaults"];

export type InferMultiStepRenderProps<
  TParts extends MultiStepPartArray,
  TStep extends MultiStep<TParts>,
> = ComponentProps<InferMultiStepPartByStep<TParts, TStep>["render"]>;

export type MultiStepPartDefaultRenderProps<TOutput extends MultiStepOutput> = {
  stepper: MultiStepContext;
  defaultValues: Partial<z.infer<TOutput>>;
  part: MultiStepPart<TOutput>;
};

type PartWithGuaranteedOutput<
  TOutput extends MultiStepOutput = MultiStepOutput,
  TId extends string = string,
  TComputeResult extends unknown | Promise<unknown> =
    | unknown
    | Promise<unknown>,
> = WithRequired<
  MultiStepPart<TOutput, TId, TComputeResult>,
  "output" | "defaults"
>;

type PartAsGuaranteedOutput<TPart> = TPart extends MultiStepPart<
  infer TOutput,
  infer TId,
  infer TComputeResult
>
  ? PartWithGuaranteedOutput<TOutput, TId, TComputeResult>
  : never;

export type MultiStepComputeResult<T> = T & {
  isValid: boolean;
};

export type MultiStepPart<
  TOutput extends MultiStepOutput = MultiStepOutput,
  TId extends string = string,
  TComputeResult = unknown,
  _TOut = TOutput extends undefined ? undefined : z.infer<TOutput>,
  _TDefaults = DefaultValues<_TOut>,
> = {
  id: TId;
  title: React.ReactNode;
  indicator?: React.ReactNode;
  compute?: (arg: {
    inputs: _TOut;
    part: PartWithGuaranteedOutput<TOutput, TId, TComputeResult>;
  }) =>
    | MultiStepComputeResult<TComputeResult>
    | Promise<MultiStepComputeResult<TComputeResult>>;

  /**
   * Renders this part of the multi-step.
   *
   * Use the props' `part` and `defaultValues` to access the part definition
   * and default values respectively. Also, the `part` does expose the attachments,
   * meaning you can access them via `part.attachments` to access crucial context.
   */
  render: React.FC<{
    part: PartWithGuaranteedOutput<TOutput, TId, TComputeResult>;
    context: MultiStepContext;
    defaults: _TDefaults;
    next: (
      ...[output]: undefined extends TOutput
        ? [output?: _TOut]
        : [output: _TOut]
    ) => Promise<TComputeResult>;
  }>;
} & (
  | { output: TOutput; defaults: (saved: Partial<_TOut>) => _TDefaults }
  | { output?: TOutput; defaults?: (saved: Partial<_TOut>) => _TDefaults }
);

/** Extracts the merged result of all steps through forming an intersection. */
export type MultiStepMergedResult<TParts extends MultiStepPartArray> =
  MergeUnionToObject<FilterOutput<TParts[number]>>;

type FilterOutput<T> = T extends { output: infer TOutput }
  ? unknown extends z.infer<TOutput>
    ? never
    : z.infer<TOutput>
  : never;

export type MultiStepPartsResult<TParts extends MultiStepPartArray> = {
  [K in MultiStep<TParts> as undefined extends Extract<
    TParts[number],
    { id: K }
  >["output"]
    ? never
    : K]: InferMultiStepOutput<TParts, K>;
};

export type MultiStepCheckedResult<TParts extends MultiStepPartArray> = {
  merged: MultiStepMergedResult<TParts>;
  parts: MultiStepPartsResult<TParts>;
};

/**
 * @param TParts The array of multi-step parts.
 * @param TRequired The steps that are required to be completed.
 */
export type MultiStepUncheckedResult<TParts extends MultiStepPartArray> = {
  merged: Partial<MultiStepMergedResult<TParts>>;
  parts: Partial<MultiStepCheckedResult<TParts>["parts"]>;
};

export type MultiStepStateProbeContext<TParts extends MultiStepPartArray> = {
  /** Returns the stepper's partial result with everything gathered. */
  partial(): MultiStepUncheckedResult<TParts>;
  /** Returns the stepper's complete result and throws an error if it's not complete. */
  complete(): MultiStepCheckedResult<TParts>;
};

export const defineMultiStepParts = <TParts extends MultiStepPartArray>(
  parts: TParts,
) => parts;

/** Type helper to define a multi step part with proper generics. */
export const defineMultiStepPart = <
  TOutput extends MultiStepOutput,
  TId extends string,
  TComputeResult = unknown,
>(
  part: MultiStepPart<TOutput, TId, TComputeResult>,
): Readonly<MultiStepPart<TOutput, TId, TComputeResult>> => part;

const transition = Object.freeze({
  type: "spring",
  stiffness: 300,
  damping: 26,
} as const);

/** [Framer Motion] used to animate the multi-step form */
const slideVariants = {
  enter: (direction: number) => ({
    position: "absolute",
    x: direction > 0 ? "100%" : "-100%",
    opacity: 1,
    transition,
  }),
  center: {
    position: "relative",
    x: 0,
    opacity: 1,
    transition,
  },
  exit: (direction: number) => ({
    position: "absolute",
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    transition,
  }),
};

export function MultiStep<TParts extends MultiStepPartArray>({
  parts,
  step,
  defaultStep = parts[0]?.id,
  onStepChange,
  onFinish,
  className,
  state,
  disabled,
  ...restProps
}: React.ComponentProps<"section"> & {
  parts: TParts;
  defaultStep?: MultiStep<TParts>;
  step?: MultiStep<TParts>;
  onStepChange?: (step: MultiStep<TParts>) => void;
  onFinish?: (ctx: MultiStepStateProbeContext<TParts>) => unknown;
  state?: MultiStepContext["state"];
  disabled?: boolean;
}) {
  const directionRef = React.useRef(0);
  const [_step, _setStep] = React.useState(defaultStep);
  const [_state, _setState] = React.useState<MultiStepContext["state"]>("idle");
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

  React.useEffect(() => {
    if (state === undefined) return;
    _setState(state);
  }, [state]);

  const createStateProbe = React.useCallback(
    (res: () => (typeof resultRef)["current"]) => ({
      partial: () => res() as MultiStepUncheckedResult<TParts>,
      complete: () => {
        const result = res();
        const resultParts = result.parts;
        if (!resultParts) throw new Error("No parts data available.");
        const notCompletePart = parts.find(
          (p) => p.output && !(p.id in resultParts),
        );
        if (notCompletePart)
          throw new Error(`Part "${notCompletePart.id}" is not complete.`);
        return result as unknown as MultiStepCheckedResult<TParts>;
      },
    }),
    [parts],
  );

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
        // We don't want future holders of onFinish to have mutable state,
        // which is why we store the reference as a memory addressable snapshot
        // here, such that onFinish's argument is stable.
        const stateRefSnapshot = resultRef.current;
        onFinishRef.current?.(createStateProbe(() => stateRefSnapshot));
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
  }, [parts, _step, createStateProbe]);

  return (
    <MultiStepProvider
      value={{
        parts,
        step: _step,
        direction: directionRef.current,
        controls,
        disabled: _state === "submitting" || disabled,
        state: _state,
        setState: _setState,
        result: () => resultRef.current,
        onComplete: async (data) => {
          const part = controls.part();
          if (!part.output) return;
          // Store the data in the result ref
          const p = (resultRef.current.parts ??
            {}) as MultiStepUncheckedResult<TParts>["parts"];
          p[_step as keyof typeof p] = data;
          resultRef.current.parts =
            p as MultiStepUncheckedResult<TParts>["parts"];
          resultRef.current.merged = {
            ...resultRef.current.merged,
            ...data,
          };
        },
      }}
    >
      <section
        className={cn(
          "flex flex-col gap-6 overflow-hidden relative",
          className,
        )}
        {...restProps}
      />
    </MultiStepProvider>
  );
}

export function MultiStepCurrentPart(
  props: Omit<React.ComponentProps<typeof motion.div>, "children">,
) {
  const multiStep = useMultiStep();

  return (
    <div className="relative">
      <AnimatePresence custom={multiStep.direction} initial={false}>
        {multiStep.parts.map((part) =>
          part.id === multiStep.controls.step ? (
            <MultiStepPart
              parts={multiStep.parts}
              step={part.id}
              key={part.id}
              {...props}
            />
          ) : null,
        )}
      </AnimatePresence>
    </div>
  );
}

function MultiStepPart<
  TParts extends MultiStepPartArray,
  TStep extends MultiStep<TParts>,
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

  const resultParts = multiStep.result().parts;

  const defaults = React.useMemo(() => {
    if (!part.defaults) return {};
    if (resultParts && part.id in resultParts)
      return part.defaults(resultParts[part.id as keyof typeof resultParts]);
    return part.defaults({});
  }, [part, resultParts]);

  const next = React.useCallback(
    async (output: unknown) => {
      if (part.compute) {
        const res = await part.compute({
          inputs: output,
          part: part as PartAsGuaranteedOutput<typeof part>,
        });
        if (!res.isValid) return;
      }
      if (multiStep.controls.step === part.id) {
        multiStep.onComplete(output);
      }
      multiStep.controls.next();
    },
    [multiStep, part],
  );

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
          part={part as PartAsGuaranteedOutput<typeof part>}
          context={multiStep}
          defaults={defaults}
          next={next}
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
  const multiStep = useMultiStep();
  const singleStep = useMultiStepPartUnsafe();

  // If this title is used within a part, use that part here, otherwise
  // use the current active step (used within MultiStep directly).
  // This is useful to allow for titles to be used within steps to have them
  // within the animation (which may be accessible though!).
  const current = singleStep?.id ?? multiStep.controls.step;
  const part = multiStep.controls.parts.find((p) => p.id === current);

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
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 justify-end *:not-disabled:cursor-pointer mt-6",
        className,
      )}
      {...restProps}
    />
  );
}

export function MultiStepBackButton(
  props: Omit<React.ComponentProps<typeof Button>, "children">,
) {
  const multiStep = useMultiStep();

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => multiStep.controls.back()}
      disabled={multiStep.disabled || !multiStep.controls.hasPrevious()}
      {...props}
    >
      Back
    </Button>
  );
}

export function MultiStepNextButton(
  props: Omit<React.ComponentProps<typeof Button>, "children">,
) {
  const multiStep = useMultiStep();

  return (
    <Button type="submit" disabled={multiStep.disabled} {...props}>
      {multiStep.controls.hasNext() ? "Next" : "Complete"}
    </Button>
  );
}
