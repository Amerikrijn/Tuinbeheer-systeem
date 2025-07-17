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

// Emergency white screen prevention script
const emergencyScript = `
  (function() {
    console.log('[Emergency] White screen prevention loaded');
    
    // Prevent any external redirects
    if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('vercel.app')) {
      console.log('[Emergency] Potential redirect detected, preventing...');
      // Don't redirect, stay on current page
    }
    
    // Show emergency loading if page is blank after 2 seconds
    setTimeout(function() {
      if (document.body.children.length === 0 || document.body.textContent.trim() === '') {
        console.log('[Emergency] White screen detected, showing emergency UI');
        document.body.innerHTML = \`
          <div style="
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            font-family: system-ui, -apple-system, sans-serif;
            padding: 20px;
          ">
            <div style="
              max-width: 500px;
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              text-align: center;
            ">
              <div style="
                width: 60px;
                height: 60px;
                background: #22c55e;
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: white;
              ">🌱</div>
              <h1 style="
                margin: 0 0 10px 0;
                color: #1f2937;
                font-size: 24px;
                font-weight: 600;
              ">Tuinbeheer Systeem</h1>
              <p style="
                margin: 0 0 20px 0;
                color: #6b7280;
                font-size: 16px;
              ">De applicatie wordt geladen...</p>
              <div style="
                width: 40px;
                height: 40px;
                border: 3px solid #e5e7eb;
                border-top: 3px solid #22c55e;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
              "></div>
              <p style="
                margin: 0;
                color: #9ca3af;
                font-size: 14px;
              ">Als dit lang duurt, probeer de pagina te vernieuwen</p>
              <button onclick="window.location.reload()" style="
                margin-top: 20px;
                padding: 10px 20px;
                background: #22c55e;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
              ">Vernieuwen</button>
            </div>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        \`;
      }
    }, 2000);
    
    // Show emergency error if still nothing after 10 seconds
    setTimeout(function() {
      if (document.body.textContent.includes('De applicatie wordt geladen...')) {
        console.log('[Emergency] Loading timeout, showing error UI');
        document.body.innerHTML = \`
          <div style="
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            font-family: system-ui, -apple-system, sans-serif;
            padding: 20px;
          ">
            <div style="
              max-width: 500px;
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              text-align: center;
              border: 2px solid #fecaca;
            ">
              <div style="
                width: 60px;
                height: 60px;
                background: #ef4444;
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: white;
              ">⚠️</div>
              <h1 style="
                margin: 0 0 10px 0;
                color: #1f2937;
                font-size: 24px;
                font-weight: 600;
              ">Tuinbeheer Systeem - Laadprobleem</h1>
              <p style="
                margin: 0 0 20px 0;
                color: #6b7280;
                font-size: 16px;
              ">De applicatie kan niet worden geladen.</p>
              <div style="
                background: #fef2f2;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: left;
              ">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #dc2626;">Mogelijke oorzaken:</p>
                <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
                  <li>JavaScript is uitgeschakeld</li>
                  <li>Netwerkverbinding problemen</li>
                  <li>Server onderhoudswerk</li>
                  <li>Browser compatibiliteit</li>
                </ul>
              </div>
              <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="window.location.reload()" style="
                  padding: 10px 20px;
                  background: #22c55e;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 14px;
                ">Vernieuwen</button>
                <button onclick="window.location.href='/'" style="
                  padding: 10px 20px;
                  background: #6b7280;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 14px;
                ">Hoofdpagina</button>
              </div>
            </div>
          </div>
        \`;
      }
    }, 10000);
  })();
`;

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: emergencyScript }} />
      </head>
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
