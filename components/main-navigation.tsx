"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Home, 
  TreePine, 
  Flower, 
  Settings, 
  Menu, 
  ChevronRight,
  ChevronDown,
  PlusCircle,
  Eye,
  Edit,
  MapPin,
  Calendar,
  Palette,
  BarChart3,
  Users,
  Bell,
  Search,
  Sun,
  Moon,
  HelpCircle,
  LogOut,
  User,
  Zap,
  Layers,
  Command,
  X,
  ArrowRight,
  ChevronLeft,
  Star,
  Heart,
  TrendingUp,
  Activity,
  Bookmark
} from "lucide-react"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
    description: "Overzicht van je tuinen",
    badge: null,
    color: "text-blue-600"
  },
  {
    title: "Tuinen",
    href: "/gardens",
    icon: TreePine,
    description: "Beheer je tuinen",
    badge: "3",
    color: "text-green-600",
    subItems: [
      { title: "Alle Tuinen", href: "/gardens", icon: Eye, shortcut: "G" },
      { title: "Nieuwe Tuin", href: "/gardens/new", icon: PlusCircle, shortcut: "N" },
      { title: "Favorieten", href: "/gardens/favorites", icon: Heart, shortcut: "F" },
    ]
  },
  {
    title: "Plantvakken",
    href: "/plant-beds",
    icon: Flower,
    description: "Beheer plantvakken",
    badge: "12",
    color: "text-purple-600",
    subItems: [
      { title: "Alle Plantvakken", href: "/plant-beds", icon: Eye, shortcut: "P" },
      { title: "Nieuw Plantvak", href: "/plant-beds/new", icon: PlusCircle, shortcut: "Shift+N" },
      { title: "Populaire Bloemen", href: "/plant-beds/popular-flowers", icon: Star, shortcut: "S" },
      { title: "Seizoensplanning", href: "/plant-beds/seasonal", icon: Calendar, shortcut: "C" },
    ]
  },
  {
    title: "Visual Designer",
    href: "/visual-garden-demo",
    icon: Palette,
    description: "Ontwerp je tuin visueel",
    badge: "Nieuw",
    color: "text-orange-600",
    isNew: true
  },
  {
    title: "Analysetools",
    href: "/analytics",
    icon: BarChart3,
    description: "Inzichten en rapporten",
    badge: null,
    color: "text-indigo-600",
    subItems: [
      { title: "Groei Analyse", href: "/analytics/growth", icon: TrendingUp, shortcut: "A" },
      { title: "Activiteit", href: "/analytics/activity", icon: Activity, shortcut: "Shift+A" },
      { title: "Prestaties", href: "/analytics/performance", icon: Zap, shortcut: "R" },
    ]
  },
  {
    title: "Beheer",
    href: "/admin",
    icon: Settings,
    description: "Systeembeheer",
    badge: null,
    color: "text-gray-600",
    subItems: [
      { title: "Dashboard", href: "/admin", icon: BarChart3, shortcut: "D" },
      { title: "Tuinbeheer", href: "/admin/garden", icon: TreePine, shortcut: "T" },
      { title: "Plantvakbeheer", href: "/admin/plant-beds", icon: Flower, shortcut: "B" },
      { title: "Gebruikers", href: "/admin/users", icon: Users, shortcut: "U" },
    ]
  }
]

const quickActions = [
  { title: "Nieuwe Tuin", href: "/gardens/new", icon: TreePine, shortcut: "Ctrl+N" },
  { title: "Plantvak Toevoegen", href: "/plant-beds/new", icon: PlusCircle, shortcut: "Ctrl+P" },
  { title: "Visual Designer", href: "/visual-garden-demo", icon: Palette, shortcut: "Ctrl+V" },
  { title: "Zoeken", href: "/search", icon: Search, shortcut: "Ctrl+K" },
]

interface MainNavigationProps {
  children: React.ReactNode
}

