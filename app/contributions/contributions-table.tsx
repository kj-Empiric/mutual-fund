"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { ContributionForm } from "./contribution-form"
import { MoreHorizontal, Pencil, Trash, Filter } from "lucide-react"
import { formatCurrency } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MonthYearPicker } from "@/components/month-year-picker"
import { DeleteConfirmation } from "@/components/delete-confirmation"

interface Contribution {
  id: number
  friend_id: number
  amount: string
  contribution_date: string
  notes: string | null
  friend_name: string
}

interface Friend {
  id: number
  name: string
}

interface ContributionsTableProps {
  initialContributions: Contribution[]
  friends: Friend[]
}

export function ContributionsTable({ initialContributions, friends }: ContributionsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions)
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [deletingContributionId, setDeletingContributionId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Filter states
  const [selectedFriendId, setSelectedFriendId] = useState<string>(searchParams.get("friendId") || "")
  const [selectedMonth, setSelectedMonth] = useState<string>(searchParams.get("month") || "")
  const [selectedYear, setSelectedYear] = useState<string>(
    searchParams.get("year") || new Date().getFullYear().toString(),
  )

  const handleDeleteClick = (id: number) => {
    setDeletingContributionId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingContributionId) return

    try {
      const response = await fetch(`/api/contributions/${deletingContributionId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete contribution")

      setContributions(contributions.filter((contribution) => contribution.id !== deletingContributionId))
      toast({
        title: "Contribution deleted",
        description: "The contribution has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting contribution:", error)
      toast({
        title: "Error",
        description: "There was an error deleting the contribution. Please try again.",
        variant: "destructive",
      })
    }
  }

  const applyFilters = async () => {
    try {
      let url = "/api/contributions?"
      const params = new URLSearchParams()

      if (selectedFriendId) params.append("friendId", selectedFriendId)
      if (selectedMonth) params.append("month", selectedMonth)
      if (selectedYear) params.append("year", selectedYear)

      url += params.toString()

      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch filtered contributions")

      const data = await response.json()
      setContributions(data)
      setIsFilterDialogOpen(false)

      // Update URL with filters
      const newParams = new URLSearchParams(window.location.search)
      if (selectedFriendId) newParams.set("friendId", selectedFriendId)
      else newParams.delete("friendId")

      if (selectedMonth) newParams.set("month", selectedMonth)
      else newParams.delete("month")

      if (selectedYear) newParams.set("year", selectedYear)
      else newParams.delete("year")

      router.push(`/contributions?${newParams.toString()}`)
    } catch (error) {
      console.error("Error applying filters:", error)
      toast({
        title: "Error",
        description: "There was an error applying filters. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetFilters = () => {
    setSelectedFriendId("")
    setSelectedMonth("")
    setSelectedYear(new Date().getFullYear().toString())
    router.push("/contributions")
    router.refresh()
  }

  const columns: ColumnDef<Contribution>[] = [
    {
      accessorKey: "friend_name",
      header: "Friend",
      enableSorting: true,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(Number(row.original.amount)),
      enableSorting: true,
    },
    {
      accessorKey: "contribution_date",
      header: "Date",
      cell: ({ row }) => new Date(row.original.contribution_date).toLocaleDateString(),
      enableSorting: true,
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => row.original.notes || "-",
      enableSorting: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const contribution = row.original

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
                  setEditingContribution(contribution)
                  setIsEditDialogOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteClick(contribution.id)} className="text-red-600">
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
    <>
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemType="contribution"
      />

      <div className="flex justify-end mb-4 space-x-2">
        <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)}>
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={contributions}
        searchColumn="friend_name"
        searchPlaceholder="Search contributions..."
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contribution</DialogTitle>
            <DialogDescription>Update contribution information.</DialogDescription>
          </DialogHeader>
          {editingContribution && (
            <ContributionForm
              contribution={editingContribution}
              friends={friends}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                router.refresh()
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Contributions</DialogTitle>
            <DialogDescription>Filter contributions by friend, month, or year.</DialogDescription>
          </DialogHeader>
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Friend</label>
                <Select value={selectedFriendId} onValueChange={setSelectedFriendId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Friends" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Friends</SelectItem>
                    {friends.map((friend) => (
                      <SelectItem key={friend.id} value={String(friend.id)}>
                        {friend.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Month/Year</label>
                <MonthYearPicker
                  month={selectedMonth}
                  year={selectedYear}
                  onMonthChange={setSelectedMonth}
                  onYearChange={setSelectedYear}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={resetFilters}>
                  Reset
                </Button>
                <Button className="flex-1" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  )
}
