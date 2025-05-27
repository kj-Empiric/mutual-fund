"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export interface TransactionCategoryChartProps {
    data: {
        name: string;
        amount: number;
        category?: string;
        transaction_date?: string;
        id?: number;
    }[];
}

export function TransactionCategoryChart({ data }: TransactionCategoryChartProps) {
    // Group data by category
    const categoryMap = new Map();

    data.forEach(item => {
        const category = item.category || 'Uncategorized';
        if (!categoryMap.has(category)) {
            categoryMap.set(category, []);
        }
        categoryMap.get(category).push(item);
    });

    // Convert to array for rendering
    const categories = Array.from(categoryMap.entries()).map(([category, items]) => ({
        category,
        total: items.reduce((sum: number, item: any) => sum + item.amount, 0),
        items
    }));

    // Sort by total amount
    categories.sort((a, b) => b.total - a.total);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Transaction Categories</CardTitle>
                <p className="text-sm text-muted-foreground">Breakdown by category</p>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={categories}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 25,
                            }}
                            barGap={0}
                        >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                            <XAxis
                                dataKey="category"
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
                                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                wrapperStyle={{ paddingTop: '10px' }}
                            />
                            <Bar
                                dataKey="total"
                                fill="#14b8a6"
                                name="Amount"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
} 