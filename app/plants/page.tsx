import { Metadata } from 'next'
import { PlantsList } from '@/components/plants/plants-list'

export const metadata: Metadata = {
  title: 'Planten - Tuinbeheer Systeem',
  description: 'Bekijk en beheer je planten collectie',
}

export default function PlantsPage() {
  return (
    <div className=""container mx-auto px-4 py-8">
      <div className=""mb-8">
        <h1 className=""text-3xl font-bold text-foreground">
          Planten
        </h1>
        <p className=""text-muted-foreground mt-2">
          Beheer je planten collectie en houd bij van je planten
        </p>
      </div>
      
      <PlantsList />
    </div>
  )
}