"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  Clock,
  CheckCircle,
  Package,
  DollarSign,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { User as GuestUser } from "@/app/page"

// Guest Laundry Types
interface GuestLaundryOrder {
  id: number
  orderNumber: string
  guestName: string
  roomNumber: string
  phoneNumber: string
  items: LaundryItem[]
  totalAmount: number
  status: "received" | "in-progress" | "completed" | "delivered" | "cancelled"
  priority: "normal" | "express" | "urgent"
  pickupDate: string
  deliveryDate: string
  actualDeliveryDate?: string
  notes: string
  createdAt: string
  updatedAt: string
  createdBy: number
}

interface LaundryItem {
  id: number
  name: string
  category: string
  service: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface LaundryService {
  id: number
  name: string
  category: string
  basePrice: number
  expressPrice: number
  urgentPrice: number
  estimatedHours: number
}

export function GuestLaundryManagement({ user }: { user: GuestUser }) {
  const [orders, setOrders] = useState<GuestLaundryOrder[]>([])
  const [services, setServices] = useState<LaundryService[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false)
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false)
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<GuestLaundryOrder | null>(null)
  const [orderItems, setOrderItems] = useState<LaundryItem[]>([])
  const { toast } = useToast()

  // Initialize sample data
  useEffect(() => {
    // Sample laundry services
    const sampleServices: LaundryService[] = [
      {
        id: 1,
        name: "Shirt",
        category: "Clothing",
        basePrice: 15000,
        expressPrice: 22500,
        urgentPrice: 30000,
        estimatedHours: 24,
      },
      {
        id: 2,
        name: "Pants/Trousers",
        category: "Clothing",
        basePrice: 18000,
        expressPrice: 27000,
        urgentPrice: 36000,
        estimatedHours: 24,
      },
      {
        id: 3,
        name: "Dress",
        category: "Clothing",
        basePrice: 25000,
        expressPrice: 37500,
        urgentPrice: 50000,
        estimatedHours: 48,
      },
      {
        id: 4,
        name: "Suit Jacket",
        category: "Formal",
        basePrice: 35000,
        expressPrice: 52500,
        urgentPrice: 70000,
        estimatedHours: 48,
      },
      {
        id: 5,
        name: "Bed Sheet",
        category: "Linen",
        basePrice: 20000,
        expressPrice: 30000,
        urgentPrice: 40000,
        estimatedHours: 12,
      },
      {
        id: 6,
        name: "Towel",
        category: "Linen",
        basePrice: 8000,
        expressPrice: 12000,
        urgentPrice: 16000,
        estimatedHours: 8,
      },
      {
        id: 7,
        name: "Curtain",
        category: "Linen",
        basePrice: 30000,
        expressPrice: 45000,
        urgentPrice: 60000,
        estimatedHours: 72,
      },
      {
        id: 8,
        name: "Blanket",
        category: "Linen",
        basePrice: 25000,
        expressPrice: 37500,
        urgentPrice: 50000,
        estimatedHours: 48,
      },
    ]

    // Sample orders
    const sampleOrders: GuestLaundryOrder[] = [
      {
        id: 1,
        orderNumber: "GL-2024-001",
        guestName: "John Smith",
        roomNumber: "101",
        phoneNumber: "+62 812-3456-7890",
        items: [
          {
            id: 1,
            name: "Shirt",
            category: "Clothing",
            service: "Wash & Iron",
            quantity: 3,
            unitPrice: 15000,
            totalPrice: 45000,
          },
          {
            id: 2,
            name: "Pants/Trousers",
            category: "Clothing",
            service: "Wash & Iron",
            quantity: 2,
            unitPrice: 18000,
            totalPrice: 36000,
          },
        ],
        totalAmount: 81000,
        status: "in-progress",
        priority: "normal",
        pickupDate: "2024-01-15",
        deliveryDate: "2024-01-16",
        notes: "Please handle with care",
        createdAt: "2024-01-15 09:00:00",
        updatedAt: "2024-01-15 09:00:00",
        createdBy: user.id,
      },
      {
        id: 2,
        orderNumber: "GL-2024-002",
        guestName: "Maria Garcia",
        roomNumber: "205",
        phoneNumber: "+62 813-9876-5432",
        items: [
          {
            id: 3,
            name: "Dress",
            category: "Clothing",
            service: "Dry Clean",
            quantity: 1,
            unitPrice: 37500,
            totalPrice: 37500,
          },
          {
            id: 4,
            name: "Suit Jacket",
            category: "Formal",
            service: "Dry Clean",
            quantity: 1,
            unitPrice: 52500,
            totalPrice: 52500,
          },
        ],
        totalAmount: 90000,
        status: "completed",
        priority: "express",
        pickupDate: "2024-01-14",
        deliveryDate: "2024-01-15",
        actualDeliveryDate: "2024-01-15 14:30:00",
        notes: "Express service requested",
        createdAt: "2024-01-14 10:30:00",
        updatedAt: "2024-01-15 14:30:00",
        createdBy: user.id,
      },
      {
        id: 3,
        orderNumber: "GL-2024-003",
        guestName: "David Johnson",
        roomNumber: "312",
        phoneNumber: "+62 814-1111-2222",
        items: [
          {
            id: 5,
            name: "Bed Sheet",
            category: "Linen",
            service: "Wash & Fold",
            quantity: 2,
            unitPrice: 20000,
            totalPrice: 40000,
          },
          {
            id: 6,
            name: "Towel",
            category: "Linen",
            service: "Wash & Fold",
            quantity: 4,
            unitPrice: 8000,
            totalPrice: 32000,
          },
        ],
        totalAmount: 72000,
        status: "received",
        priority: "normal",
        pickupDate: "2024-01-16",
        deliveryDate: "2024-01-17",
        notes: "",
        createdAt: "2024-01-16 08:15:00",
        updatedAt: "2024-01-16 08:15:00",
        createdBy: user.id,
      },
    ]

    setServices(sampleServices)
    setOrders(sampleOrders)
  }, [user.id])

