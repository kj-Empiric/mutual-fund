// Script to add historical fund contributions
const { execSync } = require("child_process");
const { format } = require("date-fns");

// Function to format date to YYYY-MM-DD
function formatDate(date) {
  return format(date, "yyyy-MM-dd");
}

// Function to add a contribution via API call
async function addContribution(amount, date) {
  const formattedDate = formatDate(date);
  console.log(`Adding contribution of ${amount} on ${formattedDate}`);

  const curlCommand = `curl -X POST http://localhost:3001/api/fund-contributions \
    -H "Content-Type: application/json" \
    -d '{"amount": "${amount}", "contribution_date": "${formattedDate}"}'`;

  try {
    execSync(curlCommand);
    console.log(`Successfully added contribution for ${formattedDate}`);
  } catch (error) {
    console.error(
      `Failed to add contribution for ${formattedDate}:`,
      error.message
    );
  }
}

// Add historical contributions for the past 6 months (28th of each month)
async function addHistoricalContributions() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Add contributions for the past 6 months (28th of each month)
  for (let i = 6; i >= 1; i--) {
    // Calculate the month (going back i months)
    let month = currentMonth - i;
    let year = currentYear;

    // Handle negative months (previous year)
    if (month < 0) {
      month = 12 + month; // Convert to previous year's month
      year--; // Decrement year
    }

    // Create date for 28th of that month
    const date = new Date(year, month, 28);

    // Add a contribution of 5000
    await addContribution("5000", date);

    // Wait a bit between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("Historical contributions added successfully!");
}

// Run the function
addHistoricalContributions();
