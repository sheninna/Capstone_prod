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
// Desktop Navbar Rendering (with My Orders only if logged in)
// ======================================================
function updateDesktopNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // Remove all children first
  navbar.innerHTML = `
    <div class="container">
      <a class="navbar-brand" href="homepage.html">
        <img class="logo" src="../assets/logo.jpg" alt="LomiHub" style="height:60px;">
      </a>
      <!-- Hamburger button for mobile -->
      <button class="navbar-toggler d-lg-none" type="button" aria-label="Toggle navigation" onclick="openNavSidebar()" style="border:none;background:none;">
        <span class="navbar-toggler-icon"></span>
      </button>
      <!-- Desktop Navbar -->
      <div class="collapse navbar-collapse d-none d-lg-flex" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0" id="desktopNavLinks"></ul>
        <ul class="navbar-nav" id="customerNavActions"></ul>
      </div>
    </div>
  `;

  // Fill desktop nav links
  const desktopNavLinks = document.getElementById('desktopNavLinks');
  const isLoggedIn = !!localStorage.getItem('customerToken');
  if (desktopNavLinks) {
    desktopNavLinks.innerHTML = `
      <li class="nav-item">
        <a class="nav-link active" href="homepage.html">Home</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="ordernow.html">Order Now</a>
      </li>
      ${isLoggedIn ? `
      <li class="nav-item">
        <a class="nav-link" href="myOrders.html">My Orders</a>
      </li>
      ` : ''}
    `;
  }
  updateCustomerNavActions();
}

// ======================================================
// Dynamic Desktop Navbar for Auth State
// ======================================================
function updateCustomerNavActions() {
  const navActions = document.getElementById('customerNavActions');
  const isLoggedIn = !!localStorage.getItem('customerToken');

  if (navActions) {
    if (isLoggedIn) {
      navActions.innerHTML = `
        <li class="nav-item">
            <a class="nav-link" href="notifications.html">
                <span class="icon-circle"><i class="fas fa-bell fa-lg"></i></span>
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="account.html">
                <span class="icon-circle"><i class="fas fa-user fa-lg"></i></span>
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#" id="customerLogoutBtn">
                <span class="icon-circle"><i class="fa-solid fa-right-from-bracket fa-lg"></i></span>
            </a>
        </li>
      `;
      // Attach logout event
      const logoutBtn = document.getElementById('customerLogoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
          e.preventDefault();
          localStorage.removeItem('customerToken');
          updateDesktopNavbar();
          updateMobileNavSidebar();
        });
      }
    } else {
      navActions.innerHTML = `
        <li class="nav-item">
            <a class="nav-link" href="#" id="desktopSignInBtn">Sign In</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#" id="desktopSignUpBtn">Sign Up</a>
        </li>
      `;
      // Attach modal trigger for desktop sign in
      const desktopSignInBtn = document.getElementById('desktopSignInBtn');
      if (desktopSignInBtn) {
        desktopSignInBtn.addEventListener('click', function (e) {
          e.preventDefault();
          const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
          loginModal.show();
        });
      }
      // Attach modal trigger for desktop sign up
      const desktopSignUpBtn = document.getElementById('desktopSignUpBtn');
      if (desktopSignUpBtn) {
        desktopSignUpBtn.addEventListener('click', function (e) {
          e.preventDefault();
          const signupModalEl = document.getElementById('signupModal');
          if (signupModalEl) {
            const signupModal = bootstrap.Modal.getOrCreateInstance(signupModalEl);
            signupModal.show();
          }
        });
      }
    }
  }
}

function updateMobileNavSidebar() {
    const mobileNavSidebar = document.getElementById('mobileNavSidebar');
    const isLoggedIn = !!localStorage.getItem('customerToken');
    if (!mobileNavSidebar) return;

    let navHtml = `
        <div class="mobile-nav-header">
            <button class="close-btn" onclick="closeNavSidebar()" aria-label="Close">&times;</button>
        </div>
        <ul class="navbar-nav flex-column">
            <li class="nav-item">
                <a class="nav-link active" href="homepage.html">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="ordernow.html">Order Now</a>
            </li>
    `;

    if (isLoggedIn) {
        navHtml += `
            <li class="nav-item">
                <a class="nav-link" href="myOrders.html">My Orders</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="notifications.html">Notifications</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="account.html">Account</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#logoutModal">Logout</a>
            </li>
        `;
    } else {
        navHtml += `
            <li class="nav-item">
                <a class="nav-link" href="customerlogin.html" id="mobileSignInBtn">Sign In</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="customersignup.html">Sign Up</a>
            </li>
        `;
    }

    navHtml += `</ul>`;
    mobileNavSidebar.innerHTML = navHtml;
}

