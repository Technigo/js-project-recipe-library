/*
---------------------------------------
| APP JS (single file, cleaned & fixed)
| Comments are in English
---------------------------------------
*/

/* ===============
   DOM REFERENCES / 
   =============== */
const filterItems = document.querySelectorAll(".filter__item");

const mainCoffee = document.querySelector(".main-coffee");
const mainJuice = document.querySelector(".main-juice");
const mainTea = document.querySelector(".main-tea");
const mainFavorites = document.querySelector(".main-favorites");

const containerCoffee = document.getElementById("coffee-container");
const containerJuice = document.getElementById("juice-container");
const containerTea = document.getElementById("tea-container");
const containerFavorites = document.getElementById("favorites-container");

const buttonCoffee = document.getElementById("button-coffee");
const buttonJuice = document.getElementById("button-juice");
const buttonTea = document.getElementById("button-tea");
const buttonFavorites = document.querySelectorAll(".button-favorites");
const buttons = [buttonCoffee, buttonJuice, buttonTea, ...buttonFavorites];

/* ==========================
   GLOBALS / CONFIG
   ========================== */

// LocalStorage keys
const LS_COFFEE = "coffeeData";
const LS_JUICE = "juiceData";
const LS_FAVORITES = "favorites";

// Render flags
let coffeeRendered = false;
let juiceRendered = false;

// Favorites state
let favorites = [];

/* =========================================================
   SECTION SECTION SECTION UTILITIES SECTION SECTION SECTION
   ========================================================= */

/* ==================================
   ⁉️ Sets "active" visual state on the clicked top-menu button
   ================================== */
