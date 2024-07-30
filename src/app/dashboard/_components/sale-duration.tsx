"use client"

import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"

import { cn } from "@/utils"
import type { Duration } from "@/utils/types"
import { Calendar } from "@/components/ui/calendar"
import { FormControl } from "@/components/ui/form"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

type SaleDurationProps = {
  disabled?: boolean
  value?: Duration | null
  onChange: (_value?: Duration) => void
}

export function SaleDuration({ disabled, value, onChange }: SaleDurationProps) {
  return (
    <Popover>
      <FormControl>
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-input/50 px-3.5 text-sm transition disabled:pointer-events-none disabled:opacity-50 data-[state=open]:border-input/50 data-[state=open]:ring-2 data-[state=open]:ring-foreground/30",
            { "text-muted-foreground": !value || (!value.from && !value.to) },
          )}
        >
          <span className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground/50" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd")} -{" "}
                  {format(value.to, "LLL dd, yyyy")}
                </>
              ) : (
                format(value.from, "LLL dd, yyyy")
              )
            ) : (
              <span className="text-muted-foreground/50">Pick a date</span>
            )}
          </span>
          {(value?.from || value?.to) && (
            <X
              className="ml-2 h-4 w-4 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              onClick={(e) => {
                e.preventDefault()
                onChange({ from: undefined, to: undefined })
              }}
            />
          )}
        </PopoverTrigger>
      </FormControl>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={value?.from}
          onSelect={onChange}
          disabled={disabled}
          numberOfMonths={2}
          min={2}
          fromDate={new Date()}
          selected={{
            from: value?.from ?? new Date(),
            to: value?.to,
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
