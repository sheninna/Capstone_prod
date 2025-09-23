async function fetchCompletedOrders() {
  const token = localStorage.getItem('adminToken');
  try {
    const response = await fetch('http://localhost:5000/api/orders/orders/completed', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch completed orders');
    return await response.json();
  } catch (err) {
    console.error('Error fetching completed orders:', err);
    return [];
  }
}

// Fetch and render completed orders in a professional table
async function renderReportsTable() {
  const Orders = await fetchCompletedOrders();
  console.log(Orders); // <-- Add this
  const tableBody = document.getElementById("REPORTS");
  tableBody.innerHTML = "";

  Orders.forEach(order => {
    // Fix: Use source for online, orderType for walk-in
    const orderType = (order.orderType || "").toLowerCase();
    const source = (order.source || "").toLowerCase();

    if (
      (selectedOrderTypeTab === "online" && source !== "online") ||
      (selectedOrderTypeTab === "walk-in" && orderType !== "walk-in")
    ) {
      return; // Skip this order
    }

    const status = (order.status || "Completed").toLowerCase();
    let badgeClass = "bg-secondary";
    if (status === "completed") badgeClass = "bg-success";
    else if (status === "pending") badgeClass = "bg-warning text-dark";
    else if (status === "cancelled") badgeClass = "bg-danger";
    else if (status === "in process") badgeClass = "bg-info text-dark";

    const row = document.createElement("tr");
    row.classList.add("align-middle");

    // Render with or without Customer Name column
    if (selectedOrderTypeTab === "online") {
      row.innerHTML = `
        <td class="fw-semibold">${order.orderNumber || order.orderId || order._id}</td>
        <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleDateString() : ""}</td>
        <td>${order.name || order.customerName || ""}</td>
        <td>${order.orderType || ""}</td>
        <td class="text-middle">₱${order.totalAmount ? Number(order.totalAmount).toFixed(2) : "0.00"}</td>
        <td>${order.paymentMethod || order.payment || ""}</td>
        <td>
          <span class="badge ${badgeClass} px-3 py-2">${order.status || "Completed"}</span>
        </td>
        <td>
          <i class="bi bi-eye btn btn-warning btn-sm view-order-btn" data-id="${order._id}" title="View Order" style="cursor:pointer; width: 50px; height: 40px;font-size: 1.4rem;"></i>
        </td>
      `;
    } else {
      row.innerHTML = `
        <td class="fw-semibold">${order.orderNumber || order.orderId || order._id}</td>
        <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleDateString() : ""}</td>
        <td>${order.orderType || ""}</td>
        <td class="text-middle">₱${order.totalAmount ? Number(order.totalAmount).toFixed(2) : "0.00"}</td>
        <td>${order.paymentMethod || order.payment || ""}</td>
        <td>
          <span class="badge ${badgeClass} px-3 py-2">${order.status || "Completed"}</span>
        </td>
        <td>
          <i class="bi bi-eye btn btn-warning btn-sm view-order-btn" data-id="${order._id}" title="View Order" style="cursor:pointer; width: 50px; height: 40px;font-size: 1.4rem;"></i>
        </td>
      `;
    }

    row.dataset.order = JSON.stringify(order);
    tableBody.appendChild(row);
  });
}

// Call this on page load
document.addEventListener("DOMContentLoaded", renderReportsTable);


// View Order Modal logic
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("view-order-btn") || e.target.closest(".view-order-btn")) {
    const btn = e.target.closest(".view-order-btn");
    const row = btn.closest("tr");
    let order;
    try {
      order = JSON.parse(row.dataset.order);
    } catch {
      order = null;
    }

    if (order) {
      const orderDetails = document.getElementById("orderDetails");
      orderDetails.innerHTML = "";

      (order.items || []).forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>
            <span class="fw-semibold">${item.name}</span>
            ${item.portion ? `<span class="badge bg-light text-dark border ms-2">${item.portion}</span>` : ""}
          </td>
          <td class="text-end">x${item.qty || item.quantity || 1}</td>
        `;
        orderDetails.appendChild(tr);
      });

      const modal = new bootstrap.Modal(document.getElementById("orderModal"));
      modal.show();
    }
  }
});


//Monthly Sales 
let salesChart;

async function fetchMonthlySales(year, range) {
  const token = localStorage.getItem('adminToken');
  try {
    const response = await fetch(`http://localhost:5000/api/reports/monthly-sales?year=${year}&range=${range}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch monthly sales');
    return await response.json();
  } catch (err) {
    console.error('Error fetching monthly sales:', err);
    return { labels: [], data: [] };
  }
}

