'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Loader2 } from 'lucide-react'

interface SearchBarProps {
  defaultValue?: string
}

export function SearchBar({ defaultValue = '' }: SearchBarProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(defaultValue)
  
  const handleSearch = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(window.location.search)
      
      if (value) {
        params.set('search', value)
        params.set('page', '1') // Reset to first page on search
      } else {
        params.delete('search')
      }
      
      router.push(`/?${params.toString()}`)
    })
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(search)
  }
  
  const handleClear = () => {
    setSearch('')
    handleSearch('')
  }
  
  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="relative max-w-md">
        <Input
          type="text"
          placeholder="Zoek tuinen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-20"
          disabled={isPending}
        />
        
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleClear}
              disabled={isPending}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            type="submit"
            size="sm"
            className="h-7"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Zoek'
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}