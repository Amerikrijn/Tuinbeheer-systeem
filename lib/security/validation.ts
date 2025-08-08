/**
 * CENTRALE VALIDATIE MODULE - SECURITY COMPLIANT
 * 
 * Alle input validatie volgens ASVS/NCSC standaarden
 * - Server-side validatie verplicht
 * - Input sanitization
 * - Type safety met Zod
 * - Rate limiting awareness
 */

import { z } from 'zod'

// ===========================================
// SECURITY CONSTANTS
// ===========================================

const SECURITY_LIMITS = {
  MAX_STRING_LENGTH: 10000,
  MAX_TEXT_LENGTH: 50000,
  MAX_NAME_LENGTH: 255,
  MAX_EMAIL_LENGTH: 254,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_NOTES_LENGTH: 5000,
} as const

// Dangerous patterns that should be blocked
const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload=/gi,
  /onerror=/gi,
  /onclick=/gi,
  /onmouseover=/gi,
  /<iframe[\s\S]*?>/gi,
  /<object[\s\S]*?>/gi,
  /<embed[\s\S]*?>/gi,
  /data:text\/html/gi,
] as const

// ===========================================
// SECURITY VALIDATION FUNCTIONS
// ===========================================

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string')
  }

  let sanitized = input.trim()

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      throw new Error('Input contains potentially dangerous content')
    }
  }

  // Basic HTML entity encoding for critical characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')

  return sanitized
}

/**
 * Validate UUID format
 */
export function validateUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

/**
 * Validate email format (RFC 5322 compliant)
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email) && email.length <= SECURITY_LIMITS.MAX_EMAIL_LENGTH
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < SECURITY_LIMITS.MIN_PASSWORD_LENGTH) {
    errors.push(`Wachtwoord moet minimaal ${SECURITY_LIMITS.MIN_PASSWORD_LENGTH} karakters zijn`)
  }

  if (password.length > SECURITY_LIMITS.MAX_PASSWORD_LENGTH) {
    errors.push(`Wachtwoord mag maximaal ${SECURITY_LIMITS.MAX_PASSWORD_LENGTH} karakters zijn`)
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één kleine letter bevatten')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één hoofdletter bevatten')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één cijfer bevatten')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één speciaal karakter bevatten')
  }

  // Check for common weak passwords
  const weakPasswords = ['password', 'wachtwoord', '12345678', 'qwerty123', 'admin123']
  if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
    errors.push('Wachtwoord mag geen veelgebruikte zwakke patronen bevatten')
  }

  return { valid: errors.length === 0, errors }
}

// ===========================================
// ZOD SCHEMAS - CORE ENTITIES
// ===========================================

// Base schemas with security validation
export const SecureStringSchema = z
  .string()
  .max(SECURITY_LIMITS.MAX_STRING_LENGTH)
  .transform(sanitizeString)

export const SecureTextSchema = z
  .string()
  .max(SECURITY_LIMITS.MAX_TEXT_LENGTH)
  .transform(sanitizeString)

export const SecureNameSchema = z
  .string()
  .min(1, 'Naam is verplicht')
  .max(SECURITY_LIMITS.MAX_NAME_LENGTH)
  .transform(sanitizeString)

export const UUIDSchema = z
  .string()
  .uuid('Ongeldige ID format')
  .refine(validateUUID, 'Ongeldige UUID format')

export const EmailSchema = z
  .string()
  .email('Ongeldig email adres')
  .max(SECURITY_LIMITS.MAX_EMAIL_LENGTH)
  .refine(validateEmail, 'Email format niet toegestaan')

export const PasswordSchema = z
  .string()
  .min(SECURITY_LIMITS.MIN_PASSWORD_LENGTH)
  .max(SECURITY_LIMITS.MAX_PASSWORD_LENGTH)
  .refine((password) => {
    const { valid } = validatePasswordStrength(password)
    return valid
  }, 'Wachtwoord voldoet niet aan security eisen')

// ===========================================
// GARDEN SCHEMAS
// ===========================================

export const GardenCreateSchema = z.object({
  name: SecureNameSchema,
  description: SecureTextSchema.optional(),
  location: SecureStringSchema,
  total_area: SecureStringSchema.optional(),
  length: SecureStringSchema.optional(),
  width: SecureStringSchema.optional(),
  garden_type: SecureStringSchema.optional(),
  established_date: z.string().date().optional(),
  notes: z.string().max(SECURITY_LIMITS.MAX_NOTES_LENGTH).transform(sanitizeString).optional(),
  
  // Visual properties with validation
  canvas_width: z.number().int().min(400).max(2000).default(800),
  canvas_height: z.number().int().min(300).max(1500).default(600),
  grid_size: z.number().int().min(10).max(50).default(20),
  default_zoom: z.number().min(0.1).max(3.0).default(1.0),
  show_grid: z.boolean().default(true),
  snap_to_grid: z.boolean().default(true),
  background_color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#f5f5f5'),
})

export const GardenUpdateSchema = GardenCreateSchema.partial().extend({
  id: UUIDSchema,
})

// ===========================================
// PLANT BED SCHEMAS
// ===========================================

export const PlantBedCreateSchema = z.object({
  garden_id: UUIDSchema,
  name: SecureNameSchema,
  location: SecureStringSchema.optional(),
  size: SecureStringSchema.optional(),
  soil_type: SecureStringSchema.optional(),
  sun_exposure: z.enum(['full-sun', 'partial-sun', 'shade']).optional(),
  description: z.string().max(SECURITY_LIMITS.MAX_DESCRIPTION_LENGTH).transform(sanitizeString).optional(),
  
  // Visual properties
  x_position: z.number().int().min(0).default(0),
  y_position: z.number().int().min(0).default(0),
  width: z.number().int().min(10).max(500).default(100),
  height: z.number().int().min(10).max(500).default(100),
  rotation: z.number().min(-360).max(360).default(0),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#8FBC8F'),
  border_color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#228B22'),
  border_width: z.number().int().min(0).max(10).default(2),
  opacity: z.number().min(0).max(1).default(1.0),
  z_index: z.number().int().min(0).max(1000).default(1),
})

export const PlantBedUpdateSchema = PlantBedCreateSchema.partial().extend({
  id: UUIDSchema,
})

// ===========================================
// PLANT SCHEMAS
// ===========================================

export const PlantCreateSchema = z.object({
  bed_id: UUIDSchema,
  name: SecureNameSchema,
  variety: SecureStringSchema.optional(),
  planted_date: z.string().date().optional(),
  harvest_date: z.string().date().optional(),
  quantity: z.number().int().min(1).max(10000).default(1),
  notes: z.string().max(SECURITY_LIMITS.MAX_NOTES_LENGTH).transform(sanitizeString).optional(),
  
  // Visual properties
  x_position: z.number().int().min(0).default(0),
  y_position: z.number().int().min(0).default(0),
  width: z.number().int().min(5).max(100).default(20),
  height: z.number().int().min(5).max(100).default(20),
  rotation: z.number().min(-360).max(360).default(0),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#90EE90'),
  symbol: z.string().max(10).default('🌱'),
  opacity: z.number().min(0).max(1).default(1.0),
  z_index: z.number().int().min(0).max(1000).default(2),
})

export const PlantUpdateSchema = PlantCreateSchema.partial().extend({
  id: UUIDSchema,
})

// ===========================================
// LOGBOOK SCHEMAS
// ===========================================

export const LogbookEntryCreateSchema = z.object({
  garden_id: UUIDSchema.optional(),
  plant_bed_id: UUIDSchema.optional(),
  plant_id: UUIDSchema.optional(),
  title: SecureNameSchema,
  description: z.string().min(1, 'Beschrijving is verplicht').max(SECURITY_LIMITS.MAX_TEXT_LENGTH).transform(sanitizeString),
  entry_date: z.string().date(),
  entry_type: SecureStringSchema.optional(),
  weather: SecureStringSchema.optional(),
  temperature: SecureStringSchema.optional(),
})

export const LogbookEntryUpdateSchema = LogbookEntryCreateSchema.partial().extend({
  id: UUIDSchema,
})

// ===========================================
// AUTH SCHEMAS
// ===========================================

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Wachtwoord is verplicht'),
  remember_me: z.boolean().optional(),
})

export const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  confirm_password: z.string(),
  terms_accepted: z.boolean().refine(val => val === true, 'Algemene voorwaarden moeten worden geaccepteerd'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirm_password"],
})

export const PasswordResetSchema = z.object({
  email: EmailSchema,
})

export const PasswordChangeSchema = z.object({
  current_password: z.string().min(1, 'Huidig wachtwoord is verplicht'),
  new_password: PasswordSchema,
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirm_password"],
})

// ===========================================
// GARDEN ACCESS SCHEMAS
// ===========================================

export const GardenAccessSchema = z.object({
  garden_id: UUIDSchema,
  user_id: UUIDSchema,
  role: z.enum(['owner', 'editor', 'viewer']),
  expires_at: z.string().datetime().optional(),
})

export const InvitationSchema = z.object({
  email: EmailSchema,
  garden_id: UUIDSchema,
  role: z.enum(['editor', 'viewer']),
  message: z.string().max(SECURITY_LIMITS.MAX_DESCRIPTION_LENGTH).transform(sanitizeString).optional(),
})

// ===========================================
// API VALIDATION HELPERS
// ===========================================

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Validatie fout'] }
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, string | string[]>
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const data = schema.parse(params)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Query parameter validatie fout'] }
  }
}

/**
 * Validate array of IDs
 */