async function renderMonthlySalesChart() {
  const year = document.querySelector('#MSModal select.year-select, #MSModal #yearSelect')?.value || "2024";
  const range = document.querySelector('#MSModal select.range-select, #MSModal #rangeSelect')?.value || "jan-dec";
  let { labels, data } = await fetchMonthlySales(year, range);

  // If backend always returns all months, slice here:
  if (labels.length === 12 && data.length === 12) {
    if (range === "jan-june") {
      labels = labels.slice(0, 6);
      data = data.slice(0, 6);
    } else if (range === "july-dec") {
      labels = labels.slice(6, 12);
      data = data.slice(6, 12);
    }
    // else jan-dec: show all
  }

  // Check if all data is zero (no sales for this year/range)
  const allZero = data.every(val => val === 0);

  const ctx = document.getElementById("salesChart").getContext("2d");
  if (salesChart) salesChart.destroy();
  salesChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: allZero ? ["No Data"] : labels,
      datasets: [{
        label: "Sales",
        data: allZero ? [0] : data,
        borderColor: "#26c6da",
        backgroundColor: "rgba(38,198,218,0.1)",
        fill: true,
        tension: 0.3,
        pointBackgroundColor: "#26c6da",
        pointBorderColor: "#26c6da",
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return allZero ? "No sales" : ("₱" + context.raw);
            }
          }
        },
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Render chart when modal is shown
document.getElementById("MSModal").addEventListener("shown.bs.modal", renderMonthlySalesChart);


//Top Selling Items
let topSellingChart;

