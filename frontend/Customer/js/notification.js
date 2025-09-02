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


