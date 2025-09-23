// DOM Elements
const floatingCartBtn = document.getElementById("floating-cart-btn");
const mobileCartSidebar = new bootstrap.Offcanvas(
  document.getElementById("orderSummaryMobile")
);
const cartItemsContainer = document.getElementById("cart-items");
const mobileCartItemsContainer = document.getElementById("mobile-cart-items");
const cartCount = document.getElementById("cart-count");
const subtotalElement = document.getElementById("subtotal");
const mobileSubtotalElement = document.getElementById("mobile-subtotal");
const checkoutBtn = document.getElementById("checkout-btn");
const mobileCheckoutBtn = document.getElementById("mobile-checkout-btn");

// Modals
const deliveryModal = new bootstrap.Modal(
  document.getElementById("deliveryModal")
);
const pickupModal = new bootstrap.Modal(document.getElementById("pickupModal"));
const reservationModal = new bootstrap.Modal(
  document.getElementById("reservationModal")
);
const successModal = new bootstrap.Modal(
  document.getElementById("successModal")
);

// Cart data structure
let cart = [];

// Product data with prices and options
const products = {
  dishes: [
    {
      id: "dishes-lomi",
      name: "Lomi",
      image: "../assets/lomi.png",
      sizes: [
        { portion: "Regular", price: 50 },
        { portion: "Special", price: 75 },
        { portion: "Large", price: 90 },
      ],
    },
    {
      id: "dishes-sweet-spicy",
      name: "Sweet & Spicy",
      image: "../assets/sweet_and_spicy.png",
      price: 90,
    },
    {
      id: "dishes-plain",
      name: "Plain",
      price: 85,
      image: "../assets/plain.png",
    },
    {
      id: "dishes-bihon",
      name: "Bihon",
      price: 80,
      image: "../assets/bihon.png",
    },
    {
      id: "dishes-tapsilog",
      name: "Tapsilog",
      price: 95,
      image: "../assets/tapsilog.png",
    },
    {
      id: "dishes-hotsilog",
      name: "Hotsilog",
      price: 75,
      image: "../assets/hotsilog.png",
    },
    {
      id: "dishes-siomai-rice",
      name: "Siomai Rice",
      price: 70,
      image: "../assets/siomai-rice.png",
    },
    {
      id: "dishes-siomaisilog",
      name: "Siomai Silog",
      price: 85,
      image: "../assets/siomaisilog.png",
    },
  ],
  bilao: [
    {
      id: "bilao-guisado",
      name: "Guisado",
      image: "../assets/guisado.png",
      sizes: [
        { portion: "Small", price: 480 },
        { portion: "Medium", price: 630 },
        { portion: "Large", price: 780 },
        { portion: "ExtraLarge", price: 1100 },
      ],
    },
    {
      id: "bilao-sweetandspicy",
      name: "Sweet and Spicy",
      image: "../assets/chami_bilao.png",
      sizes: [
        { portion: "Small", price: 580 },
        { portion: "Medium", price: 780 },
        { portion: "Large", price: 850 },
        { portion: "ExtraLarge", price: 1150 },
      ],
    },
    {
      id: "bilao-spaghetti",
      name: "Spaghetti",
      image: "../assets/Spaghetti_bilao.png",
      sizes: [
        { portion: "Medium", price: 750 },
        { portion: "Large", price: 950 },
      ],
    },
    {
      id: "bilao-palabok",
      name: "Palabok",
      image: "../assets/palabok_bilao.png",
      sizes: [
        { portion: "Medium", price: 750 },
        { portion: "Large", price: 900 },
      ],
    },
  ],
  desserts: [
    {
      id: "desserts-graham",
      name: "Graham",
      price: 120.0,
      image: "../assets/Graham.png",
    },
    {
      id: "desserts-lecheflan",
      name: "Leche Flan",
      price: 100.0,
      image: "../assets/leche-flan.png",
    },
    {
      id: "desserts-grahambar",
      name: "Graham Bar",
      price: 50.0,
      image: "../assets/graham-bar.png",
    },
    {
      id: "desserts-majablanca",
      name: "Maja Blanca",
      price: 50.0,
      image: "../assets/maja.png",
    },
  ],
};

