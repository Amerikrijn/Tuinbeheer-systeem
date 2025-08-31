'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateUserDialog } from '@/components/admin/create-user-dialog'

interface Garden {
  id: string
  name: string
  description?: string
  is_active: boolean
}

interface CreateUserButtonProps {
  gardens: Garden[]
}

export function CreateUserButton({ gardens }: CreateUserButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  
  const handleSuccess = () => {
    setIsOpen(false)
    router.refresh() // Refresh server data
  }
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
        <Plus className="w-4 h-4 mr-2" />
        Nieuwe gebruiker
      </Button>
      
      <CreateUserDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        gardens={gardens}
        onSuccess={handleSuccess}
      />
    </>
  )
}