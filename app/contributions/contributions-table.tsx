"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { ContributionForm } from "./contribution-form"
import { MoreHorizontal, Pencil, Trash, Filter, RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MonthYearPicker } from "@/components/month-year-picker"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

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
  const [databaseError, setDatabaseError] = useState<{ title: string; description: string } | null>(null)

  // Filter states
  const [selectedFriendId, setSelectedFriendId] = useState<string>(searchParams.get("friendId") || "all")
  const [selectedMonth, setSelectedMonth] = useState<string>(searchParams.get("month") || "all")
  const [selectedYear, setSelectedYear] = useState<string>(searchParams.get("year") || "all")

  // Apply filters when the component mounts or when URL parameters change
  useEffect(() => {
    const friendId = searchParams.get("friendId")
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    // Only fetch if there are filter parameters
    if (friendId || month || year) {
      setSelectedFriendId(friendId || "all")
      setSelectedMonth(month || "all")
      setSelectedYear(year || "all")

      fetchFilteredContributions(friendId, month, year)
    }
  }, [searchParams])

  const fetchFilteredContributions = async (friendId?: string | null, month?: string | null, year?: string | null) => {
    try {
      let url;

      // If only friendId is provided, use the dedicated endpoint
      if (friendId && friendId !== "all" && (!month || month === "all") && (!year || year === "all")) {
        url = `/api/contributions/by-friend/${friendId}`;
        console.log("Using dedicated friend endpoint:", url);
      } else {
        // Otherwise use the regular endpoint with query parameters
        url = "/api/contributions?";
        const params = new URLSearchParams();

        if (friendId && friendId !== "all") {
          params.append("friendId", friendId);
        }

        if (month && month !== "all") {
          params.append("month", month);
        }

        if (year && year !== "all") {
          params.append("year", year);
        }

        url += params.toString();
        console.log("Using standard filtering endpoint:", url);
      }

      console.log("Fetching filtered contributions with URL:", url);
      const response = await fetch(url);

      if (!response.ok) {
        console.error("Filter API error: response not OK", response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error("Filter API error data:", errorData);
        throw new Error(errorData.error || `Failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Filtered data received:", data.length, "contributions");
      setContributions(data);
      setDatabaseError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching filtered contributions:", error);

      // Check for database connection error
      if (error instanceof Error && error.message.includes("Database Connection Error")) {
        setDatabaseError({
          title: "Database Connection Error",
          description: "Could not connect to the database. Please check that your database connection string is properly set in the environment variables."
        });
      } else {
        toast({
          title: "Error applying filters",
          description: error instanceof Error
            ? error.message
            : "There was an error applying filters. Please try again.",
          variant: "destructive",
        });
      }
    }
  }

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
      // Update URL with filters
      const newParams = new URLSearchParams()
      if (selectedFriendId && selectedFriendId !== "all") {
        newParams.set("friendId", selectedFriendId)
      }

      if (selectedMonth && selectedMonth !== "all") {
        newParams.set("month", selectedMonth)
      }

      if (selectedYear && selectedYear !== "all") {
        newParams.set("year", selectedYear)
      }

      router.push(`/contributions?${newParams.toString()}`)

      // Close the filter dialog
      setIsFilterDialogOpen(false)
    } catch (error) {
      console.error("Error applying filters:", error)
      setIsFilterDialogOpen(false) // Close the dialog even on error

      // Display error toast
      toast({
        title: "Error applying filters",
        description: error instanceof Error
          ? error.message
          : "There was an error applying filters. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetFilters = () => {
    setSelectedFriendId("all")
    setSelectedMonth("all")
    setSelectedYear("all")
    router.push("/contributions")
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

      <div className="flex justify-between items-center mb-4">
        {selectedFriendId !== "all" && (
          <div className="text-sm bg-muted inline-flex items-center px-3 py-1 rounded-md">
            Filtered by: {friends.find(f => f.id.toString() === selectedFriendId)?.name}
            <button
              onClick={resetFilters}
              className="ml-2 text-muted-foreground hover:text-foreground"
              aria-label="Clear filter"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex space-x-2 ml-auto">
          <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {databaseError ? (
        <Alert className="mt-4">
          <AlertTitle>{databaseError.title}</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{databaseError.description}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-fit flex items-center gap-1"
              onClick={applyFilters}
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <DataTable
          columns={columns}
          data={contributions}
          searchColumn="friend_name"
          searchPlaceholder="Search contributions..."
        />
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-md">
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
        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-md">
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Friends" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Friends</SelectItem>
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

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                <Button variant="outline" className="w-full" onClick={resetFilters}>
                  Reset
                </Button>
                <Button className="w-full" onClick={applyFilters}>
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
