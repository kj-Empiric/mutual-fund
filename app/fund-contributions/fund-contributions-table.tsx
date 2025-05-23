"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { FundContributionForm } from "./fund-contribution-form"
import { MoreHorizontal, Pencil, Trash, Filter, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface FundContribution {
    id: number
    amount: string
    contribution_date: string
    created_at: string
    cumulative_total: string
}

interface FundContributionsTableProps {
    initialContributions: FundContribution[]
}

export function FundContributionsTable({ initialContributions }: FundContributionsTableProps) {
    const router = useRouter()
    const [contributions, setContributions] = useState<FundContribution[]>(initialContributions)
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
    const [deletingContributionId, setDeletingContributionId] = useState<number | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [databaseError, setDatabaseError] = useState<{ title: string; description: string } | null>(null)

    // Check if today is the 28th of the month for automatic contribution
    useEffect(() => {
        const today = new Date()
        const isDay28 = today.getDate() === 28

        const checkAndAddMonthlyContribution = async () => {
            if (isDay28) {
                try {
                    // Check if we already have a contribution for today
                    const todayFormatted = today.toISOString().split('T')[0]
                    const existingContribution = contributions.find(
                        c => c.contribution_date.split('T')[0] === todayFormatted
                    )

                    if (!existingContribution) {
                        // Add automatic contribution of ₹2000
                        const response = await fetch("/api/fund-contributions", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                amount: "2000",
                                contribution_date: todayFormatted
                            }),
                        })

                        if (!response.ok) throw new Error("Failed to add automatic monthly contribution")

                        // Refresh data
                        router.refresh()
                        toast({
                            title: "Automatic contribution added",
                            description: "Monthly contribution of ₹2000 has been added for today.",
                        })
                    }
                } catch (error) {
                    console.error("Error adding automatic contribution:", error)
                    toast({
                        title: "Automatic contribution failed",
                        description: "Failed to add the automatic monthly contribution.",
                        variant: "destructive",
                    })
                }
            }
        }

        checkAndAddMonthlyContribution()
    }, [contributions, router])

    const handleDeleteClick = (id: number) => {
        setDeletingContributionId(id)
        setIsDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!deletingContributionId) return

        try {
            const response = await fetch(`/api/fund-contributions/${deletingContributionId}`, {
                method: "DELETE",
            })

            if (!response.ok) throw new Error("Failed to delete fund contribution")

            setContributions(contributions.filter((contribution) => contribution.id !== deletingContributionId))
            toast({
                title: "Fund contribution deleted",
                description: "The fund contribution has been deleted successfully.",
            })

            router.refresh()
        } catch (error) {
            console.error("Error deleting fund contribution:", error)
            toast({
                title: "Error",
                description: "There was an error deleting the fund contribution. Please try again.",
                variant: "destructive",
            })
        } finally {
            setDeletingContributionId(null)
            setIsDeleteDialogOpen(false)
        }
    }

    const columns: ColumnDef<FundContribution>[] = [
        {
            accessorKey: "contribution_date",
            header: "Date",
            cell: ({ row }) => new Date(row.original.contribution_date).toLocaleDateString(),
            enableSorting: true,
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => formatCurrency(Number(row.original.amount)),
            enableSorting: true,
        },
        {
            accessorKey: "cumulative_total",
            header: "Cumulative Total",
            cell: ({ row }) => formatCurrency(Number(row.original.cumulative_total)),
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
                itemType="fund contribution"
            />

            <div className="flex justify-end mb-4 space-x-2">
                <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Fund Contribution
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Fund Contribution</DialogTitle>
                            <DialogDescription>Add a new mutual fund contribution.</DialogDescription>
                        </DialogHeader>
                        <FundContributionForm
                            onSuccess={() => {
                                setIsFormDialogOpen(false)
                                router.refresh()
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {databaseError ? (
                <Alert className="mt-4">
                    <AlertTitle>{databaseError.title}</AlertTitle>
                    <AlertDescription>{databaseError.description}</AlertDescription>
                </Alert>
            ) : (
                <DataTable
                    columns={columns}
                    data={contributions}
                    searchPlaceholder="Search fund contributions..."
                />
            )}
        </>
    )
} 