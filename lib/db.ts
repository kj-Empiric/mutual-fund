import { neon, neonConfig } from "@neondatabase/serverless"

// Configure neon to use WebSockets for better compatibility
neonConfig.webSocketConstructor = globalThis.WebSocket

// Create a function to get the SQL client
// This ensures we only create the client when it's actually used
export function getClient() {
  // Check for environment variables
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

  if (!connectionString) {
    console.error("No database connection string found. Please set DATABASE_URL or POSTGRES_URL environment variable.")
    throw new Error("Database connection string not found")
  }

  // Return the neon client
  return neon(connectionString)
}

// Export a wrapped sql function that gets a fresh client each time
export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  const client = getClient()
  try {
    return await client(strings, ...values)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Helper function to format date to YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

// Helper function to get current date in YYYY-MM-DD format
export function getCurrentDate(): string {
  return formatDate(new Date())
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Helper function to get month name
export function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString("default", { month: "long" })
}

// Helper function to get year options
export function getYearOptions(): { value: string; label: string }[] {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push({ value: i.toString(), label: i.toString() })
  }
  return years
}

// Helper function to get month options
export function getMonthOptions(): { value: string; label: string }[] {
  return Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, "0"),
    label: getMonthName(i + 1),
  }))
}
