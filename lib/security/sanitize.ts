/**
 * HTML Sanitization utility for XSS protection
 * Uses DOMPurify to clean user-generated content
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - Raw HTML string that may contain malicious content
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return empty string or use server-side sanitization
    return ''
  }
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['class'],
    FORBID_SCRIPT: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  })
}

/**
 * Sanitize text content (removes all HTML)
 * @param dirty - Raw text that may contain HTML
 * @returns Plain text string
 */
export function sanitizeText(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic HTML removal
    return dirty.replace(/<[^>]*>/g, '')
  }
  
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] })
}

/**
 * Safe component for rendering user HTML content
 */
export interface SafeHtmlProps {
  html: string
  className?: string
}