"use client"

import * as React from "react"
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>
>(({ children, ...props }, ref) => (
  <AspectRatioPrimitive.Root {...props} ref={ref} data-testid="aspect-ratio">
    {children}
  </AspectRatioPrimitive.Root>
))
AspectRatio.displayName = AspectRatioPrimitive.Root.displayName

export { AspectRatio }
