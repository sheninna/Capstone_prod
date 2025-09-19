document.addEventListener('DOMContentLoaded', function() {



  const products = {
    dishes: [
      { 
        id: 'dishes-lomi', 
        name: 'Lomi', 
        image: '../assets/lomi.png',
        sizes: [
          { portion: 'Regular', price: 50 },
          { portion: 'Special', price: 75 },
          { portion: 'Large', price: 90 }
        ]
      },
      { 
        id: 'dishes-sweet-spicy', 
        name: 'Sweet & Spicy', 
        image: '../assets/sweet_and_spicy.png',
        price: 90,
        image: '../assets/sweet_and_spicy.png'
      },
      { 
        id: 'dishes-plain', 
        name: 'Plain', 
        price: 85,
        image: '../assets/plain.png'
      },
      { 
        id: 'dishes-bihon', 
        name: 'Bihon', 
        price: 80,
        image: '../assets/bihon.png'
      },
      { 
        id: 'dishes-hotsilog', 
        name: 'Hotsilog', 
        price: 75,
        image: '../assets/hotsilog.png'
      },
      { 
        id: 'dishes-siomai-rice', 
        name: 'Siomai Rice', 
        price: 70,
        image: '../assets/siomai-rice.png'
      },
      { 
        id: 'dishes-siomaisilog', 
        name: 'Siomai Silog', 
        price: 85,
        image: '../assets/siomaisilog.png'
      }
    ],
    bilao: [
      { 
        id: 'bilao-guisado', 
        name: 'Guisado Plain/Bihon', 
        image: '../assets/guisado.png',
        sizes: [
          { portion: 'Small', price: 480 },
          { portion: 'Medium', price: 630 },
          { portion: 'Large', price: 780 },
          { portion: 'ExtraLarge', price: 1100 }
        ]
      },
            { 
        id: 'bilao-sweetandspicy', 
        name: 'Sweet and Spicy', 
        image: '../assets/chami_bilao.png',
        sizes: [
          { portion: 'Small', price: 580 },
          { portion: 'Medium', price: 780 },
          { portion: 'Large', price: 850 },
          { portion: 'ExtraLarge', price: 1150 }
        ]
      },
      { 
        id: 'bilao-spagetti', 
        name: 'Spagetti', 
        image: '../assets/Spaghetti_bilao.png',
        sizes: [
          { portion: 'Medium', price: 750 },
          { portion: 'Large', price: 950 }
        ]
      },
      { 
        id: 'bilao-palabok', 
        name: 'Palabok', 
        image: '../assets/palabok_bilao.png',
        sizes: [
          { portion: 'Medium', price: 750 },
          { portion: 'Large', price: 900 }
        ]
      }
    ],
    desserts: [
      { id: 'desserts-lecheflan', name: 'Leche Flan', price: 120.00, image: '../assets/leche-flan.png' },
      { id: 'desserts-buko', name: 'Buko Pandan', price: 100.00, image: '../assets/graham-bar.png' },
      { id: 'desserts-gulaman', name: 'Gulaman', price: 50.00, image: '../assets/Graham.png' }
    ]
  };

      // Current state
      let currentCategory = 'dishes';
      let cart = [];
      let orderType = 'dine-in';

      // Initialize the page
      function init() {
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

        if (products[category]) {
          products[category].forEach(product => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4 d-flex'; // 3 per row, spacing, equal height

            if (category === 'bilao' || (category === 'dishes' && product.sizes)) {
              col.appendChild(createSizedProductCard(product, category));
            } else {
              col.appendChild(createProductCard(product));
            }

            itemsContainer.appendChild(col);
          });

          updateAllQuantityDisplays();
        }
      }


      // Create a regular product card (without size options)
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card lomi-product-card'; // keep same style for alignment
  card.id = product.id;

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h4>${product.name}</h4>
    <p class="price">₱${product.price.toFixed(2)}</p>
    <div class="qty-controls">
      <button class="decrease-btn" data-product="${product.id}">-</button>
      <span id="qty-${product.id}">0</span>
      <button class="increase-btn" data-product="${product.id}">+</button>
    </div>
  `;

  // Quantity buttons
  card.querySelector('.increase-btn').addEventListener('click', () => {
    updateQuantity(product.id, 1, product.name, product.price);
  });

  card.querySelector('.decrease-btn').addEventListener('click', () => {
    updateQuantity(product.id, -1, product.name, product.price);
  });

  return card;
}

// Create a product card with size options (Lomi/Bilao)
function createSizedProductCard(product, category) {
  const card = document.createElement('div');
  card.className = `product-card lomi-product-card`; // unified class
  card.id = product.id;

  let sizeOptionsHTML = '';
  product.sizes.forEach(size => {
    sizeOptionsHTML += `
      <button class="size-btn" 
              data-size="${size.portion.toLowerCase()}" 
              data-price="${size.price}">
        ${size.portion}
      </button>
    `;
  });

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h4>${product.name}</h4>
    <p class="price">
      ${product.sizes.map(size => `${size.portion}: ₱${size.price}`).join(' | ')}
    </p>
    <div class="size-options">
      ${sizeOptionsHTML}
    </div>
    <div class="qty-controls">
      <button class="decrease-btn" data-product="${product.id}">-</button>
      <span id="qty-${product.id}">0</span>
      <button class="increase-btn" data-product="${product.id}">+</button>
    </div>
  `;

  // Size button selection
  const sizeButtons = card.querySelectorAll('.size-btn');
  if (sizeButtons.length > 0) {
    sizeButtons[0].classList.add('active');
    
    sizeButtons.forEach(button => {
      button.addEventListener('click', function() {
        sizeButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const size = this.getAttribute('data-size');
        updateSizedProductQuantityDisplay(product.id, size);
      });
    });
  }

  // Quantity buttons
  card.querySelector('.increase-btn').addEventListener('click', () => {
    const activeSize = card.querySelector('.size-btn.active');
    if (!activeSize) return;
    const size = activeSize.getAttribute('data-size');
    const price = parseFloat(activeSize.getAttribute('data-price'));
    updateQuantity(`${product.id}-${size}`, 1, `${product.name} (${size})`, price);
  });

  card.querySelector('.decrease-btn').addEventListener('click', () => {
    const activeSize = card.querySelector('.size-btn.active');
    if (!activeSize) return;
    const size = activeSize.getAttribute('data-size');
    const price = parseFloat(activeSize.getAttribute('data-price'));
    updateQuantity(`${product.id}-${size}`, -1, `${product.name} (${size})`, price);
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
        document.getElementById('proceedOrderBtn').style.display = 'none';

        // Show modal
        const orderDetailsModal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        orderDetailsModal.show();

        // Calculate change button
        document.getElementById('calculateChangeBtn').onclick = function() {
          const amountPaid = parseFloat(document.getElementById('amountPaid').value);
          if (isNaN(amountPaid)) {
            document.getElementById('changeDisplay').textContent = 'Please enter a valid amount.';
            document.getElementById('proceedOrderBtn').style.display = 'none';
            return;
          }
          const change = amountPaid - total;
          if (change >= 0) {
            document.getElementById('changeDisplay').textContent = `Change: ₱${change.toFixed(2)}`;
            document.getElementById('proceedOrderBtn').style.display = 'inline-block';
          } else {
            document.getElementById('changeDisplay').textContent = 'Insufficient payment!';
            document.getElementById('proceedOrderBtn').style.display = 'none';
          }
        };

        // Proceed order button
        document.getElementById('proceedOrderBtn').onclick = function() {
          // Here you can send the order to the backend or show a success message
          alert('Order placed successfully!');
          orderDetailsModal.hide();
          cart = [];
          updateCartDisplay();
          updateTotal();
          updateAllQuantityDisplays();
        };
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


document.getElementById("logoutBtn").addEventListener("click", function () {
  window.location.href = "poslogin.html"; 
});