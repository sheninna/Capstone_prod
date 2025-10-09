document.addEventListener('DOMContentLoaded', function() {


  // Fetch products from backend
  let products = {};
  async function fetchProducts() {
    try {
      const response = await fetch('http://localhost:5000/api/foods'); // Adjust endpoint as needed
      const data = await response.json();
      // Group by category if needed, or just use as flat array
      products = data.reduce((acc, food) => {
        const cat = food.category || 'others';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(food);
        return acc;
      }, {});
    } catch (err) {
      alert('Failed to load menu from server.');
      products = {};
    }
  }

      // Current state
      let currentCategory = 'dishes';
      let cart = [];
      let orderType = 'dine-in';

      // Initialize the page
      async function init() {
        await fetchProducts();
        loadCategory('dishes');
        setupEventListeners();
      }

      // Set up event listeners
      function setupEventListeners() {
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(button => {
          button.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.getAttribute('data-category');
            loadCategory(currentCategory);
          });
        });

        // Order type buttons
        document.getElementById('dine-in-btn').addEventListener('click', function() {
          orderType = 'dine-in';
          this.classList.add('active');
          document.getElementById('take-out-btn').classList.remove('active');
        });

        document.getElementById('take-out-btn').addEventListener('click', function() {
          orderType = 'take-out';
          this.classList.add('active');
          document.getElementById('dine-in-btn').classList.remove('active');
        });

        // Place order button
        document.getElementById('place-order').addEventListener('click', placeOrder);
      }

      // Load products for a category
      function loadCategory(category) {
        const itemsContainer = document.getElementById('items-container');
        itemsContainer.innerHTML = '';

        // Only show foods for the selected category. If no foods, show 'No foods found.'
        let foods = [];
        if (products[category]) {
          foods = products[category];
        } else {
          // Try case-insensitive match
          const key = Object.keys(products).find(k => k.toLowerCase() === category.toLowerCase());
          if (key) foods = products[key];
        }

        // If not desserts, and no foods, show nothing
        if ((category !== 'desserts') && (!foods || foods.length === 0)) {
          itemsContainer.innerHTML = '<div class="text-center w-100 mt-5"><h4>No foods found.</h4></div>';
          return;
        }

        // If desserts, show only desserts (even if empty)
        if (category === 'desserts') {
          if (!foods || foods.length === 0) {
            itemsContainer.innerHTML = '<div class="text-center w-100 mt-5"><h4>No desserts found.</h4></div>';
            return;
          }
        }

        foods.forEach(product => {
          const col = document.createElement('div');
          col.className = 'col-md-4 mb-4 d-flex';
          if (product.portions && product.portions.length > 0) {
            col.appendChild(createSizedProductCard(product, category));
          } else {
            col.appendChild(createProductCard(product));
          }
          itemsContainer.appendChild(col);
        });
        updateAllQuantityDisplays();
      }


      // Create a regular product card (without size options)
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card lomi-product-card';
  card.id = product._id;
  let imgSrc = '../assets/default.png';
  if (product.image) {
    // If image path is relative to backend uploads, prefix with backend URL
    if (product.image.startsWith('uploads/')) {
      imgSrc = `http://localhost:5000/${product.image}`;
    } else {
      imgSrc = product.image;
    }
  }
  card.innerHTML = `
    <img src="${imgSrc}" alt="${product.name}" style="max-height:210px;width:auto;object-fit:contain;display:block;margin:0 auto 10px;border-radius:12px; margin-top:10px;">
    <h4>${product.name}</h4>
    <p class="price">₱${product.price ? product.price.toFixed(2) : ''}</p>
    <div class="qty-controls">
      <button class="decrease-btn" data-product="${product._id}">-</button>
      <span id="qty-${product._id}">0</span>
      <button class="increase-btn" data-product="${product._id}">+</button>
    </div>
  `;
  card.querySelector('.increase-btn').addEventListener('click', () => {
    updateQuantity(product._id, 1, product.name, product.price);
  });
  card.querySelector('.decrease-btn').addEventListener('click', () => {
    updateQuantity(product._id, -1, product.name, product.price);
  });
  return card;
}

