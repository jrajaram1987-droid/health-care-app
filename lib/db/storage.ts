import { promises as fs } from 'fs'
import path from 'path'
import { MedicineReminder, Appointment, Prescription, Message, PrescriptionOrder, InventoryItem } from './mock-db'

const STORAGE_DIR = path.join(process.cwd(), 'data')
const REMINDERS_FILE = path.join(STORAGE_DIR, 'medicine-reminders.json')
const APPOINTMENTS_FILE = path.join(STORAGE_DIR, 'appointments.json')
const PRESCRIPTIONS_FILE = path.join(STORAGE_DIR, 'prescriptions.json')
const MESSAGES_FILE = path.join(STORAGE_DIR, 'messages.json')
const PRESCRIPTION_ORDERS_FILE = path.join(STORAGE_DIR, 'prescription-orders.json')
const INVENTORY_FILE = path.join(STORAGE_DIR, 'inventory.json')

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
  } catch (error) {
    // Directory already exists, ignore
  }
}

// Load medicine reminders from file
export async function loadMedicineReminders(): Promise<MedicineReminder[]> {
  try {
    await ensureStorageDir()
    const data = await fs.readFile(REMINDERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // File doesn't exist yet, return empty array
    return []
  }
}

// Save medicine reminders to file
export async function saveMedicineReminders(reminders: MedicineReminder[]): Promise<void> {
  try {
    await ensureStorageDir()
    await fs.writeFile(REMINDERS_FILE, JSON.stringify(reminders, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving medicine reminders:', error)
    throw error
  }
}

// Load appointments from file
export async function loadAppointments(): Promise<Appointment[]> {
  try {
    await ensureStorageDir()
    const data = await fs.readFile(APPOINTMENTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // File doesn't exist yet, return empty array
    return []
  }
}

// Save appointments to file
export async function saveAppointments(appointments: Appointment[]): Promise<void> {
  try {
    await ensureStorageDir()
    await fs.writeFile(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving appointments:', error)
    throw error
  }
}

// Load prescriptions from file
export async function loadPrescriptions(): Promise<Prescription[]> {
  try {
    await ensureStorageDir()
    const data = await fs.readFile(PRESCRIPTIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // File doesn't exist yet, return empty array
    return []
  }
}

// Save prescriptions to file
export async function savePrescriptions(prescriptions: Prescription[]): Promise<void> {
  try {
    await ensureStorageDir()
    await fs.writeFile(PRESCRIPTIONS_FILE, JSON.stringify(prescriptions, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving prescriptions:', error)
    throw error
  }
}

// Load messages from file
export async function loadMessages(): Promise<Message[]> {
  try {
    await ensureStorageDir()
    const data = await fs.readFile(MESSAGES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // File doesn't exist yet, return empty array
    return []
  }
}

// Save messages to file
export async function saveMessages(messages: Message[]): Promise<void> {
  try {
    await ensureStorageDir()
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving messages:', error)
    throw error
  }
}

// Load prescription orders from file
export async function loadPrescriptionOrders(): Promise<PrescriptionOrder[]> {
  try {
    await ensureStorageDir()
    const data = await fs.readFile(PRESCRIPTION_ORDERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // File doesn't exist yet, return empty array
    return []
  }
}

// Save prescription orders to file
export async function savePrescriptionOrders(orders: PrescriptionOrder[]): Promise<void> {
  try {
    await ensureStorageDir()
    await fs.writeFile(PRESCRIPTION_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving prescription orders:', error)
    throw error
  }
}

// Load inventory from file
export async function loadInventory(): Promise<InventoryItem[]> {
  try {
    await ensureStorageDir()
    const data = await fs.readFile(INVENTORY_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // File doesn't exist yet, return empty array
    return []
  }
}

// Save inventory to file
export async function saveInventory(inventory: InventoryItem[]): Promise<void> {
  try {
    await ensureStorageDir()
    await fs.writeFile(INVENTORY_FILE, JSON.stringify(inventory, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving inventory:', error)
    throw error
  }
}
