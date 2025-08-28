import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/hooks/use-language"
import { ErrorBoundary } from "@/components/error-boundary"
import { ConditionalNavigation } from "@/components/navigation/conditional-navigation" 
import { SupabaseAuthProvider } from "@/components/auth/supabase-auth-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tuinbeheer Systeem",
  description: "Een systeem voor het beheren van tuinen en plantenvakken",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <ThemeProvider 
              attribute="class" 
              defaultTheme="system" 
              enableSystem 
              disableTransitionOnChange
            >
              <LanguageProvider>
                <SupabaseAuthProvider>
                  <ConditionalNavigation />
                  {children}
                  <Toaster />
                </SupabaseAuthProvider>
              </LanguageProvider>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </ErrorBoundary>
        </QueryClientProvider>
      </body>
    </html>
  )
}
