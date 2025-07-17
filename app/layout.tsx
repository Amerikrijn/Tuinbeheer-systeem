import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/hooks/use-language"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tuinbeheer Systeem",
  description: "Een systeem voor het beheren van tuinen en plantenvakken",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                console.log('[Emergency] Initializing white screen prevention...');
                
                // Prevent GitHub redirects
                if (window.location.hostname.includes('github.com')) {
                  console.log('[Emergency] GitHub redirect detected');
                  window.location.href = 'https://tuinbeheer-systeem.vercel.app';
                  return;
                }
                
                // Emergency loading function
                function showEmergencyLoading() {
                  if (document.body.children.length === 0 || 
                      document.body.textContent.trim() === '' ||
                      (!document.getElementById('__next') || document.getElementById('__next').children.length === 0)) {
                    
                    console.log('[Emergency] White screen detected - showing emergency UI');
                    document.body.innerHTML = \`
                      <div id="emergency-ui" style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
                          ">Applicatie wordt geladen...</p>
                          <div style="
                            width: 40px;
                            height: 40px;
                            border: 3px solid #e5e7eb;
                            border-top: 3px solid #22c55e;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin: 0 auto;
                          "></div>
                        </div>
                      </div>
                      <style>
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                      </style>
                    \`;
                    return true;
                  }
                  return false;
                }
                
                // Show emergency error after timeout
                function showEmergencyError() {
                  console.log('[Emergency] Timeout - showing error UI');
                  document.body.innerHTML = \`
                    <div style="
                      position: fixed;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      z-index: 9999;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
                        ">Laadprobleem</h1>
                        <p style="
                          margin: 0 0 20px 0;
                          color: #6b7280;
                          font-size: 16px;
                        ">De applicatie kan niet worden geladen.</p>
                        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                          <button onclick="window.location.reload()" style="
                            padding: 12px 24px;
                            background: #22c55e;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: 600;
                          ">Vernieuwen</button>
                          <button onclick="window.location.href='/emergency.html'" style="
                            padding: 12px 24px;
                            background: #6b7280;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: 600;
                          ">Noodpagina</button>
                        </div>
                      </div>
                    </div>
                  \`;
                }
                
                // Check for successful React mount
                function checkReactMount() {
                  const nextRoot = document.getElementById('__next');
                  if (nextRoot && nextRoot.children.length > 0) {
                    const emergencyUI = document.getElementById('emergency-ui');
                    if (emergencyUI) {
                      emergencyUI.style.opacity = '0';
                      emergencyUI.style.transition = 'opacity 0.3s ease-out';
                      setTimeout(() => {
                        if (emergencyUI && emergencyUI.parentNode) {
                          emergencyUI.parentNode.removeChild(emergencyUI);
                        }
                      }, 300);
                    }
                    console.log('[Emergency] React mounted successfully');
                    return true;
                  }
                  return false;
                }
                
                // Initialize emergency system
                setTimeout(showEmergencyLoading, 1000);
                setTimeout(showEmergencyError, 10000);
                
                // Monitor for React mount
                const mountChecker = setInterval(() => {
                  if (checkReactMount()) {
                    clearInterval(mountChecker);
                  }
                }, 500);
                
                setTimeout(() => {
                  clearInterval(mountChecker);
                }, 15000);
                
                console.log('[Emergency] White screen prevention initialized');
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <div id="__next">
          <ErrorBoundary>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              <LanguageProvider>
                {children}
                <Toaster />
              </LanguageProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </div>
      </body>
    </html>
  )
}
