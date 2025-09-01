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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, isValid, parse, getYear, getMonth, setMonth, setYear, addYears } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  amount: z.string().min(1, { message: "Please enter an amount." }),
  transaction_date: z.date({
    required_error: "Please select a date.",
  }),
  transaction_type: z.string().min(1, { message: "Please select a transaction type." }),
  transaction_category: z.string().min(1, { message: "Please select a transaction category." }),
  bank_name: z.string().min(1, { message: "Please select or enter a bank name." }),
  custom_bank_name: z.string().optional(),
  friend_name: z.string().optional(),
  custom_friend_name: z.string().optional(),
  description: z.string().optional(),
})

interface Friend {
  id: number
  name: string
}

interface TransactionFormProps {
  transaction?: {
    id: number
    amount: string
    transaction_date: string
    transaction_type: string
    transaction_category: string
    bank_name: string
    friend_name?: string
    description: string | null
  }
  onSuccess?: () => void
}

export function TransactionForm({ transaction, onSuccess }: TransactionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCustomBankInput, setShowCustomBankInput] = useState(transaction?.bank_name === "Other")
  const [showFriendInput, setShowFriendInput] = useState(transaction?.transaction_type === "deposit")
  const [showCustomFriendInput, setShowCustomFriendInput] = useState(transaction?.friend_name === "Other")
  const [friends, setFriends] = useState<Friend[]>([])
  const [loadingFriends, setLoadingFriends] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: transaction ? String(transaction.amount) : "",
      transaction_date: transaction ? new Date(transaction.transaction_date) : new Date(),
      transaction_type: transaction ? transaction.transaction_type : "",
      transaction_category: transaction ? transaction.transaction_category : "",
      bank_name: transaction ? transaction.bank_name : "",
      custom_bank_name: "",
      friend_name: transaction?.friend_name || "",
      custom_friend_name: "",
      description: transaction?.description || "",
    },
  })

  // Fetch friends from the database
  useEffect(() => {
    const fetchFriends = async () => {
      setLoadingFriends(true)
      try {
        const response = await fetch('/api/friends')
        if (!response.ok) throw new Error('Failed to fetch friends')
        const data = await response.json()
        setFriends(data)
      } catch (error) {
        console.error('Error fetching friends:', error)
        toast({
          title: "Error",
          description: "Failed to load friends list. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingFriends(false)
      }
    }

    fetchFriends()
  }, [])

  // Watch for transaction type changes to show/hide friend dropdown
  const transactionType = form.watch("transaction_type")

  useEffect(() => {
    setShowFriendInput(transactionType === "deposit")
  }, [transactionType])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // Use custom bank name if "Other" is selected
    const finalBankName = values.bank_name === "Other" && values.custom_bank_name
      ? values.custom_bank_name
      : values.bank_name

    // Use custom friend name if "Other" is selected
    const finalFriendName = values.friend_name === "Other" && values.custom_friend_name
      ? values.custom_friend_name
      : values.friend_name

    // If a new friend name was entered, save it to the database
    if (values.transaction_type === "deposit" && values.friend_name === "Other" && values.custom_friend_name) {
      try {
        const response = await fetch('/api/friends', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: values.custom_friend_name,
            email: null,
            phone: null
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save new friend');
        }
      } catch (error) {
        console.error('Error saving new friend:', error);
        toast({
          title: "Warning",
          description: "We saved your transaction but couldn't save the new friend to the database.",
          variant: "destructive",
        });
      }
    }

    // Format date and prepare values
    const formattedValues = {
      ...values,
      bank_name: finalBankName,
      friend_name: values.transaction_type === "deposit" ? finalFriendName : null,
      transaction_date: format(values.transaction_date, "yyyy-MM-dd"),
    }

    // Remove custom fields from the payload
    delete formattedValues.custom_bank_name
    delete formattedValues.custom_friend_name

    // We don't need to remove friend_name anymore since we're setting it to null for non-deposits
    // if (values.transaction_type !== "deposit") {
    //   delete formattedValues.friend_name
    // }

    try {
      if (transaction) {
        // Update existing transaction
        console.log("Updating transaction with data:", formattedValues);
        const response = await fetch(`/api/transactions/${transaction.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedValues),
        })

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(`Failed to update transaction: ${errorData.error || response.statusText}`);
        }

        toast({
          title: "Transaction updated",
          description: "The transaction has been updated successfully.",
        })
      } else {
        // Create new transaction
        console.log("Creating new transaction with data:", JSON.stringify(formattedValues, null, 2));
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedValues),
        })

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(`Failed to create transaction: ${errorData.error || response.statusText}`);
        }

        toast({
          title: "Transaction created",
          description: "The transaction has been created successfully.",
        })

        form.reset({
          amount: "",
          transaction_date: new Date(),
          transaction_type: "",
          transaction_category: "",
          bank_name: "",
          description: "",
        })
      }

      router.refresh()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error saving transaction:", error)
      toast({
        title: "Error",
        description: "There was an error saving the transaction. Please try again.",
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="100.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="transaction_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="charges">Charges</SelectItem>
                    <SelectItem value="mutual_funds">Mutual Funds</SelectItem>
                    <SelectItem value="jenish_personal">Jenish Personal</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transaction_category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                    <SelectItem value="bank_charges">Bank Charges</SelectItem>
                    <SelectItem value="debit_card_charges">Debit Card Charges</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="jenish_personal_use">Jenis Personal USE</SelectItem>
                    <SelectItem value="jenish_personal_spend">Jenis Personal SPEND</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bank_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  setShowCustomBankInput(value === "Other")
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Kotak Mahindra">Kotak Mahindra</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showCustomBankInput && (
          <FormField
            control={form.control}
            name="custom_bank_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Bank Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter bank name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="transaction_date"
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
                <FormLabel>Date</FormLabel>
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
                <Textarea placeholder="Transaction description..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showFriendInput && (
          <FormField
            control={form.control}
            name="friend_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Friend Name</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    setShowCustomFriendInput(value === "Other")
                  }}
                  defaultValue={field.value}
                  disabled={loadingFriends}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingFriends ? "Loading friends..." : "Select friend"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {friends.map((friend) => (
                      <SelectItem key={friend.id} value={friend.name}>
                        {friend.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {showFriendInput && showCustomFriendInput && (
          <FormField
            control={form.control}
            name="custom_friend_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Friend Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter friend name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : transaction ? "Update Transaction" : "Add Transaction"}
        </Button>
      </form>
    </Form>
  )
}
