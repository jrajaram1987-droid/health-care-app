"use client"

import { useState, useEffect } from "react"
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
import { ChevronLeft, Calendar as CalendarIcon, Pill, MessageSquare, Activity, Clock } from "lucide-react"
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

export default function PatientDemo() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true)
  
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

  useEffect(() => {
    fetchAppointments()
    fetchDoctors()
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

  // Get doctor name by ID
  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    return doctor?.name || "Unknown Doctor"
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
                  <p className="text-3xl font-bold">3</p>
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
                  <p className="text-3xl font-bold">
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
                  <p className="text-3xl font-bold">2</p>
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
                  <p className="text-3xl font-bold">5</p>
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
            {[
              {
                id: "RX-001",
                medicine: "Aspirin 500mg",
                doctor: "Dr. Sarah Smith",
                dosage: "1 tablet twice daily",
                days: 30,
              },
              {
                id: "RX-002",
                medicine: "Metformin 850mg",
                doctor: "Dr. Ahmed Hassan",
                dosage: "1 tablet after meals",
                days: 60,
              },
              {
                id: "RX-003",
                medicine: "Vitamin D3 1000IU",
                doctor: "Dr. Sarah Smith",
                dosage: "1 capsule daily",
                days: 90,
              },
            ].map((rx) => (
              <Card key={rx.id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{rx.medicine}</h4>
                      <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">{rx.days} days</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Prescribed by: {rx.doctor}</p>
                    <p className="text-sm text-muted-foreground">Dosage: {rx.dosage}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pharmacy" className="space-y-4">
            <h3 className="font-semibold">Pharmacy Orders</h3>
            {[
              { order: "ORD-001", status: "Delivered", date: "Dec 5", items: 2 },
              { order: "ORD-002", status: "Ready for Pickup", date: "Dec 8", items: 3 },
              { order: "ORD-003", status: "Processing", date: "Dec 9", items: 1 },
            ].map((ord) => (
              <Card key={ord.order}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{ord.order}</h4>
                      <p className="text-sm text-muted-foreground">
                        {ord.date} • {ord.items} items
                      </p>
                    </div>
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        ord.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : ord.status === "Ready for Pickup"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <h3 className="font-semibold">Today's Medicine Reminders</h3>
            {[
              { time: "8:00 AM", medicine: "Aspirin 500mg", dosage: "1 tablet", status: "Completed" },
              { time: "12:00 PM", medicine: "Metformin 850mg", dosage: "1 tablet", status: "Completed" },
              { time: "8:00 PM", medicine: "Aspirin 500mg", dosage: "1 tablet", status: "Pending" },
              { time: "9:00 PM", medicine: "Vitamin D3 1000IU", dosage: "1 capsule", status: "Pending" },
            ].map((reminder, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">{reminder.time}</h4>
                        <p className="text-sm text-muted-foreground">
                          {reminder.medicine} • {reminder.dosage}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        reminder.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {reminder.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
