'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'

interface VirtualScrollProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = '',
  onLoadMore,
  hasMore = false,
  loading = false
}: VirtualScrollProps<T>) {
  const scrollElementRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [isNearBottom, setIsNearBottom] = useState(false)

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  // Calculate total height
  const totalHeight = items.length * itemHeight

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (scrollElementRef.current) {
      const newScrollTop = scrollElementRef.current.scrollTop
      setScrollTop(newScrollTop)

      // Check if near bottom for infinite scroll
      const scrollHeight = scrollElementRef.current.scrollHeight
      const clientHeight = scrollElementRef.current.clientHeight
      const nearBottom = scrollHeight - (newScrollTop + clientHeight) < 100

      if (nearBottom !== isNearBottom) {
        setIsNearBottom(nearBottom)
      }
    }
  }, [isNearBottom])

  // Trigger load more when near bottom
  useEffect(() => {
    if (isNearBottom && hasMore && !loading && onLoadMore) {
      onLoadMore()
    }
  }, [isNearBottom, hasMore, loading, onLoadMore])

  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex + 1)

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
        {loading && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="text-sm text-muted-foreground">Laden...</div>
          </div>
        )}
      </div>
    </div>
  )
}