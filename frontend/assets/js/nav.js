// frontend/assets/js/nav.js

(function() {
    const userToken = localStorage.getItem("userToken");
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
    const userName = user ? user.name : "User";
    const currentPath = window.location.pathname;

    // Cart Count Logic
    const CART_KEYS = ["cart", "foodie_cart", "my_cart"];
    function getCartCount() {
        for (const k of CART_KEYS) {
            const s = localStorage.getItem(k);
            if (!s) continue;
            try {
                const parsed = JSON.parse(s);
                const items = Array.isArray(parsed) ? parsed : parsed.items || [];
                let count = 0;
                items.forEach(i => count += Number(i.quantity || i.qty || 1));
                return count;
            } catch (e) { continue; }
        }
        return 0;
    }

    // Styles for dynamic elements
    const styles = `
    <style>
        .header .header-btn-group .btn-hover { display: block; }
        
 /* FINAL FIX — CLEAN CART BUTTON */
        .cart-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;

        background: var(--deep-saffron);
        color: var(--white);
        font-size: 1.4rem;
        font-weight: 600;

        padding: 12px 22px;
        border-radius: 12px;

        height: auto;        /* FIXES number being cut */
        line-height: 1;      /* FIXES vertical misalignment */

        position: relative;
        }

        .cart-inline-count {
        font-size: 1.4rem;
        font-weight: 700;
        display: inline-block;
        margin-left: 4px;     /* spacing between Cart and number */
        }




        /* User Profile Box Styling */
        .user-profile-box {
            display: flex;
            align-items: center;
            gap: 15px;
            background: var(--white);
            padding: 8px 20px;
            border-radius: 50px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            border: 1px solid var(--cultured);
            transition: var(--transition-1);
        }

        .user-profile-box:hover {
            box-shadow: 0 6px 20px rgba(0,0,0,0.1);
            transform: translateY(-1px);
        }

        .user-greeting {
            font-family: var(--ff-rubik);
            font-weight: 500;
            color: var(--rich-black-fogra-29);
            font-size: 1.4rem;
        }

        .logout-btn {
            background: var(--deep-saffron);
            color: var(--white);
            font-family: var(--ff-rubik);
            font-size: 1.3rem;
            font-weight: 500;
            padding: 6px 16px;
            border-radius: 20px;
            transition: var(--transition-1);
        }

        .logout-btn:hover {
            background: var(--xc-dark-orange); /* fallbacks handled by css var usually, but hover effect built-in */
            opacity: 0.9;
        }

        @media (max-width: 768px) {
            .user-profile-box {
                padding: 6px 12px;
                gap: 8px;
            }
            .user-greeting { display: none; } /* hide name on mobile to save space */
        }
    </style>
    `;

    document.head.insertAdjacentHTML("beforeend", styles);

    // Force "solid" navbar style for non-home pages (Checkout, My Order, etc.)
    // The default header expects a dark hero image (white text). 
    // On pages without hero, we need dark text + white bg.
    const isHomePage = currentPath.endsWith("index.html") || currentPath.endsWith("/");
    if (!isHomePage) {
        document.head.insertAdjacentHTML("beforeend", `
            <style>
                .header, .header.active {
                    --color: var(--rich-black-fogra-29) !important;
                    --btn-color: var(--rich-black-fogra-29) !important;
                    background-color: var(--white) !important;
                    position: fixed !important;
                    top: 0 !important;
                    width: 100% !important;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05) !important;
                    animation: none !important;
                    transform: none !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    padding-block: 20px !important;
                }
            </style>
        `);
    }

    const navHTML = `
      <header class="header" data-header>
        <div class="container">
    
          <h1>
            <a href="./index.html" class="logo">Foodie<span class="span">.</span></a>
          </h1>
    
          <nav class="navbar" data-navbar>
            <ul class="navbar-list">
              <li class="nav-item">
                <a href="./index.html" class="navbar-link ${currentPath.includes('index.html') ? 'active' : ''}" data-nav-link>Home</a>
              </li>
              <li class="nav-item">
                <a href="./index.html#food-menu" class="navbar-link" data-nav-link>Shop</a>
              </li>
              ${ userToken 
                 ? `<li class="nav-item"><a href="./my-order.html" class="navbar-link ${currentPath.includes('my-order.html') ? 'active' : ''}" data-nav-link>My Orders</a></li>`
                 : ``
              }
              <li class="nav-item">
                <a href="./index.html#about" class="navbar-link" data-nav-link>About</a>
              </li>
            </ul>
          </nav>
    
          <div class="header-btn-group">
            <button class="search-btn" aria-label="Search" data-search-btn>
              <ion-icon name="search-outline"></ion-icon>
            </button>
    
            <a href="./checkout.html" class="btn btn-hover cart-btn">
              Cart <span id="nav-cart-count" class="cart-inline-count">${getCartCount()}</span>
            </a>

            ${ userToken
               ? `<div class="user-profile-box">
                    <span class="user-greeting">Hi, ${userName}</span>
                    <button id="nav-logout-btn" class="logout-btn">Logout</button>
                  </div>`
               : `<a href="./auth/login.html" class="btn btn-hover">Login</a>`
            }
    
            <button class="nav-toggle-btn" aria-label="Toggle Menu" data-menu-toggle-btn>
              <span class="line top"></span>
              <span class="line middle"></span>
              <span class="line bottom"></span>
            </button>
          </div>
    
        </div>
      </header>
    `;
    
    // Inject or Replace Logic
    const existingHeader = document.querySelector("header.header");
    if (existingHeader) {
        existingHeader.outerHTML = navHTML;
    } else {
        document.body.insertAdjacentHTML("afterbegin", navHTML);
    }

    // --- RE-INITIALIZE EVENT LISTENERS ---

    const navTogglers = document.querySelectorAll("[data-menu-toggle-btn]");
    const navbar = document.querySelector("[data-navbar]");
    const toggleNavbar = function () {
      navbar.classList.toggle("active");
      document.body.classList.toggle("nav-active");
    };
    if (navTogglers.length > 0) {
        navTogglers.forEach(btn => btn.addEventListener("click", toggleNavbar));
    }

    // Sticky Header
    const header = document.querySelector("[data-header]");
    if (header) {
        const headerActive = function () {
            if (window.scrollY > 100) { header.classList.add("active"); } 
            else { header.classList.remove("active"); }
        };
        window.addEventListener("scroll", headerActive);
    }

    // Logout
    const logoutBtn = document.getElementById("nav-logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("userToken");
            localStorage.removeItem("user");
            alert("Logged out successfully!");
            window.location.href = "./index.html";
        });
    }

    // Live Cart Update (Storage = cross-tab, cartUpdated = same-tab)
    const updateNavBadge = () => {
        try {
            document.getElementById("nav-cart-count").textContent = getCartCount();
        } catch(e){}
    };
    window.addEventListener("storage", updateNavBadge);
    window.addEventListener("cartUpdated", updateNavBadge);
})();
