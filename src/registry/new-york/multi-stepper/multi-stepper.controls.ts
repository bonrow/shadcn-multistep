import type { MultiStep, MultiStepPartArray } from "./multi-stepper";

export interface MultiStepperControls<TParts extends MultiStepPartArray> {
  readonly parts: TParts;
  readonly step: MultiStep<TParts>;

  setStep(step: MultiStep<TParts>): void;
  index(): number;
  next(): boolean;
  back(): boolean;
  part(): TParts[number];
  hasNext(): boolean;
  hasPrevious(): boolean;
}

export abstract class AbstractMultiStepperControls<
  TParts extends MultiStepPartArray
> {
  readonly parts: TParts;
  readonly step: MultiStep<TParts>;

  constructor(parts: TParts, step: MultiStep<TParts>) {
    this.parts = parts;
    this.step = step;
  }

  abstract onFinish(): void;

  abstract setStep(step: MultiStep<TParts>): void;

  index(): number {
    return this.parts.findIndex((p) => p.id === this.step);
  }

  next(): boolean {
    const currentIndex = this.index();
    if (currentIndex === -1) return false;
    if (currentIndex >= this.parts.length - 1) {
      this.onFinish();
      return false;
    }
    this.setStep(this.parts[currentIndex + 1].id);
    return true;
  }

  back(): boolean {
    const currentIndex = this.index();
    if (currentIndex <= 0) return false;
    this.setStep(this.parts[currentIndex - 1].id);
    return true;
  }

  part(): TParts[number] {
    return this.parts[this.index()];
  }

  hasNext(): boolean {
    return this.index() < this.parts.length - 1;
  }

  hasPrevious(): boolean {
    return this.index() > 0;
  }
}

export class ObservableMultiStepperControls<
  TParts extends MultiStepPartArray
> extends AbstractMultiStepperControls<TParts> {
  private _onStepChange: (step: MultiStep<TParts>) => void;
  private _onFinish: () => void;

  constructor({
    parts,
    step,
    onStepChange,
    onFinish,
  }: Readonly<{
    parts: TParts;
    step: MultiStep<TParts>;
    onStepChange: (
      this: ObservableMultiStepperControls<TParts>,
      step: MultiStep<TParts>
    ) => void;
    onFinish: (this: ObservableMultiStepperControls<TParts>) => void;
  }>) {
    super(parts, step);
    this._onStepChange = onStepChange.bind(this);
    this._onFinish = onFinish.bind(this);
  }

  setStep(step: MultiStep<TParts>): void {
    this._onStepChange(step);
  }

  onFinish(): void {
    this._onFinish();
  }
}
