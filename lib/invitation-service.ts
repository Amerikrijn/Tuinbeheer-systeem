import { supabase } from './supabase'
import { createHash, randomBytes } from 'crypto'

export interface InvitationData {
  email: string
  full_name: string
  role: 'admin' | 'user'
  garden_access: string[]
  message?: string
}

export interface InvitationRecord {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'user'
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  token: string
  invited_by: string
  invited_at: string
  expires_at: string
  accepted_at?: string
  garden_access: string[]
}

class InvitationService {
  private readonly INVITATION_EXPIRY_HOURS = 72 // 3 days
  
  /**
   * Generate a secure invitation token
   */
  private generateInvitationToken(): string {
    return randomBytes(32).toString('hex')
  }

  /**
   * Hash token for secure storage
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  /**
   * Generate expiry date
   */
  private getExpiryDate(): string {
    const expiry = new Date()
    expiry.setHours(expiry.getHours() + this.INVITATION_EXPIRY_HOURS)
    return expiry.toISOString()
  }

  /**
   * Send invitation email via Supabase Auth
   * This creates a proper invitation with email verification
   */
  async sendInvitation(invitationData: InvitationData, invitedBy: string): Promise<{
    success: boolean
    invitationId?: string
    error?: string
  }> {
    try {
      // 1. Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email, status')
        .eq('email', invitationData.email)
        .single()

      if (existingUser) {
        return {
          success: false,
          error: `Gebruiker met email ${invitationData.email} bestaat al`
        }
      }

      // 2. Check for pending invitations
      const { data: pendingInvitation } = await supabase
        .from('invitations')
        .select('id, status, expires_at')
        .eq('email', invitationData.email)
        .eq('status', 'pending')
        .single()

      if (pendingInvitation) {
        const isExpired = new Date(pendingInvitation.expires_at) < new Date()
        if (!isExpired) {
          return {
            success: false,
            error: 'Er is al een actieve uitnodiging voor dit email adres'
          }
        } else {
          // Mark expired invitation as expired
          await supabase
            .from('invitations')
            .update({ status: 'expired' })
            .eq('id', pendingInvitation.id)
        }
      }

      // 3. Generate secure invitation token
      const token = this.generateInvitationToken()
      const hashedToken = this.hashToken(token)
      const expiresAt = this.getExpiryDate()

      // 4. Create invitation record
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .insert({
          email: invitationData.email,
          full_name: invitationData.full_name,
          role: invitationData.role,
          status: 'pending',
          token: hashedToken, // Store hashed token
          invited_by: invitedBy,
          expires_at: expiresAt,
          garden_access: invitationData.garden_access
        })
        .select()
        .single()

      if (invitationError) {
        throw invitationError
      }

      // 5. Send invitation email via Supabase Auth
      const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/accept-invitation?token=${token}&email=${encodeURIComponent(invitationData.email)}`
      
      // Use Supabase's built-in invitation system with custom redirect
      const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(
        invitationData.email,
        {
          redirectTo: invitationUrl,
          data: {
            invitation_id: invitation.id,
            role: invitationData.role,
            full_name: invitationData.full_name,
            custom_message: invitationData.message || 'Je bent uitgenodigd voor het tuinbeheer systeem'
          }
        }
      )

      if (emailError) {
        // Cleanup invitation if email failed
        await supabase
          .from('invitations')
          .delete()
          .eq('id', invitation.id)
          
        throw emailError
      }

      return {
        success: true,
        invitationId: invitation.id
      }

    } catch (error) {
      console.error('Invitation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Er is een fout opgetreden bij het versturen van de uitnodiging'
      }
    }
  }

  /**
   * Verify invitation token and get invitation data
   */
  async verifyInvitation(token: string, email: string): Promise<{
    valid: boolean
    invitation?: InvitationRecord
    error?: string
  }> {
    try {
      const hashedToken = this.hashToken(token)

      const { data: invitation, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', hashedToken)
        .eq('email', email)
        .eq('status', 'pending')
        .single()

      if (error || !invitation) {
        return {
          valid: false,
          error: 'Ongeldige of verlopen uitnodiging'
        }
      }

      // Check if expired
      if (new Date(invitation.expires_at) < new Date()) {
        await supabase
          .from('invitations')
          .update({ status: 'expired' })
          .eq('id', invitation.id)

        return {
          valid: false,
          error: 'Uitnodiging is verlopen'
        }
      }

      return {
        valid: true,
        invitation: invitation as InvitationRecord
      }

    } catch (error) {
      return {
        valid: false,
        error: 'Er is een fout opgetreden bij het verifiëren van de uitnodiging'
      }
    }
  }

  /**
   * Accept invitation and create user account
   */
  async acceptInvitation(token: string, email: string, password: string): Promise<{
    success: boolean
    userId?: string
    error?: string
  }> {
    try {
      // 1. Verify invitation
      const { valid, invitation, error: verifyError } = await this.verifyInvitation(token, email)
      
      if (!valid || !invitation) {
        return {
          success: false,
          error: verifyError || 'Ongeldige uitnodiging'
        }
      }

      // 2. Create user account via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
        options: {
          data: {
            full_name: invitation.full_name,
            role: invitation.role,
            invitation_accepted: true
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Geen gebruiker ontvangen van authenticatie')
      }

      // 3. Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: invitation.email,
          full_name: invitation.full_name,
          role: invitation.role,
          status: 'active', // User is active after accepting invitation
          created_at: new Date().toISOString()
        })

      if (profileError) {
        throw profileError
      }

      // 4. Add garden access if specified
      if (invitation.garden_access && invitation.garden_access.length > 0) {
        const gardenAccessInserts = invitation.garden_access.map(gardenId => ({
          user_id: authData.user!.id,
          garden_id: gardenId
        }))

        const { error: accessError } = await supabase
          .from('user_garden_access')
          .insert(gardenAccessInserts)

        if (accessError) {
          console.error('Garden access error:', accessError)
          // Don't fail the whole process for garden access errors
        }
      }

      // 5. Mark invitation as accepted
      await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id)

      return {
        success: true,
        userId: authData.user.id
      }

    } catch (error) {
      console.error('Accept invitation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Er is een fout opgetreden bij het accepteren van de uitnodiging'
      }
    }
  }

  /**
   * Revoke an invitation
   */
  async revokeInvitation(invitationId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId)
        .eq('status', 'pending')

      if (error) {
        throw error
      }

      return { success: true }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Er is een fout opgetreden bij het intrekken van de uitnodiging'
      }
    }
  }

  /**
   * Get pending invitations (admin only)
   */
  async getPendingInvitations(): Promise<{
    success: boolean
    invitations?: InvitationRecord[]
    error?: string
  }> {
    try {
      const { data: invitations, error } = await supabase
        .from('invitations')
        .select(`
          *,
          inviter:invited_by(full_name, email)
        `)
        .eq('status', 'pending')
        .order('invited_at', { ascending: false })

      if (error) {
        throw error
      }

      return {
        success: true,
        invitations: invitations as InvitationRecord[]
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Er is een fout opgetreden bij het ophalen van uitnodigingen'
      }
    }
  }
}

export const invitationService = new InvitationService()