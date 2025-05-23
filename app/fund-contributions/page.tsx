import { sql } from "@/lib/db"
import { FundContributionsTable } from "./fund-contributions-table"
import { PageHeader } from "@/components/page-header"

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic"

export default async function FundContributionsPage() {
    try {
        // First, ensure the fund_contributions table exists
        await sql`
      CREATE TABLE IF NOT EXISTS fund_contributions (
        id SERIAL PRIMARY KEY,
        amount NUMERIC(10, 2) NOT NULL,
        contribution_date DATE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

        // Then fetch the fund contributions data
        const contributions = await sql`
      SELECT * FROM fund_contributions ORDER BY contribution_date ASC
    `

        // Calculate cumulative totals
        let cumulativeTotal = 0
        const contributionsWithCumulativeTotal = contributions.map((contribution: any) => {
            cumulativeTotal += parseFloat(contribution.amount)
            return {
                ...contribution,
                cumulative_total: cumulativeTotal.toFixed(2)
            }
        })

        return (
            <>
                <PageHeader heading="Fund Contributions" text="Manage your mutual fund contributions." />
                <div className="container mx-auto py-4">
                    <FundContributionsTable initialContributions={contributionsWithCumulativeTotal} />
                </div>
            </>
        )
    } catch (error) {
        console.error("Database error:", error)
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4">Error Loading Fund Contributions</h1>
                <p>There was an error loading the fund contributions. Please try again later.</p>
            </div>
        )
    }
} 