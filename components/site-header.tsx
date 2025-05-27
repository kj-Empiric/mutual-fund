"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, CreditCard, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function SiteHeader() {
    const pathname = usePathname();

    const navItems = [
        {
            name: "Dashboard",
            href: "/",
            icon: <BarChart2 className="h-4 w-4 mr-2" />,
        },
        {
            name: "Funds",
            href: "/funds",
            icon: <Wallet className="h-4 w-4 mr-2" />,
        },
        {
            name: "Transactions",
            href: "/transactions",
            icon: <CreditCard className="h-4 w-4 mr-2" />,
        },
        {
            name: "Friends",
            href: "/friends",
            icon: <Users className="h-4 w-4 mr-2" />,
        },
        {
            name: "Contributions",
            href: "/contributions",
            icon: <CreditCard className="h-4 w-4 mr-2" />,
        },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-950 shadow-sm">
            <div className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="flex items-center space-x-2">
                        <BarChart2 className="h-6 w-6" />
                        <span className="font-bold text-lg">MF Tracker</span>
                    </Link>
                </div>
                <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                                pathname === item.href
                                    ? "text-primary border-b-2 border-primary pb-3 -mb-3.5"
                                    : "text-muted-foreground"
                            )}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
} 