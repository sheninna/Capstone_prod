// Tabs logic
const tabs = document.querySelectorAll(".tab-link");
const contents = document.querySelectorAll(".tab-content");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    contents.forEach((c) => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// Profile edit logic
// ================= Load user info on page load =================
window.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("loggedInName") || "";
  const email = localStorage.getItem("loggedInEmail") || "";
  const image =
    localStorage.getItem("loggedInImage") || "../assets/profile.png";

  // Update profile section
  document.getElementById("Username").textContent = name;
  document.getElementById("UserEmail").textContent = email;
  document.getElementById("profileImage").src = image;

  // Fill form fields
  document.getElementById("name").value = name;
  document.getElementById("address").value =
    localStorage.getItem("userAddress") || "";
  document.getElementById("phone-number").value =
    localStorage.getItem("userPhone") || "";
});

// ================= Edit / Cancel / Save =================
const editBtn = document.getElementById("editBtn");
const cancelBtn = document.getElementById("cancelBtn");
const actionBtns = document.getElementById("actionBtns");
const inputs = document.querySelectorAll("#profileForm input");

editBtn.addEventListener("click", () => {
  inputs.forEach((input) => (input.disabled = false));
  editBtn.style.display = "none";
  actionBtns.style.display = "flex";
});

cancelBtn.addEventListener("click", () => {
  inputs.forEach((input) => (input.disabled = true));
  editBtn.style.display = "block";
  actionBtns.style.display = "none";

  // Reset values to stored data
  document.getElementById("name").value =
    localStorage.getItem("loggedInName") || "";
  document.getElementById("address").value =
    localStorage.getItem("userAddress") || "";
  document.getElementById("phone-number").value =
    localStorage.getItem("userPhone") || "";
});

document.getElementById("profileForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const phone = document.getElementById("phone-number").value;

  localStorage.setItem("loggedInName", name);
  localStorage.setItem("userAddress", address);
  localStorage.setItem("userPhone", phone);

  // Update UI
  document.getElementById("Username").textContent = name;
  document.getElementById("UserEmail").textContent = email;

  inputs.forEach((input) => (input.disabled = true));
  editBtn.style.display = "block";
  actionBtns.style.display = "none";

  alert("Profile saved successfully!");
});

// ================= Profile picture upload =================
document.getElementById("editPhotoBtn").addEventListener("click", () => {
  document.getElementById("photoInput").click();
});

document.getElementById("photoInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const profileImage = document.getElementById("profileImage");
      profileImage.src = e.target.result;

      localStorage.setItem("loggedInImage", e.target.result);
    };
    reader.readAsDataURL(file);
  }
});

// Password visibility toggle
function setupPasswordToggle(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);

  toggle.addEventListener("click", () => {
    if (input.type === "password") {
      input.type = "text";
      toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      input.type = "password";
      toggle.innerHTML = '<i class="fas fa-eye"></i>';
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupPasswordToggle("toggleCurrentPass", "currentPass");
  setupPasswordToggle("toggleNewPass", "newPass");
  setupPasswordToggle("toggleConfirmPass", "confirmPass");

  document.getElementById("userEmail").textContent =
    localStorage.getItem("loggedInEmail") || "";
  document.getElementById("userName").textContent =
    localStorage.getItem("loggedInName") || "Guest";
  document.getElementById("userImage").src =
    localStorage.getItem("loggedInImage") ||
    "customer/images/default-profile.png";

  updateNotifCount();
});

document.getElementById("passwordForm").addEventListener("submit", (e) => {
  e.preventDefault();

  document.getElementById("currentPassError").textContent = "";
  document.getElementById("newPassError").textContent = "";
  document.getElementById("confirmPassError").textContent = "";

  const currentPass = document.getElementById("currentPass").value;
  const newPass = document.getElementById("newPass").value;
  const confirmPass = document.getElementById("confirmPass").value;

  let isValid = true;

  if (!currentPass) {
    document.getElementById("currentPassError").textContent =
      "Current password is required";
    isValid = false;
  }

  if (!newPass) {
    document.getElementById("newPassError").textContent =
      "New password is required";
    isValid = false;
  } else if (newPass.length < 6) {
    document.getElementById("newPassError").textContent =
      "Password must be at least 6 characters";
    isValid = false;
  }

  if (newPass !== confirmPass) {
    document.getElementById("confirmPassError").textContent =
      "Passwords do not match";
    isValid = false;
  }

  if (isValid) {
    alert("Password updated successfully!");
    document.getElementById("passwordForm").reset();
    document.querySelector('[data-tab="profile"]').click();
  }
});
