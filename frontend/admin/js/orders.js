function renderOnlineOrders() {
  const tbody = document.getElementById("online-orders-body");
  tbody.innerHTML = "";
  onlineOrders.forEach(order => {
    tbody.innerHTML += `
      <tr data-id="${order.id}">
        <td>${order.id}</td>
        <td>${order.date}</td>
        <td>${order.customer}</td>
        <td>${order.method}</td>
        <td><button class="btn btn-sm btn-warning view-order" data-id="${order.id}" data-type="online">View Order</button></td>
        <td>${order.payment}</td>
        <td>
          <select class="form-select form-select-sm status-dropdown">
            <option ${order.status === "Pending" ? "selected" : ""}>Pending</option>
            <option ${order.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
            <option ${order.status === "In Process" ? "selected" : ""}>In Process</option>
            <option ${order.status === "On Delivery" ? "selected" : ""}>On Delivery</option>
            <option ${order.status === "Completed" ? "selected" : ""}>Completed</option>
            <option ${order.status === "Declined" ? "selected" : ""}>Declined</option>
          </select>
        </td>
      </tr>
    `;
  });
}

function renderWalkinOrders() {
  const tbody = document.getElementById("walkin-orders-body");
  tbody.innerHTML = "";
  walkinOrders.forEach(order => {
    tbody.innerHTML += `
      <tr data-id="${order.id}">
        <td>${order.id}</td>
        <td>${new Date().toLocaleDateString()}</td>
        <td>${order.table}</td>
        <td><button class="btn btn-sm btn-warning view-order" data-id="${order.id}" data-type="walkin">View Order</button></td>
        <td>${order.payment}</td>
        <td>
          <select class="form-select form-select-sm status-dropdown">
            <option ${order.status === "Pending" ? "selected" : ""}>Pending</option>
            <option ${order.status === "In Process" ? "selected" : ""}>In Process</option>
            <option ${order.status === "Completed" ? "selected" : ""}>Completed</option>
          </select>
        </td>
      </tr>
    `;
  });
}


function setupModal() {
  document.addEventListener("click", e => {
    if (e.target.classList.contains("view-order")) {
      const id = e.target.dataset.id;
      const type = e.target.dataset.type;
      let order;
      if (type === "online") {
        order = onlineOrders.find(o => o.id === id);
        document.getElementById("modal-order-details").innerHTML = `
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${order.date}</p>
          <p><strong>Customer:</strong> ${order.customer}</p>
          <p><strong>Method:</strong> ${order.method}</p>
          <p><strong>Payment:</strong> ${order.payment}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        `;
      } else {
        order = walkinOrders.find(o => o.id === id);
        document.getElementById("modal-order-details").innerHTML = `
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${order.date}</p>
          <p><strong>Table Number:</strong> ${order.table}</p>
          <p><strong>Payment:</strong> ${order.payment}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        `;
      }

      const modal = new bootstrap.Modal(document.getElementById("order-modal"));
      modal.show();
    }
  });
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  renderOnlineOrders();
  renderWalkinOrders();
  setupModal();

  // Table toggle
  const orderTypeSelect = document.getElementById("orderTypeSelect");
  const onlineTable = document.getElementById("online-table");
  const walkinTable = document.getElementById("walkin-table");
  function toggleTables() {
    if (orderTypeSelect.value === "Online") {
      onlineTable.style.display = "block";
      walkinTable.style.display = "none";
    } else {
      onlineTable.style.display = "none";
      walkinTable.style.display = "block";
    }
  }
  toggleTables();
  orderTypeSelect.addEventListener("change", toggleTables);
});



function showOrderModal(order, type) {
  const modalBody = document.getElementById("modal-order-body");

  let leftHtml = `<div class="order-items">`;
  order.items.forEach(item => {
    leftHtml += `
      <div class="item-row">
        <span>${item.qty} ${item.name}</span>
        <span>₱${item.price.toFixed(2)}</span>
      </div>
    `;
  });

  leftHtml += `
    <div class="order-total">Total ₱${order.total.toFixed(2)}</div>
  `;

  if (type === "online") {
    if (order.method === "Delivery") {
      leftHtml += `
        <div class="order-extra">
          <p><strong>Address:</strong> ${order.address}</p>
          <p><strong>Phone Number:</strong> ${order.phone}</p>
        </div>
      `;
    } else if (order.method === "Pickup") {
      leftHtml += `<p class="order-extra"><strong>Pickup:</strong> Customer will pick up their order</p>`;
    } else if (order.method === "Reservation") {
      leftHtml += `
        <div class="order-extra">
          <p><strong>Date to Come:</strong> ${order.date}</p>
          <p><strong>Time to Come:</strong> ${order.time}</p>
          <p><strong>No. of Persons:</strong> ${order.persons}</p>
        </div>
      `;
    }
  }

  leftHtml += `</div>`;

  let rightHtml = "";
  if (type === "online" && order.paymentProof) {
    rightHtml = `
      <div class="order-proof">
        <img src="${order.paymentProof}" alt="Payment Proof">
      </div>
    `;
  }

  modalBody.innerHTML = `
    <div class="order-details">
      ${leftHtml}
      ${rightHtml}
    </div>
  `;

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("order-modal"));
  modal.show();
}


// Attach click events
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("view-order")) {
    const id = e.target.dataset.id;
    const type = e.target.dataset.type;
    let order;

    if (type === "online") order = onlineOrders.find(o => o.id === id);
    else order = walkinOrders.find(o => o.id === id);

    showOrderModal(order, type);
  }
});



const onlineOrders = [
  {
    id: "O1001",
    customer: "Juan Dela Cruz",
    method: "Pickup", // Delivery, Pickup, Reservation
    payment: "GCash",
    status: "Pending",
    date: "2025-09-02",
    time: "12:00 PM",
    persons: 3,
    total: 75,
    items: [{ name: "Tapsilog", qty: 1, price: 75 },
      { name: "Lomi", qty: 1, price: 50 },
      { name: "Lomi", qty: 1, price: 50 },
      { name: "ddf", qty: 2, price: 50 },
      { name: "sfd", qty: 1, price: 50 },
          { name: "Lomi", qty: 1, price: 50 },
      { name: "Lomi", qty: 1, price: 50 },
          { name: "Lomi", qty: 1, price: 50 },
      { name: "Lomi", qty: 1, price: 50 },
    
    ],
    paymentProof: "../assets/gcash.jpg"
  }
];

const walkinOrders = [
  {
    id: "W1001",
    table: 5,
    payment: "Cash",
    status: "Completed",
    total: 75,
    items: [{ name: "Tapsilog", qty: 1, price: 75 }]
  }
];
