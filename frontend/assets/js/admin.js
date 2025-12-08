// frontend/assets/js/admin.js

const API_BASE_URL = "http://localhost:4000";

async function fetchOrders() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`);
    const data = await res.json();

    if (!res.ok || data.status !== "ok") {
      console.error("Failed to fetch orders:", data);
      return [];
    }
    return data.data || [];
  } catch (err) {
    console.error("Error fetching orders:", err);
    return [];
  }
}

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

async function updateOrderStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok || data.status !== "ok") {
      console.error("Failed to update status:", data);
      alert(data.message || "Failed to update order status.");
      return null;
    }
    return data.data;
  } catch (err) {
    console.error("Error updating order status:", err);
    alert("Error updating order status.");
    return null;
  }
}

async function renderOrders() {
  const tbody = document.getElementById("orders-tbody");
  const emptyMsg = document.getElementById("orders-empty");
  if (!tbody || !emptyMsg) return;

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

document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refresh-btn");

  renderOrders();

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      renderOrders();
    });
  }

  // Handle change of status
  const tbody = document.getElementById("orders-tbody");
  if (tbody) {
    tbody.addEventListener("change", async (e) => {
      const target = e.target;
      if (target.classList.contains("status-select")) {
        const id = target.dataset.id;
        const newStatus = target.value;

        const updated = await updateOrderStatus(id, newStatus);
        if (updated) {
          // re-render table so badge color updates
          renderOrders();
        }
      }
    });
  }
});
