import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/hooks/use-language"
import { WhiteScreenDetector, LoadingDetector } from "@/app/debug-white-screen"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tuinbeheer Systeem",
  description: "Garden Management System",
}

// Simple wrapper component - actual error boundary is in components/error-boundary.tsx
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutWrapper>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <LanguageProvider>
              {children}
            </LanguageProvider>
            <Toaster />
          </ThemeProvider>
          <WhiteScreenDetector />
          <LoadingDetector />
        </LayoutWrapper>
      </body>
    </html>
  )
}
