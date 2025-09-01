import { sql } from "@/lib/db"
import { formatCurrency } from "@/lib/db"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, IndianRupee, BarChart3, PiggyBank, CreditCard, TrendingUp, Users, Wallet } from "lucide-react"
import { ensureDatabaseSetup } from "@/lib/db"
import { runDatabaseMigrations } from "@/lib/db-migration"
import { DashboardCharts } from "@/components/charts/dashboard-charts"

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic"

export default async function Dashboard() {
  try {
    // Make sure the database is set up
    await ensureDatabaseSetup()

    // Run migrations to ensure all tables are properly structured
    await runDatabaseMigrations()

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

    // Get total mutual fund investments
    const totalMutualFundInvestments = await sql`
      SELECT SUM(amount) as total
      FROM transactions
      WHERE transaction_category = 'mutual_fund'
    `

    // Get total charges
    const totalCharges = await sql`
      SELECT SUM(amount) as total FROM transactions WHERE transaction_type = 'charges'
    `

    // Get total deposits
    const totalDeposits = await sql`
      SELECT SUM(amount) as total FROM transactions WHERE transaction_type = 'deposit'
    `

    // Get total withdrawals
    const totalWithdrawals = await sql`
      SELECT SUM(amount) as total FROM transactions WHERE transaction_type = 'withdrawal'
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

    // Get contribution data for pie chart
    const contributionsByFriend = await sql`
      SELECT fr.name, SUM(c.amount) as total_amount
      FROM contributions c
      JOIN friends fr ON c.friend_id = fr.id
      GROUP BY fr.name
      ORDER BY total_amount DESC
      LIMIT 5
    `

    // Get transaction data for bar chart
    const transactionsByType = await sql`
      SELECT 
        id,
        transaction_type as name,
        amount as total_amount,
        transaction_category as category,
        transaction_date
      FROM transactions
      ORDER BY transaction_date DESC
      LIMIT 50
    `

    // Calculate total contribution amount for percentage calculation
    const totalContributionAmount = contributionsByFriend.reduce(
      (sum: number, item: any) => sum + Number(item.total_amount), 0
    )

    // Format contribution data for the pie chart
    const contributionChartData = contributionsByFriend.map((item: any) => {
      const amount = Number(item.total_amount)
      const percentage = Math.round((amount / totalContributionAmount) * 100)
      return {
        name: item.name,
        value: amount,
        percentage
      }
    })

    // Format transaction data for the bar chart
    const transactionChartData = transactionsByType.map((item: any) => ({
      name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      amount: Number(item.total_amount),
      category: item.category,
      transaction_date: item.transaction_date,
      id: item.id
    }))

    const charges = Number(totalCharges[0]?.total || 0)
    const deposits = Number(totalDeposits[0]?.total || 0)
    const withdrawals = Number(totalWithdrawals[0]?.total || 0)
    const balance = Number(currentBalance[0]?.balance || 0)

    return (
      <div className="space-y-6">
        <PageHeader 
          heading="Dashboard" 
          text="Overview of your mutual funds, contributions, and transactions." 
          variant="default"
        />

        {/* Stats Cards - Mobile First Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group hover:shadow-medium transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Contributions</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <IndianRupee className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(Number(totalContributions[0]?.total || 0))}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Across all funds</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-medium transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Current Balance</CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                <PiggyBank className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(Number(currentBalance[0]?.balance || 0))}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Available for investments</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-medium transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Total Investments</CardTitle>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(Number(totalMutualFundInvestments[0]?.total || 0))}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">In Mutual Fund</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-medium transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-300">Total Charges</CardTitle>
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
                <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                {formatCurrency(charges)}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                <span className="text-red-500">{formatCurrency(charges)}</span> + <span className="text-red-500">{formatCurrency(withdrawals)}</span> + <span className={balance >= 0 ? "text-green-500" : "text-red-500"}>{formatCurrency(balance)}</span> = <strong className="text-green-500">{formatCurrency(deposits)}</strong>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="space-y-6">
          <DashboardCharts
            contributionData={contributionChartData}
            transactionData={transactionChartData}
          />
        </div>

        {/* Tabs Section - Mobile Optimized */}
        <Tabs defaultValue="funds" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-12">
              <TabsTrigger value="funds" className="text-sm font-medium">Funds</TabsTrigger>
              <TabsTrigger value="friends" className="text-sm font-medium">Friends</TabsTrigger>
              <TabsTrigger value="recent" className="text-sm font-medium">Recent</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="funds" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fundTotals.map((fund) => (
                <Card key={fund.id} className="group hover:shadow-medium transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">{fund.name}</CardTitle>
                    <CardDescription>Total Invested</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-4">
                      {fund.total_amount ? formatCurrency(Number(fund.total_amount)) : 'N/A'}
                    </div>
                    <Link href={`/funds/${fund.id}`}>
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        View Fund Details
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}

              {fundTotals.length === 0 && (
                <Card className="col-span-full border-0 bg-muted/30">
                  <CardContent className="pt-8 pb-8 text-center">
                    <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="mb-4 text-lg font-medium">No funds added yet.</p>
                    <Link href="/funds">
                      <Button size="lg" className="px-8">
                        Add Your First Fund
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="friends" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {friendTotals.map((friend) => (
                <Card key={friend.id} className="group hover:shadow-medium transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">{friend.name}</CardTitle>
                    <CardDescription>Total Contributions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-4">
                      {formatCurrency(Number(friend.total_amount || 0))}
                    </div>
                    <Link href={`/contributions?friendId=${friend.id}`}>
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        View Contributions
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}

              {friendTotals.length === 0 && (
                <Card className="col-span-full border-0 bg-muted/30">
                  <CardContent className="pt-8 pb-8 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="mb-4 text-lg font-medium">No friends added yet.</p>
                    <Link href="/friends">
                      <Button size="lg" className="px-8">
                        Add Your First Friend
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Recent Contributions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentContributions.length > 0 ? (
                    <div className="space-y-4">
                      {recentContributions.map((contribution) => (
                        <div key={contribution.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="font-medium">{contribution.friend_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(contribution.contribution_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(Number(contribution.amount))}
                          </div>
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
                    <div className="text-center py-8">
                      <IndianRupee className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="mb-4 text-lg font-medium">No contributions yet.</p>
                      <Link href="/contributions">
                        <Button size="lg" className="px-8">
                          Add Your First Contribution
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="font-medium capitalize">{transaction.transaction_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.description} • {new Date(transaction.transaction_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div
                            className={`font-bold ${
                              transaction.transaction_type === "deposit"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
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
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="mb-4 text-lg font-medium">No transactions yet.</p>
                      <Link href="/transactions">
                        <Button size="lg" className="px-8">
                          Add Your First Transaction
                        </Button>
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
