"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronLeft, Package, Clock, MessageSquare, AlertCircle, Loader2, Pill, User, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

type OrderStatus = "pending" | "confirmed" | "processing" | "ready" | "delivered" | "cancelled" | "alternative_suggested"

interface PrescriptionOrder {
  id: string
  prescription_id: string
  pharmacy_id: string
  status: OrderStatus
  alternative_medicine?: string | null
  notes?: string | null
  medication_name?: string
  dosage?: string
  quantity?: number
  patient_name?: string
  doctor_name?: string
  created_at?: string
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

interface InventoryItem {
  id: string
  pharmacy_id: string
  name: string
  quantity: number
  status: "Good" | "Low" | "Out of Stock"
}

export default function PharmacyDemo() {
  const [orders, setOrders] = useState<PrescriptionOrder[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [isAlternativeDialogOpen, setIsAlternativeDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [alternativeMedicine, setAlternativeMedicine] = useState("")
  const [alternativeNotes, setAlternativeNotes] = useState("")
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false)

  // Stub states to avoid breaking other tabs; these can be wired later
  const [messages] = useState<Message[]>([])
  const [inventory] = useState<InventoryItem[]>([])

  const { toast } = useToast()

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    const headers: HeadersInit = { "Content-Type": "application/json" }
    if (token) headers["Authorization"] = `Bearer ${token}`
    return headers
  }

  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true)
      const res = await fetch("/api/prescription-orders", { headers: getAuthHeaders() })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to load orders" }))
        throw new Error(error.error || "Failed to load orders. Please log in.")
      }
      const data = await res.json()
      setOrders(data)
    } catch (error: any) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingOrders(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, extra?: { alternative_medicine?: string; notes?: string }) => {
    try {
      setIsUpdatingOrder(true)
      const res = await fetch("/api/prescription-orders", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          order_id: orderId,
          status,
          alternative_medicine: extra?.alternative_medicine,
          notes: extra?.notes,
        }),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to update order" }))
        throw new Error(error.error || "Failed to update order")
      }
      await fetchOrders()
      toast({ title: "Success", description: "Order updated successfully" })
    } catch (error: any) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingOrder(false)
      setIsAlternativeDialogOpen(false)
      setAlternativeMedicine("")
      setAlternativeNotes("")
      setSelectedOrderId(null)
    }
  }

  const handleConfirmOrder = (orderId: string) => handleUpdateOrderStatus(orderId, "confirmed")
  const handleCancelOrder = (orderId: string) => handleUpdateOrderStatus(orderId, "cancelled")

  const handleSuggestAlternative = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsAlternativeDialogOpen(true)
  }

  const handleSubmitAlternative = async () => {
    if (!selectedOrderId) return
    await handleUpdateOrderStatus(selectedOrderId, "alternative_suggested", {
      alternative_medicine: alternativeMedicine,
      notes: alternativeNotes,
    })
  }

  const pendingCount = useMemo(() => orders.filter((o) => o.status === "pending").length, [orders])
  const readyCount = useMemo(() => orders.filter((o) => o.status === "ready").length, [orders])
  const unreadMessages = messages.filter((m) => !m.is_read).length
  const outOfStock = inventory.filter((i) => i.status === "Out of Stock").length

  const renderStatusBadge = (status: OrderStatus) => {
    const map: Record<OrderStatus, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      processing: "bg-indigo-100 text-indigo-700",
      ready: "bg-green-100 text-green-700",
      delivered: "bg-emerald-100 text-emerald-700",
      cancelled: "bg-red-100 text-red-700",
      alternative_suggested: "bg-orange-100 text-orange-700",
    }
    return <Badge className={map[status]}>{status.replace("_", " ")}</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-3xl font-bold">{isLoadingOrders ? "-" : pendingCount}</p>
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
                  <p className="text-3xl font-bold">{isLoadingOrders ? "-" : readyCount}</p>
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
                  <p className="text-3xl font-bold">{unreadMessages}</p>
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
                  <p className="text-3xl font-bold">{outOfStock}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-destructive opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Prescription Orders</TabsTrigger>
            <TabsTrigger value="status">Order Status</TabsTrigger>
            <TabsTrigger value="messages">Patient Messages</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">New Prescription Orders</h3>
              <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isLoadingOrders}>
                {isLoadingOrders ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Refresh
              </Button>
            </div>

            {isLoadingOrders ? (
              <Card>
                <CardContent className="pt-6 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading orders...
                </CardContent>
              </Card>
            ) : orders.filter((o) => o.status === "pending").length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">No new prescription orders.</CardContent>
              </Card>
            ) : (
              orders
                .filter((o) => o.status === "pending")
                .map((order) => (
                  <Card key={order.id}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" />
                            Order #{order.id.slice(0, 6)}
                          </h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Patient: {order.patient_name || "Unknown patient"}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Pill className="w-4 h-4" />
                            Medicine: {order.medication_name || "Medication"}
                            {order.dosage ? ` • ${order.dosage}` : ""} {order.quantity ? ` • Qty ${order.quantity}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">Prescribed by {order.doctor_name || "Doctor"}</p>
                        </div>
                        {renderStatusBadge(order.status)}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => handleConfirmOrder(order.id)} disabled={isUpdatingOrder}>
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => handleSuggestAlternative(order.id)}
                          disabled={isUpdatingOrder}
                        >
                          Suggest Alternative
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleCancelOrder(order.id)} disabled={isUpdatingOrder}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Order Status</h3>
              <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isLoadingOrders}>
                {isLoadingOrders ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Refresh
              </Button>
            </div>

            {isLoadingOrders ? (
              <Card>
                <CardContent className="pt-6 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading status...
                </CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">No orders found.</CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-0">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" />
                        Order #{order.id.slice(0, 6)}
                      </span>
                      {renderStatusBadge(order.status)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <p className="text-sm text-muted-foreground">
                      {order.patient_name || "Patient"} • {order.medication_name || "Medication"} {order.dosage ? `(${order.dosage})` : ""}{" "}
                      {order.quantity ? `x${order.quantity}` : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" disabled={isUpdatingOrder} onClick={() => handleUpdateOrderStatus(order.id, "processing")}>
                        Mark Processing
                      </Button>
                      <Button size="sm" variant="outline" disabled={isUpdatingOrder} onClick={() => handleUpdateOrderStatus(order.id, "ready")}>
                        Mark Ready
                      </Button>
                      <Button size="sm" variant="outline" disabled={isUpdatingOrder} onClick={() => handleUpdateOrderStatus(order.id, "delivered")}>
                        Mark Delivered
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Patient messaging is not yet wired on this screen. (API is ready at `/api/messages`.)
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">Inventory is not yet wired on this screen. (API is ready at `/api/inventory`.)</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isAlternativeDialogOpen} onOpenChange={setIsAlternativeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suggest Alternative Medicine</DialogTitle>
            <DialogDescription>Provide an alternative medicine suggestion for this order.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alternative">Alternative Medicine</Label>
              <Input id="alternative" placeholder="Enter medicine name" value={alternativeMedicine} onChange={(e) => setAlternativeMedicine(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes for the doctor or patient" value={alternativeNotes} onChange={(e) => setAlternativeNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAlternativeDialogOpen(false)} disabled={isUpdatingOrder}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAlternative} disabled={isUpdatingOrder || !alternativeMedicine.trim()}>
              {isUpdatingOrder ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit Suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