// Sidebar open/close functions
function openNavSidebar() {
  document.getElementById('mobileNavSidebar').style.display = 'block';
  document.getElementById('mobileNavSidebarBackdrop').style.display = 'block';
}
function closeNavSidebar() {
  document.getElementById('mobileNavSidebar').style.display = 'none';
  document.getElementById('mobileNavSidebarBackdrop').style.display = 'none';
}

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

  // First update auth state, then navbar
  updateCustomerNavActions();
  updateMobileNavSidebar();
  updateDesktopNavbar(); // <-- Move this AFTER updateCustomerNavActions

  initHamburgerIcon();

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

// --- Password Eye Toggle for Sign In Modal ---
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.toggle-password').forEach(function(btn) {
    btn.addEventListener('click', function () {
      // Find the input by data-target attribute
      const targetId = btn.getAttribute('data-target');
      const passwordInput = document.getElementById(targetId);
      if (passwordInput) {
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          btn.querySelector('i').classList.remove('fa-eye');
          btn.querySelector('i').classList.add('fa-eye-slash');
        } else {
          passwordInput.type = 'password';
          btn.querySelector('i').classList.remove('fa-eye-slash');
          btn.querySelector('i').classList.add('fa-eye');
        }
      }
    });
  });
});

// Example login handler for saving token after successful login
function handleCustomerLogin(token) {
  // Save token to localStorage
  localStorage.setItem('customerToken', token);

  // Update navbar and sidebar to reflect logged-in state
  updateDesktopNavbar();
  updateCustomerNavActions();
  updateMobileNavSidebar();
}

function handleCustomerLogout() {
  localStorage.removeItem('customerToken');
  updateDesktopNavbar();
  updateCustomerNavActions();
  updateMobileNavSidebar();
}

// --- Manual login form handler ---
document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');

  if (loginForm) {
    loginForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const email = emailInput.value;
      const password = passwordInput.value;

      const data = { email, password };

      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok && result.token) {
          handleCustomerLogin(result.token); // Save token and update navbar/actions/sidebar
          localStorage.setItem('user', JSON.stringify(result.user));
          // Close the modal
          const loginModalEl = document.getElementById('loginModal');
          if (loginModalEl && typeof bootstrap !== "undefined") {
            const modalInstance = bootstrap.Modal.getInstance(loginModalEl) || new bootstrap.Modal(loginModalEl);
            modalInstance.hide();
          }
        } else {
          alert(result.message || 'Login Failed!');
        }
      } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }

  // Toggle password visibility
  document.querySelectorAll('.toggle-password').forEach(function(btn) {
    btn.addEventListener('click', function () {
      const passwordInput = btn.closest('.mb-3').querySelector('input[type="password"], input[type="text"]');
      if (passwordInput) {
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          btn.querySelector('i').classList.remove('fa-eye');
          btn.querySelector('i').classList.add('fa-eye-slash');
        } else {
          passwordInput.type = 'password';
          btn.querySelector('i').classList.remove('fa-eye-slash');
          btn.querySelector('i').classList.add('fa-eye');
        }
      }
    });
  });
});

// --- Sign Up Modal Trigger ---
document.addEventListener('DOMContentLoaded', function () {
  // Attach only once and outside updateCustomerNavActions
  const signupModalEl = document.getElementById('signupModal');
  const desktopSignUpBtn = document.getElementById('desktopSignUpBtn');
  if (desktopSignUpBtn && signupModalEl) {
    desktopSignUpBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const signupModal = bootstrap.Modal.getOrCreateInstance(signupModalEl);
      signupModal.show();
    });
  }
});

