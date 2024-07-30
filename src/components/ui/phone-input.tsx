import * as React from "react"
import type { E164Number } from "libphonenumber-js"
import * as RPNInput from "react-phone-number-input"

import { cn } from "@/utils"
import { Input, InputProps } from "@/components/ui/input"
import { PKFlag } from "../icons/pk-flag"

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (_value: RPNInput.Value) => void
  }

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, ...props }, ref) => {
      return (
        <RPNInput.default
          ref={ref}
          className={className}
          defaultCountry="PK"
          flags={{}}
          countrySelectComponent={() => null}
          inputComponent={InputComponent}
          onChange={(value) => onChange?.((value || "") as E164Number)}
          {...props}
        />
      )
    },
  )
PhoneInput.displayName = "PhoneInput"

const InputComponent = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <div className="relative">
      <Input className={cn("pl-10", className)} {...props} ref={ref} />
      <PKFlag className="absolute left-3 top-1/2 size-5 shrink-0 -translate-y-1/2" />
    </div>
  ),
)
InputComponent.displayName = "InputComponent"

export { PhoneInput }
