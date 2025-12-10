// Simple authentication utilities
// In production, use proper JWT or session management

export interface AuthUser {
  id: string
  email: string
  role: 'doctor' | 'patient' | 'pharmacy'
  name: string
}

// Simple token generation (in production, use proper JWT)
export function generateToken(user: AuthUser): string {
  // Simple base64 encoding for demo (NOT secure for production)
  return Buffer.from(JSON.stringify(user)).toString('base64')
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    return JSON.parse(decoded) as AuthUser
  } catch {
    return null
  }
}

export function hashPassword(password: string): string {
  // Simple hash for demo (in production, use bcrypt)
  return password // For demo, we'll just store plain text
}

export function verifyPassword(password: string, hash: string): boolean {
  // Simple verification for demo
  return password === hash
}



