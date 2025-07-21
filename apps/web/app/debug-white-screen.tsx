'use client'

import { useEffect, useState } from 'react'

export function WhiteScreenDetector() {
  const [isWhiteScreen, setIsWhiteScreen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    setIsProduction(process.env.NODE_ENV === 'production')
    
    const addDebugInfo = (message: string) => {
      console.log(`[WhiteScreenDetector] ${message}`)
      setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${message}`])
    }

    addDebugInfo('WhiteScreenDetector initialized')
    addDebugInfo(`Environment: ${isProduction ? 'production' : 'development'}`)
    addDebugInfo(`User agent: ${navigator.userAgent}`)
    addDebugInfo(`URL: ${window.location.href}`)

    // Check if the page is actually rendered
    const checkForWhiteScreen = () => {
      const body = document.body
      const html = document.documentElement
      
      // Check if body has any visible content
      const hasVisibleContent = body.children.length > 0
      const hasTextContent = body.textContent && body.textContent.trim().length > 0
      
      // Check if React has rendered
      const hasReactRoot = document.querySelector('[data-reactroot]') || 
                          document.querySelector('#__next') ||
                          body.querySelector('div[id]') ||
                          document.querySelector('[data-testid]')
      
      // Check for common error indicators
      const hasErrorElements = document.querySelector('[class*="error"]') ||
                              document.querySelector('[class*="Error"]') ||
                              document.querySelector('[role="alert"]')
      
      // Check for Vercel-specific elements
      const hasVercelElements = document.querySelector('[data-vercel]') ||
                               document.querySelector('[class*="vercel"]')
      
      // More lenient check for production
      const isCurrentlyWhiteScreen = !hasVisibleContent || !hasTextContent || 
                                    (isProduction ? false : !hasReactRoot)
      
      if (isCurrentlyWhiteScreen !== isWhiteScreen) {
        setIsWhiteScreen(isCurrentlyWhiteScreen)
        addDebugInfo(`White screen status changed: ${isCurrentlyWhiteScreen ? 'WHITE SCREEN DETECTED' : 'Content detected'}`)
        addDebugInfo(`- Has visible content: ${hasVisibleContent}`)
        addDebugInfo(`- Has text content: ${hasTextContent}`)
        addDebugInfo(`- Has React root: ${!!hasReactRoot}`)
        addDebugInfo(`- Has error elements: ${!!hasErrorElements}`)
        addDebugInfo(`- Has Vercel elements: ${!!hasVercelElements}`)
        addDebugInfo(`- Body children count: ${body.children.length}`)
        addDebugInfo(`- Body text length: ${body.textContent?.length || 0}`)
        addDebugInfo(`- Current URL: ${window.location.href}`)
        addDebugInfo(`- Environment: ${isProduction ? 'production' : 'development'}`)
      }
    }

    // Initial check
    checkForWhiteScreen()

    // Set up observers
    const observer = new MutationObserver(() => {
      checkForWhiteScreen()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    })

    // Periodic check
    const interval = setInterval(checkForWhiteScreen, 1000)

    // Check on window events
    const handleLoad = () => addDebugInfo('Window loaded')
    const handleError = (event: ErrorEvent) => {
      addDebugInfo(`Window error: ${event.error?.message || event.message}`)
    }
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addDebugInfo(`Unhandled rejection: ${event.reason}`)
    }

    window.addEventListener('load', handleLoad)
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      observer.disconnect()
      clearInterval(interval)
      window.removeEventListener('load', handleLoad)
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [isWhiteScreen, isProduction])

  // If white screen is detected, show debug info
  if (isWhiteScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          zIndex: 9999,
          padding: '20px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: 'red',
          overflow: 'auto',
          pointerEvents: 'none'
        }}
      >
        <div style={{ backgroundColor: 'white', padding: '10px', border: '2px solid red' }}>
          <h2 style={{ color: 'red', margin: '0 0 10px 0' }}>🚨 WHITE SCREEN DETECTED 🚨</h2>
          <p style={{ margin: '0 0 10px 0' }}>
            De pagina toont een wit scherm. Debug informatie:
          </p>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            {debugInfo.map((info, index) => (
              <div key={index} style={{ marginBottom: '2px' }}>
                {info}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0' }}>
            <strong>Acties:</strong>
            <br />
            • Druk op F5 om de pagina te vernieuwen
            <br />
            • Controleer de browser console (F12)
            <br />
            • Controleer of de development server draait
          </div>
        </div>
      </div>
    )
  }

  return null
}

// Component to show when content is loading
export function LoadingDetector() {
  const [loadingTime, setLoadingTime] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      setLoadingTime(elapsed)
      
      // Show after 2 seconds of loading
      if (elapsed > 2000) {
        setIsVisible(true)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        border: '2px solid blue',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9998,
        fontFamily: 'monospace',
        fontSize: '12px',
        color: 'blue'
      }}
    >
      <div>⏱️ Loading: {Math.round(loadingTime / 1000)}s</div>
      <div>Als dit lang duurt, kan er een probleem zijn</div>
    </div>
  )
}