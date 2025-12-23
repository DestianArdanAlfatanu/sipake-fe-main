import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectWrapperProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children?: React.ReactNode
  disabled?: boolean
}

export const SelectWrapper = React.forwardRef<
  HTMLButtonElement,
  SelectWrapperProps
>(({ value, onValueChange, placeholder, children, disabled }, ref) => {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger ref={ref}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
})

SelectWrapper.displayName = "SelectWrapper"
