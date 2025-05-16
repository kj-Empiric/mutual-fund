"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { FriendForm } from "./friend-form"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { DeleteConfirmation } from "@/components/delete-confirmation"

interface Friend {
  id: number
  name: string
  email: string | null
  phone: string | null
  created_at: string
}

interface FriendsTableProps {
  initialFriends: Friend[]
}

export function FriendsTable({ initialFriends }: FriendsTableProps) {
  const router = useRouter()
  const [friends, setFriends] = useState<Friend[]>(initialFriends)
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingFriendId, setDeletingFriendId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDeleteClick = (id: number) => {
    setDeletingFriendId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingFriendId) return

    try {
      const response = await fetch(`/api/friends/${deletingFriendId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete friend")

      setFriends(friends.filter((friend) => friend.id !== deletingFriendId))
      toast({
        title: "Friend deleted",
        description: "The friend has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting friend:", error)
      toast({
        title: "Error",
        description: "There was an error deleting the friend. Please try again.",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Friend>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.getValue("email") || "-",
      enableSorting: true,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.getValue("phone") || "-",
      enableSorting: true,
    },
    {
      accessorKey: "created_at",
      header: "Date Added",
      cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const friend = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditingFriend(friend)
                  setIsEditDialogOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteClick(friend.id)} className="text-red-600">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
    },
  ]

  return (
    <div>
      <div className="rounded-md border">
        <DataTable columns={columns} data={friends} searchColumn="name" />
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemType="friend"
        additionalWarning="This will also delete all their contributions."
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Friend</DialogTitle>
            <DialogDescription>
              Make changes to your friend here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingFriend && (
            <FriendForm friend={editingFriend} onSuccess={() => setIsEditDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
