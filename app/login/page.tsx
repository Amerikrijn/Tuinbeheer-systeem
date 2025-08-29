"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, Mail, Lock, LogIn, Flower, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"
import { LanguageSwitcher } from "@/components/language-switcher"
import { t } from "@/lib/translations"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock authentication with secure validation
      if (email === "admin@garden.com" && password === "admin") {
        const user = {
          id: 1,
          email: "admin@garden.com",
          name: "Admin",
          role: "admin" as const,
        }
        localStorage.setItem("currentUser", JSON.stringify(user))
        router.push("/admin")
      } else if (email === "volunteer@garden.com" && password === "volunteer") {
        const user = {
          id: 2,
          email: "volunteer@garden.com",
          name: "Volunteer",
          role: "volunteer" as const,
        }
        localStorage.setItem("currentUser", JSON.stringify(user))
        router.push("/")
      } else {
        toast({
          title: language === "nl" ? "Inloggen mislukt" : "Login failed",
          description: language === "nl" ? "Onjuiste email of wachtwoord." : "Incorrect email or password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: language === "nl" ? "Fout" : "Error",
        description:
          language === "nl" ? "Er is een fout opgetreden bij het inloggen." : "An error occurred while logging in.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-green-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-pink-200 opacity-20">
          <Flower className="h-16 w-16 animate-pulse" />
        </div>
        <div className="absolute top-20 right-20 text-green-200 opacity-20">
          <Leaf className="h-20 w-20 animate-bounce" />
        </div>
        <div className="absolute bottom-20 left-20 text-blue-200 opacity-20">
          <Sparkles className="h-12 w-12 animate-spin" />
        </div>
        <div className="absolute bottom-10 right-10 text-purple-200 opacity-20">
          <Flower className="h-14 w-14 animate-pulse" />
        </div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Leaf className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            {t("garden.volunteers", language)}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {language === "nl"
              ? "Log in om toegang te krijgen tot het tuinbeheer systeem"
              : "Log in to access the garden management system"}
          </CardDescription>
          <div className="flex justify-center mt-4">
            <LanguageSwitcher />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                {language === "nl" ? "E-mail" : "Email"}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === "nl" ? "je@email.nl" : "your@email.com"}
                  className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                {language === "nl" ? "Wachtwoord" : "Password"}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {language === "nl" ? "Inloggen..." : "Logging in..."}
                </div>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  {t("login", language)}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-gray-800 mb-3 text-center">
              {language === "nl" ? "Demo Accounts:" : "Demo Accounts:"}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div>
                  <strong className="text-green-700">{language === "nl" ? "Beheerder:" : "Admin:"}</strong>
                  <div className="text-gray-600">admin@garden.com / admin</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEmail("admin@garden.com")
                    setPassword("admin")
                  }}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  {language === "nl" ? "Gebruik" : "Use"}
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div>
                  <strong className="text-blue-700">{language === "nl" ? "Vrijwilliger:" : "Volunteer:"}</strong>
                  <div className="text-gray-600">volunteer@garden.com / volunteer</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEmail("volunteer@garden.com")
                    setPassword("volunteer")
                  }}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {language === "nl" ? "Gebruik" : "Use"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
