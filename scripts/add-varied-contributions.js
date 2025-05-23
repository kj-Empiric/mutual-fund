// Script to add varied fund contributions
const { execSync } = require("child_process");
const { format, subDays } = require("date-fns");

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

// Add varied contributions for different dates
async function addVariedContributions() {
  const today = new Date();

  // Array of [days ago, amount] pairs
  const contributions = [
    [15, 3000], // 15 days ago, ₹3000
    [45, 7500], // 45 days ago, ₹7500
    [60, 10000], // 60 days ago, ₹10000
    [90, 5000], // 90 days ago, ₹5000
    [120, 8000], // 120 days ago, ₹8000
  ];

  for (const [daysAgo, amount] of contributions) {
    const date = subDays(today, daysAgo);
    await addContribution(amount, date);

    // Wait a bit between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("Varied contributions added successfully!");
}

// Run the function
addVariedContributions();