// Function to render products by category
function renderProducts() {
  renderDishes();
  renderBilao();
  renderDesserts();
}

// Render dishes with portion options (using POS design)
function renderDishes() {
  const dishesContainer = document.getElementById("dishes-items");
  if (!dishesContainer) {
    console.error("Dishes container not found");
    return;
  }

  dishesContainer.innerHTML = "";

  products.dishes.forEach((product) => {
    const hasSizes = product.sizes !== undefined;

    if (hasSizes) {
      const productHTML = `
                <div class="card product-card" id="${product.id}">
                    <img src="${product.image}" alt="${product.name}">
                    <h4>${product.name}</h4>
                    <p class="price">
                        ${product.sizes
                          .map((size) => `${size.portion}: ₱${size.price}`)
                          .join(" | ")}
                    </p>
                    <div class="size-options">
                        ${product.sizes
                          .map(
                            (size, index) => `
                            <button type="button" class="size-btn ${
                              index === 0 ? "active" : ""
                            }" 
                                    data-size="${size.portion}" data-price="${
                              size.price
                            }">
                                ${size.portion}
                            </button>
                        `
                          )
                          .join("")}
                    </div>
                    <div class="qty-controls">
                        <button class="decrease-btn" data-product="${
                          product.id
                        }">-</button>
                        <span id="qty-${
                          product.id
                        }" class="quantity-value">0</span>
                        <button class="increase-btn" data-product="${
                          product.id
                        }">+</button>
                    </div>
                </div>
            `;

      dishesContainer.innerHTML += productHTML;
    } else {
      const productHTML = `
                <div class="card product-card" id="${product.id}">
                    <img src="${product.image}" alt="${product.name}">
                    <h4>${product.name}</h4>
                    <p class="price">₱${product.price}</p>
                    <div class="qty-controls">
                        <button class="decrease-btn" data-product="${product.id}">-</button>
                        <span id="qty-${product.id}" class="quantity-value">0</span>
                        <button class="increase-btn" data-product="${product.id}">+</button>
                    </div>
                </div>
            `;

      dishesContainer.innerHTML += productHTML;
    }
  });
}

// Render bilao products
function renderBilao() {
  const bilaoContainer = document.getElementById("bilao-items");
  if (!bilaoContainer) {
    console.error("Bilao container not found");
    return;
  }

  bilaoContainer.innerHTML = "";

  products.bilao.forEach((product) => {
    const productHTML = `
            <div class="card product-card" id="${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p class="price">
                    ${product.sizes
                      .map((size) => `${size.portion}: ₱${size.price}`)
                      .join(" | ")}
                </p>
                <div class="size-options">
                    ${product.sizes
                      .map(
                        (size, index) => `
                        <button type="button" class="size-btn ${
                          index === 0 ? "active" : ""
                        }" 
                                data-size="${size.portion}" data-price="${
                          size.price
                        }">
                            ${size.portion}
                        </button>
                    `
                      )
                      .join("")}
                </div>
                <div class="qty-controls">
                    <button class="decrease-btn" data-product="${
                      product.id
                    }">-</button>
                    <span id="qty-${product.id}" class="quantity-value">0</span>
                    <button class="increase-btn" data-product="${
                      product.id
                    }">+</button>
                </div>
            </div>
        `;

    bilaoContainer.innerHTML += productHTML;
  });
}

// Render desserts
function renderDesserts() {
  const dessertsContainer = document.getElementById("desserts-items");
  if (!dessertsContainer) {
    console.error("Desserts container not found");
    return;
  }

  dessertsContainer.innerHTML = "";

  products.desserts.forEach((product) => {
    const productHTML = `
            <div class="card product-card" id="${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p class="price">₱${product.price}</p>
                <div class="qty-controls">
                    <button class="decrease-btn" data-product="${product.id}">-</button>
                    <span id="qty-${product.id}" class="quantity-value">0</span>
                    <button class="increase-btn" data-product="${product.id}">+</button>
                </div>
            </div>
        `;

    dessertsContainer.innerHTML += productHTML;
  });
}

