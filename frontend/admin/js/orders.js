let onlineOrders = [];
let walkinOrders = [];
let foodPriceMap = {};
let orders = [];

// Use either adminToken or posToken for authentication
function getAuthToken() {
  return localStorage.getItem('adminToken') || localStorage.getItem('posToken');
}


async function fetchOrders() {
  try {
    const token = getAuthToken();
    const response = await fetch('http://localhost:5000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('posToken');
      window.location.replace('../html/poslogin.html');
      return;
    }
    if (!response.ok) throw new Error('Not authorized or server error');
    orders = await response.json();
    onlineOrders = orders.filter(order =>
      (order.orderType === "online" ||
      order.orderType === "reservation" ||
      order.orderType === "delivery" ||
      order.orderType === "pickup")
    );
    // Only keep walk-in orders with status "pending" out of main and walkin tabs
    walkinOrders = orders.filter(order =>
      (order.orderType === "walk-in" ||
      order.source === "walk-in" ||
      order.method === "Walk-in")
    );
    renderMainTable();
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
      if (!foodPriceMap[food.name]) foodPriceMap[food.name] = [];
      foodPriceMap[food.name].push(food);
    });
  } catch (err) {
    console.error('Error fetching food prices:', err);
  }
}

function renderOnlineOrders() {
  const tbody = document.getElementById("online-orders-body");
  tbody.innerHTML = "";
  onlineOrders.forEach(order => {
    let statusOptions = "";
    // Only online orders with pickup type get pickup statuses
    if (order.orderType === "pickup") {
      statusOptions = `
        <option ${order.status === "pending" ? "selected" : ""}>Pending</option>
        <option ${order.status === "in process" ? "selected" : ""}>In Process</option>
        <option ${order.status === "ready for pick-up" ? "selected" : ""}>Ready for Pick-up</option>
        <option ${order.status === "completed" ? "selected" : ""}>Completed</option>
      `;
    } else {
      statusOptions = `
        <option ${order.status === "pending" ? "selected" : ""}>Pending</option>
        <option ${order.status === "in process" ? "selected" : ""}>In Process</option>
        <option ${order.status === "completed" ? "selected" : ""}>Completed</option>
      `;
    }
    tbody.innerHTML += `
      <tr data-id="${order._id}">
        <td>${order.orderNumber ? order.orderNumber : '-----'}</td>
        <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleString() : ""}</td>
        <td>${order.name || order.customerName || ""}</td>
        <td>${order.orderType || order.method || ""}</td>
        <td>${order.paymentMethod || order.payment || ""}</td>
        <td>
          <select class="form-select form-select-sm status-dropdown">
            ${statusOptions}
          </select>
        </td>
        <td><button class="btn btn-sm btn-warning view-order" data-id="${order._id}" data-type="online">View Order</button></td>
      </tr>
    `;
  });
}

