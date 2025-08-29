"use client"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TreePine, Calendar, Smartphone, Users, Leaf, Plus, ArrowRight } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

export default function HomePage() {
  const { t } = useLanguage()

  const features = [
    {
      icon: TreePine,
      title: "Tuinbeheer",
      description: "Beheer meerdere tuinen met gedetailleerde informatie over locatie, afmetingen en onderhoud.",
      color: "text-green-600",
    },
    {
      icon: Leaf,
      title: "Plantvakken",
      description: "Organiseer je tuin in plantvakken met verschillende zonligging en grondsoorten.",
      color: "text-emerald-600",
    },
    {
      icon: Users,
      title: "Vrijwilligers",
      description: "Coördineer vrijwilligerswerk en houd bij wie wanneer welke taken uitvoert.",
      color: "text-blue-600",
    },
    {
      icon: Calendar,
      title: "Planning",
      description: "Plan verzorgingsactiviteiten en houd een kalender bij van alle tuinactiviteiten.",
      color: "text-purple-600",
    },
  ]

  const quickActions = [
    {
      title: "Nieuwe Tuin",
      description: "Voeg een nieuwe tuin toe",
      href: "/gardens/new",
      icon: Plus,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Kalender",
      description: "Bekijk geplande activiteiten",
      href: "/calendar",
      icon: Calendar,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Mobiele App",
      description: "Optimaal voor onderweg",
      href: "/mobile",
      icon: Smartphone,
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ]

  const steps = [
    {
      number: "1",
      title: "Maak een Tuin",
      description: "Begin met het aanmaken van je eerste tuin met locatie en basisinformatie.",
    },
    {
      number: "2",
      title: "Voeg Plantvakken toe",
      description: "Verdeel je tuin in plantvakken op basis van zonligging en gebruik.",
    },
    {
      number: "3",
      title: "Beheer Planten",
      description: "Voeg planten toe aan plantvakken en houd hun groei en verzorging bij.",
    },
    {
      number: "4",
      title: "Coördineer Activiteiten",
      description: "Plan verzorgingsactiviteiten en coördineer vrijwilligerswerk.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex justify-center">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              🌱 Tuinbeheersysteem v1.0
            </Badge>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Beheer je{" "}
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Gemeenschapstuin
            </span>{" "}
            met gemak
          </h1>

          <p className="mb-8 text-xl text-gray-600 md:text-2xl">
            Een moderne webapplicatie voor het beheren van tuinen, plantvakken en planten. Coördineer vrijwilligerswerk
            en houd de voortgang bij.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/gardens" className="flex items-center gap-2">
                <TreePine className="h-5 w-5" />
                Bekijk Tuinen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/gardens/new" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nieuwe Tuin
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Snelle Acties</h2>
          <p className="text-lg text-gray-600">Kom snel aan de slag met deze handige shortcuts</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {quickActions.map((action, index) => (
            <Card key={index} className="group cursor-pointer transition-all hover:shadow-lg">
              <Link href={action.href}>
                <CardContent className="p-6">
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${action.color} text-white`}
                  >
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-gray-600">{action.description}</p>
                  <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    Ga naar {action.title.toLowerCase()}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Functies</h2>
            <p className="text-lg text-gray-600">Alles wat je nodig hebt voor effectief tuinbeheer</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div
                    className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 ${feature.color}`}
                  >
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Hoe het werkt</h2>
          <p className="text-lg text-gray-600">In vier eenvoudige stappen naar een goed georganiseerde tuin</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
                {step.number}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold">Klaar om te beginnen?</h2>
          <p className="mb-8 text-xl opacity-90">Start vandaag nog met het beheren van je gemeenschapstuin</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/gardens/new" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Maak je eerste tuin
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600 bg-transparent"
            >
              <Link href="/gardens" className="flex items-center gap-2">
                <TreePine className="h-5 w-5" />
                Bekijk voorbeelden
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
