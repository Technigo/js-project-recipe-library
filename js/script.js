const filterItems = document.querySelectorAll(".filter__item");

const mainCoffee = document.querySelector(".main-coffee");
const mainFruits = document.querySelector(".main-fruites");
const mainChocolate = document.querySelector(".main-chocolate");
const mainFavorites = document.querySelector(".main-favorites");

const containerCoffee = document.getElementById("coffee-container");
const containerFruit = document.getElementById("fruit-container");
const containerFavorites = document.getElementById("favorites-container");

const buttonCoffee = document.getElementById("button-coffee");
const buttonFruit = document.getElementById("button-fruit");
const buttonFavorites = document.querySelectorAll(".button-favorites");
const buttons = [buttonCoffee, buttonFruit, ...buttonFavorites];

const LS_COFFEE = "coffeeData";
const LS_FRUITS = "juiceData";
const LS_FAVORITES = "favorites";

const API_KEY = "003fb0433f9c48348cea44cc791555a4";
const SPOON_BASE = "https://api.spoonacular.com";

let coffeeRendered = false;
let fruitsRendered = false;

let favorites = [];

/* =========================================================
   SECTION SECTION SECTION UTILITIES SECTION SECTION SECTION
   ========================================================= */

function setActiveButton(activeBtn) {
  buttons.filter(Boolean).forEach((btn) => btn.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

function getCacheArray(key) {
  try {
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function pickRandomExcluding(arr, excludeId) {
  const pool = arr.filter((r) => String(r?.id) !== String(excludeId));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function detectCuisine(recipe) {
  if (recipe.cuisines && recipe.cuisines.length > 0) {
    const cuisine = recipe.cuisines[0].toLowerCase();

    if (cuisine.includes("british")) return "british";
    if (cuisine.includes("chinese")) return "chinese";
    if (cuisine.includes("indian")) return "indian";
  }

  return "international";
}

function cuisineLabel(key) {
  const labels = {
    british: "British",
    chinese: "Chinese",
    indian: "Indian",
    international: "International",
  };
  return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

function cuisineLabel3(key) {
  switch (key.toLowerCase()) {
    case "british":
      return "British";
    case "chinese":
      return "Chinese";
    case "indian":
      return "Indian";
    default:
      return key.charAt(0).toUpperCase() + key.slice(1);
  }
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fetchJSON(url) {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}

function cacheSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function cacheGet(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function ensureFavoritesLoaded() {
  try {
    const data = JSON.parse(localStorage.getItem(LS_FAVORITES) || "[]");
    favorites = Array.isArray(data) ? data : [];
    console.log("📋 Loaded favorites:", favorites.length);
  } catch {
    favorites = [];
    console.log("📋 No favorites found");
  }
}

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

function getCurrentCategory() {
  if (mainCoffee && !mainCoffee.classList.contains("hidden")) return "coffee";
  if (mainFruits && !mainFruits.classList.contains("hidden")) return "juice";
  if (mainFavorites && !mainFavorites.classList.contains("hidden"))
    return "favorites";
  return "coffee";
}

window.addEventListener("DOMContentLoaded", () => {
  seedIfEmpty(LS_COFFEE, DEMO_CAKES);
  seedIfEmpty(LS_FRUITS, DEMO_DESSERTS);

  console.log("=== 🎯 TEACHER DEMO READY ===");
  console.log("LS_COFFEE:", cacheGet(LS_COFFEE)?.length, "items");
  console.log("LS_FRUITS:", cacheGet(LS_FRUITS)?.length, "items");

  setActiveButton(buttonCoffee);
  mainFruits?.classList.add("hidden");
  mainChocolate?.classList.add("hidden");
  mainFavorites?.classList.add("hidden");

  ensureFavoritesLoaded();
  renderFavorites();
  renderCoffeeCards();

  setTimeout(() => {
    console.log("=== 🔍 FILTER DEBUG INFO ===");
    debugFilters();
    console.log("=== 🎯 READY FOR TEACHER TESTING ===");
    console.log("Filters should work now with demo data!");
  }, 1000);
});

buttonCoffee?.addEventListener("click", () => {
  mainCoffee?.classList.remove("hidden");
  mainFruits?.classList.add("hidden");
  mainChocolate?.classList.add("hidden");
  mainFavorites?.classList.add("hidden");
  setActiveButton(buttonCoffee);
});

buttonFruit?.addEventListener("click", () => {
  mainCoffee?.classList.add("hidden");
  mainFruits?.classList.remove("hidden");
  mainChocolate?.classList.add("hidden");
  mainFavorites?.classList.add("hidden");
  setActiveButton(buttonFruit);

  renderFruitCards();
});

buttonFavorites.forEach((btn) => {
  btn.addEventListener("click", () => {
    mainCoffee?.classList.add("hidden");
    mainFruits?.classList.add("hidden");
    mainChocolate?.classList.add("hidden");
    mainFavorites?.classList.remove("hidden");
    setActiveButton(btn);
  });
});

function debugFilters() {
  console.log("🐛 DEBUG FILTERS:");

  const containers = [containerCoffee, containerFruit, containerFavorites];
  containers.forEach((container, index) => {
    if (!container) return;

    const cards = container.querySelectorAll(
      ".cards__coffee-card, .cards__juice-card"
    );
    console.log(`Container ${index}: ${cards.length} cards`);

    cards.forEach((card) => {
      const title = card.querySelector("h2")?.textContent;
      const cuisine = card.dataset.cuisine;
      console.log(`  📋 "${title}": cuisine = "${cuisine}"`);
    });
  });

  const allCards = document.querySelectorAll(
    ".cards__coffee-card, .cards__juice-card"
  );
  const cuisineCount = {};
  allCards.forEach((card) => {
    const cuisine = card.dataset.cuisine || "unknown";
    cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
  });
  console.log("📊 Cuisine distribution:", cuisineCount);
}

/* ==================================
   SECTION DEMO DEMO DEMO
   ==================================*/

const DEMO_CAKES = [
  {
    id: "demo_1",
    title: "Tiramisu Cake",
    image:
      "https://plus.unsplash.com/premium_photo-1713447395823-2e0b40b75a89?fm=jpg&q=60&w=3000",
    readyInMinutes: 30,
    cuisines: ["British"],
    aggregateLikes: 30,
  },
  {
    id: "demo_2",
    title: "Chocolate Cake",
    image:
      "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&q=80&w=987",
    readyInMinutes: 45,
    cuisines: ["Chinese"],
    aggregateLikes: 25,
  },
  {
    id: "demo_3",
    title: "Vanilla Sponge Cake",
    image:
      "https://plus.unsplash.com/premium_photo-1667824363471-733bbbca0d0d?auto=format&fit=crop&q=80&w=987",
    readyInMinutes: 35,
    cuisines: ["Indian"],
    aggregateLikes: 20,
  },
  {
    id: "demo_4",
    title: "Lemon Drizzle Cake",
    image:
      "https://plus.unsplash.com/premium_photo-1663924211686-677f4114cef1?auto=format&fit=crop&q=80&w=1887",
    readyInMinutes: 40,
    cuisines: ["British"],
    aggregateLikes: 15,
  },
  {
    id: "demo_5",
    title: "Carrot Cake",
    image:
      "https://images.unsplash.com/photo-1476887334197-56adbf254e1a?auto=format&fit=crop&q=80&w=987",
    readyInMinutes: 50,
    cuisines: ["Chinese"],
    aggregateLikes: 28,
  },
];

const DEMO_DESSERTS = [
  {
    id: "demo_1",
    title: "Fruit Tart",
    image:
      "https://images.unsplash.com/photo-1591626505027-a4992d84d28b?auto=format&fit=crop&q=80&w=1035",
    readyInMinutes: 30,
    cuisines: ["British"],
    aggregateLikes: 30,
  },
  {
    id: "demo_2",
    title: "Chocolate Mousse",
    image:
      "https://images.unsplash.com/photo-1750680230074-a2046d59ba02?auto=format&fit=crop&q=80&w=927",
    readyInMinutes: 20,
    cuisines: ["Chinese"],
    aggregateLikes: 25,
  },
  {
    id: "demo_3",
    title: "Vanilla Pudding",
    image:
      "https://plus.unsplash.com/premium_photo-1661266841331-e2169199de65?auto=format&fit=crop&q=80&w=1734",
    readyInMinutes: 15,
    cuisines: ["Indian"],
    aggregateLikes: 20,
  },
  {
    id: "demo_4",
    title: "Apple Pie",
    image:
      "https://plus.unsplash.com/premium_photo-1714662390686-eacb5268b41c?auto=format&fit=crop&q=80&w=988",
    readyInMinutes: 45,
    cuisines: ["British"],
    aggregateLikes: 22,
  },
  {
    id: "demo_5",
    title: "Berry Parfait",
    image:
      "https://plus.unsplash.com/premium_photo-1714146022660-d9c01e9e6c8c?auto=format&fit=crop&q=80&w=988",
    readyInMinutes: 25,
    cuisines: ["Chinese"],
    aggregateLikes: 18,
  },
];

async function checkAPIHealth() {
  const urls = [
    "https://api.spoonacular.com/recipes/random?number=1&apiKey=f9a94c32c70844888eebfba758e10f35",
    "https://api.spoonacular.com/recipes/complexSearch?query=cake&number=1&apiKey=f9a94c32c70844888eebfba758e10f35",
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      console.log(`🔍 ${url}: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ API работает, получены данные");
        return true;
      } else {
        console.log(`❌ API ошибка: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log("❌ Сетевая ошибка:", error.message);
      return false;
    }
  }
}

function seedIfEmpty(storageKey, demoArray) {
  console.log(`🌱 FORCE loading demo data to ${storageKey}`);
  cacheSet(storageKey, demoArray);

  const loaded = cacheGet(storageKey);
  console.log(`✅ ${storageKey} now has:`, loaded.length, "items");
}

/* ==================================
   SECTION RENDER: COFFEE ☕☕☕ (Desserts)
   ==================================*/

async function renderCoffeeCards() {
  if (coffeeRendered) return;
  coffeeRendered = true;
  if (containerCoffee) containerCoffee.innerHTML = "";

  // ВСЕГДА показываем демо-данные ПЕРВЫМИ
  const cached = cacheGet(LS_COFFEE);
  console.log("📦 Cached coffee data:", cached);

  if (Array.isArray(cached) && cached.length) {
    console.log("✅ Showing cached/demo data");
    cached.forEach(addCoffeeCard);
  }

  // API запрос - только как БОНУС, если работает
  try {
    const url = `https://api.spoonacular.com/recipes/random?number=4&apiKey=${API_KEY}&type=dessert`;
    console.log("🌐 Trying API as bonus...");

    const data = await fetchJSON(url);
    const arr = data.results || [];
    console.log("📥 API response:", arr);

    if (arr.length) {
      console.log("🎉 API worked! Adding to existing data");
      // Добавляем API данные к существующим демо-данным
      arr.forEach(addCoffeeCard);
      // Обновляем кэш
      cacheSet(LS_COFFEE, [...cached, ...arr]);
    }
  } catch (err) {
    console.log("⚠️ API failed, but we have demo data - filters will work!");
    // НЕ показываем ошибку - у нас есть демо-данные
  }

  ensureNoMatchBanner(containerCoffee);

  // Сразу показываем отладочную информацию
  setTimeout(debugFilters, 500);
}

function addCoffeeCard(r) {
  console.log("🔍 Rendering card:", {
    title: r.title,
    hasIngredients: !!r.extendedIngredients,
    ingredientsCount: r.extendedIngredients?.length,
    ingredients: r.extendedIngredients,
  });
  const cuisineKey = detectCuisine({
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
  card.dataset.cooking = String(r.readyInMinutes ?? "0");
  card.dataset.popularity = String(r.aggregateLikes ?? 0);

  card.innerHTML = `
    <img src="${r.image}" alt="${r.title}" class="cards__coffee-card__img">
    <h2 class="cards__coffee-card__title">${r.title
      .split(" ")
      .slice(0, 2)
      .join(" ")}</h2>
    <span class="divider"></span>
    <div>
      <p class="cards__coffee-card__meta"><span class="text-bold">Cuisine: </span>${cuisineText}</p>
      <p class="cards__coffee-card__time"><span class="text-bold">Cooking time: </span> ${
        r.readyInMinutes ?? "N/A"
      } min</p>
      <p class="cards__coffee-card__time"><span class="text-bold">Popularity: </span> ${
        r.aggregateLikes ?? 0
      }</p>
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
   SECTION RENDER: FRUIT 🍇🍌🍊🍎 (Desserts)
   ================================== */

async function renderFruitCards() {
  if (fruitsRendered) return;
  fruitsRendered = true;
  if (containerFruit) containerFruit.innerHTML = "";

  // ВСЕГДА показываем демо-данные ПЕРВЫМИ
  const cached = cacheGet(LS_FRUITS);
  console.log("📦 Cached juice data:", cached);

  if (Array.isArray(cached) && cached.length) {
    console.log("✅ Showing cached/demo data");
    cached.forEach(addFruitCard);
  }

  // API запрос - только как БОНУС
  try {
    const url = `https://api.spoonacular.com/recipes/random?number=4&apiKey=${API_KEY}&type=dessert`;
    console.log("🌐 Trying API as bonus...");

    const data = await fetchJSON(url);
    const arr = data.results || [];
    console.log("📥 API response:", arr);

    if (arr.length) {
      console.log("🎉 API worked! Adding to existing data");
      arr.forEach(addFruitCard);
      cacheSet(LS_FRUITS, [...cached, ...arr]);
    }
  } catch (err) {
    console.log("⚠️ API failed, but we have demo data - filters will work!");
  }

  ensureNoMatchBanner(containerFruit);
  setTimeout(debugFilters, 500);
}

function addFruitCard(r) {
  const cuisineKey = detectCuisine({
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
  card.dataset.cooking = String(r.readyInMinutes ?? "0");
  card.dataset.popularity = String(r.aggregateLikes ?? 0);

  card.innerHTML = `
    <img src="${r.image}" alt="${r.title}" class="cards__juice-card__img">
    <h2 class="cards__juice-card__title">${r.title
      .split(" ")
      .slice(0, 2)
      .join(" ")}</h2>
    <span class="divider"></span>
    <div>
      <p class="cards__juice-card__meta"><span class="text-bold">Cuisine: </span> ${cuisineText}</p>
      <p class="cards__juice-card__time"><span class="text-bold">Cooking time: </span> ${
        r.readyInMinutes ?? "N/A"
      } min</p>
      <p class="cards__juice-card__time"><span class="text-bold">Popularity: </span> ${
        r.aggregateLikes ?? 0
      }</p>
    </div>
  `;

  if (favorites.some((f) => f.id === String(r.id)))
    card.classList.add("active");
  card.addEventListener("click", () => toggleFavoriteCard(card));
  containerFruit?.appendChild(card);
}

function showEmptyFruitCard() {
  const emptyCard = document.createElement("div");
  emptyCard.classList.add("cards__juice-card", "empty-card");
  emptyCard.innerHTML = `
    <div class="empty-card__box">
      <h2>🍰 Oops! API limit reached 😅</h2>
      <p>Looks like we’ve hit the maximum number of requests for today. Try again later or use local recipes!</p>
    </div>
  `;
  containerFruit?.appendChild(emptyCard);
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
    syncFavoriteState(recipeId, false);
  }

  localStorage.setItem(LS_FAVORITES, JSON.stringify(favorites));
  renderFavorites();
}

function syncFavoriteState(recipeId, isFavorite) {
  const allCards = document.querySelectorAll(`[data-id="${recipeId}"]`);

  allCards.forEach((card) => {
    if (isFavorite) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });
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
    favCard.classList.add("active");
    favCard.addEventListener("click", () => toggleFavoriteCard(favCard));
    containerFavorites.appendChild(favCard);
  });
}

function syncAllFavoriteStates() {
  const allCards = document.querySelectorAll(
    ".cards__coffee-card, .cards__juice-card"
  );
  allCards.forEach((card) => {
    card.classList.remove("active");
  });

  favorites.forEach((fav) => {
    const cards = document.querySelectorAll(`[data-id="${fav.id}"]`);
    cards.forEach((card) => {
      card.classList.add("active");
    });
  });
}

function debugFavoriteStates() {
  console.log("❤️ DEBUG FAVORITE STATES:");
  console.log("Favorites array:", favorites);

  const allCards = document.querySelectorAll(
    ".cards__coffee-card, .cards__juice-card"
  );
  console.log(`Total cards: ${allCards.length}`);

  const activeCards = document.querySelectorAll(
    ".cards__coffee-card.active, .cards__juice-card.active"
  );
  console.log(`Active cards: ${activeCards.length}`);

  activeCards.forEach((card) => {
    console.log(
      `Active card: ${card.querySelector("h2")?.textContent} (ID: ${
        card.dataset.id
      })`
    );
  });
}

/* ==========================================
   SECTION  WINDOWS WINDOWS WINDOWS WINDOWS
   ========================================== */

window.addEventListener("DOMContentLoaded", () => {
  seedIfEmpty(LS_COFFEE, DEMO_CAKES);
  seedIfEmpty(LS_JUICE, DEMO_DESSERTS);

  console.log("LS_COFFEE after seed:", cacheGet(LS_COFFEE));
  console.log("LS_JUICE after seed:", cacheGet(LS_JUICE));

  setActiveButton(buttonCoffee);
  mainFruites?.classList.add("hidden");
  mainChocolate?.classList.add("hidden");
  mainFavorites?.classList.add("hidden");

  ensureFavoritesLoaded();
  renderFavorites();
  renderCoffeeCards();

  setTimeout(syncAllFavoriteStates, 500);
});

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
    let container;
    if (category === "coffee") container = containerCoffee;
    else if (category === "fruits") container = containerFruit;
    else return;

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

  console.log(`🔍 Filtering by ${type} = ${value}`);

  if (type === "cuisine") {
    const wanted = (value || "all").toLowerCase();

    cards.forEach((card) => {
      const cardCuisine = (card.dataset.cuisine || "").toLowerCase();

      if (wanted === "all") {
        card.style.display = "";
      } else {
        card.style.display = cardCuisine === wanted ? "" : "none";
      }
    });

    ensureNoMatchBanner(container);
    return;
  }

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

function pickRandomFromStorage(storageKey) {
  try {
    const arr = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(arr) || !arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  } catch {
    return null;
  }
}

function showEmptyCard(container, title, message) {
  const emptyCard = document.createElement("div");
  emptyCard.classList.add("cards__coffee-card", "empty-card");
  emptyCard.innerHTML = `
    <div class="empty-card__box">
      <h2>${title}</h2>
      <p>${message}</p>
    </div>`;
  container.appendChild(emptyCard);
}

async function fetchRandomCard(category) {
  const isCoffee = category === "coffee";
  const container = isCoffee ? containerCoffee : containerFruit;
  if (!container) return;

  const visible = Array.from(
    container.querySelectorAll(".cards__coffee-card, .cards__juice-card")
  ).filter(
    (el) => el.offsetParent !== null && !el.classList.contains("empty-card")
  );

  const currentId =
    visible.length === 1 ? String(visible[0].dataset.id || "") : "";

  const storageKey = isCoffee ? LS_COFFEE : LS_FRUITS;
  const cacheArr = getCacheArray(storageKey);
  const otherFromCache = pickRandomExcluding(cacheArr, currentId);

  if (otherFromCache) {
    container
      .querySelectorAll(
        ".cards__coffee-card, .cards__juice-card, .empty-card, .no-match-card"
      )
      .forEach((el) => el.remove());
    (isCoffee ? addCoffeeCard : addFruitCard)(otherFromCache);
    const added = container.lastElementChild;
    if (added) {
      added.classList.add("pulse");
      setTimeout(() => added.classList.remove("pulse"), 800);
      added.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

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
      (isCoffee ? addCoffeeCard : addFruitCard)(recipe);
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

  if (visible[0]) {
    visible[0].classList.add("pulse");
    setTimeout(() => visible[0].classList.remove("pulse"), 800);
    visible[0].scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    showEmptyCard(container, "😕 Nothing to pick", "Load some recipes first.");
  }
}
