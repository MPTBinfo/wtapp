"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import "jspdf-autotable"

interface ActivityDetail {
  activity: string
  quantity: number
  fee: number
}

interface FormData {
  applicantName: string
  address: string
  contactNumber: string
  email: string
  occupation: string
  panNo: string
  aadhaarGstn: string
  applicationDate: string
  areaOfWaterBody: string
  waterBody: string
  activities: string[]
  activityDetails: ActivityDetail[]
  totalFee: number
  paymentMethod: string
  ddNumber?: string
  ddBankName?: string
  ddBranchName?: string
  upiTransactionNo?: string
  utrNo?: string
  transactionDate?: string
  upiBankName?: string
  declaration: boolean
  submissionDate: string
}

const waterBodies = [
  "Indira Sagar Dam (including Narmada and other tributaries)",
  "Omkareshwar dam (Narmada and other tributaries)",
  "Tawa dam (including Tawa, Denawa and other tributaries)",
  "Bargi dam (including Narmada and other tributaries)",
  "Bansagar Dam (including Soun and other tributaries)",
  "Gandhi Sagar dam (including Chambal and other tributaries)",
  "Manikheda dam (including Sindh and other tributaries)",
  "Halali Dam (including Halali and other tributaries)",
  "Chandpatha Dam (District Shivpuri)",
  "Betwa river flowing near Orchha",
  "Chaural dam (including Chaural and other tributaries)",
  "Gangau dam (including Ken and other tributaries)",
  "Barna dam (including Barna and other tributaries)",
  "Mann Dam (Dhar)",
  "Hathni river and its tributaries",
  "Dholabad Water Body, Ratlam (Jamad River including its tributaries)",
  "Tighara Water Body, Gwalior",
  "Kishanpura Water Body, Betma, Indore",
  "Govindgarh Water body, District Rewa",
  "Kolar Water Body, District Bhopal",
  "Machagora Dam, District Chhindwada",
  "Sapna Dam, District Betul",
]

const activities = [
  "Motor Boat",
  "Cruise",
  "House Boat",
  "Water Scooter",
  "Water Parasailing",
  "Mini Cruise",
  "Paddle Boat",
  "Zorbing",
  "Banana Ride",
  "Bumper Ride",
  "Parasail",
]