// Function to select size for dishes and bilao items
function selectSize(button, productId) {
  // Remove active class from all buttons in this group
  const sizeOptions = button.parentElement;
  const sizeButtons = sizeOptions.querySelectorAll(".size-btn");

  sizeButtons.forEach((btn) => {
    btn.classList.remove("active");
  });

  // Add active class to clicked button
  button.classList.add("active");

  // Update quantity display for the new size
  const size = button.getAttribute("data-size");
  updateSizedProductQuantityDisplay(productId, size);
}

// Update sized product quantity display
function updateSizedProductQuantityDisplay(productId, size) {
  // Create a unique ID for this product + size combination
  const cartItemId = `${productId}-${size.toLowerCase()}`;
  const quantity = getProductQuantity(cartItemId);

  // Update the quantity display for this product
  const qtyElement = document.getElementById(`qty-${productId}`);

  if (qtyElement) {
    qtyElement.textContent = quantity;
  }
}

// Add event listeners to product buttons
function attachProductEventListeners() {
  // Quantity buttons
  document.querySelectorAll(".increase-btn").forEach((btn) => {
    btn.addEventListener("click", increaseQuantity);
  });

  document.querySelectorAll(".decrease-btn").forEach((btn) => {
    btn.addEventListener("click", decreaseQuantity);
  });

  // Size buttons for both dishes and bilao
  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = this.closest(".product-card").id;
      selectSize(this, productId);
    });
  });
}

// Setup order type buttons
function setupOrderTypeButtons() {
  // Function to handle order type selection
  function handleOrderTypeSelection(container) {
    const buttons = container.querySelectorAll(".order-type button");

    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        // Remove active class from all buttons
        buttons.forEach((btn) => btn.classList.remove("active"));

        // Add active class to clicked button
        this.classList.add("active");
      });
    });
  }

  // Set up order type buttons for both desktop and mobile
  const desktopOrderType = document.querySelector("#cart-summary .order-type");
  const mobileOrderType = document.querySelector(
    "#mobile-cart-summary .order-type"
  );

  if (desktopOrderType) handleOrderTypeSelection(desktopOrderType);
  if (mobileOrderType) handleOrderTypeSelection(mobileOrderType);
}

// Get selected order type
function getSelectedOrderType(container) {
  const activeButton = container.querySelector(".order-type button.active");
  return activeButton
    ? activeButton.getAttribute("data-order-type")
    : "delivery";
}

// Initialize all event listeners
function initializeEventListeners() {
  // Checkout buttons
  checkoutBtn.addEventListener("click", openCheckoutModal);
  mobileCheckoutBtn.addEventListener("click", openCheckoutModal);

  // Floating cart button
  floatingCartBtn.addEventListener("click", openMobileCart);

  // Form submissions
  document
    .getElementById("delivery-form")
    .addEventListener("submit", handleDeliverySubmit);
  document
    .getElementById("pickup-form")
    .addEventListener("submit", handlePickupSubmit);
  document
    .getElementById("reservation-form")
    .addEventListener("submit", handleReservationSubmit);

  // Payment upload buttons
  document
    .getElementById("delivery-upload-payment")
    .addEventListener("click", () =>
      document.getElementById("delivery-payment-upload").click()
    );
  document
    .getElementById("pickup-upload-payment")
    .addEventListener("click", () =>
      document.getElementById("pickup-payment-upload").click()
    );
  document
    .getElementById("reservation-upload-payment")
    .addEventListener("click", () =>
      document.getElementById("reservation-payment-upload").click()
    );

  // Payment upload handlers
  document
    .getElementById("delivery-payment-upload")
    .addEventListener("change", (e) => handlePaymentUpload(e, "delivery"));
  document
    .getElementById("pickup-payment-upload")
    .addEventListener("change", (e) => handlePaymentUpload(e, "pickup"));
  document
    .getElementById("reservation-payment-upload")
    .addEventListener("change", (e) => handlePaymentUpload(e, "reservation"));

  // Location button
  document
    .getElementById("locate-me-btn")
    .addEventListener("click", handleLocationRequest);

  // Update delivery totals when modal is shown
  document
    .getElementById("deliveryModal")
    .addEventListener("show.bs.modal", function () {
      updateDeliveryTotals();
      updateLocationUI();
    });

  // Preserve form data when inputs change
  preserveFormData();

  // Add event listeners for order type buttons
  setupOrderTypeButtons();

  // Add product event listeners
  attachProductEventListeners();
}

