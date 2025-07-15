"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

const routeMapping: Record<string, BreadcrumbItem> = {
  "/": { title: "Dashboard", href: "/", icon: Home },
  "/gardens": { title: "Tuinen", href: "/gardens" },
  "/gardens/new": { title: "Nieuwe Tuin", href: "/gardens/new" },
  "/plant-beds": { title: "Plantvakken", href: "/plant-beds" },
  "/plant-beds/new": { title: "Nieuw Plantvak", href: "/plant-beds/new" },
  "/plant-beds/popular-flowers": { title: "Populaire Bloemen", href: "/plant-beds/popular-flowers" },
  "/visual-garden-demo": { title: "Visual Designer", href: "/visual-garden-demo" },
  "/admin": { title: "Beheer", href: "/admin" },
  "/admin/garden": { title: "Tuinbeheer", href: "/admin/garden" },
  "/admin/plant-beds": { title: "Plantvakbeheer", href: "/admin/plant-beds" }
}

export function ModernBreadcrumb() {
  const pathname = usePathname()
  
  if (pathname === "/") {
    return null // Don't show breadcrumb on homepage
  }

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { title: "Dashboard", href: "/", icon: Home }
    ]

    let currentPath = ""
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Handle dynamic routes
      if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
        // This is a UUID, likely a dynamic route
        const parentPath = pathSegments.slice(0, index).join("/")
        if (parentPath.includes("gardens")) {
          breadcrumbs.push({
            title: "Tuin Details",
            href: currentPath
          })
        } else if (parentPath.includes("plant-beds")) {
          breadcrumbs.push({
            title: "Plantvak Details",
            href: currentPath
          })
        }
      } else {
        // Static route
        const mappedRoute = routeMapping[currentPath]
        if (mappedRoute) {
          breadcrumbs.push(mappedRoute)
        } else {
          // Fallback for unmapped routes
          breadcrumbs.push({
            title: segment.charAt(0).toUpperCase() + segment.slice(1),
            href: currentPath
          })
        }
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-6">
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
          )}
          
          {index === breadcrumbs.length - 1 ? (
            // Current page (not clickable)
            <span className="flex items-center gap-1 font-medium text-gray-900">
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.title}
            </span>
          ) : (
            // Clickable breadcrumb
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-1 hover:text-green-600 transition-colors",
                index === 0 ? "text-green-600" : "text-gray-500"
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.title}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}