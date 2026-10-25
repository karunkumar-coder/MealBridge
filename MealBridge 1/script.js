
/* =========================================================
   MEALBRIDGE — INTERACTIVE FRONTEND DEMO
   This version uses browser localStorage, not a real backend.
========================================================= */


/* MealBridge - Supabase connection */
const MEALBRIDGE_SUPABASE_URL = "https://rnunarxrwofdwzlofrea.supabase.co";
const MEALBRIDGE_SUPABASE_KEY = "sb_publishable_a12LfA5yRs65NnYcT37yag_4bDUO-zA";

const mealBridgeSupabase = window.supabase.createClient(
  MEALBRIDGE_SUPABASE_URL,
  MEALBRIDGE_SUPABASE_KEY
);

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const STORAGE = {
  users: "mealbridge_demo_users",
  session: "mealbridge_demo_session",
  listings: "mealbridge_demo_listings",
  reservations: "mealbridge_demo_reservations"
};

const readStore = (key, fallback) => {
  try {
    const result = JSON.parse(localStorage.getItem(key));
    return result ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStore = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const plusHours = hours => new Date(Date.now() + hours * 3600000).toISOString();

const initialFoods = [
  {
    id: "sample-1", name: "Harvest Power Bowl", provider: "Green Fork Kitchen",
    category: "Meals", description: "A colorful bowl of fresh greens, grains and roasted vegetables.",
    price: 89, originalPrice: 160, offer: "discount", qty: 8,
    deadline: plusHours(7), image: "photo-1512621776951-a57141f2eefd", icon: "G",
    notes: "Keep chilled. Ask the provider about allergens.", location: "Illustrative location · confirm with provider", demo: true
  },
  {
    id: "sample-2", name: "Fresh Bakery Box", provider: "Morning Crust Bakery",
    category: "Bakery", description: "A mix of today's unsold pastries and freshly baked bread.",
    price: 45, originalPrice: 100, offer: "discount", qty: 5,
    deadline: plusHours(5), image: "photo-1509440159596-0249088772ff", icon: "M",
    notes: "Contains bakery items. Ask about allergens.", location: "Illustrative location · confirm with provider", demo: true
  },
  {
    id: "sample-3", name: "Homestyle Meal Box", provider: "The Daily Table",
    category: "Meals", description: "A filling home-style meal, prepared for collection today.",
    price: 0, originalPrice: 80, offer: "free", qty: 4,
    deadline: plusHours(2), image: "photo-1547592180-85f173990554", icon: "D",
    notes: "Confirm ingredients and safe collection conditions.", location: "Illustrative location · confirm with provider", demo: true
  },
  {
    id: "sample-4", name: "Seasonal Fruit Pack", provider: "Neighbourhood Produce",
    category: "Produce", description: "A selection of seasonal fruit suitable for prompt collection.",
    price: 35, originalPrice: 70, offer: "discount", qty: 10,
    deadline: plusHours(10), image: "photo-1610832958506-aa56368176cf", icon: "N",
    notes: "Check freshness before collection.", location: "Illustrative location · confirm with provider", demo: true
  },
  {
    id: "sample-5", name: "Community Snack Pack", provider: "Little Leaf Café",
    category: "Snacks", description: "A selection of surplus café snacks shared with the community.",
    price: 0, originalPrice: 55, offer: "free", qty: 6,
    deadline: plusHours(1.5), image: "photo-1541592106381-b31e9677c0e5", icon: "L",
    notes: "Ask the provider about ingredients and allergens.", location: "Illustrative location · confirm with provider", demo: true
  },
  {
    id: "sample-6", name: "Garden Fresh Salad", provider: "Green Fork Kitchen",
    category: "Meals", description: "A fresh, crunchy salad made with seasonal produce.",
    price: 65, originalPrice: 120, offer: "discount", qty: 7,
    deadline: plusHours(6), image: "photo-1512621776951-a57141f2eefd", icon: "G",
    notes: "Keep chilled and collect promptly.", location: "Illustrative location · confirm with provider", demo: true
  }
];

let foods = readStore(STORAGE.listings, initialFoods);
let activeFilter = "all";
let showAll = false;
let currentAuthMode = "login";
let toastTimeout;

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

function getSession() {
  return readStore(STORAGE.session, null);
}

function getReservations() {
  return readStore(STORAGE.reservations, []);
}

function saveFoods() {
  writeStore(STORAGE.listings, foods);
}

function formatDeadline(iso) {
  const remaining = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(remaining) || remaining <= 0) return "Collection closed";
  const hours = Math.floor(remaining / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  if (hours === 0) return `${mins} min left`;
  if (hours < 24) return `${hours}h ${mins}m left`;
  return `${Math.floor(hours / 24)}d left`;
}

function isAvailable(food) {
  return food.qty > 0 && new Date(food.deadline).getTime() > Date.now();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 3000);
}



function getFoodImage(foodName, category) {
  const food = `${foodName || ""} ${category || ""}`.toLowerCase();

  // Indian rice dishes
  if (food.includes("biryani")) {
    return "photo-1563379091339-03246963d51a";
  }
  if (food.includes("fried rice") || food.includes("pulao") ||
      food.includes("pulav") || food.includes("jeera rice")) {
    return "photo-1516684732162-798a0062be99";
  }

  // Chicken and meat dishes
  if (food.includes("chicken")) {
    return "photo-1603894584373-5ac82b2ae398";
  }
  if (food.includes("mutton") || food.includes("lamb")) {
    return "photo-1545247181-516773cae754";
  }
  if (food.includes("fish") || food.includes("prawn") ||
      food.includes("seafood") || food.includes("shrimp")) {
    return "photo-1519708227418-c8fd9a32b7a2";
  }

  // Vegetarian Indian dishes
  if (food.includes("paneer")) {
    return "photo-1631452180519-c014fe946bc7";
  }
  if (food.includes("dal") || food.includes("dhal") ||
      food.includes("sambar")) {
    return "photo-1546833999-b9f581a1996d";
  }
  if (food.includes("curry") || food.includes("masala")) {
    return "photo-1565557623262-b51c2513a641";
  }

  // Breakfast and snacks
  if (food.includes("dosa") || food.includes("uttapam")) {
    return "photo-1589301760014-d929f3979dbc";
  }
  if (food.includes("idli")) {
    return "photo-1589301760014-d929f3979dbc";
  }
  if (food.includes("samosa") || food.includes("pakora") ||
      food.includes("pakoda") || food.includes("fritter")) {
    return "photo-1601050690597-df0568f70950";
  }
  if (food.includes("vada") || food.includes("vada pav")) {
    return "photo-1601050690597-df0568f70950";
  }
  if (food.includes("roti") || food.includes("chapati") ||
      food.includes("naan") || food.includes("paratha")) {
    return "photo-1565557623262-b51c2513a641";
  }

  // International and fast food
  if (food.includes("pizza")) {
    return "photo-1513104890138-7c749659a591";
  }
  if (food.includes("burger")) {
    return "photo-1568901346375-23c9450c58cd";
  }
  if (food.includes("pasta") || food.includes("noodle") ||
      food.includes("macaroni")) {
    return "photo-1473093295043-cdd812d0e601";
  }
  if (food.includes("sandwich") || food.includes("toast")) {
    return "photo-1528735602780-2552fd46c7af";
  }

  // Healthy food and desserts
  if (food.includes("salad")) {
    return "photo-1512621776951-a57141f2eefd";
  }
  if (food.includes("fruit") || food.includes("fruits")) {
    return "photo-1490474418585-ba9bad8fd0ea";
  }
  if (food.includes("cake") || food.includes("pastry") ||
      food.includes("dessert") || food.includes("brownie")) {
    return "photo-1578985545062-69928b1d9587";
  }
  if (food.includes("ice cream") || food.includes("icecream")) {
    return "photo-1563805042-7684c019e1cb";
  }

  // Default food image
  return "photo-1547592180-85f173990554";
}


function renderFoods() {
  const grid = $("#foodGrid");
  const search = ($("#searchInput").value || "").trim().toLowerCase();

  let filtered = foods.filter(food => {
    const matchesSearch = [
      food.name, food.provider, food.category, food.description
    ].some(value => String(value || "").toLowerCase().includes(search));

    const matchesFilter = activeFilter === "all" ||
      (activeFilter === "free" && food.offer === "free") ||
      (activeFilter === "discount" && food.offer === "discount");

    return matchesSearch && matchesFilter;
  });

  // Show the initial set first. "Explore all meals" reveals additional listings.
  if (!showAll && !search && activeFilter === "all") {
    filtered = filtered.slice(0, 6);
  }

  $("#listingCount").textContent = String(foods.length).padStart(2, "0");
  $("#emptyState").classList.toggle("hidden", filtered.length > 0);
  $("#showAllBtn").classList.toggle("hidden", filtered.length <= 6 && showAll);
  $("#showAllBtn").textContent = showAll ? "Showing all available listings" : "Explore all meals ↓";
  $("#showAllBtn").disabled = showAll;

  grid.innerHTML = filtered.map((food, index) => {
    const available = isAvailable(food);
    const reservations = getReservations().filter(r => r.foodId === food.id).length;
    const imageId = getFoodImage(food.name, food.category);
    const image = `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=750&q=80`;
    const badge = food.offer === "free"
      ? '<span class="food-badge free">100% FREE</span>'
      : '<span class="food-badge">SAVE ' + Math.round((1 - food.price / Math.max(food.originalPrice, 1)) * 100) + '%</span>';

    return `
      <article class="food-card" style="animation-delay:${Math.min(index * 70, 350)}ms">
        <div class="food-image">
          <img src="${image}" alt="${escapeHTML(food.name)}"
               loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=750&q=80'">
          ${badge}
          <span class="food-category">${escapeHTML(food.category)}</span>
        </div>
        <div class="food-content">
          <div class="food-provider">
            <span class="provider-mark">${escapeHTML(food.icon || "M")}</span>
            <span>${escapeHTML(food.provider)}</span>
          </div>
          <h3>${escapeHTML(food.name)}</h3>
          <p class="food-desc">${escapeHTML(food.description)}</p>
          <div class="food-meta">
            <span class="deadline">${available ? "◷ " + formatDeadline(food.deadline) : "● Unavailable"}</span>
            <span>${food.qty} portion${food.qty === 1 ? "" : "s"} left</span>
          </div>
          <div class="food-price-row">
            <div class="food-price">
              ${food.offer === "free"
                ? '<span class="free-word">FREE</span>'
                : '₹' + Number(food.price).toLocaleString("en-IN") +
                  (food.originalPrice > food.price
                    ? ' <del>₹' + Number(food.originalPrice).toLocaleString("en-IN") + '</del>' : '')}
            </div>
            <button class="reserve-btn" data-reserve="${escapeHTML(food.id)}" ${available ? "" : "disabled"}>
              ${available ? "Reserve ↗" : "Closed"}
            </button>
          </div>
          ${food.demo ? '<div class="demo-listing-note">Sample listing · not a live offer</div>' : ""}
        </div>
      </article>`;
  }).join("");
}

// Add a subtle note to demo cards without cluttering the main design.
const extraStyle = document.createElement("style");
extraStyle.textContent = `
.demo-listing-note { margin-top: 12px; color: #999f92; font-size: 9px; }
`;
document.head.appendChild(extraStyle);

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  const focusable = modal.querySelector("input:not([type=checkbox]), button, select");
  if (focusable) setTimeout(() => focusable.focus(), 80);
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("hidden");
  if (!$(".modal-backdrop:not(.hidden)")) document.body.style.overflow = "";
}

