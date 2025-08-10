'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-supabase-auth'
import { Eye, EyeOff, User, Key, Shield } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'

interface PasswordChangeFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

function UserSettingsPageContent() {
  const { toast } = useToast()
  const { user } = useAuth()
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

  const validateForm = (): boolean => {
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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Bevestiging is verplicht'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Wachtwoorden komen niet overeen'
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Nieuw wachtwoord moet anders zijn dan huidig wachtwoord'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Banking-compliant: Call server-side API for password change
      const response = await fetch('/api/user/change-own-password', {
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
        description: "Je wachtwoord is succesvol gewijzigd. Je blijft ingelogd.",
      })

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

    } catch (error: any) {
      console.error('Password change error:', error)
      toast({
        title: "Wachtwoord wijziging mislukt",
        description: error.message || "Er ging iets mis bij het wijzigen van je wachtwoord",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Account Instellingen</h1>
        <p className="text-gray-600 mt-2">Beheer je account en beveiligingsinstellingen</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <CardTitle>Profiel Informatie</CardTitle>
            </div>
            <CardDescription>Je account gegevens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-900 font-medium">Email</Label>
              <p className="text-gray-700 mt-1">{user?.email}</p>
            </div>
            <div>
              <Label className="text-gray-900 font-medium">Naam</Label>
              <p className="text-gray-700 mt-1">{user?.full_name || 'Niet ingesteld'}</p>
            </div>
            <div>
              <Label className="text-gray-900 font-medium">Rol</Label>
              <p className="text-gray-700 mt-1 capitalize">{user?.role}</p>
            </div>
            <div>
              <Label className="text-gray-900 font-medium">Status</Label>
              <p className="text-gray-700 mt-1 capitalize">{user?.status}</p>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-green-600" />
              <CardTitle>Wachtwoord Wijzigen</CardTitle>
            </div>
            <CardDescription>Wijzig je wachtwoord voor extra beveiliging</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-700" />
              <AlertDescription className="text-blue-900">
                <strong>🔒 Banking Security:</strong> Gebruik een sterk wachtwoord met minimaal 8 karakters, 
                hoofdletters, kleine letters, cijfers en speciale tekens.
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
                    placeholder="Voer huidig wachtwoord in"
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
                  <p className="text-sm text-red-600 font-medium">{errors.currentPassword}</p>
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
                  <p className="text-sm text-red-600 font-medium">{errors.newPassword}</p>
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
                  <p className="text-sm text-red-600 font-medium">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Wachtwoord Wijzigen...' : 'Wachtwoord Wijzigen'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function UserSettingsPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <UserSettingsPageContent />
    </ProtectedRoute>
  )
}