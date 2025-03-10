"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { propertyCreateSchema } from "@/lib/real-estate/utils/validation"
import { createProperty, updateProperty } from "@/lib/real-estate/actions/properties"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { SingleImageUpload } from "@/components/ui/single-image-upload"
import { ImageUpload } from "@/components/ui/image-upload"
import { Building, MapPin, DollarSign, Info, Image as ImageIcon, ListFilter } from "lucide-react"
import type { Property } from "@/lib/real-estate/types"
import type { z } from "zod"

interface PropertyFormProps {
  property?: Property
  mode: "create" | "edit"
}

type FormData = z.infer<typeof propertyCreateSchema>

export function PropertyForm({ property, mode }: PropertyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(propertyCreateSchema),
    defaultValues: property
      ? {
          name: property.name,
          description: property.description,
          price: Number(property.price),
          location: property.location,
          mapUrl: property.mapUrl || "",
          features: property.features as Record<string, any>,
          mainImage: property.mainImage,
          images: property.images,
          status: property.status,
        }
      : {
          name: "",
          description: "",
          price: 0,
          location: "",
          mapUrl: "",
          features: {},
          mainImage: "",
          images: [],
          status: "AVAILABLE",
        },
  })

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)

    try {
      let response

      if (mode === "create") {
        const createData = {
          ...data,
          features: data.features || {},
          mainImage: data.mainImage || "",
          images: data.images || [],
          status: data.status || "AVAILABLE"
        }
        response = await createProperty(createData)
      } else {
        if (!property) throw new Error("Property not found")
        response = await updateProperty(property.id, data)
      }

      if (response.success) {
        toast.success(
          mode === "create" ? "Property created successfully" : "Property updated successfully"
        )
        router.push("/admin/properties")
        router.refresh()
      } else {
        toast.error(response.error || "Failed to save property")
      }
    } catch (error) {
      toast.error("An error occurred while saving the property")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 flex items-center">
              <Building className="mr-2 h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Basic Information</h3>
            </div>
            <Separator className="mb-6" />
            
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter property name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="pl-9"
                          {...field}
                          value={field.value === 0 ? "" : field.value.toString()}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the property"
                        className="min-h-32 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Location</h3>
            </div>
            <Separator className="mb-6" />
            
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mapUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Map URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Google Maps URL" {...field} />
                    </FormControl>
                    <FormDescription>Optional Google Maps URL</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 flex items-center">
              <Info className="mr-2 h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Features</h3>
            </div>
            <Separator className="mb-6" />
            
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel className="text-sm">Bedrooms</FormLabel>
                        <Input
                          placeholder="Number of bedrooms"
                          value={field.value?.bedrooms || ""}
                          onChange={(e) => {
                            const newFeatures = field.value ? { ...field.value } : {};
                            newFeatures.bedrooms = e.target.value;
                            field.onChange(newFeatures);
                          }}
                        />
                      </div>
                      <div>
                        <FormLabel className="text-sm">Bathrooms</FormLabel>
                        <Input
                          placeholder="Number of bathrooms"
                          value={field.value?.bathrooms || ""}
                          onChange={(e) => {
                            const newFeatures = field.value ? { ...field.value } : {};
                            newFeatures.bathrooms = e.target.value;
                            field.onChange(newFeatures);
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel className="text-sm">Square Feet</FormLabel>
                        <Input
                          placeholder="Property size"
                          value={field.value?.squareFeet || ""}
                          onChange={(e) => {
                            const newFeatures = field.value ? { ...field.value } : {};
                            newFeatures.squareFeet = e.target.value;
                            field.onChange(newFeatures);
                          }}
                        />
                      </div>
                      <div>
                        <FormLabel className="text-sm">Year Built</FormLabel>
                        <Input
                          placeholder="Construction year"
                          value={field.value?.yearBuilt || ""}
                          onChange={(e) => {
                            const newFeatures = field.value ? { ...field.value } : {};
                            newFeatures.yearBuilt = e.target.value;
                            field.onChange(newFeatures);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <FormLabel className="text-sm">Additional Features</FormLabel>
                      <Input
                        placeholder="Additional features (comma separated)"
                        value={field.value?.additional || ""}
                        onChange={(e) => {
                          const newFeatures = field.value ? { ...field.value } : {};
                          newFeatures.additional = e.target.value;
                          field.onChange(newFeatures);
                        }}
                      />
                    </div>
                  </div>
                  <FormDescription className="mt-2">
                    Enter the property features like bedrooms, bathrooms, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 flex items-center">
              <ImageIcon className="mr-2 h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Images</h3>
            </div>
            <Separator className="mb-6" />
            
            <div className="grid gap-8 md:grid-cols-2">
              <FormField
                control={form.control}
                name="mainImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Image</FormLabel>
                    <FormControl>
                      <SingleImageUpload
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>Main image for the property listing</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="SOLD">Sold</SelectItem>
                        <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                        <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-8">
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gallery Images</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={Array.isArray(field.value) ? field.value : []}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>Upload additional images for the property gallery</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/properties")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Create Property" : "Update Property"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