export function MainNavigation({ children }: MainNavigationProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showQuickActions, setShowQuickActions] = useState(false)

  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems(prev => 
      prev.includes(itemTitle) 
        ? prev.filter(item => item !== itemTitle)
        : [...prev, itemTitle]
    )
  }

  const isItemActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const getActiveParentItem = () => {
    return navigationItems.find(item => {
      if (item.href === "/" && pathname === "/") return true
      if (item.href !== "/" && pathname.startsWith(item.href)) return true
      return item.subItems?.some(subItem => pathname.startsWith(subItem.href))
    })
  }

  const activeParentItem = getActiveParentItem()

  // Auto-expand active parent
  React.useEffect(() => {
    if (activeParentItem?.subItems && !expandedItems.includes(activeParentItem.title)) {
      setExpandedItems(prev => [...prev, activeParentItem.title])
    }
  }, [activeParentItem, expandedItems])

  const SidebarInnerContent = () => (
    <div className="flex flex-col h-full">
      <SidebarHeader className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <TreePine className="h-8 w-8 text-green-600" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tuinbeheer</h1>
              <p className="text-xs text-gray-500">Systeem 2025</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            v2.1
          </Badge>
        </div>
      </SidebarHeader>
      
      <div className="flex-1 flex flex-col">
        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Zoeken... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-9 text-sm border-gray-200 focus:border-green-500 focus:ring-green-500"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Snelle Acties
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowQuickActions(!showQuickActions)}
            >
              <ChevronDown className={cn("h-3 w-3 transition-transform", showQuickActions && "rotate-180")} />
            </Button>
          </div>
          {showQuickActions && (
            <div className="grid grid-cols-2 gap-1">
              {quickActions.map((action) => (
                <Button
                  key={action.href}
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-8 px-2 justify-start text-xs"
                >
                  <Link href={action.href}>
                    <action.icon className="h-3 w-3 mr-1" />
                    {action.title}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1">
          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <div key={item.href}>
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-lg transition-all duration-200 hover:bg-gray-50",
                      isItemActive(item.href) && "bg-green-50"
                    )}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors flex-1",
                        isItemActive(item.href)
                          ? "text-green-700"
                          : "text-gray-700 hover:text-gray-900"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", isItemActive(item.href) ? item.color : "text-gray-500")} />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge 
                          variant={item.isNew ? "default" : "secondary"} 
                          className={cn(
                            "text-xs h-5 px-1.5",
                            item.isNew ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                    
                    {item.subItems && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 mr-1"
                        onClick={() => toggleExpanded(item.title)}
                      >
                        <ChevronRight className={cn(
                          "h-3 w-3 transition-transform",
                          expandedItems.includes(item.title) && "rotate-90"
                        )} />
                      </Button>
                    )}
                  </div>
                  
                  {item.subItems && expandedItems.includes(item.title) && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-xs transition-colors hover:bg-gray-50",
                            pathname === subItem.href
                              ? "bg-green-50 text-green-700 font-medium"
                              : "text-gray-600 hover:text-gray-900"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <subItem.icon className="h-3 w-3" />
                            <span>{subItem.title}</span>
                          </div>
                          {subItem.shortcut && (
                            <Badge variant="outline" className="text-xs h-4 px-1 bg-gray-50 text-gray-500">
                              {subItem.shortcut}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                             ))}
             </div>
           </ScrollArea>
         </div>
       </div>
      
      <SidebarFooter className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback className="bg-green-100 text-green-700">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@tuinbeheer.nl</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Bell className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <HelpCircle className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 h-5">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              Online
            </Badge>
            <span>Moderne Tuin App</span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <LogOut className="h-3 w-3" />
          </Button>
        </div>
      </SidebarFooter>
    </div>
  )

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex border-r border-gray-200 bg-white shadow-sm">
          <SidebarInnerContent />
        </Sidebar>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 lg:hidden bg-white/90 backdrop-blur-sm shadow-md border border-gray-200 hover:bg-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 bg-white">
            <SidebarInnerContent />
          </SheetContent>
        </Sheet>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top breadcrumb bar for mobile */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-16 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-3 w-3" />
              {activeParentItem && (
                <>
                  <span className="font-medium">{activeParentItem.title}</span>
                  {pathname !== activeParentItem.href && (
                    <>
                      <ChevronRight className="h-3 w-3" />
                      <span className="text-gray-900 font-medium">
                        {activeParentItem.subItems?.find(item => pathname.startsWith(item.href))?.title || 'Current'}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 bg-gray-50">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}