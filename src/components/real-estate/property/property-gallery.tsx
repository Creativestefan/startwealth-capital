"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PropertyGalleryProps {
  images: string[]
  alt: string
}

export function PropertyGallery({ images, alt }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setShowLightbox(true)
  }

  const closeLightbox = () => {
    setShowLightbox(false)
  }
  
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }))
  }

  if (!images.length) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No images available</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div 
          className="relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-lg shadow-md"
          onClick={() => openLightbox(currentIndex)}
        >
          {imageErrors[currentIndex] ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-muted">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Image failed to load</p>
            </div>
          ) : (
            <>
              <Image
                src={images[currentIndex]}
                alt={`${alt} - Image ${currentIndex + 1}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                priority
                unoptimized={images[currentIndex].startsWith('/api/image-proxy')}
                onError={() => handleImageError(currentIndex)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white text-xs">
                {alt} - Image {currentIndex + 1} of {images.length}
              </div>
            </>
          )}
          
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevious()
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow-md transition-colors hover:bg-background"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow-md transition-colors hover:bg-background"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex flex-wrap gap-3">
            {images.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "relative aspect-square cursor-pointer overflow-hidden rounded-md border-2 shadow-sm transition-all hover:opacity-90 h-[50px] w-[50px]",
                  index === currentIndex ? "border-primary ring-1 ring-primary/50" : "border-transparent"
                )}
                onClick={() => setCurrentIndex(index)}
              >
                {imageErrors[index] ? (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                ) : (
                  <Image
                    src={image}
                    alt={`${alt} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={image.startsWith('/api/image-proxy')}
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 transition-opacity duration-300"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-h-[90vh] max-w-[90vw] bg-background/10 p-4 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute -right-3 -top-3 rounded-full bg-background p-2 text-foreground shadow-md hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="relative h-auto max-h-[70vh] w-auto max-w-[80vw]">
              {imageErrors[currentIndex] ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-muted rounded-lg p-8">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  <p className="mt-4 text-lg text-muted-foreground">Image failed to load</p>
                </div>
              ) : (
                <Image
                  src={images[currentIndex]}
                  alt={`${alt} - Lightbox ${currentIndex + 1}`}
                  width={800}
                  height={450}
                  className="object-contain rounded-lg shadow-lg"
                  unoptimized={images[currentIndex].startsWith('/api/image-proxy')}
                  onError={() => handleImageError(currentIndex)}
                />
              )}
            </div>
            
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-3 text-foreground shadow-md hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-3 text-foreground shadow-md hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            
            <div className="mt-4 text-center text-sm text-white font-medium">
              {currentIndex + 1} of {images.length} - {alt}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

