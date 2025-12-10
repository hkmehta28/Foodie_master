// frontend/assets/js/auth.js
// Handles customer signup, login, logout, token storage, and helper utilities.

const API_BASE_URL = "http://localhost:4000"; // change when you deploy

// --- LocalStorage keys (centralized) ---
const LS_TOKEN_KEY = "userToken";
const LS_USER_KEY = "user";

// ------------------ Helpers ------------------

/**
 * Save token and user object into localStorage
 * @param {string} token
 * @param {object} user
 */
function saveAuth(token, user) {
  localStorage.setItem(LS_TOKEN_KEY, token);
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user || {}));
}

/**
 * Remove auth from localStorage (logout)
 */
function clearAuth() {
  localStorage.removeItem(LS_TOKEN_KEY);
  localStorage.removeItem(LS_USER_KEY);
}

/**
 * Returns the stored token or null
 */
function getToken() {
  return localStorage.getItem(LS_TOKEN_KEY);
}

/**
 * Returns parsed user object or null
 */
function getUser() {
  const s = localStorage.getItem(LS_USER_KEY);
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}

/**
 * Returns headers object with Authorization if token present
 */
function getAuthHeaders() {
  const t = getToken();
  const headers = { "Content-Type": "application/json" };
  if (t) headers["Authorization"] = `Bearer ${t}`;
  return headers;
}

// ------------------ Signup / Login / Logout ------------------

/**
 * signupUser - call backend to create a new user
 * Expects page fields with ids: name, email, phone, address, password
 * After success it saves token + user and redirects to index.html
 */
async function signupUser() {
  const msgEl = document.getElementById("msg");
  if (msgEl) { msgEl.style.display = "none"; msgEl.textContent = ""; }

  const name = (document.getElementById("name") || {}).value?.trim() || "";
  const email = (document.getElementById("email") || {}).value?.trim() || "";
  const phone = (document.getElementById("phone") || {}).value?.trim() || "";
  const address = (document.getElementById("address") || {}).value?.trim() || "";
  const password = (document.getElementById("password") || {}).value || "";

  if (!name || !email || !password) {
    if (msgEl) { msgEl.textContent = "Name, email and password are required"; msgEl.style.display = "block"; }
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, address, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (msgEl) { msgEl.textContent = data.message || data.detail || "Registration failed"; msgEl.style.display = "block"; }
      return;
    }

    // Backend returns data.data.token and data.data.user per our contract
    const token = data.data?.token || data.token || null;
    const user = data.data?.user || data.user || null;

    if (!token || !user) {
      if (msgEl) { msgEl.textContent = "Registration succeeded but no token returned"; msgEl.style.display = "block"; }
      return;
    }

    saveAuth(token, user);
    // redirect to homepage or checkout
    window.location.href = "/index.html";
  } catch (err) {
    console.error("Signup error:", err);
    if (msgEl) { msgEl.textContent = "Registration error"; msgEl.style.display = "block"; }
  }
}

/**
 * loginUser - call backend to login an existing user
 * Expects page fields with ids: email, password
 */
async function loginUser() {
  const msgEl = document.getElementById("msg");
  if (msgEl) { msgEl.style.display = "none"; msgEl.textContent = ""; }

  const email = (document.getElementById("email") || {}).value?.trim() || "";
  const password = (document.getElementById("password") || {}).value || "";

  if (!email || !password) {
    if (msgEl) { msgEl.textContent = "Provide email & password"; msgEl.style.display = "block"; }
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (msgEl) { msgEl.textContent = data.message || "Login failed"; msgEl.style.display = "block"; }
      return;
    }

    const token = data.data?.token || data.token || null;
    const user = data.data?.user || data.user || null;

    if (!token || !user) {
      if (msgEl) { msgEl.textContent = "Login succeeded but no token returned"; msgEl.style.display = "block"; }
      return;
    }

    saveAuth(token, user);
    // redirect back to home or checkout
    window.location.href = "/index.html";
  } catch (err) {
    console.error("Login error:", err);
    if (msgEl) { msgEl.textContent = "Login error"; msgEl.style.display = "block"; }
  }
}

/**
 * logoutUser - clears auth and reloads
 */
function logoutUser() {
  clearAuth();
  // optional: redirect to home
  window.location.href = "/index.html";
}

// ------------------ Utilities to protect pages / autofill ------------------

/**
 * requireAuth - ensure user is logged in, otherwise redirect to login page
 * Call at top of pages that must be protected (e.g., checkout.html)
 */
function requireAuth(redirectTo = "/auth/login.html") {
  const token = getToken();
  if (!token) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

/**
 * autofillCheckout - if user present, fill checkout form inputs by id:
 * customer-name, customer-email, customer-phone, customer-address
 */
function autofillCheckout() {
  const user = getUser();
  if (!user) return;
  const nameInput = document.getElementById("customer-name");
  const emailInput = document.getElementById("customer-email");
  const phoneInput = document.getElementById("customer-phone");
  const addressInput = document.getElementById("customer-address");
  if (nameInput) nameInput.value = user.name || "";
  if (emailInput) emailInput.value = user.email || "";
  if (phoneInput) phoneInput.value = user.phone || "";
  if (addressInput) addressInput.value = user.address || "";
}

/**
 * setupAuthUI - call on all pages to update navbar/login UI
 * Expects elements (if present) with ids:
 *   - user-greeting        <-- will be set to "Hello, Name"
 *   - login-link           <-- hide when logged in
 *   - signup-link          <-- hide when logged in
 *   - logout-btn           <-- show when logged in
 * If you use different IDs, change them or add the elements to your HTML.
 */
function setupAuthUI() {
  const user = getUser();

  const userGreeting = document.getElementById("user-greeting");
  const loginLink = document.getElementById("login-link");
  const signupLink = document.getElementById("signup-link");
  const logoutBtn = document.getElementById("logout-btn");

  if (user) {
    if (userGreeting) userGreeting.textContent = `Hello, ${user.name || user.email}`;
    if (loginLink) loginLink.style.display = "none";
    if (signupLink) signupLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    if (userGreeting) userGreeting.textContent = "";
    if (loginLink) loginLink.style.display = "inline-block";
    if (signupLink) signupLink.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

// ------------------ Wire up buttons if present on the page ------------------
document.addEventListener("DOMContentLoaded", () => {
  // Signup button (signup.html)
  const signupBtn = document.getElementById("signup-btn");
  if (signupBtn) {
    signupBtn.addEventListener("click", (e) => {
      e.preventDefault();
      signupUser();
    });
  }

  // Login button (login.html)
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      loginUser();
    });
  }

  // Logout buttons (any page)
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser();
    });
  }

  // Auto-fill checkout forms (if present)
  autofillCheckout();

  // Update navbar/auth UI
  setupAuthUI();
});

// ------------------ Exports for inline scripts if needed ------------------
// If some pages include inline scripts that call these functions, attach to window:
window.auth = {
  saveAuth,
  clearAuth,
  getToken,
  getUser,
  getAuthHeaders,
  signupUser,
  loginUser,
  logoutUser,
  requireAuth,
  autofillCheckout,
  setupAuthUI,
};
