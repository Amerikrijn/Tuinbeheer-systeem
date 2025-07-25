"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function GardensPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to homepage since gardens overview is now the landing page
    router.replace("/")
  }, [router])

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Doorverwijzen naar tuinen overzicht...</p>
        </div>
      </div>
    </div>
  )
}
