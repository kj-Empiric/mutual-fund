"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

// Define the color palette for the pie chart
const COLORS = ["#f97316", "#14b8a6", "#1e293b", "#eab308", "#f59e0b"];

export interface ContributionChartProps {
    data: {
        name: string;
        value: number;
        percentage: number;
    }[];
}

export function ContributionPieChart({ data }: ContributionChartProps) {
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [contributionFilter, setContributionFilter] = useState<string>("all");

    // Filter data based on contribution amount
    const filteredData = data.filter(item => {
        if (contributionFilter === "all") return true;

        const amount = item.value;
        switch (contributionFilter) {
            case "high":
                return amount >= 10000;
            case "medium":
                return amount >= 5000 && amount < 10000;
            case "low":
                return amount < 5000;
            default:
                return true;
        }
    });

    // Recalculate percentages after filtering
    const totalAmount = filteredData.reduce((sum, item) => sum + item.value, 0);
    const chartData = filteredData.map(item => ({
        ...item,
        percentage: Math.round((item.value / totalAmount) * 100)
    }));

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Contributions</CardTitle>
                    <p className="text-sm text-muted-foreground">Breakdown by friend</p>
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
                <div className="px-6 pb-2">
                    <Select
                        value={contributionFilter}
                        onValueChange={(value) => setContributionFilter(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Contribution Amount" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Contributions</SelectItem>
                            <SelectItem value="high">High (≥₹10,000)</SelectItem>
                            <SelectItem value="medium">Medium (₹5,000-₹9,999)</SelectItem>
                            <SelectItem value="low">Low (&lt;₹5,000)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ percentage }) => `${percentage}%`}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                            />
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                formatter={(value) => <span className="text-sm">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
} 