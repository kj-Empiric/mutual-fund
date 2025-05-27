"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export interface TransactionTrendChartProps {
    data: {
        name: string;
        amount: number;
        category?: string;
        date?: string;
        transaction_date?: string;
        id?: number;
    }[];
}

export function TransactionTrendChart({ data }: TransactionTrendChartProps) {
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [timeRangeFilter, setTimeRangeFilter] = useState<string>("6months");
    const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>("all");

    // Get unique transaction types
    const transactionTypes = Array.from(new Set(data.map(item => item.name)));

    // Filter data based on selected filters
    const filteredData = data.filter(item => {
        // Filter by transaction type
        if (transactionTypeFilter !== "all" && item.name !== transactionTypeFilter) {
            return false;
        }

        // Filter by time range
        if (!item.date && !item.transaction_date) return false;

        const date = new Date(item.date || item.transaction_date || '');
        const now = new Date();

        switch (timeRangeFilter) {
            case "3months":
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(now.getMonth() - 3);
                return date >= threeMonthsAgo;
            case "6months":
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(now.getMonth() - 6);
                return date >= sixMonthsAgo;
            case "1year":
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(now.getFullYear() - 1);
                return date >= oneYearAgo;
            case "all":
            default:
                return true;
        }
    });

    // Group data by month
    const monthlyData = filteredData.reduce((acc: any, item) => {
        if (!item.date && !item.transaction_date) return acc;

        const date = new Date(item.date || item.transaction_date || '');
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

        if (!acc[monthYear]) {
            acc[monthYear] = {
                month: monthYear,
                deposit: 0,
                withdrawal: 0,
                mutual_funds: 0,
                charges: 0,
                other: 0,
                timestamp: date.getTime() // For sorting
            };
        }

        const type = item.name.toLowerCase();
        if (['deposit', 'withdrawal', 'mutual_funds', 'charges'].includes(type)) {
            acc[monthYear][type] += item.amount;
        } else {
            acc[monthYear].other += item.amount;
        }

        return acc;
    }, {});

    // Convert to array and sort by date
    const monthlyArray = Object.values(monthlyData)
        .sort((a: any, b: any) => a.timestamp - b.timestamp);

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Transaction Trends</CardTitle>
                    <p className="text-sm text-muted-foreground">Monthly transaction activity</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                </Button>
            </CardHeader>
            {showFilters && (
                <div className="px-6 pb-2 flex flex-wrap gap-2">
                    <Select
                        value={timeRangeFilter}
                        onValueChange={(value) => setTimeRangeFilter(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Time Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3months">Last 3 Months</SelectItem>
                            <SelectItem value="6months">Last 6 Months</SelectItem>
                            <SelectItem value="1year">Last Year</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={transactionTypeFilter}
                        onValueChange={(value) => setTransactionTypeFilter(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Transaction Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {transactionTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={monthlyArray}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 25,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                tickFormatter={(value) => `₹${value / 1000}k`}
                                width={60}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                formatter={(value: number) => [`₹${value.toLocaleString()}`]}
                                labelFormatter={(label) => `Month: ${label}`}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="deposit"
                                stroke="#16a34a"
                                activeDot={{ r: 8 }}
                                name="Deposits"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="withdrawal"
                                stroke="#ef4444"
                                name="Withdrawals"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="mutual_funds"
                                stroke="#1e293b"
                                name="Mutual Funds"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
} 