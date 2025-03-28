import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPageNumbers?: boolean
  maxPageButtons?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPageNumbers = true,
  maxPageButtons = 5,
}: PaginationProps) {
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    onPageChange(page)
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers: number[] = []
    
    // If totalPages is less than or equal to maxPageButtons, display all pages
    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
      return pageNumbers
    }
    
    // Calculate start and end of the page buttons range
    const halfMaxButtons = Math.floor(maxPageButtons / 2)
    let startPage = Math.max(1, currentPage - halfMaxButtons)
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1)
    
    // Adjust if we're at the end of the range
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }
    
    return pageNumbers
  }
  
  // Only render if there's more than one page
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8"
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {showPageNumbers && (
          <div className="hidden sm:flex items-center space-x-2">
            {getPageNumbers().map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(page)}
                className="h-8 w-8"
              >
                <span className="sr-only">Page {page}</span>
                {page}
              </Button>
            ))}
          </div>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8"
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
} 