import { getSupabaseClient } from '../supabase'

export interface PasswordValidation {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

export class PasswordChangeManager {
  private static instance: PasswordChangeManager
  
  static getInstance(): PasswordChangeManager {
    if (!PasswordChangeManager.instance) {
      PasswordChangeManager.instance = new PasswordChangeManager()
    }
    return PasswordChangeManager.instance
  }

  /**
   * Banking-grade password validation
   */
  validatePassword(password: string, confirmPassword: string): PasswordValidation {
    const errors: string[] = []
    let strength: 'weak' | 'medium' | 'strong' = 'weak'

    // Banking standard: minimum 8 characters
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    // Banking standard: password confirmation
    if (password !== confirmPassword) {
      errors.push('Passwords do not match')
    }

    // Banking standard: complexity requirements
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!hasNumbers) {
      errors.push('Password must contain at least one number')
    }

    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character')
    }

    // Calculate password strength
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (hasUpperCase) score++
    if (hasLowerCase) score++
    if (hasNumbers) score++
    if (hasSpecialChar) score++
    if (password.length >= 16) score++

    if (score >= 5) strength = 'strong'
    else if (score >= 3) strength = 'medium'
    else strength = 'weak'

    return {
      isValid: errors.length === 0,
      errors,
      strength
    }
  }

  /**
   * Change user password with banking-grade security
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate new password
      const validation = this.validatePassword(newPassword, confirmPassword)
      if (!validation.isValid) {
        return {
          success: false,
          error: `Password validation failed: ${validation.errors.join(', ')}`
        }
      }

      // Get current user
      const supabase = getSupabaseClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        return {
          success: false,
          error: 'User not authenticated'
        }
      }

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
      })

      if (signInError) {
        return {
          success: false,
          error: 'Current password is incorrect'
        }
      }

      // Change password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        return {
          success: false,
          error: `Failed to update password: ${updateError.message}`
        }
      }

      return {
        success: true
      }

    } catch (error) {
      console.error('Password change error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during password change'
      }
    }
  }
}

// Export singleton instance
export const passwordChangeManager = PasswordChangeManager.getInstance()

// Export for backward compatibility
export default PasswordChangeManager