import * as React from "react"
import { Check, type LucideIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/utils"

const Timeline = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol ref={ref} className={cn("flex flex-col", className)} {...props} />
))
Timeline.displayName = "Timeline"

const TimelineItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("relative flex flex-col p-4 pt-0 [&>*]:mb-3", className)}
    {...props}
  />
))
TimelineItem.displayName = "TimelineItem"

const TimelineTime = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    time: Date
  }
>(({ className, time, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm font-semibold italic leading-none text-muted-foreground",
      className,
    )}
    {...props}
  >
    {format(time, "LLL dd, yyyy")}
  </p>
))
TimelineTime.displayName = "TimelineTime"

const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isCompleted?: boolean
  }
>(({ className, isCompleted, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute inset-x-1/2 left-[31px] top-[5px] h-full w-px -translate-x-1/2 translate-y-2",
      isCompleted ? "bg-primary" : "bg-border",
      className,
    )}
    {...props}
  />
))
TimelineConnector.displayName = "TimelineConnector"

const TimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-4", className)}
    {...props}
  />
))
TimelineHeader.displayName = "TimelineHeader"

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight text-secondary-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </h3>
))
TimelineTitle.displayName = "CardTitle"

const TimelineIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    icon: LucideIcon
    isCompleted?: boolean
  }
>(({ className, icon, isCompleted, ...props }, ref) => {
  const Icon = isCompleted ? Check : icon

  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex flex-col rounded-full p-2",
        isCompleted
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground",
        className,
      )}
      {...props}
    >
      <Icon className="size-3.5" />
    </div>
  )
})
TimelineIcon.displayName = "TimelineIcon"

const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
TimelineDescription.displayName = "TimelineDescription"

const TimelineContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mt-2.5 flex flex-col items-start pl-[46px]", className)}
    {...props}
  />
))
TimelineContent.displayName = "TimelineContent"

export {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineTitle,
  TimelineIcon,
  TimelineDescription,
  TimelineContent,
  TimelineTime,
}
