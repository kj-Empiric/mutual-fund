// Helper function to format currency (client-safe)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Helper function to get month name (client-safe)
export function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString("default", {
    month: "long",
  });
}

// Helper function to get year options (client-safe)
export function getYearOptions(): { value: string; label: string }[] {
  const currentYear = new Date().getFullYear();
  const years = [];

  // Include more years in the range (last 10 years to next year)
  for (let i = currentYear - 10; i <= currentYear + 1; i++) {
    years.push({ value: i.toString(), label: i.toString() });
  }

  return years;
}

// Helper function to get month options (client-safe)
export function getMonthOptions(): { value: string; label: string }[] {
  return Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, "0"),
    label: getMonthName(i + 1),
  }));
}
