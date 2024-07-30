// Source: https://github.com/sersavan/shadcn-multi-select-component

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { XCircle, ChevronDown, XIcon } from "lucide-react"

import { cn } from "@/utils"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

const multiSelectVariants = cva("m-1", {
  variants: {
    variant: {
      default: "border-foreground/10 text-foreground bg-card hover:bg-card/80",
      secondary:
        "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      inverted: "inverted",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  options: {
    label: string
    value: string
  }[]
  onValueChange: (_value: string[]) => void
  defaultValue: string[]
  placeholder?: string
  maxCount?: number
  className?: string
  loading?: boolean
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = "Select options",
      maxCount = 3,
      className,
      loading,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(defaultValue)
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

    React.useEffect(() => {
      if (JSON.stringify(selectedValues) !== JSON.stringify(defaultValue)) {
        setSelectedValues(defaultValue)
      }
    }, [defaultValue, selectedValues])

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true)
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues]
        newSelectedValues.pop()
        setSelectedValues(newSelectedValues)
        onValueChange(newSelectedValues)
      }
    }

    const toggleOption = (value: string) => {
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value]
      setSelectedValues(newSelectedValues)
      onValueChange(newSelectedValues)
    }

    const handleClear = () => {
      setSelectedValues([])
      onValueChange([])
    }

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev)
    }

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount)
      setSelectedValues(newSelectedValues)
      onValueChange(newSelectedValues)
    }

    const toggleAll = () => {
      if (selectedValues.length === options.length) {
        handleClear()
      } else {
        const allValues = options.map((option) => option.value)
        setSelectedValues(allValues)
        onValueChange(allValues)
      }
    }

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger
          ref={ref}
          onClick={handleTogglePopover}
          className={cn(
            "flex h-auto min-h-10 w-full items-center justify-between rounded-md border border-input bg-muted/50 p-1 text-sm transition disabled:pointer-events-none disabled:opacity-50 group-hover/input:shadow-none data-[state=open]:border-muted/50 data-[state=open]:ring-2 data-[state=open]:ring-foreground/30",
            className,
          )}
          disabled={loading || disabled}
          {...props}
        >
          {selectedValues.length > 0 ? (
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-wrap items-center">
                {selectedValues.slice(0, maxCount).map((value) => {
                  const option = options.find((o) => o.value === value)

                  return (
                    <Badge
                      key={value}
                      className={cn(
                        multiSelectVariants({ variant, className }),
                      )}
                    >
                      {loading ? <span className="px-4" /> : option?.label}
                      <XCircle
                        className="ml-2 h-4 w-4 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleOption(value)
                        }}
                      />
                    </Badge>
                  )
                })}
                {selectedValues.length > maxCount && (
                  <Badge
                    className={cn(
                      "border-foreground/1 bg-transparent text-foreground hover:bg-transparent",
                      multiSelectVariants({ variant, className }),
                    )}
                  >
                    {`+ ${selectedValues.length - maxCount} more`}
                    <XCircle
                      className="ml-2 h-4 w-4 cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation()
                        clearExtraOptions()
                      }}
                    />
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <XIcon
                  className="mx-2 h-4 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleClear()
                  }}
                />
                <Separator
                  orientation="vertical"
                  className="flex h-full min-h-6 bg-muted-foreground/60"
                />
                {loading ? (
                  <Spinner size="sm" className="mx-2" />
                ) : (
                  <ChevronDown className="mx-2 h-4 cursor-pointer text-muted-foreground" />
                )}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full items-center justify-between">
              <span className="mx-3 text-sm text-muted-foreground">
                {placeholder}
              </span>
              {loading ? (
                <Spinner size="sm" className="mx-2" />
              ) : (
                <ChevronDown className="mx-2 h-4 cursor-pointer text-muted-foreground" />
              )}
            </div>
          )}
        </PopoverTrigger>

        <PopoverContent
          className="w-[200px] p-0"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command>
            <CommandInput
              placeholder="Search..."
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key="all"
                  onSelect={toggleAll}
                  style={{ pointerEvents: "auto", opacity: 1 }}
                  className="cursor-pointer"
                >
                  <Checkbox
                    className="mr-2"
                    checked={selectedValues.length === options.length}
                  />
                  <span>(Select All)</span>
                </CommandItem>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      style={{ pointerEvents: "auto", opacity: 1 }}
                      className="cursor-pointer"
                    >
                      <Checkbox className="mr-2" checked={isSelected} />
                      <span>{option.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        style={{ pointerEvents: "auto", opacity: 1 }}
                        className="w-full cursor-pointer justify-center"
                      >
                        Clear
                      </CommandItem>
                      <Separator
                        orientation="vertical"
                        className="flex h-full min-h-6"
                      />
                    </>
                  )}
                  <CommandSeparator />
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    style={{ pointerEvents: "auto", opacity: 1 }}
                    className="w-full cursor-pointer justify-center"
                  >
                    Close
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  },
)

MultiSelect.displayName = "MultiSelect"

export { MultiSelect }
