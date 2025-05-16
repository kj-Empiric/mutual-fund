import type React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function PageHeader({ heading, text, children, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 pb-4 sm:pb-6", className)} {...props}>
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{heading}</h1>
      {text && <p className="text-sm sm:text-base text-muted-foreground">{text}</p>}
      {children}
    </div>
  )
}
