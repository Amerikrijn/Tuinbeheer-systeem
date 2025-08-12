'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, AlertTriangle, Shield, CheckCircle } from 'lucide-react'
import { passwordChangeManager, type PasswordValidation } from '@/lib/auth/password-change-manager'
import { useAuth } from '@/hooks/use-supabase-auth'

interface ForcePasswordChangeProps {
  user: any
  onPasswordChanged: () => void
}

export function ForcePasswordChange({ user, onPasswordChanged }: ForcePasswordChangeProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validation, setValidation] = useState<PasswordValidation | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { forceRefreshUser } = useAuth()

  // Real-time password validation
  const handlePasswordChange = (password: string) => {
    setNewPassword(password)
    if (password.length > 0) {
      const validation = passwordChangeManager.validatePassword(password, confirmPassword)
      setValidation(validation)
    } else {
      setValidation(null)
    }
    setError('') // Clear errors on input change
  }

  const handleConfirmPasswordChange = (confirmPwd: string) => {
    setConfirmPassword(confirmPwd)
    if (newPassword.length > 0) {
      const validation = passwordChangeManager.validatePassword(newPassword, confirmPwd)
      setValidation(validation)
    }
    setError('') // Clear errors on input change
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Use the banking-grade password change manager
      const result = await passwordChangeManager.changePassword(newPassword, confirmPassword)

      if (!result.success) {
        if (result.requiresReauth) {
          setError(result.error || 'Authentication required')
          // Redirect to login after a brief delay
          setTimeout(() => {
            router.push('/auth/login')
          }, 2000)
          return
        }
        
        setError(result.error || 'Password change failed')
        return
      }

      // Success! Show success state briefly
      setSuccess(true)
      
      // Complete the flow and refresh auth state
      setTimeout(async () => {
        await passwordChangeManager.completePasswordChangeFlow()
        
        // 🏦 BANKING COMPLIANCE: Complete logout and redirect to login
        // This ensures fresh authentication with new password
        try {
          await auth.signOut()
          router.push('/auth/login?message=password-changed')
        } catch (error) {
          console.error('Logout error:', error)
          // Fallback: force redirect anyway
          window.location.href = '/auth/login?message=password-changed'
        }
      }, 1500)

    } catch (error: any) {
      console.error('Password change error:', error)
      setError('System error. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Password Changed Successfully
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              You will now be redirected to login with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-muted-foreground">Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Password Change Required
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            For security reasons, you must change your password before continuing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-foreground">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="pr-10"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Real-time password strength indicator */}
              {validation && newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`h-2 w-full rounded-full ${
                      validation.strength === 'strong' ? 'bg-green-200' :
                      validation.strength === 'medium' ? 'bg-yellow-200' : 'bg-red-200'
                    }`}>
                      <div className={`h-full rounded-full transition-all duration-300 ${
                        validation.strength === 'strong' ? 'bg-green-600 w-full' :
                        validation.strength === 'medium' ? 'bg-yellow-600 w-2/3' : 'bg-red-600 w-1/3'
                      }`} />
                    </div>
                    <span className={`font-medium ${
                      validation.strength === 'strong' ? 'text-green-600' :
                      validation.strength === 'medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {validation.strength.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            {/* Validation errors */}
            {validation && !validation.isValid && (newPassword.length > 0 || confirmPassword.length > 0) && (
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-md">
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* System errors */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !validation?.isValid || !newPassword || !confirmPassword}
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Changing Password...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Change Password
                </div>
              )}
            </Button>
          </form>

          {/* Banking compliance info */}
          <div className="mt-6 p-3 bg-muted rounded-md">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Banking Security Requirements:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Minimum 8 characters</li>
                  <li>• At least 2 of: uppercase, lowercase, numbers, symbols</li>
                  <li>• Different from temporary password</li>
                  <li>• All changes are securely audited</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}