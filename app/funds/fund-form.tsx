"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { format, isValid, parse, getYear, getMonth, setMonth, setYear, addYears } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  price: z.string().min(1, { message: "Please enter a price." }),
  fund_type: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  purchase_date: z.date({
    required_error: "Please select a purchase date.",
  }),
})

interface FundFormProps {
  fund?: {
    id: number
    name: string
    price: string | number | null
    fund_type: string | null
    description: string | null
    purchase_date?: string
  }
  onSuccess?: () => void
}

export function FundForm({ fund, onSuccess }: FundFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { isKeyur } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: fund?.name || "",
      price: fund?.price ? String(fund.price) : "",
      fund_type: fund?.fund_type || "",
      description: fund?.description || "",
      purchase_date: fund?.purchase_date ? new Date(fund.purchase_date) : new Date(),
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isKeyur) {
      toast({
        title: "Not allowed",
        description: "Only Keyur can save funds.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)

    // Format date for API
    const formattedValues = {
      ...values,
      purchase_date: format(values.purchase_date, "yyyy-MM-dd"),
    }

    try {
      if (fund) {
        // Update existing fund
        const response = await fetch(`/api/funds/${fund.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedValues),
        })

        if (!response.ok) throw new Error("Failed to update mutual fund")

        toast({
          title: "Mutual fund updated",
          description: "The mutual fund has been updated successfully.",
        })
      } else {
        // Create new fund
        const response = await fetch("/api/funds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedValues),
        })

        if (!response.ok) throw new Error("Failed to create mutual fund")

        toast({
          title: "Mutual fund created",
          description: "The mutual fund has been created successfully.",
        })

        form.reset({
          name: "",
          price: "",
          fund_type: "",
          description: "",
          purchase_date: new Date(),
        })
      }

      router.refresh()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error saving mutual fund:", error)
      toast({
        title: "Error",
        description: "There was an error saving the mutual fund. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fund Name</FormLabel>
              <FormControl>
                <Input placeholder="Vanguard Total Stock Market Index" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="100.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fund_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fund Type</FormLabel>
              <FormControl>
                <Input placeholder="Index Fund" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purchase_date"
          render={({ field }) => {
            // Format the displayed date in a more user-friendly format
            const formattedDate = field.value && isValid(field.value)
              ? format(field.value, "MMM d, yyyy")
              : "Select date";

            const [showCalendar, setShowCalendar] = useState(false);
            const [currentMonth, setCurrentMonth] = useState<number>(
              field.value ? getMonth(field.value) : getMonth(new Date())
            );
            const [currentYear, setCurrentYear] = useState<number>(
              field.value ? getYear(field.value) : getYear(new Date())
            );

            const calendarRef = useRef<HTMLDivElement>(null);

            // Update current view when field value changes
            useEffect(() => {
              if (field.value && isValid(field.value)) {
                setCurrentMonth(getMonth(field.value));
                setCurrentYear(getYear(field.value));
              }
            }, [field.value]);

            // Generate years array
            const currentYearNumber = new Date().getFullYear();
            const years = Array.from(
              { length: 21 },
              (_, i) => currentYearNumber - 10 + i
            );

            // Month names
            const months = [
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ];

            // Get days for the current month view
            const getDaysInMonth = (year: number, month: number) => {
              // Get the first day of the month
              const firstDay = new Date(year, month, 1);
              const firstDayIndex = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

              // Get the last day of the month (day 0 of next month is the last day of current month)
              const lastDay = new Date(year, month + 1, 0);
              const daysInMonth = lastDay.getDate();

              // Get the last few days of previous month to fill in the first week
              const prevMonthLastDay = new Date(year, month, 0).getDate();
              const prevMonthDays = Array.from({ length: firstDayIndex }, (_, i) => ({
                day: prevMonthLastDay - firstDayIndex + i + 1,
                month: month - 1,
                year: month === 0 ? year - 1 : year,
                isCurrentMonth: false
              }));

              // Current month days
              const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
                day: i + 1,
                month: month,
                year: year,
                isCurrentMonth: true
              }));

              // Next month days to fill the remaining cells (6 rows × 7 days = 42 cells total)
              const totalCells = 42;
              const nextMonthDays = Array.from(
                { length: totalCells - prevMonthDays.length - currentMonthDays.length },
                (_, i) => ({
                  day: i + 1,
                  month: month + 1,
                  year: month === 11 ? year + 1 : year,
                  isCurrentMonth: false
                })
              );

              return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
            };

            const calendarDays = getDaysInMonth(currentYear, currentMonth);

            // Function to check if a day is the selected date
            const isSelectedDate = (day: number, month: number, year: number) => {
              if (!field.value) return false;
              const date = new Date(year, month, day);
              return (
                getYear(field.value) === year &&
                getMonth(field.value) === month &&
                field.value.getDate() === day
              );
            };

            return (
              <FormItem className="flex flex-col relative">
                <FormLabel>Purchase Date</FormLabel>
                <Button
                  type="button"
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal flex justify-between items-center",
                    !field.value && "text-muted-foreground"
                  )}
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <span>{formattedDate}</span>
                  <CalendarIcon className="h-4 w-4 opacity-70" />
                </Button>

                {showCalendar && (
                  <div
                    ref={calendarRef}
                    className="absolute z-[100] mt-1 bg-white rounded-md border shadow-md"
                    style={{
                      top: "calc(100% + 4px)",
                      width: "300px",
                      left: "50%",
                      transform: "translateX(-50%)"
                    }}
                  >
                    <div className="p-2" onClick={(e) => e.stopPropagation()}>
                      {/* Month/Year Selection Header */}
                      <div className="flex items-center justify-between mb-2 px-1">
                        <div className="flex items-center">
                          <ChevronLeft
                            className="h-4 w-4 mr-1 cursor-pointer hover:text-primary"
                            onClick={() => {
                              if (currentMonth === 0) {
                                setCurrentMonth(11);
                                setCurrentYear(prev => prev - 1);
                              } else {
                                setCurrentMonth(prev => prev - 1);
                              }
                            }}
                          />
                          <select
                            className="bg-transparent text-sm font-medium outline-none border-none cursor-pointer"
                            value={currentMonth}
                            onChange={(e) => setCurrentMonth(Number(e.target.value))}
                          >
                            {months.map((month, index) => (
                              <option key={month} value={index}>
                                {month}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center">
                          <select
                            className="bg-transparent text-sm font-medium outline-none border-none cursor-pointer"
                            value={currentYear}
                            onChange={(e) => setCurrentYear(Number(e.target.value))}
                          >
                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                          <ChevronRight
                            className="h-4 w-4 ml-1 cursor-pointer hover:text-primary"
                            onClick={() => {
                              if (currentMonth === 11) {
                                setCurrentMonth(0);
                                setCurrentYear(prev => prev + 1);
                              } else {
                                setCurrentMonth(prev => prev + 1);
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Day headers */}
                      <div className="grid grid-cols-7 text-center mb-1">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                          <div key={day} className="text-xs font-medium text-gray-500 py-1">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((dateObj, i) => {
                          const { day, month, year, isCurrentMonth } = dateObj;
                          const isSelected = isSelectedDate(day, month, year);

                          return (
                            <button
                              type="button"
                              key={`${year}-${month}-${day}-${i}`}
                              onClick={() => {
                                field.onChange(new Date(year, month, day));
                                setShowCalendar(false);
                              }}
                              className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center text-sm focus:outline-none",
                                isCurrentMonth ? "text-gray-900" : "text-gray-300",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-gray-100"
                              )}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Click outside handler */}
                {showCalendar && (
                  <div
                    className="fixed inset-0 z-[90]"
                    onClick={() => setShowCalendar(false)}
                  />
                )}

                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Fund description..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading || !isKeyur} title={!isKeyur ? "Only Keyur can save" : undefined}>
          {isLoading ? "Saving..." : fund ? "Update Mutual Fund" : "Add Mutual Fund"}
        </Button>
      </form>
    </Form>
  )
}
