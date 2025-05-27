"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

// Define the color palette for the pie chart
const COLORS = ["#16a34a", "#ef4444", "#1e293b", "#f59e0b", "#6366f1"];

export interface TransactionTypePieProps {
    data: {
        name: string;
        amount: number;
        category?: string;
        transaction_date?: string;
        id?: number;
    }[];
}

export function TransactionTypePie({ data }: TransactionTypePieProps) {
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    // Get unique categories
    const categories = Array.from(new Set(data.map(item => item.category || 'Uncategorized')));

    // Filter data based on selected filters
    const filteredData = data.filter(item => {
        // Filter by category
        if (categoryFilter !== "all" && item.category !== categoryFilter) {
            return false;
        }

        // Filter by date range
        if (dateRange?.from && dateRange?.to && item.transaction_date) {
            const date = new Date(item.transaction_date);
            return date >= dateRange.from && date <= dateRange.to;
        }

        return true;
    });

    // Group data by transaction type
    const typeMap = new Map();

    filteredData.forEach(item => {
        const type = item.name;
        if (!typeMap.has(type)) {
            typeMap.set(type, {
                name: type,
                value: 0,
            });
        }
        typeMap.get(type).value += item.amount;
    });

    // Convert to array for rendering
    const typeData = Array.from(typeMap.values());

    // Calculate total for percentages
    const total = typeData.reduce((sum, item) => sum + item.value, 0);

    // Add percentage to data
    const chartData = typeData.map(item => ({
        ...item,
        percentage: Math.round((item.value / total) * 100)
    }));

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Transaction Types</CardTitle>
                    <p className="text-sm text-muted-foreground">Distribution by type</p>
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
                        value={categoryFilter}
                        onValueChange={(value) => setCategoryFilter(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="grid gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[300px] justify-start text-left font-normal",
                                        !dateRange?.from && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from && dateRange?.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
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