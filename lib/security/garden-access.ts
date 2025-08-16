export interface User {
  id: string
  email: string
  role: 'user' | 'admin'
  garden_access?: string[] | null
}

export function validateGardenAccess(user: User | null | undefined, gardenId: string): boolean {
  if (!user) {
    console.error('🚨 SECURITY VIOLATION: validateGardenAccess called without user')
    return false
  }

  if (user.role === 'admin') {
    console.log('✅ SECURITY: Admin access granted for garden:', gardenId)
    return true
  }

  const access = user.garden_access
  if (!access || !access.includes(gardenId)) {
    console.error('🚨 SECURITY VIOLATION: User attempted to access unauthorized garden:', {
      user: user.email,
      requestedGarden: gardenId,
      allowedGardens: access ?? undefined,
    })
    return false
  }

  console.log('✅ SECURITY: User access granted for garden:', {
    user: user.email,
    garden: gardenId,
  })
  return true
}

export function validateMultipleGardenAccess(user: User | null | undefined, gardenIds: string[]): boolean {
  if (!user) {
    console.error('🚨 SECURITY VIOLATION: validateMultipleGardenAccess called without user')
    return false
  }

  if (user.role === 'admin') {
    return true
  }

  const access = user.garden_access || []
  const unauthorized = gardenIds.filter((id) => !access.includes(id))
  if (unauthorized.length > 0) {
    console.error('🚨 SECURITY VIOLATION: User attempted to access unauthorized gardens:', {
      user: user.email,
      requestedGardens: gardenIds,
      unauthorizedGardens: unauthorized,
      allowedGardens: access,
    })
    return false
  }

  return true
}

export function filterAccessibleGardens(user: User | null | undefined, gardenIds: string[]): string[] {
  if (!user) {
    console.error('🚨 SECURITY VIOLATION: filterAccessibleGardens called without user')
    return []
  }

  if (user.role === 'admin') {
    return gardenIds
  }

  const access = user.garden_access || []
  const accessible = gardenIds.filter((id) => access.includes(id))
  console.log('🔍 SECURITY: Filtered gardens for user:', {
    user: user.email,
    requested: gardenIds,
    accessible,
    userAccess: access,
  })
  return accessible
}

export function getUserAccessibleGardens(user: User | null | undefined): string[] {
  if (!user) {
    console.warn('⚠️ SECURITY: getUserAccessibleGardens called without user')
    return []
  }

  if (user.role === 'admin') {
    return []
  }

  return user.garden_access || []
}

