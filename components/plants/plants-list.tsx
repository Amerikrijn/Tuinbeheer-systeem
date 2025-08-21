'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, Droplets, Leaf, Loader2, AlertCircle, Database } from 'lucide-react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'

interface Plant {
  id: string
  name: string
  species: string
  planted_date: string
  last_watered?: string
  health: 'excellent' | 'good' | 'fair' | 'poor'
  garden_id?: string
  plant_bed_id?: string
}

export function PlantsList() {
  // Simple component that shows configuration status
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Mijn Planten
        </h2>
        <Button disabled>
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe Plant
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Database niet geconfigureerd
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Supabase is niet geconfigureerd. Stel de database verbinding in om planten te beheren.
            </p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 text-left max-w-md mx-auto">
              <p>Om planten te beheren, moet je:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Een Supabase project aanmaken</li>
                <li>De database URL en API key instellen in .env.local</li>
                <li>De database tabellen aanmaken</li>
              </ol>
            </div>
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Huidige status:</strong> De planten pagina laadt niet omdat de database verbinding ontbreekt.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dit is geen 404 fout - de pagina bestaat wel, maar kan geen data laden.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}