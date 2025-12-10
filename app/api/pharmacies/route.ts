import { NextRequest, NextResponse } from 'next/server'
import { mockDb } from '@/lib/db/mock-db'

export async function GET(request: NextRequest) {
  try {
    const pharmacies = mockDb.pharmacies.getAll()
    const pharmaciesWithUsers = pharmacies.map((pharmacy) => {
      const user = mockDb.users.findById(pharmacy.user_id)
      return {
        ...pharmacy,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
      }
    })
    return NextResponse.json(pharmaciesWithUsers)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

