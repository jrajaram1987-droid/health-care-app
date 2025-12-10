import { NextRequest } from 'next/server'
import { verifyToken } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: 'doctor' | 'patient' | 'pharmacy'
    name: string
  }
}

export function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}



