// frontend/assets/js/admin.js

const API_BASE_URL = "http://localhost:4000";

// ---- DOM elements ----
const dashboardContainer = document.getElementById("dashboard-container");
const loginSection = document.getElementById("login-section");
const ordersSection = document.getElementById("orders-section");
const loginMessage = document.getElementById("login-message");
const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");
const adminEmailDisplay = document.getElementById("admin-email-display");

const ordersMessage = document.getElementById("orders-message");
const ordersSuccess = document.getElementById("orders-success");
const tbody = document.getElementById("orders-tbody");
const emptyMsg = document.getElementById("orders-empty");
const refreshBtn = document.getElementById("refresh-btn");
const logoutBtn = document.getElementById("logout-btn");

let adminToken = null;
let adminEmail = null;

// ---- Helpers to toggle sections ----
function showLogin() {
  if (loginSection) loginSection.style.display = "flex"; // Flex for centering
  if (dashboardContainer) dashboardContainer.style.display = "none";
}

function showDashboard() {
  if (loginSection) loginSection.style.display = "none";
  if (dashboardContainer) dashboardContainer.style.display = "flex";
  // Default to orders if no tab active? 
  // The HTML has orders-section active by default.
}

// Switch Tab
function switchTab(tabId) {
  // Update nav items
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
    if (item.dataset.tab === tabId) item.classList.add("active");
  });

  // Update tab content
  document.querySelectorAll(".tab-content").forEach(content => {
    content.classList.remove("active");
  });
  const target = document.getElementById(tabId);
  if (target) target.classList.add("active");
}

// ---- Load admin from localStorage ----
function loadAdminFromStorage() {
  const token = localStorage.getItem("adminToken");
  const email = localStorage.getItem("adminEmail");

  if (token && email) {
    adminToken = token;
    adminEmail = email;
    if (adminEmailDisplay) {
      adminEmailDisplay.textContent = `Logged in as: ${adminEmail}`;
    }
    showDashboard();
    renderOrders(); // Always render orders on load
    
    // Also render menu just in case they switch
    renderMenuTable().catch((e) => console.error(e));
  } else {
    showLogin();
  }
}

// ---- Login ----
async function loginAdmin() {
  console.log("loginAdmin called");

  if (!loginMessage) {
    console.error("login-message element not found");
  }

  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";

  if (loginMessage) {
    loginMessage.style.display = "none";
    loginMessage.textContent = "";
  }

  if (!email || !password) {
    if (loginMessage) {
      loginMessage.textContent = "Please enter email and password.";
      loginMessage.style.display = "block";
    }
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (!res.ok) {
      if (loginMessage) {
        loginMessage.textContent = data.message || "Login failed";
        loginMessage.style.display = "block";
      }
      return;
    }

    adminToken = data.token;
    adminEmail = data.admin?.email || email;

    localStorage.setItem("adminToken", adminToken);
    localStorage.setItem("adminEmail", adminEmail);

    if (adminEmailDisplay) {
      adminEmailDisplay.textContent = `Logged in as: ${adminEmail}`;
    }

    showDashboard();
    renderOrders();
    renderMenuTable().catch((e) => console.error(e));    const menuSection = document.getElementById("menu-section");
    if (menuSection) {
      menuSection.style.display = "block";
      renderMenuTable().catch((e) => console.error(e));
    }
  } catch (err) {
    console.error("Login error:", err);
    if (loginMessage) {
      loginMessage.textContent = "Something went wrong. Please try again.";
      loginMessage.style.display = "block";
    }
  }
}

// ---- Logout ----
function logoutAdmin() {
  adminToken = null;
  adminEmail = null;
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminEmail");

  if (tbody) tbody.innerHTML = "";
  if (emptyMsg) emptyMsg.style.display = "none";
  if (adminEmailDisplay) adminEmailDisplay.textContent = "";

  // hide menu section if exists
  // const menuSection = document.getElementById("menu-section");
  // if (menuSection) menuSection.style.display = "none";

  showLogin();
}

// ---- Fetch orders with token ----
async function fetchOrders() {
  if (!adminToken) {
    console.warn("No token, cannot fetch orders");
    return [];
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (res.status === 401) {
      if (ordersMessage) {
        ordersMessage.textContent = "Session expired. Please login again.";
        ordersMessage.style.display = "block";
      }
      logoutAdmin();
      return [];
    }

    const data = await res.json();
    console.log("Orders response:", data);

    if (!res.ok || data.status !== "ok") {
      if (ordersMessage) {
        ordersMessage.textContent = data.message || "Failed to load orders.";
        ordersMessage.style.display = "block";
      }
      return [];
    }

    return data.data || [];
  } catch (err) {
    console.error("Error fetching orders:", err);
    if (ordersMessage) {
      ordersMessage.textContent = "Error loading orders.";
      ordersMessage.style.display = "block";
    }
    return [];
  }
}

