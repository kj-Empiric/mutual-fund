"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useEffect } from "react"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  // Close the sheet when the pathname changes (navigation occurs)
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("md:hidden", open ? "opacity-0 pointer-events-none" : "opacity-100")}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80vw] max-w-[300px] p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="text-left">Mutual Funds Tracker</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col py-4">
          <NavItem href="/" active={pathname === "/"} onClick={() => setOpen(false)}>
            Dashboard
          </NavItem>
          <NavItem href="/funds" active={pathname?.startsWith("/funds")} onClick={() => setOpen(false)}>
            Funds
          </NavItem>
          <NavItem href="/transactions" active={pathname?.startsWith("/transactions")} onClick={() => setOpen(false)}>
            Transactions
          </NavItem>
          <NavItem href="/contributions" active={pathname?.startsWith("/contributions")} onClick={() => setOpen(false)}>
            Contributions
          </NavItem>
          <NavItem href="/friends" active={pathname?.startsWith("/friends")} onClick={() => setOpen(false)}>
            Friends
          </NavItem>
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface NavItemProps {
  href: string
  active: boolean
  children: React.ReactNode
  onClick?: () => void
}

function NavItem({ href, active, children, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center px-6 py-3 text-base transition-colors",
        active
          ? "bg-primary/10 text-primary font-medium border-l-4 border-primary"
          : "text-foreground/70 hover:text-foreground hover:bg-muted"
      )}
    >
      {children}
    </Link>
  )
}
