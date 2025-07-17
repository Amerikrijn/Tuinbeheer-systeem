import { TreePine } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <TreePine className="h-16 w-16 text-green-600 mx-auto mb-4 animate-pulse" />
          <div className="absolute inset-0 h-16 w-16 mx-auto">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-green-200 border-t-green-600"></div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Tuinbeheer Systeem
        </h2>
        <p className="text-gray-600 animate-pulse">
          Laden...
        </p>
      </div>
    </div>
  )
}