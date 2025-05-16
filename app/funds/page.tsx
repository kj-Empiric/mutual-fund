import { sql } from "@/lib/db"
import { PageHeader } from "@/components/page-header"
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

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic"

export default async function FundsPage() {
  try {
    // First, ensure the purchase_date column exists
    await sql`
      ALTER TABLE funds ADD COLUMN IF NOT EXISTS purchase_date DATE;
    `

    const funds = await sql`
      SELECT * FROM funds
      ORDER BY name ASC
    `

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <PageHeader heading="Mutual Funds" text="Manage your mutual funds with monthly tracking." />

          <Dialog>
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
              <FundForm />
            </DialogContent>
          </Dialog>
        </div>

        <FundsTable initialFunds={funds} />
      </div>
    )
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}
