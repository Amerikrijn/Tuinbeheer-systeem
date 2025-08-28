import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/hooks/use-language"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"
import { ConditionalNavigation } from "@/components/navigation/conditional-navigation" 
import { SupabaseAuthProvider } from "@/components/auth/supabase-auth-provider"
import { ProvidersWrapper } from "@/components/providers-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tuinbeheer Systeem",
  description: "Professioneel tuinbeheer systeem voor het beheren van tuinen, planten en taken",
  keywords: ["tuinbeheer", "planten", "tuin", "beheer", "systeem"],
  authors: [{ name: "Tuinbeheer Systeem" }],
  creator: "Tuinbeheer Systeem",
  publisher: "Tuinbeheer Systeem",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Tuinbeheer Systeem",
    description: "Professioneel tuinbeheer systeem voor het beheren van tuinen, planten en taken",
    url: "/",
    siteName: "Tuinbeheer Systeem",
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tuinbeheer Systeem",
    description: "Professioneel tuinbeheer systeem voor het beheren van tuinen, planten en taken",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <ProvidersWrapper>
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
          </ErrorBoundary>
        </ProvidersWrapper>
      </body>
    </html>
  )
}
