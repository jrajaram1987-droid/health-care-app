"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex justify-between items-center py-8">
          <div className="text-2xl font-bold text-primary">HealthCare Pro</div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <div className="py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Healthcare Management Made Simple
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Connect doctors, patients, and pharmacies in one unified platform. Streamline appointments, prescriptions,
            and medical records.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/demo/patient">
              <Button size="lg">Demo: Patient</Button>
            </Link>
            <Link href="/demo/doctor">
              <Button size="lg" variant="outline">
                Demo: Doctor
              </Button>
            </Link>
            <Link href="/demo/pharmacy">
              <Button size="lg" variant="secondary">
                Demo: Pharmacy
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="py-20 grid md:grid-cols-3 gap-8">
          <div className="bg-card p-8 rounded-lg border">
            <h3 className="text-xl font-bold mb-4">For Doctors</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Manage assigned patients</li>
              <li>• Create and update prescriptions</li>
              <li>• View appointment schedules</li>
              <li>• Access patient medical history</li>
              <li>• Direct messaging with patients</li>
            </ul>
          </div>

          <div className="bg-card p-8 rounded-lg border">
            <h3 className="text-xl font-bold mb-4">For Patients</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• View medical history</li>
              <li>• Book appointments</li>
              <li>• Receive prescriptions</li>
              <li>• Medicine reminders</li>
              <li>• Pharmacy order tracking</li>
            </ul>
          </div>

          <div className="bg-card p-8 rounded-lg border">
            <h3 className="text-xl font-bold mb-4">For Pharmacy</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Receive prescription orders</li>
              <li>• Confirm or cancel orders</li>
              <li>• Update order status</li>
              <li>• Secure prescription viewing</li>
              <li>• Patient communication</li>
            </ul>
          </div>
        </div>

        {/* Testing Section */}
        <div className="py-20 border-t">
          <h2 className="text-3xl font-bold mb-8 text-center">Test The Platform</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Click on a demo button above to explore the fully functional dashboards for each user role
          </p>
          <div className="bg-card p-8 rounded-lg border">
            <h3 className="font-semibold mb-4">Testing Guides:</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <strong>Patient Demo:</strong> Explore appointments, prescriptions, pharmacy orders, and medicine
                reminders
              </li>
              <li>
                <strong>Doctor Demo:</strong> Manage patients, view today's appointments, create prescriptions, and send
                messages
              </li>
              <li>
                <strong>Pharmacy Demo:</strong> Handle incoming prescription orders, update status, communicate with
                patients, and manage inventory
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
