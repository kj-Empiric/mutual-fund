"use client";

import Link from "next/link";
import { BarChart2, CreditCard, Users, Wallet } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserInfo } from "@/components/auth/user-info";

export function MobileSiteHeader() {
    const [open, setOpen] = useState(false);
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
        <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-950 shadow-sm md:hidden">
            <div className="container flex h-14 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <BarChart2 className="h-6 w-6" />
                    <span className="font-bold text-lg">MF Tracker</span>
                </Link>
                <div className="flex items-center gap-2">
                    <UserInfo />
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                            <SheetTitle>Navigation Menu</SheetTitle>
                            <nav className="flex flex-col gap-4 mt-8">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center text-sm font-medium transition-colors hover:text-primary p-2 rounded-md",
                                            pathname === item.href
                                                ? "text-primary bg-gray-100 dark:bg-gray-800"
                                                : "text-muted-foreground"
                                        )}
                                        onClick={() => setOpen(false)}
                                    >
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
} 