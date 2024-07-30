"use client"

import { Fragment } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Circle } from "lucide-react"

import { cn } from "@/utils"
import { useStepper } from "@/hooks/use-stepper"

type Step = {
  label: string
}

type StepperProps = {
  clickable?: boolean
  steps: Step[]
}

export function Stepper({ steps, clickable }: StepperProps) {
  const { currentStep, setStep } = useStepper()

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <Fragment key={step.label}>
            <div
              className={cn(
                "flex flex-col items-center",
                clickable ? "cursor-pointer" : "pointer-events-none",
              )}
              onClick={() => {
                if (clickable) {
                  setStep(index)
                }
              }}
            >
              <motion.div
                className={cn(
                  "z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full",
                  index <= currentStep ? "bg-primary" : "bg-muted",
                )}
                initial={false}
                animate={{ scale: index === currentStep ? 1.15 : 1 }}
              >
                {index < currentStep ? (
                  <CheckCircle className="size-[18px] text-primary-foreground" />
                ) : (
                  <Circle className="size-[18px] fill-background text-background" />
                )}
              </motion.div>
              <span className="mt-2 text-xs text-muted-foreground">
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="relative mx-1 mb-4 flex-grow">
                <div className="absolute -top-1 h-1.5 w-full bg-muted" />
                <motion.div
                  className="absolute -top-1 h-1.5 w-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{
                    width: index < currentStep ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
