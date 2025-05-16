"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Import from client-safe utilities
import { getMonthOptions, getYearOptions } from "@/lib/utils-client"

interface MonthYearPickerProps {
  month: string
  year: string
  onMonthChange: (month: string) => void
  onYearChange: (year: string) => void
}

export function MonthYearPicker({ month, year, onMonthChange, onYearChange }: MonthYearPickerProps) {
  const monthOptions = getMonthOptions()
  const yearOptions = getYearOptions()

  return (
    <div className="flex space-x-2">
      <Select value={month} onValueChange={onMonthChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Months</SelectItem>
          {monthOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={year} onValueChange={onYearChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
