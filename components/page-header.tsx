"use client"
import type React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const MotionDiv = motion("div")

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string
  text?: string
  children?: React.ReactNode
  variant?: "default" | "centered" | "minimal"
}

export function PageHeader({ 
  heading, 
  text, 
  children, 
  className, 
  variant = "default" 
}: PageHeaderProps) {
  const containerClasses = cn(
    "flex flex-col gap-3 pb-6 sm:pb-8",
    variant === "centered" && "text-center items-center",
    variant === "minimal" && "gap-2 pb-4",
    className
  )

  const headingClasses = cn(
    "font-bold tracking-tight",
    variant === "minimal" 
      ? "text-lg sm:text-xl" 
      : "text-xl sm:text-2xl lg:text-3xl"
  )

  const textClasses = cn(
    "text-muted-foreground",
    variant === "minimal" 
      ? "text-sm" 
      : "text-sm sm:text-base lg:text-lg"
  )

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1
      }}
      className={containerClasses}
    >
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={headingClasses}
      >
        {heading}
      </motion.h1>
      
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={textClasses}
        >
          {text}
        </motion.p>
      )}
      
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-2"
        >
          {children}
        </motion.div>
      )}
    </MotionDiv>
  )
}
