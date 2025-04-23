"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function BackButton() {
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => window.history.back()}
      className="flex items-center"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back
    </Button>
  )
} 