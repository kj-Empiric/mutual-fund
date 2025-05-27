"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export interface TransactionChartProps {
    data: {
        name: string;
        amount: number;
        category?: string;
        transaction_date?: string;
        id?: number;
    }[];
}

export function TransactionBarChart({ data }: TransactionChartProps) {
    const [timeFilter, setTimeFilter] = useState<string>("all");
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    // Get unique categories
    const categories = Array.from(new Set(data.map(item => item.category || 'Uncategorized')));

    // Process data based on time filter
    const filteredData = data.filter(item => {
        if (!item.transaction_date) return false;
        const date = new Date(item.transaction_date);

        // Category filter
        if (categoryFilter !== "all" && item.category !== categoryFilter) {
            return false;
        }

        // Custom date range filter
        if (timeFilter === "custom" && dateRange?.from && dateRange?.to) {
            return date >= dateRange.from && date <= dateRange.to;
        }

        // Other filters
        if (timeFilter === "all") return true;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        switch (timeFilter) {
            case "month":
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            case "quarter":
                const quarterStart = new Date(currentYear, Math.floor(currentMonth / 3) * 3, 1);
                const quarterEnd = new Date(currentYear, Math.floor(currentMonth / 3) * 3 + 3, 0);
                return date >= quarterStart && date <= quarterEnd;
            case "year":
                return date.getFullYear() === currentYear;
            default:
                return true;
        }
    });

    // Group by transaction type
    const typeMap = new Map();
    filteredData.forEach(item => {
        const type = item.name;
        if (!typeMap.has(type)) {
            typeMap.set(type, {
                name: type,
                amount: 0
            });
        }
        typeMap.get(type).amount += item.amount;
    });

    // Convert to array for rendering
    const chartData = Array.from(typeMap.values());

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Transactions</CardTitle>
                    <p className="text-sm text-muted-foreground">Breakdown by type</p>
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
                        value={timeFilter}
                        onValueChange={(value) => setTimeFilter(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Time Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                    </Select>

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

                    {timeFilter === "custom" && (
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
                    )}
                </div>
            )}
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 25,
                            }}
                            barGap={2}
                            barSize={15}
                        >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                                height={50}
                                interval={0}
                                tick={{
                                    fontSize: 10,
                                    width: 40
                                }}
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
                                dataKey="amount"
                                fill="#1e293b"
                                name="Amount"
                                radius={[2, 2, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
} 