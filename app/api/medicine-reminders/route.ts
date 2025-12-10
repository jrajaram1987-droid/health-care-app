import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/middleware'
import { mockDb } from '@/lib/db/mock-db'

let initialized = false

async function ensureInitialized() {
  if (!initialized) {
    await mockDb.medicineReminders.initialize()
    initialized = true
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureInitialized()
    
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'patient') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const patient = mockDb.patients.findByUserId(user.id)
    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    const today = new Date().toISOString().split('T')[0]
    const reminders = mockDb.medicineReminders.findByPatientIdAndDate(patient.id, today)
    
    // Join with prescriptions to get medication details
    const remindersWithDetails = reminders.map((reminder) => {
      const prescription = mockDb.prescriptions.getAll().find((p) => p.id === reminder.prescription_id)
      return {
        ...reminder,
        medication_name: prescription?.medication_name || 'Unknown Medication',
        dosage: prescription?.dosage || '',
      }
    })

    return NextResponse.json(remindersWithDetails)
  } catch (error) {
    console.error('Error in GET /api/medicine-reminders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureInitialized()
    
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'patient') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, taken } = body

    if (!id || taken === undefined) {
      return NextResponse.json(
        { error: 'Reminder ID and taken status are required' },
        { status: 400 }
      )
    }

    const patient = mockDb.patients.findByUserId(user.id)
    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    const reminder = await mockDb.medicineReminders.update(id, { taken })
    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }

    // Verify the reminder belongs to this patient
    if (reminder.patient_id !== patient.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Error in PATCH /api/medicine-reminders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