// Increase quantity
function increaseQuantity(e) {
  const productId = this.getAttribute("data-product");
  const productCard = this.closest(".product-card");

  // For items with sizes, get the selected option
  let size = "Regular";
  const sizeOptions = productCard.querySelector(".size-options");

  if (sizeOptions) {
    const activeSize = sizeOptions.querySelector(".size-btn.active");
    size = activeSize
      ? activeSize.getAttribute("data-size")
      : productCard.classList.contains("bilao-product-card")
      ? "Small"
      : "Regular";
  }

  addToCart(productId, size);
}

// Decrease quantity
function decreaseQuantity(e) {
  const productId = this.getAttribute("data-product");
  const productCard = this.closest(".product-card");

  // For items with sizes, get the selected option
  let size = "Regular";
  const sizeOptions = productCard.querySelector(".size-options");

  if (sizeOptions) {
    const activeSize = sizeOptions.querySelector(".size-btn.active");
    size = activeSize
      ? activeSize.getAttribute("data-size")
      : productCard.classList.contains("bilao-product-card")
      ? "Small"
      : "Regular";
  }

  removeFromCart(productId, size);
}

// Add item to cart
function addToCart(productId, size = "Regular") {
  // Find the product in our data structure
  let product = null;
  let category = null;

  // Search through all categories
  for (const [cat, items] of Object.entries(products)) {
    const found = items.find((item) => item.id === productId);
    if (found) {
      product = found;
      category = cat;
      break;
    }
  }

  if (!product) return;

  // Calculate price based on size/portion
  let price = product.price;
  let selectedSize = size;

  // If product has sizes, find the price for the selected size
  if (product.sizes) {
    const sizeObj = product.sizes.find((s) => s.portion === size);
    if (sizeObj) {
      price = sizeObj.price;
      selectedSize = sizeObj.portion;
    } else {
      // Default to first size if specified size not found
      price = product.sizes[0].price;
      selectedSize = product.sizes[0].portion;
    }
  }

  // Create a unique ID for this product + size combination
  const cartItemId = `${productId}-${selectedSize.toLowerCase()}`;

  // Check if item already exists in cart with same size
  const existingItemIndex = cart.findIndex((item) => item.id === cartItemId);

  if (existingItemIndex !== -1) {
    // Increment quantity
    cart[existingItemIndex].quantity += 1;
  } else {
    // Add new item
    cart.push({
      id: cartItemId,
      baseId: productId,
      name: product.name,
      price: price,
      size: selectedSize,
      quantity: 1,
      category: category,
    });
  }

  updateQuantityDisplay(productId, selectedSize);
  updateCartUI();
}

// Remove item from cart
function removeFromCart(productId, size = "Regular") {
  // Find the product to get the correct size if needed
  let product = null;
  for (const [cat, items] of Object.entries(products)) {
    const found = items.find((item) => item.id === productId);
    if (found) {
      product = found;
      break;
    }
  }

  if (!product) return;

  // Determine the actual size to use
  let selectedSize = size;
  if (product.sizes && !product.sizes.find((s) => s.portion === size)) {
    selectedSize = product.sizes[0].portion;
  }

  // Create a unique ID for this product + size combination
  const cartItemId = `${productId}-${selectedSize.toLowerCase()}`;

  const existingItemIndex = cart.findIndex((item) => item.id === cartItemId);

  if (existingItemIndex !== -1) {
    if (cart[existingItemIndex].quantity > 1) {
      // Decrement quantity
      cart[existingItemIndex].quantity -= 1;
    } else {
      // Remove item
      cart.splice(existingItemIndex, 1);
    }

    updateQuantityDisplay(productId, selectedSize);
    updateCartUI();
  }
}

// Get product quantity from cart
function getProductQuantity(cartItemId) {
  const item = cart.find((item) => item.id === cartItemId);
  return item ? item.quantity : 0;
}

