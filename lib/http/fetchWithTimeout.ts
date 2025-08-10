/**
 * Fetch with timeout utility for consistent network request handling
 * Prevents hanging requests and ensures proper error handling
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number
}

/**
 * Fetch wrapper with configurable timeout
 * @param input - URL or Request object
 * @param init - Fetch options with optional timeout
 * @returns Promise<Response>
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL, 
  init: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeoutMs = 10000, ...rest } = init
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(input, { 
      ...rest, 
      signal: controller.signal 
    })
    return response
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}