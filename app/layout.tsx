import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/hooks/use-language"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"
import { ConditionalNavigation } from "@/components/navigation/conditional-navigation" 
import { SupabaseAuthProvider } from "@/components/auth/supabase-auth-provider"
import { QueryClientProvider } from "@/components/providers/query-client-provider"

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Tuinbeheer Systeem - Professioneel Tuinbeheer",
  description: "Modern en efficiënt tuinbeheer systeem voor het beheren van tuinen, planten en taken. Perfect voor tuiniers en tuincentra.",
  keywords: ["tuinbeheer", "planten", "tuin", "beheer", "systeem", "tuinier", "plantbedden"],
  authors: [{ name: "Tuinbeheer Systeem" }],
  creator: "Tuinbeheer Systeem",
  publisher: "Tuinbeheer Systeem",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tuinbeheer.app'),
  openGraph: {
    title: "Tuinbeheer Systeem - Professioneel Tuinbeheer",
    description: "Modern en efficiënt tuinbeheer systeem voor het beheren van tuinen, planten en taken.",
    type: "website",
    locale: "nl_NL",
    siteName: "Tuinbeheer Systeem",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tuinbeheer Systeem - Professioneel Tuinbeheer",
    description: "Modern en efficiënt tuinbeheer systeem voor het beheren van tuinen, planten en taken.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tuinbeheer" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Tuinbeheer" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <QueryClientProvider>
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
        </QueryClientProvider>
      </body>
    </html>
  )
}
