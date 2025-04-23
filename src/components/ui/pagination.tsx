import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPageNumbers?: boolean
  maxPageButtons?: number
}

const Pagination = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
>(({ className, currentPage, totalPages, onPageChange, ...props }, ref) => {
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    onPageChange(page)
  }

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []
    
    if (totalPages <= 5) {
      // If fewer than 5 pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always add first page
      pageNumbers.push(1)
      
      // Add pages around current page
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push(-1) // -1 represents ellipsis
      }
      
      // Add pages around current
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push(-2) // -2 represents ellipsis
      }
      
      // Always add last page
      pageNumbers.push(totalPages)
    }
    
    return pageNumbers
  }

  return (
    <div
      ref={ref}
      className={cn("flex w-full items-center justify-center space-x-2", className)}
      {...props}
    >
      <button
        aria-label="Go to previous page"
        className={buttonVariants({
          variant: "outline",
          size: "sm"
        })}
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </button>
      
      {getPageNumbers().map((page, i) => {
        // Render ellipsis
        if (page < 0) {
          return (
            <span
              key={`ellipsis-${i}`}
              className="flex h-8 w-8 items-center justify-center text-sm"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          )
        }
        
        // Render page number
        return (
          <button
            key={page}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={buttonVariants({
              variant: page === currentPage ? "default" : "outline",
              size: "sm"
            })}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        )
      })}
      
      <button
        aria-label="Go to next page"
        className={buttonVariants({
          variant: "outline",
          size: "sm"
        })}
        disabled={currentPage >= totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </button>
    </div>
  )
})
Pagination.displayName = "Pagination"

export { Pagination } 