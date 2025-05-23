import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mutual Funds Tracker",
  description: "Track mutual funds, contributions, and transactions",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} h-full`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center px-4 sm:px-6 lg:px-8">
                <MainNav />
                <div className="md:hidden flex-1 flex items-center justify-center">
                  <Link href="/" className="font-bold text-lg">
                    Mutual Funds Tracker
                  </Link>
                </div>
                <div className="flex items-center justify-end md:flex-1">
                  <MobileNav />
                </div>
              </div>
            </header>
            <main className="flex-1 pb-16 md:pb-0">
              <div className="container px-4 py-4 sm:px-6 sm:py-6 lg:px-8">{children}</div>
            </main>
            <MobileBottomNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