async function fetchBestSelling() {
  const token = localStorage.getItem('adminToken');
  const month = document.querySelector('#BSModal select.form-select')?.value || "January";
  const year = document.querySelector('#BSModal select.year-select, #BSModal #yearSelect, #MSModal select.year-select, #MSModal #yearSelect')?.value || "2024";
  try {
    const response = await fetch(`http://localhost:5000/api/reports/best-selling?month=${month}&year=${year}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch best selling items');
    return await response.json();
  } catch (err) {
    console.error('Error fetching best selling items:', err);
    return { labels: [], data: [] };
  }
}

async function renderBestSellingChart() {
  const { labels, data } = await fetchBestSelling();
  const ctx = document.getElementById("topSellingChart").getContext("2d");
  if (topSellingChart) topSellingChart.destroy();
  topSellingChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels.length ? labels : ["No Data"],
      datasets: [{
        label: "Best Selling Items",
        data: data.length ? data : [0],
        backgroundColor: "#ffb300",
        borderColor: "#ff8c00",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Render chart when modal is shown
document.getElementById("BSModal").addEventListener("shown.bs.modal", renderBestSellingChart);

// Update chart when month is changed
document.querySelector('#BSModal select.form-select').addEventListener("change", renderBestSellingChart);


//Monthly Orders by Type
document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const modalId = params.get("modal");

  if (modalId) {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
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

document.getElementById("rangeSelect").addEventListener("change", renderMonthlySalesChart);

// Listen for changes on both year and range selects
document.querySelectorAll('#MSModal select.year-select, #MSModal #yearSelect, #MSModal select.range-select, #MSModal #rangeSelect')
  .forEach(sel => sel.addEventListener("change", renderMonthlySalesChart));

async function fetchOrdersByMonth(year, month) {
  const token = localStorage.getItem('adminToken');
  try {
    const response = await fetch(`http://localhost:5000/api/reports/orders-by-month?year=${year}&month=${month}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch orders by month');
    const data = await response.json();
    return data.orders || [];
  } catch (err) {
    console.error('Error fetching orders by month:', err);
    return [];
  }
}

async function renderOrdersByMonthTable() {
  // Get selected year and month from your filter dropdowns
  const year = document.querySelector('#OTModal #yearSelect, #OTModal select.year-select')?.value || "2025";
  const month = document.querySelector('#OTModal select.month-select, #OTModal #monthSelect')?.value || "August";
  const orders = await fetchOrdersByMonth(year, month);

  // Assuming you have a table body with id="ordersByMonthTableBody"
  const tableBody = document.getElementById("ordersByMonthTableBody");
  if (!tableBody) return;
  tableBody.innerHTML = "";

  orders.forEach(order => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.orderNumber || order._id}</td>
      <td>${order.name || order.customerName || ""}</td>
      <td>${order.orderType || ""}</td>
      <td>${order.paymentMethod || ""}</td>
      <td>₱${order.totalAmount ? Number(order.totalAmount).toFixed(2) : "0.00"}</td>
      <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleDateString() : ""}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Optionally, call on modal show
document.getElementById("OTModal").addEventListener("shown.bs.modal", renderOrdersByMonthTable);

let ordersTypeChart;

async function fetchOrderTypes() {
  const token = localStorage.getItem('adminToken');
  // Use specific IDs for year and month
  const year = document.querySelector('#OTModal #yearSelect')?.value || "2025";
  const month = document.querySelector('#OTModal #rangeSelect')?.value;
  let url = `http://localhost:5000/api/reports/order-types?year=${year}`;
  if (month) url += `&month=${month}`;
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch order types');
    return await response.json();
  } catch (err) {
    console.error('Error fetching order types:', err);
    return { labels: ["Online", "Walk-in"], data: [0, 0] };
  }
}

async function renderOrderTypesChart() {
  const { labels, data } = await fetchOrderTypes();
  const ctx = document.getElementById("ordersTypeChart").getContext("2d");
  if (ordersTypeChart) ordersTypeChart.destroy();
  ordersTypeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Orders",
        data: data,
        backgroundColor: ["#36A2EB", "#FF6384"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Listen for changes on year and month selects in the Order Channels modal
document.querySelectorAll('#OTModal #yearSelect, #OTModal #rangeSelect')
  .forEach(sel => sel.addEventListener("change", renderOrderTypesChart));

// Render chart when Order Channels modal is shown
document.getElementById("OTModal").addEventListener("shown.bs.modal", renderOrderTypesChart);

let selectedOrderTypeTab = "online"; 

document.getElementById("online-tab").addEventListener("click", function() {
  selectedOrderTypeTab = "online";
  renderReportsTable();
});
document.getElementById("walkin-tab").addEventListener("click", function() {
  selectedOrderTypeTab = "walk-in";
  renderReportsTable();
});

function toggleCustomerNameColumn(show) {
  document.querySelectorAll('.customer-name-col').forEach(th => {
    th.style.display = show ? '' : 'none';
  });
  // Toggle all cells in that column
  document.querySelectorAll('#REPORTS tr').forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length > 2) { 
      cells[2].style.display = show ? '' : 'none';
    }
  });
}

// Example: Call this when switching tabs
document.getElementById('online-tab').addEventListener('click', function() {
  toggleCustomerNameColumn(true);
});
document.getElementById('walkin-tab').addEventListener('click', function() {
  toggleCustomerNameColumn(false);
});

// Also call after initial render, depending on default tab
toggleCustomerNameColumn(true); // or false if Walk-in is default