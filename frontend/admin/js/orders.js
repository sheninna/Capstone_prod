let onlineOrders = [];
let walkinOrders = [];
let foodPriceMap = {};

// Fetch orders from backend and split into online/walk-in
async function fetchOrders() {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch('http://localhost:5000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Not authorized or server error');
    const orders = await response.json();
    console.log(orders); // Check if orderNumber is present and 5 digits
    onlineOrders = orders.filter(order =>
      order.orderType === "online" ||
      order.orderType === "reservation" ||
      order.orderType === "delivery" ||
      order.orderType === "pickup"
    );

    walkinOrders = orders.filter(order =>
      order.orderType === "walk-in" ||
      order.source === "walk-in" ||
      order.method === "Walk-in"
    );
    renderOnlineOrders();
    renderWalkinOrders();
  } catch (err) {
    console.error('Error fetching orders:', err);
  }
}

async function fetchFoodPrices() {
  try {
    const response = await fetch('http://localhost:5000/api/foods');
    const foods = await response.json();
    foods.forEach(food => {
      foodPriceMap[food.name] = food.price;
    });
  } catch (err) {
    console.error('Error fetching food prices:', err);
  }
}

function renderOnlineOrders() {
  const tbody = document.getElementById("online-orders-body");
  tbody.innerHTML = "";
  onlineOrders.forEach(order => {
    tbody.innerHTML += `
      <tr data-id="${order._id}">
        <td>${order.orderNumber ? order.orderNumber : '-----'}</td>
        <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleString() : ""}</td>
        <td>${order.name || order.customerName || ""}</td>
        <td>${order.orderType || order.method || ""}</td>
        <td>${order.paymentMethod || order.payment || ""}</td>
        <td><button class="btn btn-sm btn-warning view-order" data-id="${order._id}" data-type="online">View Order</button></td>
      </tr>
    `;
  });
}

