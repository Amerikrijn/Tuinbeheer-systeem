'use client'

/**
 * MFA Guard Component
 * Enforces MFA requirement for admin users before accessing sensitive functionality
 */

import React, { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, AlertTriangle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { getUserMFAStatus, isMFAChallengeRequired, initiateMFAChallenge, verifyMFAChallenge } from '@/lib/security/mfa'

interface MFAGuardProps {
  children: React.ReactNode
  requiredForRoles?: string[]
}

export function MFAGuard({ children, requiredForRoles = ['admin'] }: MFAGuardProps) {
  const { user } = useAuth()
  const [mfaStatus, setMfaStatus] = useState<'checking' | 'required' | 'challenge' | 'verified'>('checking')
  const [challengeId, setChallengeId] = useState<string>('')
  const [totpCode, setTotpCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    checkMFAStatus()
  }, [user])

  const checkMFAStatus = async () => {
    if (!user) {
      setMfaStatus('verified')
      return
    }

    // Only enforce MFA for specified roles
    if (!requiredForRoles.includes(user.role)) {
      setMfaStatus('verified')
      return
    }

    try {
      const status = await getUserMFAStatus(user.id)
      
      if (!status.isEnabled) {
        setMfaStatus('required')
        return
      }

      const challengeRequired = await isMFAChallengeRequired()
      if (challengeRequired) {
        setMfaStatus('challenge')
      } else {
        setMfaStatus('verified')
      }
    } catch (error) {
      console.error('Error checking MFA status:', error)
      setMfaStatus('required')
    }
  }

  const handleInitiateChallenge = async () => {
    try {
      const id = await initiateMFAChallenge()
      setChallengeId(id)
    } catch (error) {
      setError('Kon MFA challenge niet starten. Probeer opnieuw.')
    }
  }

  const handleVerifyCode = async () => {
    if (!challengeId || !totpCode) return

    setIsVerifying(true)
    setError('')

    try {
      const verified = await verifyMFAChallenge(challengeId, totpCode)
      
      if (verified) {
        setMfaStatus('verified')
      } else {
        setError('Ongeldige code. Probeer opnieuw.')
      }
    } catch (error) {
      setError('Verificatie mislukt. Probeer opnieuw.')
    } finally {
      setIsVerifying(false)
      setTotpCode('')
    }
  }

  if (mfaStatus === 'checking') {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">MFA status controleren...</span>
      </div>
    )
  }

  if (mfaStatus === 'required') {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            MFA Vereist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Als administrator moet je Multi-Factor Authentication (MFA) activeren voordat je deze functionaliteit kunt gebruiken.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Stappen om MFA te activeren:
            </p>
            <ol className="text-sm space-y-1 ml-4">
              <li>1. Ga naar je account instellingen</li>
              <li>2. Activeer Two-Factor Authentication (TOTP)</li>
              <li>3. Verifieer je authenticator app</li>
              <li>4. Kom terug naar deze pagina</li>
            </ol>
          </div>
          
          <Button onClick={checkMFAStatus} className="w-full">
            MFA Status Opnieuw Controleren
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (mfaStatus === 'challenge') {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            MFA Verificatie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription>
              Voer je 6-cijferige authenticator code in om door te gaan.
            </AlertDescription>
          </Alert>

          {!challengeId ? (
            <Button onClick={handleInitiateChallenge} className="w-full">
              MFA Challenge Starten
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="totp-code">Authenticator Code</Label>
                <Input
                  id="totp-code"
                  type="text"
                  placeholder="123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleVerifyCode} 
                disabled={totpCode.length !== 6 || isVerifying}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verifiëren...
                  </>
                ) : (
                  'Verifiëren'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // MFA verified - show protected content
  return <>{children}</>
}