"use client"

import { useState, useRef, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { FriendForm } from "./friend-form"
import { FriendsTable } from "./friends-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/use-permissions"

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic"

export default function FriendsPage() {
  const router = useRouter()
  const { canCreate } = usePermissions()
  const [friends, setFriends] = useState<any[]>([])
  const closeRef = useRef<HTMLButtonElement>(null)

  // Function to fetch friends
  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends')
      if (response.ok) {
        const data = await response.json()
        setFriends(data)
      }
    } catch (error) {
      console.error("Error fetching friends:", error)
    }
  }

  // Fetch friends on component mount
  useEffect(() => {
    fetchFriends()
  }, [])

  const handleSuccess = () => {
    // Close the dialog
    if (closeRef.current) {
      closeRef.current.click()
    }

    // Refresh the friends list
    fetchFriends()
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader heading="Friends" text="Manage your friends who contribute to mutual funds." />

        {canCreate && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Friend
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Friend</DialogTitle>
                <DialogDescription>Add a new friend who will contribute to mutual funds.</DialogDescription>
              </DialogHeader>
              <FriendForm onSuccess={handleSuccess} />
              <DialogClose ref={closeRef} className="hidden" />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <FriendsTable initialFriends={friends} />
    </div>
  )
}
