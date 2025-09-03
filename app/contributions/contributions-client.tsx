"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { ContributionForm } from "./contribution-form"
import { ContributionsTable } from "./contributions-table"
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
import { usePermissions } from "@/hooks/use-permissions"

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

interface ContributionsClientProps {
    initialContributions: Contribution[]
    friends: Friend[]
}

export function ContributionsClient({ initialContributions, friends }: ContributionsClientProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const { canCreate } = usePermissions()

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                <PageHeader heading="Contributions" text="Track contributions to mutual funds." />

                {canCreate && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Contribution
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Contribution</DialogTitle>
                                <DialogDescription>Record a new contribution.</DialogDescription>
                            </DialogHeader>
                            <ContributionForm
                                friends={friends}
                                funds={[]}
                                onSuccess={() => setIsDialogOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <ContributionsTable initialContributions={initialContributions} friends={friends} />
        </div>
    )
} 