// ---- Update order status with token ----
async function updateOrderStatus(id, status) {
  if (!adminToken) {
    alert("Not authorized. Please login again.");
    logoutAdmin();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    console.log("Update status response:", data);

    if (!res.ok || data.status !== "ok") {
      alert(data.message || "Failed to update order status.");
      return null;
    }

    if (ordersSuccess) {
      ordersSuccess.textContent = "Order status updated.";
      ordersSuccess.style.display = "block";
    }

    return data.data;
  } catch (err) {
    console.error("Error updating order status:", err);
    alert("Error updating order status.");
    return null;
  }
}

// ---- Helpers from your original code ----
function createStatusBadge(status) {
  const span = document.createElement("span");
  span.classList.add("badge-status");

  const cls = `status-${status.replace(/\s/g, "-")}`;
  span.classList.add(cls);

  span.textContent = status;
  return span;
}

function createStatusSelect(order) {
  const select = document.createElement("select");
  select.className = "status-select";
  select.dataset.id = order._id;

  const statuses = [
    "pending",
    "confirmed",
    "preparing",
    "out-for-delivery",
    "completed",
    "cancelled",
  ];

  statuses.forEach((st) => {
    const opt = document.createElement("option");
    opt.value = st;
    opt.textContent = st;
    if (order.status === st) opt.selected = true;
    select.appendChild(opt);
  });

  return select;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString();
}

// ---- Render orders table ----
async function renderOrders() {
  if (!tbody || !emptyMsg) return;

  if (ordersMessage) {
    ordersMessage.style.display = "none";
    ordersMessage.textContent = "";
  }
  if (ordersSuccess) {
    ordersSuccess.style.display = "none";
    ordersSuccess.textContent = "";
  }

  tbody.innerHTML = `<tr><td colspan="6">Loading orders...</td></tr>`;

  const orders = await fetchOrders();

  tbody.innerHTML = "";

  if (!orders.length) {
    emptyMsg.style.display = "block";
    return;
  }

  emptyMsg.style.display = "none";

  orders.forEach((order) => {
    const tr = document.createElement("tr");

    // Order ID
    const tdId = document.createElement("td");
    tdId.textContent = order._id;
    tr.appendChild(tdId);

    // Customer info
    const tdCustomer = document.createElement("td");
    tdCustomer.innerHTML = `
      <strong>${order.customerName}</strong><br>
      <span class="small-text">
        ${order.phone || ""}<br>
        ${order.email || ""}<br>
        ${order.address || ""}
      </span>
    `;
    tr.appendChild(tdCustomer);

    // Items
    const tdItems = document.createElement("td");
    const ul = document.createElement("ul");
    ul.className = "items-list";

    (order.items || []).forEach((it) => {
      const li = document.createElement("li");
      li.textContent = `${it.name} × ${it.quantity} (₹${it.price})`;
      ul.appendChild(li);
    });

    tdItems.appendChild(ul);
    tr.appendChild(tdItems);

    // Total
    const tdTotal = document.createElement("td");
    tdTotal.textContent = "₹" + (order.totalAmount || 0).toFixed(2);
    tr.appendChild(tdTotal);

    // Status
    const tdStatus = document.createElement("td");
    const badge = createStatusBadge(order.status || "pending");
    const select = createStatusSelect(order);

    tdStatus.appendChild(badge);
    tdStatus.appendChild(document.createElement("br"));
    tdStatus.appendChild(select);
    tr.appendChild(tdStatus);

    // Placed At
    const tdDate = document.createElement("td");
    tdDate.textContent = formatDate(order.createdAt);
    tr.appendChild(tdDate);

    tbody.appendChild(tr);
  });
}

// ----------------- Menu Management (appended) -----------------
// DOM nodes for menu management
const menuSection = document.getElementById("menu-section");
const menuTbody = document.getElementById("menu-tbody");
const menuEmpty = document.getElementById("menu-empty");
const openAddMenuBtn = document.getElementById("open-add-menu-btn");
const refreshMenuBtn = document.getElementById("refresh-menu-btn");

// Modal nodes
const menuModal = document.getElementById("menu-modal");
const menuModalTitle = document.getElementById("menu-modal-title");
const menuFormMsg = document.getElementById("menu-form-msg");
const menuNameInput = document.getElementById("menu-name");
const menuCategoryInput = document.getElementById("menu-category");
const menuPriceInput = document.getElementById("menu-price");
const menuImageInput = document.getElementById("menu-image");
const menuIsVegInput = document.getElementById("menu-isVeg");
const menuIsAvailableInput = document.getElementById("menu-isAvailable");
const menuSaveBtn = document.getElementById("menu-save-btn");
const menuCancelBtn = document.getElementById("menu-cancel-btn");

