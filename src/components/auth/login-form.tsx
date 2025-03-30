"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type * as z from "zod"
import { Loader2, Wallet } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { LoginSchema } from "@/lib/auth.config"

type FormData = z.infer<typeof LoginSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { update: updateSession } = useSession()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  
  // Get the callback URL from search params or use default
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  // Check for banned user error from query params
  React.useEffect(() => {
    const errorType = searchParams.get("error")
    const email = searchParams.get("email")
    
    if (errorType === "banned" && email) {
      setError(`This account (${email}) has been banned. Please contact support for assistance.`)
    }
  }, [searchParams])

  const form = useForm<FormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: FormData) {
    setIsLoading(true)
    setError("")

    try {
      // Sign in with credentials
      const result = await signIn("credentials", {
        email: values.email.trim(),
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password")
        } else {
          setError(result.error)
        }
        return
      }

      if (!result?.ok) {
        setError("Something went wrong. Please try again.")
        return
      }

      // Update the session to get the latest data
      await updateSession()
      
      try {
        // Get the user session to determine role
        const sessionResponse = await fetch('/api/auth/session')
        if (!sessionResponse.ok) {
          throw new Error("Failed to fetch session")
        }
        
        const session = await sessionResponse.json()
        
        // Determine redirect path based on user role
        if (session?.user?.role === 'ADMIN') {
          // For admin users, redirect to admin dashboard
          toast.success("Welcome, Administrator!")
          router.push('/admin/dashboard')
        } else {
          // For regular users, redirect to the dashboard
          toast.success("Login successful!")
          router.push('/dashboard')
        }
        
        // Refresh the router
        router.refresh()
      } catch (sessionError) {
        // Fallback to default redirection if session fetch fails
        router.push('/dashboard')
      }
    } catch (error) {
      // Don't log the error details to avoid data leaks
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Wallet className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-semibold">Welcome to StartWealth Capital</h1>
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label>Email</Label>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="m@example.com"
                    {...field}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label>Password</Label>
                  <Link href="/reset-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>
      </Form>

      <p className="text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <Link href="/terms" className="hover:text-primary underline underline-offset-4">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="hover:text-primary underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
