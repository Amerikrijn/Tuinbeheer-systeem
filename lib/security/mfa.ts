/**
 * Multi-Factor Authentication (MFA) enforcement for privileged actions
 * Requires admin users to have MFA enabled before performing sensitive operations
 */

import { supabase } from '@/lib/supabase'

export interface MFAStatus {
  isEnabled: boolean
  factors: Array<{
    id: string
    type: 'totp' | 'phone'
    status: 'verified' | 'unverified'
  }>
}

/**
 * Check if user has MFA enabled and verified
 * @param userId - User ID to check
 * @returns MFA status object
 */
export async function getUserMFAStatus(userId: string): Promise<MFAStatus> {
  try {
    // Get user's MFA factors from Supabase Auth
    const { data, error } = await supabase.auth.mfa.listFactors()
    
    if (error) {
      console.error('Failed to fetch MFA factors:', error)
      return { isEnabled: false, factors: [] }
    }
    
    const verifiedFactors = data.factors.filter(factor => factor.status === 'verified')
    
    return {
      isEnabled: verifiedFactors.length > 0,
      factors: data.factors.map(factor => ({
        id: factor.id,
        type: factor.factor_type as 'totp' | 'phone',
        status: factor.status as 'verified' | 'unverified'
      }))
    }
  } catch (error) {
    console.error('Error checking MFA status:', error)
    return { isEnabled: false, factors: [] }
  }
}

/**
 * Enforce MFA for admin actions
 * Throws an error if admin user doesn't have MFA enabled
 * @param user - User object with role information
 * @throws Error if MFA not enabled for admin user
 */
export async function enforceMFAForAdmin(user: { id: string; role: string }): Promise<void> {
  // Only enforce MFA for admin users
  if (user.role !== 'admin') {
    return
  }
  
  const mfaStatus = await getUserMFAStatus(user.id)
  
  if (!mfaStatus.isEnabled) {
    throw new Error('MFA_REQUIRED_FOR_ADMIN')
  }
}

/**
 * Check if MFA challenge is required for current session
 * @returns boolean indicating if MFA challenge is needed
 */
export async function isMFAChallengeRequired(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    
    if (error) {
      console.error('Failed to check MFA assurance level:', error)
      return true // Fail secure - require MFA if check fails
    }
    
    // Require AAL2 (MFA) for admin actions
    return data.currentLevel === 'aal1' && data.nextLevel === 'aal2'
  } catch (error) {
    console.error('Error checking MFA challenge requirement:', error)
    return true // Fail secure
  }
}

/**
 * Initiate MFA challenge for current session
 * @returns Challenge ID for verification
 */
export async function initiateMFAChallenge(): Promise<string> {
  try {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId: undefined // Use default factor
    })
    
    if (error) {
      throw new Error(`Failed to initiate MFA challenge: ${error.message}`)
    }
    
    return data.id
  } catch (error) {
    console.error('Error initiating MFA challenge:', error)
    throw error
  }
}

/**
 * Verify MFA challenge
 * @param challengeId - Challenge ID from initiateMFAChallenge
 * @param code - TOTP code from user
 * @returns boolean indicating if verification was successful
 */
export async function verifyMFAChallenge(challengeId: string, code: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.mfa.verify({
      challengeId,
      code
    })
    
    if (error) {
      console.error('MFA verification failed:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error verifying MFA challenge:', error)
    return false
  }
}