function setAuthMode(mode) {
  currentAuthMode = mode;
  const signup = mode === "signup";
  $("#authTitle").textContent = signup ? "Let's make a difference." : "Good to have you.";
  $("#authSubtitle").textContent = signup
    ? "Create your account and find your place in the food rescue movement."
    : "Sign in to continue your food rescue journey.";
  $("#nameField").classList.toggle("hidden", !signup);
  $("#roleField").classList.toggle("hidden", !signup);
  $("#authName").required = signup;
  $("#authName").autocomplete = "name";
  $("#authPassword").autocomplete = signup ? "new-password" : "current-password";
  $("#authSubmit").textContent = signup ? "Create my account ↗" : "Log in ↗";
  $$(".auth-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.mode === mode));
  $("#authMessage").textContent = "";
  $("#authMessage").classList.remove("error");
}

function updateHeaderForSession() {
  const session = getSession();
  const loginButtons = $$('[data-auth="login"]');
  loginButtons.forEach(button => {
    button.textContent = session ? "Log out" : "Log in";
    button.dataset.auth = session ? "logout" : "login";
  });

  const signupButtons = $$('[data-auth="signup"]');
  signupButtons.forEach(button => {
    if (session) {
      button.textContent = session.role === "provider" ? "＋ List surplus" : "My account ↗";
      button.dataset.auth = session.role === "provider" ? "list" : "account";
    } else {
      button.textContent = button.classList.contains("btn")
        ? "Join MealBridge ↗" : "Create account";
      button.dataset.auth = "signup";
    }
  });
}

async function reserveFood(id) {
  const food = foods.find(item => item.id === id);

  if (!food || !isAvailable(food)) {
    showToast("Sorry, this listing is no longer available.");
    renderFoods();
    return;
  }

  const session = getSession();

  if (!session) {
    setAuthMode("login");
    openModal("authModal");
    $("#authMessage").textContent = "Please log in to reserve a meal.";
    return;
  }

  if (session.role === "provider") {
    showToast("Please use a buyer account to reserve food.");
    return;
  }

  try {
    // Confirm the signed-in Supabase user.
    const { data: userResult, error: userError } =
      await mealBridgeSupabase.auth.getUser();

    if (userError || !userResult.user) {
      showToast("Please log in again to reserve a meal.");
      return;
    }

    // Reserve one portion through the secure database function.
    const { data, error } = await mealBridgeSupabase.rpc(
      "reserve_food_listing",
      { p_listing_id: id }
    );

    if (error) {
      console.error("Reservation error:", error);
      showToast(
        error.message.includes("already reserved")
          ? "You have already reserved this listing."
          : "Could not reserve this meal. Please try again."
      );
      return;
    }

    // Update the displayed quantity using the database result.
    food.qty = data.available_quantity;

    // Keep the existing browser-based reservation display working.
    const reservations = getReservations();
    reservations.push({
      id: "res-" + Date.now(),
      foodId: id,
      email: session.email,
      foodName: food.name,
      provider: food.provider,
      offer: food.offer,
      price: food.price,
      createdAt: new Date().toISOString()
    });

    saveFoods();
    writeStore(STORAGE.reservations, reservations);
    renderFoods();

    showToast(
      food.offer === "free"
        ? "Your free-food reservation was saved!"
        : "Your food reservation was saved!"
    );
  } catch (error) {
    console.error("Reservation error:", error);
    showToast("Something went wrong. Please try again.");
  }
}

function openListingDialog() {
  const session = getSession();
  if (!session) {
    setAuthMode("signup");
    openModal("authModal");
    $("#authRole").value = "provider";
    return;
  }
  if (session.role !== "provider") {
    showToast("Create or log in to a provider account to list surplus food.");
    return;
  }

  $("#providerName").value = session.name || "";
  const deadline = new Date(Date.now() + 3 * 3600000);
  deadline.setMinutes(deadline.getMinutes() - deadline.getTimezoneOffset());
  $("#foodDeadline").min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16);
  $("#foodDeadline").value = deadline.toISOString().slice(0, 16);
  $("#listingMessage").textContent = "";
  openModal("listingDialog");
}

