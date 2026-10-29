
const products = [
  {
    id: 1,
    name: "The Everyday Shirt",
    category: "tops",
    price: 1299,
    color: "Ivory",
    tag: "BESTSELLER",
    image: "photo-1598554747436-c9293d6a588f"
  },
  {
    id: 2,
    name: "Soft Knit Top",
    category: "tops",
    price: 999,
    color: "Sand",
    tag: "NEW",
    image: "photo-1551163943-3f6a855d1153"
  },
  {
    id: 3,
    name: "Relaxed Trousers",
    category: "bottoms",
    price: 1599,
    color: "Stone",
    tag: "",
    image: "photo-1506629905607-d9b1e1d0b8b8"
  },
  {
    id: 4,
    name: "The Classic Blazer",
    category: "outerwear",
    price: 2499,
    color: "Charcoal",
    tag: "POPULAR",
    image: "photo-1591047139829-d91aecb6caea"
  },
  {
    id: 5,
    name: "Everyday Denim",
    category: "bottoms",
    price: 1799,
    color: "Blue",
    tag: "",
    image: "photo-1542272604-787c3835535d"
  },
  {
    id: 6,
    name: "The Weekend Jacket",
    category: "outerwear",
    price: 2899,
    color: "Olive",
    tag: "NEW",
    image: "photo-1548126032-079a0fb0099d"
  }
];

const productGrid = document.getElementById("productGrid");
const productTotal = document.getElementById("productTotal");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartItemsElement = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const drawerCount = document.getElementById("drawerCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const toast = document.getElementById("toast");

let activeCategory = "all";
let searchTerm = "";
let toastTimer;

let cart = [];

try {
  const savedCart = JSON.parse(localStorage.getItem("noireCart") || "[]");

  if (Array.isArray(savedCart)) {
    cart = savedCart.filter(item =>
      products.some(product => product.id === item.id) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    );
  }
} catch {
  cart = [];
}

function formatPrice(price) {
  return "₹" + price.toLocaleString("en-IN");
}

function getImageUrl(photoId, width = 700) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

// Display products
function displayProducts() {
  let filteredProducts = products.filter(product => {
    const matchesCategory =
      activeCategory === "all" ||
      product.category === activeCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.color.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  const sortValue = document.getElementById("sortSelect").value;

  if (sortValue === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  productTotal.textContent =
    `${String(filteredProducts.length).padStart(2, "0")} PIECES`;

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = `
      <p class="empty-results">
        No products found. Try another search.
      </p>`;
    return;
  }

  productGrid.innerHTML = filteredProducts.map(product => `
    <article class="product-card">
      <div class="product-image">
        <img
          src="${getImageUrl(product.image)}"
          alt="${product.name}"
          loading="lazy"
        >
        ${product.tag
          ? `<span class="product-tag">${product.tag}</span>`
          : ""}
        <button
          class="add-btn"
          data-add="${product.id}"
          type="button"
        >
          Add to bag +
        </button>
      </div>

      <div class="product-info">
        <div>
          <h3>${product.name}</h3>
          <p>${product.color} · ${product.category}</p>
        </div>
        <span class="product-price">${formatPrice(product.price)}</span>
      </div>
    </article>
  `).join("");
}

// Product category filters
document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
    activeCategory = button.dataset.category;
    displayProducts();
  });
});

// Search products
document.getElementById("searchToggle").addEventListener("click", () => {
  const searchBar = document.getElementById("searchBar");
  searchBar.classList.toggle("open");

  if (searchBar.classList.contains("open")) {
    document.getElementById("searchInput").focus();
  }
});

function performSearch() {
  searchTerm = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  displayProducts();

  document.getElementById("collection").scrollIntoView({
    behavior: "smooth"
  });
}

document.getElementById("searchButton")
  .addEventListener("click", performSearch);

document.getElementById("searchInput")
  .addEventListener("keydown", event => {
    if (event.key === "Enter") performSearch();
  });

// Product sorting
document.getElementById("sortSelect")
  .addEventListener("change", displayProducts);

// Add a product to the cart
productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");

  if (!button) return;

  const id = Number(button.dataset.add);
  const product = products.find(item => item.id === id);

  if (!product) return;

  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  displayCart();
  showToast(`${product.name} added to your bag`);
});

// Save cart in browser storage
function saveCart() {
  try {
    localStorage.setItem("noireCart", JSON.stringify(cart));
  } catch {
    showToast("Could not save your bag in this browser.");
  }
}

// Display cart
function displayCart() {
  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  cartCount.textContent = totalItems;
  drawerCount.textContent = totalItems;
  cartSubtotal.textContent = formatPrice(subtotal);

  if (cart.length === 0) {
    cartItemsElement.innerHTML = `
      <p class="empty-cart">
        Your bag is waiting for something lovely.
      </p>`;
    return;
  }

  cartItemsElement.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);

    if (!product) return "";

    return `
      <div class="cart-item">
        <img src="${getImageUrl(product.image, 250)}"
             alt="${product.name}">

        <div>
          <h3>${product.name}</h3>
          <p>${formatPrice(product.price)}</p>

          <div class="quantity-controls">
            <button
              data-change="${product.id}"
              data-delta="-1"
              aria-label="Decrease quantity"
            >−</button>

            <span>${item.quantity}</span>

            <button
              data-change="${product.id}"
              data-delta="1"
              aria-label="Increase quantity"
            >+</button>
          </div>
        </div>

        <button
          class="remove-item"
          data-remove="${product.id}"
          aria-label="Remove ${product.name}"
        >✕</button>
      </div>
    `;
  }).join("");
}

// Change quantity or remove items
cartItemsElement.addEventListener("click", event => {
  const changeButton = event.target.closest("[data-change]");
  const removeButton = event.target.closest("[data-remove]");

  if (changeButton) {
    const id = Number(changeButton.dataset.change);
    const delta = Number(changeButton.dataset.delta);
    const item = cart.find(item => item.id === id);

    if (item) {
      item.quantity += delta;

      if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== id);
      }

      saveCart();
      displayCart();
    }
  }

  if (removeButton) {
    const id = Number(removeButton.dataset.remove);
    cart = cart.filter(item => item.id !== id);

    saveCart();
    displayCart();
    showToast("Item removed from your bag");
  }
});

// Open and close cart
function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("open");
  document.body.classList.remove("no-scroll");
}

document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("continueShopping")
  .addEventListener("click", closeCart);

overlay.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCart();
});

// Checkout demo
document.getElementById("checkoutButton")
  .addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("Your bag is empty.");
      return;
    }

    showToast("Checkout demo only — no order has been placed.");
  });

// Newsletter demo
document.getElementById("newsletterForm")
  .addEventListener("submit", event => {
    event.preventDefault();

    const email = document.getElementById("emailInput").value.trim();

    if (!email) return;

    document.getElementById("newsletterMessage").textContent =
      "Thank you! Newsletter signup is currently a demo.";

    event.target.reset();
  });

// Mobile navigation
document.getElementById("menuToggle")
  .addEventListener("click", () => {
    document.getElementById("navLinks").classList.toggle("open");
  });

document.querySelectorAll("#navLinks a").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("navLinks").classList.remove("open");
  });
});

// Small notification message
function showToast(message) {
  clearTimeout(toastTimer);

  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Set current year and initialize website
document.getElementById("year").textContent = new Date().getFullYear();

displayProducts();
displayCart();
