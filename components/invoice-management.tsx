"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Edit, Filter, FileText, FileSpreadsheet, FileDown } from "lucide-react"
import type { User, LogEntry, Item } from "@/app/page" // Import LogEntry and Item types
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

// Import external libraries for export
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

// Define a type for an invoice entry
export interface InvoiceEntry {
  invoiceNo: string
  pickupDate: string
  returnDate: string | null // Manually filled
  totalPrice: number
  logEntryIds: number[] // To link back to original log entries if needed
}

export function InvoiceManagement({
  user,
  logEntries, // Received from parent
  items, // Received from parent for price lookup
}: {
  user: User
  logEntries: LogEntry[]
  items: Item[]
}) {
  const [invoices, setInvoices] = useState<InvoiceEntry[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceEntry | null>(null)
  const [editReturnDate, setEditReturnDate] = useState<string>("")
  const [editInvoiceNo, setEditInvoiceNo] = useState<string>("") // State for editing invoice number
  const { toast } = useToast()

  const [hasAccess, setHasAccess] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")

  const tableRef = useRef<HTMLTableElement>(null) // Ref for the table element for PDF export

  useEffect(() => {
    if (user.role !== "admin" && user.role !== "manager") {
      setHasAccess(false)
    }
  }, [user])

  useEffect(() => {
    if (!hasAccess) return

    // Group log entries by pickup date and calculate total price
    const groupedInvoices: { [key: string]: { total: number; logIds: number[] } } = {}

    logEntries.forEach((entry) => {
      // Only consider 'outQuantity' for total price calculation as per "PICK UP"
      if (entry.outQuantity > 0) {
        const item = items.find((i) => i.id === entry.itemId)
        const itemPrice = item ? item.price : 0 // Default to 0 if item not found

        if (!groupedInvoices[entry.date]) {
          groupedInvoices[entry.date] = { total: 0, logIds: [] }
        }
        groupedInvoices[entry.date].total += itemPrice * entry.outQuantity
        groupedInvoices[entry.date].logIds.push(entry.id)
      }
    })

    const generatedInvoices: InvoiceEntry[] = Object.keys(groupedInvoices)
      .sort() // Sort by date
      .map((date, index) => {
        // Generate a simple invoice number based on date and index
        const invoiceNo = `INV-${date.replace(/-/g, "")}-${(index + 1).toString().padStart(3, "0")}`
        return {
          invoiceNo: invoiceNo,
          pickupDate: date,
          returnDate: null, // Initialize return date as null
          totalPrice: groupedInvoices[date].total,
          logEntryIds: groupedInvoices[date].logIds,
        }
      })

    setInvoices(generatedInvoices)
  }, [logEntries, items, hasAccess]) // Re-run when logEntries or items change

  const handleEditInvoice = (invoice: InvoiceEntry) => {
    setSelectedInvoice(invoice)
    setEditReturnDate(invoice.returnDate || "") // Set current return date for editing
    setEditInvoiceNo(invoice.invoiceNo) // Set current invoice number for editing
    setIsEditDialogOpen(true)
  }

  const handleUpdateInvoice = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedInvoice) {
      setInvoices((prevInvoices) =>
        prevInvoices.map((inv) =>
          inv.invoiceNo === selectedInvoice.invoiceNo
            ? { ...inv, returnDate: editReturnDate, invoiceNo: editInvoiceNo } // Update both fields
            : inv,
        ),
      )
      setIsEditDialogOpen(false)
      setSelectedInvoice(null)
      setEditReturnDate("")
      setEditInvoiceNo("")
      toast({ title: "Invoice Diperbarui", description: "Detail invoice berhasil diperbarui." })
    }
  }

  // Generate year options dynamically
  const currentYear = new Date().getFullYear()
  const yearOptions = useMemo(() => {
    const years = ["all"]
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i.toString())
    }
    return years
  }, [currentYear])

  // Filter invoices based on selected month and year
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.pickupDate)
      const invoiceMonth = (invoiceDate.getMonth() + 1).toString() // getMonth() is 0-indexed
      const invoiceYear = invoiceDate.getFullYear().toString()

      const matchesMonth = selectedMonth === "all" || invoiceMonth === selectedMonth
      const matchesYear = selectedYear === "all" || invoiceYear === selectedYear

      return matchesMonth && matchesYear
    })
  }, [invoices, selectedMonth, selectedYear])

  const handleExportCsv = () => {
    if (filteredInvoices.length === 0) {
      toast({
        title: "Tidak ada data untuk diekspor",
        description: "Filter Anda tidak menghasilkan invoice apa pun.",
        variant: "destructive",
      })
      return
    }
    const headers = ["NO. INVOICE", "PICK UP DATE", "RETURN DATE", "TOTAL PRICE"]
    const csvContent = [
      headers.join(","),
      ...filteredInvoices.map((inv) => `${inv.invoiceNo},${inv.pickupDate},${inv.returnDate || "-"},${inv.totalPrice}`),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "invoices.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ title: "Ekspor CSV Berhasil", description: "Data invoice telah diekspor ke CSV." })
    }
  }

  const handleExportXlsx = () => {
    if (filteredInvoices.length === 0) {
      toast({
        title: "Tidak ada data untuk diekspor",
        description: "Filter Anda tidak menghasilkan invoice apa pun.",
        variant: "destructive",
      })
      return
    }
    const data = filteredInvoices.map((inv) => ({
      "NO. INVOICE": inv.invoiceNo,
      "PICK UP DATE": inv.pickupDate,
      "RETURN DATE": inv.returnDate || "-",
      "TOTAL PRICE": inv.totalPrice,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Invoices")
    XLSX.writeFile(wb, "invoices.xlsx")
    toast({ title: "Ekspor XLSX Berhasil", description: "Data invoice telah diekspor ke XLSX." })
  }

  const handleExportPdf = async () => {
    if (filteredInvoices.length === 0) {
      toast({
        title: "Tidak ada data untuk diekspor",
        description: "Filter Anda tidak menghasilkan invoice apa pun.",
        variant: "destructive",
      })
      return
    }
    if (tableRef.current) {
      try {
        const canvas = await html2canvas(tableRef.current)
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF("p", "mm", "a4")
        const imgWidth = 210 // A4 width in mm
        const pageHeight = 297 // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight
        let position = 0

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
        }
        pdf.save("invoices.pdf")
        toast({ title: "Ekspor PDF Berhasil", description: "Data invoice telah diekspor ke PDF." })
      } catch (error) {
        console.error("Error generating PDF:", error)
        toast({
          title: "Ekspor PDF Gagal",
          description: "Terjadi kesalahan saat membuat file PDF.",
          variant: "destructive",
        })
      }
    } else {
      toast({ title: "Ekspor PDF Gagal", description: "Tabel tidak ditemukan untuk diekspor.", variant: "destructive" })
    }
  }

  if (!hasAccess) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold">Invoice CM Coin Laundry</h2>
        <p className="text-sm sm:text-base text-gray-600">Kelola faktur untuk layanan CM Coin Laundry.</p>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter Bulan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Bulan</SelectItem>
            <SelectItem value="1">Januari</SelectItem>
            <SelectItem value="2">Februari</SelectItem>
            <SelectItem value="3">Maret</SelectItem>
            <SelectItem value="4">April</SelectItem>
            <SelectItem value="5">Mei</SelectItem>
            <SelectItem value="6">Juni</SelectItem>
            <SelectItem value="7">Juli</SelectItem>
            <SelectItem value="8">Agustus</SelectItem>
            <SelectItem value="9">September</SelectItem>
            <SelectItem value="10">Oktober</SelectItem>
            <SelectItem value="11">November</SelectItem>
            <SelectItem value="12">Desember</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter Tahun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tahun</SelectItem>
            {yearOptions.slice(1).map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleExportCsv} className="w-full sm:w-auto">
          <FileText className="h-4 w-4 mr-2" /> Export CSV
        </Button>
        <Button onClick={handleExportXlsx} className="w-full sm:w-auto">
          <FileSpreadsheet className="h-4 w-4 mr-2" /> Export XLSX
        </Button>
        <Button onClick={handleExportPdf} className="w-full sm:w-auto">
          <FileDown className="h-4 w-4 mr-2" /> Export PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table ref={tableRef}>
              {/* Attach ref to the table */}
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">NO. INVOICE</TableHead>
                  <TableHead className="w-[150px]">PICK UP DATE</TableHead>
                  <TableHead className="w-[150px]">RETURN DATE</TableHead>
                  <TableHead className="text-right">TOTAL PRICE</TableHead>
                  <TableHead className="w-20">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                      Tidak ada data invoice yang sesuai dengan filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.invoiceNo}>
                      <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                      <TableCell>{invoice.pickupDate}</TableCell>
                      <TableCell>{invoice.returnDate || "-"}</TableCell>
                      <TableCell className="text-right">Rp {invoice.totalPrice.toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleEditInvoice(invoice)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Invoice Dialog */}
      {selectedInvoice && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Invoice</DialogTitle>
              <DialogDescription>Perbarui detail untuk Invoice: {selectedInvoice.invoiceNo}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateInvoice} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNo">No. Invoice</Label>
                <Input
                  id="invoiceNo"
                  type="text"
                  value={editInvoiceNo}
                  onChange={(e) => setEditInvoiceNo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnDate">Tanggal Kembali</Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={editReturnDate}
                  onChange={(e) => setEditReturnDate(e.target.value)}
                  required
                />
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
