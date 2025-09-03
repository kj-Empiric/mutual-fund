"use client"

import { useState, useEffect } from "react"

interface AuthState {
  isAuthenticated: boolean
  userName: string | null
  isKeyur: boolean
  isLoading: boolean
}

const STORAGE_KEY = "mutual-funds-user-name"

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userName: null,
    isKeyur: false,
    isLoading: true,
  })

  useEffect(() => {
    // Check localStorage for existing user name
    const storedName = localStorage.getItem(STORAGE_KEY)
    
    if (storedName) {
      const isKeyur = storedName.toLowerCase() === "keyur"
      setAuthState({
        isAuthenticated: true,
        userName: storedName,
        isKeyur,
        isLoading: false,
      })
    } else {
      setAuthState({
        isAuthenticated: false,
        userName: null,
        isKeyur: false,
        isLoading: false,
      })
    }
  }, [])

  const login = (name: string) => {
    const trimmedName = name.trim()
    if (!trimmedName) return false

    localStorage.setItem(STORAGE_KEY, trimmedName)
    const isKeyur = trimmedName.toLowerCase() === "keyur"
    
    setAuthState({
      isAuthenticated: true,
      userName: trimmedName,
      isKeyur,
      isLoading: false,
    })
    
    return true
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setAuthState({
      isAuthenticated: false,
      userName: null,
      isKeyur: false,
      isLoading: false,
    })
  }

  return {
    ...authState,
    login,
    logout,
  }
}
