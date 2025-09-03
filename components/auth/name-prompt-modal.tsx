"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, User } from "lucide-react"

interface NamePromptModalProps {
  isOpen: boolean
  onLogin: (name: string) => boolean
  onClose?: () => void
}

export function NamePromptModal({ isOpen, onLogin, onClose }: NamePromptModalProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName("")
      setError("")
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const success = onLogin(name)
      if (!success) {
        setError("Please enter a valid name")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleSubmit(e as any)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Welcome to Mutual Funds Tracker
          </DialogTitle>
          <DialogDescription>
            Please enter your name to continue. This will be stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
              autoFocus
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Entering..." : "Continue"}
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground text-center">
          <p>Note: Only users named "Keyur" will have edit/delete/create permissions.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
