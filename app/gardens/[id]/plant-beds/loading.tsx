'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className=""container mx-auto px-4 py-6 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className=""border rounded-lg p-4">
          <div className=""space-y-2">
            <Skeleton className=""h-5 w-1/3" />
            <Skeleton className=""h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
