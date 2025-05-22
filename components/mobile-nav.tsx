"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <span className="font-bold">Mutual Funds Tracker</span>
        </Link>
        <div className="flex flex-col space-y-3 mt-8">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground",
              pathname === "/" && "text-foreground font-medium"
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/funds"
            onClick={() => setOpen(false)}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground",
              pathname?.startsWith("/funds") && "text-foreground font-medium"
            )}
          >
            Funds
          </Link>
          <Link
            href="/transactions"
            onClick={() => setOpen(false)}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground",
              pathname?.startsWith("/transactions") &&
              "text-foreground font-medium"
            )}
          >
            Transactions
          </Link>
          <Link
            href="/contributions"
            onClick={() => setOpen(false)}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground",
              pathname?.startsWith("/contributions") &&
              "text-foreground font-medium"
            )}
          >
            Contributions
          </Link>
          <Link
            href="/friends"
            onClick={() => setOpen(false)}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground",
              pathname?.startsWith("/friends") && "text-foreground font-medium"
            )}
          >
            Friends
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
