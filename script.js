/* ============================================================
   CONFIG
============================================================ */
const WHATSAPP_NUMBER = "971502287387"; 
const SAMPLE_KEY = "hj_samples";
const CART_KEY = "hj_cart";
const LANG_KEY = "hj_lang";

/* ============================================================
   LANGUAGE SYSTEM (FIXED FOR GITHUB PAGES)
============================================================ */
function initLanguage() {
    let lang = localStorage.getItem(LANG_KEY) || "en";

    // Detect current file
    let path = window.location.pathname;
    let file = path.split("/").pop();

    // GitHub Pages root (/) → treat as index.html
    if (file === "") file = "index.html";

    const isArabicPage = file.includes("-ar.html");

    // Redirect only when needed
    if (lang === "ar" && !isArabicPage) {
        window.location.href = "index-ar.html";
        return;
    }

    if (lang === "en" && isArabicPage) {
        window.location.href = "index.html";
        return;
    }
}

function switchToArabic() {
    localStorage.setItem(LANG_KEY, "ar");
    window.location.href = "index-ar.html";
}

function switchToEnglish() {
    localStorage.setItem(LANG_KEY, "en");
    window.location.href = "index.html";
}

/* ============================================================
   SAMPLE SYSTEM
============================================================ */
function initSampleCount() {
    if (localStorage.getItem(SAMPLE_KEY) === null) {
        localStorage.setItem(SAMPLE_KEY, "20");
    }
}

function getSampleCount() {
    return parseInt(localStorage.getItem(SAMPLE_KEY) || "0", 10);
}

function setSampleCount(count) {
    localStorage.setItem(SAMPLE_KEY, String(count));
    updateSampleDisplay();
    updateSampleButtons();
}

function updateSampleDisplay() {
    const el = document.getElementById("sample-count");
    if (el) el.textContent = getSampleCount();
}

function updateSampleButtons() {
    const count = getSampleCount();
    const buttons = document.querySelectorAll(".sample-btn, .sample-btn-main");

    buttons.forEach(btn => {
        if (count <= 0) {
            btn.disabled = true;
            btn.textContent = "Samples Finished";
            btn.classList.add("disabled-btn");
        } else {
            btn.disabled = false;
            if (!btn.dataset.originalText) {
                btn.dataset.originalText = btn.textContent;
            }
            btn.textContent = btn.dataset.originalText;
            btn.classList.remove("disabled-btn");
        }
    });
}

function orderSample(perfumeName) {
    let count = getSampleCount();

    if (count <= 0) {
        alert("Samples are finished.");
        updateSampleButtons();
        return;
    }

    count -= 1;
    setSampleCount(count);

    let message = 
        `🧪 Sample Request%0A` +
        `Fragrance: ${perfumeName}%0A` +
        `Remaining Samples: ${count}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
}

/* ============================================================
   CART SYSTEM
============================================================ */
function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const el = document.getElementById("cart-count");
    if (el) el.textContent = count;
}

function addPerfumeToCart(name, sizeSelectId) {
    const sizeEl = document.getElementById(sizeSelectId);
    if (!sizeEl) return;

    const size = sizeEl.value;
    let price = 100;

    if (size === "100") price = 150;

    const cart = getCart();
    cart.push({
        id: Date.now(),
        name,
        size,
        price,
        quantity: 1
    });

    saveCart(cart);
    alert(`${name} (${size} ml) added to cart.`);
}

function displayCart() {
    const cart = getCart();
    const container = document.getElementById("cart-items");
    if (!container) return;

    container.innerHTML = "";

    const sub = document.getElementById("cart-subtotal");
    const tot = document.getElementById("cart-total");

    if (cart.length === 0) {
        container.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
        if (sub) sub.textContent = "AED 0";
        if (tot) tot.textContent = "AED 0";
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;

        container.innerHTML += `
            <div class="cart-item">
                <div class="cart-info">
                    <h3>${item.name}</h3>
                    <p class="price">AED ${item.price} (${item.size} ml)</p>

                    <div class="quantity-box">
                        <button onclick="changeQty(${item.id}, -1)">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQty(${item.id}, 1)">+</button>
                    </div>

                    <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
                </div>
            </div>
        `;
    });

    if (sub) sub.textContent = `AED ${subtotal}`;
    if (tot) tot.textContent = `AED ${subtotal}`;
}

function changeQty(id, amount) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        removeItem(id);
        return;
    }

    saveCart(cart);
    displayCart();
}

function removeItem(id) {
    let cart = getCart().filter(item => item.id !== id);
    saveCart(cart);
    displayCart();
}

/* ============================================================
   CHECKOUT + WHATSAPP ORDER
============================================================ */
function displayCheckout() {
    const cart = getCart();
    const container = document.getElementById("checkout-items");
    const totalEl = document.getElementById("checkout-total");

    if (!container || !totalEl) return;

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
        totalEl.textContent = "AED 0";
        return;
    }

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        container.innerHTML += `
            <div class="checkout-item">
                <p>${item.name} (${item.size} ml) x ${item.quantity} — AED ${item.price * item.quantity}</p>
            </div>
        `;
    });

    totalEl.textContent = `AED ${total}`;
}

function sendOrderToWhatsApp() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const name = document.getElementById("customer-name")?.value || "";
    const phone = document.getElementById("customer-phone")?.value || "";

    let message = `🛍️ New Order from H&JPERFUMES%0A%0A`;

    if (name) message += `👤 Name: ${name}%0A`;
    if (phone) message += `📞 Phone: ${phone}%0A`;

    message += `%0A🧴 Items:%0A`;

    cart.forEach(item => {
        message += `• ${item.name} (${item.size} ml) x${item.quantity} = AED ${item.price * item.quantity}%0A`;
    });

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, "_blank");
}

/* ============================================================
   INIT
============================================================ */
window.addEventListener("load", () => {
    initLanguage();
    initSampleCount();
    updateSampleDisplay();
    updateSampleButtons();
    updateCartCount();
    displayCart();
    displayCheckout();
});
