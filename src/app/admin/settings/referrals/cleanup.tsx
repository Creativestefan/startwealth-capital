"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

export default function CleanupDatabaseButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleCleanup = async () => {
    if (isLoading) return
    
    try {
      setIsLoading(true)
      setResult(null)
      
      const response = await fetch("/api/admin/referral-settings/clean", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      })
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      const data = await response.json()
      setResult(data)
      
      if (data.count > 0) {
        toast.success("Database cleaned successfully", {
          description: `Removed ${data.count} duplicate records`
        })
      } else {
        toast.info("No cleanup needed", {
          description: "Database is already clean"
        })
      }
    } catch (error) {
      console.error("Error cleaning database:", error)
      toast.error("Error cleaning database", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Clean Database
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clean Referral Settings Database</DialogTitle>
            <DialogDescription>
              This will remove all duplicate records and keep only the most recent settings.
              This action is useful if you have multiple settings records in the database.
            </DialogDescription>
          </DialogHeader>
          
          {result && (
            <div className="bg-slate-50 p-3 rounded-md text-sm">
              <p><strong>Status:</strong> {result.message}</p>
              {result.count > 0 && (
                <>
                  <p><strong>Records removed:</strong> {result.count}</p>
                  <p><strong>Kept record ID:</strong> {result.kept}</p>
                </>
              )}
            </div>
          )}
          
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button variant="secondary" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleCleanup}
              disabled={isLoading}
            >
              {isLoading ? "Cleaning..." : "Clean Database"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 