// --- Professional OTP Input UI for Modal ---
document.addEventListener('DOMContentLoaded', function () {
  const otpInputs = document.querySelectorAll('#otpInputs .otp-input');
  if (otpInputs.length === 6) {
    otpInputs.forEach((input, idx) => {
      input.addEventListener('input', function () {
        // Only allow digits
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length === 1 && idx < otpInputs.length - 1) {
          otpInputs[idx + 1].focus();
        }
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !this.value && idx > 0) {
          otpInputs[idx - 1].focus();
        }
      });
      input.addEventListener('paste', function (e) {
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        if (/^\d{6}$/.test(paste)) {
          otpInputs.forEach((el, i) => el.value = paste[i] || '');
          otpInputs[5].focus();
          e.preventDefault();
        }
      });
    });
  }

  // Update OTP modal submit button to collect all 6 digits
  const submitOtpBtn = document.getElementById('submitOtpBtn');
  if (submitOtpBtn) {
    submitOtpBtn.onclick = async function() {
      const otp = Array.from(otpInputs).map(input => input.value).join('');
      const otpError = document.getElementById('otpError');
      if (otp.length !== 6) {
        otpError.innerText = "Please enter the 6-digit code.";
        otpError.style.display = 'block';
        return;
      }
      // Retrieve signup info stored in window for OTP verification
      const signupInfo = window._pendingSignupInfo;
      if (!signupInfo) {
        otpError.innerText = "Session expired. Please sign up again.";
        otpError.style.display = 'block';
        return;
      }
      // Verify OTP and create account
      const response = await fetch('http://localhost:5000/api/otp/verify-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...signupInfo, otp })
      });
      const result = await response.json();
      if (response.ok) {
        const otpModalEl = document.getElementById('otpModal');
        if (otpModalEl && typeof bootstrap !== "undefined") {
          const otpModal = bootstrap.Modal.getOrCreateInstance(otpModalEl);
          otpModal.hide();
        }
        alert('Sign Up Successful! Please log in.');
        // Show the sign in modal after successful verification
        const loginModalEl = document.getElementById('loginModal');
        if (loginModalEl && typeof bootstrap !== "undefined") {
          const loginModal = bootstrap.Modal.getOrCreateInstance(loginModalEl);
          loginModal.show();
        }
      } else {
        otpError.innerText = result.message;
        otpError.style.display = 'block';
      }
    };
  }
});

// --- Manual Sign Up Form Handler with OTP Modal (fix show OTP modal) ---
document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.getElementById('signupForm');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  function showOtpModal({ username, email, password }) {
    // Hide the sign-up modal first
    const signupModalEl = document.getElementById('signupModal');
    if (signupModalEl && typeof bootstrap !== "undefined") {
      const signupModal = bootstrap.Modal.getOrCreateInstance(signupModalEl);
      signupModal.hide();
    }

    // Store signup info globally for OTP verification
    window._pendingSignupInfo = { username, email, password };

    // Reset OTP inputs and error
    const otpInputs = document.querySelectorAll('#otpInputs .otp-input');
    otpInputs.forEach(input => input.value = '');
    document.getElementById('otpError').style.display = 'none';

    // Show OTP modal
    const otpModalEl = document.getElementById('otpModal');
    if (otpModalEl && typeof bootstrap !== "undefined") {
      const otpModal = bootstrap.Modal.getOrCreateInstance(otpModalEl);
      otpModal.show();
      setTimeout(() => otpInputs[0].focus(), 300);
    }
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const username = usernameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      // Validate passwords
      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      if (password.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
      }

      // Step 1: Send OTP for signup
      try {
        const response = await fetch('http://localhost:5000/api/otp/send-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const result = await response.json();
        if (response.ok) {
          showOtpModal({ username, email, password });
        } else {
          alert(result.message || 'Failed to send OTP!');
        }
      } catch (error) {
        console.error('Error during sign up:', error);
        alert('An error occurred. Please try again later.');
      }
    });
  }
});

window.addEventListener('pageshow', function () {
  updateCustomerNavActions();
  updateMobileNavSidebar();
  updateDesktopNavbar();
});

const signInBtn = document.getElementById('mobileSignInBtn');
if (signInBtn) {
    signInBtn.addEventListener('click', function(e) {
        e.preventDefault();
        closeNavSidebar();
        if (window.innerWidth <= 992) {
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = "customerlogin.html";
        } else {
            const loginModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('loginModal'));
            loginModal.show();
        }
    });
}

// Logout Modal
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