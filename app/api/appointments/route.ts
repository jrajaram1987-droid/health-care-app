import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/middleware'
import { mockDb } from '@/lib/db/mock-db'

let initialized = false

async function ensureInitialized() {
  if (!initialized) {
    await mockDb.appointments.initialize()
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

    let appointments = []

    if (user.role === 'patient') {
      const patient = mockDb.patients.findByUserId(user.id)
      if (patient) {
        appointments = mockDb.appointments.findByPatientId(patient.id)
        // Join with doctors to include doctor_name
        appointments = appointments.map((apt) => {
          const doctor = mockDb.doctors.getAll().find((d) => d.id === apt.doctor_id)
          const doctorUser = doctor ? mockDb.users.findById(doctor.user_id) : null
          return {
            ...apt,
            doctor_name: doctorUser?.name || 'Unknown Doctor',
          }
        })
      }
    } else if (user.role === 'doctor') {
      const doctor = mockDb.doctors.findByUserId(user.id)
      if (doctor) {
        appointments = mockDb.appointments.findByDoctorId(doctor.id)
        // Join with patients to include patient_name
        appointments = appointments.map((apt) => {
          const patient = mockDb.patients.getAll().find((p) => p.id === apt.patient_id)
          const patientUser = patient ? mockDb.users.findById(patient.user_id) : null
          return {
            ...apt,
            patient_name: patientUser?.name || 'Unknown Patient',
          }
        })
      }
    }

    // Ensure demo appointments are for today
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    const demoAppointmentIds = ['apt-1', 'apt-2', 'apt-3', 'apt-4']
    const updates: Promise<any>[] = []
    
    appointments.forEach((apt) => {
      if (demoAppointmentIds.includes(apt.id)) {
        const aptDate = new Date(apt.appointment_date)
        const aptDateStr = aptDate.toISOString().split('T')[0]
        
        if (aptDateStr !== todayStr) {
          // Update appointment date to today with different times
          const hours = [9, 10, 14, 15][demoAppointmentIds.indexOf(apt.id)]
          const newDate = new Date(today)
          newDate.setHours(hours, 0, 0, 0)
          
          updates.push(
            mockDb.appointments.update(apt.id, {
              appointment_date: newDate.toISOString(),
            })
          )
        }
      }
    })
    
    if (updates.length > 0) {
      await Promise.all(updates)
      // Refetch appointments after update
      if (user.role === 'doctor') {
        const doctor = mockDb.doctors.findByUserId(user.id)
        if (doctor) {
          appointments = mockDb.appointments.findByDoctorId(doctor.id)
          appointments = appointments.map((apt) => {
            const patient = mockDb.patients.getAll().find((p) => p.id === apt.patient_id)
            const patientUser = patient ? mockDb.users.findById(patient.user_id) : null
            return {
              ...apt,
              patient_name: patientUser?.name || 'Unknown Patient',
            }
          })
        }
      }
    }

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error in GET /api/appointments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized()
    
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { doctor_id, appointment_date, notes } = body

    if (!doctor_id || !appointment_date) {
      return NextResponse.json(
        { error: 'Doctor ID and appointment date are required' },
        { status: 400 }
      )
    }

    const patient = mockDb.patients.findByUserId(user.id)
    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    const appointment = await mockDb.appointments.create({
      patient_id: patient.id,
      doctor_id,
      appointment_date,
      status: 'scheduled',
      notes,
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/appointments:', error)
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

    const body = await request.json()
    const { id, status, notes } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Appointment ID and status are required' },
        { status: 400 }
      )
    }

    // Verify the appointment belongs to this user
    const appointment = mockDb.appointments.findById(id)
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    if (user.role === 'doctor') {
      const doctor = mockDb.doctors.findByUserId(user.id)
      if (!doctor || appointment.doctor_id !== doctor.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    } else if (user.role === 'patient') {
      const patient = mockDb.patients.findByUserId(user.id)
      if (!patient || appointment.patient_id !== patient.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    const updatedAppointment = await mockDb.appointments.update(id, {
      status: status as any,
      notes: notes || appointment.notes,
    })

    if (!updatedAppointment) {
      return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
    }

    // Join with patient/doctor names for response
    const patient = mockDb.patients.getAll().find((p) => p.id === updatedAppointment.patient_id)
    const patientUser = patient ? mockDb.users.findById(patient.user_id) : null
    const doctor = mockDb.doctors.getAll().find((d) => d.id === updatedAppointment.doctor_id)
    const doctorUser = doctor ? mockDb.users.findById(doctor.user_id) : null

    return NextResponse.json({
      ...updatedAppointment,
      patient_name: patientUser?.name || 'Unknown Patient',
      doctor_name: doctorUser?.name || 'Unknown Doctor',
    })
  } catch (error) {
    console.error('Error in PATCH /api/appointments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
