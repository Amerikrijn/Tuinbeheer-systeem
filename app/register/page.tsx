"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Simulated invitation codes
const validInvitations = [
  { code: "GARDEN2024", adminName: "Garden Admin", expires: "2024-12-31" },
  { code: "VOLUNTEER2024", adminName: "Garden Admin", expires: "2024-12-31" },
  { code: "SPRING2024", adminName: "Garden Admin", expires: "2024-06-30" },
]

export default function RegisterPage() {
  const [invitationCode, setInvitationCode] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isValidInvitation, setIsValidInvitation] = useState(false)
  const [invitationDetails, setInvitationDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const validateInvitation = () => {
    const invitation = validInvitations.find((inv) => inv.code === invitationCode.toUpperCase())

    if (invitation) {
      const expiryDate = new Date(invitation.expires)
      const today = new Date()

      if (expiryDate > today) {
        setIsValidInvitation(true)
        setInvitationDetails(invitation)
        toast({
          title: "Valid Invitation",
          description: `Invitation from ${invitation.adminName} verified!`,
        })
      } else {
        toast({
          title: "Expired Invitation",
          description: "This invitation code has expired.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Invalid Invitation",
        description: "Please check your invitation code and try again.",
        variant: "destructive",
      })
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, this would create the user in the database
    const newUser = {
      id: Date.now(),
      email,
      name,
      role: "volunteer",
      invitedBy: invitationDetails.adminName,
      registeredAt: new Date().toISOString(),
    }

    toast({
      title: "Registration Successful",
      description: "Your account has been created! You can now sign in.",
    })

    router.push("/login")
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <Leaf className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-700">Join Garden Volunteers</CardTitle>
          <CardDescription>Register with your invitation code</CardDescription>
        </CardHeader>
        <CardContent>
          {!isValidInvitation ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="invitation-code">Invitation Code</Label>
                <Input
                  id="invitation-code"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  placeholder="Enter your invitation code"
                  required
                />
              </div>
              <Button onClick={validateInvitation} className="w-full bg-green-600 hover:bg-green-700">
                Validate Invitation
              </Button>

              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Demo Invitation Codes:</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>GARDEN2024</strong> - General invitation
                  </p>
                  <p>
                    <strong>VOLUNTEER2024</strong> - Volunteer invitation
                  </p>
                  <p>
                    <strong>SPRING2024</strong> - Spring season invitation
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-700">Invitation Verified</p>
                  <p className="text-xs text-green-600">Invited by {invitationDetails.adminName}</p>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 6 characters)"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