function refreshPriceField() {
  const isFree = $("#foodOffer").value === "free";
  $("#priceField").classList.toggle("hidden", isFree);
  $("#foodPrice").required = !isFree;
}


async function submitAuth(event) {
  event.preventDefault();

  const email = $("#authEmail").value.trim().toLowerCase();
  const password = $("#authPassword").value;
  const message = $("#authMessage");

  message.classList.remove("error");
  message.textContent = "Please wait...";

  try {
    if (currentAuthMode === "signup") {
      const name = $("#authName").value.trim();
      const role = $("#authRole").value;

      if (!name) {
        message.textContent = "Please enter your name.";
        message.classList.add("error");
        return;
      }

      if (!["buyer", "provider"].includes(role)) {
        message.textContent =
          "Please select Buyer or Provider.";
        message.classList.add("error");
        return;
      }

      const { data, error } =
        await mealBridgeSupabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: role
            }
          }
        });

      if (error) throw error;

      if (!data.session) {
        message.classList.remove("error");
        message.textContent =
          "Account created! Check your email to confirm it, then sign in.";
        return;
      }

      message.textContent = "Account created successfully!";
    } else {
      const { error } =
        await mealBridgeSupabase.auth.signInWithPassword({
          email,
          password
        });

      if (error) throw error;
    }

    const { data: userData, error: userError } =
      await mealBridgeSupabase.auth.getUser();

    if (userError) throw userError;

    const user = userData.user;
    const metadata = user.user_metadata || {};

    const { data: profile } = await mealBridgeSupabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    const session = {
      id: user.id,
      name: profile?.full_name || metadata.full_name || "",
      email: user.email,
      role: profile?.role || metadata.role || "buyer"
    };

    writeStore(STORAGE.session, session);

    updateHeaderForSession();
    closeModal("authModal");
    $("#authForm").reset();

    showToast(
      `Welcome${session.name ? ", " + session.name : ""}!`
    );

    renderFoods();
  } catch (error) {
    message.textContent = error.message ||
      "Authentication failed. Please try again.";
    message.classList.add("error");
  }
}

