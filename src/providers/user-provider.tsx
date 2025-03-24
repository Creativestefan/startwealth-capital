"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type UserContextType = {
  userAvatar: string | null
  updateUserAvatar: (newAvatar: string | null) => void
  avatarTimestamp: number
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [avatarTimestamp, setAvatarTimestamp] = useState<number>(Date.now())

  const updateUserAvatar = (newAvatar: string | null) => {
    setUserAvatar(newAvatar)
    setAvatarTimestamp(Date.now())
  }

  return (
    <UserContext.Provider value={{ userAvatar, updateUserAvatar, avatarTimestamp }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
} 