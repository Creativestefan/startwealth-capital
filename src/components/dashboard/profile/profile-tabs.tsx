"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountForm } from "@/components/dashboard/profile/account-form"
import { KycForm } from "@/components/dashboard/profile/kyc-form"
import { PasswordForm } from "@/components/dashboard/profile/password-form"
import { User } from "next-auth"

interface ProfileTabsProps {
  activeTab: string
  user: User
}

export function ProfileTabs({ activeTab, user }: ProfileTabsProps) {
  return (
    <Tabs defaultValue={activeTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="space-y-4">
        <AccountForm user={user} />
      </TabsContent>
      <TabsContent value="kyc" className="space-y-4">
        <KycForm user={user} />
      </TabsContent>
      <TabsContent value="password" className="space-y-4">
        <PasswordForm user={user} />
      </TabsContent>
    </Tabs>
  )
}
