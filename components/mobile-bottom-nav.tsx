"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, BarChart2, PiggyBank, Users, DollarSign, Wallet } from "lucide-react"

export function MobileBottomNav() {
    const pathname = usePathname()

    return (
        <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
            <div className="grid h-full grid-cols-6">
                <NavItem
                    href="/"
                    icon={<Home size={20} />}
                    label="Home"
                    active={pathname === "/"}
                />
                <NavItem
                    href="/funds"
                    icon={<BarChart2 size={20} />}
                    label="Funds"
                    active={pathname?.startsWith("/funds")}
                />
                <NavItem
                    href="/fund-contributions"
                    icon={<Wallet size={20} />}
                    label="Fund Contrib."
                    active={pathname?.startsWith("/fund-contributions")}
                />
                <NavItem
                    href="/transactions"
                    icon={<DollarSign size={20} />}
                    label="Transactions"
                    active={pathname?.startsWith("/transactions")}
                />
                <NavItem
                    href="/contributions"
                    icon={<PiggyBank size={20} />}
                    label="Contributions"
                    active={pathname?.startsWith("/contributions")}
                />
                <NavItem
                    href="/friends"
                    icon={<Users size={20} />}
                    label="Friends"
                    active={pathname?.startsWith("/friends")}
                />
            </div>
        </div>
    )
}

interface NavItemProps {
    href: string
    icon: React.ReactNode
    label: string
    active: boolean
}

function NavItem({ href, icon, label, active }: NavItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                "flex flex-col items-center justify-center",
                active ? "text-primary" : "text-muted-foreground"
            )}
        >
            <div className="flex items-center justify-center">
                {icon}
            </div>
            <span className="text-xs mt-1">{label}</span>
        </Link>
    )
} 