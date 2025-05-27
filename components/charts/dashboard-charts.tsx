"use client";

import { ContributionPieChart } from "./contribution-pie-chart";
import { TransactionBarChart } from "./transaction-bar-chart";
import { TransactionCategoryChart } from "./transaction-category-chart";
import { TransactionTrendChart } from "./transaction-trend-chart";
import { TransactionTypePie } from "./transaction-type-pie";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface DashboardChartsProps {
    contributionData: {
        name: string;
        value: number;
        percentage: number;
    }[];
    transactionData: {
        name: string;
        amount: number;
        category?: string;
        transaction_date?: string;
        id?: number;
    }[];
}

export function DashboardCharts({ contributionData, transactionData }: DashboardChartsProps) {
    // Format transaction data for trend chart
    const transactionTrendData = transactionData.map(item => ({
        ...item,
        date: item.transaction_date
    }));

    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="types">Types</TabsTrigger>
                {/* <TabsTrigger value="categories">Categories</TabsTrigger> */}
                <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <ContributionPieChart data={contributionData} />
                    <TransactionBarChart data={transactionData} />
                </div>
            </TabsContent>

            <TabsContent value="types">
                <div className="grid gap-4">
                    <TransactionTypePie data={transactionData} />
                </div>
            </TabsContent>

            {/* <TabsContent value="categories">
                <div className="grid gap-4">
                    <TransactionCategoryChart data={transactionData} />
                </div>
            </TabsContent> */}

            <TabsContent value="trends">
                <div className="grid gap-4">
                    <TransactionTrendChart data={transactionTrendData} />
                </div>
            </TabsContent>
        </Tabs>
    );
} 