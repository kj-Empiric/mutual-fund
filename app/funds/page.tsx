import { sql } from "@/lib/db"
import { PageHeader } from "@/components/page-header"
import { FundsList } from "./funds-list"

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic"

export default async function FundsPage() {
  try {
    // First, ensure the purchase_date column exists
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'funds' AND column_name = 'purchase_date'
        ) THEN 
          ALTER TABLE funds ADD COLUMN purchase_date DATE;
        END IF;
      END $$;
    `

    // Then fetch the funds data
    const funds = await sql`
      SELECT * FROM funds ORDER BY name ASC
    `

    return <FundsList initialFunds={funds} />
  } catch (error) {
    console.error("Database error:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Error Loading Funds</h1>
        <p>There was an error loading the mutual funds. Please try again later.</p>
      </div>
    )
  }
}
