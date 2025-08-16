"use client"

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import { PlantsList } from '@/components/plants/plants-list'
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function PlantsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Planten
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Beheer je planten collectie en houd bij van je planten
          </p>
        </div>
        
        <PlantsList />
      </div>
    </ProtectedRoute>
  )
}