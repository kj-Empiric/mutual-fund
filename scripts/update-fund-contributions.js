// Script to update fund contributions in the database
require("dotenv").config();
const { Pool } = require("pg");

async function updateFundContributions() {
  try {
    console.log("Connecting to database...");

    // Get database connection string from environment
    const connectionString =
      process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
      console.error(
        "No database connection string found. Please set DATABASE_URL or POSTGRES_URL environment variable."
      );
      return;
    }

    // Create a new pool
    const pool = new Pool({ connectionString });

    console.log("Checking existing fund contributions...");

    // Check if we need to reset the table
    const shouldReset = process.argv.includes("--reset");

    if (shouldReset) {
      console.log("Resetting fund_contributions table...");
      await pool.query("TRUNCATE TABLE fund_contributions RESTART IDENTITY");
      console.log("Table reset complete.");
    }

    // Define the contributions we want to have in the database
    // These match the data shown in the image
    const desiredContributions = [
      { date: "2024-10-28", amount: 2000 },
      { date: "2024-11-28", amount: 5000 },
      { date: "2024-12-28", amount: 5000 },
      { date: "2025-01-23", amount: 8000 },
      { date: "2025-01-28", amount: 5000 },
      { date: "2025-02-22", amount: 5000 },
      { date: "2025-02-28", amount: 5000 },
      { date: "2025-03-24", amount: 10000 },
      { date: "2025-03-28", amount: 5000 },
      { date: "2025-04-08", amount: 7500 },
    ];

    // Insert each contribution
    for (const contribution of desiredContributions) {
      console.log(
        `Adding/updating contribution for ${contribution.date}: ₹${contribution.amount}`
      );

      // Check if this contribution already exists
      const existingResult = await pool.query(
        "SELECT id FROM fund_contributions WHERE contribution_date = $1",
        [contribution.date]
      );

      if (existingResult.rows.length > 0) {
        // Update existing contribution
        await pool.query(
          "UPDATE fund_contributions SET amount = $1 WHERE contribution_date = $2",
          [contribution.amount, contribution.date]
        );
        console.log(`Updated existing contribution for ${contribution.date}`);
      } else {
        // Insert new contribution
        await pool.query(
          "INSERT INTO fund_contributions (amount, contribution_date) VALUES ($1, $2)",
          [contribution.amount, contribution.date]
        );
        console.log(`Inserted new contribution for ${contribution.date}`);
      }
    }

    // Verify the data
    const result = await pool.query(
      "SELECT * FROM fund_contributions ORDER BY contribution_date ASC"
    );

    console.log("\nCurrent fund contributions:");
    console.log("--------------------------------------------------");
    console.log("ID | Date           | Amount");
    console.log("--------------------------------------------------");

    let cumulativeTotal = 0;
    result.rows.forEach((row) => {
      cumulativeTotal += parseFloat(row.amount);
      const date = new Date(row.contribution_date).toISOString().split("T")[0];
      console.log(
        `${row.id.toString().padEnd(3)} | ${date} | ₹${row.amount
          .toString()
          .padEnd(8)} | ₹${cumulativeTotal.toFixed(2)}`
      );
    });

    console.log("--------------------------------------------------");
    console.log(`Total: ₹${cumulativeTotal.toFixed(2)}`);

    await pool.end();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error updating fund contributions:", error);
  }
}

// Run the function
updateFundContributions();
