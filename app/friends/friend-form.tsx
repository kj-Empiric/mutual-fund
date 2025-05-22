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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  role: z.string(),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>;

interface FriendFormProps {
  friend?: {
    id: number
    name: string
    email: string | null
    phone: string | null
    role?: string | null
  }
  onSuccess?: () => void
}

export function FriendForm({ friend, onSuccess }: FriendFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: friend?.name || "",
      email: friend?.email || "",
      phone: friend?.phone || "",
      role: friend?.role || "viewer",
      password: "",
    },
  })

  // Watch the role field to conditionally show password field
  const showPasswordField = !friend && !!form.watch("email");

  async function onSubmit(values: FormValues) {
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

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("API error:", errorData);
          throw new Error(`Failed to create friend: ${errorData.error || response.statusText}`);
        }

        toast({
          title: "Friend created",
          description: "The friend has been created successfully.",
        })

        form.reset({
          name: "",
          email: "",
          phone: "",
          role: "viewer",
          password: "",
        })
      }

      router.refresh()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error saving friend:", error)

      // If error message contains anything about tables not existing, try to run setup
      const errorMsg = String(error)
      if (errorMsg.includes("not exist") || errorMsg.includes("does not exist") || errorMsg.includes("table")) {
        toast({
          title: "Database setup required",
          description: "Setting up database tables...",
        })

        // Try to run setup
        try {
          const setupResponse = await fetch("/api/setup")
          if (setupResponse.ok) {
            toast({
              title: "Database setup complete",
              description: "Please try again.",
            })
          } else {
            toast({
              title: "Error",
              description: "There was an error setting up the database. Please contact support.",
              variant: "destructive",
            })
          }
        } catch (setupError) {
          console.error("Error running setup:", setupError)
        }
      } else {
        toast({
          title: "Error",
          description: "There was an error saving the friend. Please try again.",
          variant: "destructive",
        })
      }
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

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showPasswordField && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password for login" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : friend ? "Update Friend" : "Add Friend"}
        </Button>
      </form>
    </Form>
  )
}
