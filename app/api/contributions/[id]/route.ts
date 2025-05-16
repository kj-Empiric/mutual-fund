import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const contribution = await sql`
      SELECT c.*, f.name as friend_name
      FROM contributions c
      JOIN friends f ON c.friend_id = f.id
      WHERE c.id = ${id}
    `;

    if (contribution.length === 0) {
      return NextResponse.json(
        { error: "Contribution not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(contribution[0]);
  } catch (error) {
    console.error("Error fetching contribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch contribution" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { friend_id, amount, contribution_date, notes } =
      await request.json();

    const result = await sql`
      UPDATE contributions
      SET friend_id = ${friend_id}, amount = ${amount}, 
          contribution_date = ${contribution_date}, notes = ${notes}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Contribution not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating contribution:", error);
    return NextResponse.json(
      { error: "Failed to update contribution" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const result = await sql`
      DELETE FROM contributions
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Contribution not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: result[0].id });
  } catch (error) {
    console.error("Error deleting contribution:", error);
    return NextResponse.json(
      { error: "Failed to delete contribution" },
      { status: 500 }
    );
  }
}
