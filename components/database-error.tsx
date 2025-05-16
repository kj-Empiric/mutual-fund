"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export function DatabaseError() {
  const refreshPage = () => {
    window.location.reload()
  }

  return (
    <Alert variant="destructive" className="my-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Database Connection Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>
          Could not connect to the database. Please check that your database connection string is properly set in the
          environment variables (DATABASE_URL or POSTGRES_URL).
        </p>
        <div>
          <Button onClick={refreshPage} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
