import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteUserRequest {
  email: string
  role: 'admin' | 'user'
  message?: string
  garden_access?: string[]
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase service role client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get request body
    const { email, role, message, garden_access = [] }: InviteUserRequest = await req.json()

    // Validate input
    if (!email || !role) {
      return new Response(
        JSON.stringify({ error: 'Email and role are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'User with this email already exists' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create user invitation using Supabase Admin API
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          role,
          invited_via: 'admin_invitation'
        },
        redirectTo: `${req.headers.get('origin')}/auth/login`
      }
    )

    if (inviteError) {
      console.error('Invite error:', inviteError)
      return new Response(
        JSON.stringify({ error: inviteError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!inviteData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user invitation' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create user record in public.users table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: inviteData.user.id,
        email: email,
        role: role,
        status: 'pending',
        invited_at: new Date().toISOString(),
        // invited_by will be set via RLS policy using auth.uid()
      })

    if (userError) {
      console.error('User creation error:', userError)
      // Don't fail completely - the auth user was created successfully
    }

    // Add garden access if specified
    if (garden_access.length > 0) {
      const accessEntries = garden_access.map(gardenId => ({
        user_id: inviteData.user.id,
        garden_id: gardenId,
        granted_at: new Date().toISOString()
        // granted_by will be set via RLS policy using auth.uid()
      }))

      const { error: accessError } = await supabaseAdmin
        .from('user_garden_access')
        .insert(accessEntries)

      if (accessError) {
        console.error('Garden access error:', accessError)
        // Don't fail completely - user was created successfully
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: inviteData.user.id,
          email: email,
          role: role,
          status: 'pending'
        },
        message: 'User invitation sent successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})