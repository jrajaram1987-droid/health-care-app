import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/middleware'
import { mockDb } from '@/lib/db/mock-db'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let prescriptions: any[] = []

    if (user.role === 'patient') {
      const patient = mockDb.patients.findByUserId(user.id)
      if (patient) {
        prescriptions = mockDb.prescriptions.findByPatientId(patient.id)
        // Join with doctors to include doctor_name
        prescriptions = prescriptions.map((rx) => {
          const doctor = mockDb.doctors.getAll().find((d) => d.id === rx.doctor_id)
          const doctorUser = doctor ? mockDb.users.findById(doctor.user_id) : null
          return {
            ...rx,
            doctor_name: doctorUser?.name || 'Unknown Doctor',
          }
        })
      }
    } else if (user.role === 'doctor') {
      const doctor = mockDb.doctors.findByUserId(user.id)
      if (doctor) {
        prescriptions = mockDb.prescriptions.findByDoctorId(doctor.id)
        // Join with patients to include patient_name
        prescriptions = prescriptions.map((rx) => {
          const patient = mockDb.patients.getAll().find((p) => p.id === rx.patient_id)
          const patientUser = patient ? mockDb.users.findById(patient.user_id) : null
          return {
            ...rx,
            patient_name: patientUser?.name || 'Unknown Patient',
          }
        })
      }
    }

    return NextResponse.json(prescriptions)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { patient_id, medication_name, dosage, frequency, duration_days, quantity, notes } =
      body

    if (!patient_id || !medication_name) {
      return NextResponse.json(
        { error: 'Patient ID and medication name are required' },
        { status: 400 }
      )
    }

    const doctor = mockDb.doctors.findByUserId(user.id)
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const prescription = await mockDb.prescriptions.create({
      patient_id,
      doctor_id: doctor.id,
      medication_name,
      dosage,
      frequency,
      duration_days,
      quantity,
      notes,
    })

    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



