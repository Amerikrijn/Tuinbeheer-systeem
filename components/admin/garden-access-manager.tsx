'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TreePine, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface Garden {
  id: string
  name: string
  description?: string
}

interface User {
  id: string
  email: string
  full_name?: string
  garden_access?: string[]
}

interface GardenAccessManagerProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function GardenAccessManager({ user, isOpen, onClose, onSave }: GardenAccessManagerProps) {
  const { toast } = useToast()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [userGardenAccess, setUserGardenAccess] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load available gardens and user's current access
  useEffect(() => {
    if (isOpen && user) {
      loadGardensAndAccess()
    }
  }, [isOpen, user])

  const loadGardensAndAccess = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // First, ensure the table exists
      await ensureUserGardenAccessTable()

      // Load only active gardens (exclude soft-deleted ones)
      const { data: gardensData, error: gardensError } = await supabase
        .from('gardens')
        .select('id, name, description')
        .eq('is_active', true)
        .order('name')

      if (gardensError) {
        throw gardensError
      }

      setGardens(gardensData || [])

      // Load user's current garden access
      const { data: accessData, error: accessError } = await supabase
        .from('user_garden_access')
        .select('garden_id')
        .eq('user_id', user.id)

      if (accessError) {
        console.error('Access load error:', accessError)
        // Don't throw here, just set empty access
        setUserGardenAccess([])
      } else {
        const currentAccess = accessData?.map(item => item.garden_id) || []
        setUserGardenAccess(currentAccess)
      }

    } catch (error) {
      console.error('Load error:', error)
      toast({
        title: "Fout bij laden",
        description: "Kon tuinen en toegang niet laden",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleGardenAccess = (gardenId: string) => {
    setUserGardenAccess(prev => 
      prev.includes(gardenId) 
        ? prev.filter(id => id !== gardenId)
        : [...prev, gardenId]
    )
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      // First, try to create the table if it doesn't exist
      await ensureUserGardenAccessTable()

      // Then, remove all existing access for this user
      const { error: deleteError } = await supabase
        .from('user_garden_access')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        // Don't throw here, continue with insert
      }

      // Then, add new access entries
      if (userGardenAccess.length > 0) {
        const accessEntries = userGardenAccess.map(gardenId => ({
          user_id: user.id,
          garden_id: gardenId,
          granted_by: null, // Set to null since we don't have the admin user ID
          access_level: 'read', // Set default access level
          is_active: true
        }))

        const { error: insertError } = await supabase
          .from('user_garden_access')
          .insert(accessEntries)

        if (insertError) {
          console.error('Insert error:', insertError)
          throw insertError
        }
      }

      toast({
        title: "Toegang bijgewerkt",
        description: `${user.full_name || user.email} heeft nu toegang tot ${userGardenAccess.length} tuin(en)`,
      })

      onSave()
      onClose()

    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: "Fout bij opslaan",
        description: "Kon tuin toegang niet bijwerken. Probeer het opnieuw.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Function to ensure the user_garden_access table exists
  const ensureUserGardenAccessTable = async () => {
    try {
      // Try to query the table to see if it exists
      const { error: testError } = await supabase
        .from('user_garden_access')
        .select('*')
        .limit(1)

      if (testError && testError.message.includes('relation "user_garden_access" does not exist')) {
        console.log('🔧 user_garden_access table does not exist, creating...')
        
        // Call our setup API to create the table
        const response = await fetch('/api/admin/setup-database', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Failed to create table: ${errorData.error}`)
        }

        console.log('✅ user_garden_access table created successfully')
      }
    } catch (error) {
      console.error('Error ensuring table exists:', error)
      // Don't throw here, let the main operation continue
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tuin Toegang Beheren</DialogTitle>
          <DialogDescription>
            Selecteer welke tuinen {user?.full_name || user?.email} mag benaderen
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
              <span className="ml-2 text-muted-foreground">Tuinen laden...</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {gardens.map((garden) => (
                <div key={garden.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`garden-${garden.id}`}
                    checked={userGardenAccess.includes(garden.id)}
                    onChange={() => toggleGardenAccess(garden.id)}
                    className="rounded border-gray-300 dark:border-gray-500 text-green-600 dark:text-green-400 focus:ring-green-500"
                  />
                  <label 
                    htmlFor={`garden-${garden.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <TreePine className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium">{garden.name}</p>
                        {garden.description && (
                          <p className="text-sm text-muted-foreground">{garden.description}</p>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
          
          {!loading && gardens.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <TreePine className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nog geen tuinen beschikbaar</p>
              <p className="text-sm">Maak eerst tuinen aan voordat je toegang kunt toewijzen</p>
            </div>
          )}
          
          {!loading && userGardenAccess.length === 0 && gardens.length > 0 && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              ⚠️ Deze gebruiker heeft geen toegang tot tuinen en kan geen taken uitvoeren.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={saving}
          >
            Annuleren
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving && <div className="w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mr-2" />}
            Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}