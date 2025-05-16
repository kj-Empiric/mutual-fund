import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const friends = await sql`
      SELECT * FROM friends
      ORDER BY name ASC
    `
    return NextResponse.json(friends)
  } catch (error) {
    console.error("Error fetching friends:", error)
    return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, phone } = await request.json()

    const result = await sql`
      INSERT INTO friends (name, email, phone)
      VALUES (${name}, ${email}, ${phone})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating friend:", error)
    return NextResponse.json({ error: "Failed to create friend" }, { status: 500 })
  }
}
