import { sql } from "@/lib/db"
import { formatCurrency } from "@/lib/db"
import { PageHeader } from "@/components/page-header"
import { TransactionsClient } from "./transactions-client"

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic"

export default async function TransactionsPage() {
  try {
    // Get transactions
    const transactionsResult = await sql`
      SELECT * FROM transactions
      ORDER BY transaction_date DESC
    `

    // Calculate current balance
    const balanceResult = await sql`
      SELECT SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE -amount END) as balance
      FROM transactions
    `

    // Get deposit and withdrawal totals
    const depositsResult = await sql`
      SELECT SUM(amount) as total FROM transactions WHERE transaction_type = 'deposit'
    `

    const withdrawalsResult = await sql`
      SELECT SUM(amount) as total FROM transactions WHERE transaction_type = 'withdrawal'
    `
    // Get bank charges totals
    const ChargesResult = await sql`
      SELECT SUM(amount) as total FROM transactions WHERE transaction_type = 'charges'
    `

    // Get bank names
    const banksResult = await sql`
      SELECT DISTINCT bank_name FROM transactions WHERE bank_name IS NOT NULL
    `

    const balance = balanceResult[0]?.balance || 0
    const deposits = depositsResult[0]?.total || 0
    const withdrawals = withdrawalsResult[0]?.total || 0
    const bankCount = banksResult.length
    const charges = ChargesResult[0]?.total || 0

    return (
      <TransactionsClient
        transactionsData={transactionsResult}
        balance={balance}
        deposits={deposits}
        withdrawals={withdrawals}
        bankCount={bankCount}
        charges={charges}
      />
    )
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}

