'use client'

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { TreePine, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, loading } = useAuth()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'E-mailadres is verplicht'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ongeldig e-mailadres'
    }

    if (!formData.password) {
      newErrors.password = 'Wachtwoord is verplicht'
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
      await signIn(formData.email, formData.password)
      
      // Check if user has temp password and needs to change it
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.temp_password) {
        console.log('🔍 User has temp password, redirecting to change password page')
        toast({
          title: "Eerste keer inloggen",
          description: "Je moet eerst je wachtwoord wijzigen",
        })
        setTimeout(() => {
          router.push('/auth/change-password')
        }, 1000)
        return
      }
      
      toast({
        title: "Succesvol ingelogd",
        description: "Welkom terug!",
      })
      
      // Force redirect using window.location for more reliable navigation
      setTimeout(() => {
        console.log('🔍 Attempting redirect to homepage (role-based)')
        window.location.href = '/'
      }, 1000)
      
    } catch (error) {
      toast({
        title: "Inloggen mislukt",
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden',
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
    // Don't set isSubmitting to false immediately - let redirect happen
  }

  const demoCredentials = [
    { email: 'admin@tuinbeheer.nl', role: 'Administrator', password: 'Admin123!' },
    { email: 'gebruiker@tuinbeheer.nl', role: 'Gebruiker', password: 'User123!' },
    { email: 'amerik.rijn@gmail.com', role: 'Test Gebruiker', password: 'TempPass123!' }
  ]

  const fillDemoCredentials = (email: string, password: string) => {
    setFormData({ email, password })
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
          <h1 className="text-2xl font-bold text-gray-900">Tuinbeheer Systeem</h1>
          <p className="text-gray-600 mt-2">Meld je aan om door te gaan</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Inloggen</CardTitle>
            <CardDescription>
              Voer je gegevens in om toegang te krijgen tot het systeem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="je@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Inloggen...
                  </>
                ) : (
                  'Inloggen'
                )}
              </Button>
            </form>

            {/* Demo Credentials Section */}
            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Demo Accounts (voor preview)</p>
                <div className="space-y-2">
                  {demoCredentials.map((cred, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => fillDemoCredentials(cred.email, cred.password)}
                      disabled={isSubmitting}
                    >
                      {cred.role}: {cred.email}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Wachtwoord voor alle demo accounts: <code className="bg-gray-100 px-1 rounded">demo123</code>
                </p>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Wachtwoord vergeten?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Dit is een preview van het gebruikerssysteem. In productie werkt dit met echte Supabase authenticatie.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}