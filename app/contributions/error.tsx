"use client"

import { useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="space-y-6">
      <PageHeader heading="Contributions" text="Track contributions to mutual funds." />

      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Database Connection Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>
            Could not connect to the database. Please check that your database connection string is properly set in the
            environment variables.
          </p>
          <div>
            <Button onClick={reset} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