function renderWalkinOrders() {
  const tbody = document.getElementById("walkin-orders-body");
  tbody.innerHTML = "";
  walkinOrders.forEach(order => {
    // Walk-in orders should NOT have pickup status options
    const statusOptions = `
      <option ${order.status === "pending" ? "selected" : ""}>Pending</option>
      <option ${order.status === "in process" ? "selected" : ""}>In Process</option>
      <option ${order.status === "completed" ? "selected" : ""}>Completed</option>
    `;
    tbody.innerHTML += `
      <tr data-id="${order._id}">
        <td>${order.orderNumber || order._id}</td>
        <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleString() : new Date().toLocaleDateString()}</td>
        <td>${order.table || ""}</td>
        <td>${order.paymentMethod || order.payment || ""}</td>
        <td><button class="btn btn-sm btn-warning view-order" data-id="${order._id}" data-type="walkin">View Order</button></td>
        <td>
          <select class="form-select form-select-sm status-dropdown">
            ${statusOptions}
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

  // Show orders with status "in process", "on delivery", "ready for pick-up", or ALL walk-in orders (regardless of status)
  const confirmedOrders = orders.filter(order =>
    order.status === "in process" ||
    order.status === "on delivery" ||
    order.status === "ready for pick-up" ||
    order.orderType === "walk-in" ||
    order.source === "walk-in" ||
    order.method === "Walk-in"
  );

  if (confirmedOrders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">No confirmed orders.</td>
      </tr>
    `;
  } else {
    confirmedOrders.forEach(order => {
      let statusOptions = "";
      if (order.orderType === "pickup") {
        statusOptions = `
          <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pending</option>
          <option value="in process" ${order.status === "in process" ? "selected" : ""}>In Process</option>
          <option value="ready for pick-up" ${order.status === "ready for pick-up" ? "selected" : ""}>Ready for Pick-up</option>
          <option value="completed" ${order.status === "completed" ? "selected" : ""}>Completed</option>
        `;
      } else {
        statusOptions = `
          <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pending</option>
          <option value="in process" ${order.status === "in process" ? "selected" : ""}>In Process</option>
          <option value="on delivery" ${order.status === "on delivery" ? "selected" : ""}>On Delivery</option>
          <option value="completed" ${order.status === "completed" ? "selected" : ""}>Completed</option>
        `;
      }
      tbody.innerHTML += `
        <tr data-id="${order._id}">
          <td>${order.orderNumber || order._id}</td>
          <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleString() : ""}</td>
          <td>${order.name || order.customerName || "Walk-in"}</td>
          <td>${order.orderType || order.method || "Walk-in"}</td>
          <td>${order.paymentMethod || order.payment || ""}</td>
          <td><button class="btn btn-sm btn-warning view-order" data-id="${order._id}" data-type="${order.orderType === "walk-in" ? "walkin" : "online"}">View Order</button></td>
          <td>
            <select class="form-select form-select-sm status-dropdown">
              ${statusOptions}
            </select>
          </td>
        </tr>
      `;
    });
  }
  setupStatusDropdownListener();
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

  const declinedOrders = orders.filter(order => order.status === "completed");
  if (declinedOrders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">No declined orders.</td>
      </tr>
    `;
  } else {
    declinedOrders.forEach(order => {
      tbody.innerHTML += `
        <tr>
          <td>${order.orderNumber || order._id}</td>
          <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleString() : ""}</td>
          <td>${order.name || "Walk-in"}</td>
          <td>${order.orderType || "Walk-in"}</td>
          <td>${order.paymentMethod || ""}</td>
          <td><button class="btn btn-sm btn-warning view-order" data-id="${order._id}" data-type="${order.orderType === "walk-in" ? "walkin" : "online"}">View Order</button></td>
          <td>${order.status}</td>
        </tr>
      `;
    });
  }
}

function setupModal() {
  document.addEventListener("click", e => {
    if (e.target.classList.contains("view-order")) {
      const id = e.target.dataset.id;
      const type = e.target.dataset.type;
      let order;
      if (type === "online") {
        order = onlineOrders.find(o => o._id === id);
      } else {
        order = walkinOrders.find(o => o._id === id);
      }

      const modalBody = document.getElementById("modal-order-body");

      let leftHtml = `<div class="order-items">`;
      let total = 0;

      order.items.forEach(item => {
        const price = getOrderItemPrice(item, foodPriceMap);
        const subtotal = price * (item.quantity || 1);
        total += subtotal;
        leftHtml += `
          <div class="item-row">
            <span>${item.quantity} × ${item.name}${item.portion ? ` <em>(${item.portion})</em>` : ''}</span>
            <span>${price > 0 ? `₱${subtotal.toFixed(2)}` : '<span style="color:red">N/A</span>'}</span>
          </div>
        `;
      });

      leftHtml += `<div class="item-row fw-bold mt-3" style="font-size:1.15em;">
        <span>Total</span>
        <span>₱${total.toFixed(2)}</span>
      </div>`;

      if (type === "online") {
        if (order.orderType === "delivery") {
          leftHtml += `
            <div class="order-extra mt-3">
              <p><strong>Address:</strong> ${order.address || order.deliveryAddress || 'N/A'}</p>
              <p><strong>Phone Number:</strong> ${order.phone || 'N/A'}</p>
            </div>
          `;
        } else if (order.orderType === "pickup") {
          leftHtml += `<p class="order-extra mt-3"><strong>Pickup:</strong> Customer will pick up their order</p>`;
        } else if (order.orderType === "reservation") {
          leftHtml += `
            <div class="order-extra mt-3">
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

      let actionButtons = `
        <div class="mt-4 text-end">
          <button class="btn btn-success me-2" id="confirmOrderBtn" data-id="${order._id}" data-type="${type}">Confirm</button>
          <button class="btn btn-danger" id="declineOrderBtn" data-id="${order._id}" data-type="${type}">Decline</button>
        </div>
      `;

      modalBody.innerHTML = `
        <div class="d-flex flex-column flex-md-row gap-4 align-items-stretch order-details">
          <div class="flex-grow-1">
            ${leftHtml}
          </div>
          ${rightHtml ? `
          <div class="d-flex align-items-center justify-content-center" style="min-width:320px;max-width:340px;">
            <div class="w-100 text-center bg-secondary bg-opacity-25 rounded-3 p-3">
              <img src="${order.paymentProof}" alt="Payment Proof" style="max-width: 100%; max-height: 250px; object-fit: contain;">
            </div>
          </div>
          ` : ""}
        </div>
        ${actionButtons}
      `;

      const modal = new bootstrap.Modal(document.getElementById("order-modal"));
      modal.show();

      document.getElementById("confirmOrderBtn").onclick = async function() {
        modal.hide();

        // Instantly remove from Orders tab
        const row = document.querySelector(`tr[data-id="${order._id}"]`);
        if (row) row.remove();

        // Instantly add to Confirmed tab
        const confirmedTbody = document.getElementById("confirmed-orders-body");
        if (confirmedTbody) {
          confirmedTbody.innerHTML += `
            <tr data-id="${order._id}">
              <td>${order.orderNumber || order._id}</td>
              <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleString() : ""}</td>
              <td>${order.name || order.customerName || "Walk-in"}</td>
              <td>${order.orderType || order.method || "Walk-in"}</td>
              <td>${order.paymentMethod || order.payment || ""}</td>
              <td><button class="btn btn-sm btn-warning view-order" data-id="${order._id}" data-type="${order.orderType === "walk-in" ? "walkin" : "online"}">View Order</button></td>
              <td>
                <select class="form-select form-select-sm status-dropdown">
                  <option value="pending">Pending</option>
                  <option value="in process" selected>In Process</option>
                  <option value="on delivery">On Delivery</option>
                  <option value="ready for pick-up">Ready for Pick-up</option>
                  <option value="completed">Completed</option>
                </select>
              </td>
            </tr>
          `;
        }

        // Backend update and re-render tabs
        const result = await updateOrderStatus(order._id, "in process");
        if (result) {
          await fetchOrders();
          renderConfirmedOrders();
        }
      };

      document.getElementById("declineOrderBtn").onclick = async function() {
        modal.hide();

        // Instantly remove from Orders tab
        const row = document.querySelector(`tr[data-id="${order._id}"]`);
        if (row) row.remove();

        // Instantly add to Declined tab
        const declinedTbody = document.getElementById("declined-orders-body");
        if (declinedTbody) {
          declinedTbody.innerHTML += `
            <tr data-id="${order._id}">
              <td>${order.orderNumber || order._id}</td>
              <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleString() : ""}</td>
              <td>${order.name || "Walk-in"}</td>
              <td>${order.orderType || "Walk-in"}</td>
              <td>${order.paymentMethod || ""}</td>
              <td><button class="btn btn-sm btn-warning view-order" data-id="${order._id}" data-type="${order.orderType === "walk-in" ? "walkin" : "online"}">View Order</button></td>
              <td>Completed</td>
            </tr>
          `;
        }

        // Backend update and re-render tabs
        const result = await updateOrderStatus(order._id, "completed");
        if (result) {
          await fetchOrders();
          renderDeclinedOrders();
        }
      };
    }
  });
}

