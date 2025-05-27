import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { MobileSiteHeader } from "@/components/mobile-site-header"

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
            {/* Desktop header */}
            <div className="hidden md:block">
              <SiteHeader />
            </div>

            {/* Mobile header */}
            <div className="md:hidden">
              <MobileSiteHeader />
            </div>

            <main className="flex-1">
              <div className="container px-4 py-4 sm:px-6 sm:py-6 lg:px-8">{children}</div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
