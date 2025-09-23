// ======================================================
// Carousel
// ======================================================
function initGalleryCarousel() {
  const track = document.getElementById("cardsTrack");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const prevBtn = document.querySelector(".carousel-btn.prev");

  if (!track) return;

  // Remove old clones
  Array.from(track.querySelectorAll('[data-clone="true"]')).forEach((n) =>
    n.remove()
  );

  const origCards = Array.from(track.querySelectorAll(".card"));
  if (origCards.length === 0) return;

  // --- How many cards fit in the screen ---
  let cardWidth = origCards[0].offsetWidth + 16;
  let cardsPerView =
    Math.floor(track.parentElement.offsetWidth / cardWidth) || 1;

  // Clone only as many as needed for smooth looping
  const clonesEnd = origCards.slice(0, cardsPerView).map((c) => {
    const clone = c.cloneNode(true);
    clone.setAttribute("data-clone", "true");
    return clone;
  });
  clonesEnd.forEach((c) => track.appendChild(c));

  const clonesStart = origCards.slice(-cardsPerView).map((c) => {
    const clone = c.cloneNode(true);
    clone.setAttribute("data-clone", "true");
    return clone;
  });
  clonesStart.forEach((c) => track.insertBefore(c, track.firstChild));

  let allCards = Array.from(track.querySelectorAll(".card"));
  let currentPosition = cardsPerView; // Start at the first real card
  let currentTranslate = -cardWidth * currentPosition;
  track.style.transform = `translateX(${currentTranslate}px)`;

  function moveToCard(index, animate = true) {
    track.style.transition = animate ? "transform 0.5s ease" : "none";
    currentPosition = index;
    currentTranslate = -cardWidth * currentPosition;
    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  nextBtn?.addEventListener("click", () => moveToCard(currentPosition + 1));
  prevBtn?.addEventListener("click", () => moveToCard(currentPosition - 1));

  track.addEventListener("transitionend", () => {
    allCards = Array.from(track.querySelectorAll(".card"));
    // If at the end clones, jump to the real first set
    if (currentPosition >= allCards.length - cardsPerView) {
      moveToCard(cardsPerView, false);
    }
    // If at the start clones, jump to the real last set
    else if (currentPosition < cardsPerView) {
      moveToCard(allCards.length - cardsPerView * 2, false);
    }
  });

  // Auto slide
  let autoSlide = setInterval(() => moveToCard(currentPosition + 1), 3000);

  track.addEventListener("mouseenter", () => clearInterval(autoSlide));
  track.addEventListener("mouseleave", () => {
    autoSlide = setInterval(() => moveToCard(currentPosition + 1), 3000);
  });

  // Responsive
  window.addEventListener("resize", () => {
    cardWidth = origCards[0].offsetWidth + 16;
    cardsPerView = Math.floor(track.parentElement.offsetWidth / cardWidth) || 1;
    currentTranslate = -cardWidth * currentPosition;
    track.style.transition = "none";
    track.style.transform = `translateX(${currentTranslate}px)`;
  });

  // --- Touch/Swipe for Mobile Only ---
  let startX = 0;
  let isDragging = false;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  track.addEventListener(
    "touchstart",
    function (e) {
      if (!isMobile()) return;
      isDragging = true;
      startX = e.touches[0].clientX;
    },
    { passive: true }
  );

  track.addEventListener(
    "touchmove",
    function (e) {
      if (!isMobile() || !isDragging) return;
      // Optionally, you can add visual feedback here
    },
    { passive: true }
  );

  track.addEventListener("touchend", function (e) {
    if (!isMobile() || !isDragging) return;
    isDragging = false;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    if (Math.abs(diff) > 50) {
      // swipe threshold
      if (diff < 0) {
        // Swipe left, next card
        moveToCard(currentPosition + 1);
      } else {
        // Swipe right, prev card
        moveToCard(currentPosition - 1);
      }
    }
  });
}

// ======================================================
// Order Button
// ======================================================
function initOrderNowButton() {
  const orderNowBtn = document.getElementById("orderNowBtn");
  if (orderNowBtn) {
    orderNowBtn.addEventListener("click", function () {
      window.location.href = "ordernow.html";
    });
  }
}

// ======================================================
// Modal Close Buttons
// ======================================================
function initModalClose() {
  document
    .querySelectorAll(".feedback-modal .close, .feedback-modal .close-btn")
    .forEach((btn) => {
      btn.addEventListener("click", function () {
        const modal = this.closest(".feedback-modal");
        if (modal) {
          modal.style.display = "none";
          document.body.style.overflow = "auto";
        }
      });
    });
}

// ======================================================
// Best Selling Products
// ======================================================
function loadBestSellingProducts() {
  const bestSellingProducts = document.getElementById("bestSellingProducts");
  if (!bestSellingProducts) return;

  const bestSellers = [
    {
      category: "Dishes",
      title: "Lomi",
      colorClass: "bg-pink",
      actionText: "Order Now →",
      image: "../assets/lomi.png",
      link: "ordernow.html?category=dishes",
    },
    {
      category: "Bilao",
      title: "Palabok",
      colorClass: "bg-green",
      actionText: "Order Now →",
      image: "../assets/palabok_bilao.png",
      link: "ordernow.html?category=bilao",
    },
    {
      category: "Deserts",
      title: "Leche Flan",
      colorClass: "bg-blue",
      actionText: "Order Now →",
      image: "../assets/leche-flan.png",
      link: "ordernow.html?category=desserts",
    },
  ];

  bestSellingProducts.innerHTML = bestSellers
    .map(
      (item) => `
  <div class="col-12 col-lg-4 mb-4">
    <div class="best-selling-card ${item.colorClass} rounded-4">
      <div class="best-selling-content">
        <div class="best-selling-header">
          <h3 class="best-selling-category">Best Selling ${item.category}</h3>
        </div>
        <div class="best-selling-body">
          <h4 class="best-selling-title">${item.title}</h4>
          <a href="${item.link}" class="best-selling-action">${item.actionText}</a>
        </div>
      </div>
      <div class="best-selling-img-container">
        <img src="${item.image}" alt="${item.title}" class="best-selling-img">
      </div>
    </div>
  </div>
`
    )
    .join("");
}

// ======================================================
// Recommendations
// ======================================================
function loadRecommendations() {
  const recommendationsGrid = document.getElementById("recommendationsGrid");
  if (!recommendationsGrid) return;

  const recommendations = [
    { name: "Graham", action: "+ Order Now", image: "../assets/Graham.png" },
    { name: "Bihon", action: "+ Order Now", image: "../assets/bihon.png" },
    {
      name: "Sweet & Spicy",
      action: "+ Order Now",
      image: "../assets/sweet_and_spicy.png",
    },
    {
      name: "Spaghetti",
      action: "+ Order Now",
      image: "../assets/Spaghetti_bilao.png",
    },
  ];

  recommendationsGrid.innerHTML = recommendations
    .map(
      (item) => `
    <div class="col-6 col-md-3 mb-4 px-2">
      <div class="recommendation-item h-100 mx-1">
        <img src="${item.image}" alt="${item.name}" class="recommendation-img">
        <div class="recommendation-name">${item.name}</div>
        <button class="recommendation-action" onclick="window.location.href='ordernow.html'">
          ${item.action}
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

// ======================================================
// Initialization
// ======================================================
document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll(".feedback-modal")
    .forEach((modal) => (modal.style.display = "none"));

  loadBestSellingProducts();
  loadRecommendations();
  initGalleryCarousel();
  initOrderNowButton();
  initStarRating();
  initModalClose();

  const savedInfo = localStorage.getItem("lomihub_business_info");
  if (savedInfo) {
    const businessInfo = JSON.parse(savedInfo);

    document.getElementById("footerContact").textContent =
      "📞 " + (businessInfo.contact || "Not available");
    document.getElementById("footerEmail").textContent =
      "✉️ " + (businessInfo.email || "Not available");
    document.getElementById("footerAddress").textContent =
      "📍 " + (businessInfo.address || "Not available");

    // Facebook/Website with logo
    if (businessInfo.website) {
      document.getElementById("footerWebsite").innerHTML = `
        <a href="${businessInfo.website}" target="_blank">
          <i class="bi bi-facebook"></i> Facebook
        </a>
      `;
    }
  }
});

// ======================================================
// Review System
// ======================================================
let selectedRating = 0;
let reviewsData = [];

// --- Star rating selection ---
function initStarRating() {
  const stars = document.querySelectorAll(".rating-stars .star");
  stars.forEach((star) => {
    star.addEventListener("click", function () {
      selectedRating = parseInt(this.getAttribute("data-rating"));
      highlightStars(selectedRating);
    });
  });
}

function highlightStars(rating) {
  const stars = document.querySelectorAll(".rating-stars .star");
  stars.forEach((star, index) => {
    star.style.color = index < rating ? "gold" : "gray";
  });
}

// --- Modals ---
const reviewModal = document.getElementById("reviewModal");
const reviewsModal = document.getElementById("reviewsModal");
const feedbackSubmittedModal = document.getElementById(
  "feedbackSubmittedModal"
);

function openReviewModal() {
  reviewModal.style.display = "flex";
  document.body.style.overflow = "hidden";
}
function closeReviewModal() {
  reviewModal.style.display = "none";
  document.body.style.overflow = "auto";
}
function openBrowseReviewsModal() {
  reviewsModal.style.display = "flex";
  document.body.style.overflow = "hidden";
  updateReviewStats();
  renderReviews();
}
function closeBrowseReviewsModal() {
  reviewsModal.style.display = "none";
  document.body.style.overflow = "auto";
}
function openFeedbackSubmittedModal() {
  feedbackSubmittedModal.style.display = "flex";
  document.body.style.overflow = "hidden";
}
function closeFeedbackSubmittedModal() {
  feedbackSubmittedModal.style.display = "none";
  document.body.style.overflow = "auto";
}
function handleFeedbackOk() {
  closeFeedbackSubmittedModal();
  openBrowseReviewsModal();
}

window.addEventListener("click", function (event) {
  if (event.target === reviewModal) closeReviewModal();
  if (event.target === reviewsModal) closeBrowseReviewsModal();
  if (event.target === feedbackSubmittedModal) closeFeedbackSubmittedModal();
});

// --- Stats update ---
function updateReviewStats() {
  const totalReviews = reviewsData.length;
  const averageRatingEl = document.getElementById("averageRating");
  const totalReviewsEl = document.getElementById("totalReviews");

  if (totalReviews === 0) {
    averageRatingEl.textContent = "0.0";
    totalReviewsEl.textContent = "0";
    for (let i = 5; i >= 1; i--) {
      document.getElementById(`starBar${i}`).style.width = "0%";
      document.getElementById(`starPercent${i}`).textContent = "0%";
    }
    return;
  }

  const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  averageRatingEl.textContent = avg.toFixed(1);
  totalReviewsEl.textContent = totalReviews;

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviewsData.forEach((r) => counts[r.rating]++);

  for (let i = 5; i >= 1; i--) {
    const percent = (counts[i] / totalReviews) * 100;
    document.getElementById(`starBar${i}`).style.width = `${percent}%`;
    document.getElementById(`starPercent${i}`).textContent = `${Math.round(
      percent
    )}%`;
  }
}

// --- Render reviews ---
function renderReviews() {
  const reviewsContainer = document.getElementById("reviewsContainer");
  reviewsContainer.innerHTML = "";

  reviewsData
    .slice()
    .reverse()
    .forEach((r) => {
      const reviewCard = document.createElement("div");
      reviewCard.classList.add("review-card");
      reviewCard.innerHTML = `
      <div class="review-header">
        <p class="review-name">${escapeHtml(r.name)}</p>
        <span class="review-date">${escapeHtml(r.date)}</span>
      </div>
      <div class="stars">${"★".repeat(r.rating)}${"☆".repeat(
        5 - r.rating
      )}</div>
      <p class="review-text">${escapeHtml(r.text)}</p>
    `;
      reviewsContainer.appendChild(reviewCard);
    });
}

// --- Submit review ---
function submitReview() {
  const reviewTextEl = document.getElementById("reviewText");
  const reviewText = reviewTextEl.value.trim();

  const userSpan = document.getElementById("loggedInUser");
  if (!userSpan || userSpan.textContent.trim() === "") {
    alert("You must be logged in to submit a review.");
    return;
  }

  if (selectedRating === 0) {
    alert("Please select a star rating!");
    return;
  }
  if (reviewText === "") {
    alert("Please write your review!");
    return;
  }

  const userName = userSpan.textContent.trim();

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  reviewsData.push({
    name: userName,
    rating: selectedRating,
    text: reviewText,
    date: dateStr,
  });

  updateReviewStats();
  renderReviews();

  reviewTextEl.value = "";
  selectedRating = 0;
  highlightStars(0);

  closeReviewModal();
  openFeedbackSubmittedModal();
}

// --- Escape HTML ---
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m];
  });
}

document.addEventListener("DOMContentLoaded", initStarRating);

function loadFooterContactInfo() {
  const info = JSON.parse(
    localStorage.getItem("lomihub_business_info") || "{}"
  );
  const el = document.getElementById("footerContactInfo");
  if (!el) return;
  el.innerHTML = `
    <div>${info.contact ? `<b>Contact:</b> ${info.contact}<br>` : ""}
         ${info.email ? `<b>Email:</b> ${info.email}<br>` : ""}
         ${info.address ? `<b>Address:</b> ${info.address}<br>` : ""}
    </div>
  `;
}
document.addEventListener("DOMContentLoaded", loadFooterContactInfo);
