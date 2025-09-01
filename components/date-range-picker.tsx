"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, addDays, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { DateRange } from "react-day-picker"

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
  variant?: "default" | "minimal" | "inline"
  size?: "sm" | "md" | "lg"
  presets?: Array<{
    label: string
    value: DateRange
  }>
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  className,
  variant = "default",
  size = "md",
  presets = [
    {
      label: "Today",
      value: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
    },
    {
      label: "Last 7 days",
      value: { from: startOfDay(addDays(new Date(), -6)), to: endOfDay(new Date()) },
    },
    {
      label: "Last 30 days",
      value: { from: startOfDay(addDays(new Date(), -29)), to: endOfDay(new Date()) },
    },
    {
      label: "This month",
      value: {
        from: startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        to: endOfDay(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
      },
    },
    {
      label: "Last month",
      value: {
        from: startOfDay(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)),
        to: endOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 0)),
      },
    },
  ],
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-lg",
  }

  const handlePresetClick = (preset: DateRange) => {
    onChange?.(preset)
    setIsOpen(false)
  }

  const clearRange = () => {
    onChange?.(undefined)
  }

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder
    
    if (!range.to) {
      return format(range.from, "MMM dd, yyyy")
    }
    
    if (range.from.getTime() === range.to.getTime()) {
      return format(range.from, "MMM dd, yyyy")
    }
    
    return `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd, yyyy")}`
  }

  if (variant === "minimal") {
    return (
      <div className="flex items-center space-x-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
            >
              <CalendarIcon className="h-3 w-3 mr-1" />
              Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-background/95 backdrop-blur-sm border-border/50" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={onChange}
              numberOfMonths={1}
              className="rounded-md"
            />
          </PopoverContent>
        </Popover>
        
        {value?.from && (
          <span className="text-sm text-muted-foreground">
            {formatDateRange(value)}
          </span>
        )}
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
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Quick Presets</h3>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset.value)}
                className="h-8 text-xs bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Custom Range</h3>
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={1}
            className="rounded-md"
            disabled={(date) => date > new Date()}
          />
        </div>
        
        {value?.from && (
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium">
              {formatDateRange(value)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearRange}
              className="h-6 w-6 p-0 hover:bg-muted/50"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
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
            <CalendarDays className="mr-2 h-4 w-4" />
            {formatDateRange(value)}
          </Button>
        </motion.div>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0 bg-background/95 backdrop-blur-sm border-border/50" align="start">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="p-3"
        >
          {/* Quick Presets */}
          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2 text-foreground">Quick Presets</h3>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick(preset.value)}
                  className="h-8 text-xs bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Calendar */}
          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2 text-foreground">Custom Range</h3>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={onChange}
              numberOfMonths={1}
              className="rounded-md"
              disabled={(date) => date > new Date()}
            />
          </div>
          
          {/* Selected Range Display */}
          {value?.from && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium text-foreground">
                {formatDateRange(value)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRange}
                className="h-6 w-6 p-0 hover:bg-muted/50"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </motion.div>
      </PopoverContent>
    </Popover>
  )
}
