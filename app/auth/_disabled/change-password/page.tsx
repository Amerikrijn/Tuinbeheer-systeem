'use client'

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TreePine, Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFirstLogin, setIsFirstLogin] = useState(false)

  // Check if user needs to change password
  useEffect(() => {
    const checkPasswordRequirement = async () => {
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get user metadata from Supabase auth
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser?.user_metadata?.temp_password) {
        setIsFirstLogin(true)
      } else {
        // If not a temp password, redirect to main page
        router.push('/')
      }
    }

    checkPasswordRequirement()
  }, [user, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.newPassword) {
      newErrors.newPassword = 'Nieuw wachtwoord is verplicht'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Wachtwoord moet minimaal 8 karakters zijn'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Wachtwoord moet minimaal 1 kleine letter, 1 hoofdletter en 1 cijfer bevatten'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Bevestig wachtwoord is verplicht'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Wachtwoorden komen niet overeen'
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
      // Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
        data: {
          temp_password: false // Remove temp password flag
        }
      })

      if (updateError) {
        throw updateError
      }

      toast({
        title: "Wachtwoord succesvol gewijzigd",
        description: "Je wordt doorgestuurd naar de hoofdpagina",
      })
      
      // Redirect to main page after successful password change
      setTimeout(() => {
        router.push('/')
      }, 1500)
      
    } catch (error) {
      toast({
        title: "Wachtwoord wijzigen mislukt",
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden',
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      // Console logging removed for banking standards
    }
  }

  if (!isFirstLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Laden...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full">
              <TreePine className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Wachtwoord Wijzigen</h1>
          <p className="text-gray-600 mt-2">Stel een nieuw wachtwoord in voor je account</p>
        </div>

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Dit is je eerste keer inloggen. Je moet een nieuw wachtwoord instellen om door te gaan.
          </AlertDescription>
        </Alert>

        {/* Password Change Form */}
        <Card>
          <CardHeader>
            <CardTitle>Nieuw Wachtwoord</CardTitle>
            <CardDescription>
              Kies een sterk wachtwoord met minimaal 8 karakters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nieuw Wachtwoord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className={`pl-10 pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.newPassword}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Minimaal 8 karakters, met hoofdletter, kleine letter en cijfer
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bevestig Wachtwoord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wachtwoord wijzigen...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Wachtwoord wijzigen
                  </>
                )}
              </Button>
            </form>

            {/* Logout Option */}
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isSubmitting}
                className="text-sm"
              >
                Uitloggen en later terugkomen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}