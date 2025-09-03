"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/db"
import { PageHeader } from "@/components/page-header"
import { TransactionForm } from "./transaction-form"
import { TransactionsTable } from "./transactions-table"
import { Button } from "@/components/ui/button"
import { PlusCircle, Building, ArrowUpDown, CreditCard } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePermissions } from "@/hooks/use-permissions"

interface TransactionsClientProps {
    transactionsData: any[]
    balance: number
    deposits: number
    withdrawals: number
    bankCount: number
    charges: number
}

export function TransactionsClient({
    transactionsData,
    balance,
    deposits,
    withdrawals,
    bankCount,
    charges
}: TransactionsClientProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const { canCreate } = usePermissions()

    const total = charges + withdrawals + balance;

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                <PageHeader heading="Banking & Transactions" text="Track your deposits, withdrawals, and transfers." />

                {canCreate && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[525px]">
                            <DialogHeader>
                                <DialogTitle>Add New Transaction</DialogTitle>
                                <DialogDescription>Record a new banking transaction.</DialogDescription>
                            </DialogHeader>
                            <TransactionForm onSuccess={() => setIsDialogOpen(false)} />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${Number(balance) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(Number(balance))}
                        </div>
                        <p className="text-xs text-muted-foreground">As of {new Date().toLocaleDateString()}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{formatCurrency(Number(deposits))}</div>
                        <p className="text-xs text-muted-foreground">All-time deposits</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{formatCurrency(Number(withdrawals))}</div>
                        <p className="text-xs text-muted-foreground">All-time withdrawals</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Charges</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {formatCurrency(charges)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(charges)} + {formatCurrency(withdrawals)} + {formatCurrency(balance)}{' '}
                            = <strong>{formatCurrency(deposits)}</strong>
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="border-b my-6"></div>

            <TransactionsTable initialTransactions={transactionsData} initialBalance={balance} />
        </div>
    )
} 