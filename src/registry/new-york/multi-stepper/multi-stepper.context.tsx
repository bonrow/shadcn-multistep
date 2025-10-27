import React from "react";
import type {
  InferMultiStepOutput,
  MultiStep,
  MultiStepPartArray,
  MultiStepUncheckedResult,
} from "./multi-stepper";
import type { MultiStepControls } from "./multi-stepper.controls";

export interface MultiStepContext<
  TParts extends MultiStepPartArray = MultiStepPartArray,
  TStep extends MultiStep<TParts> = MultiStep<TParts>
> {
  /** The current direction of the stepper. */
  readonly direction: number;
  readonly parts: TParts;
  readonly step: MultiStep<TParts>;
  readonly controls: MultiStepControls<TParts>;
  readonly result: () => Partial<MultiStepUncheckedResult<TParts>>;

  onComplete(data: InferMultiStepOutput<TParts, TStep>): void;
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
