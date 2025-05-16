"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { TransactionForm } from "./transaction-form"
import { MoreHorizontal, Pencil, Trash, Filter, Building, Calendar, Tag } from "lucide-react"
import { formatCurrency } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MonthYearPicker } from "@/components/month-year-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirmation } from "@/components/delete-confirmation"

interface Transaction {
  id: number
  amount: string
  transaction_date: string
  transaction_type: string
  transaction_category: string
  bank_name: string
  friend_name?: string
  description: string | null
}

interface TransactionsTableProps {
  initialTransactions: Transaction[]
  initialBalance: number
}

export function TransactionsTable({ initialTransactions, initialBalance }: TransactionsTableProps) {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [balance, setBalance] = useState<number>(initialBalance)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [deletingTransactionId, setDeletingTransactionId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Get unique bank names for filtering
  const bankNames = [...new Set(transactions.map(t => t.bank_name).filter(Boolean))]

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedBank, setSelectedBank] = useState<string>("")

  const handleDeleteClick = (id: number) => {
    setDeletingTransactionId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingTransactionId) return

    try {
      const response = await fetch(`/api/transactions/${deletingTransactionId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete transaction")

      setTransactions(transactions.filter((transaction) => transaction.id !== deletingTransactionId))
      toast({
        title: "Transaction deleted",
        description: "The transaction has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast({
        title: "Error",
        description: "There was an error deleting the transaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  const applyFilters = async () => {
    try {
      let url = "/api/transactions?"
      const params = new URLSearchParams()

      if (selectedMonth) params.append("month", selectedMonth)
      if (selectedYear) params.append("year", selectedYear)
      if (selectedCategory) params.append("category", selectedCategory)
      if (selectedBank) params.append("bank", selectedBank)

      url += params.toString()

      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch filtered transactions")

      const data = await response.json()
      setTransactions(data.transactions)
      setBalance(data.balance)
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
    setSelectedCategory("")
    setSelectedBank("")
    router.refresh()
  }

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "transaction_date",
      header: "Date",
      cell: ({ row }) => new Date(row.original.transaction_date).toLocaleDateString(),
      enableSorting: true,
    },
    {
      accessorKey: "bank_name",
      header: "Bank",
      cell: ({ row }) => row.original.bank_name || "-",
      enableSorting: true,
    },
    {
      accessorKey: "friend_name",
      header: "Friend",
      cell: ({ row }) => row.original.friend_name || "-",
      enableSorting: true,
    },
    {
      accessorKey: "transaction_category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.transaction_category;
        if (!category) return "-";

        const formattedCategory = category.split('_').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        let color = "default";
        if (category === "mutual_fund") color = "blue";
        if (category === "bank_charges") color = "destructive";
        if (category === "salary") color = "gray";
        if (category === "investment") color = "purple";
        if (category === "transfer") color = "green";
        if (category === "debit_card") color = "destructive";

        return <Badge variant={color as any}>{formattedCategory}</Badge>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description || "-",
      enableSorting: true,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = Number(row.original.amount)
        return (
          <span className={row.original.transaction_type === "deposit" ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
            {row.original.transaction_type === "deposit" ? "+" : "-"}
            {formatCurrency(amount)}
          </span>
        )
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const amountA = Number(rowA.original.amount) * (rowA.original.transaction_type === "deposit" ? 1 : -1);
        const amountB = Number(rowB.original.amount) * (rowB.original.transaction_type === "deposit" ? 1 : -1);
        return amountA > amountB ? 1 : amountA < amountB ? -1 : 0;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original

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
                  setEditingTransaction(transaction)
                  setIsEditDialogOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteClick(transaction.id)} className="text-red-600">
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

  // Group transactions by bank for statement-like view
  const groupedByBank = transactions.reduce((acc, transaction) => {
    const bankName = transaction.bank_name || 'Other';
    if (!acc[bankName]) {
      acc[bankName] = [];
    }
    acc[bankName].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)}>
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemType="transaction"
      />

      {Object.keys(groupedByBank).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedByBank).map(([bank, bankTransactions]) => {
            // Calculate bank balance
            const bankBalance = bankTransactions.reduce((sum, t) => {
              const amount = Number(t.amount);
              return sum + (t.transaction_type === "deposit" ? amount : -amount);
            }, 0);

            return (
              <Card key={bank} className="overflow-hidden border-t-4 border-t-primary">
                <CardHeader className="bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center">
                      <Building className="mr-2 h-5 w-5 text-primary" />
                      <CardTitle>{bank}</CardTitle>
                    </div>
                    <CardDescription className="text-lg font-medium">
                      Balance: {formatCurrency(bankBalance)}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable
                    columns={columns}
                    data={bankTransactions}
                    searchColumn="description"
                    searchPlaceholder={`Search transactions in ${bank}...`}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={transactions}
          searchColumn="description"
          searchPlaceholder="Search transactions..."
        />
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update transaction information.</DialogDescription>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              transaction={editingTransaction}
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
            <DialogTitle>Filter Transactions</DialogTitle>
            <DialogDescription>Filter transactions by date, category, or bank.</DialogDescription>
          </DialogHeader>
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Date Range
                  </label>
                  <MonthYearPicker
                    month={selectedMonth}
                    year={selectedYear}
                    onMonthChange={setSelectedMonth}
                    onYearChange={setSelectedYear}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    Bank
                  </label>
                  <Select value={selectedBank} onValueChange={setSelectedBank}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Banks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Banks</SelectItem>
                      {bankNames.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                    <SelectItem value="bank_charges">Bank Charges</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
