"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

interface DeleteConfirmationProps {
  onConfirm: () => void
  title?: string
  description?: string
  triggerText?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "warning"
  size?: "sm" | "md" | "lg"
}

export function DeleteConfirmation({
  onConfirm,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete the selected item.",
  triggerText = "Delete",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "destructive",
  size = "md",
}: DeleteConfirmationProps) {
  const [open, setOpen] = React.useState(false)

  const handleConfirm = () => {
    onConfirm()
    setOpen(false)
  }

  const buttonVariants = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-lg",
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant={variant}
            size={size as any}
            className={`gap-2 ${buttonVariants[size]}`}
          >
            <Trash2 className={iconSizes[size]} />
            {triggerText}
          </Button>
        </motion.div>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[95vw] sm:max-w-md mx-4 sm:mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <AlertDialogHeader className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold">
                {title}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-muted-foreground">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
            <AlertDialogCancel
              className="w-full sm:w-auto order-2 sm:order-1"
              onClick={() => setOpen(false)}
            >
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  )
} 