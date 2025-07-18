"use client"

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function FlowersRedirectPage() {
  const router = useRouter()
  const params = useParams()
  
  useEffect(() => {
    // Redirect from /flowers to /plants
    router.replace(`/plant-beds/${params.id}/plants`)
  }, [params.id, router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to plants...</p>
    </div>
  )
}