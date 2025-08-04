"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function PlantBedPlantsRedirectPage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    // Redirect to the visual plantvak-view instead of showing a list
    router.replace(`/gardens/${params.id}/plantvak-view/${params.bedId}`)
  }, [params.id, params.bedId, router])

  // Show loading while redirecting
  return (
    <div className="container mx-auto p-6">
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Doorverwijzen naar plantvak...</p>
      </div>
    </div>
  )
}