function getFoodImage(foodName, category) {
  const food = `${foodName} ${category}`.toLowerCase();

  if (food.includes("chicken")) {
    return "photo-1603894584373-5ac82b2ae398";
  }

  if (food.includes("biryani")) {
    return "photo-1563379091339-03246963d51a";
  }

  if (food.includes("rice")) {
    return "photo-1516684732162-798a0062be99";
  }

  if (food.includes("curry")) {
    return "photo-1565557623262-b51c2513a641";
  }

  if (food.includes("pizza")) {
    return "photo-1513104890138-7c749659a591";
  }

  if (food.includes("burger")) {
    return "photo-1568901346375-23c9450c58cd";
  }

  if (food.includes("salad")) {
    return "photo-1512621776951-a57141f2eefd";
  }

  return "photo-1547592180-85f173990554";
}

async function submitListing(event) {
  event.preventDefault();

  const session = getSession();
  const message = $("#listingMessage");
  message.classList.remove("error");
  message.textContent = "";

  if (!session || session.role !== "provider") {
    message.textContent = "Please log in with a provider account.";
    message.classList.add("error");
    return;
  }

  const deadline = new Date($("#foodDeadline").value);
  const now = new Date();

  if (Number.isNaN(deadline.getTime()) || deadline <= now) {
    message.textContent = "Choose a future safe collection deadline.";
    message.classList.add("error");
    return;
  }

  const name = $("#foodName").value.trim();
  const provider = $("#providerName").value.trim();
  const category = $("#foodCategory").value;
  const offer = $("#foodOffer").value;
  const price = offer === "free" ? 0 : Number($("#foodPrice").value);
  const qty = Number($("#foodQty").value);
  const location = $("#foodLocation").value.trim();
  const notes = $("#foodSafety").value.trim();

  if (!name || !provider || !location) {
    message.textContent = "Please complete the food name, provider and location.";
    message.classList.add("error");
    return;
  }

  if (
    !Number.isInteger(qty) || qty < 1 || qty > 500 ||
    (offer === "discount" && (!Number.isFinite(price) || price <= 0))
  ) {
    message.textContent = "Check the price and quantity values.";
    message.classList.add("error");
    return;
  }

  message.textContent = "Saving your listing...";

  try {
    const { data: authData, error: authError } =
      await mealBridgeSupabase.auth.getUser();

    if (authError) throw authError;

    const user = authData.user;

    if (!user) {
      throw new Error("Your session expired. Please sign in again.");
    }

    console.log("Listing provider ID:", user.id);
    console.log("Listing profile role:", session.role);
    console.log("Listing provider ID:", user.id);
    console.log("Listing profile role:", session.role);
    const { data: savedFood, error } = await mealBridgeSupabase
      .from("food_listings")
      .insert({
        provider_id: user.id,
        food_name: name,
        description: notes ||
          "Listed by a local provider. Contact the provider to confirm collection details.",
        category: category,
        quantity: qty,
        available_quantity: qty,
        original_price: price === 0 ? 0 : Math.round(price * 1.5),
        offer_price: price,
        location: location,
        expires_at: deadline.toISOString(),
        status: "active"
      })
      .select()
      .single();

    if (error) throw error;

    const newFood = {
      id: savedFood.id,
      name: savedFood.food_name,
      provider: provider,
      category: savedFood.category,
      description: savedFood.description,
      price: Number(savedFood.offer_price),
      originalPrice: Number(savedFood.original_price),
      offer: Number(savedFood.offer_price) === 0 ? "free" : "discount",
      qty: savedFood.available_quantity,
      deadline: savedFood.expires_at,
      image: getFoodImage(savedFood.food_name, savedFood.category),
      icon: (provider[0] || "M").toUpperCase(),
      notes: notes,
      location: savedFood.location,
      demo: false,
      owner: user.email
    };

    foods.unshift(newFood);
    saveFoods();
    renderFoods();

    closeModal("listingDialog");
    $("#listingForm").reset();
    refreshPriceField();

    showToast("Food listing saved to MealBridge!");
    $("#discover").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("MealBridge listing error:", error);
    message.textContent =
      error.message || "Could not save your listing. Please try again.";
    message.classList.add("error");
  }
}

