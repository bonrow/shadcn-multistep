import type { MultiStep, MultiStepPartArray } from "./multi-step";

export interface MultiStepControls<TParts extends MultiStepPartArray> {
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

export abstract class AbstractMultiStepControls<
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
    const nextPart = this.parts[currentIndex + 1];
    if (nextPart == null) return false;
    this.setStep(nextPart.id);
    return true;
  }

  back(): boolean {
    const currentIndex = this.index();
    const lastPart = this.parts[currentIndex - 1];
    if (lastPart == null) return false;
    this.setStep(lastPart.id);
    return true;
  }

  part(): TParts[number] {
    const part = this.parts[this.index()];
    if (!part) throw new Error(); // shouldn't be possible
    return part;
  }

  hasNext(): boolean {
    return this.index() < this.parts.length - 1;
  }

  hasPrevious(): boolean {
    return this.index() > 0;
  }
}

export class ObservableMultiStepControls<
  TParts extends MultiStepPartArray
> extends AbstractMultiStepControls<TParts> {
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
      this: ObservableMultiStepControls<TParts>,
      step: MultiStep<TParts>
    ) => void;
    onFinish: (this: ObservableMultiStepControls<TParts>) => void;
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
