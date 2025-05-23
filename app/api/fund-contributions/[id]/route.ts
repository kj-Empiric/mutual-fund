import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const result = await sql`
      DELETE FROM fund_contributions
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Fund contribution not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: result[0].id });
  } catch (error) {
    console.error("Error deleting fund contribution:", error);
    return NextResponse.json(
      { error: "Failed to delete fund contribution" },
      { status: 500 }
    );
  }
}
