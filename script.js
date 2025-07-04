// Global variables
let totalFeeAmount = 0

// Initialize form
document.addEventListener("DOMContentLoaded", () => {
  // Set today's date as default
  document.getElementById("applicationDate").valueAsDate = new Date()

  // Initialize fee calculation
  calculateFee()
})

// Fee calculation function
function calculateFee() {
  const activities = document.querySelectorAll('input[name="activities"]:checked')
  const baseFeePlusGST = 2360 // ₹2000 + 18% GST
  let totalFee = 0

  activities.forEach((activity) => {
    const activityValue = activity.value
    const qtyInputName = getQuantityInputName(activityValue)
    const qtyInput = document.querySelector(`input[name="${qtyInputName}"]`)

    if (qtyInput && qtyInput.value) {
      const quantity = Number.parseInt(qtyInput.value) || 0
      totalFee += baseFeePlusGST * quantity
    } else if (activity.checked) {
      // If activity is checked but no quantity specified, assume 1
      totalFee += baseFeePlusGST
    }
  })

  totalFeeAmount = totalFee
  document.getElementById("totalFee").textContent = totalFee.toLocaleString("en-IN")
}

// Helper function to get quantity input name
function getQuantityInputName(activityValue) {
  const mapping = {
    "Motor Boat": "motorBoatQty",
    Cruise: "cruiseQty",
    "House Boat": "houseBoatQty",
    "Water Scooter": "waterScooterQty",
    "Water Parasailing": "waterParasailingQty",
    "Mini Cruise": "miniCruiseQty",
    "Paddle Boat": "paddleBoatQty",
    Zorbing: "zorbingQty",
    "Banana Ride": "bananaRideQty",
    "Bumper Ride": "bumperRideQty",
    Parasail: "parasailQty",
  }
  return mapping[activityValue]
}

// Toggle payment fields based on selection
function togglePaymentFields() {
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')
  const ddFields = document.getElementById("ddFields")
  const upiFields = document.getElementById("upiFields")

  if (paymentMethod) {
    if (paymentMethod.value === "DD") {
      ddFields.style.display = "block"
      upiFields.style.display = "none"

      // Make DD fields required
      document.getElementById("ddNumber").required = true
      document.getElementById("ddBankName").required = true
      document.getElementById("ddBranchName").required = true

      // Remove UPI field requirements
      document.getElementById("upiTransactionNo").required = false
      document.getElementById("utrNo").required = false
      document.getElementById("transactionDate").required = false
      document.getElementById("upiBankName").required = false
    } else if (paymentMethod.value === "UPI") {
      ddFields.style.display = "none"
      upiFields.style.display = "block"

      // Make UPI fields required
      document.getElementById("upiTransactionNo").required = true
      document.getElementById("utrNo").required = true
      document.getElementById("transactionDate").required = true
      document.getElementById("upiBankName").required = true

      // Remove DD field requirements
      document.getElementById("ddNumber").required = false
      document.getElementById("ddBankName").required = false
      document.getElementById("ddBranchName").required = false
    }
  }
}

// Form submission handler
document.getElementById("waterTourismForm").addEventListener("submit", (e) => {
  e.preventDefault()

  // Validate that at least one activity is selected
  const selectedActivities = document.querySelectorAll('input[name="activities"]:checked')
  if (selectedActivities.length === 0) {
    alert("Please select at least one activity.")
    return
  }

  // Validate payment method selection
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')
  if (!paymentMethod) {
    alert("Please select a payment method.")
    return
  }

  // Show loading overlay
  document.getElementById("loadingOverlay").style.display = "flex"

  // Collect form data
  const formData = collectFormData()

  // Submit to Google Apps Script
  submitToGoogleScript(formData)
})

// Collect all form data
function collectFormData() {
  const form = document.getElementById("waterTourismForm")
  const formData = new FormData(form)
  const data = {}

  // Basic form fields
  for (const [key, value] of formData.entries()) {
    if (key === "activities") {
      if (!data.activities) data.activities = []
      data.activities.push(value)
    } else {
      data[key] = value
    }
  }

  // Add activity quantities
  const activities = document.querySelectorAll('input[name="activities"]:checked')
  const activityDetails = []

  activities.forEach((activity) => {
    const activityValue = activity.value
    const qtyInputName = getQuantityInputName(activityValue)
    const qtyInput = document.querySelector(`input[name="${qtyInputName}"]`)
    const quantity = qtyInput && qtyInput.value ? Number.parseInt(qtyInput.value) : 1

    activityDetails.push({
      activity: activityValue,
      quantity: quantity,
      fee: 2360 * quantity,
    })
  })

  data.activityDetails = activityDetails
  data.totalFee = totalFeeAmount
  data.submissionDate = new Date().toISOString()

  return data
}

// Submit data to Google Apps Script
function submitToGoogleScript(data) {
  // Replace with your Google Apps Script Web App URL
  const scriptURL = "https://script.google.com/macros/s/AKfycbwsol9JXR2E1YuGUhKQ_LQXqbHm6kD78uIvZBE8nqfG7olGZi8b34wMk9iA7qQopXzu/exec"

  fetch(scriptURL, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log("Success:", result)
      document.getElementById("loadingOverlay").style.display = "none"
      document.getElementById("successMessage").style.display = "flex"
    })
    .catch((error) => {
      console.error("Error:", error)
      document.getElementById("loadingOverlay").style.display = "none"
      alert("There was an error submitting your application. Please try again.")
    })
}

// Reset form function
function resetForm() {
  document.getElementById("waterTourismForm").reset()
  document.getElementById("successMessage").style.display = "none"
  document.getElementById("ddFields").style.display = "none"
  document.getElementById("upiFields").style.display = "none"
  document.getElementById("applicationDate").valueAsDate = new Date()
  calculateFee()

  // Remove required attributes
  const allInputs = document.querySelectorAll("input")
  allInputs.forEach((input) => {
    if (input.type !== "checkbox" && input.type !== "radio") {
      input.required = false
    }
  })

  // Re-add required attributes for basic fields
  const requiredFields = [
    "applicantName",
    "address",
    "contactNumber",
    "email",
    "occupation",
    "panNo",
    "aadhaarGstn",
    "applicationDate",
    "areaOfWaterBody",
    "waterBody",
    "declaration",
  ]
  requiredFields.forEach((fieldName) => {
    const field = document.getElementById(fieldName)
    if (field) field.required = true
  })
}

// Input validation functions
document.getElementById("contactNumber").addEventListener("input", function (e) {
  this.value = this.value.replace(/[^0-9]/g, "").slice(0, 10)
})

document.getElementById("panNo").addEventListener("input", function (e) {
  this.value = this.value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10)
})

// Prevent form submission on Enter key in input fields
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && this.type !== "submit") {
      e.preventDefault()
    }
  })
})
