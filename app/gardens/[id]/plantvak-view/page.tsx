"use client"

import { useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf } from "lucide-react"

export default function PlantvakViewRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Redirect to the garden page since this route is deprecated
    if (params.id) {
      const bedId = searchParams?.get('bedId')
      const target = bedId ? `/gardens/${params.id}?bedId=${bedId}` : `/gardens/${params.id}`
      router.replace(target)
    }
  }, [router, params.id, searchParams])

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Leaf className="h-16 w-16 mx-auto text-gray-400 mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Doorverwijzen...</h2>
            <p className="text-gray-600">Je wordt doorverwezen naar de tuin pagina.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}