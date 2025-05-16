"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

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
    price: string
    fund_type: string | null
    description: string | null
    purchase_date?: string
  }
  onSuccess?: () => void
}

export function FundForm({ fund, onSuccess }: FundFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: fund?.name || "",
      price: fund?.price || "",
      fund_type: fund?.fund_type || "",
      description: fund?.description || "",
      purchase_date: fund?.purchase_date ? new Date(fund.purchase_date) : new Date(),
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Purchase Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "MMMM yyyy") : <span>Select month/year</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 md:w-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    disabled={(date) => {
                      // Only allow selecting the first day of each month
                      return date.getDate() !== 1
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : fund ? "Update Mutual Fund" : "Add Mutual Fund"}
        </Button>
      </form>
    </Form>
  )
}
