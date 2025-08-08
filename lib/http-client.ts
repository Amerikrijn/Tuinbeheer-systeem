/**
 * SECURE HTTP CLIENT - COMPLIANT MET DNB/NCSC STANDAARDEN
 * 
 * Features:
 * - Consistent timeouts (10s default)
 * - Exponential backoff retries
 * - Idempotency key support
 * - Request/response logging
 * - AbortController support
 * - Security headers
 */

import { logger } from './logger'

// ===========================================
// CONFIGURATION
// ===========================================

const HTTP_CONFIG = {
  DEFAULT_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000, // 1 second
  MAX_RETRY_DELAY: 30000, // 30 seconds
  IDEMPOTENT_METHODS: ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS'] as const,
} as const

// ===========================================
// TYPES
// ===========================================

export interface HttpClientOptions {
  timeout?: number
  retries?: number
  idempotencyKey?: string
  headers?: Record<string, string>
  abortSignal?: AbortSignal
  skipRetry?: boolean
}

export interface HttpResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Headers
  url: string
}

export interface HttpError extends Error {
  status?: number
  statusText?: string
  url?: string
  response?: Response
  isTimeout?: boolean
  isAborted?: boolean
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Generate idempotency key for requests
 */
export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Calculate retry delay with exponential backoff and jitter
 */
function calculateRetryDelay(attempt: number): number {
  const exponentialDelay = HTTP_CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt - 1)
  const jitter = Math.random() * 0.1 * exponentialDelay // 10% jitter
  return Math.min(exponentialDelay + jitter, HTTP_CONFIG.MAX_RETRY_DELAY)
}

/**
 * Check if HTTP method is idempotent
 */
function isIdempotentMethod(method: string): boolean {
  return HTTP_CONFIG.IDEMPOTENT_METHODS.includes(method.toUpperCase() as any)
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: HttpError): boolean {
  if (error.isTimeout || error.isAborted) {
    return false // Don't retry timeouts or aborted requests
  }

  if (!error.status) {
    return true // Network errors are retryable
  }

  // Retry on 5xx errors and specific 4xx errors
  return error.status >= 500 || error.status === 408 || error.status === 429
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ===========================================
// HTTP CLIENT CLASS
// ===========================================

export class HttpClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private defaultTimeout: number

  constructor(
    baseURL = '',
    defaultHeaders: Record<string, string> = {},
    defaultTimeout = HTTP_CONFIG.DEFAULT_TIMEOUT
  ) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...defaultHeaders,
    }
    this.defaultTimeout = defaultTimeout
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    url: string,
    options: RequestInit & HttpClientOptions = {}
  ): Promise<HttpResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = HTTP_CONFIG.RETRY_ATTEMPTS,
      idempotencyKey,
      skipRetry = false,
      abortSignal,
      ...fetchOptions
    } = options

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
    const method = fetchOptions.method || 'GET'

    // Prepare headers
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...fetchOptions.headers,
    }

    // Add idempotency key for non-idempotent methods
    if (idempotencyKey && !isIdempotentMethod(method)) {
      headers['Idempotency-Key'] = idempotencyKey
    }

    // Create abort controller for timeout
    const timeoutController = new AbortController()
    const timeoutId = setTimeout(() => timeoutController.abort(), timeout)

    // Combine abort signals
    const combinedSignal = abortSignal
      ? new AbortController()
      : timeoutController

    if (abortSignal) {
      abortSignal.addEventListener('abort', () => combinedSignal.abort())
      timeoutController.signal.addEventListener('abort', () => combinedSignal.abort())
    }

    const requestOptions: RequestInit = {
      ...fetchOptions,
      headers,
      signal: combinedSignal.signal,
    }

    let lastError: HttpError | null = null
    const maxAttempts = skipRetry ? 1 : Math.max(1, retries + 1)

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const startTime = Date.now()
      
      try {
        // Log request
        logger.info('HTTP Request', {
          method,
          url: fullUrl,
          attempt,
          maxAttempts,
          timeout,
          hasIdempotencyKey: !!idempotencyKey,
        })

        const response = await fetch(fullUrl, requestOptions)
        const endTime = Date.now()
        const duration = endTime - startTime

        // Clear timeout
        clearTimeout(timeoutId)

        // Parse response
        let data: T
        const contentType = response.headers.get('content-type')
        
        if (contentType?.includes('application/json')) {
          data = await response.json()
        } else {
          data = await response.text() as T
        }

        // Log response
        logger.info('HTTP Response', {
          method,
          url: fullUrl,
          status: response.status,
          statusText: response.statusText,
          duration,
          attempt,
          success: response.ok,
        })

        if (!response.ok) {
          const error: HttpError = new Error(`HTTP ${response.status}: ${response.statusText}`)
          error.status = response.status
          error.statusText = response.statusText
          error.url = fullUrl
          error.response = response

          // Log error
          logger.error('HTTP Error', {
            method,
            url: fullUrl,
            status: response.status,
            statusText: response.statusText,
            attempt,
            duration,
          })

          // Check if we should retry
          if (attempt < maxAttempts && !skipRetry && isRetryableError(error)) {
            if (isIdempotentMethod(method) || idempotencyKey) {
              lastError = error
              const retryDelay = calculateRetryDelay(attempt)
              
              logger.warn('HTTP Retry', {
                method,
                url: fullUrl,
                attempt,
                nextAttemptIn: retryDelay,
                error: error.message,
              })

              await sleep(retryDelay)
              continue
            }
          }

          throw error
        }

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          url: fullUrl,
        }

      } catch (error) {
        clearTimeout(timeoutId)
        const endTime = Date.now()
        const duration = endTime - startTime

        let httpError: HttpError

        if (error instanceof Error) {
          httpError = error as HttpError
          httpError.url = fullUrl

          // Handle specific error types
          if (error.name === 'AbortError') {
            httpError.isAborted = combinedSignal.signal.aborted
            httpError.isTimeout = timeoutController.signal.aborted
          }
        } else {
          httpError = new Error('Unknown HTTP error') as HttpError
          httpError.url = fullUrl
        }

        // Log error
        logger.error('HTTP Request Failed', {
          method,
          url: fullUrl,
          attempt,
          duration,
          error: httpError.message,
          isTimeout: httpError.isTimeout,
          isAborted: httpError.isAborted,
          status: httpError.status,
        })

        // Check if we should retry
        if (attempt < maxAttempts && !skipRetry && isRetryableError(httpError)) {
          if (isIdempotentMethod(method) || idempotencyKey) {
            lastError = httpError
            const retryDelay = calculateRetryDelay(attempt)
            
            logger.warn('HTTP Retry after Error', {
              method,
              url: fullUrl,
              attempt,
              nextAttemptIn: retryDelay,
              error: httpError.message,
            })

            await sleep(retryDelay)
            continue
          }
        }

        throw httpError
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error('All HTTP retries failed')
  }

  /**
   * GET request
   */
  async get<T>(url: string, options: HttpClientOptions = {}): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    body?: unknown,
    options: HttpClientOptions = {}
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      idempotencyKey: options.idempotencyKey || generateIdempotencyKey(),
    })
  }

  /**
   * PUT request (idempotent)
   */
  async put<T>(
    url: string,
    body?: unknown,
    options: HttpClientOptions = {}
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(
    url: string,
    body?: unknown,
    options: HttpClientOptions = {}
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      idempotencyKey: options.idempotencyKey || generateIdempotencyKey(),
    })
  }

  /**
   * DELETE request (idempotent)
   */
  async delete<T>(url: string, options: HttpClientOptions = {}): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'DELETE' })
  }

  /**
   * HEAD request
   */
  async head(url: string, options: HttpClientOptions = {}): Promise<HttpResponse<void>> {
    return this.makeRequest<void>(url, { ...options, method: 'HEAD' })
  }

  /**
   * OPTIONS request
   */
  async options<T>(url: string, options: HttpClientOptions = {}): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'OPTIONS' })
  }
}

