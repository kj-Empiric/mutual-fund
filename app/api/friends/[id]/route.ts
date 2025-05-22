import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid friend ID" }, { status: 400 });
    }

    const friend = await sql`
      SELECT * FROM friends WHERE id = ${id}
    `;

    if (friend.length === 0) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    return NextResponse.json(friend[0]);
  } catch (error) {
    console.error("Error fetching friend:", error);
    return NextResponse.json(
      { error: "Failed to fetch friend" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid friend ID" }, { status: 400 });
    }

    const { name, email, phone, role, password } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Make sure required columns exist
    await sql`
      ALTER TABLE friends ADD COLUMN IF NOT EXISTS phone TEXT;
      ALTER TABLE friends ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer';
      ALTER TABLE friends ADD COLUMN IF NOT EXISTS password TEXT;
    `;

    // Check if friend exists
    const existingFriend = await sql`
      SELECT * FROM friends WHERE id = ${id}
    `;

    if (existingFriend.length === 0) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    // If updating email, check if it's already in use by another friend
    if (email && email !== existingFriend[0].email) {
      const emailCheck = await sql`
        SELECT * FROM friends WHERE email = ${email} AND id != ${id}
      `;

      if (emailCheck.length > 0) {
        return NextResponse.json(
          { error: "Email is already in use by another friend" },
          { status: 400 }
        );
      }
    }

    // If password is provided, update it; otherwise, keep the existing password
    const passwordToUse = password ? password : existingFriend[0].password;

    const updatedFriend = await sql`
      UPDATE friends
      SET 
        name = ${name},
        email = ${email || null},
        phone = ${phone || null},
        role = ${role || "viewer"},
        password = ${passwordToUse}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(updatedFriend[0]);
  } catch (error) {
    console.error("Error updating friend:", error);
    return NextResponse.json(
      { error: "Failed to update friend" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid friend ID" }, { status: 400 });
    }

    // Check if friend exists
    const existingFriend = await sql`
      SELECT * FROM friends WHERE id = ${id}
    `;

    if (existingFriend.length === 0) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    // Delete friend
    await sql`
      DELETE FROM friends WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting friend:", error);
    return NextResponse.json(
      { error: "Failed to delete friend" },
      { status: 500 }
    );
  }
}
