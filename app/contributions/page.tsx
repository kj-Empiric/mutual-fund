import { sql } from "@/lib/db"
import { ContributionsClient } from "./contributions-client"

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic"

// Define types to match the client component props
interface Contribution {
  id: number;
  friend_id: number;
  amount: string;
  contribution_date: string;
  notes: string | null;
  friend_name: string;
}

interface Friend {
  id: number;
  name: string;
}

export default async function ContributionsPage({ searchParams }: { searchParams: { friendId?: string } }) {
  try {
    const friendId = searchParams.friendId;

    let contributionsQuery;

    // If friendId is provided, filter by that friend
    if (friendId) {
      const friendIdInt = parseInt(friendId, 10);
      contributionsQuery = sql`
        SELECT c.*, f.name as friend_name
        FROM contributions c
        JOIN friends f ON c.friend_id = f.id
        WHERE c.friend_id = ${friendIdInt}
        ORDER BY c.contribution_date DESC
      `;
    } else {
      // Otherwise, get all contributions
      contributionsQuery = sql`
        SELECT c.*, f.name as friend_name
        FROM contributions c
        JOIN friends f ON c.friend_id = f.id
        ORDER BY c.contribution_date DESC
      `;
    }

    const contributions = await contributionsQuery as Contribution[];

    const friends = await sql`
      SELECT id, name FROM friends ORDER BY name ASC
    ` as Friend[];

    return <ContributionsClient initialContributions={contributions} friends={friends} />
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}
