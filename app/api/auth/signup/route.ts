import { NextRequest, NextResponse } from 'next/server'
import { mockDb } from '@/lib/db/mock-db'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, phone } = body

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      )
    }

    if (!['doctor', 'patient', 'pharmacy'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = mockDb.users.findByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Create user
    const user = mockDb.users.create({
      email,
      password_hash: hashPassword(password),
      role,
      name,
      phone,
    })

    // Create role-specific profile
    if (role === 'doctor') {
      mockDb.doctors.create({
        user_id: user.id,
        license_number: `MD-${Date.now()}`,
        specialization: 'General Medicine',
      })
    } else if (role === 'patient') {
      mockDb.patients.create({
        user_id: user.id,
      })
    } else if (role === 'pharmacy') {
      mockDb.pharmacies.create({
        user_id: user.id,
        pharmacy_name: name,
        license_number: `PH-${Date.now()}`,
      })
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



