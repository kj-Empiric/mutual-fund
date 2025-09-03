"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { NamePromptModal } from "./name-prompt-modal"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, isLoading, login } = useAuth()
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Show prompt if not authenticated and not loading
    if (!isLoading && !isAuthenticated) {
      setShowPrompt(true)
    }
  }, [isAuthenticated, isLoading])

  const handleLogin = (name: string) => {
    const success = login(name)
    if (success) {
      setShowPrompt(false)
    }
    return success
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      <NamePromptModal
        isOpen={showPrompt}
        onLogin={handleLogin}
        onClose={() => setShowPrompt(false)}
      />
    </>
  )
}
