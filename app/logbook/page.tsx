"use client"

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import { LogbookList } from '@/components/logbook/logbook-list'
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function LogbookPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Logboek
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Beheer je tuinlogboek en houd bij wat er gebeurt in je tuin
          </p>
        </div>
        
        <LogbookList />
      </div>
    </ProtectedRoute>
  )
}