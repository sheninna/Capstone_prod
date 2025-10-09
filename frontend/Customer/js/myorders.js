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

const Orders = [
  {
    orderId: "ORD001",
    method: "Delivery",
    status: "On Delivery",
    placed: "2025-09-21",
    time: "7:00 PM",
    amount: 350,
    items: [
      { quantity: 1, name: "Palabok", portion: "Medium", price: 750 },
      { quantity: 1, name: "Graham", portion: "", price: 200 },
    ],
  },
  {
    orderId: "RES001",
    method: "Reservation",
    status: "In Process",
    placed: "2025-09-10",
    date: "2025-09-21",
    time: "7:00 PM",
    amount: 350,
    items: [
      { quantity: 1, name: "Palabok", portion: "Medium", price: 750 },
      { quantity: 1, name: "Graham", portion: "", price: 200 },
    ],
  },
  {
    orderId: "ORD002",
    method: "Pickup",
    status: "In Process",
    placed: "2025-09-01",
    date: "2025-09-15",
    amount: 200,
    items: [{ quantity: 1, name: "Lomi", portion: "Large", price: 95 }],
  },
];

// --- REPLACE Orders loading with backend fetch ---

// Fetch orders from backend for the logged-in customer
async function fetchCustomerOrders() {
  const token = getCustomerToken();
  if (!token) return [];

  try {
    const response = await fetch('http://localhost:5000/api/auth/get-orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    return [];
  }
}

// --- LOAD ORDERS from backend ---
async function loadOrders() {
  syncHistory();
  const tbody = document.getElementById("ordersTableBody");
  const orders = await fetchCustomerOrders();

  tbody.innerHTML = "";

  // Filter out reservations if needed (assuming orderType or method field)
  const nonReservationOrders = orders.filter(
    (order) => (order.method || order.orderType) !== "Reservation"
  );

  if (nonReservationOrders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">No active orders</td></tr>`;
    return;
  }

  nonReservationOrders.forEach((order) => {
    if ((order.status || "").toLowerCase() !== "completed") {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order.orderNumber || order.orderId || order._id}</td>
        <td>${order.method || order.orderType}</td>
        <td>${order.status}</td>
        <td>
          ${
            (order.status || "").toLowerCase() !== "completed"
              ? `<button class="btn btn-sm btn-warning" onclick="trackOrder('${order.orderNumber || order.orderId || order._id}')">Track</button>`
              : ""
          }
        </td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewOrder('${order.orderNumber || order.orderId || order._id}')">View</button>
        </td>
      `;
      tbody.appendChild(row);
    }
  });
}

// --- LOAD RESERVATIONS ---
function loadReservation() {
  syncHistory();
  const tbody = document.getElementById("reservationTableBody");

  const orders = JSON.parse(localStorage.getItem("Orders")) || [];
  const reservations = JSON.parse(localStorage.getItem("Reservations")) || [];

  const reservationOrders = orders.filter(
    (order) => order.method === "Reservation"
  );
  const allReservations = [...reservationOrders, ...reservations];

  tbody.innerHTML = "";

  if (allReservations.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">No active reservation</td></tr>`;
    return;
  }

  allReservations.forEach((res) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${res.orderId || res.id}</td>
      <td>${res.method}</td>
      <td>${res.placed || res.placed}</td>
      <td>₱${res.amount}</td>
      <td>${res.date || ""}</td>
      <td>${res.time || ""}</td>
    `;
    tbody.appendChild(row);
  });
}

function loadHistory() {
  syncHistory();
  const tbody = document.getElementById("HistoryTableBody");
  const orderHistory = JSON.parse(localStorage.getItem("OrderHistory")) || [];
  const reservationHistory =
    JSON.parse(localStorage.getItem("ReservationHistory")) || [];

  tbody.innerHTML = "";

  if (orderHistory.length === 0 && reservationHistory.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">No completed orders or reservations</td></tr>`;
    return;
  }

  orderHistory.forEach((order) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${order.orderId}</td>
            <td>${order.method}</td>
            <td>${order.placed}</td>
            <td>₱${order.amount}</td>
            <td>${order.status}</td>
        `;
    tbody.appendChild(row);
  });

  reservationHistory.forEach((res) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${res.id}</td>
            <td>${res.method}</td>
            <td>${res.placed}</td>
            <td>₱${res.amount}</td>
            <td>${res.status}</td>
        `;
    tbody.appendChild(row);
  });
}

function updateHistory() {
  let orders = JSON.parse(localStorage.getItem("Orders")) || [];
  const history = orders.filter(
    (o) => o.status === "Completed" || o.status === "Declined"
  );
  localStorage.setItem("History", JSON.stringify(history));

  orders = orders.filter(
    (o) => o.status !== "Completed" && o.status !== "Declined"
  );
  localStorage.setItem("Orders", JSON.stringify(orders));
}

function syncHistory() {
  // Orders
  let orders = JSON.parse(localStorage.getItem("Orders")) || [];
  let orderHistory = JSON.parse(localStorage.getItem("OrderHistory")) || [];
  const completedOrders = orders.filter(
    (o) => o.status === "Completed" || o.status === "Declined"
  );
  completedOrders.forEach((order) => {
    if (!orderHistory.some((h) => h.orderId === order.orderId)) {
      orderHistory.push(order);
    }
  });
  orders = orders.filter(
    (o) => o.status !== "Completed" && o.status !== "Declined"
  );
  localStorage.setItem("Orders", JSON.stringify(orders));
  localStorage.setItem("OrderHistory", JSON.stringify(orderHistory));

  // Reservations
  let reservations = JSON.parse(localStorage.getItem("Reservations")) || [];
  let reservationHistory =
    JSON.parse(localStorage.getItem("ReservationHistory")) || [];
  const completedReservations = reservations.filter(
    (r) => r.status === "Completed" || r.status === "Declined"
  );
  completedReservations.forEach((res) => {
    if (!reservationHistory.some((h) => h.id === res.id)) {
      reservationHistory.push(res);
    }
  });
  reservations = reservations.filter(
    (r) => r.status !== "Completed" && r.status !== "Declined"
  );
  localStorage.setItem("Reservations", JSON.stringify(reservations));
  localStorage.setItem(
    "ReservationHistory",
    JSON.stringify(reservationHistory)
  );
}

// --- TRACK ORDER ---
function trackOrder(orderId) {
  const orders = JSON.parse(localStorage.getItem("Orders")) || [];
  const order = orders.find((o) => o.orderId === orderId);

  if (!order) return;

  const stepsList = document.getElementById("tracking-steps");
  const messageBox = document.getElementById("tracking-message");
  stepsList.innerHTML = "";

  let steps = [];
  if (order.method === "Delivery") {
    steps = ["Order Placed", "In Process", "On Delivery"];
  } else if (order.method === "Pickup") {
    steps = ["Order Placed", "In Process"];
  }

  const status = (order.status || "").toLowerCase();
  let currentStep = "Order Placed";

  switch (status) {
    case "pending":
      currentStep = "Order Placed";
      break;
    case "confirmed":
      currentStep = "Order Placed";
      break;
    case "in process":
      currentStep = "In Process";
      break;
    case "on delivery":
      if (order.method === "Delivery") currentStep = "On Delivery";
      break;
    case "completed":
    case "declined":
      currentStep = steps[steps.length - 1];
      break;
    default:
      currentStep = "Order Placed";
  }

  const currentIndex =
    steps.indexOf(currentStep) !== -1 ? steps.indexOf(currentStep) : 0;

  steps.forEach((step, index) => {
    const li = document.createElement("li");
    li.textContent = step;
    if (index <= currentIndex) li.classList.add("active");
    stepsList.appendChild(li);
  });

  let message = "";
  if (order.method === "Delivery") {
    if (currentStep === "Order Placed") message = "Your order has been placed";
    else if (currentStep === "In Process") message = "Your order is in process";
    else if (currentStep === "On Delivery")
      message = "Your order is on delivery";
  } else if (order.method === "Pickup") {
    if (currentStep === "Order Placed") message = "Your order has been placed";
    else if (currentStep === "In Process") message = "Your order is in process";
  }

  messageBox.textContent = message;

  new bootstrap.Modal(document.getElementById("trackOrderModal")).show();
}

// --- VIEW ORDER (fetch from backend, show modal, no hr in JS) ---
async function viewOrder(orderId) {
  // Fetch orders from backend
  const orders = await fetchCustomerOrders();
  // Find the order by orderNumber, orderId, or _id
  const order = orders.find(
    (o) =>
      o.orderNumber == orderId ||
      o.orderId == orderId ||
      o._id == orderId
  );

  if (!order) return;

  // Set modal title
  const modalTitle = document.querySelector("#viewOrderModal .modal-title");
  if (modalTitle) modalTitle.textContent = "Order Details";

  // Ensure modal background is white
  const modalContent = document.querySelector("#viewOrderModal .modal-content");
  if (modalContent) modalContent.style.background = "#fff";

  // Fill the modal table
  const tbody = document.getElementById("viewOrderItems");
  tbody.innerHTML = "";

  (order.items || []).forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="width:20%; font-size:1.1rem;">${item.quantity}</td>
      <td style="width:60%; font-size:1.1rem;">${item.name}${item.portion ? " - " + item.portion : ""}</td>
      <td style="width:20%; text-align:right; font-size:1.1rem;">₱${(item.price || 0).toLocaleString()}</td>
    `;
    tbody.appendChild(row);
  });

  // Show total, styled and right-aligned, bold, just below the table
  const totalDiv = document.getElementById("viewOrderTotal");
  if (totalDiv) {
    totalDiv.textContent = `₱${(order.totalAmount || order.amount || 0).toLocaleString()}`;
    totalDiv.className = "fw-bold fs-5 d-flex justify-content-end align-items-center mt-3 mb-2";
    totalDiv.style.fontWeight = "bold";
    totalDiv.style.fontSize = "1.25rem";
  }

  // Center the Download Receipt button under the total
  const downloadBtn = document.getElementById("downloadReceiptBtn");
  if (downloadBtn) {
    downloadBtn.className = "btn btn-warning px-4 mt-3 d-block mx-auto";
    downloadBtn.style.fontWeight = "500";
  }

  // Download Receipt logic (unchanged)
  downloadBtn.onclick = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Logo
    const logoImg = new Image();
    logoImg.src = "../assets/logo.jpg";

    logoImg.onload = function () {
      doc.addImage(logoImg, "JPEG", 90, 10, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("LomiHub", 105, 50, { align: "center" });
      doc.setFontSize(20);
      doc.text("Your Receipt", 105, 70, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      let y = 90;
      doc.text("Order ID", 30, y);
      doc.text(order.orderNumber || order.orderId || order._id, 160, y);
      doc.text("Method", 30, y + 8);
      doc.text(order.method || order.orderType, 160, y + 8);
      doc.text("Order Placed", 30, y + 16);
      doc.text(
        order.placed ||
          (order.orderPlaced
            ? new Date(order.orderPlaced).toLocaleString()
            : ""),
        160,
        y + 16
      );

      y += 32;
      (order.items || []).forEach((item) => {
        const portionText = item.portion ? ` (${item.portion})` : "";
        const lineText = `${item.quantity} ${item.name}${portionText}`;
        const linePrice = `${(item.price * item.quantity).toFixed(2)}`;
        doc.text(lineText, 30, y);
        doc.text(linePrice, 160, y);
        y += 8;
      });

      y += 8;
      doc.setFont("helvetica", "bold");
      doc.text("Total", 30, y);
      doc.text(`${(order.totalAmount || order.amount || 0).toFixed(2)}`, 160, y);

      doc.setFontSize(13);
      doc.setFont("helvetica", "normal");
      doc.text("Thank you for your purchase!", 105, y + 80, {
        align: "center",
      });

      doc.save(`Receipt_${order.orderNumber || order.orderId || order._id}.pdf`);
    };
  };

  // Show the modal (Bootstrap 5)
  const modal = new bootstrap.Modal(document.getElementById("viewOrderModal"));
  modal.show();
}

// --- TRACK ORDER: update to use backend data ---
async function trackOrder(orderId) {
  const orders = await fetchCustomerOrders();
  const order = orders.find(
    (o) =>
      o.orderNumber === orderId ||
      o.orderId === orderId ||
      o._id === orderId
  );

  if (!order) return;

  const stepsList = document.getElementById("tracking-steps");
  const messageBox = document.getElementById("tracking-message");
  stepsList.innerHTML = "";

  let steps = [];
  const method = order.method || order.orderType;
  if (method === "Delivery") {
    steps = ["Order Placed", "In Process", "On Delivery"];
  } else if (method === "Pickup") {
    steps = ["Order Placed", "In Process"];
  }

  const status = (order.status || "").toLowerCase();
  let currentStep = "Order Placed";

  switch (status) {
    case "pending":
      currentStep = "Order Placed";
      break;
    case "confirmed":
      currentStep = "Order Placed";
      break;
    case "in process":
      currentStep = "In Process";
      break;
    case "on delivery":
      if (method === "Delivery") currentStep = "On Delivery";
      break;
    case "completed":
    case "declined":
      currentStep = steps[steps.length - 1];
      break;
    default:
      currentStep = "Order Placed";
  }

  const currentIndex =
    steps.indexOf(currentStep) !== -1 ? steps.indexOf(currentStep) : 0;

  steps.forEach((step, index) => {
    const li = document.createElement("li");
    li.textContent = step;
    if (index <= currentIndex) li.classList.add("active");
    stepsList.appendChild(li);
  });

  let message = "";
  if (method === "Delivery") {
    if (currentStep === "Order Placed") message = "Your order has been placed";
    else if (currentStep === "In Process") message = "Your order is in process";
    else if (currentStep === "On Delivery")
      message = "Your order is on delivery";
  } else if (method === "Pickup") {
    if (currentStep === "Order Placed") message = "Your order has been placed";
    else if (currentStep === "In Process") message = "Your order is in process";
  }

  messageBox.textContent = message;

  new bootstrap.Modal(document.getElementById("trackOrderModal")).show();
}

// --- AUTH LOGIC: Save token after login and use it on all pages ---

function saveCustomerToken(token) {
  if (token) {
    localStorage.setItem('customerToken', token);
  }
}

function getCustomerToken() {
  return localStorage.getItem('customerToken');
}

// Example usage: check login status on page load
document.addEventListener("DOMContentLoaded", () => {
  const token = getCustomerToken();
  if (!token) {
    // Optionally redirect to login or show login modal
    // window.location.href = "login.html";
    // Or show a message/modal
  }

  loadOrders();
  // You can update loadReservation and loadHistory similarly if you add backend endpoints for them
});