// Update the updateQuantityDisplay function
function updateQuantityDisplay(productId, size = "Regular") {
  // Create a unique ID for this product + size combination
  const cartItemId = `${productId}-${size.toLowerCase()}`;
  const quantity = getProductQuantity(cartItemId);
  const quantityElement = document.getElementById(`qty-${productId}`);

  if (quantityElement) {
    quantityElement.textContent = quantity;
  }
}

// Update cart UI
function updateCartUI() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Update cart count
  cartCount.textContent = totalItems;

  // Update subtotal
  subtotalElement.textContent = `₱${totalAmount.toFixed(2)}`;
  mobileSubtotalElement.textContent = `₱${totalAmount.toFixed(2)}`;

  // Enable/disable checkout buttons based on minimum order
  const isCheckoutDisabled = totalAmount < 200 || totalItems === 0;
  checkoutBtn.disabled = false;
  mobileCheckoutBtn.disabled = false;

  // Update cart items display
  updateCartItemsDisplay();

  // Show/hide empty cart message
  if (totalItems === 0) {
    document.querySelectorAll(".empty-cart-message").forEach((el) => {
      el.style.display = "block";
    });
  } else {
    document.querySelectorAll(".empty-cart-message").forEach((el) => {
      el.style.display = "none";
    });
  }

  // Update all product quantity displays
  updateAllProductQuantityDisplays();
}

// Update all product quantity displays
function updateAllProductQuantityDisplays() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const productId = card.id;
    const sizeOptions = card.querySelector(".size-options");

    if (sizeOptions) {
      const activeSize = sizeOptions.querySelector(".size-btn.active");
      if (activeSize) {
        const size = activeSize.getAttribute("data-size");
        updateSizedProductQuantityDisplay(productId, size);
      }
    } else {
      // For products without sizes
      updateQuantityDisplay(productId);
    }
  });
}

