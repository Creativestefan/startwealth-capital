"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const formSchema = z.object({
  otp: z.string().length(6, {
    message: "Verification code must be 6 digits",
  }),
})

type FormData = z.infer<typeof formSchema>

export function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [isLoading, setIsLoading] = React.useState(false)
  const [resendDisabled, setResendDisabled] = React.useState(false)
  const [countdown, setCountdown] = React.useState(0)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  })

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setResendDisabled(false)
    }
  }, [countdown])

  if (!email) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Wallet className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold">Invalid Request</h1>
          <p className="text-sm text-muted-foreground">No email address provided</p>
        </div>
        <Button onClick={() => router.push("/register")} className="w-full">
          Back to Registration
        </Button>
      </div>
    )
  }

  async function onSubmit(values: FormData) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: values.otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Verification failed")
      }

      toast.success("Email verified successfully!")
      router.push("/login")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendOTP() {
    setResendDisabled(true)
    setCountdown(60)

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification code")
      }

      toast.success("New verification code sent!")
    } catch (error) {
      console.error("Resend OTP error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to send verification code")
      setResendDisabled(false)
      setCountdown(0)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Wallet className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-semibold">Verify your email</h1>
        <p className="text-center text-sm text-muted-foreground">
          We&apos;ve sent a verification code to <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter verification code"
                    {...field}
                    maxLength={6}
                    className="text-center text-lg tracking-[0.5em]"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Email
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          <Button
            variant="link"
            className="h-auto p-0 text-sm font-normal"
            disabled={resendDisabled}
            onClick={handleResendOTP}
          >
            Resend{countdown > 0 ? ` (${countdown}s)` : ""}
          </Button>
        </p>
      </div>

      <div className="text-center">
        <Button variant="link" className="h-auto p-0 text-sm font-normal" onClick={() => router.push("/register")}>
          Use a different email address
        </Button>
      </div>
    </div>
  )
}

