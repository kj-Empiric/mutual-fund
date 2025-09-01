"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

interface MonthYearPickerProps {
  value?: Date
  onChange?: (date: Date) => void
  placeholder?: string
  className?: string
  variant?: "default" | "minimal" | "inline"
  size?: "sm" | "md" | "lg"
}

export function MonthYearPicker({
  value,
  onChange,
  placeholder = "Pick a month and year",
  className,
  variant = "default",
  size = "md",
}: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentDate, setCurrentDate] = React.useState(value || new Date())

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-lg",
  }

  const handleMonthChange = (month: string) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(parseInt(month))
    setCurrentDate(newDate)
    onChange?.(newDate)
  }

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(parseInt(year))
    setCurrentDate(newDate)
    onChange?.(newDate)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  if (variant === "minimal") {
    return (
      <div className="flex items-center space-x-2">
        <Select value={currentDate.getMonth().toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-32 bg-background/50 backdrop-blur-sm border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm border-border/50">
            {months.map((month, index) => (
              <SelectItem key={index} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={currentDate.getFullYear().toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-24 bg-background/50 backdrop-blur-sm border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm border-border/50">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50"
      >
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("prev")}
            className="h-8 w-8 hover:bg-muted/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <div className="font-semibold text-lg">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("next")}
            className="h-8 w-8 hover:bg-muted/50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Select value={currentDate.getMonth().toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border-border/50">
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={currentDate.getFullYear().toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border-border/50">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => {
              const today = new Date()
              setCurrentDate(today)
              onChange?.(today)
            }}
            variant="outline"
            size="sm"
            className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
          >
            Today
          </Button>
        </div>
      </motion.div>
    )
  }

  // Default variant
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 transition-colors",
              !value && "text-muted-foreground",
              sizeClasses[size],
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "MMMM yyyy") : placeholder}
          </Button>
        </motion.div>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0 bg-background/95 backdrop-blur-sm border-border/50" align="start">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              if (date) {
                onChange?.(date)
                setIsOpen(false)
              }
            }}
            initialFocus
            className="rounded-md"
            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
          />
        </motion.div>
      </PopoverContent>
    </Popover>
  )
}
