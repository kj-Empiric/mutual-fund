"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    amount: z.string().min(1, { message: "Please enter an amount." }),
    contribution_date: z.date({
        required_error: "Please select a date.",
    }),
})

interface FundContributionFormProps {
    onSuccess?: () => void
}

export function FundContributionForm({ onSuccess }: FundContributionFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: "",
            contribution_date: new Date(),
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)

        // Format date for API
        const formattedValues = {
            ...values,
            contribution_date: format(values.contribution_date, "yyyy-MM-dd"),
        }

        try {
            // Create new fund contribution
            const response = await fetch("/api/fund-contributions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedValues),
            })

            if (!response.ok) throw new Error("Failed to create fund contribution")

            toast({
                title: "Fund contribution added",
                description: "The fund contribution has been added successfully.",
            })

            form.reset({
                amount: "",
                contribution_date: new Date(),
            })

            router.refresh()
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error("Error saving fund contribution:", error)
            toast({
                title: "Error",
                description: "There was an error saving the fund contribution. Please try again.",
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
                                <Input type="number" step="0.01" placeholder="5000.00" {...field} />
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
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Fund Contribution"}
                </Button>
            </form>
        </Form>
    )
} 