import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { MobileSiteHeader } from "@/components/mobile-site-header"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
})

export const metadata: Metadata = {
  title: "Mutual Funds Tracker",
  description: "Track mutual funds, contributions, and transactions with modern analytics",
  keywords: ["mutual funds", "investments", "finance", "tracker", "portfolio"],
  authors: [{ name: "Mutual Funds Tracker" }],
  creator: "Mutual Funds Tracker",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mutual-funds-tracker.com",
    title: "Mutual Funds Tracker",
    description: "Track mutual funds, contributions, and transactions with modern analytics",
    siteName: "Mutual Funds Tracker",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mutual Funds Tracker",
    description: "Track mutual funds, contributions, and transactions with modern analytics",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="h-full bg-background font-sans antialiased">
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

            {/* Main content */}
            <main className="flex-1">
              <div className="mobile-container mobile-padding">
                {children}
              </div>
            </main>

            {/* Mobile bottom navigation */}
            <div className="md:hidden">
              <MobileBottomNav />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
