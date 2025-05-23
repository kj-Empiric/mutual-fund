import { sql } from "@/lib/db"
import { ContributionsClient } from "./contributions-client"

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

    return <ContributionsClient initialContributions={contributions} friends={friends} />
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}