// Update cart items display
function updateCartItemsDisplay() {
  // Clear current items
  cartItemsContainer.innerHTML = "";
  mobileCartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    // Show empty cart message
    const emptyCartHTML = `
            <div class="text-center py-5 empty-cart-message">
                <i class="bi bi-cart-x fs-1 text-muted"></i>
                <p class="text-muted mb-0">Your cart is empty</p>
                <small class="text-secondary">Add some delicious items to get started!</small>
            </div>
        `;

    cartItemsContainer.innerHTML = emptyCartHTML;
    mobileCartItemsContainer.innerHTML = emptyCartHTML;
    return;
  }

  // Generate cart items HTML
  let cartHTML = "";

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    // Show "Regular" in cart instead of empty string
    const sizeText =
      item.size && item.size !== "Regular" ? ` (${item.size})` : "";

    cartHTML += `
            <div class="cart-item d-flex justify-content-between align-items-center mb-3 p-2 border-bottom">
                <div class="item-info">
                    <h6 class="mb-0">${item.name}${sizeText}</h6>
                    <small class="text-muted">₱${item.price.toFixed(2)} × ${
      item.quantity
    }</small>
                </div>
                <div class="item-total d-flex align-items-center">
                    <span class="fw-semibold me-2">₱${itemTotal.toFixed(
                      2
                    )}</span>
                    <button class="btn btn-sm btn-outline-danger remove-item" data-id="${
                      item.id
                    }">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
  });

  cartItemsContainer.innerHTML = cartHTML;
  mobileCartItemsContainer.innerHTML = cartHTML;

  // Add event listeners to remove buttons
  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", function () {
      const cartItemId = this.getAttribute("data-id");

      // Find and remove the item
      const itemIndex = cart.findIndex((item) => item.id === cartItemId);

      if (itemIndex !== -1) {
        // Extract base product ID and size from cart item ID
        const parts = cartItemId.split("-");
        const baseId = parts.slice(0, 2).join("-");
        const size = parts.slice(2).join("-");

        cart.splice(itemIndex, 1);

        // Update all quantity displays
        updateAllProductQuantityDisplays();
        updateCartUI();
      }
    });
  });
}

// Open mobile cart sidebar
function openMobileCart() {
  mobileCartSidebar.show();
}

function openCheckoutModal() {
  let selectedOption = "delivery";
  if (this.id === "checkout-btn") {
    selectedOption = getSelectedOrderType(
      document.getElementById("cart-summary")
    );
  } else if (this.id === "mobile-checkout-btn") {
    selectedOption = getSelectedOrderType(
      document.getElementById("mobile-cart-summary")
    );
  }

  // Check minimum order
  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  if (totalAmount < 200) {
    // Show minimum order modal
    const minOrderModal = new bootstrap.Modal(
      document.getElementById("minOrderModal")
    );
    minOrderModal.show();
    return;
  }

  if (selectedOption === "delivery") {
    deliveryModal.show();
  } else if (selectedOption === "pickup") {
    pickupModal.show();
  } else if (selectedOption === "reservation") {
    reservationModal.show();
  }
}

// Handle payment upload
function handlePaymentUpload(e, type) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const previewContainer = document.getElementById(
        `${type}-payment-preview`
      );
      previewContainer.innerHTML = `
                <img src="${e.target.result}" class="img-thumbnail payment-preview">
                <button type="button" class="btn btn-sm btn-danger mt-2 remove-payment" data-type="${type}">Remove</button>
            `;

      // Add event listener to remove button
      previewContainer
        .querySelector(".remove-payment")
        .addEventListener("click", function () {
          previewContainer.innerHTML = "";
          document.getElementById(`${type}-payment-upload`).value = "";
        });
    };
    reader.readAsDataURL(file);
  }
}

// Handle location request with geocoding
async function handleLocationRequest() {
  const statusElement = document.getElementById("location-status");
  const addressInput = document.getElementById("delivery-address");
  const shippingElement = document.getElementById("delivery-shipping-fee");

  statusElement.innerHTML = '<span class="text-warning">⏳</span> Locating...';

  // Enable manual address input as fallback
  addressInput.removeAttribute("readonly");

  try {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by your browser");
    }

    // Try to get current position with high accuracy
    const position = await getCurrentPositionWithTimeout();

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    statusElement.innerHTML =
      '<span class="text-warning">⏳</span> Getting address...';

    // Get address from coordinates
    const address = await getAddressFromCoordinates(lat, lng);

    if (address) {
      statusElement.innerHTML = `<span class="text-success">✓</span> Location found (within ${Math.round(
        accuracy
      )} meters)`;
      addressInput.value = address;

      // Calculate shipping fee
      const shopLocation = { lat: 13.92013, lng: 120.841504 };
      const distance = calculateDistance(
        lat,
        lng,
        shopLocation.lat,
        shopLocation.lng
      );
      const shippingFee = calculateShippingFee(distance);

      shippingElement.textContent = `₱${shippingFee.toFixed(2)}`;
      updateDeliveryTotals();

      // Save address to user data
      saveUserData(
        document.getElementById("delivery-name").value,
        document.getElementById("delivery-phone").value,
        address
      );
    } else {
      throw new Error("Could not determine address from location");
    }
  } catch (error) {
    console.error("Location error:", error);

    if (error.code === error.PERMISSION_DENIED) {
      statusElement.innerHTML =
        '<span class="text-danger">✗</span> Location access denied. Please enable location permissions or enter address manually.';
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      statusElement.innerHTML =
        '<span class="text-danger">✗</span> Location unavailable. Please enter your address manually.';
    } else if (error.code === error.TIMEOUT) {
      statusElement.innerHTML =
        '<span class="text-danger">✗</span> Location request timed out. Please enter your address manually.';
    } else {
      statusElement.innerHTML = `<span class="text-danger">✗</span> ${
        error.message ||
        "Could not retrieve location. Please enter address manually."
      }`;
    }

    // Set a default shipping fee
    shippingElement.textContent = "₱35.00";
    updateDeliveryTotals();
  }
}

// Get current position with timeout and better error handling
function getCurrentPositionWithTimeout() {
  return new Promise((resolve, reject) => {
    // Set a timeout for the geolocation request
    const timeoutId = setTimeout(() => {
      reject(new Error("Location request timed out"));
    }, 15000); // 15 second timeout

    const geolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0, // Don't use cached position
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve(position);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
      geolocationOptions
    );
  });
}

// Get address from coordinates using multiple fallback methods
async function getAddressFromCoordinates(lat, lng) {
  // Try multiple geocoding services in sequence
  const services = [
    getAddressFromBigDataCloud,
    getAddressFromOSM,
    getAddressFromLocationIQ,
  ];

  for (const service of services) {
    try {
      const address = await service(lat, lng);
      if (address && isValidAddress(address)) {
        return address;
      }
    } catch (error) {
      console.log(`Geocoding service failed: ${service.name}`, error);
      // Continue to next service
    }
  }

  // If all services fail, return coordinates as fallback
  return `Near coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