// state for edit
let editingMenuId = null;

// Fetch admin menu items
async function fetchAdminMenu() {
  if (!adminToken) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/menu`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status === 401) {
      // session expired
      return [];
    }
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("fetchAdminMenu error:", err);
    return [];
  }
}

// Render menu table
async function renderMenuTable() {
  if (!menuTbody || !menuEmpty) return;
  menuTbody.innerHTML = `<tr><td colspan="6">Loading menu items...</td></tr>`;

  const items = await fetchAdminMenu();
  menuTbody.innerHTML = "";

  if (!items || items.length === 0) {
    menuEmpty.style.display = "block";
    return;
  }
  menuEmpty.style.display = "none";

  items.forEach((it) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <img src="${it.imageUrl || './assets/images/food-menu-1.png'}" alt="${it.name}" class="menu-img-preview" onerror="this.src='./assets/images/food-menu-1.png'">
      </td>
      <td><strong>${it.name}</strong></td>
      <td><span class="badge" style="background:#eee; color:#333;">${it.category}</span></td>
      <td>₹${typeof it.price === "number" ? it.price.toFixed(2) : it.price}</td>
      <td>
         <span class="badge ${it.isVeg ? 'status-completed' : 'status-cancelled'}" style="background:${it.isVeg ? '#d4edda' : '#f8d7da'}; color: ${it.isVeg ? '#155724' : '#721c24'}">
           ${it.isVeg ? "Veg" : "Non-Veg"}
         </span>
      </td>
      <td>
        <span class="badge ${it.isAvailable ? 'status-confirmed' : 'status-pending'}">
          ${it.isAvailable ? "Available" : "Unavailable"}
        </span>
      </td>
      <td>
        <div style="display:flex; gap:5px;">
          <button class="btn btn-secondary menu-edit-btn" data-id="${it._id}" style="padding:5px 10px; font-size:0.8rem;">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-warning menu-toggle-btn" data-id="${it._id}" style="padding:5px 10px; font-size:0.8rem; background-color:#f39c12; color:#fff;" title="Toggle Availability">
            <i class="fas fa-eye${it.isAvailable ? '' : '-slash'}"></i>
          </button>
          <button class="btn btn-danger menu-delete-btn" data-id="${it._id}" style="padding:5px 10px; font-size:0.8rem;">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    menuTbody.appendChild(tr);
  });
}

// Open add/edit modal


// Close modal
function closeMenuForm() {
  if (menuModal) {
    menuModal.classList.remove("open");
    // wait for transition to hide display if needed, but CSS handles opacity/visibility
    // However, we used .modal-overlay { visibility: hidden } so removing open class is enough
  }
  editingMenuId = null;
}

// Open modal
// Open modal
function openMenuForm(editItem) {
  editingMenuId = editItem ? editItem._id : null;
  if (menuFormMsg) {
    menuFormMsg.style.display = "none";
    menuFormMsg.textContent = "";
  }

  if (editItem) {
    if (menuModalTitle) menuModalTitle.textContent = "Edit Menu Item";
    if (menuNameInput) menuNameInput.value = editItem.name || "";
    if (menuCategoryInput) menuCategoryInput.value = editItem.category || "";
    if (menuPriceInput) menuPriceInput.value = editItem.price || "";
    if (menuImageInput) menuImageInput.value = editItem.imageUrl || "";
    if (menuIsVegInput) menuIsVegInput.checked = !!editItem.isVeg;
    if (menuIsAvailableInput) menuIsAvailableInput.checked = !!editItem.isAvailable;
  } else {
    if (menuModalTitle) menuModalTitle.textContent = "Add Menu Item";
    if (menuNameInput) menuNameInput.value = "";
    if (menuCategoryInput) menuCategoryInput.value = "";
    if (menuPriceInput) menuPriceInput.value = "";
    if (menuImageInput) menuImageInput.value = "";
    if (menuIsVegInput) menuIsVegInput.checked = true;
    if (menuIsAvailableInput) menuIsAvailableInput.checked = true;
  }
  
  // RESET FILE INPUT
  const fileInput = document.getElementById("menu-file");
  if (fileInput) fileInput.value = "";
  
  if (menuModal) menuModal.classList.add("open");
}


// Create menu item
async function createMenuItem(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Create failed");
    return json.data;
  } catch (err) {
    throw err;
  }
}

// Update menu item
async function updateMenuItem(id, payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Update failed");
    return json.data;
  } catch (err) {
    throw err;
  }
}

// Delete menu item
async function deleteMenuItem(id) {
  if (!confirm("Delete this menu item?")) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/menu/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Delete failed");
    return true;
  } catch (err) {
    alert(err.message || "Delete failed");
    return false;
  }
}

// Toggle availability
async function toggleAvailability(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/menu/${id}/toggle-availability`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Toggle failed");
    return json.data;
  } catch (err) {
    alert(err.message || "Toggle failed");
    return null;
  }
}

