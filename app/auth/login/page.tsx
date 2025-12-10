'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'patient' | 'pharmacy' | ''>('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleRoleSelect = (role: 'doctor' | 'patient' | 'pharmacy') => {
    setSelectedRole(role)
    // Prefill demo email for convenience if the field is empty
    if (!email) {
      if (role === 'doctor') setEmail('doctor@demo.com')
      if (role === 'patient') setEmail('patient@demo.com')
      if (role === 'pharmacy') setEmail('pharmacy@demo.com')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) {
      toast.error('Please choose your role to continue')
      return
    }
    setLoading(true)

    try {
      await login(email, password)
      toast.success('Login successful!')
      router.push(getDashboardPath())
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const getDashboardPath = () => {
    // Prefer the selected role, fallback to email for demo accounts
    if (selectedRole === 'doctor') return '/demo/doctor'
    if (selectedRole === 'pharmacy') return '/demo/pharmacy'
    if (selectedRole === 'patient') return '/demo/patient'
    if (email === 'doctor@demo.com') return '/demo/doctor'
    if (email === 'pharmacy@demo.com') return '/demo/pharmacy'
    return '/demo/patient'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            <Label>Select your role</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                type="button"
                variant={selectedRole === 'doctor' ? 'default' : 'outline'}
                onClick={() => handleRoleSelect('doctor')}
              >
                Doctor
              </Button>
              <Button
                type="button"
                variant={selectedRole === 'patient' ? 'default' : 'outline'}
                onClick={() => handleRoleSelect('patient')}
              >
                Patient
              </Button>
              <Button
                type="button"
                variant={selectedRole === 'pharmacy' ? 'default' : 'outline'}
                onClick={() => handleRoleSelect('pharmacy')}
              >
                Pharmacy
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Demo accounts:</p>
            <p className="mt-2 space-y-1">
              <span className="block">doctor@demo.com / demo123</span>
              <span className="block">patient@demo.com / demo123</span>
              <span className="block">pharmacy@demo.com / demo123</span>
            </p>
          </div>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/auth/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




