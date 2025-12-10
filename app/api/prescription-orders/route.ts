import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/middleware'
import { mockDb } from '@/lib/db/mock-db'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let orders = []

    if (user.role === 'pharmacy') {
      const pharmacy = mockDb.pharmacies.findByUserId(user.id)
      if (pharmacy) {
        orders = mockDb.prescriptionOrders.findByPharmacyId(pharmacy.id)
        // Join with prescriptions, patients, and doctors to include details
        orders = orders.map((order) => {
          const prescription = mockDb.prescriptions.getAll().find((p) => p.id === order.prescription_id)
          const patient = prescription
            ? mockDb.patients.getAll().find((p) => p.id === prescription.patient_id)
            : null
          const patientUser = patient ? mockDb.users.findById(patient.user_id) : null
          const doctor = prescription
            ? mockDb.doctors.getAll().find((d) => d.id === prescription.doctor_id)
            : null
          const doctorUser = doctor ? mockDb.users.findById(doctor.user_id) : null
          return {
            ...order,
            medication_name: prescription?.medication_name || 'Unknown Medication',
            dosage: prescription?.dosage || '',
            quantity: prescription?.quantity || 0,
            patient_name: patientUser?.name || 'Unknown Patient',
            doctor_name: doctorUser?.name || 'Unknown Doctor',
          }
        })
      }
    } else if (user.role === 'patient') {
      const patient = mockDb.patients.findByUserId(user.id)
      if (patient) {
        const prescriptions = mockDb.prescriptions.findByPatientId(patient.id)
        orders = mockDb.prescriptionOrders
          .getAll()
          .filter((o) => prescriptions.some((p) => p.id === o.prescription_id))
      }
    }

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user || user.role !== 'patient') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prescription_id, pharmacy_id } = body

    if (!prescription_id || !pharmacy_id) {
      return NextResponse.json(
        { error: 'Prescription ID and pharmacy ID are required' },
        { status: 400 }
      )
    }

    const order = await mockDb.prescriptionOrders.create({
      prescription_id,
      pharmacy_id,
      status: 'pending',
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user || user.role !== 'pharmacy') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { order_id, status, alternative_medicine, notes } = body

    if (!order_id || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    const pharmacy = mockDb.pharmacies.findByUserId(user.id)
    if (!pharmacy) {
      return NextResponse.json({ error: 'Pharmacy profile not found' }, { status: 404 })
    }

    const order = await mockDb.prescriptionOrders.update(order_id, {
      status,
      alternative_medicine,
      notes,
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



