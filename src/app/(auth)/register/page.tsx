import { RegisterForm } from "@/components/auth/register-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register | StartWealth Capital",
  description: "Create your StartWealth Capital account",
}

export default function RegisterPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <RegisterForm />
    </div>
  )
}
