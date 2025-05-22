import { sql } from "@/lib/db";

interface Table {
  name: string;
  columns: {
    name: string;
    type: string;
    required: boolean;
  }[];
}

const expectedSchema: Table[] = [
  {
    name: "funds",
    columns: [
      { name: "id", type: "integer", required: true },
      { name: "name", type: "text", required: true },
      { name: "price", type: "numeric", required: false },
      { name: "fund_type", type: "text", required: false },
      { name: "description", type: "text", required: false },
      { name: "purchase_date", type: "date", required: false },
      { name: "last_updated", type: "timestamp", required: true },
    ],
  },
  // ... other tables defined here
];

export async function validateDatabase() {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check each table exists
    for (const table of expectedSchema) {
      try {
        const tableExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = ${table.name}
          ) as exists
        `;

        if (!tableExists[0]?.exists) {
          errors.push(`Table '${table.name}' does not exist`);
          continue;
        }

        // Check columns
        const columns = await sql`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = ${table.name}
        `;

        // Verify required columns exist
        for (const expectedColumn of table.columns) {
          const column = columns.find(
            (c) => c.column_name === expectedColumn.name
          );

          if (!column) {
            if (expectedColumn.required) {
              errors.push(
                `Required column '${expectedColumn.name}' missing from table '${table.name}'`
              );
            } else {
              warnings.push(
                `Optional column '${expectedColumn.name}' missing from table '${table.name}'`
              );
            }
          }
        }
      } catch (error) {
        errors.push(`Error checking table '${table.name}': ${error}`);
      }
    }

    // Check data integrity
    // ... (data validation code)

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to validate database: ${error}`],
      warnings,
    };
  }
}
