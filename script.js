// --- State ---
let cuisineQueryParam = ""; // e.g., "&cuisine=italian"
let sortQueryParam = "&sort=time&sortDirection=desc"; // default by time, descending
let activeFilterBtn = null;
let activeSortBtn = null;

const API_KEY = "3f2445631f2d458b92fe40f9832bcc51";

// --- Marks the clicked button as active and removes the active class from the previously clicked one. ---
function markActive(newBtn, prevBtnRefName) {
  if (newBtn === null) return;
  if (window[prevBtnRefName]) {
    window[prevBtnRefName].classList.remove("active");
  }
  newBtn.classList.add("active");
  window[prevBtnRefName] = newBtn;
}

//Fetches updated recipes and sends them to the UI rendering function (showCase()).
function updateAndRender() {
  showCase(fetchRecipes());
}

// --- UI Actions  Handles what happens when the user clicks a filter button (like “Italian” or “Mexican”).---
function setActiveFilter(filter) {
  // Set query param
  if (filter === "all") {
    cuisineQueryParam = "";
  } else {
    cuisineQueryParam = "&cuisine=" + encodeURIComponent(filter);
  }
  // Mark active button
  const btn = document.getElementById(`filter__${filter}`);
  markActive(btn, "activeFilterBtn");

  // Refresh results
  updateAndRender();
}

function setActiveSort(direction) {
  // Validate: asc | desc
  const dir = direction === "asc" ? "asc" : "desc";
  sortQueryParam = `&sort=time&sortDirection=${dir}`;

  const btn = document.getElementById(`sort__${dir}`);
  markActive(btn, "activeSortBtn");

  // Refresh results
  updateAndRender();
}

// --- Data Fetch recipe from spoonacular API, based on filter and sort settings ---
async function fetchRecipes() {
  const URL = `https://api.spoonacular.com/recipes/complexSearch?fillIngredients=true&addRecipeInformation=true&number=12&apiKey=${API_KEY}${cuisineQueryParam}${sortQueryParam}`;

  try {
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    // data.results is an array of recipe objects
    return data.results || [];
  } catch (err) {
    console.error(err);
    // Graceful fallback
    return [];
  }
}

// --- Format time, and minustes ---
function formatTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

// Display recepie card in HTML Grid/ CSS style on it
async function showCase(recipesPromise) {
  const recipeGrid = document.getElementById("recipe__grid");
  recipeGrid.innerHTML = `<div id="loading">Loading…</div>`;

  const recipes = await recipesPromise;

  if (!recipes.length) {
    recipeGrid.innerHTML = `<p>No recipes found. Try a different filter.</p>`;
    return;
  }

  recipeGrid.innerHTML = "";

  recipes.forEach((recipe) => {
    const recipeCard = document.createElement("div");
    recipeCard.className = "recipe__card";

    const cuisines =
      Array.isArray(recipe.cuisines) && recipe.cuisines.length
        ? recipe.cuisines.join(", ")
        : "—";

    const ingredients = Array.isArray(recipe.extendedIngredients)
      ? recipe.extendedIngredients.map((ing) => ing.original)
      : [];

    const ingredientList = document.createElement("ul");
    ingredientList.className = "recipe__ingredients";
    ingredients.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      ingredientList.appendChild(li);
    });
    // html structor
    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}" class="recipe__image" />
      <h3 class="recipe__title">${recipe.title}</h3>
      <p class="recipe__meta"><b>Cuisine:</b> ${cuisines}</p>
      <p class="recipe__meta"><b>Time:</b> ${formatTime(
        recipe.readyInMinutes || 0
      )}</p>
      <h4 class="recipe__subtitle">Ingredients:</h4>
    `;

    recipeCard.appendChild(ingredientList);
    recipeGrid.appendChild(recipeCard);
  });
}
// initialization (auto-run- on load)
// --- Init (after DOM is ready because script is at the end of body) ---
(function init() {
  // Set defaults visually & load first page
  setActiveFilter("all");
  setActiveSort("desc");
})();