function logout() {
  localStorage.removeItem(STORAGE.session);
  updateHeaderForSession();
  showToast("You have logged out of this browser demo.");
}


async function showAccount() {
  try {
    // Get the currently logged-in Supabase user.
    const { data: userData, error: userError } =
      await mealBridgeSupabase.auth.getUser();

    if (userError || !userData.user) {
      showToast("Please log in to view your account.");
      return;
    }

    const user = userData.user;

    // Count this buyer's reservations in Supabase.
    const { count, error } = await mealBridgeSupabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("buyer_id", user.id);

    if (error) {
      console.error("My Account reservations error:", error);
      showToast("Could not load your reservations. Please try again.");
      return;
    }

    showToast(
      `Your account has ${count ?? 0} reservation(s).`
    );
  } catch (error) {
    console.error("My Account error:", error);
    showToast("Something went wrong while opening your account.");
  }
}


// Event delegation for buttons, including buttons rendered dynamically.
document.addEventListener("click", event => {
  const authButton = event.target.closest("[data-auth]");
  if (authButton) {
    const action = authButton.dataset.auth;
    $("#mobileNav").classList.remove("open");
    $("#menuToggle").setAttribute("aria-expanded", "false");

    if (action === "login" || action === "signup") {
      setAuthMode(action);
      openModal("authModal");
    } else if (action === "logout") {
      logout();
    } else if (action === "list") {
      openListingDialog();
    } else if (action === "account") {
      showAccount();
    }
    return;
  }

  const closeButton = event.target.closest("[data-close]");
  if (closeButton) {
    closeModal(closeButton.dataset.close);
    return;
  }

  const reserveButton = event.target.closest("[data-reserve]");
  if (reserveButton) {
    reserveFood(reserveButton.dataset.reserve);
    return;
  }

  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) {
    activeFilter = filterButton.dataset.filter;
    showAll = true;
    $$(".filter").forEach(button =>
      button.classList.toggle("active", button === filterButton)
    );
    renderFoods();
    return;
  }

  if (event.target.classList.contains("modal-backdrop")) {
    closeModal(event.target.id);
  }
});

