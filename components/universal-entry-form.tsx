"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"

// Import your existing form components
import { TransactionForm } from "@/app/transactions/transaction-form"
import { FundForm } from "@/app/funds/fund-form"
import { ContributionForm } from "@/app/contributions/contribution-form"
import { FriendForm } from "@/app/friends/friend-form"

export function UniversalEntryForm() {
    const [activeTab, setActiveTab] = useState("transaction")
    const { canCreate } = usePermissions()

    if (!canCreate) {
        return (
            <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                    Only users named "Keyur" can create new entries.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Add New Entry</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 mb-4">
                        <TabsTrigger value="transaction">Transaction</TabsTrigger>
                        <TabsTrigger value="fund">Fund</TabsTrigger>
                        <TabsTrigger value="contribution">Contribution</TabsTrigger>
                        <TabsTrigger value="friend">Friend</TabsTrigger>
                    </TabsList>
                    <TabsContent value="transaction">
                        <TransactionForm onSuccess={() => { }} />
                    </TabsContent>
                    <TabsContent value="fund">
                        <FundForm onSuccess={() => { }} />
                    </TabsContent>
                    <TabsContent value="contribution">
                        <ContributionForm onSuccess={() => { }} />
                    </TabsContent>
                    <TabsContent value="friend">
                        <FriendForm onSuccess={() => { }} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}