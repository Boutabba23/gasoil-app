// components/ui/checkbox.tsx
"use client"
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react" // Add Minus icon
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    isIndeterminate?: boolean; // Add our own prop for control
  }
>(({ className, isIndeterminate, checked, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    checked={isIndeterminate ? 'indeterminate' : checked} // Radix handles 'indeterminate' for checked
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-myprimary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-myprimary data-[state=indeterminate]:text-primary-foreground", // Add styles for indeterminate state
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      {/* Conditionally render icon based on isIndeterminate and checked */}
      {isIndeterminate ? <Minus className="h-4 w-4" /> : checked ? <Check className="h-4 w-4" /> : null}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }