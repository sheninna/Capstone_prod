// ====== AUTH CHECK & LOGOUT ======
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

// ====== SAMPLE DATA ======
const dashboardData = {
  totalSalesToday: 15230, // today's sales
  totalOrdersToday: 68,   // today's orders
  totalRevenue: 124500,   // monthly revenue
  dailySales: [2100, 1800, 2300, 2500, 2900, 4100, 4500], // Mon-Sun
  bestSelling: [
    { name: "Lomi", img: "../assets/lomi.jpg", sold: 120 },
    { name: "Tapsilog", img: "../assets/tapsilog.jpg", sold: 95 },
    { name: "Palabok", img: "../assets/palabok.jpg", sold: 80 },
    { name: "Bihon", img: "../assets/bihon.jpg", sold: 70 },
    { name: "Leche Flan", img: "../assets/lecheflan.jpg", sold: 60 }
  ],
  ordersByType: {
    walkIn: 32,
    online: 36
  }
};

// ====== SAMPLE ONLINE ORDERS ======
const onlineOrders = [
  { customer: "John Dela Cruz", items: ["Lomi", "Spaghetti bilao (Medium)"] },
  { customer: "Jane Santos", items: ["Tapsilog", "Leche Flan"] },
  { customer: "Pedro Reyes", items: ["Palabok bilao (Large)"] }
];

document.getElementById("totalSales").textContent = `₱${dashboardData.totalSalesToday.toLocaleString()}`;
document.getElementById("totalOrders").textContent = dashboardData.totalOrdersToday;
document.getElementById("totalRevenue").textContent = `₱${dashboardData.totalRevenue.toLocaleString()}`;


const ctxDaily = document.getElementById("dailySalesChart").getContext("2d");
document.getElementById("dailySalesChart").style.height = "250px";
new Chart(ctxDaily, {
  type: "line",
  data: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      label: "Daily Sales (₱)",
      data: dashboardData.dailySales,
      borderColor: "#007bff",
      backgroundColor: "rgba(0, 123, 255, 0.2)",
      tension: 0.3,
      fill: true,
      pointBackgroundColor: "#007bff",
      pointRadius: 5
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {

            return `₱${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    interaction: {
      mode: "nearest",
      intersect: false
    }
  }
});


const bestSellingList = document.getElementById("bestSellingList");
bestSellingList.innerHTML = ""; 
dashboardData.bestSelling
  .slice(0, 5) 
  .forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${item.img}" alt="${item.name}" style="width:30px; height:30px; margin-right:10px; border-radius:50%">
      ${item.name} <span style="float:right;"></span>
    `;
    bestSellingList.appendChild(li);
  });


const ordersChartCanvas = document.getElementById("ordersByTypeChart");
ordersChartCanvas.style.height = "250px"; 

const ctxOrders = ordersChartCanvas.getContext("2d");
new Chart(ctxOrders, {
  type: "bar",
  data: {
    labels: ["Walk-In", "Online"],
    datasets: [{
      label: "Orders",
      data: [dashboardData.ordersByType.walkIn, dashboardData.ordersByType.online],
      backgroundColor: ["#f4a261", "#2a9d8f"]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false, // ✅ respects custom height
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
});


//SAMPLE ORDER FOR NOTIF//
const orders = [
  { id: 1, type: "Walk-in", status: "Pending" },
  { id: 3, type: "Walk-in", status: "Pending" },
  { id: 6, type: "Online",  status: "Pending" }
];


// ====== UPDATE NEW ORDERS ALERT ======
function updateNewOrdersAlert() { 
  const alertBox = document.getElementById("newOrdersAlert");
  if (!alertBox) return;

  const pendingOrders = orders.filter(o =>
    o.status === "Pending" 
  );

  const count = pendingOrders.length;

  alertBox.innerHTML = `
    <strong class="text-primary">New Orders:</strong>
    You have ${count} new order${count !== 1 ? "s" : ""}.
    Check the Orders section to prepare them!
  `;
}

updateNewOrdersAlert();

function confirmOrder(id, type) {
  const order = orders.find(o => o.id === id);
  if (!order) return;

  if (type === "Online") {
    order.status = "Confirmed";
  } else if (type === "Walk-in") {
    order.status = "In Process";
  }

  renderNotifications();
  updateNewOrdersAlert(); 
}

function renderNotifications() {
  const notifOrders = document.getElementById("notifOrders");
  const notifCount = document.getElementById("notifCount");

  const pendingOrders = orders.filter(o => o.status === "Pending");

  notifCount.textContent = pendingOrders.length;

  notifOrders.innerHTML = pendingOrders.length
    ? pendingOrders.map(o => `
      <div class="p-2 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <strong>${o.type} Order</strong><br>
          <small>${o.customer}</small>
        </div>
        <button class="btn btn-sm btn-success" onclick="confirmOrder(${o.id}, '${o.type}')">
          Confirm
        </button>
      </div>
    `).join("")
    : `<div class="p-2 text-muted">No new orders</div>`;
}
