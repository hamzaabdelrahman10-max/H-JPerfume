/* =========================================
   H&JPERFUMES – GLOBAL STATE HELPERS
=========================================*/

function getCart() {
    const cart = localStorage.getItem("hj_cart");
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem("hj_cart", JSON.stringify(cart));
}

function getSamplesLeft() {
    const stored = localStorage.getItem("hj_samples_left");
    if (stored === null) {
        localStorage.setItem("hj_samples_left", "20");
        return 20;
    }
    return parseInt(stored, 10);
}

function saveSamplesLeft(count) {
    localStorage.setItem("hj_samples_left", String(count));
}


/* =========================================
   SMART LANGUAGE SYSTEM
=========================================*/

function setLang(lang) {
    localStorage.setItem("hj_lang", lang);

    const page = window.location.pathname.split("/").pop() || "index.html";

    if (lang === "en") {
        if (page.includes("-ar")) {
            window.location.href = page.replace("-ar", "");
        } else {
            window.location.href = "index.html";
        }
        return;
    }

    if (lang === "ar") {
        if (!page.includes("-ar")) {
            const parts = page.split(".");
            window.location.href = parts[0] + "-ar.html";
        } else {
            window.location.href = "index-ar.html";
        }
        return;
    }
}

function initLanguage() {
    const lang = localStorage.getItem("hj_lang") || "en";
    const page = window.location.pathname.split("/").pop() || "index.html";

    if (lang === "ar" && !page.includes("-ar")) {
        const parts = page.split(".");
        window.location.href = parts[0] + "-ar.html";
        return;
    }

    if (lang === "en" && page.includes("-ar")) {
        window.location.href = page.replace("-ar", "");
        return;
    }
}


/* =========================================
   CART ICON NAVIGATION
=========================================*/

function goToCart() {
    const page = window.location.pathname.split("/").pop() || "index.html";

    if (page.includes("-ar")) {
        window.location.href = "cart-ar.html";
    } else {
        window.location.href = "cart.html";
    }
}


/* =========================================
   CART SYSTEM
=========================================*/

function addPerfumeToCart(name, selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const size = select.value;
    const price = size === "100" ? 150 : 100;

    const cart = getCart();

    const existing = cart.find(
        item => item.name === name && item.size === size
    );

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            name,
            size,
            price,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartCount();
    alert("Added to cart");
}

function removeFromCart(index) {
    const cart = getCart();
    if (index < 0 || index >= cart.length) return;
    cart.splice(index, 1);
    saveCart(cart);
    updateCartCount();
    displayCart();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const el = document.getElementById("cart-count");
    if (el) el.textContent = count;
}

function displayCart() {
    const container = document.getElementById("cart-items");
    const subtotalEl = document.getElementById("cart-subtotal");
    const totalEl = document.getElementById("cart-total");

    if (!container) return;

    const cart = getCart();
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<p>Your cart is empty.</p>";
        if (subtotalEl) subtotalEl.textContent = "AED 0";
        if (totalEl) totalEl.textContent = "AED 0";
        return;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {
        const lineTotal = item.price * item.quantity;
        subtotal += lineTotal;

        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>Size: ${item.size}ml</p>
                <p>Price: AED ${item.price}</p>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <p class="cart-item-total">AED ${lineTotal}</p>
                <button class="btn-ghost" data-index="${index}">Remove</button>
            </div>
        `;

        container.appendChild(div);
    });

    if (subtotalEl) subtotalEl.textContent = `AED ${subtotal}`;
    if (totalEl) totalEl.textContent = `AED ${subtotal}`;

    container.querySelectorAll("button[data-index]").forEach(btn => {
        btn.addEventListener("click", () => {
            const i = parseInt(btn.getAttribute("data-index"), 10);
            removeFromCart(i);
        });
    });
}


/* =========================================
   CHECKOUT DISPLAY + WHATSAPP
=========================================*/

function displayCheckout() {
    const container = document.getElementById("checkout-items");
    const totalEl = document.getElementById("checkout-total");

    if (!container) return;

    const cart = getCart();
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<p>Your cart is empty.</p>";
        if (totalEl) totalEl.textContent = "AED 0";
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const lineTotal = item.price * item.quantity;
        total += lineTotal;

        const div = document.createElement("div");
        div.className = "checkout-item";

        div.innerHTML = `
            <div class="checkout-item-line">
                <span>${item.name} (${item.size}ml)</span>
                <span>AED ${lineTotal}</span>
            </div>
        `;

        container.appendChild(div);
    });

    if (totalEl) totalEl.textContent = `AED ${total}`;
}

function sendOrderToWhatsApp() {
    const nameInput = document.getElementById("customer-name");
    const phoneInput = document.getElementById("customer-phone");

    const customerName = nameInput ? nameInput.value.trim() : "";
    const customerPhone = phoneInput ? phoneInput.value.trim() : "";

    const cart = getCart();
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    let total = 0;
    let itemsText = "";

    cart.forEach(item => {
        const lineTotal = item.price * item.quantity;
        total += lineTotal;
        itemsText += `• ${item.name} (${item.size}ml) x${item.quantity} = AED ${lineTotal}%0A`;
    });

    const message =
        `New Order from H&JPERFUMES%0A%0A` +
        `Name: ${customerName}%0A` +
        `Phone: ${customerPhone}%0A%0A` +
        `Items:%0A${itemsText}%0A` +
        `Total: AED ${total}`;

    const whatsappNumber = "971502287387";

    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, "_blank");
}


/* =========================================
   SAMPLES SYSTEM
=========================================*/

function initSampleCount() {
    const count = getSamplesLeft();
    const el = document.getElementById("sample-count");
    if (el) el.textContent = count;
}

function updateSampleDisplay() {
    const count = getSamplesLeft();
    const el = document.getElementById("sample-count");
    if (el) el.textContent = count;
}

function updateSampleButtons() {
    const count = getSamplesLeft();
    const buttons = document.querySelectorAll(".sample-btn-main");
    buttons.forEach(btn => {
        if (count <= 0) {
            btn.disabled = true;
            btn.textContent = btn.textContent.includes("اطلب")
                ? "انتهت العينات"
                : "Samples Finished";
        } else {
            btn.disabled = false;
        }
    });
}

function orderSample(label) {
    let count = getSamplesLeft();
    if (count <= 0) {
        alert("No samples left.");
        return;
    }

    count -= 1;
    saveSamplesLeft(count);
    updateSampleDisplay();
    updateSampleButtons();

    alert(label + " requested.");
}
