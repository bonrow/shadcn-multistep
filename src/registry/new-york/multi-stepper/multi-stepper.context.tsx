import React from "react";
import type {
  InferMultiStepFormData,
  MultiStep,
  MultiStepPartArray,
} from "./multi-stepper";
import type { MultiStepperControls } from "./multi-stepper.controls";

export interface MultiStepperContext<
  TParts extends MultiStepPartArray = MultiStepPartArray,
  TStep extends MultiStep<TParts> = MultiStep<TParts>
> {
  /** The current direction of the stepper. */
  readonly direction: number;
  readonly parts: TParts;
  readonly step: MultiStep<TParts>;
  readonly controls: MultiStepperControls<TParts>;

  onComplete(data: InferMultiStepFormData<TParts, TStep>): void;
}

const MultiStepperContext = React.createContext<MultiStepperContext | null>(
  null
);

const MultiStepperPartContext = React.createContext<
  MultiStepPartArray[number] | null
>(null);

export const MultiStepperProvider = MultiStepperContext.Provider;

export const MultiStepperPartProvider = MultiStepperPartContext.Provider;

export function useMultiStepper() {
  const context = React.useContext(MultiStepperContext);
  if (!context) throw new Error("Missing MultiStepperContext provider");
  return context;
}

export function useMultiStepperPart<TParts extends MultiStepPartArray>() {
  const context = React.useContext(MultiStepperPartContext) as
    | TParts[number]
    | null;
  if (!context) throw new Error("Missing MultiStepperPartContext provider");
  return context;
}
