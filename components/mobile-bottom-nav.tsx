"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart2, CreditCard, Users, Wallet, Home } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function MobileBottomNav() {
    const pathname = usePathname()

    const navItems = [
        {
            name: "Dashboard",
            href: "/",
            icon: <Home className="h-5 w-5" />,
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
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                delay: 0.2
            }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
            {/* Background blur and border */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-lg border-t border-border/50" />
            
            {/* Navigation items */}
            <div className="relative flex h-16 items-center justify-around px-4">
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                        <motion.div
                            key={item.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 flex justify-center"
                        >
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center h-full w-full transition-all duration-200",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <motion.div
                                    animate={{
                                        scale: isActive ? 1.2 : 1,
                                        y: isActive ? -2 : 0,
                                    }}
                                    transition={{ 
                                        type: "spring", 
                                        stiffness: 400, 
                                        damping: 17 
                                    }}
                                    className="relative"
                                >
                                    {item.icon}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full -translate-x-1/2"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.1 }}
                                        />
                                    )}
                                </motion.div>
                                
                                <motion.span
                                    animate={{
                                        y: isActive ? -2 : 0,
                                        opacity: isActive ? 1 : 0.7,
                                    }}
                                    transition={{ 
                                        type: "spring", 
                                        stiffness: 400, 
                                        damping: 17 
                                    }}
                                    className="mt-1 text-xs font-medium"
                                >
                                    {item.name}
                                </motion.span>
                            </Link>
                        </motion.div>
                    )
                })}
            </div>
            
            {/* Safe area for devices with home indicator */}
            <div className="h-safe-area-inset-bottom bg-background/80 backdrop-blur-lg" />
        </motion.div>
    )
} 