/* ---- Wire menu events ---- */
document.addEventListener("click", async (e) => {
  // open add modal
  if (e.target && e.target.id === "open-add-menu-btn") {
    openMenuForm(null);
  }

  // refresh menu
  if (e.target && e.target.id === "refresh-menu-btn") {
    await renderMenuTable();
  }

  // edit button
  if (e.target && e.target.classList.contains("menu-edit-btn")) {
    const id = e.target.dataset.id;
    // fetch the item details from list
    const items = await fetchAdminMenu();
    const item = items.find((x) => x._id === id);
    openMenuForm(item);
  }

  // delete
  if (e.target && e.target.classList.contains("menu-delete-btn")) {
    const id = e.target.dataset.id;
    const ok = await deleteMenuItem(id);
    if (ok) await renderMenuTable();
  }

  // toggle
  if (e.target && e.target.classList.contains("menu-toggle-btn")) {
    const id = e.target.dataset.id;
    const updated = await toggleAvailability(id);
    if (updated) await renderMenuTable();
  }
});

// Upload image file to backend → Cloudinary → returns image URL
async function uploadFileToServer(file) {
  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`${API_BASE_URL}/api/admin/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    body: form,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Upload failed");

  return json.data.imageUrl;
}


// Save / Cancel in modal
if (menuCancelBtn) menuCancelBtn.addEventListener("click", () => closeMenuForm());

if (menuSaveBtn) 
  menuSaveBtn.addEventListener("click", async () => {
  menuFormMsg.style.display = "none";

  const name = menuNameInput.value.trim();
  const category = menuCategoryInput.value.trim();
  const priceRaw = menuPriceInput.value.trim();
  const isVeg = menuIsVegInput.checked;
  const isAvailable = menuIsAvailableInput.checked;

  let imageUrl = menuImageInput.value.trim(); // URL if admin pasted manually

  if (!name || !category || !priceRaw) {
    menuFormMsg.textContent = "Name, category and price are required.";
    menuFormMsg.style.display = "block";
    return;
  }

  const price = Number(priceRaw);
  if (isNaN(price)) {
    menuFormMsg.textContent = "Price must be a number.";
    menuFormMsg.style.display = "block";
    return;
  }

  // CHECK IF ADMIN SELECTED A FILE
  const fileInput = document.getElementById("menu-file");
  if (fileInput && fileInput.files.length > 0) {
    try {
      const uploadedUrl = await uploadFileToServer(fileInput.files[0]);
      imageUrl = uploadedUrl; // override manual URL
    } catch (err) {
      menuFormMsg.textContent = err.message || "Image upload failed.";
      menuFormMsg.style.display = "block";
      return;
    }
  }

  // FINAL PAYLOAD
  const payload = { name, category, price, imageUrl, isVeg, isAvailable };

  try {
    if (editingMenuId) {
      await updateMenuItem(editingMenuId, payload);
    } else {
      await createMenuItem(payload);
    }

    closeMenuForm();
    await renderMenuTable();
  } catch (err) {
    menuFormMsg.textContent = err.message || "Save failed";
    menuFormMsg.style.display = "block";
  }
});



// ---- Wire events after DOM is ready ----
document.addEventListener("DOMContentLoaded", () => {
  console.log("admin.js loaded, wiring events");

  const loginBtn = document.getElementById("login-btn");
  if (!loginBtn) {
    console.error("Login button not found, check id='login-btn' in admin.html");
  } else {
    loginBtn.addEventListener("click", () => {
      console.log("Login button clicked");
      loginAdmin();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      renderOrders();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logoutAdmin();
    });
  }

  if (tbody) {
    tbody.addEventListener("change", async (e) => {
      const target = e.target;
      if (target.classList.contains("status-select")) {
        const id = target.dataset.id;
        const newStatus = target.value;
        const updated = await updateOrderStatus(id, newStatus);
        if (updated) {
          renderOrders();
        }
      }
    });
  }



  // Sidebar Tabs
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      const tabId = item.dataset.tab;
      if (tabId) switchTab(tabId);
    });
  });

  loadAdminFromStorage();
});

