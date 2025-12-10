"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ChevronLeft, Users, Calendar, FileText, MessageSquare, Clock, Search, X, Mail, Phone, Heart, AlertTriangle, CheckCircle2, PlayCircle, RefreshCw, Plus } from "lucide-react"
import { format } from "date-fns"

interface CountUpProps {
  value: number | null | undefined
  duration?: number
}

function CountUp({ value, duration = 800 }: CountUpProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value == null || Number.isNaN(value)) {
      setDisplay(0)
      return
    }
    const start = 0
    const end = Math.max(0, value)
    const startTime = performance.now()
    let raf: number | undefined

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const current = Math.round(start + (end - start) * progress)
      setDisplay(current)
      if (progress < 1) {
        raf = requestAnimationFrame(step)
      }
    }

    raf = requestAnimationFrame(step)
    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [value, duration])

  return <span>{value == null ? "-" : display}</span>
}

interface Patient {
  id: string
  name: string
  age: number
  status: string
  email?: string
  phone?: string
  gender?: string
  blood_type?: string
  allergies?: string
  chronic_conditions?: string
}

interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  created_at: string
  patient_name?: string
}

interface Prescription {
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
  patient_name?: string
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  is_read: boolean
  created_at: string
  sender_name?: string
  receiver_name?: string
}

