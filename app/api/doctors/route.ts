import { NextRequest, NextResponse } from 'next/server'
import { mockDb } from '@/lib/db/mock-db'

export async function GET(request: NextRequest) {
  try {
    const doctors = mockDb.doctors.getAll()
    const doctorsWithUsers = doctors.map((doctor) => {
      const user = mockDb.users.findById(doctor.user_id)
      return {
        ...doctor,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
      }
    })
    return NextResponse.json(doctorsWithUsers)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