$$(".auth-tab").forEach(button => {
  button.addEventListener("click", () => setAuthMode(button.dataset.mode));
});

$("#authForm").addEventListener("submit", submitAuth);
$("#listingForm").addEventListener("submit", submitListing);
$("#foodOffer").addEventListener("change", refreshPriceField);
$("#searchInput").addEventListener("input", () => {
  showAll = true;
  renderFoods();
});

$("#showAllBtn").addEventListener("click", () => {
  showAll = true;
  renderFoods();
});

$("#menuToggle").addEventListener("click", () => {
  const nav = $("#mobileNav");
  const open = nav.classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", String(open));
  $("#menuToggle").textContent = open ? "×" : "☰";
});

$$(".mobile-nav a").forEach(link => {
  link.addEventListener("click", () => {
    $("#mobileNav").classList.remove("open");
    $("#menuToggle").setAttribute("aria-expanded", "false");
    $("#menuToggle").textContent = "☰";
  });
});

$("#backTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    $$(".modal-backdrop:not(.hidden)").forEach(modal => closeModal(modal.id));
    $("#mobileNav").classList.remove("open");
    $("#menuToggle").setAttribute("aria-expanded", "false");
    $("#menuToggle").textContent = "☰";
  }
});

// Reveal sections as they enter the viewport.
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  $$(".section-heading, .food-card, .split-copy, .price-card").forEach(el => {
    el.classList.add("reveal");
    observer.observe(el);
  });
} else {
  $$(".reveal").forEach(el => el.classList.add("visible"));
}