// ===========================================
// DEFAULT INSTANCES
// ===========================================

// Default HTTP client instance
export const httpClient = new HttpClient()

// Supabase API client (if needed for direct API calls)
export const supabaseHttpClient = new HttpClient('', {
  'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
  'apikey': process.env.SUPABASE_ANON_KEY || '',
})

// ===========================================
// CONVENIENCE FUNCTIONS
// ===========================================

/**
 * Make a GET request with default client
 */
export async function get<T>(url: string, options?: HttpClientOptions): Promise<T> {
  const response = await httpClient.get<T>(url, options)
  return response.data
}

/**
 * Make a POST request with default client
 */
export async function post<T>(
  url: string,
  body?: unknown,
  options?: HttpClientOptions
): Promise<T> {
  const response = await httpClient.post<T>(url, body, options)
  return response.data
}

/**
 * Make a PUT request with default client
 */
export async function put<T>(
  url: string,
  body?: unknown,
  options?: HttpClientOptions
): Promise<T> {
  const response = await httpClient.put<T>(url, body, options)
  return response.data
}

/**
 * Make a PATCH request with default client
 */
export async function patch<T>(
  url: string,
  body?: unknown,
  options?: HttpClientOptions
): Promise<T> {
  const response = await httpClient.patch<T>(url, body, options)
  return response.data
}

/**
 * Make a DELETE request with default client
 */
export async function del<T>(url: string, options?: HttpClientOptions): Promise<T> {
  const response = await httpClient.delete<T>(url, options)
  return response.data
}

// ===========================================
// REACT HOOKS INTEGRATION
// ===========================================

/**
 * Create AbortController for React component cleanup
 */
export function useAbortController(): AbortController {
  const controller = new AbortController()
  
  // In a real React hook, you'd use useEffect for cleanup
  // useEffect(() => {
  //   return () => controller.abort()
  // }, [])
  
  return controller
}

/**
 * HTTP client hook with component-scoped abort controller
 */
export function useHttpClient(): HttpClient & { abortController: AbortController } {
  const abortController = useAbortController()
  
  // Create client with default abort signal
  const client = new HttpClient()
  const originalMakeRequest = client['makeRequest'].bind(client)
  
  // Override makeRequest to include abort signal by default
  client['makeRequest'] = async function<T>(url: string, options: RequestInit & HttpClientOptions = {}) {
    return originalMakeRequest<T>(url, {
      ...options,
      abortSignal: options.abortSignal || abortController.signal,
    })
  }
  
  return Object.assign(client, { abortController })
}

// ===========================================
// EXPORTS
// ===========================================

export default httpClient
export { HTTP_CONFIG }