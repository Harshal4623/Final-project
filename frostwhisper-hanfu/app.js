console.log("Frostwhisper loaded successfully.");

function updateNavAuth() {
  const user = JSON.parse(localStorage.getItem("frostwhisperUser"));
  const loginLinks = document.querySelectorAll('a[href="login.html"]');
  const registerLinks = document.querySelectorAll('a[href="register.html"]');
 
  if (user) {
    loginLinks.forEach((link) => {
      link.textContent = `Hi, ${user.fullName.split(" ")[0]}`;
      // link.href = "#";
      link.href = "account.html";   
      link.style.fontWeight = "600";
    });
    registerLinks.forEach((link) => {
      link.textContent = "Logout";
      link.href = "#";
      link.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("frostwhisperUser");
        window.location.href = "index.html";
      });
    });
  }
}
 
updateNavAuth();

/* Reveal animation */
const reveals = document.querySelectorAll(".js-reveal");

function revealOnScroll() {
  const windowHeight = window.innerHeight;

  reveals.forEach((section) => {
    const elementTop = section.getBoundingClientRect().top;
    const revealPoint = 120;

    if (elementTop < windowHeight - revealPoint) {
      section.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

/* Cart helpers */
function getCart() {
  return JSON.parse(localStorage.getItem("frostwhisperCart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("frostwhisperCart", JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badgeElements = document.querySelectorAll("#cart-count");

  badgeElements.forEach((badge) => {
    badge.textContent = count;
  });
}

function addToCart(product) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.name === product.name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  alert(`${product.name} added to cart.`);
}

function removeFromCart(productName) {
  let cart = getCart();
  cart = cart.filter((item) => item.name !== productName);
  saveCart(cart);
  renderCartPage();
  renderCheckoutSummary();
}

function changeQuantity(productName, change) {
  const cart = getCart();
  const item = cart.find((product) => product.name === productName);

  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productName);
      return;
    }
  }

  saveCart(cart);
  renderCartPage();
  renderCheckoutSummary();
}

function clearCart() {
  localStorage.removeItem("frostwhisperCart");
  updateCartBadge();
  renderCartPage();
  renderCheckoutSummary();
}

updateCartBadge();

/* Shop page logic */
/* Shop page logic */
const productContainer = document.getElementById("product-container");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const productCount = document.getElementById("product-count");

let allProducts = [];
let selectedCategory = "All";

if (productContainer) {
  fetch("/api/products")
    .then((response) => response.json())
    .then((data) => {
      console.log("Products from API:", data);
      allProducts = data;
      renderProducts(allProducts);
    })
    .catch((error) => {
      console.error("Could not load products:", error);
    });
}

function renderProducts(products) {
  if (!productContainer) return;

  productContainer.innerHTML = "";

  if (productCount) {
    productCount.textContent = `${products.length} product(s) found`;
  }

  if (!products || products.length === 0) {
    productContainer.innerHTML = `
      <div class="no-products-message">
        <p>No products match your search.</p>
      </div>
    `;
    return;
  }

  products.forEach((product) => {
    productContainer.innerHTML += `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
          <p class="product-category">${product.category}</p>
          <h3>${product.name}</h3>
          <p class="product-occasion">${product.occasion || ""}</p>
          <p class="price">$${product.price}</p>
          <button class="shop-btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    `;
  });

  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.id);
      const selectedProduct = allProducts.find(
        (product) => Number(product.id) === productId
      );

      if (selectedProduct) {
        addToCart(selectedProduct);
      }
    });
  });
}

function applyFilters() {
  let filteredProducts = [...allProducts];
  const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";

  if (selectedCategory !== "All") {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === selectedCategory
    );
  }

  if (searchValue !== "") {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchValue) ||
      product.category.toLowerCase().includes(searchValue) ||
      (product.occasion && product.occasion.toLowerCase().includes(searchValue))
    );
  }

  renderProducts(filteredProducts);
}

if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active-filter"));
    button.classList.add("active-filter");
    selectedCategory = button.dataset.category;
    applyFilters();
  });
});


