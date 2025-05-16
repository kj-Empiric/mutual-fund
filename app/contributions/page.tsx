import { sql } from "@/lib/db"
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

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic"

export default async function ContributionsPage() {
  try {
    const contributions = await sql`
      SELECT c.*, f.name as friend_name
      FROM contributions c
      JOIN friends f ON c.friend_id = f.id
      ORDER BY c.contribution_date DESC
    `

    const friends = await sql`
      SELECT id, name FROM friends ORDER BY name ASC
    `

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <PageHeader heading="Contributions" text="Track contributions to mutual funds." />

          <Dialog>
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
              <ContributionForm friends={friends} funds={[]} />
            </DialogContent>
          </Dialog>
        </div>

        <ContributionsTable initialContributions={contributions} friends={friends} />
      </div>
    )
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}
