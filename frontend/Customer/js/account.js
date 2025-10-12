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
window.addEventListener("DOMContentLoaded", async () => {
  // Try to get token from localStorage
  const token = localStorage.getItem("customerToken");

  if (token) {
    try {
      // Fetch profile from backend
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const user = await response.json();

        // Save to localStorage for consistency
        localStorage.setItem("loggedInName", user.username || "");
        localStorage.setItem("loggedInEmail", user.email || "");
        localStorage.setItem("userAddress", user.address || "");
        localStorage.setItem("userPhone", user.phoneNumber || "");
        if (user.profilePicUrl) {
          const imageUrl = user.profilePicUrl.startsWith("http")
            ? user.profilePicUrl
            : `http://localhost:5000${user.profilePicUrl}`;
          localStorage.setItem("loggedInImage", imageUrl);
        }

        // Update UI
        if (document.getElementById("profileImage"))
          document.getElementById("profileImage").src =
            localStorage.getItem("loggedInImage") || "../assets/profile.png";
        if (document.getElementById("username"))
          document.getElementById("username").textContent = user.username || "";
        if (document.getElementById("userEmail"))
          document.getElementById("userEmail").textContent = user.email || "";
        if (document.getElementById("name"))
          document.getElementById("name").value = user.username || "";
        if (document.getElementById("address"))
          document.getElementById("address").value = user.address || "";
        if (document.getElementById("phone-number"))
          document.getElementById("phone-number").value = user.phoneNumber || "";
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  } else {
    // Fallback: Load from localStorage if not logged in
    const name = localStorage.getItem("loggedInName") || "";
    const email = localStorage.getItem("loggedInEmail") || "";
    const address = localStorage.getItem("userAddress") || "";
    const phone = localStorage.getItem("userPhone") || "";
    const image = localStorage.getItem("loggedInImage") || "../assets/profile.png";

    if (document.getElementById("profileImage"))
      document.getElementById("profileImage").src = image;
    if (document.getElementById("username"))
      document.getElementById("username").textContent = name;
    if (document.getElementById("userEmail"))
      document.getElementById("userEmail").textContent = email;
    if (document.getElementById("name"))
      document.getElementById("name").value = name;
    if (document.getElementById("address"))
      document.getElementById("address").value = address;
    if (document.getElementById("phone-number"))
      document.getElementById("phone-number").value = phone;
  }
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

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const phone = document.getElementById("phone-number").value;
  const token = localStorage.getItem("customerToken");

  try {
    const response = await fetch("http://localhost:5000/api/auth/profile", {
      method: "PUT", // or PATCH, depending on your backend route
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        address,
        phoneNumber: phone,
      }),
    });

    if (response.ok) {
      const user = await response.json();
      // Update localStorage and UI with new values
      localStorage.setItem("loggedInName", user.username || "");
      localStorage.setItem("userAddress", user.address || "");
      localStorage.setItem("userPhone", user.phoneNumber || "");

      document.getElementById("username").textContent = user.username || "";
      document.getElementById("name").value = user.username || "";
      document.getElementById("address").value = user.address || "";
      document.getElementById("phone-number").value = user.phoneNumber || "";

      // Disable inputs and toggle buttons
      const inputs = document.querySelectorAll("#profileForm input");
      inputs.forEach((input) => (input.disabled = true));
      document.getElementById("editBtn").style.display = "block";
      document.getElementById("actionBtns").style.display = "none";

      alert("Profile saved successfully!");
    } else {
      const result = await response.json();
      alert(result.message || "Failed to update profile.");
    }
  } catch (err) {
    alert("An error occurred while updating profile.");
    console.error(err);
  }
});

// ================= Profile picture upload =================
document.getElementById("editPhotoBtn").addEventListener("click", () => {
  document.getElementById("photoInput").click();
});

document.getElementById("photoInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file) {
    // Show preview immediately (optional, for instant feedback)
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("profileImage").src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Prepare FormData for upload
    const formData = new FormData();
    formData.append("profilePic", file);

    const token = localStorage.getItem("customerToken");
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const user = await response.json();
        // Save the backend path (not base64) to localStorage
        if (user.profilePicUrl) {
          // Always use absolute URL for consistency
          const imageUrl = user.profilePicUrl.startsWith("http")
            ? user.profilePicUrl
            : `http://localhost:5000${user.profilePicUrl}`;
          localStorage.setItem("loggedInImage", imageUrl);
          document.getElementById("profileImage").src = imageUrl;
        }
        alert("Profile picture updated!");
      } else {
        const result = await response.json();
        alert(result.message || "Failed to update profile picture.");
      }
    } catch (err) {
      alert("An error occurred while uploading profile picture.");
      console.error(err);
    }
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

// Save customer token and customerId if present in URL (for users signed in from homepage or order now page)
document.addEventListener("DOMContentLoaded", () => {
  // Save token
  let token = localStorage.getItem('customerToken');
  const params = new URLSearchParams(window.location.search);
  if (!token && params.has('token')) {
    token = params.get('token');
    localStorage.setItem('customerToken', token);
  }
  // Save userId
  let userId = localStorage.getItem('customerId');
  if (!userId && params.has('userId')) {
    userId = params.get('userId');
    localStorage.setItem('customerId', userId);
  }
  // Save name
  let name = localStorage.getItem('loggedInName');
  if (!name && params.has('name')) {
    name = params.get('name');
    localStorage.setItem('loggedInName', name);
  }
  // Save email (optional, if you pass it in URL)
  let email = localStorage.getItem('loggedInEmail');
  if (!email && params.has('email')) {
    email = params.get('email');
    localStorage.setItem('loggedInEmail', email);
  }
});
