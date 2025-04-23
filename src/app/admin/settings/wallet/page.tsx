"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clipboard, Loader2 } from "lucide-react"

// Validation schema for wallet settings
const walletSettingsSchema = z.object({
  btcWalletAddress: z
    .string()
    .min(26, { message: "BTC wallet address should be at least 26 characters" })
    .max(100, { message: "Address is too long" })
    .refine(val => val.startsWith("1") || val.startsWith("3") || val.startsWith("bc1"), {
      message: "This doesn't appear to be a valid BTC address format",
    }),
  usdtWalletAddress: z
    .string()
    .min(42, { message: "USDT (BEP-20) wallet address should be at least 42 characters" })
    .max(100, { message: "Address is too long" })
    .refine(val => val.startsWith("0x"), {
      message: "BEP-20 addresses should start with 0x",
    }),
})

type WalletSettingsFormValues = z.infer<typeof walletSettingsSchema>

export default function WalletSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [copyMessage, setCopyMessage] = useState("")

  // Initialize form
  const form = useForm<WalletSettingsFormValues>({
    resolver: zodResolver(walletSettingsSchema),
    defaultValues: {
      btcWalletAddress: "",
      usdtWalletAddress: "",
    },
  })

  // Load existing settings on component mount
  useEffect(() => {
    const fetchWalletSettings = async () => {
      try {
        const response = await fetch("/api/admin/wallet-settings")
        
        if (!response.ok) {
          throw new Error("Failed to fetch wallet settings")
        }
        
        const data = await response.json()
        
        form.reset({
          btcWalletAddress: data.btcWalletAddress || "",
          usdtWalletAddress: data.usdtWalletAddress || "",
        })
      } catch (error) {
        console.error("Error fetching wallet settings:", error)
        toast.error("Failed to load wallet settings")
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    fetchWalletSettings()
  }, [form])

  // Handle form submission
  const onSubmit = async (values: WalletSettingsFormValues) => {
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/admin/wallet-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update wallet settings")
      }
      
      toast.success("Wallet settings updated successfully")
    } catch (error) {
      console.error("Error updating wallet settings:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update wallet settings")
    } finally {
      setIsLoading(false)
    }
  }

  // Copy wallet address to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopyMessage(`${type} address copied!`)
    setTimeout(() => setCopyMessage(""), 2000)
  }

  if (isInitialLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Wallet Settings</h2>
      </div>
      <p className="text-muted-foreground">
        Configure the wallet addresses that users will use to make deposits to your platform.
      </p>
      <Separator className="my-6" />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Wallet Addresses</CardTitle>
              <CardDescription>
                Set the cryptocurrency wallet addresses that will be displayed to users when they make deposits.
                These addresses should be under your control.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="btcWalletAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bitcoin (BTC) Wallet Address</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="e.g. 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      {field.value && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(field.value, "BTC")}
                          className="flex-shrink-0"
                        >
                          <Clipboard className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <FormDescription>
                      Enter a valid Bitcoin wallet address that will receive user deposits.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="usdtWalletAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>USDT (BEP-20) Wallet Address</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="e.g. 0x123..."
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      {field.value && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(field.value, "USDT")}
                          className="flex-shrink-0"
                        >
                          <Clipboard className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <FormDescription>
                      Enter a valid USDT BEP-20 wallet address that will receive user deposits.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {copyMessage && (
                <div className="bg-muted text-muted-foreground px-3 py-2 rounded text-sm">
                  {copyMessage}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 