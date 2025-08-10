'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-supabase-auth'
import { Eye, EyeOff, Shield } from 'lucide-react'

interface PasswordChangeFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function ForcePasswordChange() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, signOut } = useAuth()
  const [formData, setFormData] = useState<PasswordChangeFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Partial<PasswordChangeFormData>>({})
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof PasswordChangeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Minimaal 8 karakters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Minimaal 1 hoofdletter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Minimaal 1 kleine letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Minimaal 1 cijfer')
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Minimaal 1 speciaal teken')
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate form
      const newErrors: Partial<PasswordChangeFormData> = {}

      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Huidig wachtwoord is verplicht'
      }

      if (!formData.newPassword) {
        newErrors.newPassword = 'Nieuw wachtwoord is verplicht'
      } else {
        const passwordErrors = validatePassword(formData.newPassword)
        if (passwordErrors.length > 0) {
          newErrors.newPassword = passwordErrors.join(', ')
        }
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Wachtwoorden komen niet overeen'
      }

      if (formData.currentPassword === formData.newPassword) {
        newErrors.newPassword = 'Nieuw wachtwoord moet anders zijn dan het huidige'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      // Banking-compliant: Call server-side API for password change
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Password change failed')
      }

      toast({
        title: "Wachtwoord gewijzigd",
        description: "Je wachtwoord is succesvol gewijzigd. Je kunt nu verder.",
      })

      // Refresh user profile to clear force_password_change flag
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for database update
      
      // Force reload to ensure fresh user profile is loaded
      window.location.reload()

    } catch (error) {
      console.error('Password change error:', error)
      toast({
        title: "Wachtwoord wijziging mislukt",
        description: error instanceof Error ? error.message : "Er ging iets mis bij het wijzigen van je wachtwoord",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Wachtwoord Wijzigen Verplicht</CardTitle>
          <CardDescription className="text-gray-700">
            Een beheerder heeft je wachtwoord gereset. Je moet een nieuw wachtwoord instellen voordat je verder kunt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 border-orange-300 bg-orange-100">
            <Shield className="h-4 w-4 text-orange-700" />
            <AlertDescription className="text-orange-900">
              <strong>🔒 Beveiligingsmelding:</strong> Een beheerder heeft je wachtwoord gereset. 
              Om veiligheidsredenen moet je een nieuw, persoonlijk wachtwoord instellen. 
              <strong>Je kunt niet verder zonder dit te doen.</strong>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-gray-900 font-medium">Huidig Wachtwoord</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  placeholder="Voer huidig tijdelijk wachtwoord in"
                  className={errors.currentPassword ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isSubmitting}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-500">{errors.currentPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-900 font-medium">Nieuw Wachtwoord</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="Voer nieuw wachtwoord in"
                  className={errors.newPassword ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isSubmitting}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword}</p>
              )}
              <div className="text-xs text-gray-700 font-medium">
                Minimaal 8 karakters met hoofdletter, kleine letter, cijfer en speciaal teken
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-900 font-medium">Bevestig Nieuw Wachtwoord</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Bevestig nieuw wachtwoord"
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex flex-col space-y-3 pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Wachtwoord Wijzigen...' : 'Wachtwoord Wijzigen'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleSignOut}
                disabled={isSubmitting}
                className="w-full"
              >
                Uitloggen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}