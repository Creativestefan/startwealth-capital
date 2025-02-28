"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: Record<string, any>
}

export function ChartContainer({ children, config, className, ...props }: ChartContainerProps) {
  return (
    <div
      className={cn("relative h-[350px] w-full", className)}
      style={
        {
          "--color-value": config.value?.color,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

