import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    console.log("Contributions API called with URL:", request.url);
    const { searchParams } = new URL(request.url);
    const friendId = searchParams.get("friendId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    console.log("Filter params:", { friendId, month, year });

    // First, ensure the contributions table has proper columns
    try {
      // Check if contributions table exists
      const contributionsCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'contributions'
        ) as exists
      `;

      if (!contributionsCheck[0]?.exists) {
        console.log("Contributions table does not exist, creating it...");
        await sql`
          CREATE TABLE IF NOT EXISTS contributions (
            id SERIAL PRIMARY KEY,
            friend_id INTEGER,
            amount NUMERIC(10, 2) NOT NULL,
            notes TEXT,
            contribution_date DATE,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `;
        console.log("Contributions table created successfully");
      } else {
        console.log("Contributions table exists");
      }

      // Check if friends table exists
      const friendsCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'friends'
        ) as exists
      `;

      if (!friendsCheck[0]?.exists) {
        console.log("Friends table does not exist, creating it...");
        await sql`
          CREATE TABLE IF NOT EXISTS friends (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            role TEXT DEFAULT 'viewer',
            password TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `;
        console.log("Friends table created successfully");
      } else {
        console.log("Friends table exists");
      }

      await sql`
        ALTER TABLE contributions DROP COLUMN IF EXISTS fund_id CASCADE;
      `;
      console.log("Altered contributions table successfully");
    } catch (alterError) {
      console.error("Error checking/altering tables:", alterError);
      throw alterError;
    }

    // Check if there are any friends in the database
    let hasFriends = false;
    try {
      const friendsCount = await sql`SELECT COUNT(*) as count FROM friends`;
      hasFriends = parseInt(String(friendsCount[0]?.count)) > 0;
      console.log("Friends in database:", friendsCount[0]?.count);
    } catch (countError) {
      console.error("Error counting friends:", countError);
      // Continue even if this fails
    }

    try {
      let query;
      // If there are no friends, use a simpler query without the join
      if (!hasFriends) {
        query = sql`
          SELECT c.*, 'Unknown' as friend_name
          FROM contributions c
          WHERE 1=1
        `;
        console.log("Using query without join since there are no friends");
      } else {
        query = sql`
          SELECT c.*, f.name as friend_name
          FROM contributions c
          LEFT JOIN friends f ON c.friend_id = f.id
          WHERE 1=1
        `;
        console.log("Using query with join to friends table");
      }

      // Add filters
      if (friendId && friendId !== "all") {
        const friendIdInt = parseInt(friendId, 10);
        console.log("Adding friendId filter:", friendIdInt);
        query = sql`${query} AND c.friend_id = ${friendIdInt}`;
      }

      // Handle month and year filtering
      if (month && month !== "all" && year && year !== "all") {
        const monthInt = parseInt(month, 10);
        const yearInt = parseInt(year, 10);
        console.log("Adding month and year filter:", { monthInt, yearInt });
        query = sql`${query} AND EXTRACT(MONTH FROM c.contribution_date) = ${monthInt}
                  AND EXTRACT(YEAR FROM c.contribution_date) = ${yearInt}`;
      } else if (month && month !== "all") {
        const monthInt = parseInt(month, 10);
        console.log("Adding month filter:", monthInt);
        query = sql`${query} AND EXTRACT(MONTH FROM c.contribution_date) = ${monthInt}`;
      } else if (year && year !== "all") {
        const yearInt = parseInt(year, 10);
        console.log("Adding year filter:", yearInt);
        query = sql`${query} AND EXTRACT(YEAR FROM c.contribution_date) = ${yearInt}`;
      }

      // Add order by
      query = sql`${query} ORDER BY c.contribution_date DESC`;
      console.log("Final query built with filters");

      // Execute the query
      const contributions = await query;
      console.log(
        "Query executed successfully, returned",
        contributions.length,
        "results"
      );

      return NextResponse.json(contributions);
    } catch (queryError) {
      console.error("Error executing query:", queryError);

      // Try a fallback query without the join if the error might be related to the join
      if (
        queryError instanceof Error &&
        (queryError.message.includes("join") ||
          queryError.message.includes("relation") ||
          queryError.message.includes("column"))
      ) {
        console.log("Trying fallback query without join...");
        try {
          const fallbackQuery = sql`
            SELECT c.* 
            FROM contributions c
            ORDER BY c.contribution_date DESC
          `;

          const fallbackContributions = await fallbackQuery;
          console.log(
            "Fallback query succeeded, returned",
            fallbackContributions.length,
            "results"
          );

          // Add a placeholder for friend_name
          const contributionsWithPlaceholder = fallbackContributions.map(
            (c: Record<string, any>) => ({
              ...c,
              friend_name: `Friend #${c.friend_id || "Unknown"}`,
            })
          );

          return NextResponse.json(contributionsWithPlaceholder);
        } catch (fallbackError) {
          console.error("Fallback query also failed:", fallbackError);
          throw fallbackError;
        }
      }

      throw queryError;
    }
  } catch (error) {
    console.error("Error fetching contributions:", error);

    // Check if it's a database connection error
    if (
      error instanceof Error &&
      (error.message.includes("connection") ||
        error.message.includes("connect to") ||
        error.message.includes("database"))
    ) {
      return NextResponse.json(
        {
          error: "Database Connection Error",
          message:
            "Could not connect to the database. Please check that your database connection string is properly set in the environment variables.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch contributions", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { friend_id, amount, contribution_date, notes } =
      await request.json();

    const result = await sql`
      INSERT INTO contributions (friend_id, amount, contribution_date, notes)
      VALUES (${friend_id}, ${amount}, ${contribution_date}, ${notes})
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error creating contribution:", error);
    return NextResponse.json(
      { error: "Failed to create contribution" },
      { status: 500 }
    );
  }
}
