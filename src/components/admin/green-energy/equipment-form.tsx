"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { equipmentCreateSchema, EquipmentCreateInput } from "@/lib/green-energy/validations"
import { createEquipment, updateEquipment } from "@/lib/green-energy/actions/equipment"
import { SerializedEquipment } from "@/lib/green-energy/types"
import { EquipmentStatus, EquipmentType } from "@prisma/client"
import { EQUIPMENT_TYPE_LABELS } from "@/lib/green-energy/constants"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Package, DollarSign, Info, ListFilter, ImageIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from "sonner"

interface EquipmentFormProps {
  equipment?: SerializedEquipment
  isEditing?: boolean
}

export function EquipmentForm({ equipment, isEditing = false }: EquipmentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with default values or existing equipment data
  const form = useForm<EquipmentCreateInput>({
    resolver: zodResolver(equipmentCreateSchema),
    defaultValues: isEditing && equipment
      ? {
          name: equipment.name,
          description: equipment.description,
          features: equipment.features as string[],
          images: equipment.images as string[],
          price: equipment.price,
          type: equipment.type,
          stockQuantity: equipment.stockQuantity,
        }
      : {
          name: "",
          description: "",
          features: [],
          images: [],
          price: 0,
          type: EquipmentType.SOLAR_PANEL,
          stockQuantity: 0,
        },
  })

  // Handle form submission
  const onSubmit = async (data: EquipmentCreateInput) => {
    setIsSubmitting(true)

    try {
      let result

      if (isEditing && equipment) {
        // Update existing equipment
        result = await updateEquipment(equipment.id, data)
      } else {
        // Create new equipment
        result = await createEquipment(data)
      }

      if (result.success) {
        toast.success(isEditing ? "Equipment updated successfully" : "Equipment created successfully")
        router.push("/admin/green-energy/equipment")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to save equipment")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to add a feature
  const addFeature = () => {
    const features = form.getValues("features") || []
    form.setValue("features", [...features, ""])
  }

  // Helper function to remove a feature
  const removeFeature = (index: number) => {
    const features = form.getValues("features") || []
    form.setValue(
      "features",
      features.filter((_, i) => i !== index)
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 flex items-center">
              <Package className="mr-2 h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Basic Information</h3>
            </div>
            <Separator className="mb-6" />

            <div className="grid gap-6 md:grid-cols-2">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Solar Panel 400W" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of the equipment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select equipment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(EQUIPMENT_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The type of green energy equipment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (USD)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="499.99"
                          className="pl-9"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      The price of the equipment in USD.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stock Quantity */}
              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="100"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      The number of units available in stock.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <div className="mt-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="High-efficiency solar panel with 25-year warranty..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description of the equipment.
                    </FormDescription>
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
              <ListFilter className="mr-2 h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Features</h3>
            </div>
            <Separator className="mb-6" />

            <div className="space-y-4">
              {form.watch("features")?.map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`features.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Feature description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {(!form.watch("features") || form.watch("features").length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No features added yet. Click "Add Feature" to add one.
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
              >
                Add Feature
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 flex items-center">
              <ImageIcon className="mr-2 h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Images</h3>
            </div>
            <Separator className="mb-6" />

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment Images</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={Array.isArray(field.value) ? field.value : []}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload images of the equipment. The first image will be used as the main image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/green-energy/equipment")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Equipment" : "Create Equipment"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 