export function getUserFriendlyErrorMessage(error: string | null | undefined, locale: 'nl' | 'en' = 'nl'): string {
  const e = (error || '').toLowerCase()

  const isNl = locale === 'nl'

  if (e.includes('auth') || e.includes('unauthorized') || e.includes('forbidden') || e.includes('permission')) {
    return isNl ? 'U heeft geen toegang. Log in en probeer opnieuw.' : "You don't have access. Please log in and try again."
  }

  if (
    e.includes('fetch') ||
    e.includes('network') ||
    e.includes('failed to fetch') ||
    e.includes('net::') ||
    e.includes('connection') ||
    e.includes('ecconnreset') ||
    e.includes('timeout') ||
    e.includes('etimedout')
  ) {
    return isNl ? 'Verbindingsprobleem. Controleer uw internet en probeer opnieuw.' : 'Connection problem. Check your internet and try again.'
  }

  if (
    e.includes('validation') ||
    e.includes('invalid') ||
    e.includes('schema') ||
    e.includes('required') ||
    e.includes('constraint') ||
    e.includes('range') ||
    e.includes('too long') ||
    e.includes('too short')
  ) {
    return isNl ? 'Controleer uw invoer en probeer het opnieuw.' : 'Please check your input and try again.'
  }

  if (
    e.includes('relation') ||
    e.includes('table') ||
    e.includes('column') ||
    e.includes('schema') ||
    e.includes('postgres') ||
    e.includes('supabase')
  ) {
    return isNl ? 'Databaseprobleem. Neem contact op met support.' : 'Database issue. Please contact support.'
  }

  if (e.includes('rate limit') || e.includes('too many requests') || e.includes('429')) {
    return isNl ? 'Te veel verzoeken. Wacht even en probeer opnieuw.' : 'Too many requests. Please wait and try again.'
  }

  if (e.includes('conflict') || e.includes('already exists') || e.includes('duplicate key') || e.includes('unique constraint')) {
    return isNl ? 'Dit bestaat al. Vernieuw of wijzig uw invoer.' : 'This already exists. Refresh or adjust your input.'
  }

  if (e.includes('not found') || e.includes('no rows') || e.includes('404') || e.includes('does not exist')) {
    return isNl ? 'Niet gevonden. Het item bestaat mogelijk niet meer.' : 'Not found. The item may no longer exist.'
  }

  if (e.includes('storage') || e.includes('bucket') || e.includes('upload') || e.includes('file') || e.includes('image') || e.includes('mimetype') || e.includes('size')) {
    return isNl ? 'Bestandsfout. Controleer het bestandstype en de bestandsgrootte.' : 'File error. Check file type and size.'
  }

  if (!e) {
    return isNl ? 'Er is een onverwachte fout opgetreden.' : 'An unexpected error occurred.'
  }

  return isNl ? 'Er is iets misgegaan. Probeer het opnieuw of neem contact op met support.' : 'Something went wrong. Please try again or contact support.'
}