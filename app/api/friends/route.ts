import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const friends = await sql`
      SELECT * FROM friends
      ORDER BY name ASC
    `;
    return NextResponse.json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, role, password } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if the friends table exists first
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'friends'
        ) as exists
      `;

      if (!tableCheck[0]?.exists) {
        return NextResponse.json(
          {
            error:
              "Friends table does not exist. Please run the setup API first.",
          },
          { status: 500 }
        );
      }

      // Make sure required columns exist
      await sql`
        ALTER TABLE friends ADD COLUMN IF NOT EXISTS phone TEXT;
        ALTER TABLE friends ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer';
        ALTER TABLE friends ADD COLUMN IF NOT EXISTS password TEXT;
      `;
    } catch (tableError) {
      console.error("Error checking database structure:", tableError);
      return NextResponse.json(
        {
          error:
            "Could not verify database structure. Please run the setup API.",
        },
        { status: 500 }
      );
    }

    // If email is provided and this is for user login, check if email already exists
    if (email && (role === "admin" || role === "viewer")) {
      const existingUser = await sql`
        SELECT * FROM friends WHERE email = ${email}
      `;

      if (existingUser.length > 0) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 }
        );
      }
    }

    const result = await sql`
      INSERT INTO friends (name, email, phone, role, password)
      VALUES (${name}, ${email || null}, ${phone || null}, ${
      role || "viewer"
    }, ${password || null})
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error creating friend:", error);
    return NextResponse.json(
      {
        error: `Failed to create friend: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
