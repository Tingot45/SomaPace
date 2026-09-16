"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  fallback?: string;
  src?: string;
  alt?: string;
  size?: "sm" | "default" | "lg" | "xl";
}

const sizeStyles = {
  sm: "h-8 w-8 text-xs",
  default: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-xl",
};

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, fallback, size = "default", src, alt, ...props }, ref) => {
  const initials = fallback
    ? getInitials(fallback)
    : "?";

  const colors = [
    "bg-somapace-green/15 text-somapace-green-700 dark:text-somapace-green-400",
    "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    "bg-purple-500/15 text-purple-700 dark:text-purple-400",
    "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  ];
  const colorIndex = React.useMemo(() => {
    if (!fallback) return 0;
    let hash = 0;
    for (let i = 0; i < fallback.length; i++) {
      hash = fallback.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % colors.length;
  }, [fallback]);

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={alt ?? fallback ?? "User avatar"}
          className="aspect-square h-full w-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full font-semibold",
          colors[colorIndex]
        )}
        delayMs={src ? 600 : 0}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

export { Avatar };