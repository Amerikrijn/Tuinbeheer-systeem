import { useState, useEffect } from 'react'

/**
 * Hook that debounces a value
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timeout if value changes (also on component unmount)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook that provides a debounced callback
 * @param callback The callback to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  const debouncedCallback = ((...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer)
    }

    const newTimer = setTimeout(() => {
      callback(...args)
    }, delay)

    setTimer(newTimer)
  }) as T

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [timer])

  return debouncedCallback
}