export default function DoctorDemo() {
  const [searchQuery, setSearchQuery] = useState("")
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true)
  const [startingAppointmentId, setStartingAppointmentId] = useState<string | null>(null)
  const [completingAppointmentId, setCompletingAppointmentId] = useState<string | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(true)
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false)
  const [isCreatingPrescription, setIsCreatingPrescription] = useState(false)
  const [sendingPrescriptionId, setSendingPrescriptionId] = useState<string | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [medicationName, setMedicationName] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequency, setFrequency] = useState("")
  const [durationDays, setDurationDays] = useState<string>("")
  const [quantity, setQuantity] = useState<string>("")
  const [prescriptionNotes, setPrescriptionNotes] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false)
  const [newPatientName, setNewPatientName] = useState("")
  const [newPatientAge, setNewPatientAge] = useState<string>("")
  const [newPatientStatus, setNewPatientStatus] = useState("Active")
  const [newPatientEmail, setNewPatientEmail] = useState("")
  const [newPatientPhone, setNewPatientPhone] = useState("")
  const [isSavingPatient, setIsSavingPatient] = useState(false)
  const { toast } = useToast()

  // Handle view patient details
  const handleViewPatient = (patient: Patient, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation() // Prevent card click event
    }
    setSelectedPatient(patient)
    setIsViewDialogOpen(true)
  }

  // Helper to get auth headers (auto-seed demo token if missing)
  const getAuthHeaders = () => {
    const getDemoDoctorToken = () => {
      const demoUser = {
        id: 'user-1',
        email: 'doctor@demo.com',
        role: 'doctor' as const,
        name: 'Dr. Sarah Smith',
      }
      try {
        return typeof window !== 'undefined'
          ? btoa(unescape(encodeURIComponent(JSON.stringify(demoUser))))
          : null
      } catch {
        return null
      }
    }

    const ensureAuthToken = () => {
      if (typeof window === 'undefined') return null
      let token = localStorage.getItem('auth_token')
      if (!token) {
        token = getDemoDoctorToken()
        if (token) localStorage.setItem('auth_token', token)
      }
      return token
    }

    const token = ensureAuthToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setIsLoadingPatients(true)
      const response = await fetch("/api/patients", {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setAllPatients(data)
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to load patients' }))
        toast({
          title: "Error",
          description: error.error || "Failed to load patients. Please log in first.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast({
        title: "Error",
        description: "Failed to load patients. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPatients(false)
    }
  }

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients()
  }, [])

  // When patients load, preselect first for convenience
  useEffect(() => {
    if (allPatients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(allPatients[0].id)
    }
  }, [allPatients, selectedPatientId])

  // Fetch appointments from API
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

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments()
  }, [])

  // Fetch prescriptions from API
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

  // Send prescription to pharmacy (demo: default pharmacy)
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
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to send prescription" }))
        throw new Error(error.error || "Failed to send prescription to pharmacy")
      }
      toast({
        title: "Sent to pharmacy",
        description: "Prescription sent successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send prescription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSendingPrescriptionId(null)
    }
  }

  // Fetch prescriptions on component mount
  useEffect(() => {
    fetchPrescriptions()
  }, [])

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      setIsLoadingMessages(true)
      const response = await fetch("/api/messages", {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to load messages' }))
        toast({
          title: "Error",
          description: error.error || "Failed to load messages. Please log in first.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages()
  }, [])

  // Filter messages for doctor (messages where doctor is receiver)
  // For demo, doctor user ID is 'user-1' (from mock-db)
  const doctorMessages = useMemo(() => {
    // Filter messages where doctor is the receiver (patient sent to doctor)
    // Doctor user ID in demo is 'user-1'
    return messages.filter((msg) => {
      // Show messages where doctor is receiver OR sender (to see conversation)
      // But prioritize showing messages where doctor is receiver (incoming messages)
      return msg.receiver_id === 'user-1' || msg.sender_id === 'user-1'
    }).sort((a, b) => {
      // Sort by created_at, newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [messages])

  // Format message time
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return format(date, "MMM d, yyyy")
  }

  // Get sender name (for display in message list)
  const getSenderName = (message: Message) => {
    // If doctor is receiver, show sender name (patient)
    // If doctor is sender, show receiver name (patient)
    if (message.receiver_id === 'user-1') {
      return message.sender_name || 'Unknown Patient'
    }
    return message.receiver_name || 'Unknown Patient'
  }

  // Handle reply to message
  const handleReply = (message: Message) => {
    setSelectedMessage(message)
    setReplyText("")
    setIsReplyDialogOpen(true)
  }

  // Handle send reply
  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSendingReply(true)
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          receiver_id: selectedMessage.sender_id, // Reply to the original sender
          message: replyText.trim(),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Reply sent successfully",
        })
        setReplyText("")
        setIsReplyDialogOpen(false)
        setSelectedMessage(null)
        // Refresh messages
        await fetchMessages()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to send reply",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingReply(false)
    }
  }

  // Count unread messages
  const unreadMessagesCount = useMemo(() => {
    return doctorMessages.filter((msg) => !msg.is_read).length
  }, [doctorMessages])

  // Format prescription date
  const formatPrescriptionDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "MMM d, yyyy")
  }

  // Get patient name by ID
  const getPatientNameById = (patientId: string) => {
    const patient = allPatients.find((p) => p.id === patientId)
    return patient?.name || 'Unknown Patient'
  }

  // Handle create prescription
  const handleCreatePrescription = async () => {
    if (!selectedPatientId || !medicationName.trim()) {
      toast({
        title: "Error",
        description: "Please select a patient and enter medication name",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreatingPrescription(true)
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          patient_id: selectedPatientId,
          medication_name: medicationName,
          dosage: dosage || undefined,
          frequency: frequency || undefined,
          duration_days: durationDays ? parseInt(durationDays) : undefined,
          quantity: quantity ? parseInt(quantity) : undefined,
          notes: prescriptionNotes || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Prescription created successfully",
        })
        // Reset form
        setSelectedPatientId("")
        setMedicationName("")
        setDosage("")
        setFrequency("")
        setDurationDays("")
        setQuantity("")
        setPrescriptionNotes("")
        setIsPrescriptionDialogOpen(false)
        // Refresh prescriptions
        await fetchPrescriptions()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create prescription",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating prescription:", error)
      toast({
        title: "Error",
        description: "Failed to create prescription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingPrescription(false)
    }
  }

  const handleOpenPrescriptionDialog = (patientId?: string) => {
    if (patientId) {
      setSelectedPatientId(patientId)
    } else if (!selectedPatientId && allPatients.length > 0) {
      setSelectedPatientId(allPatients[0].id)
    }
    setIsPrescriptionDialogOpen(true)
  }

  // Filter today's appointments
  const todaysAppointments = useMemo(() => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.appointment_date)
      const aptDateStr = aptDate.toISOString().split('T')[0]
      return aptDateStr === todayStr && 
             (apt.status === 'scheduled' || apt.status === 'in-progress' || apt.status === 'completed')
    }).sort((a, b) => {
      return new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
    })
  }, [appointments])

  // Format appointment time
  const formatAppointmentTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "h:mm a")
  }

  // Format appointment date
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "MMM d, yyyy")
  }

  // Get appointment duration (default 30 minutes)
  const getAppointmentDuration = (dateString: string) => {
    // For demo, we'll use 30 minutes as default
    return "30 min"
  }

  // Handle start appointment
  const handleStartAppointment = async (appointmentId: string) => {
    try {
      setStartingAppointmentId(appointmentId)
      const response = await fetch("/api/appointments", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: appointmentId,
          status: "in-progress",
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment started successfully",
        })
        await fetchAppointments()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to start appointment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error starting appointment:", error)
      toast({
        title: "Error",
        description: "Failed to start appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setStartingAppointmentId(null)
    }
  }

  // Handle complete appointment
  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      setCompletingAppointmentId(appointmentId)
      const response = await fetch("/api/appointments", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: appointmentId,
          status: "completed",
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment completed successfully",
        })
        await fetchAppointments()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to complete appointment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error completing appointment:", error)
      toast({
        title: "Error",
        description: "Failed to complete appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCompletingAppointmentId(null)
    }
  }

  // Filter patients based on search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) {
      return allPatients
    }
    const query = searchQuery.toLowerCase()
    return allPatients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.age.toString().includes(query) ||
        patient.status.toLowerCase().includes(query)
    )
  }, [searchQuery, allPatients])

  // Add patient locally (demo)
  const handleSavePatient = () => {
    if (!newPatientName.trim() || !newPatientAge.trim()) {
      toast({
        title: "Missing info",
        description: "Please enter name and age for the patient.",
        variant: "destructive",
      })
      return
    }
    setIsSavingPatient(true)
    const newPatient: Patient = {
      id: `patient-${Date.now()}`,
      name: newPatientName.trim(),
      age: parseInt(newPatientAge, 10) || 0,
      status: newPatientStatus || "Active",
      email: newPatientEmail || undefined,
      phone: newPatientPhone || undefined,
    }
    setAllPatients((prev) => [...prev, newPatient])
    toast({
      title: "Patient added",
      description: `${newPatient.name} added to assigned patients (local demo).`,
    })
    setIsAddPatientDialogOpen(false)
    setNewPatientName("")
    setNewPatientAge("")
    setNewPatientStatus("Active")
    setNewPatientEmail("")
    setNewPatientPhone("")
    setIsSavingPatient(false)
  }

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
              <h1 className="text-2xl font-bold text-primary">Doctor Dashboard</h1>
              <p className="text-sm text-muted-foreground">Demo Account - Dr. Sarah Smith</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Role: Doctor</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Patients</p>
                  <p className="text-3xl font-bold">
                    {isLoadingPatients ? "-" : <CountUp value={allPatients.length} />}
                  </p>
                </div>
                <Users className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                  <p className="text-3xl font-bold">
                    {isLoadingAppointments ? "-" : <CountUp value={todaysAppointments.length} />}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Prescriptions</p>
                  <p className="text-3xl font-bold">
                    {isLoadingPrescriptions ? "-" : <CountUp value={prescriptions.length} />}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                  <p className="text-3xl font-bold">
                    {isLoadingMessages ? "-" : <CountUp value={unreadMessagesCount} />}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="patients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="patients">Assigned Patients</TabsTrigger>
            <TabsTrigger value="appointments">Today's Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search patients by name, age, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoadingPatients}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Add patient"
                onClick={() => setIsAddPatientDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {isLoadingPatients ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Loading patients...
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-2">
                  Showing {filteredPatients.length} of {allPatients.length} patients
                </div>

                {filteredPatients.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      {searchQuery ? (
                        <>No patients found matching "{searchQuery}"</>
                      ) : (
                        <>No patients found</>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  filteredPatients.map((patient) => (
                    <Card key={patient.id} className="cursor-pointer hover:bg-accent transition">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{patient.name}</h4>
                              <Badge variant="outline" className="capitalize">
                                {patient.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
                            {patient.email && <p className="text-sm text-muted-foreground">Email: {patient.email}</p>}
                            {patient.phone && <p className="text-sm text-muted-foreground">Phone: {patient.phone}</p>}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleViewPatient(patient, e)}
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}

                <Dialog open={isAddPatientDialogOpen} onOpenChange={setIsAddPatientDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Patient</DialogTitle>
                      <DialogDescription>Add a patient to your assigned list (demo only).</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="patient-name">Name</Label>
                        <Input
                          id="patient-name"
                          value={newPatientName}
                          onChange={(e) => setNewPatientName(e.target.value)}
                          placeholder="Patient name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="patient-age">Age</Label>
                        <Input
                          id="patient-age"
                          type="number"
                          min={0}
                          value={newPatientAge}
                          onChange={(e) => setNewPatientAge(e.target.value)}
                          placeholder="Age"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="patient-status">Status</Label>
                        <Select value={newPatientStatus} onValueChange={setNewPatientStatus}>
                          <SelectTrigger id="patient-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Recovering">Recovering</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="patient-email">Email (optional)</Label>
                        <Input
                          id="patient-email"
                          type="email"
                          value={newPatientEmail}
                          onChange={(e) => setNewPatientEmail(e.target.value)}
                          placeholder="patient@example.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="patient-phone">Phone (optional)</Label>
                        <Input
                          id="patient-phone"
                          value={newPatientPhone}
                          onChange={(e) => setNewPatientPhone(e.target.value)}
                          placeholder="+1 555 123 4567"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddPatientDialogOpen(false)} disabled={isSavingPatient}>
                        Cancel
                      </Button>
                      <Button onClick={handleSavePatient} disabled={isSavingPatient}>
                        {isSavingPatient ? "Saving..." : "Save"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Today's Appointments</h3>
                <p className="text-sm text-muted-foreground">
                  {formatAppointmentDate(new Date().toISOString())}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {todaysAppointments.length} appointment{todaysAppointments.length !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAppointments}
                  disabled={isLoadingAppointments}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingAppointments ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {isLoadingAppointments ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Loading appointments...
                </CardContent>
              </Card>
            ) : todaysAppointments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No appointments scheduled for today
                </CardContent>
              </Card>
            ) : (
              <>
                {todaysAppointments.map((apt) => (
                  <Card key={apt.id} className={apt.status === 'in-progress' ? 'border-primary border-2' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{formatAppointmentTime(apt.appointment_date)}</span>
                            {apt.status === 'in-progress' && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                                In Progress
                              </span>
                            )}
                            {apt.status === 'completed' && (
                              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                                Completed
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold">{apt.patient_name || 'Unknown Patient'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {apt.notes || 'General Consultation'} • {getAppointmentDuration(apt.appointment_date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {apt.status === 'scheduled' && (
                            <Button
                              size="sm"
                              onClick={() => handleStartAppointment(apt.id)}
                              disabled={startingAppointmentId === apt.id}
                            >
                              {startingAppointmentId === apt.id ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Starting...
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="w-4 h-4 mr-2" />
                                  Start
                                </>
                              )}
                            </Button>
                          )}
                          {apt.status === 'in-progress' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleCompleteAppointment(apt.id)}
                              disabled={completingAppointmentId === apt.id}
                            >
                              {completingAppointmentId === apt.id ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Completing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Complete
                                </>
                              )}
                            </Button>
                          )}
                          {apt.status === 'completed' && (
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Summary */}
                <Card className="mt-4 bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {todaysAppointments.filter(a => a.status === 'scheduled').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Scheduled</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {todaysAppointments.filter(a => a.status === 'in-progress').length}
                        </p>
                        <p className="text-sm text-muted-foreground">In Progress</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {todaysAppointments.filter(a => a.status === 'completed').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Prescription</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full md:w-auto"
                  onClick={() => setIsPrescriptionDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Prescription
                </Button>
              </CardContent>
            </Card>

            <h3 className="font-semibold">Recent Prescriptions</h3>
            
            {isLoadingPrescriptions ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Loading prescriptions...
                </CardContent>
              </Card>
            ) : prescriptions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No prescriptions yet. Create your first prescription above.
                </CardContent>
              </Card>
            ) : (
              prescriptions.map((rx) => (
                <Card key={rx.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold">{rx.patient_name || 'Unknown Patient'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {rx.medication_name}
                          {rx.dosage && ` • ${rx.dosage}`}
                          {rx.frequency && ` • ${rx.frequency}`}
                        </p>
                        {rx.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{rx.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatPrescriptionDate(rx.created_at)}
                          {rx.quantity ? ` • Qty: ${rx.quantity}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[200px] items-end">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenPrescriptionDialog(rx.patient_id)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleOpenPrescriptionDialog(rx.patient_id)}
                          >
                            Refill
                          </Button>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
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

          <TabsContent value="messages" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Patient Messages</h3>
                <p className="text-sm text-muted-foreground">
                  {doctorMessages.length} message{doctorMessages.length !== 1 ? 's' : ''}
                  {unreadMessagesCount > 0 && ` • ${unreadMessagesCount} unread`}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMessages}
                disabled={isLoadingMessages}
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {isLoadingMessages ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Loading messages...
                </CardContent>
              </Card>
            ) : doctorMessages.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No messages yet
                </CardContent>
              </Card>
            ) : (
              doctorMessages.map((msg) => (
                <Card 
                  key={msg.id} 
                  className={!msg.is_read ? "bg-accent border-primary/20" : ""}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{getSenderName(msg)}</h4>
                          {!msg.is_read && (
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{msg.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatMessageTime(msg.created_at)}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReply(msg)}
                      >
                        Reply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* View Patient Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6 mt-4">
              {/* Basic Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedPatient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{selectedPatient.age} years</p>
                  </div>
                  {selectedPatient.gender && (
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium">{selectedPatient.gender}</p>
                    </div>
                  )}
                  {selectedPatient.blood_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">Blood Type</p>
                      <p className="font-medium flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        {selectedPatient.blood_type}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{selectedPatient.status}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {(selectedPatient.email || selectedPatient.phone) && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    {selectedPatient.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm">{selectedPatient.email}</p>
                      </div>
                    )}
                    {selectedPatient.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm">{selectedPatient.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medical Information */}
              {(selectedPatient.allergies || selectedPatient.chronic_conditions) && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Medical Information</h3>
                  <div className="space-y-3">
                    {selectedPatient.allergies && (
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          Allergies
                        </p>
                        <p className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                          {selectedPatient.allergies}
                        </p>
                      </div>
                    )}
                    {selectedPatient.chronic_conditions && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Chronic Conditions</p>
                        <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                          {selectedPatient.chronic_conditions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  View Medical History
                </Button>
                <Button variant="outline" className="flex-1">
                  Schedule Appointment
                </Button>
                <Button variant="outline" className="flex-1">
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create New Prescription Dialog */}
      <Dialog open={isPrescriptionDialogOpen} onOpenChange={setIsPrescriptionDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Prescription</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new prescription for a patient
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {allPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} (Age: {patient.age})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Medication Name */}
            <div className="space-y-2">
              <Label htmlFor="medication">Medication Name *</Label>
              <Input
                id="medication"
                placeholder="e.g., Aspirin 500mg"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
              />
            </div>

            {/* Dosage */}
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder="e.g., 1 tablet"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once daily">Once Daily</SelectItem>
                  <SelectItem value="twice daily">Twice Daily</SelectItem>
                  <SelectItem value="three times daily">Three Times Daily</SelectItem>
                  <SelectItem value="four times daily">Four Times Daily</SelectItem>
                  <SelectItem value="as needed">As Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration and Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="e.g., 60"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional instructions or notes..."
                value={prescriptionNotes}
                onChange={(e) => setPrescriptionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsPrescriptionDialogOpen(false)}
              disabled={isCreatingPrescription}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePrescription}
              disabled={isCreatingPrescription || !selectedPatientId || !medicationName.trim()}
            >
              {isCreatingPrescription ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Prescription
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply to Message Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>
              Reply to {selectedMessage ? getSenderName(selectedMessage) : 'patient'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4 mt-4">
              {/* Original Message */}
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Original Message:</p>
                <p className="text-sm text-muted-foreground">{selectedMessage.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatMessageTime(selectedMessage.created_at)}
                </p>
              </div>

              {/* Reply Textarea */}
              <div className="space-y-2">
                <Label htmlFor="reply">Your Reply *</Label>
                <Textarea
                  id="reply"
                  placeholder="Type your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsReplyDialogOpen(false)
                setSelectedMessage(null)
                setReplyText("")
              }}
              disabled={isSendingReply}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendReply}
              disabled={isSendingReply || !replyText.trim()}
            >
              {isSendingReply ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
