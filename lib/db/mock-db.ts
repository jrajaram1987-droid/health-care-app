// Mock database for development
// In production, this would be replaced with Supabase or another database

import { 
  loadMedicineReminders, 
  saveMedicineReminders,
  loadAppointments,
  saveAppointments,
  loadPrescriptions,
  savePrescriptions,
  loadMessages,
  saveMessages,
  loadPrescriptionOrders,
  savePrescriptionOrders,
  loadInventory,
  saveInventory
} from './storage'

export interface User {
  id: string
  email: string
  password_hash: string
  role: 'doctor' | 'patient' | 'pharmacy'
  name: string
  phone?: string
  created_at: string
}

export interface Doctor {
  id: string
  user_id: string
  license_number: string
  specialization?: string
  bio?: string
  profile_image_url?: string
}

export interface Patient {
  id: string
  user_id: string
  date_of_birth?: string
  gender?: string
  blood_type?: string
  allergies?: string
  chronic_conditions?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}

export interface Pharmacy {
  id: string
  user_id: string
  pharmacy_name: string
  license_number: string
  address?: string
  phone?: string
  operating_hours?: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  created_at: string
}

export interface Prescription {
  id: string
  patient_id: string
  doctor_id: string
  medication_name: string
  dosage?: string
  frequency?: string
  duration_days?: number
  quantity?: number
  notes?: string
  created_at: string
  expires_at?: string
}

export interface PrescriptionOrder {
  id: string
  prescription_id: string
  pharmacy_id: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'ready' | 'delivered'
  alternative_medicine?: string
  notes?: string
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  is_read: boolean
  created_at: string
}

export interface MedicineReminder {
  id: string
  patient_id: string
  prescription_id: string
  reminder_time: string // TIME format (e.g., "08:00:00")
  reminder_date: string // DATE format (e.g., "2024-12-10")
  taken: boolean
  created_at: string
}

export interface InventoryItem {
  id: string
  pharmacy_id: string
  medicine_name: string
  stock: number
  unit: string // e.g., "units", "tablets", "bottles"
  low_stock_threshold: number
  created_at: string
  updated_at: string
}

// In-memory data stores
let users: User[] = []
let doctors: Doctor[] = []
let patients: Patient[] = []
let pharmacies: Pharmacy[] = []
let appointments: Appointment[] = []
let prescriptions: Prescription[] = []
let prescriptionOrders: PrescriptionOrder[] = []
let messages: Message[] = []
let medicineReminders: MedicineReminder[] = []
let inventory: InventoryItem[] = []

// Initialize with demo data
export function initializeMockData() {
  // Demo Users
  const demoUsers: User[] = [
    {
      id: 'user-1',
      email: 'doctor@demo.com',
      password_hash: 'demo123', // In production, this would be hashed
      role: 'doctor',
      name: 'Dr. Sarah Smith',
      phone: '+1234567890',
      created_at: new Date().toISOString(),
    },
    {
      id: 'user-2',
      email: 'patient@demo.com',
      password_hash: 'demo123',
      role: 'patient',
      name: 'John Doe',
      phone: '+1234567891',
      created_at: new Date().toISOString(),
    },
    {
      id: 'user-3',
      email: 'pharmacy@demo.com',
      password_hash: 'demo123',
      role: 'pharmacy',
      name: 'HealthCare Pharmacy',
      phone: '+1234567892',
      created_at: new Date().toISOString(),
    },
  ]

  users = demoUsers

  doctors = [
    {
      id: 'doctor-1',
      user_id: 'user-1',
      license_number: 'MD-12345',
      specialization: 'General Medicine',
      bio: 'Experienced general practitioner',
    },
  ]

  patients = [
    {
      id: 'patient-1',
      user_id: 'user-2',
      date_of_birth: '1980-01-15',
      gender: 'Male',
      blood_type: 'O+',
    },
  ]

  pharmacies = [
    {
      id: 'pharmacy-1',
      user_id: 'user-3',
      pharmacy_name: 'HealthCare Pharmacy',
      license_number: 'PH-12345',
      address: '123 Main St',
      phone: '+1234567892',
    },
  ]

  // Create appointments for today and future dates
  const appointmentToday = new Date()
  appointmentToday.setHours(9, 0, 0, 0) // 9:00 AM

  const today2 = new Date()
  today2.setHours(10, 30, 0, 0) // 10:30 AM

  const today3 = new Date()
  today3.setHours(14, 0, 0, 0) // 2:00 PM

  const today4 = new Date()
  today4.setHours(15, 30, 0, 0) // 3:30 PM

  appointments = [
    {
      id: 'apt-1',
      patient_id: 'patient-1',
      doctor_id: 'doctor-1',
      appointment_date: appointmentToday.toISOString(),
      status: 'scheduled',
      notes: 'General Checkup',
      created_at: new Date().toISOString(),
    },
    {
      id: 'apt-2',
      patient_id: 'patient-1',
      doctor_id: 'doctor-1',
      appointment_date: today2.toISOString(),
      status: 'scheduled',
      notes: 'Follow-up Consultation',
      created_at: new Date().toISOString(),
    },
    {
      id: 'apt-3',
      patient_id: 'patient-1',
      doctor_id: 'doctor-1',
      appointment_date: today3.toISOString(),
      status: 'scheduled',
      notes: 'Initial Visit',
      created_at: new Date().toISOString(),
    },
    {
      id: 'apt-4',
      patient_id: 'patient-1',
      doctor_id: 'doctor-1',
      appointment_date: today4.toISOString(),
      status: 'scheduled',
      notes: 'Routine Examination',
      created_at: new Date().toISOString(),
    },
    {
      id: 'apt-5',
      patient_id: 'patient-1',
      doctor_id: 'doctor-1',
      appointment_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      created_at: new Date().toISOString(),
    },
  ]

  prescriptions = [
    {
      id: 'rx-1',
      patient_id: 'patient-1',
      doctor_id: 'doctor-1',
      medication_name: 'Aspirin 500mg',
      dosage: '1 tablet',
      frequency: 'twice daily',
      duration_days: 30,
      quantity: 60,
      created_at: new Date().toISOString(),
    },
  ]
}