function renderWalkinOrders() {
  const tbody = document.getElementById("walkin-orders-body");
  tbody.innerHTML = "";
  walkinOrders.forEach(order => {
    tbody.innerHTML += `
      <tr data-id="${order._id}">
        <td>${order.orderNumber || order._id}</td>
        <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleString() : new Date().toLocaleDateString()}</td>
        <td>${order.table || ""}</td>
        <td>${order.paymentMethod || order.payment || ""}</td>
        <td><button class="btn btn-sm btn-warning view-order" data-id="${order._id}" data-type="walkin">View Order</button></td>
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

function renderConfirmedOrders() {
  const container = document.getElementById("confirmed-orders-table");
  container.innerHTML = `
    <div class="table-responsive">
      <table class="table table-bordered text-center align-middle order-table">
        <thead class="table-primary">
          <tr>
            <th>Order ID</th>
            <th>Order Placed</th>
            <th>Customer Name</th>
            <th>Order Method</th>
            <th>Payment Method</th>
            <th>Order Details</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="confirmed-orders-body"></tbody>
      </table>
    </div>
  `;

  const tbody = document.getElementById("confirmed-orders-body");
  tbody.innerHTML = "";

  // Online confirmed orders
  onlineOrders.filter(order => order.status === "Confirmed").forEach(order => {
    tbody.innerHTML += `
      <tr data-id="${order._id}">
        <td>${order.orderNumber || order._id}</td>
        <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleString() : ""}</td>
        <td>${order.name || order.customerName || ""}</td>
        <td>${order.orderType || order.method || ""}</td>
        <td>${order.paymentMethod || order.payment || ""}</td>
        <td><button class="btn btn-sm btn-warning view-order" data-id="${order._id}" data-type="online">View Order</button></td>
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

  // Walk-in confirmed orders
  walkinOrders.filter(order => order.status === "Confirmed").forEach(order => {
    tbody.innerHTML += `
      <tr data-id="${order._id}">
        <td>${order.orderNumber || order._id}</td>
        <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleString() : ""}</td>
        <td>${order.name || "Walk-in"}</td>
        <td>Walk-in</td>
        <td>${order.paymentMethod || ""}</td>
        <td><button class="btn btn-sm btn-warning view-order" data-id="${order._id}" data-type="walkin">View Order</button></td>
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

function renderDeclinedOrders() {
  const container = document.getElementById("declined-orders-table");
  container.innerHTML = `
    <div class="table-responsive">
      <table class="table table-bordered text-center align-middle order-table">
        <thead class="table-primary">
          <tr>
            <th>Order ID</th>
            <th>Order Placed</th>
            <th>Customer Name</th>
            <th>Order Method</th>
            <th>Payment Method</th>
            <th>Order Details</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="declined-orders-body"></tbody>
      </table>
    </div>
  `;

  const tbody = document.getElementById("declined-orders-body");
  tbody.innerHTML = "";

  // Online declined orders
  onlineOrders.filter(order => order.status === "Declined").forEach(order => {
    tbody.innerHTML += `
      <tr data-id="${order._id}">
        <td>${order.orderNumber || order._id}</td>
        <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleString() : ""}</td>
        <td>${order.name || order.customerName || ""}</td>
        <td>${order.orderType || order.method || ""}</td>
        <td>${order.paymentMethod || order.payment || ""}</td>
        <td><button class="btn btn-sm btn-warning view-order" data-id="${order._id}" data-type="online">View Order</button></td>
        <td>${order.status}</td>
      </tr>
    `;
  });

  // Walk-in declined orders
  walkinOrders.filter(order => order.status === "Declined").forEach(order => {
    tbody.innerHTML += `
      <tr data-id="${order._id}">
        <td>${order.orderNumber || order._id}</td>
        <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleString() : new Date().toLocaleDateString()}</td>
        <td>${order.name || "Walk-in"}</td>
        <td>Walk-in</td>
        <td>${order.paymentMethod || ""}</td>
        <td><button class="btn btn-sm btn-warning view-order" data-id="${order._id}" data-type="walkin">View Order</button></td>
        <td>${order.status}</td>
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
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Payment:</strong> ${order.payment}</p>
        `;
      } else {
        order = walkinOrders.find(o => o.id === id);
        document.getElementById("modal-order-details").innerHTML = `
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${order.date}</p>
          <p><strong>Table Number:</strong> ${order.table}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Payment:</strong> ${order.payment}</p>
        `;
      }

      const modal = new bootstrap.Modal(document.getElementById("order-modal"));
      modal.show();
    }
  });
}

// Init
document.addEventListener("DOMContentLoaded", async () => {
  await fetchFoodPrices();
  fetchOrders();
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
    const price = foodPriceMap[item.name] || 0;
    const subtotal = price * item.quantity;
    leftHtml += `
      <div class="item-row">
        <span>${item.quantity} × ${item.name}</span>
        <span>₱${subtotal.toFixed(2)}</span>
      </div>
    `;
  });

  leftHtml += `
    <div class="order-total">Total ₱${order.totalAmount ? order.totalAmount.toFixed(2) : 'N/A'}</div>
  `;

  if (type === "online") {
    if (order.orderType === "delivery") {
      leftHtml += `
        <div class="order-extra">
          <p><strong>Address:</strong> ${order.address || order.deliveryAddress || 'N/A'}</p>
          <p><strong>Phone Number:</strong> ${order.phone || 'N/A'}</p>
        </div>
      `;
    } else if (order.orderType === "pickup") {
      leftHtml += `<p class="order-extra"><strong>Pickup:</strong> Customer will pick up their order</p>`;
    } else if (order.orderType === "reservation") {
      leftHtml += `
        <div class="order-extra">
          <p><strong>Date to Come:</strong> ${order.reservationDate ? new Date(order.reservationDate).toLocaleDateString() : (order.date ? new Date(order.date).toLocaleDateString() : 'N/A')}</p>
          <p><strong>Time to Come:</strong> ${order.reservationTime || order.time || 'N/A'}</p>
          <p><strong>No. of Persons:</strong> ${order.numberOfPeople || order.people || 'N/A'}</p>
        </div>
      `;
    }
  }

  leftHtml += `</div>`;

  let rightHtml = "";
  if (type === "online" && order.paymentProof) {
    rightHtml = `
      <div class="order-proof">
        <img src="${order.paymentProof}" alt="Payment Proof" style="max-width: 300px;">
      </div>
    `;
  }

  // Add action buttons
  let actionButtons = `
    <div class="mt-4 text-end">
      <button class="btn btn-success me-2" id="confirmOrderBtn" data-id="${order._id}" data-type="${type}">Confirm</button>
      <button class="btn btn-danger" id="declineOrderBtn" data-id="${order._id}" data-type="${type}">Decline</button>
    </div>
  `;

  modalBody.innerHTML = `
    <div class="order-details">
      ${leftHtml}
      ${rightHtml}
    </div>
    ${actionButtons}
  `;

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("order-modal"));
  modal.show();

  // Attach event listeners for buttons
  document.getElementById("confirmOrderBtn").onclick = function() {
    // Your logic to confirm the order (e.g., send API request)
    order.status = "confirmed";
    modal.hide();
    renderOnlineOrders();
    renderWalkinOrders();
  };
  document.getElementById("declineOrderBtn").onclick = function() {
    // Your logic to decline the order (e.g., send API request)
    order.status = "declined";
    modal.hide();
    renderOnlineOrders();
    renderWalkinOrders();
  };
}

// Attach click events
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("view-order")) {
    const id = e.target.dataset.id;
    const type = e.target.dataset.type;
    let order;

    if (type === "online") order = onlineOrders.find(o => o._id === id);
    else order = walkinOrders.find(o => o._id === id);

    if (order) showOrderModal(order, type);
  }
});


document.addEventListener('DOMContentLoaded', function() {
  // Redirect to login if not authenticated
  if (!localStorage.getItem('adminToken')) {
    window.location.replace('../html/adminlogin.html');
  }

  // Logout functionality
  const logoutBtn = document.getElementById('logoutButton');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('adminToken');
      window.location.replace('../html/adminlogin.html');
    });
  }
});

// Call this when the Confirmed tab is shown
document.getElementById('confirmed-tab').addEventListener('shown.bs.tab', renderConfirmedOrders);

// Optionally, call it on page load if needed

const ordersWithDetails = allOrders.map(order => {
  let orderDetails = {
    ...order.toObject(),
    orderNumber: order.orderNumber // <-- Ensure this is present
  };
  // ...existing code...
  return orderDetails;
});
res.json(ordersWithDetails);
