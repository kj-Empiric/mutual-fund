"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { UniversalEntryForm } from "@/components/universal-entry-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, Check, Database } from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"

export default function AdminPage() {
    const [healthData, setHealthData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { isAdmin } = usePermissions()

    async function checkHealth() {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/health")

            if (!response.ok) {
                throw new Error("Health check failed")
            }

            const data = await response.json()
            setHealthData(data)
        } catch (err) {
            setError("Failed to check database health")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkHealth()
    }, [])

    if (!isAdmin) {
        return (
            <div className="space-y-6">
                <PageHeader heading="Admin Dashboard" text="System administration and database management." />
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You don't have permission to view this page.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader heading="Admin Dashboard" text="System administration and database management." />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Database className="mr-2 h-5 w-5" />
                            Database Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-4">
                                <RefreshCw className="h-6 w-6 animate-spin" />
                            </div>
                        ) : error ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span>Connection Status:</span>
                                    <span className={`font-medium ${healthData.status === "healthy" ? "text-green-500" : "text-red-500"}`}>
                                        {healthData.status === "healthy" ? (
                                            <span className="flex items-center"><Check className="mr-1 h-4 w-4" /> Connected</span>
                                        ) : (
                                            "Disconnected"
                                        )}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Funds: <span className="font-medium">{healthData.database.stats.funds}</span></div>
                                    <div>Transactions: <span className="font-medium">{healthData.database.stats.transactions}</span></div>
                                    <div>Contributions: <span className="font-medium">{healthData.database.stats.contributions}</span></div>
                                    <div>Friends: <span className="font-medium">{healthData.database.stats.friends}</span></div>
                                </div>

                                {!healthData.schema.valid && (
                                    <Alert variant="destructive" className="mt-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Schema Issues Detected</AlertTitle>
                                        <AlertDescription>
                                            <ul className="list-disc pl-5 mt-2">
                                                {healthData.schema.errors.map((err: string, i: number) => (
                                                    <li key={i}>{err}</li>
                                                ))}
                                            </ul>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={checkHealth}
                            variant="outline"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Refresh
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Database Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button
                            onClick={() => fetch("/api/setup")}
                            className="w-full"
                        >
                            Run Database Setup
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => window.location.href = "/api/setup"}
                        >
                            Verify Database Tables
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <UniversalEntryForm />
        </div>
    )
}