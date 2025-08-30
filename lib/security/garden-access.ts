/**
 * SECURITY UTILITIES FOR GARDEN ACCESS CONTROL
 * 
 * These utilities ensure that users can NEVER access data from gardens
 * they don't have permission for. This is a critical security layer.
 */

export interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  garden_access: string[]
}

/**
 * Validates if a user has access to a specific garden
 * SECURITY: This is a critical function - never allow bypass
 */
export function validateGardenAccess(user: User | null, gardenId: string): boolean {
  if (!user) {

    return false
  }

  // Admin has access to all gardens
  if (user.role === 'admin') {

    return true
  }

  // Check if user has specific access to this garden
  const hasAccess = user.garden_access?.includes(gardenId) || false
  
  if (!hasAccess) {

  } else {

  }

  return hasAccess
}

/**
 * Validates if a user has access to multiple gardens
 * SECURITY: All gardens must be accessible or function returns false
 */
export function validateMultipleGardenAccess(user: User | null, gardenIds: string[]): boolean {
  if (!user) {

    return false
  }

  // Admin has access to all gardens
  if (user.role === 'admin') {
    return true
  }

  // Check each garden individually
  for (const gardenId of gardenIds) {
    if (!validateGardenAccess(user, gardenId)) {
      return false
    }
  }

  return true
}

/**
 * Filters garden IDs to only those the user has access to
 * SECURITY: Returns empty array if user has no access
 */
export function filterAccessibleGardens(user: User | null, gardenIds: string[]): string[] {
  if (!user) {

    return []
  }

  // Admin has access to all gardens
  if (user.role === 'admin') {
    return gardenIds
  }

  // Filter to only accessible gardens
  const accessibleGardens = gardenIds.filter(gardenId => 
    user.garden_access?.includes(gardenId) || false
  )

  return accessibleGardens
}

/**
 * Gets all gardens a user has access to
 * SECURITY: Returns empty array for users with no access (not null/undefined)
 */
export function getUserAccessibleGardens(user: User | null): string[] {
  if (!user) {

    return []
  }

  if (user.role === 'admin') {
    // For admin, return empty array which means "all gardens" in our system
    return []
  }

  return user.garden_access || []
}