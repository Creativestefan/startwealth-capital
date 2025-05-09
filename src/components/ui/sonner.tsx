"use client"

import { useTheme } from "next-themes"
import { Toaster as SonnerToaster } from "sonner"

export function Sonner(props: React.ComponentProps<typeof SonnerToaster>) {
  const { theme = "system" } = useTheme()

  return (
    <SonnerToaster
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-800 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:opacity-100",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

