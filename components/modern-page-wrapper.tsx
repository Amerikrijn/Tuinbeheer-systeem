"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ModernHeader } from "./modern-header"
import { ModernBreadcrumb } from "./modern-breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MoreVertical, Maximize2, Minimize2, RefreshCw } from "lucide-react"
import Link from "next/link"

interface ModernPageWrapperProps {
  title: string
  subtitle?: string
  description?: string
  children: ReactNode
  showBreadcrumb?: boolean
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  className?: string
  headerActions?: ReactNode
  backButton?: boolean
  backHref?: string
  status?: "active" | "inactive" | "pending" | "error"
  lastUpdated?: string
  showRefresh?: boolean
  onRefresh?: () => void
  isFullWidth?: boolean
  padding?: "none" | "sm" | "md" | "lg"
  background?: "white" | "gray" | "transparent"
}

export function ModernPageWrapper({ 
  title, 
  subtitle, 
  description,
  children, 
  showBreadcrumb = true,
  maxWidth = "xl",
  className,
  headerActions,
  backButton = false,
  backHref,
  status,
  lastUpdated,
  showRefresh = false,
  onRefresh,
  isFullWidth = false,
  padding = "lg",
  background = "gray"
}: ModernPageWrapperProps) {
  
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case "sm": return "max-w-sm"
      case "md": return "max-w-md"
      case "lg": return "max-w-4xl"
      case "xl": return "max-w-6xl"
      case "2xl": return "max-w-7xl"
      case "full": return "max-w-full"
      default: return "max-w-6xl"
    }
  }

  const getPaddingClass = () => {
    switch (padding) {
      case "none": return "p-0"
      case "sm": return "p-4"
      case "md": return "p-6"
      case "lg": return "p-6 lg:p-8"
      default: return "p-6 lg:p-8"
    }
  }

  const getBackgroundClass = () => {
    switch (background) {
      case "white": return "bg-white"
      case "gray": return "bg-gray-50"
      case "transparent": return "bg-transparent"
      default: return "bg-gray-50"
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Actief</Badge>
      case "inactive":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactief</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">In behandeling</Badge>
      case "error":
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Fout</Badge>
      default:
        return null
    }
  }

  return (
    <div className={cn("min-h-screen", getBackgroundClass(), className)}>
      <div className={cn(
        "mx-auto",
        isFullWidth ? "w-full" : getMaxWidthClass(),
        getPaddingClass()
      )}>
        <div className="space-y-6">
          {/* Breadcrumb */}
          {showBreadcrumb && (
            <div className="flex items-center justify-between">
              <ModernBreadcrumb />
              <div className="flex items-center gap-2">
                {showRefresh && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {backButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="mt-1"
                    >
                      <Link href={backHref || "/"}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Terug
                      </Link>
                    </Button>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {title}
                      </h1>
                      {getStatusBadge()}
                    </div>
                    {subtitle && (
                      <p className="text-lg text-gray-600 mb-1">
                        {subtitle}
                      </p>
                    )}
                    {description && (
                      <p className="text-sm text-gray-500 max-w-2xl">
                        {description}
                      </p>
                    )}
                    {lastUpdated && (
                      <p className="text-xs text-gray-400 mt-2">
                        Laatst bijgewerkt: {lastUpdated}
                      </p>
                    )}
                  </div>
                </div>
                {headerActions && (
                  <div className="flex items-center gap-2 ml-4">
                    {headerActions}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}