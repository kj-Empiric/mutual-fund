import { sql } from "@/lib/db"
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
} from "@/components/ui/dialog"

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic"

export default async function FriendsPage() {
  try {
    const friends = await sql`
      SELECT * FROM friends
      ORDER BY name ASC
    `

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader heading="Friends" text="Manage your friends who contribute to mutual funds." />

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
              <FriendForm />
            </DialogContent>
          </Dialog>
        </div>

        <FriendsTable initialFriends={friends} />
      </div>
    )
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}