// Update order status using either token
async function updateOrderStatus(orderId, status) {
  try {
    const token = getAuthToken();
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      const error = await response.json();
      alert(error.message || 'Failed to update order status.');
      return null;
    }
    return await response.json();
  } catch (err) {
    console.error('Error updating order status:', err);
    alert('Failed to update order status.');
    return null;
  }
}

function renderMainTable() {
  const tbody = document.getElementById("online-orders-body");
  tbody.innerHTML = "";
  // Only show online orders that are still "pending"
  const filteredOrders = onlineOrders.filter(order =>
    order.status === "pending"
  );
  if (filteredOrders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">No orders.</td>
      </tr>
    `;
  } else {
    filteredOrders.forEach(order => {
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
  // No dropdown in the order tab
}

function setupStatusDropdownListener() {
  document.querySelectorAll('.status-dropdown').forEach(dropdown => {
    dropdown.onchange = async function(e) {
      const tr = e.target.closest('tr');
      const orderId = tr.getAttribute('data-id');
      const newStatus = e.target.value;
      const result = await updateOrderStatus(orderId, newStatus);
      if (result) {
        await fetchOrders();
        renderMainTable();
        renderOnlineOrders();
        renderWalkinOrders();
        renderConfirmedOrders();
        renderDeclinedOrders();
        // Only remove the row if status is completed AND you are in the Declined tab
        const declinedTabActive = document.getElementById('declined-tab').classList.contains('active');
        if (newStatus === "completed" && declinedTabActive) {
          tr.remove();
        }
        // Do NOT remove the row for any status change in the Confirmed tab
      }
    };
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = getAuthToken();
  if (!token) {
    window.location.replace('../html/poslogin.html');
    return;
  }

  const logoutBtn = document.querySelector('.btn-danger');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('adminToken');
      localStorage.removeItem('posToken');
      window.location.replace('../html/poslogin.html');
    });
  }

  await fetchFoodPrices();
  await fetchOrders();
  setupModal();

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

  document.getElementById('confirmed-tab').addEventListener('shown.bs.tab', renderConfirmedOrders);
  document.getElementById('declined-tab').addEventListener('shown.bs.tab', renderDeclinedOrders);
});

function getOrderItemPrice(item, foodPriceMap) {
  // 1. Use price from order if present (number or string that can be parsed)
  if (
    (typeof item.price === "number" && !isNaN(item.price)) ||
    (typeof item.price === "string" && !isNaN(parseFloat(item.price)))
  ) {
    return Number(item.price);
  }

  // 2. Try to match by name and portion (case-insensitive, trimmed)
  const foods = foodPriceMap[item.name?.trim()] || [];
  if (foods.length > 0) {
    // Try to match portion if present
    if (item.portion) {
      for (const food of foods) {
        if (Array.isArray(food.portions)) {
          const portionObj = food.portions.find(
            p =>
              p.portion &&
              item.portion &&
              p.portion.trim().toLowerCase() === item.portion.trim().toLowerCase()
          );
          if (portionObj && typeof portionObj.price === "number") {
            return portionObj.price;
          }
        }
      }
    }
    // Fallback: use base price if available
    for (const food of foods) {
      if (typeof food.price === "number" && !isNaN(food.price)) {
        return food.price;
      }
    }
    // Fallback: use first portion price if available
    for (const food of foods) {
      if (Array.isArray(food.portions) && food.portions.length > 0) {
        if (typeof food.portions[0].price === "number") {
          return food.portions[0].price;
        }
      }
    }
  }

  // 3. As a last resort, return 0 (will show ₱0.00)
  return 0;
}