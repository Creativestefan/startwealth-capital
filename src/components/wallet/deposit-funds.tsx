"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Copy, Loader2, AlertCircle } from "lucide-react"
import { Wallet } from "@/types/wallet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { depositFunds } from "@/lib/wallet/actions"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

const depositFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive").min(100, "Minimum deposit is $100"),
  cryptoType: z.enum(["BTC", "USDT"], {
    required_error: "Please select a cryptocurrency type",
  }),
  txHash: z.string().length(64, "Transaction hash must be exactly 64 characters long"),
})

type DepositFormValues = z.infer<typeof depositFormSchema>

interface DepositFundsProps {
  wallet: Wallet
}

interface WalletSettings {
  id: string
  btcWalletAddress: string | null
  usdtWalletAddress: string | null
  usdtWalletType: string
}

export function DepositFunds({ wallet }: DepositFundsProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("BTC")
  const [walletSettings, setWalletSettings] = React.useState<WalletSettings | null>(null)
  const [isLoadingSettings, setIsLoadingSettings] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositFormSchema),
    defaultValues: {
      amount: 0,
      cryptoType: "BTC",
      txHash: "",
    },
  })

  // Fetch wallet settings on mount
  React.useEffect(() => {
    const fetchWalletSettings = async () => {
      try {
        setIsLoadingSettings(true)
        setError(null)
        
        const response = await fetch('/api/wallet-settings')
        
        if (!response.ok) {
          throw new Error('Failed to fetch wallet addresses')
        }
        
        const data = await response.json()
        setWalletSettings(data)
      } catch (error) {
        console.error('Error fetching wallet settings:', error)
        setError('Failed to load wallet addresses. Please try again later.')
      } finally {
        setIsLoadingSettings(false)
      }
    }
    
    fetchWalletSettings()
  }, [])
  
  React.useEffect(() => {
    form.setValue("cryptoType", activeTab as "BTC" | "USDT")
  }, [activeTab, form])
  
  async function onSubmit(data: DepositFormValues) {
    setIsSubmitting(true)
    
    try {
      // Call the server action to create the deposit request
      const result = await depositFunds(data)
      
      if (result.success) {
        toast.success("Deposit request submitted successfully", {
          description: "Your deposit will be processed once confirmed by admin.",
        })
        
        form.reset({
          amount: 0,
          cryptoType: activeTab as "BTC" | "USDT",
          txHash: "",
        })
      } else {
        toast.error("Failed to submit deposit request", {
          description: result.error || "Please try again later.",
        })
      }
    } catch (error) {
      console.error("Error submitting deposit:", error)
      toast.error("Failed to submit deposit request", {
        description: "Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  function copyToClipboard(text: string | undefined | null) {
    if (!text) return
    
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success("Address copied to clipboard")
      },
      (err) => {
        console.error("Could not copy text: ", err)
        toast.error("Failed to copy address")
      }
    )
  }

  // Get the appropriate wallet address based on the active tab
  const getActiveWalletAddress = () => {
    if (!walletSettings) return null
    
    return activeTab === "BTC" 
      ? walletSettings.btcWalletAddress
      : walletSettings.usdtWalletAddress
  }

  const walletAddress = getActiveWalletAddress()
  const hasAddress = !!walletAddress
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Deposit Funds</CardTitle>
          <CardDescription>
            Add funds to your wallet by sending cryptocurrency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (USD)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter amount"
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : e.target.valueAsNumber;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum deposit amount is $100
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cryptoType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Cryptocurrency</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value)
                          setActiveTab(value)
                        }}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="BTC" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Bitcoin (BTC)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="USDT" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Tether (USDT - {walletSettings?.usdtWalletType || "BEP-20"})
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="txHash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Hash/ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter transaction hash (64 characters)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the transaction ID after sending the funds. Must be exactly 64 characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isSubmitting || !hasAddress}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Confirm Deposit"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Wallet Addresses</CardTitle>
          <CardDescription>
            Send cryptocurrency to one of these addresses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="BTC">Bitcoin</TabsTrigger>
              <TabsTrigger value="USDT">USDT ({walletSettings?.usdtWalletType || "BEP-20"})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="BTC" className="mt-6 space-y-4">
              {isLoadingSettings ? (
                <div className="space-y-2 py-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : !walletSettings?.btcWalletAddress ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No BTC Address Available</AlertTitle>
                  <AlertDescription>The admin has not set up a Bitcoin wallet address yet. Please try again later or contact support.</AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-lg border p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Bitcoin Address
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm break-all">
                        {walletSettings.btcWalletAddress}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(walletSettings.btcWalletAddress)}
                        className="ml-2 flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-medium">Important Notes:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Only send Bitcoin (BTC) to this address</li>
                  <li>Minimum confirmation required: 3</li>
                  <li>Processing time: 1-3 hours after confirmation</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="USDT" className="mt-6 space-y-4">
              {isLoadingSettings ? (
                <div className="space-y-2 py-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : !walletSettings?.usdtWalletAddress ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No USDT Address Available</AlertTitle>
                  <AlertDescription>The admin has not set up a USDT wallet address yet. Please try again later or contact support.</AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-lg border p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      USDT ({walletSettings.usdtWalletType}) Address
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm break-all">
                        {walletSettings.usdtWalletAddress}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(walletSettings.usdtWalletAddress)}
                        className="ml-2 flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-medium">Important Notes:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Only send USDT ({walletSettings?.usdtWalletType || "BEP-20"}) to this address</li>
                  <li>Minimum confirmation required: 15</li>
                  <li>Processing time: 1-3 hours after confirmation</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 