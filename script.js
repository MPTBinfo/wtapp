// Global variable to track total fee
let totalFeeAmount = 0;

// Initialize form on page load
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("applicationDate").valueAsDate = new Date();
  calculateFee();
});

// Calculate fee based on selected activities and quantities
function calculateFee() {
  const activities = document.querySelectorAll('input[name="activities"]:checked');
  const baseFeePlusGST = 2360;
  let totalFee = 0;

  activities.forEach((activity) => {
    const activityValue = activity.value;
    const qtyInputName = getQuantityInputName(activityValue);
    const qtyInput = document.querySelector(`input[name="${qtyInputName}"]`);

    if (qtyInput && qtyInput.value) {
      const quantity = Number.parseInt(qtyInput.value) || 0;
      totalFee += baseFeePlusGST * quantity;
    } else {
      totalFee += baseFeePlusGST;
    }
  });

  totalFeeAmount = totalFee;
  document.getElementById("totalFee").textContent = totalFee.toLocaleString("en-IN");
}

// Map activity to its corresponding quantity input field
function getQuantityInputName(activityValue) {
  const mapping = {
    "Motor Boat": "motorBoatQty",
    "Cruise": "cruiseQty",
    "House Boat": "houseBoatQty",
    "Water Scooter": "waterScooterQty",
    "Water Parasailing": "waterParasailingQty",
    "Mini Cruise": "miniCruiseQty",
    "Paddle Boat": "paddleBoatQty",
    "Zorbing": "zorbingQty",
    "Banana Ride": "bananaRideQty",
    "Bumper Ride": "bumperRideQty",
    "Parasail": "parasailQty",
  };
  return mapping[activityValue];
}

// Show/hide payment fields based on selected payment method
function togglePaymentFields() {
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
  const ddFields = document.getElementById("ddFields");
  const upiFields = document.getElementById("upiFields");

  if (paymentMethod) {
    if (paymentMethod.value === "DD") {
      ddFields.style.display = "block";
      upiFields.style.display = "none";

      document.getElementById("ddNumber").required = true;
      document.getElementById("ddBankName").required = true;
      document.getElementById("ddBranchName").required = true;

      document.getElementById("upiTransactionNo").required = false;
      document.getElementById("utrNo").required = false;
      document.getElementById("transactionDate").required = false;
      document.getElementById("upiBankName").required = false;
    } else if (paymentMethod.value === "UPI") {
      ddFields.style.display = "none";
      upiFields.style.display = "block";

      document.getElementById("upiTransactionNo").required = true;
      document.getElementById("utrNo").required = true;
      document.getElementById("transactionDate").required = true;
      document.getElementById("upiBankName").required = true;

      document.getElementById("ddNumber").required = false;
      document.getElementById("ddBankName").required = false;
      document.getElementById("ddBranchName").required = false;
    }
  }
}

// Handle form submission
document.getElementById("waterTourismForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const selectedActivities = document.querySelectorAll('input[name="activities"]:checked');
  if (selectedActivities.length === 0) {
    alert("Please select at least one activity.");
    return;
  }

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
  if (!paymentMethod) {
    alert("Please select a payment method.");
    return;
  }

  document.getElementById("loadingOverlay").style.display = "flex";

  const formData = collectFormData();
  submitToGoogleScript(formData);
});

// Gather all data from form
function collectFormData() {
  const form = document.getElementById("waterTourismForm");
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    if (key === "activities") {
      if (!data.activities) data.activities = [];
      data.activities.push(value);
    } else {
      data[key] = value;
    }
  }

  // Add activity details
  const activities = document.querySelectorAll('input[name="activities"]:checked');
  const activityDetails = [];

  activities.forEach((activity) => {
    const activityValue = activity.value;
    const qtyInputName = getQuantityInputName(activityValue);
    const qtyInput = document.querySelector(`input[name="${qtyInputName}"]`);
    const quantity = qtyInput && qtyInput.value ? Number.parseInt(qtyInput.value) : 1;

    activityDetails.push({
      activity: activityValue,
      quantity: quantity,
      fee: 2360 * quantity,
    });
  });

  data.activityDetails = activityDetails;
  data.totalFee = totalFeeAmount;
  data.submissionDate = new Date().toISOString();

  return data;
}

// ✅ CORS-safe GET request to Google Apps Script
function submitToGoogleScript(data) {
  const scriptURL = "https://script.google.com/macros/s/AKfycbwsol9JXR2E1YuGUhKQ_LQXqbHm6kD78uIvZBE8nqfG7olGZi8b34wMk9iA7qQopXzu/exec";
  const encodedData = encodeURIComponent(JSON.stringify(data));

  fetch(`${scriptURL}?data=${encodedData}`)
    .then((response) => response.json())
    .then((result) => {
      console.log("Success:", result);
      document.getElementById("loadingOverlay").style.display = "none";
      document.getElementById("successMessage").style.display = "flex";
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("loadingOverlay").style.display = "none";
      alert("There was an error submitting your application. Please try again.");
    });
}

// Reset the form to initial state
function resetForm() {
  document.getElementById("waterTourismForm").reset();
  document.getElementById("successMessage").style.display = "none";
  document.getElementById("ddFields").style.display = "none";
  document.getElementById("upiFields").style.display = "none";
  document.getElementById("applicationDate").valueAsDate = new Date();
  calculateFee();

  const allInputs = document.querySelectorAll("input");
  allInputs.forEach((input) => {
    if (input.type !== "checkbox" && input.type !== "radio") {
      input.required = false;
    }
  });

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
  ];
  requiredFields.forEach((fieldName) => {
    const field = document.getElementById(fieldName);
    if (field) field.required = true;
  });
}

// Phone number validation
document.getElementById("contactNumber").addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "").slice(0, 10);
});

// PAN validation
document.getElementById("panNo").addEventListener("input", function () {
  this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
});

// Prevent form submission via Enter key in input fields
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && this.type !== "submit") {
      e.preventDefault();
    }
  });
});