// Export data access functions
export const mockDb = {
  users: {
    findById: (id: string) => users.find((u) => u.id === id),
    findByEmail: (email: string) => users.find((u) => u.email === email),
    create: (user: Omit<User, 'id' | 'created_at'>) => {
      const newUser: User = {
        ...user,
        id: `user-${Date.now()}`,
        created_at: new Date().toISOString(),
      }
      users.push(newUser)
      return newUser
    },
    getAll: () => users,
  },
  doctors: {
    findByUserId: (userId: string) => doctors.find((d) => d.user_id === userId),
    getAll: () => doctors,
    create: (doctor: Omit<Doctor, 'id'>) => {
      const newDoctor: Doctor = {
        ...doctor,
        id: `doctor-${Date.now()}`,
      }
      doctors.push(newDoctor)
      return newDoctor
    },
  },
  patients: {
    findByUserId: (userId: string) => patients.find((p) => p.user_id === userId),
    getAll: () => patients,
    create: (patient: Omit<Patient, 'id'>) => {
      const newPatient: Patient = {
        ...patient,
        id: `patient-${Date.now()}`,
      }
      patients.push(newPatient)
      return newPatient
    },
  },
  pharmacies: {
    findByUserId: (userId: string) => pharmacies.find((p) => p.user_id === userId),
    getAll: () => pharmacies,
  },
  appointments: {
    findByPatientId: (patientId: string) => appointments.filter((a) => a.patient_id === patientId),
    findByDoctorId: (doctorId: string) => appointments.filter((a) => a.doctor_id === doctorId),
    findById: (id: string) => appointments.find((a) => a.id === id),
    create: async (appointment: Omit<Appointment, 'id' | 'created_at'>) => {
      const newAppointment: Appointment = {
        ...appointment,
        id: `apt-${Date.now()}`,
        created_at: new Date().toISOString(),
      }
      appointments.push(newAppointment)
      // Save to file
      await saveAppointments(appointments).catch(console.error)
      return newAppointment
    },
    update: async (id: string, updates: Partial<Appointment>) => {
      const index = appointments.findIndex((a) => a.id === id)
      if (index !== -1) {
        appointments[index] = { ...appointments[index], ...updates }
        // Save to file
        await saveAppointments(appointments).catch(console.error)
        return appointments[index]
      }
      return null
    },
    getAll: () => appointments,
    // Initialize from file (call this on server startup)
    initialize: async () => {
      try {
        const savedAppointments = await loadAppointments()
        if (savedAppointments.length > 0) {
          // Merge with existing appointments (don't overwrite demo appointments)
          const existingIds = new Set(appointments.map(a => a.id))
          savedAppointments.forEach((apt) => {
            if (!existingIds.has(apt.id)) {
              appointments.push(apt)
            } else {
              // Update existing appointment if it's been modified
              const index = appointments.findIndex(a => a.id === apt.id)
              if (index !== -1) {
                appointments[index] = apt
              }
            }
          })
        }
      } catch (error) {
        console.error('Error initializing appointments from file:', error)
      }
    },
  },
  prescriptions: {
    findByPatientId: (patientId: string) => prescriptions.filter((p) => p.patient_id === patientId),
    findByDoctorId: (doctorId: string) => prescriptions.filter((p) => p.doctor_id === doctorId),
    create: async (prescription: Omit<Prescription, 'id' | 'created_at'>) => {
      const newPrescription: Prescription = {
        ...prescription,
        id: `rx-${Date.now()}`,
        created_at: new Date().toISOString(),
      }
      prescriptions.push(newPrescription)
      // Save to file
      await savePrescriptions(prescriptions).catch(console.error)
      return newPrescription
    },
    getAll: () => prescriptions,
    // Initialize from file (call this on server startup)
    initialize: async () => {
      try {
        const savedPrescriptions = await loadPrescriptions()
        if (savedPrescriptions.length > 0) {
          // Merge with existing prescriptions
          const existingIds = new Set(prescriptions.map(p => p.id))
          savedPrescriptions.forEach((rx) => {
            if (!existingIds.has(rx.id)) {
              prescriptions.push(rx)
            } else {
              // Update existing prescription
              const index = prescriptions.findIndex(p => p.id === rx.id)
              if (index !== -1) {
                prescriptions[index] = rx
              }
            }
          })
        }
      } catch (error) {
        console.error('Error initializing prescriptions from file:', error)
      }
    },
  },
  prescriptionOrders: {
    findByPharmacyId: (pharmacyId: string) =>
      prescriptionOrders.filter((o) => o.pharmacy_id === pharmacyId),
    findByPrescriptionId: (prescriptionId: string) =>
      prescriptionOrders.filter((o) => o.prescription_id === prescriptionId),
    create: async (order: Omit<PrescriptionOrder, 'id' | 'created_at'>) => {
      const newOrder: PrescriptionOrder = {
        ...order,
        id: `ord-${Date.now()}`,
        created_at: new Date().toISOString(),
      }
      prescriptionOrders.push(newOrder)
      // Save to file
      await savePrescriptionOrders(prescriptionOrders).catch(console.error)
      return newOrder
    },
    update: async (id: string, updates: Partial<PrescriptionOrder>) => {
      const index = prescriptionOrders.findIndex((o) => o.id === id)
      if (index !== -1) {
        prescriptionOrders[index] = { ...prescriptionOrders[index], ...updates }
        // Save to file
        await savePrescriptionOrders(prescriptionOrders).catch(console.error)
        return prescriptionOrders[index]
      }
      return null
    },
    getAll: () => prescriptionOrders,
    // Initialize from file (call this on server startup)
    initialize: async () => {
      try {
        const savedOrders = await loadPrescriptionOrders()
        if (savedOrders.length > 0) {
          // Merge with existing orders
          const existingIds = new Set(prescriptionOrders.map(o => o.id))
          savedOrders.forEach((order) => {
            if (!existingIds.has(order.id)) {
              prescriptionOrders.push(order)
            } else {
              // Update existing order
              const index = prescriptionOrders.findIndex(o => o.id === order.id)
              if (index !== -1) {
                prescriptionOrders[index] = order
              }
            }
          })
        }
      } catch (error) {
        console.error('Error initializing prescription orders from file:', error)
      }
    },
  },
  messages: {
    findByUserId: (userId: string) =>
      messages.filter((m) => m.sender_id === userId || m.receiver_id === userId),
    create: async (message: Omit<Message, 'id' | 'created_at' | 'is_read'>) => {
      const newMessage: Message = {
        ...message,
        id: `msg-${Date.now()}`,
        is_read: false,
        created_at: new Date().toISOString(),
      }
      messages.push(newMessage)
      // Save to file
      await saveMessages(messages).catch(console.error)
      return newMessage
    },
    getAll: () => messages,
    // Initialize from file (call this on server startup)
    initialize: async () => {
      try {
        const savedMessages = await loadMessages()
        if (savedMessages.length > 0) {
          // Merge with existing messages
          const existingIds = new Set(messages.map(m => m.id))
          savedMessages.forEach((msg) => {
            if (!existingIds.has(msg.id)) {
              messages.push(msg)
            } else {
              // Update existing message
              const index = messages.findIndex(m => m.id === msg.id)
              if (index !== -1) {
                messages[index] = msg
              }
            }
          })
        }
      } catch (error) {
        console.error('Error initializing messages from file:', error)
      }
    },
  },
  medicineReminders: {
    findByPatientId: (patientId: string) =>
      medicineReminders.filter((r) => r.patient_id === patientId),
    findByPatientIdAndDate: (patientId: string, date: string) =>
      medicineReminders.filter((r) => r.patient_id === patientId && r.reminder_date === date),
    create: async (reminder: Omit<MedicineReminder, 'id' | 'created_at'>) => {
      const newReminder: MedicineReminder = {
        ...reminder,
        id: `reminder-${Date.now()}`,
        created_at: new Date().toISOString(),
      }
      medicineReminders.push(newReminder)
      // Save to file
      await saveMedicineReminders(medicineReminders).catch(console.error)
      return newReminder
    },
    update: async (id: string, updates: Partial<MedicineReminder>) => {
      const index = medicineReminders.findIndex((r) => r.id === id)
      if (index !== -1) {
        medicineReminders[index] = { ...medicineReminders[index], ...updates }
        // Save to file
        await saveMedicineReminders(medicineReminders).catch(console.error)
        return medicineReminders[index]
      }
      return null
    },
    getAll: () => medicineReminders,
    // Initialize from file (call this on server startup)
    initialize: async () => {
      try {
        const savedReminders = await loadMedicineReminders()
        const today = new Date().toISOString().split('T')[0]
        
        if (savedReminders.length > 0) {
          // Update existing reminders to today's date if needed, but preserve taken status for today
          const updatedReminders = savedReminders.map((reminder) => {
            if (reminder.reminder_date !== today) {
              // New day - reset taken status
              return {
                ...reminder,
                reminder_date: today,
                taken: false,
              }
            }
            // Same day - keep current status
            return reminder
          })
          medicineReminders = updatedReminders
          // Save updated reminders if date changed
          await saveMedicineReminders(updatedReminders).catch(console.error)
        } else {
          // No saved data - use current defaults and save them
          await saveMedicineReminders(medicineReminders).catch(console.error)
        }
      } catch (error) {
        console.error('Error initializing medicine reminders from file:', error)
        // Keep defaults if file loading fails
      }
    },
  },
  inventory: {
    findByPharmacyId: (pharmacyId: string) => inventory.filter((i) => i.pharmacy_id === pharmacyId),
    findById: (id: string) => inventory.find((i) => i.id === id),
    create: async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
      const newItem: InventoryItem = {
        ...item,
        id: `inv-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      inventory.push(newItem)
      // Save to file
      await saveInventory(inventory).catch(console.error)
      return newItem
    },
    update: async (id: string, updates: Partial<InventoryItem>) => {
      const index = inventory.findIndex((i) => i.id === id)
      if (index !== -1) {
        inventory[index] = {
          ...inventory[index],
          ...updates,
          updated_at: new Date().toISOString(),
        }
        // Save to file
        await saveInventory(inventory).catch(console.error)
        return inventory[index]
      }
      return null
    },
    delete: async (id: string) => {
      const index = inventory.findIndex((i) => i.id === id)
      if (index !== -1) {
        inventory.splice(index, 1)
        // Save to file
        await saveInventory(inventory).catch(console.error)
        return true
      }
      return false
    },
    getAll: () => inventory,
    // Initialize from file (call this on server startup)
    initialize: async () => {
      try {
        const savedInventory = await loadInventory()
        if (savedInventory.length > 0) {
          // Merge with existing inventory
          const existingIds = new Set(inventory.map(i => i.id))
          savedInventory.forEach((item) => {
            if (!existingIds.has(item.id)) {
              inventory.push(item)
            } else {
              // Update existing item
              const index = inventory.findIndex(i => i.id === item.id)
              if (index !== -1) {
                inventory[index] = item
              }
            }
          })
        }
      } catch (error) {
        console.error('Error initializing inventory from file:', error)
      }
    },
  },
}

// Initialize on module load
initializeMockData()

// Initialize data from files (async) - only on server side
if (typeof window === 'undefined') {
  // Initialize all persistent data from files
  Promise.all([
    mockDb.medicineReminders.initialize(),
    mockDb.appointments.initialize(),
    mockDb.prescriptions.initialize(),
    mockDb.messages.initialize(),
    mockDb.prescriptionOrders.initialize(),
    mockDb.inventory.initialize(),
  ]).catch(console.error)
}



