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
import { MoreHorizontal, Pencil, Trash, Filter, RefreshCw, X, RotateCcw } from "lucide-react"
import { formatCurrency } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MonthYearPicker } from "@/components/month-year-picker"
import { DeleteDialog } from "@/components/delete-dialog"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"

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
  const { isKeyur } = useAuth()

  // Filter states
  const [selectedFriendId, setSelectedFriendId] = useState<string>(searchParams.get("friendId") || "all")
  const [selectedMonth, setSelectedMonth] = useState<string>(searchParams.get("month") || "all")
  const [selectedYear, setSelectedYear] = useState<string>(searchParams.get("year") || "all")
  
  // Track active filters for display
  const [activeFilters, setActiveFilters] = useState<Array<{
    key: string
    label: string
    value: string
    onRemove: () => void
  }>>([])

  // Update active filters based on current state
  const updateActiveFilters = () => {
    const filters: Array<{
      key: string
      label: string
      value: string
      onRemove: () => void
    }> = []

    if (selectedFriendId && selectedFriendId !== "all") {
      const friend = friends.find(f => f.id.toString() === selectedFriendId)
      if (friend) {
        filters.push({
          key: "friend",
          label: "Friend",
          value: friend.name,
          onRemove: () => {
            setSelectedFriendId("all")
            applyFiltersWithState("all", selectedMonth, selectedYear)
          }
        })
      }
    }

    if (selectedMonth && selectedMonth !== "all") {
      const monthName = new Date(2000, parseInt(selectedMonth) - 1, 1).toLocaleString('default', { month: 'long' })
      filters.push({
        key: "month",
        label: "Month",
        value: monthName,
        onRemove: () => {
          setSelectedMonth("all")
          applyFiltersWithState(selectedFriendId, "all", selectedYear)
        }
      })
    }

    if (selectedYear && selectedYear !== "all") {
      filters.push({
        key: "year",
        label: "Year",
        value: selectedYear,
        onRemove: () => {
          setSelectedYear("all")
          applyFiltersWithState(selectedFriendId, selectedMonth, "all")
        }
      })
    }

    setActiveFilters(filters)
  }

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

  // Update active filters when filter states change
  useEffect(() => {
    updateActiveFilters()
  }, [selectedFriendId, selectedMonth, selectedYear, friends])

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

  const applyFiltersWithState = async (friendId: string, month: string, year: string) => {
    try {
      // Update URL with filters
      const newParams = new URLSearchParams()
      if (friendId && friendId !== "all") {
        newParams.set("friendId", friendId)
      }

      if (month && month !== "all") {
        newParams.set("month", month)
      }

      if (year && year !== "all") {
        newParams.set("year", year)
      }

      router.push(`/contributions?${newParams.toString()}`)
    } catch (error) {
      console.error("Error applying filters:", error)
      toast({
        title: "Error applying filters",
        description: error instanceof Error
          ? error.message
          : "There was an error applying filters. Please try again.",
        variant: "destructive",
      })
    }
  }

  const applyFilters = async () => {
    try {
      await applyFiltersWithState(selectedFriendId, selectedMonth, selectedYear)
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

  const clearAllFilters = () => {
    resetFilters()
    setIsFilterDialogOpen(false)
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
                disabled={!isKeyur}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(contribution.id)}
                className="text-red-600"
                disabled={!isKeyur}
              >
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
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemType="contribution"
        title="Delete Contribution"
        description="Are you sure you want to delete this contribution? This action cannot be undone."
      />

      {/* Enhanced Filter Display */}
      <div className="space-y-4 mb-6">
        {/* Active Filters */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
              {activeFilters.map((filter) => (
                <motion.div
                  key={filter.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1 text-sm"
                  >
                    <span className="font-medium">{filter.label}:</span>
                    <span>{filter.value}</span>
                    <button
                      onClick={filter.onRemove}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Clear all
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)}>
              <Filter className="mr-2 h-4 w-4" />
              {activeFilters.length > 0 ? "Modify Filters" : "Add Filters"}
            </Button>
            {activeFilters.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {contributions.length} contribution{contributions.length !== 1 ? 's' : ''} found
              </span>
            )}
          </div>
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
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Contributions
            </DialogTitle>
            <DialogDescription>
              Filter contributions by friend, month, or year. You can combine multiple filters.
            </DialogDescription>
          </DialogHeader>
          
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filters</CardTitle>
                {activeFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Friend Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Friend
                  {selectedFriendId !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </label>
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

              {/* Month/Year Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Month/Year
                  {(selectedMonth !== "all" || selectedYear !== "all") && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </label>
                {/* Using our MonthYearPicker's single Date API to compute month/year */}
                <MonthYearPicker
                  value={(() => {
                    if (selectedMonth === "all" && selectedYear === "all") return undefined
                    const m = selectedMonth === "all" ? new Date().getMonth() : Number(selectedMonth) - 1
                    const y = selectedYear === "all" ? new Date().getFullYear() : Number(selectedYear)
                    return new Date(y, m, 1)
                  })()}
                  onChange={(date) => {
                    if (!date) return
                    const m = (date.getMonth() + 1).toString()
                    const y = date.getFullYear().toString()
                    setSelectedMonth(m)
                    setSelectedYear(y)
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    resetFilters()
                    setIsFilterDialogOpen(false)
                  }}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset All
                </Button>
                <Button className="w-full" onClick={applyFilters}>
                  <Filter className="mr-2 h-4 w-4" />
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