// Get address from BigDataCloud (usually more reliable)
async function getAddressFromBigDataCloud(lat, lng) {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );

    if (!response.ok) {
      throw new Error("BigDataCloud service unavailable");
    }

    const data = await response.json();

    if (data && (data.city || data.locality)) {
      // Format address from available components
      const addressParts = [];
      if (data.locality) addressParts.push(data.locality);
      if (data.city && data.city !== data.locality)
        addressParts.push(data.city);
      if (data.principalSubdivision)
        addressParts.push(data.principalSubdivision);
      if (data.countryName) addressParts.push(data.countryName);

      return addressParts.join(", ") || `Near ${data.locality || data.city}`;
    }

    throw new Error("No address data from BigDataCloud");
  } catch (error) {
    console.error("BigDataCloud error:", error);
    throw error;
  }
}

// Get address from OpenStreetMap Nominatim
async function getAddressFromOSM(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error("OSM service unavailable");
    }

    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    }

    throw new Error("No address data from OSM");
  } catch (error) {
    console.error("OSM error:", error);
    throw error;
  }
}

// Get address from LocationIQ (fallback)
async function getAddressFromLocationIQ(lat, lng) {
  try {
    // Using a demo key (replace with your own API key in production)
    const API_KEY = "pk.a6f5a24c6a0c2c2b5a5a5a5a5a5a5a5a"; // This is a demo key
    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse.php?key=${API_KEY}&lat=${lat}&lon=${lng}&format=json&normalizeaddress=1`
    );

    if (!response.ok) {
      throw new Error("LocationIQ service unavailable");
    }

    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    }

    throw new Error("No address data from LocationIQ");
  } catch (error) {
    console.error("LocationIQ error:", error);
    throw error;
  }
}

// Check if the address is valid (not just coordinates)
function isValidAddress(address) {
  if (!address || typeof address !== "string") return false;

  // Check if it's just coordinates
  if (
    address.toLowerCase().includes("near coordinates") ||
    /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(address)
  ) {
    return false;
  }

  // Check if it has meaningful address components
  const hasLocationWords =
    /\b(road|street|st|avenue|ave|boulevard|blvd|lane|ln|drive|dr|barangay|brgy|city|municipality|town|province)\b/i.test(
      address
    );
  const hasNumbers = /\d/.test(address);

  return hasLocationWords || hasNumbers;
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Calculate shipping fee based on distance
function calculateShippingFee(distance) {
  if (distance <= 2) return 20;
  if (distance <= 5) return 35;
  if (distance <= 10) return 50;
  return 75;
}

// Calculate and update delivery modal totals
function updateDeliveryTotals() {
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shippingText = document.getElementById(
    "delivery-shipping-fee"
  ).textContent;
  const shippingFee = parseFloat(shippingText.replace("₱", "")) || 0;
  const total = subtotal + shippingFee;

  document.getElementById(
    "delivery-subtotal"
  ).textContent = `₱${subtotal.toFixed(2)}`;
  document.getElementById("delivery-total").textContent = `₱${total.toFixed(
    2
  )}`;
}

// Update the UI to show when location is being retrieved
function updateLocationUI() {
  const statusElement = document.getElementById("location-status");
  const addressInput = document.getElementById("delivery-address");

  statusElement.innerHTML =
    '<span class="text-warning">⚠</span> Click "Locate Me" to find your location or enter address manually';
  addressInput.placeholder = "Enter your complete address for delivery";
}

// Handle delivery form submission
function handleDeliverySubmit(e) {
  e.preventDefault();

  const name = document.getElementById("delivery-name").value;
  const phone = document.getElementById("delivery-phone").value;
  const address = document.getElementById("delivery-address").value;

  if (!name || !phone || !address) {
    alert("Please fill in all required fields");
    return;
  }

  if (!document.getElementById("delivery-payment-upload").files[0]) {
    alert("Please upload payment proof");
    return;
  }

  // Save user data
  saveUserData(name, phone, address);

  // Process order
  processOrder("delivery", { name, phone, address });
}

// Handle pickup form submission
function handlePickupSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("pickup-name").value;
  const phone = document.getElementById("pickup-phone").value;

  if (!name || !phone) {
    alert("Please fill in all required fields");
    return;
  }

  if (!document.getElementById("pickup-payment-upload").files[0]) {
    alert("Please upload payment proof");
    return;
  }

  // Save user data
  saveUserData(name, phone);

  // Process order
  processOrder("pickup", { name, phone });
}

// Handle reservation form submission
function handleReservationSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("reservation-name").value;
  const phone = document.getElementById("reservation-phone").value;
  const people = document.getElementById("reservation-people").value;
  const date = document.getElementById("reservation-date").value;
  const time = document.getElementById("reservation-time").value;

  if (!name || !phone || !people || !date || !time) {
    alert("Please fill in all required fields");
    return;
  }

  if (!document.getElementById("reservation-payment-upload").files[0]) {
    alert("Please upload payment proof");
    return;
  }

  // Save user data
  saveUserData(name, phone);

  // Process order
  processOrder("reservation", { name, phone, people, date, time });
}

// Process order
function processOrder(type, details) {
  console.log(`Processing ${type} order:`, details, cart);

  // In a real app, you would send this data to your server

  // Show success message
  if (type === "delivery") {
    deliveryModal.hide();
  } else if (type === "pickup") {
    pickupModal.hide();
  } else if (type === "reservation") {
    reservationModal.hide();
  }

  setTimeout(() => {
    successModal.show();

    // Clear cart after successful order
    cart = [];
    updateCartUI();

    // Reset all quantity displays
    document.querySelectorAll('[id^="qty-"]').forEach((el) => {
      el.textContent = "0";
    });
  }, 500);
}

// Save user data to localStorage
function saveUserData(name, phone, address = null) {
  const userData = { name, phone };
  if (address) userData.address = address;

  localStorage.setItem("lomihub_user", JSON.stringify(userData));
}

// Load user data from localStorage
function loadUserData() {
  const userData = JSON.parse(localStorage.getItem("lomihub_user") || "{}");

  if (userData.name) {
    document.getElementById("delivery-name").value = userData.name;
    document.getElementById("pickup-name").value = userData.name;
    document.getElementById("reservation-name").value = userData.name;
  }

  if (userData.phone) {
    document.getElementById("delivery-phone").value = userData.phone;
    document.getElementById("pickup-phone").value = userData.phone;
    document.getElementById("reservation-phone").value = userData.phone;
  }

  if (userData.address) {
    document.getElementById("delivery-address").value = userData.address;
  }
}

// Preserve form data when inputs change
function preserveFormData() {
  // Save form data when inputs change
  document
    .querySelectorAll(
      "#delivery-form input, #pickup-form input, #reservation-form input"
    )
    .forEach((input) => {
      input.addEventListener("change", function () {
        saveUserData(
          document.getElementById("delivery-name").value ||
            document.getElementById("pickup-name").value ||
            document.getElementById("reservation-name").value,
          document.getElementById("delivery-phone").value ||
            document.getElementById("pickup-phone").value ||
            document.getElementById("reservation-phone").value,
          document.getElementById("delivery-address")
            ? document.getElementById("delivery-address").value
            : null
        );
      });
    });
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing");
  renderProducts();
  initializeEventListeners();
  loadUserData();
  updateCartUI();

  // Show floating cart button on mobile
  if (window.innerWidth <= 992) {
    floatingCartBtn.style.display = "flex";
  }

  // Make address input readonly initially
  document.getElementById("delivery-address").setAttribute("readonly", true);

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    input.min = today;
  });
});