  if (user.role !== "admin" && user.role !== "manager" && user.role !== "staff") {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    )
  }

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Statistics
  const totalOrders = orders.length
  const activeOrders = orders.filter((o) => o.status === "received" || o.status === "in-progress").length
  const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "delivered").length
  const totalRevenue = orders
    .filter((o) => o.status === "completed" || o.status === "delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0)

  // Generate order number
  const generateOrderNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const orderCount = orders.length + 1
    return `GL-${year}-${orderCount.toString().padStart(3, "0")}`
  }

  // Calculate item price based on priority
  const calculateItemPrice = (service: LaundryService, priority: string, quantity: number) => {
    let unitPrice = service.basePrice
    if (priority === "express") unitPrice = service.expressPrice
    if (priority === "urgent") unitPrice = service.urgentPrice
    return unitPrice * quantity
  }

  // Add item to order
  const addItemToOrder = (serviceId: number, quantity: number, priority: string) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return

    const unitPrice =
      priority === "express" ? service.expressPrice : priority === "urgent" ? service.urgentPrice : service.basePrice
    const totalPrice = unitPrice * quantity

    const newItem: LaundryItem = {
      id: Date.now(),
      name: service.name,
      category: service.category,
      service: "Wash & Iron", // Default service
      quantity,
      unitPrice,
      totalPrice,
    }

    setOrderItems([...orderItems, newItem])
  }

  // Remove item from order
  const removeItemFromOrder = (itemId: number) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId))
  }

  // Calculate total amount
  const calculateTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  // Handle add order
  const handleAddOrder = async (formData: FormData) => {
    const guestName = formData.get("guestName") as string
    const roomNumber = formData.get("roomNumber") as string
    const phoneNumber = formData.get("phoneNumber") as string
    const priority = formData.get("priority") as string
    const pickupDate = formData.get("pickupDate") as string
    const deliveryDate = formData.get("deliveryDate") as string
    const notes = formData.get("notes") as string

    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Silakan tambahkan minimal satu item laundry",
        variant: "destructive",
      })
      return
    }

    const newOrder: GuestLaundryOrder = {
      id: Date.now(),
      orderNumber: generateOrderNumber(),
      guestName,
      roomNumber,
      phoneNumber,
      items: orderItems,
      totalAmount: calculateTotalAmount(),
      status: "received",
      priority: priority as "normal" | "express" | "urgent",
      pickupDate,
      deliveryDate,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    }

    setOrders([...orders, newOrder])
    setOrderItems([])
    setIsAddOrderOpen(false)
    toast({
      title: "Pesanan Ditambahkan",
      description: `Pesanan ${newOrder.orderNumber} berhasil dibuat`,
    })
  }

  // Handle update order status
  const handleUpdateOrderStatus = (orderId: number, newStatus: GuestLaundryOrder["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              actualDeliveryDate: newStatus === "delivered" ? new Date().toISOString() : order.actualDeliveryDate,
              updatedAt: new Date().toISOString(),
            }
          : order,
      ),
    )
    toast({
      title: "Status Diperbarui",
      description: `Status pesanan berhasil diubah ke ${newStatus}`,
    })
  }

  // Handle delete order
  const handleDeleteOrder = (orderId: number) => {
    setOrders(orders.filter((order) => order.id !== orderId))
    toast({
      title: "Pesanan Dihapus",
      description: "Pesanan berhasil dihapus",
      variant: "destructive",
    })
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "received":
        return "secondary"
      case "in-progress":
        return "default"
      case "completed":
        return "outline"
      case "delivered":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "normal":
        return "outline"
      case "express":
        return "secondary"
      case "urgent":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold">Guest Laundry</h2>
          <p className="text-sm sm:text-base text-gray-600">Kelola layanan laundry untuk tamu hotel</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button size="sm" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Pesanan Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Buat Pesanan Laundry Baru</DialogTitle>
                <DialogDescription>Masukkan detail pesanan laundry tamu</DialogDescription>
              </DialogHeader>
              <form action={handleAddOrder} className="space-y-6">
                {/* Guest Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informasi Tamu</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guestName">Nama Tamu</Label>
                      <Input id="guestName" name="guestName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roomNumber">Nomor Kamar</Label>
                      <Input id="roomNumber" name="roomNumber" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Nomor Telepon</Label>
                      <Input id="phoneNumber" name="phoneNumber" type="tel" required />
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Detail Pesanan</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioritas</Label>
                      <Select name="priority" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih prioritas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal (24-48 jam)</SelectItem>
                          <SelectItem value="express">Express (+50% harga)</SelectItem>
                          <SelectItem value="urgent">Urgent (+100% harga)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupDate">Tanggal Pickup</Label>
                      <Input id="pickupDate" name="pickupDate" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryDate">Tanggal Delivery</Label>
                      <Input id="deliveryDate" name="deliveryDate" type="date" required />
                    </div>
                  </div>
                </div>

                {/* Add Items */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Item Laundry</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Item Laundry</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Pilih Item</Label>
                            <Select
                              onValueChange={(value) => {
                                const serviceId = Number.parseInt(value)
                                const quantity = 1
                                const priority = "normal" // Default priority
                                addItemToOrder(serviceId, quantity, priority)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih item laundry" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map((service) => (
                                  <SelectItem key={service.id} value={service.id.toString()}>
                                    {service.name} - Rp {service.basePrice.toLocaleString()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Items List */}
                  {orderItems.length > 0 && (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Jumlah</TableHead>
                            <TableHead>Harga Satuan</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead className="w-20">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newQuantity = Number.parseInt(e.target.value) || 1
                                    const updatedItems = orderItems.map((i) =>
                                      i.id === item.id
                                        ? {
                                            ...i,
                                            quantity: newQuantity,
                                            totalPrice: i.unitPrice * newQuantity,
                                          }
                                        : i,
                                    )
                                    setOrderItems(updatedItems)
                                  }}
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>Rp {item.unitPrice.toLocaleString()}</TableCell>
                              <TableCell>Rp {item.totalPrice.toLocaleString()}</TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItemFromOrder(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={4} className="text-right font-semibold">
                              Total:
                            </TableCell>
                            <TableCell className="font-semibold">
                              Rp {calculateTotalAmount().toLocaleString()}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea id="notes" name="notes" placeholder="Catatan khusus untuk pesanan ini..." />
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddOrderOpen(false)
                      setOrderItems([])
                    }}
                    className="w-full sm:w-auto"
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    Buat Pesanan
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-blue-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <Package className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-white/80">Semua pesanan</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Aktif</CardTitle>
            <Clock className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
            <p className="text-xs text-white/80">Sedang diproses</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
            <p className="text-xs text-white/80">Sudah selesai</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-white/80">Dari pesanan selesai</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari berdasarkan nama tamu, kamar, atau nomor pesanan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="received">Diterima</SelectItem>
            <SelectItem value="in-progress">Sedang Diproses</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="delivered">Sudah Diantar</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter Prioritas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Prioritas</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="express">Express</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Tamu</TableHead>
                  <TableHead className="hidden sm:table-cell">Kamar</TableHead>
                  <TableHead className="hidden md:table-cell">Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Prioritas</TableHead>
                  <TableHead className="hidden xl:table-cell">Delivery</TableHead>
                  <TableHead className="w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                          ? "Tidak ada pesanan yang sesuai dengan filter"
                          : "Belum ada pesanan laundry. Buat pesanan pertama!"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.guestName}</p>
                          <p className="text-sm text-gray-500 hidden sm:block">{order.phoneNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{order.roomNumber}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">
                          {order.items.length} item{order.items.length > 1 ? "s" : ""}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">Rp {order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            handleUpdateOrderStatus(order.id, value as GuestLaundryOrder["status"])
                          }
                        >
                          <SelectTrigger className="w-32">
                            <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                              {order.status === "received"
                                ? "Diterima"
                                : order.status === "in-progress"
                                  ? "Diproses"
                                  : order.status === "completed"
                                    ? "Selesai"
                                    : order.status === "delivered"
                                      ? "Diantar"
                                      : "Dibatalkan"}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="received">Diterima</SelectItem>
                            <SelectItem value="in-progress">Sedang Diproses</SelectItem>
                            <SelectItem value="completed">Selesai</SelectItem>
                            <SelectItem value="delivered">Sudah Diantar</SelectItem>
                            <SelectItem value="cancelled">Dibatalkan</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={getPriorityBadgeVariant(order.priority)} className="text-xs">
                          {order.priority === "normal" ? "Normal" : order.priority === "express" ? "Express" : "Urgent"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm">{order.deliveryDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsViewOrderOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {(user.role === "admin" || user.role === "manager") && (
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteOrder(order.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      {selectedOrder && (
        <Dialog open={isViewOrderOpen} onOpenChange={setIsViewOrderOpen}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Pesanan {selectedOrder.orderNumber}</DialogTitle>
              <DialogDescription>Informasi lengkap pesanan laundry</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Guest Information */}
              <div className="space-y-3">
                <h3 className="font-semibold">Informasi Tamu</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Nama:</span>
                    <p>{selectedOrder.guestName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Kamar:</span>
                    <p>{selectedOrder.roomNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium">Telepon:</span>
                    <p>{selectedOrder.phoneNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium">Prioritas:</span>
                    <Badge variant={getPriorityBadgeVariant(selectedOrder.priority)}>
                      {selectedOrder.priority === "normal"
                        ? "Normal"
                        : selectedOrder.priority === "express"
                          ? "Express"
                          : "Urgent"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-3">
                <h3 className="font-semibold">Detail Pesanan</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Tanggal Pickup:</span>
                    <p>{selectedOrder.pickupDate}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tanggal Delivery:</span>
                    <p>{selectedOrder.deliveryDate}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                      {selectedOrder.status === "received"
                        ? "Diterima"
                        : selectedOrder.status === "in-progress"
                          ? "Diproses"
                          : selectedOrder.status === "completed"
                            ? "Selesai"
                            : selectedOrder.status === "delivered"
                              ? "Diantar"
                              : "Dibatalkan"}
                    </Badge>
                  </div>
                  {selectedOrder.actualDeliveryDate && (
                    <div>
                      <span className="font-medium">Actual Delivery:</span>
                      <p>{new Date(selectedOrder.actualDeliveryDate).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h3 className="font-semibold">Item Laundry</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Harga Satuan</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>Rp {item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell>Rp {item.totalPrice.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-semibold">
                          Total:
                        </TableCell>
                        <TableCell className="font-semibold">Rp {selectedOrder.totalAmount.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Catatan</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-2 text-xs text-gray-500">
                <p>Dibuat: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p>Diperbarui: {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsViewOrderOpen(false)} className="w-full">
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
