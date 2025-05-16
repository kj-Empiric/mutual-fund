"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { FundForm } from "./fund-form"
import { MoreHorizontal, Pencil, Trash, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthYearPicker } from "@/components/month-year-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteConfirmation } from "@/components/delete-confirmation"

interface Fund {
  id: number
  name: string
  price: string | number | null
  fund_type: string | null
  description: string | null
  purchase_date?: string
  created_at: string
}

interface FundsTableProps {
  initialFunds: Fund[]
}

export function FundsTable({ initialFunds }: FundsTableProps) {
  const router = useRouter()
  const [funds, setFunds] = useState<Fund[]>(initialFunds)
  const [editingFund, setEditingFund] = useState<Fund | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedFundType, setSelectedFundType] = useState("")
  const [deletingFundId, setDeletingFundId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Add this function to handle filtering
  const applyFilters = async () => {
    try {
      let filteredFunds = [...initialFunds]

      // Filter by fund type if selected
      if (selectedFundType && selectedFundType !== "all") {
        filteredFunds = filteredFunds.filter((fund) => fund.fund_type?.toLowerCase() === selectedFundType.toLowerCase())
      }

      // Filter by month/year if selected
      if (selectedMonth && selectedYear && selectedMonth !== "all") {
        const targetMonth = Number.parseInt(selectedMonth) - 1 // JS months are 0-indexed
        const targetYear = Number.parseInt(selectedYear)

        filteredFunds = filteredFunds.filter((fund) => {
          if (!fund.purchase_date) return false
          const purchaseDate = new Date(fund.purchase_date)
          return purchaseDate.getMonth() === targetMonth && purchaseDate.getFullYear() === targetYear
        })
      } else if (selectedYear) {
        const targetYear = Number.parseInt(selectedYear)

        filteredFunds = filteredFunds.filter((fund) => {
          if (!fund.purchase_date) return false
          const purchaseDate = new Date(fund.purchase_date)
          return purchaseDate.getFullYear() === targetYear
        })
      }

      setFunds(filteredFunds)
      setIsFilterDialogOpen(false)
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
    setSelectedMonth("")
    setSelectedYear(new Date().getFullYear().toString())
    setSelectedFundType("")
    setFunds(initialFunds)
  }

  const handleDeleteClick = (id: number) => {
    setDeletingFundId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingFundId) return

    try {
      const response = await fetch(`/api/funds/${deletingFundId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete fund")

      setFunds(funds.filter((fund) => fund.id !== deletingFundId))
      toast({
        title: "Mutual fund deleted",
        description: "The mutual fund has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting fund:", error)
      toast({
        title: "Error",
        description: "There was an error deleting the fund. Please try again.",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Fund>[] = [
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = row.original.price;
        return price ? `$${Number(price).toFixed(2)}` : "-";
      },
      enableSorting: true,
    },
    {
      accessorKey: "fund_type",
      header: "Type",
      cell: ({ row }) => row.original.fund_type || "-",
      enableSorting: true,
    },
    {
      accessorKey: "purchase_date",
      header: "Purchase Date",
      cell: ({ row }) =>
        row.original.purchase_date
          ? new Date(row.original.purchase_date).toLocaleDateString(undefined, { year: "numeric", month: "long" })
          : "-",
      enableSorting: true,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.original.description
        if (!desc) return "-"
        return desc.length > 50 ? `${desc.substring(0, 50)}...` : desc
      },
      enableSorting: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const fund = row.original

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
                  setEditingFund(fund)
                  setIsEditDialogOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteClick(fund.id)} className="text-red-600">
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
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)}>
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <DataTable columns={columns} data={funds} searchColumn="name" searchPlaceholder="Search mutual funds..." />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mutual Fund</DialogTitle>
            <DialogDescription>Update mutual fund information.</DialogDescription>
          </DialogHeader>
          {editingFund && (
            <FundForm
              fund={editingFund}
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
            <DialogTitle>Filter Mutual Funds</DialogTitle>
            <DialogDescription>Filter mutual funds by type, month, or year.</DialogDescription>
          </DialogHeader>
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fund Type</label>
                <Select value={selectedFundType} onValueChange={setSelectedFundType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Fund Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Fund Types</SelectItem>
                    <SelectItem value="index fund">Index Fund</SelectItem>
                    <SelectItem value="etf">ETF</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="bond">Bond</SelectItem>
                    <SelectItem value="money market">Money Market</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase Month/Year</label>
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

      <DeleteConfirmation
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemType="mutual fund"
        additionalWarning="This will also delete all contributions to this fund."
      />
    </>
  )
}
