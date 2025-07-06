// Global variable
let totalFeeAmount = 0;

// On page load
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("applicationDate").valueAsDate = new Date();
  calculateFee();
});

// Fee calculation
function calculateFee() {
  const activities = document.querySelectorAll('input[name="activities"]:checked');
  const baseFeePlusGST = 2360;
  let totalFee = 0;

  activities.forEach((activity) => {
    const qtyInput = document.querySelector(`input[name="${getQuantityInputName(activity.value)}"]`);
    const quantity = qtyInput && qtyInput.value ? parseInt(qtyInput.value) : 1;
    totalFee += baseFeePlusGST * quantity;
  });

  totalFeeAmount = totalFee;
  document.getElementById("totalFee").textContent = totalFee.toLocaleString("en-IN");
}

// Quantity input mapping
function getQuantityInputName(activityValue) {
  const map = {
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
  return map[activityValue];
}

// Show/hide payment fields
function togglePaymentFields() {
  const method = document.querySelector('input[name="paymentMethod"]:checked');
  const dd = document.getElementById("ddFields");
  const upi = document.getElementById("upiFields");

  if (method) {
    const isDD = method.value === "DD";
    dd.style.display = isDD ? "block" : "none";
    upi.style.display = isDD ? "none" : "block";

    document.getElementById("ddNumber").required = isDD;
    document.getElementById("ddBankName").required = isDD;
    document.getElementById("ddBranchName").required = isDD;

    document.getElementById("upiTransactionNo").required = !isDD;
    document.getElementById("utrNo").required = !isDD;
    document.getElementById("transactionDate").required = !isDD;
    document.getElementById("upiBankName").required = !isDD;
  }
}

// Form submit
document.getElementById("waterTourismForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const selected = document.querySelectorAll('input[name="activities"]:checked');
  const method = document.querySelector('input[name="paymentMethod"]:checked');

  if (selected.length === 0) {
    alert("Please select at least one activity.");
    return;
  }
  if (!method) {
    alert("Please select a payment method.");
    return;
  }

  document.getElementById("loadingOverlay").style.display = "flex";

  const data = collectFormData();
  submitToGoogleScript(data);
});

// Collect form data
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

  const activities = document.querySelectorAll('input[name="activities"]:checked');
  const details = [];

  activities.forEach((activity) => {
    const name = activity.value;
    const qty = document.querySelector(`input[name="${getQuantityInputName(name)}"]`);
    const quantity = qty && qty.value ? parseInt(qty.value) : 1;

    details.push({
      activity: name,
      quantity,
      fee: 2360 * quantity,
    });
  });

  data.activityDetails = details;
  data.totalFee = totalFeeAmount;
  data.submissionDate = new Date().toISOString();

  return data;
}

// Submit to Google Apps Script (GET with PDF download)
function submitToGoogleScript(data) {
  const scriptURL = "https://script.google.com/macros/s/AKfycbwsol9JXR2E1YuGUhKQ_LQXqbHm6kD78uIvZBE8nqfG7olGZi8b34wMk9iA7qQopXzu/exec";
  const encoded = encodeURIComponent(JSON.stringify(data));

  fetch(`${scriptURL}?data=${encoded}`)
    .then((response) => response.text())
    .then((text) => {
      const result = JSON.parse(text);
      document.getElementById("loadingOverlay").style.display = "none";

      if (result.status === "success") {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${result.pdfBase64}`;
        link.download = result.filename || "Water_Tourism_License.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
        document.getElementById("successMessage").style.display = "flex";
      } else {
        alert("Submission failed: " + result.message);
      }
    })
    .catch((error) => {
      document.getElementById("loadingOverlay").style.display = "none";
      alert("Network or server error: " + error.message);
    });
}
        // Trigger PDF download
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${result.pdfBase64}`;
        link.download = result.filename || "Water_Tourism_Application.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show confirmation
        document.getElementById("successMessage").style.display = "flex";
      } else {
        alert("❌ Submission failed: " + result.message);
      }
    })
    .catch((error) => {
      console.error("Submission Error:", error);
      document.getElementById("loadingOverlay").style.display = "none";
      alert("There was an error submitting your application. Please try again.");
    });
}

// Reset form
function resetForm() {
  const form = document.getElementById("waterTourismForm");
  form.reset();

  document.getElementById("successMessage").style.display = "none";
  document.getElementById("ddFields").style.display = "none";
  document.getElementById("upiFields").style.display = "none";
  document.getElementById("applicationDate").valueAsDate = new Date();
  calculateFee();

  const requiredFields = [
    "applicantName", "address", "contactNumber", "email", "occupation",
    "panNo", "aadhaarGstn", "applicationDate", "areaOfWaterBody", "waterBody", "declaration"
  ];

  requiredFields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.required = true;
  });
}

// Input validations
document.getElementById("contactNumber").addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "").slice(0, 10);
});

document.getElementById("panNo").addEventListener("input", function () {
  this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
});

// Prevent Enter key submission
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && this.type !== "submit") e.preventDefault();
  });
});
