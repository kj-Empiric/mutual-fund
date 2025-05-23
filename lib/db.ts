import { neon, neonConfig } from "@neondatabase/serverless";

// Configure neon to use WebSockets for better compatibility
neonConfig.webSocketConstructor = globalThis.WebSocket;

// Create a function to get the SQL client
// This ensures we only create the client when it's actually used
export function getClient() {
  // Check for environment variables
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error(
      "No database connection string found. Please set DATABASE_URL or POSTGRES_URL environment variable."
    );
    throw new Error("Database connection string not found");
  }

  // Return the neon client
  return neon(connectionString);
}

// Export a wrapped sql function that gets a fresh client each time
export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  const client = getClient();
  try {
    return await client(strings, ...values);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Helper function to format date to YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper function to get current date in YYYY-MM-DD format
export function getCurrentDate(): string {
  return formatDate(new Date());
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

// Helper function to get month name
export function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString("default", {
    month: "long",
  });
}

// Helper function to get year options
export function getYearOptions(): { value: string; label: string }[] {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return years;
}

// Helper function to get month options
export function getMonthOptions(): { value: string; label: string }[] {
  return Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, "0"),
    label: getMonthName(i + 1),
  }));
}

// Helper function to detect if tables need to be set up
export async function ensureDatabaseSetup() {
  try {
    // Check if the funds table exists as a proxy for overall setup
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'funds'
      ) as exists
    `;

    // If table doesn't exist, we need to set up the database
    if (!tableCheck[0]?.exists) {
      console.log("Database tables not found. Attempting automatic setup...");

      // Make a request to the setup API
      try {
        const response = await fetch(
          `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/setup`
        );
        if (!response.ok) {
          throw new Error(`Setup API failed with status ${response.status}`);
        }
        console.log("Automatic database setup completed successfully");
        return true;
      } catch (fetchError) {
        console.error("Error calling setup API:", fetchError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking database setup:", error);
    return false;
  }
}
