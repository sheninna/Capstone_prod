const Orders = [
  {
    orderId: "00112",
    orderPlaced: "2024-08-15 10:30 AM",
    Name: "Juan Dela Cruz",
    orderType: "Online",
    totalAmount: "₱340.00",
    paymentMethod: "GCash",
    status: "Completed",
    items: [
      { name: "Special Lomi", qty: 2 },
      { name: "Iced Tea", qty: 1 }
    ]
  }
];


async function fetchCompletedOrders() {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('posToken');
  try {
    const response = await fetch('http://localhost:5000/api/orders?status=completed', {
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

async function renderReportsTable() {
  const Orders = await fetchCompletedOrders();
  const tableBody = document.querySelector(".reports-table tbody");
  tableBody.innerHTML = "";

  Orders.forEach(order => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.orderNumber || order.orderId || order._id}</td>
      <td>${order.orderPlaced ? new Date(order.orderPlaced).toLocaleString() : ""}</td>
      <td>${order.name || order.customerName || ""}</td>
      <td>${order.orderType || ""}</td>
      <td>₱${order.totalAmount ? Number(order.totalAmount).toFixed(2) : "0.00"}</td>
      <td>${order.paymentMethod || order.payment || ""}</td>
      <td>
        <span class="badge bg-success">${order.status || "Completed"}</span>
      </td>
      <td>
        <button class="btn btn-sm btn-warning view-order-btn" data-id="${order._id}">
          View Orders
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Call this on page load
document.addEventListener("DOMContentLoaded", renderReportsTable);


document.addEventListener("click", function (e) {
  if (e.target.classList.contains("view-order-btn")) {
    const orderId = e.target.dataset.id;
    const order = Orders.find(o => o.orderId === orderId);

    if (order) {
      const orderDetails = document.getElementById("orderDetails");
      orderDetails.innerHTML = "";

      order.items.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.name}</td>
          <td class="text-end">x${item.qty}</td>
        `;
        orderDetails.appendChild(tr);
      });

      const modal = new bootstrap.Modal(document.getElementById("orderModal"));
      modal.show();
    }
  }
});



//Monthly Sales 
document.addEventListener("DOMContentLoaded", function () {

  // Chart.js
  const ctx = document.getElementById("salesChart").getContext("2d");
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  let salesData = [90,70,50,72,95,88,92,76,55,70,96,85]; // Sample data

  let salesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [{
        label: "Sales",
        data: salesData,
        backgroundColor: "#26c6da"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return "₱" + context.raw;
            }
          }
        },
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 50 }
        }
      }
    }
  });

  // Handle time range selection
  document.getElementById("rangeSelect").addEventListener("change", function () {
    const val = this.value;
    if (val === "jan-dec") {
      salesChart.data.labels = months;
      salesChart.data.datasets[0].data = salesData;
    } else if (val === "jan-june") {
      salesChart.data.labels = months.slice(0, 6);
      salesChart.data.datasets[0].data = salesData.slice(0, 6);
    } else if (val === "july-dec") {
      salesChart.data.labels = months.slice(6, 12);
      salesChart.data.datasets[0].data = salesData.slice(6, 12);
    }
    salesChart.update();
  });
});


//Top Selling Items

let topSellingChart;
document.getElementById("BSModal").addEventListener("shown.bs.modal", function () {
  if (!topSellingChart) { 
    const topSellingCtx = document.getElementById("topSellingChart").getContext("2d");
    topSellingChart = new Chart(topSellingCtx, {
      type: "pie",
      data: {
        labels: [
          "Lomi", "Sweet & Spicy", "Plain", "Bihon", "Tapsilog", "Hotsilog",
          "Siomaisilog", "Siomai Rice", "Guisado Bilao", "Sweet & Spicy Bilao",
          "Spaghetti Bilao", "Palabok Bilao", "Graham Bar", "Graham", 
          "Leche Flan", "Maja Blanca"
        ],
        datasets: [{
          data: [50, 30, 20, 15, 25, 10, 18, 22, 12, 14, 16, 11, 8, 13, 9, 7],
          backgroundColor: [
            "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
            "#FFCD56", "#C9CBCF", "#36A2EB", "#4BC0C0", "#9966FF", "#FF6384",
            "#FF9F40", "#FFCD56", "#C9CBCF", "#36A2EB"
          ],
        }]
      },
      options: {
        responsive: true,

      }
    });
  }
});


//Orders by Type

let ordersTypeChart;
document.getElementById("OTModal").addEventListener("shown.bs.modal", function () {
  if (!ordersTypeChart) {
    const ordersTypeCtx = document.getElementById("ordersTypeChart").getContext("2d");
    ordersTypeChart = new Chart(ordersTypeCtx, {
      type: "bar",
      data: {
        labels: ["Online", "Walk-in"],
        datasets: [{
          label: "Orders",
          data: [200, 150], // sample data
          backgroundColor: ["#36A2EB", "#FF6384"]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
});


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