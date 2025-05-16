import { sql } from "@/lib/db"
import { formatCurrency } from "@/lib/db"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, IndianRupee, Users, BarChart3, PiggyBank } from "lucide-react"

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic"

export default async function Dashboard() {
  try {
    // Get fund totals
    const fundTotals = await sql`
      SELECT f.id, f.name
      FROM funds f
      ORDER BY f.name
    `

    // Get friend totals
    const friendTotals = await sql`
      SELECT fr.id, fr.name, SUM(c.amount) as total_amount
      FROM friends fr
      LEFT JOIN contributions c ON fr.id = c.friend_id
      GROUP BY fr.id, fr.name
      ORDER BY total_amount DESC NULLS LAST
    `

    // Get total contributions
    const totalContributions = await sql`
      SELECT SUM(amount) as total FROM contributions
    `

    // Get current balance
    const currentBalance = await sql`
      SELECT SUM(
        CASE 
          WHEN transaction_type = 'deposit' THEN amount 
          WHEN transaction_type IN ('withdrawal', 'charges', 'mutual_funds') THEN -amount
          ELSE 0
        END
      ) as balance
      FROM transactions
    `

    // Get recent contributions
    const recentContributions = await sql`
      SELECT c.*, fr.name as friend_name
      FROM contributions c
      JOIN friends fr ON c.friend_id = fr.id
      ORDER BY c.contribution_date DESC
      LIMIT 5
    `

    // Get recent transactions
    const recentTransactions = await sql`
      SELECT *
      FROM transactions
      ORDER BY transaction_date DESC
      LIMIT 5
    `

    return (
      <div className="space-y-6">
        <PageHeader heading="Dashboard" text="Overview of your mutual funds, contributions, and transactions." />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(Number(totalContributions[0]?.total || 0))}</div>
              <p className="text-xs text-muted-foreground">Across all funds</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(Number(currentBalance[0]?.balance || 0))}</div>
              <p className="text-xs text-muted-foreground">Available for investments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Friends</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{friendTotals.length}</div>
              <p className="text-xs text-muted-foreground">Contributing to funds</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funds</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fundTotals.length}</div>
              <p className="text-xs text-muted-foreground">Being tracked</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="funds">
          <TabsList>
            <TabsTrigger value="funds">Funds</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="funds" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {fundTotals.map((fund) => (
                <Card key={fund.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{fund.name}</CardTitle>
                    <CardDescription>Total Invested</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{fund.total_amount ? formatCurrency(Number(fund.total_amount)) : 'N/A'}</div>
                    <div className="mt-4">
                      <Link href={`/funds/${fund.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Fund Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {fundTotals.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center">
                    <p className="mb-4">No funds added yet.</p>
                    <Link href="/funds">
                      <Button>Add Your First Fund</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="friends" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {friendTotals.map((friend) => (
                <Card key={friend.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{friend.name}</CardTitle>
                    <CardDescription>Total Contributions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(Number(friend.total_amount || 0))}</div>
                    <div className="mt-4">
                      <Link href={`/contributions?friendId=${friend.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Contributions
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {friendTotals.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center">
                    <p className="mb-4">No friends added yet.</p>
                    <Link href="/friends">
                      <Button>Add Your First Friend</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Contributions</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentContributions.length > 0 ? (
                    <div className="space-y-4">
                      {recentContributions.map((contribution) => (
                        <div key={contribution.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{contribution.friend_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(contribution.contribution_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="font-medium">{formatCurrency(Number(contribution.amount))}</div>
                        </div>
                      ))}
                      <div className="pt-2">
                        <Link href="/contributions">
                          <Button variant="outline" size="sm" className="w-full">
                            View All Contributions
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="mb-4">No contributions yet.</p>
                      <Link href="/contributions">
                        <Button>Add Your First Contribution</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{transaction.transaction_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.description} • {new Date(transaction.transaction_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div
                            className={`font-medium ${transaction.transaction_type === "deposit"
                                ? "text-green-500"
                                : "text-red-500"
                              }`}
                          >
                            {transaction.transaction_type === "deposit" ? "+" : "-"}
                            {formatCurrency(Number(transaction.amount))}
                          </div>
                        </div>
                      ))}
                      <div className="pt-2">
                        <Link href="/transactions">
                          <Button variant="outline" size="sm" className="w-full">
                            View All Transactions
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="mb-4">No transactions yet.</p>
                      <Link href="/transactions">
                        <Button>Add Your First Transaction</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}
