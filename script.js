// --- DOM SELECTORS ---
const container = document.getElementById("recipeContainer");
const cuisineButtons = document.getElementById("cuisineButtons");
const sortButtons = document.getElementById("sortButtons");
const randomBtn = document.getElementById("randomBtn");
const resetBtn = document.getElementById("resetBtn");
const statusBox = document.getElementById("status");

// --- CONSTANTS ---
const apiKey = "6c307cd5c39f477b909ae0c07f6c06ca";
const endPoint = `https://api.spoonacular.com/recipes/random?number=24&instructionsRequired=true&apiKey=${apiKey}`;

// --- STATE ---
let allRecipes = [];
let highlightedId = null;
let currentCuisine = "All";
let currentSort = "time";

// --- HELPERS ---
const money = cents =>
  typeof cents === "number"
    ? (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })
    : "";

function showStatus(msg, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = msg;
  statusBox.className = `status ${type}`;
}
function clearStatus() {
  if (!statusBox) return;
  statusBox.textContent = "";
  statusBox.className = "status";
}

function bySort(key) {
  switch (key) {
    case "time":
      return (a, b) => (a.readyInMinutes ?? 0) - (b.readyInMinutes ?? 0);
    case "popularity":
      return (a, b) => (b.aggregateLikes ?? 0) - (a.aggregateLikes ?? 0);
    case "price":
      return (a, b) => (a.pricePerServing ?? 0) - (b.pricePerServing ?? 0);
    default:
      return () => 0;
  }
}

// --- FETCH RECIPES ---
async function fetchRecipes(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 402 || res.status === 429) {
        throw new Error("Daily API quota reached. Try again tomorrow.");
      }
      if (res.status === 401) {
        throw new Error("Invalid or missing API key.");
      }
      throw new Error(`Request failed with status ${res.status}`);
    }
    const json = await res.json();
    return json.recipes ?? [];
  } catch (err) {
    showStatus(err.message || "Something went wrong fetching recipes.", "error");
    return [];
  }
}

// --- RENDER CARDS ---
function renderRecipes(recipes) {
  if (!recipes.length) {
    container.innerHTML = `
      <div class="empty">
        <p><strong>No recipes match your filters.</strong></p>
        <p>Try a different cuisine or reset filters.</p>
      </div>`;
    return;
  }

  let html = "";
  recipes.forEach(r => {
    html += `
      <div class="recipe-cards" id="recipe-${r.id}" style="outline: ${r.id === highlightedId ? '3px solid #10b981' : 'none'}">
        <img src="${r.image}" class="recipe-img" alt="${r.title}" />
        <p class="recipe-card-label">${r.title}</p>
        <div class="recipe-time">
          <p> ${r.readyInMinutes ?? "—"} minutes</p>
        </div>
        <p>Likes: ${r.aggregateLikes ?? 0}</p>
        ${typeof r.pricePerServing === "number" ? `<p>Price/serving: ${money(r.pricePerServing)}</p>` : ""}
        <p><a href="${r.sourceUrl}" target="_blank" rel="noopener noreferrer">Check it out</a></p>
      </div>
    `;
  });
  container.innerHTML = html;
}

// --- FILTER & SORT ---
function applyFiltersAndSort() {
  let list = [...allRecipes];
  if (currentCuisine !== "All") {
    list = list.filter(r => (r.cuisines ?? []).includes(currentCuisine));
  }
  list.sort(bySort(currentSort));
  renderRecipes(list);
  return list;
}

// --- RANDOM PICK ---
function pickRandom() {
  const current = applyFiltersAndSort();
  highlightedId = null;
  if (!current.length) return;
  const idx = Math.floor(Math.random() * current.length);
  const chosen = current[idx];
  highlightedId = chosen.id;
  renderRecipes(current);
  document.getElementById(`recipe-${chosen.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

// --- EVENT LISTENERS ---
cuisineButtons?.addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  cuisineButtons.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentCuisine = btn.dataset.cuisine || "All";
  applyFiltersAndSort();
});

sortButtons?.addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  sortButtons.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentSort = btn.dataset.sort || "time";
  applyFiltersAndSort();
});

randomBtn?.addEventListener('click', pickRandom);

resetBtn?.addEventListener('click', () => {
  currentCuisine = "All";
  currentSort = "time";
  highlightedId = null;
  document.querySelectorAll('#cuisineButtons .chip').forEach(b => b.classList.remove('active'));
  document.querySelector('#cuisineButtons .chip[data-cuisine="All"]')?.classList.add('active');
  document.querySelectorAll('#sortButtons .chip').forEach(b => b.classList.remove('active'));
  document.querySelector('#sortButtons .chip[data-sort="time"]')?.classList.add('active');
  applyFiltersAndSort();
});

// --- INIT ---
(async function init() {
  showStatus("Loading recipes…");
  allRecipes = await fetchRecipes(endPoint);
  clearStatus();
  applyFiltersAndSort();
})();