// Create a product card with size options (Lomi/Bilao)
function createSizedProductCard(product, category) {
  const card = document.createElement('div');
  card.className = `product-card lomi-product-card`;
  card.id = product._id;
  let sizeOptionsHTML = '';
  product.portions.forEach(size => {
    sizeOptionsHTML += `
      <button class="size-btn" 
              data-size="${size.portion.toLowerCase()}" 
              data-price="${size.price}">
        ${size.portion}
      </button>
    `;
  });
  let imgSrc = '../assets/default.png';
  if (product.image) {
    if (product.image.startsWith('uploads/')) {
      imgSrc = `http://localhost:5000/${product.image}`;
    } else {
      imgSrc = product.image;
    }
  }
  card.innerHTML = `
    <img src="${imgSrc}" alt="${product.name}" style="max-height:210px;width:auto;object-fit:contain;display:block;margin:0 auto 10px;border-radius:12px; margin-top:10px;">
    <h4>${product.name}</h4>
    <p class="price">
      ${product.portions.map(size => `${size.portion}: ₱${size.price}`).join(' | ')}
    </p>
    <div class="size-options">
      ${sizeOptionsHTML}
    </div>
    <div class="qty-controls">
      <button class="decrease-btn" data-product="${product._id}">-</button>
      <span id="qty-${product._id}">0</span>
      <button class="increase-btn" data-product="${product._id}">+</button>
    </div>
  `;
  const sizeButtons = card.querySelectorAll('.size-btn');
  if (sizeButtons.length > 0) {
    sizeButtons[0].classList.add('active');
    sizeButtons.forEach(button => {
      button.addEventListener('click', function() {
        sizeButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        const size = this.getAttribute('data-size');
        updateSizedProductQuantityDisplay(product._id, size);
      });
    });
  }
  card.querySelector('.increase-btn').addEventListener('click', () => {
    const activeSize = card.querySelector('.size-btn.active');
    if (!activeSize) return;
    const size = activeSize.getAttribute('data-size');
    const price = parseFloat(activeSize.getAttribute('data-price'));
    updateQuantity(`${product._id}-${size}`, 1, `${product.name} (${size})`, price);
  });
  card.querySelector('.decrease-btn').addEventListener('click', () => {
    const activeSize = card.querySelector('.size-btn.active');
    if (!activeSize) return;
    const size = activeSize.getAttribute('data-size');
    const price = parseFloat(activeSize.getAttribute('data-price'));
    updateQuantity(`${product._id}-${size}`, -1, `${product.name} (${size})`, price);
  });
  return card;
}

      // Update item quantity
      function updateQuantity(productId, change, productName, productPrice) {
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex >= 0) {
          cart[itemIndex].quantity += change;

          if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1); // completely remove from cart
          }
        } else if (change > 0) {
          cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
          });
        }

        updateCartDisplay();
        updateTotal();
        updateQuantityDisplay(productId);
      }

      // Update quantity display on product cards
      function updateQuantityDisplay(productId) {
        // For regular products
        const qtyElement = document.getElementById(`qty-${productId}`);
        if (qtyElement) {
          const totalQty = cart
            .filter(item => item.id === productId)
            .reduce((sum, item) => sum + item.quantity, 0);
          qtyElement.textContent = totalQty;
        }
        
        // For products with sizes
        if (productId.includes('-')) {
          const baseId = productId.split('-').slice(0, 2).join('-');
          const size = productId.split('-')[2];
          updateSizedProductQuantityDisplay(baseId, size);
        }
      }
      
      // Update sized product quantity display
      function updateSizedProductQuantityDisplay(productId, size) {
        const quantity = getProductQuantity(`${productId}-${size}`);
        const qtyElement = document.getElementById(`qty-${productId}`);
        
        if (qtyElement) {
          // Only update if the current size is selected
          const card = document.getElementById(productId);
          if (card) {
            const activeSize = card.querySelector('.size-btn.active');
            if (activeSize && activeSize.getAttribute('data-size') === size) {
              qtyElement.textContent = quantity;
            }
          }
        }
      }
      
      // Get product quantity from cart
      function getProductQuantity(productId) {
        const item = cart.find(item => item.id === productId);
        return item ? item.quantity : 0;
      }
      
      // Update all quantity displays for the current category
      function updateAllQuantityDisplays() {
        if (products[currentCategory]) {
          products[currentCategory].forEach(product => {
            if (product.sizes) {
              // For items with sizes, update for each size
              product.sizes.forEach(size => {
                const sizeId = `${product.id}-${size.portion.toLowerCase()}`;
                updateQuantityDisplay(sizeId);
              });
            } else {
              // For regular items
              updateQuantityDisplay(product.id);
            }
          });
        }
      }

      // Update cart display
      function updateCartDisplay() {
        const cartItems = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        
        // Remove all cart items except the title and empty cart message
        const title = cartItems.querySelector('h6');
        cartItems.innerHTML = '';
        cartItems.appendChild(title);
        cartItems.appendChild(emptyCart);
        
        if (cart.length === 0) {
          emptyCart.style.display = 'block';
          return;
        }
        
        emptyCart.style.display = 'none';
        
        cart.forEach(item => {
          const cartItem = document.createElement('div');
          cartItem.className = 'cart-items';
          cartItem.innerHTML = `
            <div class="item-details">
              <h6>${item.name}</h6>
              <div class="size">Quantity: ${item.quantity}</div>
            </div>
            <div class="item-price">₱${(item.price * item.quantity).toFixed(2)}</div>
            <div class="item-actions">
              <button class="remove-item" data-id="${item.id}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          `;
          
          cartItem.querySelector('.remove-item').addEventListener('click', () => {
            const cartItemIndex = cart.findIndex(i => i.id === item.id);
            if (cartItemIndex >= 0) {
              // Remove the item completely
              cart.splice(cartItemIndex, 1);
              updateCartDisplay();
              updateTotal();
              updateQuantityDisplay(item.id);
            }
          });
          
          cartItems.insertBefore(cartItem, emptyCart);
        });
      }

      // Update total price
      function updateTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('total').textContent = `₱${total.toFixed(2)}`;
      }

      // Place order
      function placeOrder() {
          const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

          if (cart.length === 0) {
              alert('Your cart is empty. Please add items before placing an order.');
              return;
          }

          // Build order details HTML
          let detailsHtml = `
            <strong>Order Type:</strong> ${orderType.toUpperCase()}<br>
            <strong>Total:</strong> ₱${total.toFixed(2)}<br>
            <strong>Items:</strong>
            <ul>
              ${cart.map(item => `<li>${item.name} x${item.quantity} - ₱${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
            </ul>
          `;

          document.getElementById('orderDetailsBody').innerHTML = detailsHtml;
          document.getElementById('amountPaid').value = '';
          document.getElementById('changeDisplay').textContent = '';
          document.getElementById('proceedOrderBtn').style.display = 'inline-block';

          // Show modal
          const orderDetailsModal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
          orderDetailsModal.show();

          // Proceed order button
          document.getElementById('proceedOrderBtn').onclick = async function() {
              const amountPaid = parseFloat(document.getElementById('amountPaid').value);
              if (isNaN(amountPaid)) {
                  document.getElementById('changeDisplay').textContent = 'Please enter a valid amount.';
                  return;
              }
              const change = amountPaid - total;
              if (change < 0) {
                  document.getElementById('changeDisplay').textContent = 'Insufficient payment!';
                  return;
              }

              // Prepare order data for backend
              const orderData = {
                  items: cart.map(item => ({
                      name: item.name.replace(/\s*\(.*?\)/, ''),
                      portion: item.name.match(/\((.*?)\)/)?.[1] || undefined,
                      quantity: item.quantity
                  })),
                  name: "Walk-in Customer",
                  source: "walk-in",
                  paymentMethod: "cash",
                  total,
                  amountPaid,
                  change,
                  orderType
              };
              try {
                  const token = getAuthToken();
                  const response = await fetch('http://localhost:5000/api/orders/pos', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                      },
                      body: JSON.stringify(orderData)
                  });
                  let result;
                  const contentType = response.headers.get('content-type');
                  if (contentType && contentType.indexOf('application/json') !== -1) {
                      result = await response.json();
                  } else {
                      const text = await response.text();
                      throw new Error('Server did not return JSON. Response was: ' + text.substring(0, 200));
                  }
                  if (response.ok) {
                      orderDetailsModal.hide();
                      // Show receipt modal with order details and change
                      showReceiptModal(orderData, result.order ? result.order.orderNumber : undefined);
                      cart = [];
                      updateCartDisplay();
                      updateTotal();
                      updateAllQuantityDisplays();
                  } else {
                      showReceiptModal({ error: result.error || 'Failed to place order' });
                  }
              } catch (err) {
                  showReceiptModal({ error: 'Error connecting to server: ' + err.message });
              }
          };
      }

      // Add this helper function to show the receipt modal
      function showReceiptModal(order, orderNumber) {
          const receiptModal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
          let html;
          if (order.error) {
              html = `<div class="text-danger">${order.error}</div>`;
          } else {
              html = `
                  <div style="max-width:400px;margin:0 auto;padding:20px 18px;background:#fff;border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,0.07);font-family:Arial,sans-serif;">
                      <div style="text-align:left;">
                          <h5 style="margin:0 0 8px 0;font-weight:bold;">POS Order Receipt</h5>
                          <div style="font-size:13px;color:#666;">${new Date().toLocaleString()}</div>
                      </div>
                      <hr>
                      ${orderNumber ? `<div style="font-size:14px;"><strong>Order #:</strong> ${orderNumber}</div>` : ""}
                      <div style="font-size:14px;"><strong>Order Type:</strong> ${order.orderType ? order.orderType.toUpperCase() : ''}</div>
                      <hr>
                      <div style="font-size:14px;">
                          <strong>Items:</strong>
                          <table style="width:100%;margin:8px 0;font-size:13px;">
                              <thead>
                                  <tr style="border-bottom:1px solid #eee;">
                                      <th style="text-align:left;">Item</th>
                                      <th style="text-align:center;">Qty</th>
                                      <th style="text-align:right;">Subtotal</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  ${order.items ? order.items.map(item => 
                                      `<tr>
                                          <td>${item.name}${item.portion ? ' (' + item.portion + ')' : ''}</td>
                                          <td style="text-align:center;">${item.quantity}</td>
                                          <td style="text-align:right;">₱${(item.price ? item.price * item.quantity : order.total / order.items.length).toFixed(2)}</td>
                                      </tr>`
                                  ).join('') : ''}
                              </tbody>
                          </table>
                      </div>
                      <hr>
                      <div style="font-size:15px;">
                          <div style="display:flex;justify-content:space-between;">
                              <span>Total:</span>
                              <span style="font-weight:bold;">₱${order.total ? order.total.toFixed(2) : ''}</span>
                          </div>
                          <div style="display:flex;justify-content:space-between;">
                              <span>Amount Paid:</span>
                              <span>₱${order.amountPaid ? order.amountPaid.toFixed(2) : ''}</span>
                          </div>
                          <div style="display:flex;justify-content:space-between;">
                              <span>Change:</span>
                              <span style="color:#27ae60;font-weight:bold;">₱${order.change ? order.change.toFixed(2) : ''}</span>
                          </div>
                      </div>
                      <hr>
                      <div style="text-align:center;font-size:13px;color:#888;">
                          <span>Order taken by: <strong>Admin</strong></span>
                      </div>
                  </div>
              `;
          }
          document.getElementById('orderSummary').innerHTML = html;
          receiptModal.show();
      }

      // Show toast animation after OK button in orderSuccessModal
document.addEventListener('DOMContentLoaded', function() {
    const orderSuccessModal = document.getElementById('orderSuccessModal');
    if (orderSuccessModal) {
        orderSuccessModal.addEventListener('hidden.bs.modal', function () {
            showOrderPlacedToast();
        });
    }
});

function showOrderPlacedToast() {
    const toast = document.getElementById('orderPlacedToast');
    if (!toast) return;
    toast.style.opacity = '1';
    toast.style.bottom = '32px';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.bottom = '-80px';
    }, 3000);
}

      // Initialize the application
      init();
});
    

let orders = [
  { id: 1, type: "Walk-in", status: "Pending", items: ["2 Lomi", "1 Bilao"] },       // shows
  { id: 2, type: "Online", status: "Pending", items: ["1 Spaghetti Bilao"], customer: "John Dela Cruz" }, // shows
    { id: 1, type: "Walk-in", status: "Pending", items: ["2 Lomi", "1 Bilao"] },       // shows
  { id: 2, type: "Online", status: "Pending", items: ["1 Spaghetti Bilao"], customer: "John Dela Cruz" }, // shows
    { id: 1, type: "Walk-in", status: "Pending", items: ["2 Lomi", "1 Bilao"] },       // shows
  { id: 2, type: "Online", status: "Pending", items: ["1 Spaghetti Bilao"], customer: "John Dela Cruz" }, // shows
  { id: 3, type: "Walk-in", status: "In Process", items: ["1 Pancit Canton"] }       // hidden
];


const notifOrders = document.getElementById("notifOrders");
const notifBtn = document.getElementById("notifBtn");
const notifCount = document.getElementById("notifCount");

function renderNotifications() {
  notifOrders.innerHTML = "";

  // Filter pending / not confirmed orders
const pendingOrders = orders.filter(o => 
  o.status === "Pending" || o.status === "Not Confirmed"
);

  // Update notif count
  notifCount.textContent = pendingOrders.length;

  if (pendingOrders.length === 0) {
    notifOrders.innerHTML = "<p class='text-muted'>No pending orders 🎉</p>";
    return;
  }

  pendingOrders.forEach(order => {
    const div = document.createElement("div");
    div.classList.add("card", "mb-3", "p-3");
    div.innerHTML = `
      <strong>${order.type} Order</strong><br>
      Items: ${order.items.join(", ")}<br>
      ${order.customer ? "Customer: " + order.customer : ""}
      <div class="mt-2">
        <button class="btn btn-success btn-sm" onclick="confirmOrder(${order.id}, '${order.type}')">Confirm</button>
      </div>
    `;
    notifOrders.appendChild(div);
  });
}

function confirmOrder(id, type) {
  const order = orders.find(o => o.id === id);
  if (!order) return;

  if (type === "Online") {
    order.status = "Confirmed";
  } else if (type === "Walk-in") {
    order.status = "In Process";
  }

  renderNotifications();
}

// Open panel when notifBtn clicked
notifBtn.addEventListener("click", () => {
  const offcanvas = new bootstrap.Offcanvas(document.getElementById("notifPanel"));
  offcanvas.show();
  renderNotifications();
});

// Initial load
renderNotifications();


function getAuthToken() {
  // Try multiple possible keys
  return localStorage.getItem('token') ||
         localStorage.getItem('posToken') ||
         localStorage.getItem('adminToken');
}

document.getElementById("logoutBtn").addEventListener("click", async function () {
  const token = getAuthToken();
  if (!token) {
    localStorage.removeItem('token');
    localStorage.removeItem('posToken');
    localStorage.removeItem('adminToken');
    window.location.replace("poslogin.html"); // Use replace to prevent back navigation
    return;
  }

  // Decode JWT to get exp, user, jti
  function decodeJWT(token) {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded;
    } catch (e) {
      return {};
    }
  }

  const decoded = decodeJWT(token);

  // Prepare logout payload
  const logoutPayload = {
    token,
    expAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : undefined,
    user: decoded.id || decoded._id || decoded.user,
    jti: decoded.jti || decoded._id || decoded.id
  };

  try {
    await fetch('http://localhost:5000/api/admin/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(logoutPayload)
    });
  } catch (err) {
    console.error('Logout request failed:', err);
  }
  localStorage.removeItem('token');
  localStorage.removeItem('posToken');
  localStorage.removeItem('adminToken');
  window.location.replace("poslogin.html"); // Use replace to prevent back navigation
});

// --- Block access if not logged in ---
if (!getAuthToken()) {
  window.location.replace("poslogin.html");
}