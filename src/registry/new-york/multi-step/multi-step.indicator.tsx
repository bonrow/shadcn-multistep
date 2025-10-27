import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";
import { useMultiStep } from "./multi-step.context";

const cvaIndicatorVariants = cva(
  "rounded-full bg-accent size-8 shrink-0 flex items-center justify-center font-medium border tabular-nums font-mono text-sm [&_svg:not([class*='size-'])]:size-4 relative transition-colors duration-300",
  {
    variants: {
      state: {
        upcoming: "text-muted-foreground opacity-60",
        current: "bg-accent shadow-xl",
        completed: "text-primary-foreground text-primary bg-primary",
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
            <div className="relative w-full h-0.5">
              {index < multiStep.controls.index() && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="absolute h-full bg-primary"
                />
              )}
              <motion.div layout className="h-full bg-accent w-full" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
