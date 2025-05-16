import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const friend = await sql`
      SELECT * FROM friends
      WHERE id = ${id}
    `

    if (friend.length === 0) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 })
    }

    return NextResponse.json(friend[0])
  } catch (error) {
    console.error("Error fetching friend:", error)
    return NextResponse.json({ error: "Failed to fetch friend" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { name, email, phone } = await request.json()

    const result = await sql`
      UPDATE friends
      SET name = ${name}, email = ${email}, phone = ${phone}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating friend:", error)
    return NextResponse.json({ error: "Failed to update friend" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await sql`
      DELETE FROM friends
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 })
    }

    return NextResponse.json({ id: result[0].id })
  } catch (error) {
    console.error("Error deleting friend:", error)
    return NextResponse.json({ error: "Failed to delete friend" }, { status: 500 })
  }
}
