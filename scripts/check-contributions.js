// Script to check fund contributions in the database
require("dotenv").config();
const { Pool } = require("pg");

async function checkContributions() {
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

    console.log("Fetching fund contributions from the database...");

    // Query all fund contributions ordered by date
    const result = await pool.query(
      "SELECT * FROM fund_contributions ORDER BY contribution_date ASC"
    );

    const contributions = result.rows;
    console.log(`Found ${contributions.length} contributions`);

    // Calculate cumulative total
    let cumulativeTotal = 0;
    const contributionsWithTotal = contributions.map((contribution) => {
      cumulativeTotal += parseFloat(contribution.amount);
      return {
        ...contribution,
        cumulative_total: cumulativeTotal.toFixed(2),
      };
    });

    // Display the contributions
    console.log("\nFund Contributions:");
    console.log("--------------------------------------------------");
    console.log("ID | Date           | Amount    | Cumulative Total");
    console.log("--------------------------------------------------");

    contributionsWithTotal.forEach((c) => {
      const date = new Date(c.contribution_date).toISOString().split("T")[0];
      console.log(
        `${c.id.toString().padEnd(3)} | ${date} | $${c.amount
          .toString()
          .padEnd(8)} | $${c.cumulative_total}`
      );
    });

    console.log("--------------------------------------------------");
    console.log(`Total: $${cumulativeTotal.toFixed(2)}`);

    await pool.end();
  } catch (error) {
    console.error("Error fetching fund contributions:", error);
  }
}

// Run the function
checkContributions();
