"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="font-bold">Mutual Funds Tracker</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/funds"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/funds")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Funds
        </Link>
        <Link
          href="/transactions"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/transactions")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Transactions
        </Link>
        <Link
          href="/contributions"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/contributions")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Contributions
        </Link>
        <Link
          href="/friends"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/friends")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Friends
        </Link>
      </nav>
    </div>
  )
}
