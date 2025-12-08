// frontend/assets/js/menu.js

const API_BASE_URL = "http://localhost:4000";

// simple in-memory cart (also synced to localStorage)
let cart = [];

// ----- CART HELPERS -----

function saveCart() {
  localStorage.setItem("foodie_cart", JSON.stringify(cart));
}

function loadCart() {
  try {
    const saved = localStorage.getItem("foodie_cart");
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error loading cart from localStorage", e);
  }
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
}

function updateCartBadge() {
  const countSpan = document.getElementById("cart-count");
  if (countSpan) {
    countSpan.textContent = getCartCount();
  }
}

function renderCart() {
  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!list || !totalEl) return;

  list.innerHTML = "";

  if (!cart.length) {
    list.innerHTML = "<li>Your cart is empty.</li>";
    totalEl.textContent = "₹0.00";
    updateCartBadge();
    return;
  }

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.className = "cart-item";

    const price = Number(item.price) || 0;

    li.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">
          ₹${price.toFixed(2)} × ${item.quantity}
        </div>
      </div>
      <div class="cart-item-actions">
        <div>
          <button class="cart-qty-btn" data-action="minus" data-id="${item._id}">-</button>
          <span>${item.quantity}</span>
          <button class="cart-qty-btn" data-action="plus" data-id="${item._id}">+</button>
        </div>
        <button class="cart-remove" data-id="${item._id}">Remove</button>
      </div>
    `;

    list.appendChild(li);
  });

  totalEl.textContent = "₹" + getCartTotal().toFixed(2);
  updateCartBadge();
}

function addToCart(item) {
  const existingIndex = cart.findIndex((i) => i._id === item._id);
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  saveCart();
  renderCart();
}

function changeCartQuantity(id, delta) {
  const idx = cart.findIndex((i) => i._id === id);
  if (idx === -1) return;

  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) {
    cart.splice(idx, 1);
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i._id !== id);
  saveCart();
  renderCart();
}

function setupCartUI() {
  const cartBtn = document.getElementById("cart-btn");
  const cartPanel = document.getElementById("cart-panel");
  const cartBackdrop = document.getElementById("cart-backdrop");
  const cartClose = document.getElementById("cart-close");
  const cartList = document.getElementById("cart-items");
  const checkoutForm = document.getElementById("checkout-form");

  if (!cartBtn || !cartPanel || !cartBackdrop || !cartClose || !cartList) {
    console.warn("Cart UI elements missing");
    return;
  }

  const openCart = () => {
    cartPanel.classList.add("open");
    cartBackdrop.classList.add("open");
  };

  const closeCart = () => {
    cartPanel.classList.remove("open");
    cartBackdrop.classList.remove("open");
  };

  cartBtn.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartBackdrop.addEventListener("click", closeCart);

  // quantity + remove (event delegation)
  cartList.addEventListener("click", (e) => {
    const target = e.target;

    if (target.classList.contains("cart-qty-btn")) {
      const id = target.getAttribute("data-id");
      const action = target.getAttribute("data-action");
      changeCartQuantity(id, action === "plus" ? 1 : -1);
    }

    if (target.classList.contains("cart-remove")) {
      const id = target.getAttribute("data-id");
      removeFromCart(id);
    }
  });

  // handle checkout submit
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!cart.length) {
        alert("Your cart is empty.");
        return;
      }

      const customerName = document.getElementById("customerName").value.trim();
      const email = document.getElementById("customerEmail").value.trim();
      const phone = document.getElementById("customerPhone").value.trim();
      const address = document.getElementById("customerAddress").value.trim();
      const note = document.getElementById("customerNote").value.trim();

      if (!customerName || !phone || !address) {
        alert("Please fill in your name, phone, and address.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName,
            email,
            phone,
            address,
            note,
            items: cart,
          }),
        });

        const result = await response.json();

        if (!response.ok || result.status !== "ok") {
          console.error("Order error:", result);
          alert("Failed to place order. Please try again.");
          return;
        }

        // success
        alert("Order placed successfully! 🎉");
        cart = [];
        saveCart();
        renderCart();
        checkoutForm.reset();
        closeCart();
      } catch (err) {
        console.error("Checkout error:", err);
        alert("Something went wrong while placing your order.");
      }
    });
  }
}


// ----- MENU (API + CARDS) -----

async function fetchMenuItems(category = "") {
  try {
    let url = `${API_BASE_URL}/api/menu`;
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    if (Array.isArray(result)) return result;
    if (Array.isArray(result.data)) return result.data;
    if (Array.isArray(result.items)) return result.items;

    console.warn("Unknown response shape:", result);
    return [];
  } catch (err) {
    console.error("Error fetching menu items:", err);
    return [];
  }
}

function createMenuListItem(item) {
  const li = document.createElement("li");

  const price = Number(item.price) || 0;
  const originalPrice = price + 20;
  const discountPercent = "-15%";

  li.innerHTML = `
    <div class="food-menu-card">

      <div class="card-banner">
        <img src="${item.imageUrl || "assets/images/food-menu-1.png"}"
             width="300" height="300" loading="lazy"
             alt="${item.name}" class="w-100">

        <div class="badge">${discountPercent}</div>

        <button class="btn food-menu-btn">Order Now</button>
      </div>

      <div class="wrapper">
        <p class="category">${item.category || ""}</p>

        <div class="rating-wrapper">
          <ion-icon name="star"></ion-icon>
          <ion-icon name="star"></ion-icon>
          <ion-icon name="star"></ion-icon>
          <ion-icon name="star"></ion-icon>
          <ion-icon name="star"></ion-icon>
        </div>
      </div>

      <h3 class="h3 card-title">${item.name}</h3>

      <div class="price-wrapper">
        <p class="price-text">Price:</p>
        <data class="price">₹${price.toFixed(2)}</data>
        <del class="del">₹${originalPrice.toFixed(2)}</del>
      </div>

    </div>
  `;

  const orderBtn = li.querySelector(".food-menu-btn");
  if (orderBtn) {
    orderBtn.addEventListener("click", () => addToCart(item));
  }

  return li;
}

async function renderMenu(category = "") {
  const container = document.getElementById("menu-container");
  if (!container) {
    console.error("Menu container not found in HTML");
    return;
  }

  container.innerHTML = "<p>Loading menu...</p>";

  const items = await fetchMenuItems(category);

  if (!items.length) {
    container.innerHTML = "<p>No items found.</p>";
    return;
  }

  container.innerHTML = "";
  items.forEach((item) => {
    const li = createMenuListItem(item);
    container.appendChild(li);
  });
}

function setupCategoryFilters() {
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const text = btn.textContent.trim();
      const category = text === "All" ? "" : text;
      renderMenu(category);
    });
  });
}

// ----- INIT -----

document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  updateCartBadge();
  renderCart();

  renderMenu();
  setupCategoryFilters();
  setupCartUI();
});
