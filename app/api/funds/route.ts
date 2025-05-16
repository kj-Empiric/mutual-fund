import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // First, ensure the purchase_date column exists
    await sql`
      ALTER TABLE funds ADD COLUMN IF NOT EXISTS purchase_date DATE;
    `;

    // Ensure the price column exists
    await sql`
      ALTER TABLE funds ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);
    `;

    const funds = await sql`
      SELECT * FROM funds
      ORDER BY name ASC
    `;
    return NextResponse.json(funds);
  } catch (error) {
    console.error("Error fetching funds:", error);
    return NextResponse.json(
      { error: "Failed to fetch funds" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, price, fund_type, description, purchase_date } =
      await request.json();

    const result = await sql`
      INSERT INTO funds (name, price, fund_type, description, purchase_date)
      VALUES (${name}, ${price}, ${fund_type}, ${description}, ${purchase_date})
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error creating fund:", error);
    return NextResponse.json(
      { error: "Failed to create fund" },
      { status: 500 }
    );
  }
}
