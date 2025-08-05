import { useState, useEffect, createContext, useContext } from 'react'

// Mock types for preview - in production these would come from Supabase
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'admin' | 'user'
  status: 'pending' | 'active' | 'inactive'
  permissions: string[]
  created_at: string
  last_login?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  hasPermission: (permission: string) => boolean
  isAdmin: () => boolean
}

// Mock users for preview
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@tuinbeheer.nl',
    full_name: 'Admin User',
    role: 'admin',
    status: 'active',
    permissions: [
      'gardens.create', 'gardens.edit', 'gardens.delete', 'gardens.view',
      'plant_beds.create', 'plant_beds.edit', 'plant_beds.delete', 'plant_beds.view',
      'plants.create', 'plants.edit', 'plants.delete', 'plants.view',
      'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.complete', 'tasks.view',
      'logbook.create', 'logbook.edit', 'logbook.delete', 'logbook.view',
      'users.invite', 'users.manage', 'users.view'
    ],
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-01-15T10:30:00Z'
  },
  {
    id: '2', 
    email: 'gebruiker@tuinbeheer.nl',
    full_name: 'Jan de Tuinman',
    role: 'user',
    status: 'active',
    permissions: [
      'gardens.view', 'plant_beds.view', 'plants.view',
      'tasks.complete', 'tasks.view',
      'logbook.create', 'logbook.view'
    ],
    created_at: '2024-01-05T00:00:00Z',
    last_login: '2024-01-14T08:15:00Z'
  },
  {
    id: '3',
    email: 'maria@tuinbeheer.nl', 
    full_name: 'Maria Bloemen',
    role: 'user',
    status: 'pending',
    permissions: [
      'gardens.view', 'plant_beds.view', 'plants.view',
      'tasks.complete', 'tasks.view',
      'logbook.create', 'logbook.view'
    ],
    created_at: '2024-01-10T00:00:00Z'
  }
]

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthState(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Mock authentication check - in production this would check Supabase session
    const checkAuth = async () => {
      try {
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check for stored user (mock localStorage)
        const storedUserId = localStorage.getItem('mockUserId')
        if (storedUserId) {
          const user = MOCK_USERS.find(u => u.id === storedUserId)
          if (user) {
            setState({
              user,
              loading: false,
              error: null
            })
            return
          }
        }
        
        setState({
          user: null,
          loading: false,
          error: null
        })
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication error'
        })
      }
    }

    checkAuth()
  }, [])

  const signIn = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // Mock authentication - in production this would use Supabase auth
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const user = MOCK_USERS.find(u => u.email === email)
      if (!user || password !== 'demo123') {
        throw new Error('Ongeldige inloggegevens')
      }

      if (user.status !== 'active') {
        throw new Error('Account is nog niet geactiveerd')
      }

      // Store user session (mock)
      localStorage.setItem('mockUserId', user.id)
      
      setState({
        user: {
          ...user,
          last_login: new Date().toISOString()
        },
        loading: false,
        error: null
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Inloggen mislukt'
      }))
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      // Mock sign out - in production this would use Supabase auth
      await new Promise(resolve => setTimeout(resolve, 500))
      
      localStorage.removeItem('mockUserId')
      
      setState({
        user: null,
        loading: false,
        error: null
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Uitloggen mislukt'
      }))
      throw error
    }
  }

  const signUp = async (email: string, password: string): Promise<void> => {
    // Mock signup - in production this would create a new user
    throw new Error('Nieuwe accounts kunnen alleen via uitnodiging worden aangemaakt')
  }

  const resetPassword = async (email: string): Promise<void> => {
    // Mock password reset
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user = MOCK_USERS.find(u => u.email === email)
    if (!user) {
      throw new Error('Geen account gevonden met dit e-mailadres')
    }
    
    // In production this would send a reset email via Supabase
    console.log(`Password reset email sent to ${email}`)
  }

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false
    if (state.user.role === 'admin') return true
    return state.user.permissions.includes(permission)
  }

  const isAdmin = (): boolean => {
    return state.user?.role === 'admin' || false
  }

  return {
    ...state,
    signIn,
    signOut,
    signUp,
    resetPassword,
    hasPermission,
    isAdmin
  }
}