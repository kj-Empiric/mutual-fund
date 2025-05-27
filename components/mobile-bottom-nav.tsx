"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart2, CreditCard, Users, Wallet } from "lucide-react"

export function MobileBottomNav() {
    const pathname = usePathname()

    const navItems = [
        {
            name: "Dashboard",
            href: "/",
            icon: <BarChart2 className="h-5 w-5" />,
        },
        {
            name: "Funds",
            href: "/funds",
            icon: <Wallet className="h-5 w-5" />,
        },
        {
            name: "Transactions",
            href: "/transactions",
            icon: <CreditCard className="h-5 w-5" />,
        },
        {
            name: "Friends",
            href: "/friends",
            icon: <Users className="h-5 w-5" />,
        },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 bg-background border-t md:hidden">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "flex flex-1 flex-col items-center justify-center text-xs transition-colors",
                        pathname === item.href
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {item.icon}
                    <span className="mt-1">{item.name}</span>
                </Link>
            ))}
        </div>
    )
} 