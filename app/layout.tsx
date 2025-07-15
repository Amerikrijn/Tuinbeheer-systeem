import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/hooks/use-language"
import { MainNavigation } from "@/components/main-navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tuinbeheer Systeem 2025",
  description: "Moderne tuin beheer applicatie - Beheer je tuinen, plantvakken en bloemen",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <MainNavigation>
              {children}
            </MainNavigation>
          </LanguageProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
