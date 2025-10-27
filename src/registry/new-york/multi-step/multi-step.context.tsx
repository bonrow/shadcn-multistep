import React from "react";
import type {
  InferMultiStepOutput,
  MultiStep,
  MultiStepPartArray,
  MultiStepUncheckedResult,
} from "./multi-step";
import type { MultiStepControls } from "./multi-step.controls";

export interface MultiStepContext<
  TParts extends MultiStepPartArray = MultiStepPartArray,
  TStep extends MultiStep<TParts> = MultiStep<TParts>,
> {
  /** The current direction of the stepper. */
  readonly direction: number;
  readonly parts: TParts;
  readonly step: MultiStep<TParts>;
  readonly controls: MultiStepControls<TParts>;
  readonly result: () => Partial<MultiStepUncheckedResult<TParts>>;

  readonly state: "idle" | "submitting";
  readonly disabled: boolean | undefined;

  setState(state: "idle" | "submitting"): void;

  onComplete(
    data: InferMultiStepOutput<TParts, TStep>,
  ): unknown | Promise<unknown>;
}

const MultiStepContext = React.createContext<MultiStepContext | null>(null);

const MultiStepPartContext = React.createContext<
  MultiStepPartArray[number] | null
>(null);

export const MultiStepProvider = MultiStepContext.Provider;

export const MultiStepPartProvider = MultiStepPartContext.Provider;

export function useMultiStep() {
  const context = React.useContext(MultiStepContext);
  if (!context) throw new Error("Missing MultiStepContext provider");
  return context;
}

export function useMultiStepPart<TParts extends MultiStepPartArray>() {
  const context = React.useContext(MultiStepPartContext) as
    | TParts[number]
    | null;
  if (!context) throw new Error("Missing MultiStepPartContext provider");
  return context;
}

export const useMultiStepPartUnsafe = () =>
  React.useContext(MultiStepPartContext);
