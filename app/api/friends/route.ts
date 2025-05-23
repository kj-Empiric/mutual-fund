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
    console.log("Starting friend creation process");
    const { name, email, phone, role, password } = await request.json();
    console.log("Received data:", {
      name,
      email,
      phone,
      role,
      hasPassword: !!password,
    });

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if role is admin and password is required
    if (role === "admin" && (!password || password.trim() === "")) {
      return NextResponse.json(
        { error: "Password is required for admin role" },
        { status: 400 }
      );
    }

    try {
      // First, test basic database connectivity
      console.log("Testing basic database connectivity");
      await sql`SELECT 1`;
      console.log("Database connection successful");

      // Then try to create the friends table if it doesn't exist
      console.log("Ensuring friends table exists");
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
      console.log("Friends table created or already exists");

      // If email is provided, check if it already exists
      if (email) {
        console.log("Checking if email exists:", email);
        const existingUser = await sql`
          SELECT * FROM friends WHERE email = ${email}
        `;
        console.log("Existing user check result:", existingUser);

        if (existingUser.length > 0) {
          return NextResponse.json(
            { error: "A user with this email already exists" },
            { status: 400 }
          );
        }
      }

      // Only set password if role is admin, otherwise set to null
      const passwordToSave = role === "admin" ? password : null;
      console.log("Inserting new friend with role:", role);

      const result = await sql`
        INSERT INTO friends (name, email, phone, role, password)
        VALUES (${name}, ${email || null}, ${phone || null}, ${
        role || "viewer"
      }, ${passwordToSave})
        RETURNING *
      `;
      console.log("Friend created successfully:", result[0]);

      return NextResponse.json(result[0]);
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Try to run the setup API
      try {
        console.log("Attempting to run setup API");
        const setupResponse = await fetch(
          `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/setup`
        );
        const setupResult = await setupResponse.json();
        console.log("Setup API result:", setupResult);

        if (!setupResponse.ok) {
          throw new Error(`Setup API failed: ${JSON.stringify(setupResult)}`);
        }

        // Try the insert again after setup
        console.log("Retrying friend creation after setup");
        const passwordToSave = role === "admin" ? password : null;
        const result = await sql`
          INSERT INTO friends (name, email, phone, role, password)
          VALUES (${name}, ${email || null}, ${phone || null}, ${
          role || "viewer"
        }, ${passwordToSave})
          RETURNING *
        `;
        console.log("Friend created successfully on retry:", result[0]);
        return NextResponse.json(result[0]);
      } catch (setupError) {
        console.error("Setup API error:", setupError);
        return NextResponse.json(
          { error: "Database setup failed. Please try again later." },
          { status: 500 }
        );
      }
    }
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
