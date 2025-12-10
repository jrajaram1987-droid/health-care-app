"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ChevronLeft, Calendar as CalendarIcon, Pill, MessageSquare, Activity, Clock, Bell } from "lucide-react"
import { format } from "date-fns"

interface Doctor {
  id: string
  name: string
  specialization?: string
  email?: string
}

interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  status: string
  notes?: string
  created_at: string
}

interface Prescription {
  id: string
  patient_id: string
  doctor_id: string
  medication_name: string
  dosage: string
  frequency: string
  duration_days: number
  quantity: number
  notes?: string
  doctor_name?: string
  created_at: string
}

interface PrescriptionOrder {
  id: string
  prescription_id: string
  pharmacy_id: string
  status: string
  alternative_medicine?: string
  notes?: string
  created_at: string
}

interface MedicineReminder {
  id: string
  patient_id: string
  prescription_id: string
  reminder_time: string
  reminder_date: string
  taken: boolean
  medication_name?: string
  dosage?: string
  created_at: string
}

interface NotificationItem {
  id: string
  title: string
  description: string
  timeLabel: string
  type: "reminder" | "order" | "appointment"
}

export default function PatientDemo() {
  const alarmTimeouts = useRef<NodeJS.Timeout[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [orders, setOrders] = useState<PrescriptionOrder[]>([])
  const [medicineReminders, setMedicineReminders] = useState<MedicineReminder[]>([])
  const [sendingPrescriptionId, setSendingPrescriptionId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true)
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(true)
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [isLoadingReminders, setIsLoadingReminders] = useState(true)
  
  // Form state
  const [selectedDoctor, setSelectedDoctor] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  
  const { toast } = useToast()

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setIsLoadingAppointments(true)
      const response = await fetch("/api/appointments", {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to load appointments' }))
        toast({
          title: "Error",
          description: error.error || "Failed to load appointments. Please log in first.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAppointments(false)
    }
  }

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors", {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load doctors",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching doctors:", error)
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      })
    }
  }

  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    try {
      setIsLoadingPrescriptions(true)
      const response = await fetch("/api/prescriptions", {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data)
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to load prescriptions' }))
        toast({
          title: "Error",
          description: error.error || "Failed to load prescriptions. Please log in first.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
      toast({
        title: "Error",
        description: "Failed to load prescriptions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPrescriptions(false)
    }
  }

  // Fetch prescription orders
  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true)
      const response = await fetch("/api/prescription-orders", {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to load pharmacy orders' }))
        toast({
          title: "Error",
          description: error.error || "Failed to load pharmacy orders. Please log in first.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching pharmacy orders:", error)
      toast({
        title: "Error",
        description: "Failed to load pharmacy orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const clearReminderAlarms = () => {
    alarmTimeouts.current.forEach((t) => clearTimeout(t))
    alarmTimeouts.current = []
  }

  const scheduleReminderAlarms = (reminders: MedicineReminder[]) => {
    clearReminderAlarms()
    const now = new Date()

    reminders
      .filter((r) => !r.taken)
      .forEach((reminder) => {
        try {
          const target = new Date(`${reminder.reminder_date}T${reminder.reminder_time}`)
          if (isNaN(target.getTime())) return
          const delay = target.getTime() - now.getTime()
          if (delay <= 0 || delay > 24 * 60 * 60 * 1000) {
            return // skip past reminders or ones too far away
          }
          const timeoutId = setTimeout(() => {
            toast({
              title: "Medicine Reminder",
              description: `${reminder.medication_name || "Medication"} — ${reminder.dosage || ""} time to take now.`,
            })
          }, delay)
          alarmTimeouts.current.push(timeoutId)
        } catch {
          // ignore invalid dates
        }
      })
  }

  // Fetch medicine reminders
  const fetchMedicineReminders = async () => {
    try {
      setIsLoadingReminders(true)
      const response = await fetch("/api/medicine-reminders", {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setMedicineReminders(data)
        scheduleReminderAlarms(data)
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to load medicine reminders' }))
        toast({
          title: "Error",
          description: error.error || "Failed to load medicine reminders. Please log in first.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching medicine reminders:", error)
      toast({
        title: "Error",
        description: "Failed to load medicine reminders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingReminders(false)
    }
  }

  // Mark reminder as taken
  const markReminderAsTaken = async (reminderId: string) => {
    try {
      const response = await fetch("/api/medicine-reminders", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: reminderId,
          taken: true,
        }),
      })
      if (response.ok) {
        toast({
          title: "Success!",
          description: "Medicine reminder marked as taken",
        })
        // Refresh reminders
        fetchMedicineReminders()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update reminder",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error marking reminder as taken:", error)
      toast({
        title: "Error",
        description: "Failed to update reminder. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Format reminder time for display
  const formatReminderTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":")
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? "PM" : "AM"
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    } catch {
      return timeString
    }
  }

  // Get doctor name by ID (needed before notifications builder)
  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    return doctor?.name || "Unknown Doctor"
  }

  // Build notifications for reminders, ready orders, and soon appointments
  const notifications: NotificationItem[] = [
    ...medicineReminders
      .filter((r) => !r.taken)
      .map((r) => ({
        id: `reminder-${r.id}`,
        title: r.medication_name || "Medicine Reminder",
        description: `${r.dosage || ""} due at ${formatReminderTime(r.reminder_time)}`,
        timeLabel: r.reminder_date,
        type: "reminder" as const,
      })),
    ...medicineReminders
      .filter((r) => {
        const target = new Date(`${r.reminder_date}T${r.reminder_time}`)
        const diff = target.getTime() - Date.now()
        return !r.taken && !isNaN(target.getTime()) && diff > 0 && diff <= 24 * 60 * 60 * 1000
      })
      .map((r) => ({
        id: `alarm-${r.id}`,
        title: "Alarm scheduled",
        description: `${r.medication_name || "Medication"} at ${formatReminderTime(r.reminder_time)}`,
        timeLabel: r.reminder_date,
        type: "reminder" as const,
      })),
    ...orders
      .filter((o) => o.status === "ready")
      .map((o) => ({
        id: `order-${o.id}`,
        title: "Pharmacy order ready",
        description: `Order is ready for pickup/delivery (status: ${o.status})`,
        timeLabel: o.created_at ? format(new Date(o.created_at), "MMM d, h:mm a") : "",
        type: "order" as const,
      })),
    ...appointments
      .filter((a) => {
        const dt = new Date(a.appointment_date)
        const diff = dt.getTime() - Date.now()
        return diff >= 0 && diff <= 24 * 60 * 60 * 1000 // within 24h
      })
      .map((a) => ({
        id: `appt-${a.id}`,
        title: "Upcoming appointment",
        description: `${getDoctorName(a.doctor_id)} at ${formatAppointmentTime(a.appointment_date)}`,
        timeLabel: formatAppointmentDate(a.appointment_date),
        type: "appointment" as const,
      })),
  ].sort((a, b) => a.timeLabel.localeCompare(b.timeLabel))

  useEffect(() => {
    fetchAppointments()
    fetchDoctors()
    fetchPrescriptions()
    fetchOrders()
    fetchMedicineReminders()
    return () => clearReminderAlarms()
  }, [])

  // Handle appointment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Combine date and time into ISO string
    const [hours, minutes] = selectedTime.split(":")
    const appointmentDateTime = new Date(selectedDate)
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    
    // Check if date is in the past
    if (appointmentDateTime < new Date()) {
      toast({
        title: "Invalid Date",
        description: "Please select a future date and time",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          doctor_id: selectedDoctor,
          appointment_date: appointmentDateTime.toISOString(),
          notes: notes || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Appointment scheduled successfully",
        })
        // Reset form
        setSelectedDoctor("")
        setSelectedDate(undefined)
        setSelectedTime("")
        setNotes("")
        setIsDialogOpen(false)
        // Refresh appointments
        fetchAppointments()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to schedule appointment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error scheduling appointment:", error)
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format appointment date for display
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "MMM d, yyyy")
  }

  // Format appointment time for display
  const formatAppointmentTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "h:mm a")
  }

  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "MMM d, yyyy h:mm a")
  }

  const getPrescriptionById = (id: string) => prescriptions.find((p) => p.id === id)

  // Send prescription to pharmacy (demo default pharmacy)
  const sendPrescriptionToPharmacy = async (prescriptionId: string) => {
    try {
      setSendingPrescriptionId(prescriptionId)
      const defaultPharmacyId = "pharmacy-1"
      const response = await fetch("/api/prescription-orders", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prescription_id: prescriptionId,
          pharmacy_id: defaultPharmacyId,
        }),
      })
      if (response.ok) {
        toast({
          title: "Sent to pharmacy",
          description: "Your prescription was sent successfully.",
        })
        fetchOrders()
      } else {
        const error = await response.json().catch(() => ({ error: "Failed to send prescription" }))
        toast({
          title: "Error",
          description: error.error || "Failed to send prescription to pharmacy",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending prescription:", error)
      toast({
        title: "Error",
        description: "Failed to send prescription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSendingPrescriptionId(null)
    }
  }

  // Get next appointment date for stats
  const nextAppointment = appointments
    .filter((apt) => apt.status === "scheduled")
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-primary">Patient Dashboard</h1>
              <p className="text-sm text-muted-foreground">Demo Account - John Doe</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Role: Patient</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Prescriptions</p>
                  <p className="text-3xl font-bold text-right">{prescriptions.length}</p>
                </div>
                <Pill className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Appointment</p>
                  <p className="text-3xl font-bold text-right">
                    {nextAppointment ? format(new Date(nextAppointment.appointment_date), "MMM d") : "None"}
                  </p>
                </div>
                <CalendarIcon className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pharmacy Orders</p>
                  <p className="text-3xl font-bold text-right">{orders.length}</p>
                </div>
                <Activity className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <p className="text-3xl font-bold text-right">5</p>
                </div>
                <MessageSquare className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="pharmacy">Pharmacy Orders</TabsTrigger>
            <TabsTrigger value="reminders">Medicine Reminders</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Book New Appointment</CardTitle>
                <CardDescription>Schedule an appointment with your doctor</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto">Schedule Appointment</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Schedule New Appointment</DialogTitle>
                      <DialogDescription>
                        Fill in the details to book an appointment with your doctor
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="doctor">Doctor *</Label>
                        <Select value={selectedDoctor} onValueChange={setSelectedDoctor} required>
                          <SelectTrigger id="doctor" className="w-full">
                            <SelectValue placeholder="Select a doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.length === 0 ? (
                              <SelectItem value="loading" disabled>Loading doctors...</SelectItem>
                            ) : (
                              doctors.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  {doctor.name} {doctor.specialization && `- ${doctor.specialization}`}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              id="date"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time">Time *</Label>
                        <Input
                          id="time"
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any additional information or concerns..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Scheduling..." : "Schedule Appointment"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-semibold">Upcoming Appointments</h3>
              {isLoadingAppointments ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Loading appointments...</p>
                  </CardContent>
                </Card>
              ) : appointments.filter((apt) => apt.status === "scheduled").length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">No upcoming appointments scheduled</p>
                  </CardContent>
                </Card>
              ) : (
                appointments
                  .filter((apt) => apt.status === "scheduled")
                  .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
                  .map((apt) => (
                    <Card key={apt.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <CalendarIcon className="w-4 h-4 text-primary" />
                              <span className="font-semibold">{formatAppointmentDate(apt.appointment_date)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{getDoctorName(apt.doctor_id)}</p>
                            {apt.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{apt.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-primary block">{formatAppointmentTime(apt.appointment_date)}</span>
                            <span className="text-xs text-muted-foreground capitalize">{apt.status}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            <h3 className="font-semibold">Active Prescriptions</h3>
            {isLoadingPrescriptions ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Loading prescriptions...</p>
                </CardContent>
              </Card>
            ) : prescriptions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">No active prescriptions yet</p>
                </CardContent>
              </Card>
            ) : (
              prescriptions.map((rx) => (
                <Card key={rx.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{rx.medication_name}</h4>
                        <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                          {rx.duration_days} days
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Prescribed by: {rx.doctor_name || "Unknown Doctor"}
                      </p>
                      <p className="text-sm text-muted-foreground">Dosage: {rx.dosage}</p>
                      <p className="text-sm text-muted-foreground">Frequency: {rx.frequency}</p>
                      {rx.quantity && (
                        <p className="text-sm text-muted-foreground">Quantity: {rx.quantity}</p>
                      )}
                      {rx.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">Notes: {rx.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Prescribed on: {format(new Date(rx.created_at), "MMM d, yyyy")}
                      </p>
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendPrescriptionToPharmacy(rx.id)}
                          disabled={sendingPrescriptionId === rx.id}
                        >
                          {sendingPrescriptionId === rx.id ? "Sending..." : "Send to Pharmacy"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="pharmacy" className="space-y-4">
            <h3 className="font-semibold">Pharmacy Orders</h3>
            {isLoadingOrders ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Loading pharmacy orders...</p>
                </CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">No pharmacy orders yet</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((ord) => {
                const rx = getPrescriptionById(ord.prescription_id)
                return (
                  <Card key={ord.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold">
                            {rx?.medication_name || "Prescription Order"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Status: <span className="capitalize">{ord.status}</span>
                          </p>
                          {rx && (
                            <p className="text-sm text-muted-foreground">
                              Prescribed by: {rx.doctor_name || "Unknown Doctor"}
                            </p>
                          )}
                          {ord.alternative_medicine && (
                            <p className="text-sm text-muted-foreground">
                              Alternative: {ord.alternative_medicine}
                            </p>
                          )}
                          {ord.notes && (
                            <p className="text-sm text-muted-foreground italic">
                              Notes: {ord.notes}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Created: {formatOrderDate(ord.created_at)}
                          </p>
                        </div>
                        <span
                          className={`text-sm px-3 py-1 rounded-full ${
                            ord.status === "delivered" || ord.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : ord.status === "ready"
                                ? "bg-blue-100 text-blue-700"
                                : ord.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <h3 className="font-semibold">Today's Medicine Reminders</h3>
            {isLoadingReminders ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Loading medicine reminders...</p>
                </CardContent>
              </Card>
            ) : medicineReminders.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">No medicine reminders for today</p>
                </CardContent>
              </Card>
            ) : (
              medicineReminders
                .sort((a, b) => a.reminder_time.localeCompare(b.reminder_time))
                .map((reminder) => (
                  <Card key={reminder.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-primary" />
                          <div>
                            <h4 className="font-semibold">{formatReminderTime(reminder.reminder_time)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {reminder.medication_name || "Unknown Medication"} • {reminder.dosage || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm px-3 py-1 rounded-full ${
                              reminder.taken
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {reminder.taken ? "Taken" : "Pending"}
                          </span>
                          {!reminder.taken && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markReminderAsTaken(reminder.id)}
                            >
                              Mark as Taken
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <h3 className="font-semibold">Notifications</h3>
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">No notifications right now.</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((note) => (
                <Card key={note.id}>
                  <CardContent className="pt-6 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Bell className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{note.title}</h4>
                        <p className="text-sm text-muted-foreground">{note.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{note.timeLabel}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        note.type === "reminder"
                          ? "bg-blue-100 text-blue-700"
                          : note.type === "order"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {note.type}
                    </span>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