window.addEventListener("scroll", () => {
  $("#backTop").classList.toggle("visible", window.scrollY > 450);
}, { passive: true });

// Make the sample collection deadlines meaningful while the demo is open.
setInterval(() => {
  renderFoods();
}, 60000);

refreshPriceField();
updateHeaderForSession();
renderFoods();

/* Temporary MealBridge database connection test */
(async function testMealBridgeConnection() {
  try {
    const { data, error } = await mealBridgeSupabase
      .from("food_listings")
      .select("id")
      .limit(1);

    if (error) {
      console.error("MealBridge database test failed:", error.message);
      return;
    }

    console.log("MealBridge connected to Supabase!", data);
  } catch (err) {
    console.error("Connection test failed:", err.message);
  }
})();

async function loadFoodListings() {
  try {
    const { data, error } = await mealBridgeSupabase
      .from("food_listings")
      .select("*")
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .gt("available_quantity", 0)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const realFoods = data.map(item => ({
      id: item.id,
      name: item.food_name,
      provider: "MealBridge Provider",
      category: item.category,
      description: item.description || "",
      price: Number(item.offer_price),
      originalPrice: Number(item.original_price),
      offer: Number(item.offer_price) === 0 ? "free" : "discount",
      qty: Number(item.available_quantity),
      deadline: item.expires_at,
      image: getFoodImage(item.food_name, item.category),
      icon: "M",
      notes: item.description || "",
      location: item.location || "",
      demo: false
    }));

    // Keep only genuine database listings for reservations.
    foods = realFoods;

    saveFoods();
    renderFoods();

    console.log("MealBridge listings loaded:", realFoods.length);
  } catch (error) {
    console.error("Could not load MealBridge listings:", error);
    showToast("Could not refresh food listings. Please try again.");
  }
}

loadFoodListings();