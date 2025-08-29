function pushNotification(message) {
    const pushArea = document.getElementById("pushNotificationArea");

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    pushArea.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function addNotification(id, message, time, isUnread = true) {
    const list = document.getElementById("notificationList");

    const item = document.createElement("div");
    item.className = `notif-item ${isUnread ? 'unread' : ''}`;
    item.id = `notif-${id}`;

    const dot = document.createElement("span");
    dot.className = `notif-dot ${isUnread ? 'green' : 'gray'}`;

    const text = document.createElement("p");
    text.textContent = message;

    const timestamp = document.createElement("span");
    timestamp.className = "notif-time";
    timestamp.textContent = time;

    item.appendChild(dot);
    item.appendChild(text);
    item.appendChild(timestamp);

    list.prepend(item);

    if (isUnread) pushNotification(message);
}

// Mark all as read
document.getElementById("markAllRead").addEventListener("click", () => {
    document.querySelectorAll(".notif-item").forEach(item => {
        const dot = item.querySelector(".notif-dot");
        dot.classList.remove("green");
        dot.classList.add("gray");
    });
});

// Clear all notifications
document.getElementById("clearAll").addEventListener("click", () => {
    document.getElementById("notificationList").innerHTML = '';
});