export const IDArraySchema = z.array(UUIDSchema).min(1).max(100)

/**
 * Validate pagination parameters
 */
export const PaginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1, 'Page must be >= 1').default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1 && n <= 100, 'Limit must be 1-100').default('20'),
  sort: z.string().max(50).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * Validate search parameters
 */
export const SearchSchema = z.object({
  q: z.string().min(1).max(100).transform(sanitizeString),
  type: z.enum(['gardens', 'plants', 'logbook', 'all']).default('all'),
})

// ===========================================
// EXPORT TYPES
// ===========================================

export type GardenCreate = z.infer<typeof GardenCreateSchema>
export type GardenUpdate = z.infer<typeof GardenUpdateSchema>
export type PlantBedCreate = z.infer<typeof PlantBedCreateSchema>
export type PlantBedUpdate = z.infer<typeof PlantBedUpdateSchema>
export type PlantCreate = z.infer<typeof PlantCreateSchema>
export type PlantUpdate = z.infer<typeof PlantUpdateSchema>
export type LogbookEntryCreate = z.infer<typeof LogbookEntryCreateSchema>
export type LogbookEntryUpdate = z.infer<typeof LogbookEntryUpdateSchema>
export type Login = z.infer<typeof LoginSchema>
export type Register = z.infer<typeof RegisterSchema>
export type PasswordReset = z.infer<typeof PasswordResetSchema>
export type PasswordChange = z.infer<typeof PasswordChangeSchema>
export type GardenAccess = z.infer<typeof GardenAccessSchema>
export type Invitation = z.infer<typeof InvitationSchema>
export type Pagination = z.infer<typeof PaginationSchema>
export type Search = z.infer<typeof SearchSchema>