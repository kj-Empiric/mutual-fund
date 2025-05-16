import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const fund = await sql`
      SELECT * FROM funds
      WHERE id = ${id}
    `;

    if (fund.length === 0) {
      return NextResponse.json({ error: "Fund not found" }, { status: 404 });
    }

    return NextResponse.json(fund[0]);
  } catch (error) {
    console.error("Error fetching fund:", error);
    return NextResponse.json(
      { error: "Failed to fetch fund" },
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
    const { name, price, fund_type, description, purchase_date } =
      await request.json();

    const result = await sql`
      UPDATE funds
      SET name = ${name}, price = ${price}, fund_type = ${fund_type}, 
          description = ${description}, purchase_date = ${purchase_date}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Fund not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating fund:", error);
    return NextResponse.json(
      { error: "Failed to update fund" },
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
      DELETE FROM funds
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Fund not found" }, { status: 404 });
    }

    return NextResponse.json({ id: result[0].id });
  } catch (error) {
    console.error("Error deleting fund:", error);
    return NextResponse.json(
      { error: "Failed to delete fund" },
      { status: 500 }
    );
  }
}