export default function WaterTourismApplication() {
  const [formData, setFormData] = useState<Partial<FormData>>({
    applicationDate: new Date().toISOString().split("T")[0],
    activities: [],
    activityDetails: [],
    totalFee: 0,
    paymentMethod: "",
    declaration: false,
  })
  const [activityQuantities, setActivityQuantities] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const calculateFee = () => {
    const baseFeePlusGST = 2360
    let totalFee = 0
    const details: ActivityDetail[] = []

    formData.activities?.forEach((activity) => {
      const quantity = activityQuantities[activity] || 1
      const fee = baseFeePlusGST * quantity
      totalFee += fee
      details.push({ activity, quantity, fee })
    })

    setFormData((prev) => ({
      ...prev,
      totalFee,
      activityDetails: details,
    }))
  }

  useEffect(() => {
    calculateFee()
  }, [formData.activities, activityQuantities])

  const loadImageAsBase64 = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        // Set high resolution for crisp logo
        canvas.width = 200
        canvas.height = 200

        // Draw white circular background
        ctx!.fillStyle = "white"
        ctx!.beginPath()
        ctx!.arc(100, 100, 95, 0, 2 * Math.PI)
        ctx!.fill()

        // Draw logo with high quality
        ctx!.save()
        ctx!.beginPath()
        ctx!.arc(100, 100, 90, 0, 2 * Math.PI)
        ctx!.clip()
        ctx!.drawImage(img, 10, 10, 180, 180)
        ctx!.restore()

        resolve(canvas.toDataURL("image/png"))
      }
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = src
    })
  }

  const generatePDF = async (data: FormData) => {
    const doc = new jsPDF()

    // Load logo once for both header and watermark
    let logoBase64 = ""
    try {
      logoBase64 = await loadImageAsBase64("/logo.png")
    } catch (error) {
      console.log("Logo failed to load")
    }

    // Add watermark - very faded MPTB logo
    if (logoBase64) {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        await new Promise((resolve) => {
          img.onload = () => {
            canvas.width = 150
            canvas.height = 150
            ctx!.globalAlpha = 0.05 // Very faded watermark
            ctx!.drawImage(img, 0, 0, 150, 150)

            const watermarkData = canvas.toDataURL("image/png")
            doc.addImage(watermarkData, "PNG", 80, 120, 50, 50)
            resolve(true)
          }
          img.src = logoBase64
        })
      } catch (error) {
        console.log("Watermark failed")
      }
    }

    // Header with blue background
    doc.setFillColor(30, 58, 138)
    doc.rect(0, 0, 210, 35, "F")

    // Add high-quality logo to header
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, "PNG", 15, 5, 25, 25)
      } catch (error) {
        console.log("Header logo failed")
      }
    }

    // Header text in white
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("MADHYA PRADESH TOURISM BOARD", 105, 15, { align: "center" })
    doc.setFontSize(10)
    doc.text("Water Tourism License Application", 105, 25, { align: "center" })

    // Reset text color to black
    doc.setTextColor(0, 0, 0)

    let yPos = 45

    // Compact Application Info - single row with darker borders
    doc.autoTable({
      startY: yPos,
      head: [["Submission Date", "Application Date"]],
      body: [
        [
          new Date(data.submissionDate).toLocaleDateString("en-IN"),
          new Date(data.applicationDate).toLocaleDateString("en-IN"),
        ],
      ],
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontSize: 8,
        fontStyle: "bold",
        halign: "center",
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      bodyStyles: {
        fontSize: 8,
        halign: "center",
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      margin: { left: 20, right: 20 },
      tableWidth: "auto",
    })

    yPos = (doc as any).lastAutoTable.finalY + 5

    // Compact Applicant Details - 2 columns with darker borders
    doc.autoTable({
      startY: yPos,
      head: [["Field", "Information"]],
      body: [
        ["Name", data.applicantName || ""],
        ["Contact", data.contactNumber || ""],
        ["Email", data.email || ""],
        ["PAN", data.panNo || ""],
        ["Address", (data.address || "").substring(0, 50) + (data.address && data.address.length > 50 ? "..." : "")],
      ],
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontSize: 8,
        fontStyle: "bold",
        halign: "left",
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      bodyStyles: {
        fontSize: 7,
        halign: "left",
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 140 },
      },
    })

    yPos = (doc as any).lastAutoTable.finalY + 5

    // Water Body - compact with darker borders
    doc.autoTable({
      startY: yPos,
      head: [["Water Body", "Area"]],
      body: [
        [
          (data.waterBody || "").substring(0, 60) + (data.waterBody && data.waterBody.length > 60 ? "..." : ""),
          data.areaOfWaterBody || "",
        ],
      ],
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontSize: 8,
        fontStyle: "bold",
        halign: "left",
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      bodyStyles: {
        fontSize: 7,
        halign: "left",
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 50 },
      },
    })

    yPos = (doc as any).lastAutoTable.finalY + 5

    // Activity Details - Fixed number formatting with darker borders
    const activityTableData =
      data.activityDetails?.map((detail) => [
        detail.activity,
        detail.quantity.toString(),
        "Rs " + detail.fee.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      ]) || []

    doc.autoTable({
      startY: yPos,
      head: [["Activity", "Qty", "Fee"]],
      body: activityTableData,
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontSize: 8,
        fontStyle: "bold",
        halign: "center",
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      bodyStyles: {
        fontSize: 7,
        halign: "center",
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 80, halign: "left" },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 70, halign: "right" },
      },
    })

    yPos = (doc as any).lastAutoTable.finalY + 5

    // Payment Details - compact with fixed formatting and darker borders
    const paymentData = [
      ["Total Fee", "Rs " + data.totalFee.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")],
      ["Method", data.paymentMethod || ""],
    ]

    if (data.paymentMethod === "DD") {
      paymentData.push(["DD No.", data.ddNumber || ""], ["Bank", data.ddBankName || ""])
    } else if (data.paymentMethod === "UPI") {
      paymentData.push(["UPI ID", data.upiTransactionNo || ""], ["UTR", data.utrNo || ""])
    }

    doc.autoTable({
      startY: yPos,
      head: [["Payment", "Details"]],
      body: paymentData,
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontSize: 8,
        fontStyle: "bold",
        halign: "left",
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      bodyStyles: {
        fontSize: 7,
        halign: "left",
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 130 },
      },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // Compact Declaration and Signature
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text("Declaration: Accepted", 20, yPos)
    yPos += 8
    doc.text("Applicant: " + (data.applicantName || ""), 20, yPos)
    yPos += 8
    doc.text("Signature: ____________________", 20, yPos)

    // Compact Footer
    doc.setFillColor(30, 58, 138)
    doc.rect(0, 285, 210, 12, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(6)
    doc.text("MP Tourism Board - Water Tourism License", 105, 292, { align: "center" })

    return doc
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.activities?.length) {
      alert("Please select at least one activity.")
      return
    }
    if (!formData.paymentMethod) {
      alert("Please select a payment method.")
      return
    }
    if (!formData.declaration) {
      alert("Please accept the declaration.")
      return
    }

    setIsSubmitting(true)

    try {
      const submissionData: FormData = {
        ...(formData as FormData),
        submissionDate: new Date().toISOString(),
      }

      // Generate PDF for download
      const pdfDoc = await generatePDF(submissionData)
      pdfDoc.save(`Water_Tourism_License_${submissionData.applicantName?.replace(/\s+/g, "_")}_${Date.now()}.pdf`)

      // Send only essential data to avoid corruption - NO PDF in email
      const emailData = {
        submissionDate: submissionData.submissionDate,
        applicantName: submissionData.applicantName,
        contactNumber: submissionData.contactNumber,
        email: submissionData.email,
        address: submissionData.address,
        occupation: submissionData.occupation,
        panNo: submissionData.panNo,
        aadhaarGstn: submissionData.aadhaarGstn,
        applicationDate: submissionData.applicationDate,
        areaOfWaterBody: submissionData.areaOfWaterBody,
        waterBody: submissionData.waterBody,
        activities: submissionData.activities,
        totalFee: submissionData.totalFee,
        paymentMethod: submissionData.paymentMethod,
        ddNumber: submissionData.ddNumber || "",
        ddBankName: submissionData.ddBankName || "",
        ddBranchName: submissionData.ddBranchName || "",
        upiTransactionNo: submissionData.upiTransactionNo || "",
        utrNo: submissionData.utrNo || "",
        transactionDate: submissionData.transactionDate || "",
        upiBankName: submissionData.upiBankName || "",
      }

      const scriptURL =
        "https://script.google.com/macros/s/AKfycbz_fI90oFjlAGl7adIIvf9vwHu9SegVBFjDIHEnJjH6mC_HNsMJitj0_u1pQK8gqDLspA/exec"

      // Send as form data to avoid JSON parsing issues
      const formDataToSend = new FormData()
      Object.entries(emailData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSend.append(key, value.join(", "))
        } else {
          formDataToSend.append(key, String(value))
        }
      })

      try {
        await fetch(scriptURL, {
          method: "POST",
          body: formDataToSend,
          mode: "no-cors",
        })
        console.log("Email sent successfully")
      } catch (netErr) {
        console.warn("Email sending failed:", netErr)
        // Continue with success popup even if email fails
      }

      // Show success popup
      const activityList = submissionData.activities?.join(", ") || "selected activities"
      const successMessage = `You have successfully applied for your ${activityList}. Please contact MPTB at 8817369119 or investinwb.mptb@mp.gov.in for further proceedings.`

      setSuccessMessage(successMessage)
      setShowSuccessPopup(true)
    } catch (error) {
      console.error("Submission Error:", error)
      setIsSubmitting(false)
      alert("There was an error submitting your application. Please try again.")
    }
  }

  const handleActivityChange = (activity: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        activities: [...(prev.activities || []), activity],
      }))
      setActivityQuantities((prev) => ({
        ...prev,
        [activity]: 1,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        activities: prev.activities?.filter((a) => a !== activity) || [],
      }))
      setActivityQuantities((prev) => {
        const newQuantities = { ...prev }
        delete newQuantities[activity]
        return newQuantities
      })
    }
  }

  const handleQuantityChange = (activity: string, quantity: number) => {
    setActivityQuantities((prev) => ({
      ...prev,
      [activity]: Math.max(1, quantity),
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src="/logo.png" alt="MP Government Logo" className="w-20 h-20 bg-white rounded-full p-1" />
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Madhya Pradesh Tourism Board</h1>
              <h2 className="text-xl font-medium opacity-90">Water Tourism License Application</h2>
            </div>
          </div>
          <Button
            onClick={() => (window.location.href = "/admin")}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-blue-800 bg-transparent"
          >
            Admin Login
          </Button>
        </div>
      </header>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center shadow-xl">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-medium">Submitting your application...</p>
            <p className="text-sm text-gray-600 mt-2">Please wait while we process your request</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Applicant Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-800">Section 1: Applicant Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="applicantName">Applicant Name *</Label>
                  <Input
                    id="applicantName"
                    value={formData.applicantName || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, applicantName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    pattern="[0-9]{10}"
                    value={formData.contactNumber || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactNumber: e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                      }))
                    }
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email ID *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, occupation: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="panNo">PAN No. *</Label>
                  <Input
                    id="panNo"
                    pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                    value={formData.panNo || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        panNo: e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 10),
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="aadhaarGstn">Aadhaar/GSTN No. *</Label>
                  <Input
                    id="aadhaarGstn"
                    value={formData.aadhaarGstn || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, aadhaarGstn: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Water Body Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-800">Section 2: Water Body Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="applicationDate">Date of Application *</Label>
                  <Input
                    id="applicationDate"
                    type="date"
                    value={formData.applicationDate || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, applicationDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="areaOfWaterBody">Area of Water Body *</Label>
                  <Input
                    id="areaOfWaterBody"
                    value={formData.areaOfWaterBody || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, areaOfWaterBody: e.target.value }))}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="waterBody">Water Body *</Label>
                  <Select
                    value={formData.waterBody || ""}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, waterBody: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Water Body" />
                    </SelectTrigger>
                    <SelectContent>
                      {waterBodies.map((body, index) => (
                        <SelectItem key={index} value={body}>
                          {index + 1}. {body}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-800">Section 3: Activities (with Fee Calculation)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {activities.map((activity) => (
                  <div key={activity} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={activity}
                        checked={formData.activities?.includes(activity) || false}
                        onCheckedChange={(checked) => handleActivityChange(activity, checked as boolean)}
                      />
                      <Label htmlFor={activity} className="font-medium cursor-pointer">
                        {activity}
                      </Label>
                    </div>
                    {formData.activities?.includes(activity) && (
                      <Input
                        type="number"
                        min="1"
                        value={activityQuantities[activity] || 1}
                        onChange={(e) => handleQuantityChange(activity, Number.parseInt(e.target.value) || 1)}
                        className="w-20 text-center"
                        placeholder="Qty"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-blue-800 font-semibold mb-2">Total Fee Calculation:</h4>
                <p className="text-blue-700 mb-4">Base Fee: ₹2000 + 18% GST = ₹2360 per activity per quantity</p>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-800 bg-white p-4 rounded-lg">
                    Total Amount: ₹{formData.totalFee?.toLocaleString("en-IN") || "0"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-800">Section 4: Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.paymentMethod || ""}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                className="flex gap-8 mb-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DD" id="dd" />
                  <Label htmlFor="dd">Demand Draft (DD)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="UPI" id="upi" />
                  <Label htmlFor="upi">UPI</Label>
                </div>
              </RadioGroup>

              {formData.paymentMethod === "DD" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="ddNumber">DD Number</Label>
                    <Input
                      id="ddNumber"
                      value={formData.ddNumber || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, ddNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ddBankName">Bank Name</Label>
                    <Input
                      id="ddBankName"
                      value={formData.ddBankName || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, ddBankName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ddBranchName">Branch Name</Label>
                    <Input
                      id="ddBranchName"
                      value={formData.ddBranchName || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, ddBranchName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              )}

              {formData.paymentMethod === "UPI" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="upiTransactionNo">UPI Transaction No.</Label>
                    <Input
                      id="upiTransactionNo"
                      value={formData.upiTransactionNo || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, upiTransactionNo: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="utrNo">UTR No.</Label>
                    <Input
                      id="utrNo"
                      value={formData.utrNo || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, utrNo: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="transactionDate">Date of Transaction</Label>
                    <Input
                      id="transactionDate"
                      type="date"
                      value={formData.transactionDate || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, transactionDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="upiBankName">Bank Name</Label>
                    <Input
                      id="upiBankName"
                      value={formData.upiBankName || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, upiBankName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 5: Declaration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-800">Section 5: Declaration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="declaration"
                    checked={formData.declaration || false}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, declaration: checked as boolean }))}
                    required
                  />
                  <Label htmlFor="declaration" className="text-sm leading-relaxed cursor-pointer">
                    I hereby declare that the above details are true and correct to the best of my knowledge.
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="text-center">
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700 px-12 py-3 text-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg text-center shadow-xl max-w-md mx-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-600 mb-4">Application Submitted Successfully!</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">{successMessage}</p>
              <Button
                onClick={() => {
                  setShowSuccessPopup(false)
                  setSuccessMessage("")
                  // Reset form when user clicks close
                  setFormData({
                    applicationDate: new Date().toISOString().split("T")[0],
                    activities: [],
                    activityDetails: [],
                    totalFee: 0,
                    paymentMethod: "",
                    declaration: false,
                  })
                  setActivityQuantities({})
                  setIsSubmitting(false)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
