(function() {
  const token = localStorage.getItem('userToken');
  // Simple check: if no token, redirect to login
  if (!token) {
    // Check if we are already on the login page (to avoid loop)
    const path = window.location.pathname;
    if (!path.includes('login.html') && !path.includes('signup.html')) {
        // Protected pages (index.html, checkout.html, my-order.html) are in frontend/ (root level relative to assets)
        // Login is in frontend/auth/
        // So from any protected page, it's ./auth/login.html
        window.location.href = './auth/login.html';
    }
  }
})();