function setActiveButton(activeBtn) {
  buttons.filter(Boolean).forEach((btn) => btn.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

/* ==================================
   Keeps only one specific card in the container,
   removes all others (used by Random function)
   ================================== */
function keepOnlyThisCard(container, cardEl) {
  container
    .querySelectorAll(
      ".cards__coffee-card, .cards__juice-card, .empty-card, .no-match-card"
    )
    .forEach((el) => {
      if (el !== cardEl) el.remove();
    });
  cardEl.style.display = "";
}

/* ==================================
   Reads and returns array from localStorage by key
   (returns empty array if key not found or invalid)
   ================================== */
function getCacheArray(key) {
  try {
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/* ==================================
   Picks a random element from array,
   excluding one with a specific id (used in Random)
   ================================== */
function pickRandomExcluding(arr, excludeId) {
  const pool = arr.filter((r) => String(r?.id) !== String(excludeId));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ==================================
   Detects cuisine based on API cuisines, title, or ingredients.
   Supports only: Italian, Asian, Middle Eastern, or Other.
   ================================== */
function detectCuisine3({
  cuisines = [],
  title = "",
  summary = "",
  ingredients = [],
}) {
  const api = (cuisines || []).map((s) => String(s).toLowerCase());
  if (api.some((c) => /italian/.test(c))) return "italian";
  if (
    api.some((c) =>
      /(asian|japanese|chinese|korean|thai|indian|vietnamese)/.test(c)
    )
  )
    return "asian";
  if (
    api.some((c) =>
      /(middle\s*eastern|arab|leban|turk|persian|iranian)/.test(c)
    )
  )
    return "middle eastern";

  const t = `${title} ${summary}`.toLowerCase();
  if (/(tiramisu|panna\s*cotta|cannoli|amaretto|mascarpone|ital|sicil)/.test(t))
    return "italian";
  if (
    /(mochi|matcha|dorayaki|anko|japan|japanese|ramen|udon|sushi|thai|kimchi|korean|chinese|indian|masala)/.test(
      t
    )
  )
    return "asian";
  if (
    /(baklava|kunafa|kanafeh|maamoul|halva|tahini|rose\s*water|orange\s*blossom|middle\s*east|arab|leban|turk|persian|iran)/.test(
      t
    )
  )
    return "middle eastern";

  const ing = ingredients.map((i) => String(i || "").toLowerCase()).join(" ");
  if (/(mascarpone|savoiardi|amaretto)/.test(ing)) return "italian";
  if (/(matcha|azuki|black\s*sesame|rice\s*flour)/.test(ing)) return "asian";
  if (/(tahini|date|rose\s*water|orange\s*blossom|cardamom)/.test(ing))
    return "middle eastern";

  return "other";
}

/* ==================================
   Converts internal cuisine key to label for UI
   ================================== */

function cuisineLabel3(key) {
  switch (key) {
    case "italian":
      return "Italy";
    case "asian":
      return "Asian";
    case "middle eastern":
      return "Middle East";
    default:
      return "Other";
  }
}

/* ==================================
   ⁉️ Converts any value to number safely (NaN → 0)
   ================================== */

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* ==================================
   ⁉️ Fetches JSON and throws on HTTP error
   ================================== */
function fetchJSON(url) {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}

/* ==================================
   ⁉️ Saves value to localStorage as JSON string
   ================================== */
function cacheSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ==================================
   ⁉️ Loads value from localStorage and parses JSON
   ================================== */
function cacheGet(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

/* ==================================
   Loads favorites array from localStorage (safe)
   ================================== */
function ensureFavoritesLoaded() {
  try {
    const data = JSON.parse(localStorage.getItem(LS_FAVORITES) || "[]");
    favorites = Array.isArray(data) ? data : [];
  } catch {
    favorites = [];
  }
}

/* ==================================
   Shows "No matches" banner if all cards hidden
   ================================== */
function ensureNoMatchBanner(container) {
  const cards = Array.from(
    container.querySelectorAll(".cards__coffee-card, .cards__juice-card")
  ).filter((el) => !el.classList.contains("empty-card"));

  const anyVisible = cards.some(
    (c) => c.style.display !== "none" && c.offsetParent !== null
  );
  let banner = container.querySelector(".no-match-card");

  if (!anyVisible) {
    if (!banner) {
      banner = document.createElement("div");
      banner.className = "no-match-card empty-card";
      banner.innerHTML = `
        <div class="empty-card__box">
          <h2>🥺 Oops</h2>
          <p>No recipes matched your filter.</p>
        </div>`;
      container.appendChild(banner);
    }
  } else {
    banner?.remove();
  }
}

/* =======================================================
    SECTION SECTION SECTION STARTUP SECTION SECTION SECTION
   ======================================================= */

// Which section is visible right now?
function getCurrentCategory() {
  if (mainCoffee && !mainCoffee.classList.contains("hidden")) return "coffee";
  if (mainJuice && !mainJuice.classList.contains("hidden")) return "juice";
  if (mainTea && !mainTea.classList.contains("hidden")) return "tea";
  return "coffee";
}

window.addEventListener("DOMContentLoaded", () => {
  seedIfEmpty(LS_COFFEE, DEMO_CAKES);
  seedIfEmpty(LS_JUICE, DEMO_DESSERTS);

  console.log("LS_COFFEE after seed:", cacheGet(LS_COFFEE));
  console.log("LS_JUICE after seed:", cacheGet(LS_JUICE));

  setActiveButton(buttonCoffee);
  mainJuice?.classList.add("hidden");
  mainTea?.classList.add("hidden");
  mainFavorites?.classList.add("hidden");

  ensureFavoritesLoaded();
  renderFavorites();

  // ✅ На старте рендерим только активную секцию (coffee)
  renderCoffeeCards();

  // ❌ НЕ вызывать здесь: renderJuiceCards();
  //    Вызовем лениво при клике на кнопку Juice:
});

//Turn on COFFEE container and turn off the others
buttonCoffee?.addEventListener("click", () => {
  mainCoffee?.classList.remove("hidden");
  mainJuice?.classList.add("hidden");
  mainTea?.classList.add("hidden");
  mainFavorites?.classList.add("hidden");
  setActiveButton(buttonCoffee);
});

//Turn on JUICE container and turn off the others
buttonJuice?.addEventListener("click", () => {
  mainCoffee?.classList.add("hidden");
  mainJuice?.classList.remove("hidden");
  mainTea?.classList.add("hidden");
  mainFavorites?.classList.add("hidden");
  setActiveButton(buttonJuice);

  renderJuiceCards();
});

//Turn on TEA container and turn off the others
buttonTea?.addEventListener("click", () => {
  mainCoffee?.classList.add("hidden");
  mainJuice?.classList.add("hidden");
  mainTea?.classList.remove("hidden");
  mainFavorites?.classList.add("hidden");
  setActiveButton(buttonTea);
});

//Turn on FAVORITES container and turn off the others
buttonFavorites.forEach((btn) => {
  btn.addEventListener("click", () => {
    mainCoffee?.classList.add("hidden");
    mainJuice?.classList.add("hidden");
    mainTea?.classList.add("hidden");
    mainFavorites?.classList.remove("hidden");
    setActiveButton(btn);
  });
});

/* ==================================
   SECTION DEMO DEMO DEMO
   ==================================*/

const DEMO_CAKES = [
  {
    id: "demo_1",
    title: "Tiramisu",
    image:
      "https://plus.unsplash.com/premium_photo-1713447395823-2e0b40b75a89?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    readyInMinutes: 30,
    extendedIngredients: [{ name: "mascarpone" }, { name: "espresso" }],
    cuisines: ["Asian"],
    aggregateLikes: 30,
  },
  console.log(aggregateLikes),
  {
    id: "demo_2",
    title: "Tiramisu",
    image:
      "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987",
    readyInMinutes: 20,
    extendedIngredients: [{ name: "mascarpone" }, { name: "espresso" }],
    cuisines: ["middle eastern"],
    aggregateLikes: 20,
  },
  {
    id: "demo_3",
    title: "Tiramisu",
    image:
      "https://plus.unsplash.com/premium_photo-1667824363471-733bbbca0d0d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987",
    readyInMinutes: 10,
    extendedIngredients: [{ name: "mascarpone" }, { name: "espresso" }],
    cuisines: ["Italian"],
    aggregateLikes: 10,
  },
  {
    id: "demo_4",
    title: "Tiramisu",
    image:
      "https://plus.unsplash.com/premium_photo-1663924211686-677f4114cef1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1887",
    readyInMinutes: 15,
    extendedIngredients: [{ name: "mascarpone" }, { name: "espresso" }],
    cuisines: ["Italian"],
    aggregateLikes: 15,
  },
  {
    id: "demo_5",
    title: "Tiramisu",
    image:
      "https://images.unsplash.com/photo-1476887334197-56adbf254e1a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987",
    readyInMinutes: 25,
    extendedIngredients: [{ name: "mascarpone" }, { name: "espresso" }],
    cuisines: ["Italian"],
    aggregateLikes: 25,
  },
];

const DEMO_DESSERTS = [
  {
    id: "demo_1",
    title: "Fruit desser",
    image:
      "https://images.unsplash.com/photo-1591626505027-a4992d84d28b?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    readyInMinutes: 30,
    extendedIngredients: [{ name: "mascarpone" }, { name: "espresso" }],
    cuisines: ["Asian"],
    aggregateLikes: 30,
  },
  {
    id: "demo_2",
    title: "Fruit desser",
    image:
      "https://images.unsplash.com/photo-1750680230074-a2046d59ba02?q=80&w=927&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    readyInMinutes: 20,
    extendedIngredients: [{ name: "mascarpone" }, { name: "espresso" }],
    cuisines: ["middle eastern"],
    aggregateLikes: 20,
  },
  {
    id: "demo_3",
    title: "Fruit desser",
    image:
      "https://plus.unsplash.com/premium_photo-1661266841331-e2169199de65?q=80&w=1734&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    readyInMinutes: 10,
    extendedIngredients: [{ name: "mascarpone" }, { name: "espresso" }],
    cuisines: ["Italian"],
    aggregateLikes: 10,
  },
  {
    id: "demo_4",
    title: "Fruit desser",
    image:
      "https://plus.unsplash.com/premium_photo-1714662390686-eacb5268b41c?q=80&w=988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    readyInMinutes: 15,
    extendedIngredients: [{ name: "mascarpone" }, { name: "espresso" }],
    cuisines: ["Italian"],
    aggregateLikes: 15,
  },
  {
    id: "demo_5",
    title: "Fruit dessert",
    image:
      "https://plus.unsplash.com/premium_photo-1714146022660-d9c01e9e6c8c?q=80&w=988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    readyInMinutes: 25,
    extendedIngredients: [{ name: "mascarpone" }, { name: "espresso" }],
    cuisines: ["Italian"],
    aggregateLikes: 25,
  },
];

function seedIfEmpty(storageKey, demoArray) {
  const cur = cacheGet(storageKey);
  if (!Array.isArray(cur) || cur.length === 0) {
    cacheSet(storageKey, demoArray);
  }
}

/* ==================================
   SECTION RENDER: COFFEE ☕☕☕ (Desserts)
   ==================================*/

// Cache-first render for "Coffee" (cakes)
async function renderCoffeeCards() {
  if (coffeeRendered) return;
  coffeeRendered = true;
  if (containerCoffee) containerCoffee.innerHTML = "";

  // 1) сразу показываем кэш (включая DEMO_CAKES)
  const cached = cacheGet(LS_COFFEE);
  if (Array.isArray(cached) && cached.length) {
    cached.forEach(addCoffeeCard);
  }

  // 2) пытаемся обновить из сети (может прийти 402)
  try {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=cake&includeIngredients=coffee&addRecipeInformation=true&number=15&apiKey=003fb0433f9c48348cea44cc791555a4`;
    const data = await fetchJSON(url);
    const arr = data.results || [];

    if (arr.length) {
      cacheSet(LS_COFFEE, arr);

      // если раньше кэша не было — перерисуем новыми данными
      if (!cached || !cached.length) {
        containerCoffee.innerHTML = "";
        arr.forEach(addCoffeeCard);
      }
    } else if (!cached || !cached.length) {
      showEmptyCoffeeCard();
    }
  } catch (err) {
    if (!cached || !cached.length) {
      const code = String(err?.message || "");
      if (code.startsWith("HTTP_402") || code.startsWith("HTTP_429")) {
        showEmptyCoffeeCard();
      } else if (code.startsWith("HTTP_401")) {
        showEmptyCoffeeCard();
      } else {
        showEmptyCoffeeCard();
      }
    }
  }

  ensureNoMatchBanner(containerCoffee);
}

function addCoffeeCard(r) {
  const cuisineKey = detectCuisine3({
    cuisines: r.cuisines || [],
    title: r.title || "",
    summary: r.summary || "",
    ingredients: (r.extendedIngredients || []).map((i) => i.name),
  });
  const cuisineText = cuisineLabel3(cuisineKey);

  const card = document.createElement("div");
  card.classList.add("cards__coffee-card");
  card.dataset.id = String(r.id);
  card.dataset.cuisine = cuisineKey;
  card.dataset.cooking = String(r.readyInMinutes ?? "0"); // used for speed sort
  card.dataset.popularity = String(r.aggregateLikes ?? 0);

  card.innerHTML = `
    <img src="${r.image}" alt="${r.title}" class="cards__coffee-card__img">
    <h2 class="cards__coffee-card__title">${r.title}</h2>
    <span class="divider"></span>
    <div>
      <p class="cards__coffee-card__meta"><span class="text-bold">Cuisine:</span> ${cuisineText}</p>
      <p class="cards__coffee-card__time"><span class="text-bold">Cooking time:</span> ${
        r.readyInMinutes ?? "N/A"
      } min</p>
      <p class="cards__coffee-card__time"><span class="text-bold">Popularity:</span> ${
        r.aggregateLikes ?? 0
      }</p>
    </div>
    <span class="divider"></span>
    <div>
      <h3 class="cards__coffee-card__subtitle">Ingredients:</h3>
      <ul class="cards__coffee-card__ingredients">
        ${
          r.extendedIngredients?.map((i) => `<li>${i.name}</li>`).join("") ?? ""
        }
      </ul>
    </div>
  `;

  if (favorites.some((f) => f.id === String(r.id)))
    card.classList.add("active");
  card.addEventListener("click", () => toggleFavoriteCard(card));
  containerCoffee?.appendChild(card);
}

function showEmptyCoffeeCard() {
  const emptyCard = document.createElement("div");
  emptyCard.classList.add("cards__coffee-card", "empty-card");
  emptyCard.innerHTML = `
    <div class="empty-card__box">
      <h2>🍰 Oops! API limit reached 😅</h2>
      <p>Looks like we’ve hit the maximum number of requests for today. Try again later or use local recipes!</p>
    </div>
  `;
  containerCoffee?.appendChild(emptyCard);
}

/* ==================================
   SECTION RENDER: JUICE 🍇🍌🍊🍎 (Desserts)
   ================================== */
// Cache-first render for "Juice" (fruit desserts)

// Cache-first render for "Juice" (fruit desserts)
async function renderJuiceCards() {
  if (juiceRendered) return;
  juiceRendered = true;
  if (containerJuice) containerJuice.innerHTML = "";

  // 1) сразу показываем кэш (LS_JUICE)
  const cached = cacheGet(LS_JUICE);
  if (Array.isArray(cached) && cached.length) {
    cached.forEach(addJuiceCard);
  }

  // 2) потом пробуем сеть (может прийти 402/429)
  try {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=cake&includeIngredients=fruit&addRecipeInformation=true&number=15&apiKey=003fb0433f9c48348cea44cc791555a4`;
    const data = await fetchJSON(url);
    const arr = data.results || [];

    if (arr.length) {
      cacheSet(LS_JUICE, arr);

      // если кэша не было — перерисуем свежими данными
      if (!cached || !cached.length) {
        containerJuice.innerHTML = "";
        arr.forEach(addJuiceCard);
      }
      // если кэш уже был — оставляем как есть, чтобы не мигало
    } else if (!cached || !cached.length) {
      // пусто и сети нет — показываем заглушку
      showEmptyJuiceCard(); // или showEmptyCard(containerJuice, "...", "...")
    }
  } catch (err) {
    if (!cached || !cached.length) {
      const code = String(err?.message || "");
      if (code.startsWith("HTTP_402") || code.startsWith("HTTP_429")) {
        showEmptyJuiceCard();
      } else if (code.startsWith("HTTP_401")) {
        showEmptyJuiceCard();
      } else if (code === "NETWORK") {
        showEmptyJuiceCard();
      } else {
        showEmptyJuiceCard();
      }
    }
  }

  ensureNoMatchBanner(containerJuice);
}

function addJuiceCard(r) {
  const cuisineKey = detectCuisine3({
    cuisines: r.cuisines || [],
    title: r.title || "",
    summary: r.summary || "",
    ingredients: (r.extendedIngredients || []).map((i) => i.name),
  });
  const cuisineText = cuisineLabel3(cuisineKey);

  const card = document.createElement("div");
  card.classList.add("cards__coffee-card");
  card.dataset.id = String(r.id);
  card.dataset.cuisine = cuisineKey;
  card.dataset.cooking = String(r.readyInMinutes ?? "0"); // used for speed sort
  card.dataset.popularity = String(r.aggregateLikes ?? 0);

  card.innerHTML = `
    <img src="${r.image}" alt="${r.title}" class="cards__juice-card__img">
    <h2 class="cards__juice-card__title">${r.title}</h2>
    <span class="divider"></span>
    <div>
      <p class="cards__juice-card__meta"><span class="text-bold">Cuisine:</span> ${cuisineText}</p>
      <p class="cards__juice-card__time"><span class="text-bold">Cooking time:</span> ${
        r.readyInMinutes ?? "N/A"
      } min</p>
      <p class="cards__juice-card__time"><span class="text-bold">Popularity:</span> ${
        r.aggregateLikes ?? 0
      }</p>
    </div>
    <span class="divider"></span>
    <div>
      <h3 class="cards__juice-card__subtitle">Ingredients:</h3>
      <ul class="cards__juice-card__ingredients">
        ${
          r.extendedIngredients?.map((i) => `<li>${i.name}</li>`).join("") ?? ""
        }
      </ul>
    </div>
  `;

  if (favorites.some((f) => f.id === String(r.id)))
    card.classList.add("active");
  card.addEventListener("click", () => toggleFavoriteCard(card));
  containerJuice?.appendChild(card);
}

function showEmptyJuiceCard() {
  const emptyCard = document.createElement("div");
  emptyCard.classList.add("cards__juice-card", "empty-card");
  emptyCard.innerHTML = `
    <div class="empty-card__box">
      <h2>🍰 Oops! API limit reached 😅</h2>
      <p>Looks like we’ve hit the maximum number of requests for today. Try again later or use local recipes!</p>
    </div>
  `;
  containerJuice?.appendChild(emptyCard);
}

/* ==========================================
   SECTION FAVORITES ❤️❤️❤️(save / render / toggle)
   ========================================== */
function toggleFavoriteCard(cardEl) {
  const recipeId = String(cardEl.dataset.id || "");
  if (!recipeId) {
    console.warn("No data-id on card");
    return;
  }

  const index = favorites.findIndex((f) => f.id === recipeId);

  if (index === -1) {
    favorites.push({
      id: recipeId,
      innerHTML: cardEl.innerHTML,
      className: cardEl.className,
    });
    cardEl.classList.add("active");
  } else {
    favorites.splice(index, 1);
    cardEl.classList.remove("active");
  }

  localStorage.setItem(LS_FAVORITES, JSON.stringify(favorites));
  renderFavorites();
}

function renderFavorites() {
  if (!containerFavorites) return;

  containerFavorites.innerHTML = "";
  if (!favorites.length) {
    containerFavorites.innerHTML = `
      <div class="cardFavorites">No favorites yet 💔</div>
    `;
    return;
  }

  favorites.forEach((f) => {
    const favCard = document.createElement("div");
    favCard.className = f.className;
    favCard.innerHTML = f.innerHTML;
    favCard.dataset.id = String(f.id);
    favCard.addEventListener("click", () => toggleFavoriteCard(favCard));
    containerFavorites.appendChild(favCard);
  });
}

/* ====================================================================
   SECTION FILTERS / SORTING (single .filters block) BUTTON BUTTON BUTTON
   ==================================================================== */
let speedDescending = true;
let popularityDescending = true;

filterItems.forEach((item) => {
  item.addEventListener("click", async () => {
    const type = item.dataset.type; // 'cuisine', 'sort', etc.
    const value = item.dataset.value;

    // Visual "active" state inside the same <ul>
    item.parentElement
      ?.querySelectorAll(".filter__item")
      .forEach((li) => li.classList.remove("active"));
    item.classList.add("active");

    // Work against the currently visible category
    const category = getCurrentCategory();
    const container =
      category === "coffee"
        ? containerCoffee
        : category === "juice"
        ? containerJuice
        : containerTea;

    if (!container) return;

    // Sorting: speed -> by data-cooking
    if (type === "sort" && value === "speed") {
      speedDescending = !speedDescending;
      item.textContent = speedDescending ? "Descending" : "Ascending";
      sortCards(container, "cooking", speedDescending);
      return;
    }

    // Sorting: popularity -> by data-popularity
    if (type === "sort" && value === "popular") {
      popularityDescending = !popularityDescending;
      item.textContent = popularityDescending ? "More popular" : "Less popular";
      sortCards(container, "popularity", popularityDescending);
      return;
    }

    // Sorting: random -> fetch new random card for current category
    if (type === "sort" && value === "random") {
      await fetchRandomCard(category);
      return;
    }

    // Filtering: cuisine (pipe-separated) or generic
    filterCards(container, type, value);
  });
});

function filterCards(container, type, value) {
  const cards = container.querySelectorAll(
    ".cards__coffee-card, .cards__juice-card"
  );

  if (type === "cuisine") {
    const wanted = (value || "all").toLowerCase();
    cards.forEach((card) => {
      if (wanted === "all") {
        card.style.display = "";
        return;
      }
      const list = (card.dataset.cuisine || "")
        .toLowerCase()
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      card.style.display = list.includes(wanted) ? "" : "none";
    });
    ensureNoMatchBanner(container);
    return;
  }

  // Generic fallback (for future data-keys)
  cards.forEach((card) => {
    card.style.display =
      value === "all" || card.dataset[type] == value ? "" : "none";
  });
}

function sortCards(container, field, descending) {
  const cards = Array.from(
    container.querySelectorAll(".cards__coffee-card, .cards__juice-card")
  );
  cards.sort((a, b) => {
    const aVal = toNum(a.dataset[field]);
    const bVal = toNum(b.dataset[field]);
    return descending ? bVal - aVal : aVal - bVal;
  });
  cards.forEach((card) => container.appendChild(card));
}

/* ==================================================================
  SECTION RANDOM PICK (real random + fallbacks) BUTTON BUTTON BUTTON
   ================================================================== */
function getCardById(container, id) {
  return (
    container?.querySelector(`[data-id="${CSS.escape(String(id))}"]`) || null
  );
}

function pickRandomFromStorage(storageKey) {
  try {
    const arr = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(arr) || !arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  } catch {
    return null;
  }
}

function pickRandomFromRendered(container) {
  const cards = container?.querySelectorAll(
    ".cards__coffee-card, .cards__juice-card"
  );
  if (!cards || !cards.length) return null;
  return cards[Math.floor(Math.random() * cards.length)];
}

async function fetchRandomCard(category) {
  const isCoffee = category === "coffee";
  const container = isCoffee ? containerCoffee : containerJuice;
  if (!container) return;

  // текущая видимая карточка (если есть)
  const visible = Array.from(
    container.querySelectorAll(".cards__coffee-card, .cards__juice-card")
  ).filter(
    (el) => el.offsetParent !== null && !el.classList.contains("empty-card")
  );

  const currentId =
    visible.length === 1 ? String(visible[0].dataset.id || "") : "";

  // 1) пробуем взять ДРУГУЮ из кэша
  const storageKey = isCoffee ? LS_COFFEE : LS_JUICE;
  const cacheArr = getCacheArray(storageKey);
  const otherFromCache = pickRandomExcluding(cacheArr, currentId);

  if (otherFromCache) {
    // очищаем контейнер и показываем ровно 1 новую
    container
      .querySelectorAll(
        ".cards__coffee-card, .cards__juice-card, .empty-card, .no-match-card"
      )
      .forEach((el) => el.remove());
    (isCoffee ? addCoffeeCard : addJuiceCard)(otherFromCache);
    const added = container.lastElementChild;
    if (added) {
      added.classList.add("pulse");
      setTimeout(() => added.classList.remove("pulse"), 800);
      added.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  // 2) если в кэше только одна карточка (или он пуст), пробуем сеть (может дать 402)
  try {
    const query = isCoffee ? "cake" : "dessert";
    const url = `${SPOON_BASE}/recipes/complexSearch?query=${encodeURIComponent(
      query
    )}&addRecipeInformation=true&number=1&offset=${Math.floor(
      Math.random() * 50
    )}&apiKey=${API_KEY}`;
    const data = await fetchJSON(url);
    const recipe = data.results?.[0];

    if (recipe && String(recipe.id) !== currentId) {
      container
        .querySelectorAll(
          ".cards__coffee-card, .cards__juice-card, .empty-card, .no-match-card"
        )
        .forEach((el) => el.remove());
      (isCoffee ? addCoffeeCard : addJuiceCard)(recipe);
      const added = container.lastElementChild;
      if (added) {
        added.classList.add("pulse");
        setTimeout(() => added.classList.remove("pulse"), 800);
        added.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
  } catch (e) {
    const code = String(e?.message || "");
    if (code.startsWith("HTTP_402") || code.startsWith("HTTP_429")) {
      container
        .querySelectorAll(
          ".cards__coffee-card, .cards__juice-card, .no-match-card"
        )
        .forEach((el) => el.remove());
      showEmptyCard(
        container,
        "⏳ Random unavailable",
        "API limit reached — try again after reset."
      );
      return;
    }
  }

  // 3) если совсем нечего менять — просто подчёркиваем текущую
  if (visible[0]) {
    visible[0].classList.add("pulse");
    setTimeout(() => visible[0].classList.remove("pulse"), 800);
    visible[0].scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    showEmptyCard(container, "😕 Nothing to pick", "Load some recipes first.");
  }
}
