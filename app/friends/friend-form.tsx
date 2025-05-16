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

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
})

interface FriendFormProps {
  friend?: {
    id: number
    name: string
    email: string | null
    phone: string | null
  }
  onSuccess?: () => void
}

export function FriendForm({ friend, onSuccess }: FriendFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: friend?.name || "",
      email: friend?.email || "",
      phone: friend?.phone || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      if (friend) {
        // Update existing friend
        const response = await fetch(`/api/friends/${friend.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })

        if (!response.ok) throw new Error("Failed to update friend")

        toast({
          title: "Friend updated",
          description: "The friend has been updated successfully.",
        })
      } else {
        // Create new friend
        const response = await fetch("/api/friends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })

        if (!response.ok) throw new Error("Failed to create friend")

        toast({
          title: "Friend created",
          description: "The friend has been created successfully.",
        })

        form.reset({
          name: "",
          email: "",
          phone: "",
        })
      }

      router.refresh()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error saving friend:", error)
      toast({
        title: "Error",
        description: "There was an error saving the friend. Please try again.",
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="(123) 456-7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : friend ? "Update Friend" : "Add Friend"}
        </Button>
      </form>
    </Form>
  )
}
