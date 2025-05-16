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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  friend_id: z.string().min(1, { message: "Please select a friend." }),
  amount: z.string().min(1, { message: "Please enter an amount." }),
  contribution_date: z.date({
    required_error: "Please select a date.",
  }),
  notes: z.string().optional(),
})

interface Friend {
  id: number
  name: string
}

interface Fund {
  id: number
  name: string
}

interface ContributionFormProps {
  contribution?: {
    id: number
    friend_id: number
    amount: string
    contribution_date: string
    notes: string | null
  }
  friends: Friend[]
  funds?: Fund[]
  onSuccess?: () => void
}

export function ContributionForm({ contribution, friends, funds = [], onSuccess }: ContributionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      friend_id: contribution ? String(contribution.friend_id) : "",
      amount: contribution ? String(contribution.amount) : "",
      contribution_date: contribution ? new Date(contribution.contribution_date) : new Date(),
      notes: contribution?.notes || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // Convert string IDs to numbers and format date
    const formattedValues = {
      ...values,
      friend_id: Number.parseInt(values.friend_id),
      contribution_date: format(values.contribution_date, "yyyy-MM-dd"),
    }

    try {
      if (contribution) {
        // Update existing contribution
        const response = await fetch(`/api/contributions/${contribution.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedValues),
        })

        if (!response.ok) throw new Error("Failed to update contribution")

        toast({
          title: "Contribution updated",
          description: "The contribution has been updated successfully.",
        })
      } else {
        // Create new contribution
        const response = await fetch("/api/contributions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedValues),
        })

        if (!response.ok) throw new Error("Failed to create contribution")

        toast({
          title: "Contribution created",
          description: "The contribution has been created successfully.",
        })

        form.reset({
          friend_id: "",
          amount: "",
          contribution_date: new Date(),
          notes: "",
        })
      }

      router.refresh()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error saving contribution:", error)
      toast({
        title: "Error",
        description: "There was an error saving the contribution. Please try again.",
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
          name="friend_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Friend</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a friend" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {friends.map((friend) => (
                    <SelectItem key={friend.id} value={String(friend.id)}>
                      {friend.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="contribution_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 md:w-auto" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : contribution ? "Update Contribution" : "Add Contribution"}
        </Button>
      </form>
    </Form>
  )
}
