"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root className={cn("grid gap-2.5", className)} {...props} ref={ref} />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

interface RadioOptionProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, "value"> {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  showCheck?: boolean;
}

const RadioOption = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioOptionProps
>(({ className, value, label, description, disabled, showCheck = true, ...props }, ref) => {
  const optionId = React.useId();
  return (
    <label
      htmlFor={optionId}
      className={cn(
        "flex items-start gap-3.5 rounded-lg border border-border bg-card p-3.5 sm:p-4 transition-all cursor-pointer min-h-[44px]",
        "has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary/20",
        "has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed",
        "hover:bg-muted/50 active:scale-[0.99]",
        className
      )}
    >
      <RadioGroupPrimitive.Item
        ref={ref}
        value={value}
        id={optionId}
        disabled={disabled}
        className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-border text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          {showCheck ? (
            <Check className="h-3 w-3" />
          ) : (
            <Circle className="h-2 w-2 fill-current" />
          )}
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground leading-tight block">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground mt-0.5 block">{description}</span>
        )}
      </div>
    </label>
  );
});
RadioOption.displayName = "RadioOption";

export { RadioGroup, RadioOption };