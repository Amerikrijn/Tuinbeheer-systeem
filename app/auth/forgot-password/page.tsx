'use client'

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Email vereist",
        description: "Voer je email adres in",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      await resetPassword(email)
      setEmailSent(true)
      toast({
        title: "Email verzonden",
        description: "Check je inbox voor de reset link",
      })
    } catch (error) {
      toast({
        title: "Fout bij verzenden",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle>Email Verzonden</CardTitle>
            <CardDescription>
              We hebben een wachtwoord reset link naar {email} gestuurd
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Check je inbox en spam folder voor de reset email. De link is 1 uur geldig.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setEmailSent(false)}
                className="flex-1"
              >
                Andere Email
              </Button>
              <Link href="/auth/login" className="flex-1">
                <Button className="w-full">
                  Terug naar Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <CardTitle>Wachtwoord Vergeten</CardTitle>
              <CardDescription>
                Voer je email in om een reset link te ontvangen
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email adres</Label>
              <Input
                id="email"
                type="email"
                placeholder="je@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reset Link Versturen
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}