import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/middleware'
import { mockDb } from '@/lib/db/mock-db'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only doctors can view patient list
    if (user.role !== 'doctor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all patients with their user information
    const patients = mockDb.patients.getAll()
    const patientsWithUsers = patients.map((patient) => {
      const patientUser = mockDb.users.findById(patient.user_id)
      // Calculate age from date_of_birth if available
      let age: number | undefined
      if (patient.date_of_birth) {
        const birthDate = new Date(patient.date_of_birth)
        const today = new Date()
        age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
      }

      // Determine status based on recent appointments/prescriptions
      // For demo purposes, we'll use a simple status
      const recentAppointments = mockDb.appointments
        .findByPatientId(patient.id)
        .filter((apt) => apt.status === 'scheduled' || apt.status === 'in-progress')
      const status = recentAppointments.length > 0 ? 'Follow-up needed' : 'Stable'

      return {
        id: patient.id,
        name: patientUser?.name || 'Unknown Patient',
        age: age || 0,
        status,
        email: patientUser?.email,
        phone: patientUser?.phone,
        gender: patient.gender,
        blood_type: patient.blood_type,
        allergies: patient.allergies,
        chronic_conditions: patient.chronic_conditions,
      }
    })

    return NextResponse.json(patientsWithUsers)
  } catch (error) {
    console.error('Error in GET /api/patients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

