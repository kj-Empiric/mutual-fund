"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Plus, Save, X } from "lucide-react"

interface UniversalEntryFormProps {
  title: string
  description?: string
  fields: {
    name: string
    label: string
    type: "text" | "email" | "number" | "tel" | "url" | "password"
    placeholder?: string
    required?: boolean
    defaultValue?: string
  }[]
  onSubmit: (data: Record<string, string>) => void
  onCancel?: () => void
  submitText?: string
  cancelText?: string
  variant?: "default" | "minimal" | "card"
}

export function UniversalEntryForm({
  title,
  description,
  fields,
  onSubmit,
  onCancel,
  submitText = "Save",
  cancelText = "Cancel",
  variant = "default",
}: UniversalEntryFormProps) {
  const [formData, setFormData] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    // Initialize form data with default values
    const initialData: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.defaultValue) {
        initialData[field.name] = field.defaultValue
      }
    })
    setFormData(initialData)
  }, [fields])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
      // Reset form after successful submission
      setFormData({})
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field, index) => (
        <motion.div
          key={field.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor={field.name} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            className="h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors"
          />
        </motion.div>
      ))}

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 h-11 bg-primary hover:bg-primary/90 transition-colors"
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
            />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSubmitting ? "Saving..." : submitText}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-11 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            {cancelText}
          </Button>
        )}
      </div>
    </form>
  )

  if (variant === "minimal") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {formContent}
      </motion.div>
    )
  }

  if (variant === "card") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-medium">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
            {description && (
              <CardDescription className="text-base">{description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {formContent}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-lg">{description}</p>
        )}
      </div>
      <div className="max-w-md mx-auto">
        {formContent}
      </div>
    </motion.div>
  )
}