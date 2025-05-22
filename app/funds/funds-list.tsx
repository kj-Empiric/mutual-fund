"use client"

import { useState } from "react"
import Link from "next/link"
import { FundForm } from "./fund-form"
import { FundsTable } from "./funds-table"
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
import { PageHeader } from "@/components/page-header"

interface Fund {
    id: number
    name: string
    price: string
    fund_type: string | null
    description: string | null
    purchase_date: string | null
}

interface FundsListProps {
    initialFunds: Fund[]
}

export function FundsList({ initialFunds }: FundsListProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                <PageHeader heading="Mutual Funds" text="Manage your mutual funds with monthly tracking." />

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Mutual Fund
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Mutual Fund</DialogTitle>
                            <DialogDescription>Add a new mutual fund to track monthly investments.</DialogDescription>
                        </DialogHeader>
                        <FundForm onSuccess={() => setOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <FundsTable initialFunds={initialFunds} />
        </div>
    )
} 