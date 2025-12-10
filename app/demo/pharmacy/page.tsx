"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ChevronLeft, Package, Clock, MessageSquare, AlertCircle } from "lucide-react"

export default function PharmacyDemo() {
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
              <h1 className="text-2xl font-bold text-primary">Pharmacy Dashboard</h1>
              <p className="text-sm text-muted-foreground">Demo Account - HealthCare Pharmacy</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Role: Pharmacy</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-3xl font-bold">7</p>
                </div>
                <Package className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ready to Deliver</p>
                  <p className="text-3xl font-bold">5</p>
                </div>
                <Clock className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <MessageSquare className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-3xl font-bold">3</p>
                </div>
                <AlertCircle className="w-8 h-8 text-destructive opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Prescription Orders</TabsTrigger>
            <TabsTrigger value="status">Order Status</TabsTrigger>
            <TabsTrigger value="messages">Patient Messages</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <h3 className="font-semibold">New Prescription Orders</h3>
            {[
              {
                orderId: "ORD-001",
                doctor: "Dr. Sarah Smith",
                patient: "John Doe",
                medicines: ["Aspirin 500mg x30", "Vitamin D3 x60"],
                status: "New",
              },
              {
                orderId: "ORD-002",
                doctor: "Dr. Ahmed Hassan",
                patient: "Jane Smith",
                medicines: ["Metformin 850mg x90"],
                status: "New",
              },
              {
                orderId: "ORD-003",
                doctor: "Dr. Sarah Smith",
                patient: "Michael Johnson",
                medicines: ["Lisinopril 10mg x60", "Aspirin 100mg x100"],
                status: "New",
              },
            ].map((order) => (
              <Card key={order.orderId}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{order.orderId}</h4>
                        <p className="text-sm text-muted-foreground">From: {order.doctor}</p>
                        <p className="text-sm text-muted-foreground">Patient: {order.patient}</p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-full">
                        {order.status}
                      </span>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold mb-2">Medicines:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {order.medicines.map((med, idx) => (
                          <li key={idx}>• {med}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Confirm
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        Suggest Alternatives
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <h3 className="font-semibold">Order Status Updates</h3>
            {[
              {
                orderId: "ORD-010",
                patient: "Sarah Wilson",
                status: "Confirmed",
                progress: 25,
              },
              {
                orderId: "ORD-009",
                patient: "Emma Thompson",
                status: "Processing",
                progress: 50,
              },
              {
                orderId: "ORD-008",
                patient: "James Brown",
                status: "Ready for Pickup",
                progress: 75,
              },
              {
                orderId: "ORD-007",
                patient: "Lisa Anderson",
                status: "Delivered",
                progress: 100,
              },
            ].map((order) => (
              <Card key={order.orderId}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{order.orderId}</h4>
                        <p className="text-sm text-muted-foreground">{order.patient}</p>
                      </div>
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Ready for Pickup"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                    <select className="w-full px-3 py-2 border rounded-lg bg-background text-sm">
                      <option>Confirmed</option>
                      <option>Processing</option>
                      <option selected>Ready for Pickup</option>
                      <option>Delivered</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <h3 className="font-semibold">Patient Communication</h3>
            {[
              {
                patient: "John Doe",
                message: "Do you have Aspirin available?",
                time: "30 mins ago",
                unread: true,
              },
              {
                patient: "Jane Smith",
                message: "When will my order be ready?",
                time: "2 hours ago",
                unread: true,
              },
              {
                patient: "Michael Johnson",
                message: "Can you suggest an alternative?",
                time: "1 day ago",
                unread: false,
              },
            ].map((msg, idx) => (
              <Card key={idx} className={msg.unread ? "bg-accent" : ""}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{msg.patient}</h4>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <h3 className="font-semibold">Current Inventory</h3>
            {[
              { medicine: "Aspirin 500mg", stock: 250, status: "Good" },
              { medicine: "Metformin 850mg", stock: 180, status: "Good" },
              { medicine: "Lisinopril 10mg", stock: 45, status: "Low" },
              { medicine: "Vitamin D3 1000IU", stock: 0, status: "Out of Stock" },
              { medicine: "Ibuprofen 400mg", stock: 300, status: "Good" },
            ].map((item, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{item.medicine}</h4>
                      <p className="text-sm text-muted-foreground">Stock: {item.stock} units</p>
                    </div>
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        item.status === "Good"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Low"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
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
