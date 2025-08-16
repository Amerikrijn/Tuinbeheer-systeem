import { Metadata } from 'next'
import { LogbookList } from '@/components/logbook/logbook-list'

export const metadata: Metadata = {
  title: 'Logboek - Tuinbeheer Systeem',
  description: 'Bekijk en beheer je tuinlogboek entries',
}

export default function LogbookPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Logboek
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Beheer je tuinlogboek en houd bij wat er gebeurt in je tuin
        </p>
      </div>
      
      <LogbookList />
    </div>
  )
}