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

// --- LOAD ORDERS ---
function loadOrders() {
  syncHistory();
  const tbody = document.getElementById("ordersTableBody");
  const orders = JSON.parse(localStorage.getItem("Orders")) || [];

  tbody.innerHTML = "";

  const nonReservationOrders = orders.filter(
    (order) => order.method !== "Reservation"
  );

  if (nonReservationOrders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">No active orders</td></tr>`;
    return;
  }

  nonReservationOrders.forEach((order) => {
    if (order.status !== "Completed") {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order.orderId}</td>
        <td>${order.method}</td>
        <td>${order.status}</td>
        <td>
          ${
            order.status !== "Completed"
              ? `<button class="btn btn-sm btn-warning" onclick="trackOrder('${order.orderId}')">Track</button>`
              : ""
          }
        </td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewOrder('${
            order.orderId
          }')">View</button>
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

// --- VIEW ORDER ---
function viewOrder(orderId) {
  const orders = JSON.parse(localStorage.getItem("Orders")) || [];
  const order = orders.find((o) => o.orderId === orderId);

  if (!order) return;

  const tbody = document.getElementById("viewOrderItems");
  tbody.innerHTML = "";

  order.items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.quantity}</td>
      <td>${item.name}${item.portion ? " - " + item.portion : ""}</td>
      <td>₱${item.price || 0}</td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("viewOrderTotal").textContent = `₱${order.amount}`;

  // Download Receipt
  document.getElementById("downloadReceiptBtn").onclick = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Logo
    const logoImg = new Image();
    logoImg.src = "../assets/logo.jpg";

    logoImg.onload = function () {
      // Smaller logo size (30x30 px)
      doc.addImage(logoImg, "JPEG", 90, 10, 30, 30);

      // LomiHub title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("LomiHub", 105, 50, { align: "center" });

      // Receipt title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Your Receipt", 105, 70, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      // Order details
      let y = 90;
      doc.text("Order ID", 30, y);
      doc.text(order.orderId, 160, y);
      doc.text("Method", 30, y + 8);
      doc.text(order.method, 160, y + 8);
      doc.text("Order Placed", 30, y + 16);
      doc.text(order.placed, 160, y + 16);

      // Items
      y += 32;
      order.items.forEach((item) => {
        const portionText = item.portion ? ` (${item.portion})` : "";
        const lineText = `${item.quantity} ${item.name}${portionText}`;
        const linePrice = `${(item.price * item.quantity).toFixed(2)}`;

        doc.text(lineText, 30, y);
        doc.text(linePrice, 160, y);
        y += 8;
      });

      // Total
      y += 8;
      doc.setFont("helvetica", "bold");
      doc.text("Total", 30, y);
      doc.text(`${order.amount.toFixed(2)}`, 160, y);

      // Thank you message
      doc.setFontSize(13);
      doc.setFont("helvetica", "normal");
      doc.text("Thank you for your purchase!", 105, y + 80, {
        align: "center",
      });

      doc.save(`Receipt_${order.orderId}.pdf`);
    };
  };

  new bootstrap.Modal(document.getElementById("viewOrderModal")).show();
}

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("Orders")) {
    localStorage.setItem("Orders", JSON.stringify(Orders));
    localStorage.removeItem("OrderHistory");
  }

  loadOrders();
  loadReservation();
  loadHistory();
});

localStorage.clear();

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

function updateNotifCount() {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  const unread = notifications.filter((n) => !n.read).length;
  document.getElementById("notifCount").textContent = unread;
}
