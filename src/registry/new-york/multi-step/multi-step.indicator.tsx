import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { cn } from "@/lib/utils";
import { useMultiStep } from "./multi-step.context";

const cvaIndicatorVariants = cva(
  "rounded-full bg-accent size-8 shrink-0 flex items-center justify-center font-medium border mx-1 tabular-nums font-mono text-sm [&_svg:not([class*='size-'])]:size-4 relative",
  {
    variants: {
      state: {
        upcoming: "text-muted-foreground",
        current: "bg-primary text-primary-foreground",
        completed: "text-muted-foreground opacity-60",
      },
    },
    defaultVariants: {
      state: "upcoming",
    },
  },
);

export function MultiStepIndicator({
  state,
  className,
  ...restProps
}: Omit<React.ComponentProps<"div">, "children"> &
  VariantProps<typeof cvaIndicatorVariants>) {
  const multiStep = useMultiStep();

  return (
    <div
      aria-hidden
      className={cn("flex items-center", className)}
      {...restProps}
    >
      {multiStep.parts.map((part, index) => (
        <React.Fragment key={part.id}>
          <div
            className={cvaIndicatorVariants({
              state:
                index < multiStep.controls.index()
                  ? "completed"
                  : index === multiStep.controls.index()
                    ? "current"
                    : "upcoming",
            })}
          >
            {part.indicator ?? 1 + index}
          </div>
          {index !== multiStep.parts.length - 1 && (
            <div className="h-0.5 bg-accent w-full rounded-full" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
