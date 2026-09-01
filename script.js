const cartCount = document.getElementById("cartCount");

// Image modal elements
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalClose = document.querySelector(".modal-close");

// Cart & quantity modal elements
const cartModal = document.getElementById("cartModal");
const cartItemsContainer = document.getElementById("cartItems");
const cartSummary = document.getElementById("cartSummary");
const cartClose = document.querySelector(".cart-close");

const quantityModal = document.getElementById("quantityModal");
const quantityInput = document.getElementById("quantityInput");
const quantityConfirm = document.getElementById("quantityConfirm");
const qtyClose = document.querySelector(".qty-close");
const quantityTitle = document.getElementById("quantityTitle");

const productImages = document.querySelectorAll(".product-image");

productImages.forEach((image) => {
  image.addEventListener("click", () => {
    modalImage.src = image.src;
    modalImage.alt = image.alt;
    imageModal.classList.add("is-open");
    imageModal.setAttribute("aria-hidden", "false");
    // focus management for a11y
    const closeBtn = imageModal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  });
});

const closeModal = () => {
  imageModal.classList.remove("is-open");
  imageModal.setAttribute("aria-hidden", "true");
  modalImage.src = "";
};

if (modalClose) modalClose.addEventListener("click", closeModal);
imageModal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close")) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (imageModal.classList.contains("is-open")) closeModal();
    if (cartModal.classList.contains("is-open")) closeCartModal();
    if (quantityModal.classList.contains("is-open")) closeQuantityModal();
  }
});

// Simple cart implementation persisted in localStorage
const CART_KEY = 'shopEaseCart_v1';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getTotalItems() {
  return cart.reduce((sum, item) => sum + (item.qty || 0), 0);
}

function updateCartCount() {
  cartCount.textContent = getTotalItems();
}

updateCartCount();

// Add-to-cart button handling
const addButtons = document.querySelectorAll('.add-to-cart');
let currentProduct = null;

addButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const name = btn.dataset.name || 'Item';
    const price = parseInt((btn.dataset.price || '0').replace(/,/g, ''), 10) || 0;
    currentProduct = { name, price };
    // show quantity modal
    openQuantityModal(currentProduct);
  });
});

function openQuantityModal(product) {
  if (!quantityModal) return;
  quantityTitle.textContent = `Select quantity for: ${product.name}`;
  quantityInput.value = 1;
  quantityModal.classList.add('is-open');
  quantityModal.setAttribute('aria-hidden', 'false');
  quantityInput.focus();
}

function closeQuantityModal() {
  if (!quantityModal) return;
  quantityModal.classList.remove('is-open');
  quantityModal.setAttribute('aria-hidden', 'true');
}

qtyClose && qtyClose.addEventListener('click', closeQuantityModal);
quantityConfirm && quantityConfirm.addEventListener('click', () => {
  const qty = Math.max(1, parseInt(quantityInput.value, 10) || 1);
  if (!currentProduct) return;
  // add to cart
  const existing = cart.find(i => i.name === currentProduct.name);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ name: currentProduct.name, price: currentProduct.price, qty });
  }
  saveCart();
  updateCartCount();
  closeQuantityModal();
});

// Cart modal handling
const cartButton = document.getElementById('cartButton');

function openCartModal() {
  renderCartItems();
  cartModal.classList.add('is-open');
  cartModal.setAttribute('aria-hidden', 'false');
  const closeBtn = cartModal.querySelector('.cart-close');
  if (closeBtn) closeBtn.focus();
}

function closeCartModal() {
  cartModal.classList.remove('is-open');
  cartModal.setAttribute('aria-hidden', 'true');
}

cartClose && cartClose.addEventListener('click', closeCartModal);

if (cartButton) {
  cartButton.addEventListener('click', openCartModal);
}

// Close modals when clicking on backdrop
document.addEventListener('click', (e) => {
  if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-close')) {
    // which modal?
    if (e.target.closest('#cartModal')) closeCartModal();
    if (e.target.closest('#quantityModal')) closeQuantityModal();
    if (e.target.closest('#imageModal')) closeModal();
  }
});

function renderCartItems() {
  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = '';
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    cartSummary.textContent = '';
    return;
  }

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';

    const left = document.createElement('div');
    left.className = 'left';

    const nameEl = document.createElement('div');
    nameEl.className = 'item-name';
    nameEl.textContent = item.name;

    const priceEl = document.createElement('div');
    priceEl.className = 'item-price';
    priceEl.textContent = `Price: ₹${item.price.toLocaleString()}`;

    left.appendChild(nameEl);
    left.appendChild(priceEl);

    const controls = document.createElement('div');
    controls.className = 'qty-controls';

    const dec = document.createElement('button');
    dec.className = 'qty-btn qty-decrease';
    dec.setAttribute('data-name', item.name);
    dec.textContent = '-';

    const qtySpan = document.createElement('span');
    qtySpan.className = 'qty-value';
    qtySpan.textContent = item.qty;

    const inc = document.createElement('button');
    inc.className = 'qty-btn qty-increase';
    inc.setAttribute('data-name', item.name);
    inc.textContent = '+';

    const remove = document.createElement('button');
    remove.className = 'remove-btn';
    remove.setAttribute('data-name', item.name);
    remove.textContent = 'Remove';

    controls.appendChild(dec);
    controls.appendChild(qtySpan);
    controls.appendChild(inc);

    const right = document.createElement('div');
    right.className = 'right';

    const totalEl = document.createElement('div');
    totalEl.className = 'item-total';
    totalEl.textContent = `₹${(item.price * item.qty).toLocaleString()}`;

    right.appendChild(controls);
    right.appendChild(remove);
    right.appendChild(totalEl);

    div.appendChild(left);
    div.appendChild(right);

    cartItemsContainer.appendChild(div);
  });

  const totalItems = getTotalItems();
  const totalPrice = cart.reduce((s,i)=>s + (i.price * i.qty), 0);
  cartSummary.textContent = `Items: ${totalItems} — Total: ₹${totalPrice.toLocaleString()}`;
}

// Event delegation for cart item controls
if (cartItemsContainer) {
  cartItemsContainer.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('qty-increase')) {
      const name = target.getAttribute('data-name');
      changeQuantity(name, 1);
    }
    if (target.classList.contains('qty-decrease')) {
      const name = target.getAttribute('data-name');
      changeQuantity(name, -1);
    }
    if (target.classList.contains('remove-btn')) {
      const name = target.getAttribute('data-name');
      removeItemByName(name);
    }
  });
}

function changeQuantity(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty <= 0) {
    // remove
    cart = cart.filter(i => i.name !== name);
  }
  saveCart();
  updateCartCount();
  renderCartItems();
}

function removeItemByName(name) {
  cart = cart.filter(i => i.name !== name);
  saveCart();
  updateCartCount();
  renderCartItems();
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]);
}

// initialize focusable modal close handlers if needed
