function pushNotification(message) {
    const pushArea = document.getElementById("NotificationArea");

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    pushArea.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function updateNotificationCount() {
    const notifCountElem = document.getElementById("notifCount"); 
    const count = document.querySelectorAll(".notif-item.unread").length;

    if (count > 0) {
        notifCountElem.style.display = "inline-block";
        notifCountElem.textContent = count;
    } else {
        notifCountElem.style.display = "none";
    }
}

function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;

    // If older than a week → show MM/DD/YY
    return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit"
    });
}

let notifCounter = 0; // global counter

function addNotification(orderId, status, date = null, isUnread = true) {
    const list = document.getElementById("notificationList");
    const noNotifMessage = document.getElementById("noNotifMessage");

    // Hide "no notifications" message when adding a notification
    noNotifMessage.style.display = "none";

    const item = document.createElement("div");
    item.className = `notif-item ${isUnread ? "unread" : ""}`;

    // Unique ID using counter
    notifCounter++;
    item.id = `notif-${orderId}-${status.replace(/\s+/g, "-")}-${notifCounter}`;
    item.style.margin = "0 12px 12px 12px"; 
    `notif-${orderId}-${status.replace(/\s+/g, "-")}-${notifCounter}`;

    const dot = document.createElement("span");
    dot.className = `notif-dot ${isUnread ? "green" : "gray"}`;

    const text = document.createElement("p");
    text.textContent = `Your order #${orderId} is ${status}!`;

    const timestamp = document.createElement("span");
    timestamp.className = "notif-time";

    const notifDate = date ? new Date(date) : new Date();
    timestamp.textContent = formatTimeAgo(notifDate);

    item.appendChild(dot);
    item.appendChild(text);
    item.appendChild(timestamp);

    list.prepend(item);

    if (isUnread) pushNotification(`Your order #${orderId} is ${status}!`);

    updateNotificationCount();
}


// Mark all as read
document.getElementById("markAllRead").addEventListener("click", () => {
    document.querySelectorAll(".notif-item").forEach(item => {
        const dot = item.querySelector(".notif-dot");
        dot.classList.remove("green");
        dot.classList.add("gray");
        item.classList.remove("unread");
    });

    updateNotificationCount();
});

// Clear all notifications
document.getElementById("clearAll").addEventListener("click", () => {
    document.querySelectorAll(".notif-item").forEach(item => item.remove());
    document.getElementById("noNotifMessage").style.display = "block";

    updateNotificationCount();
});

// Utility: Get customer token and userId (adjust if you store userId differently)
function getCustomerToken() {
    return localStorage.getItem('customerToken');
}
function getCustomerId() {
    // Try to get userId from localStorage, or decode from token if needed
    let id = localStorage.getItem('customerId');
    if (!id) {
        // Try to decode from token if using JWT (optional, only if your token contains userId)
        const token = getCustomerToken();
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                id = payload.userId || payload._id || payload.id;
                if (id) localStorage.setItem('customerId', id);
            } catch (e) {}
        }
    }
    return id;
}

// Mark notification as read
async function markNotificationAsRead(notifId, itemElem) {
    try {
        const response = await fetch(`http://localhost:5000/api/notifications/${notifId}/read`, {
            method: "PATCH"
        });
        if (response.ok) {
            itemElem.classList.remove("unread");
            const dot = itemElem.querySelector(".notif-dot");
            if (dot) {
                dot.classList.remove("green");
                dot.classList.add("gray");
            }
            // Remove the mark as read button
            const btn = itemElem.querySelector(".mark-read-btn");
            if (btn) btn.remove();
            updateNotificationCount();
        }
    } catch (err) {
        console.error("Failed to mark notification as read:", err);
    }
}

// Fetch and display notifications
async function loadNotifications() {
    const userId = getCustomerId();
    const notificationList = document.getElementById("notificationList");
    const noNotifMessage = document.getElementById("noNotifMessage");

    notificationList.innerHTML = ""; // Clear previous

    if (!userId) {
        noNotifMessage.style.display = "block";
        noNotifMessage.textContent = "No notifications available.";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/notifications/${userId}`);
        const notifications = await response.json();

        if (!notifications.length) {
            noNotifMessage.style.display = "block";
            noNotifMessage.textContent = "No notifications available.";
            return;
        } else {
            noNotifMessage.style.display = "none";
        }

        notifications.forEach(notif => {
            const item = document.createElement("div");
            item.className = `notif-item${notif.read ? '' : ' unread'}`;

            // Left side: dot + message
            const left = document.createElement("div");
            left.className = "notif-left";

            const dot = document.createElement("span");
            dot.className = `notif-dot ${notif.read ? "gray" : "green"}`;

            const msg = document.createElement("div");
            msg.className = "notif-message";
            msg.textContent = notif.message;

            left.appendChild(dot);
            left.appendChild(msg);

            // Right side: timestamp + mark as read button
            const meta = document.createElement("div");
            meta.className = "notif-meta";
            meta.textContent = new Date(notif.createdAt).toLocaleString();

            item.appendChild(left);
            item.appendChild(meta);

            if (!notif.read) {
                const markBtn = document.createElement("button");
                markBtn.className = "mark-read-btn btn btn-sm btn-outline-success";
                markBtn.textContent = "Mark as Read";
                markBtn.onclick = () => markNotificationAsRead(notif._id, item);
                item.appendChild(markBtn);
            }

            notificationList.appendChild(item);
        });

        updateNotificationCount();
    } catch (err) {
        noNotifMessage.style.display = "block";
        noNotifMessage.textContent = "Failed to load notifications.";
        console.error("Failed to load notifications:", err);
    }
}

// Save customer token and userId if present in URL (for users signed in from homepage or order now page)
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
    // Load notifications after setting values
    loadNotifications();
});

// Load notifications on page load
document.addEventListener("DOMContentLoaded", loadNotifications);

document.addEventListener('DOMContentLoaded', function () {
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener('click', function () {
      // Remove customer token and customerId
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerId');
      // Redirect to homepage
      window.location.href = "../index.html";
    });
  }
});