/* Cart page */
function renderCartPage() {
  const cartItemsContainer = document.getElementById("cart-items");
  const summaryItems = document.getElementById("summary-items");
  const summarySubtotal = document.getElementById("summary-subtotal");
  const summaryTotal = document.getElementById("summary-total");
  const clearCartBtn = document.getElementById("clear-cart-btn");

  if (!cartItemsContainer) return;

  const cart = getCart();
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart-card">
        <h3>Your cart is empty</h3>
        <p>Browse our Hanfu collection and add items to continue.</p>
        <a href="shop.html" class="btn-primary">Go to Shop</a>
      </div>
    `;

    if (summaryItems) summaryItems.textContent = "0";
    if (summarySubtotal) summarySubtotal.textContent = "$0";
    if (summaryTotal) summaryTotal.textContent = "$15";
    return;
  }

  let totalItems = 0;
  let subtotal = 0;

  cart.forEach((item) => {
    totalItems += item.quantity;
    subtotal += item.price * item.quantity;

    cartItemsContainer.innerHTML += `
      <div class="cart-item-card">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <p class="product-category">${item.category}</p>
          <h3>${item.name}</h3>
          <p class="product-occasion">${item.occasion || ""}</p>
          <p class="price">$${item.price}</p>
          <div class="quantity-controls">
            <button class="qty-btn" onclick="changeQuantity('${item.name}', -1)">−</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" onclick="changeQuantity('${item.name}', 1)">+</button>
          </div>
        </div>
        <div class="cart-item-actions">
          <p class="cart-line-total">$${item.price * item.quantity}</p>
          <button class="remove-btn" onclick="removeFromCart('${item.name}')">Remove</button>
        </div>
      </div>
    `;
  });

  if (summaryItems) summaryItems.textContent = totalItems;
  if (summarySubtotal) summarySubtotal.textContent = `$${subtotal}`;
  if (summaryTotal) summaryTotal.textContent = `$${subtotal + 15}`;

  if (clearCartBtn) {
    clearCartBtn.onclick = clearCart;
  }
}

renderCartPage();

/* Checkout page */
function renderCheckoutSummary() {
  const previewContainer = document.getElementById("checkout-items-preview");
  const itemsElement = document.getElementById("checkout-summary-items");
  const subtotalElement = document.getElementById("checkout-summary-subtotal");
  const totalElement = document.getElementById("checkout-summary-total");

  if (!previewContainer) return;

  const cart = getCart();
  previewContainer.innerHTML = "";

  let totalItems = 0;
  let subtotal = 0;

  if (cart.length === 0) {
    previewContainer.innerHTML = `
      <div class="empty-cart-card">
        <h3>No items in cart</h3>
        <p>Please add products before checkout.</p>
        <a href="shop.html" class="btn-primary">Go to Shop</a>
      </div>
    `;
    if (itemsElement) itemsElement.textContent = "0";
    if (subtotalElement) subtotalElement.textContent = "$0";
    if (totalElement) totalElement.textContent = "$15";
    return;
  }

  cart.forEach((item) => {
    totalItems += item.quantity;
    subtotal += item.price * item.quantity;

    previewContainer.innerHTML += `
      <div class="checkout-preview-item">
        <span>${item.name} × ${item.quantity}</span>
        <span>$${item.price * item.quantity}</span>
      </div>
    `;
  });

  if (itemsElement) itemsElement.textContent = totalItems;
  if (subtotalElement) subtotalElement.textContent = `$${subtotal}`;
  if (totalElement) totalElement.textContent = `$${subtotal + 15}`;
}

renderCheckoutSummary();


const checkoutForm = document.getElementById("checkoutForm");
if (checkoutForm) {
  checkoutForm.addEventListener("submit", async function (event) {
    event.preventDefault();
 
    const cart = getCart();
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
 
    // Mock payment validation
    const cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, "");
    const expiry = document.getElementById("expiry").value;
    const cvv = document.getElementById("cvv").value;
 
    if (cardNumber.length < 13 || cardNumber.length > 19 || isNaN(cardNumber)) {
      alert("Please enter a valid card number.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      alert("Please enter expiry as MM/YY.");
      return;
    }
    if (cvv.length < 3 || isNaN(cvv)) {
      alert("Please enter a valid CVV.");
      return;
    }
 
    const submitBtn = checkoutForm.querySelector("button[type='submit']");
    submitBtn.textContent = "Processing Payment…";
    submitBtn.disabled = true;
 
    // Simulate payment delay
    await new Promise((resolve) => setTimeout(resolve, 1800));
 
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const country = document.getElementById("country").value;
    const zip = document.getElementById("zip").value;
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + 15;
 
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, address, city, country, zip, items: cart, total })
      });
 
      if (response.ok) {
        localStorage.removeItem("frostwhisperCart");
        window.location.href = "order-success.html";
      } else {
        const data = await response.json();
        alert(data.message || "Could not place order.");
        submitBtn.textContent = "Place Order";
        submitBtn.disabled = false;
      }
    } catch (error) {
      alert("Something went wrong while placing the order.");
      submitBtn.textContent = "Place Order";
      submitBtn.disabled = false;
    }
  });
}





// const checkoutForm = document.getElementById("checkoutForm");
// if (checkoutForm) {
//   checkoutForm.addEventListener("submit", async function (event) {
//     event.preventDefault();

//     const cart = getCart();
//     if (cart.length === 0) {
//       alert("Your cart is empty.");
//       return;
//     }

//     const fullName = document.getElementById("fullName").value;
//     const email = document.getElementById("email").value;
//     const phone = document.getElementById("phone").value;
//     const address = document.getElementById("address").value;
//     const city = document.getElementById("city").value;
//     const country = document.getElementById("country").value;
//     const zip = document.getElementById("zip").value;

//     const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
//     const total = subtotal + 15;

//     try {
//       const response = await fetch("/api/orders", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           fullName,
//           email,
//           phone,
//           address,
//           city,
//           country,
//           zip,
//           items: cart,
//           total
//         })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         localStorage.removeItem("frostwhisperCart");
//         window.location.href = "order-success.html";
//       } else {
//         alert(data.message || "Could not place order.");
//       }
//     } catch (error) {
//       alert("Something went wrong while placing the order.");
//     }
//   });
// }

/* Feedback helpers */
function getFeedbackList() {
  return JSON.parse(localStorage.getItem("frostwhisperFeedback")) || [];
}

function saveFeedbackList(feedbackList) {
  localStorage.setItem("frostwhisperFeedback", JSON.stringify(feedbackList));
}

function addFeedbackEntry(message) {
  const feedbackList = getFeedbackList();

  feedbackList.unshift({
    name: "Verified Customer",
    product: "Website Visitor Feedback",
    message: message
  });

  saveFeedbackList(feedbackList);
  renderFeedbackReviews();
}

function renderFeedbackReviews() {
  const reviewsContainer = document.getElementById("reviews-container");
  if (!reviewsContainer) return;

  const feedbackList = getFeedbackList();
  reviewsContainer.innerHTML = "";

  if (feedbackList.length === 0) {
    reviewsContainer.innerHTML = `
      <div class="no-review-card">
        No customer feedback yet. Use the chat assistant to leave the first review.
      </div>
    `;
    return;
  }

  feedbackList.forEach((item) => {
    reviewsContainer.innerHTML += `
      <div class="review-card">
        <div class="review-stars">★★★★★</div>
        <p class="review-text">“${item.message}”</p>
        <div class="review-user">
          <strong>${item.name}</strong>
          <span>${item.product}</span>
        </div>
      </div>
    `;
  });
}

renderFeedbackReviews();

/* Register page connection */

const registerForm = document.getElementById("registerForm");
 
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
 
    const fullNameInput =
      document.getElementById("fullName") ||
      document.getElementById("registerName");
 
    const emailInput =
      document.getElementById("email") ||
      document.getElementById("registerEmail");
 
    const passwordInput =
      document.getElementById("password") ||
      document.getElementById("registerPassword");
 
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const message = document.getElementById("registerMessage");
 
    const fullName = fullNameInput ? fullNameInput.value : "";
    const email = emailInput ? emailInput.value : "";
    const password = passwordInput ? passwordInput.value : "";
 
    if (confirmPasswordInput && password !== confirmPasswordInput.value) {
      if (message) {
        message.style.color = "#b84d4d";
        message.textContent = "Passwords do not match.";
      }
      return;
    }
 
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password })
      });
 
      const data = await response.json();
 
      if (response.ok) {
        if (message) {
          message.style.color = "#4b7a52";
          message.textContent = "Account created! Redirecting to login…";
        }
 
        registerForm.reset();
 
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      } else {
        if (message) {
          message.style.color = "#b84d4d";
          message.textContent = data.message;
        }
      }
    } catch (error) {
      if (message) {
        message.style.color = "#b84d4d";
        message.textContent = "Something went wrong. Please try again.";
      }
    }
  });
}
// const registerForm = document.getElementById("registerForm");

// if (registerForm) {
//   registerForm.addEventListener("submit", async (event) => {
//     event.preventDefault();

//     const fullNameInput =
//       document.getElementById("fullName") ||
//       document.getElementById("registerName");

//     const emailInput =
//       document.getElementById("email") ||
//       document.getElementById("registerEmail");

//     const passwordInput =
//       document.getElementById("password") ||
//       document.getElementById("registerPassword");

//     const confirmPasswordInput = document.getElementById("confirmPassword");
//     const message = document.getElementById("registerMessage");

//     const fullName = fullNameInput ? fullNameInput.value : "";
//     const email = emailInput ? emailInput.value : "";
//     const password = passwordInput ? passwordInput.value : "";

//     if (confirmPasswordInput && password !== confirmPasswordInput.value) {
//       if (message) {
//         message.style.color = "#b84d4d";
//         message.textContent = "Passwords do not match.";
//       } else {
//         alert("Passwords do not match.");
//       }
//       return;
//     }

//     try {
//       const response = await fetch("/api/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           fullName,
//           email,
//           password
//         })
//       });

//       const data = await response.json();

//       if (message) {
//         if (response.ok) {
//           message.style.color = "#4b7a52";
//           message.textContent = "Registration successful! You can now log in.";
//         } else {
//           message.style.color = "#b84d4d";
//           message.textContent = data.message;
//         }
//       } else {
//         alert(data.message);
//       }

//       if (response.ok) {
//         registerForm.reset();
//       }
//     } catch (error) {
//       if (message) {
//         message.style.color = "#b84d4d";
//         message.textContent = "Something went wrong. Please try again.";
//       } else {
//         alert("Something went wrong. Please try again.");
//       }
//     }
//   });
// }

/* Login page connection */
const loginForm = document.getElementById("loginForm");
 
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
 
    const emailInput =
      document.getElementById("email") ||
      document.getElementById("loginEmail");
 
    const passwordInput =
      document.getElementById("password") ||
      document.getElementById("loginPassword");
 
    const message = document.getElementById("loginMessage");
 
    const email = emailInput ? emailInput.value : "";
    const password = passwordInput ? passwordInput.value : "";
 
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
 
      const data = await response.json();
 
      if (response.ok) {
        // Save name for display elsewhere if needed
        localStorage.setItem("frostwhisperUser", JSON.stringify(data.user));
 
        if (message) {
          message.style.color = "#4b7a52";
          message.textContent = "Login successful! Redirecting…";
        }
 
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } else {
        if (message) {
          message.style.color = "#b84d4d";
          message.textContent = data.message;
        }
      }
    } catch (error) {
      if (message) {
        message.style.color = "#b84d4d";
        message.textContent = "Something went wrong. Please try again.";
      }
    }
  });
}

/* Chatbot */
const chatToggle = document.getElementById("chatToggle");
const chatBox = document.getElementById("chatBox");
const closeChat = document.getElementById("closeChat");
const sendChat = document.getElementById("sendChat");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

if (chatToggle && chatBox && closeChat && sendChat && chatInput && chatMessages) {
  chatToggle.addEventListener("click", () => {
    chatBox.classList.toggle("hidden");
  });

  closeChat.addEventListener("click", () => {
    chatBox.classList.add("hidden");
  });

  sendChat.addEventListener("click", handleChatMessage);

  chatInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleChatMessage();
    }
  });
}

function handleChatMessage() {
  const userText = chatInput.value.trim();

  if (userText === "") return;

  appendMessage(userText, "user");

  const reply = getBotReply(userText);

  setTimeout(() => {
    appendMessage(reply.message, "bot");
  }, 500);

  if (reply.isFeedback) {
    addFeedbackEntry(userText);
    saveFeedbackToDatabase(userText);
  }

  chatInput.value = "";
}

function appendMessage(text, sender) {
  if (!chatMessages) return;

  const message = document.createElement("div");
  message.className = sender === "user" ? "user-message" : "bot-message";
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotReply(message) {
  const text = message.toLowerCase();

  if (text.includes("shipping")) {
    return {
      message: "We offer worldwide shipping. Orders usually arrive within 7–14 business days.",
      isFeedback: false
    };
  }

  if (text.includes("return") || text.includes("refund")) {
    return {
      message: "You can request a return within 14 days of delivery.",
      isFeedback: false
    };
  }

  if (text.includes("size") || text.includes("fit")) {
    return {
      message: "Our sizing guide supports different body types and can be found in the customer care section.",
      isFeedback: false
    };
  }

  if (text.includes("wedding")) {
    return {
      message: "Yes, we offer wedding Hanfu collections and bridal styling pieces.",
      isFeedback: false
    };
  }

  if (
    text.includes("feedback") ||
    text.includes("review") ||
    text.includes("love") ||
    text.includes("like") ||
    text.includes("improve") ||
    text.includes("beautiful") ||
    text.includes("great") ||
    text.includes("amazing") ||
    text.includes("good") ||
    text.includes("bad")
  ) {
    return {
      message: "Thank you for your feedback. Your review has been added to our customer reviews section.",
      isFeedback: true
    };
  }

  return {
    message: "I can help with shipping, returns, sizing, wedding Hanfu, and feedback.",
    isFeedback: false
  };
}

async function saveFeedbackToDatabase(message) {
  try {
    await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        customerName: "Verified Customer",
        message: message
      })
    });
  } catch (error) {
    console.log("Could not save feedback to database.");
  }
}