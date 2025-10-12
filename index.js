/* import { backupData } from "./backupdata.js";

console.log("backup data loaded:", backupData); */

//Main DOM
const btnAll = document.getElementById("btnAll");
const btnAsian = document.getElementById("asianCuisine");
const btnFrench = document.getElementById("frenchCuisine");
const btnMexican = document.getElementById("mexicanCuisine");
const btnItalian = document.getElementById("italianCuisine");
const timeBtns = document.querySelectorAll(".btn-filter-min");
const sortShortest = document.getElementById("sortShortest");
const sortLongest = document.getElementById("sortLongest");
const btnRandom = document.getElementById("btnRandom");
const btnFavourites = document.getElementById("btnFavourites");
const cardsContainer = document.querySelector(".cards-container");

//Default states
let recipes = [];
let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
let activeCuisines = [];
let activeTime = null;
let activeSort = null;
let showingFavourites = false;


//API
const API_KEY = "cb59bb05e6354de1a9c198d95460d7d9";
const API_URL = `https://api.spoonacular.com/recipes/random?number=10&apiKey=${API_KEY}&addRecipeInformation=true&addRecipeInstructions=true`;

//Cache functions
function saveCache(data) {
  localStorage.setItem("cachedRecipes", JSON.stringify(data));
  localStorage.setItem("cacheTime", Date.now());
}

function getCache() {
  const cached = localStorage.getItem("cachedRecipes");
  const time = localStorage.getItem("cacheTime");
  if (!cached || !time) return null;
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  if (Date.now() - Number(time) > SIX_HOURS) return null;
  return JSON.parse(cached);
}

//Show recipes
function displayRecipes(recipesToShow) {
  cardsContainer.innerHTML = "";

  if (!recipesToShow || recipesToShow.length === 0) {
    cardsContainer.innerHTML = `
      <div class="card" style="text-align:center; padding:2rem;">
        <h2>No recipes found</h2>
        <img src="./Assets/404error.jpg" alt="No recipes found" class="empty-state-img" />
        <p>Try another filter, or go back to all recipes.</p>
      </div>`;
    return;
  }

  recipesToShow.forEach(recipe => {
    const isFav = favourites.some(f => f.id === recipe.id);
    const cuisine = recipe.cuisines?.join(", ") || "Unknown";
    const time = recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "N/A";
    const ingredients = recipe.extendedIngredients
      ? recipe.extendedIngredients.map(ing => `<li>${ing.name}</li>`).join("")
      : "<li>No ingredients listed</li>";

    const cardHTML = `
      <div class="card">
        <a href="${recipe.sourceUrl || `https://spoonacular.com/recipes/${encodeURIComponent(recipe.title)}-${recipe.id}`}"
          target="_blank"
          rel="noopener noreferrer"
          class="card-link"
        >
          <img class="card-img" src="${recipe.image}" alt="${recipe.title}" />
          <div class="card-content">
            <h2 class="card-big-heading">${recipe.title}</h2>
            <hr class="card-line" />
            <dl class="details-card">
              <div class="card-detail">
                <dt>Cuisine:</dt><dd>${cuisine}</dd>
              </div>
              <div class="card-detail">
                <dt>Time:</dt><dd>${time}</dd>
              </div>
            </dl>
            <hr class="card-line" />
            <h3>Ingredients</h3>
            <ul class="ingredient-list">${ingredients}</ul>
          </div>
        </a>
        <button class="favourite-btn" data-id="${recipe.id}" title="Add to favourites">
          ${isFav ? "❤️" : "🤍"}
        </button>
      </div>
    `;
    cardsContainer.insertAdjacentHTML("beforeend", cardHTML);
  });

  attachFavouriteEvents();
}

//Filters and sorting functions
function applyFiltersAndSorting() {
  if (showingFavourites) return;

  let filtered = [...recipes];

  // Cuisine multi-filter
  if (activeCuisines.length > 0) {
    filtered = filtered.filter(r =>
      Array.isArray(r.cuisines) && r.cuisines.some(c => activeCuisines.includes(c))
    );
  }

  // Time filter
  if (activeTime) {
    const limits = { "30": 30, "45": 45, "90": 90, "180": 180 };
    filtered = filtered.filter(r => r.readyInMinutes && r.readyInMinutes <= limits[activeTime]);
  }

  // Sort
  if (activeSort === "asc") filtered.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
  else if (activeSort === "desc") filtered.sort((a, b) => b.readyInMinutes - a.readyInMinutes);

  displayRecipes(filtered);
}

// Fetching Data
async function fetchRecipes() {
  const loading = document.createElement("div");
  loading.textContent = "Loading recipes...";
  loading.style.textAlign = "center";
  cardsContainer.innerHTML = "";
  cardsContainer.appendChild(loading);

  try {
    const cache = getCache();
    if (cache) {
      recipes = cache;
      applyFiltersAndSorting();
      return;
    }

    const response = await fetch(API_URL);
    if (!response.ok) {
      if (response.status === 402 || response.status === 429) {
        cardsContainer.innerHTML = `
          <div class="card" style="text-align:center; padding:2rem;">
            <h2>Daily API quota reached</h2>
            <p>Please try again later or use cached recipes.</p>
          </div>`;
        return;
      }
      throw new Error("Failed to fetch recipes");
    }

    const data = await response.json();
    recipes = data.recipes;
    saveCache(recipes);
    applyFiltersAndSorting();
  } catch (err) {
    cardsContainer.innerHTML = `<p style="color:red; text-align:center;">${err.message}</p>`;
  }
}

// Random button
function getRandomRecipe() {
  const all = showingFavourites ? favourites : recipes;
  if (!all.length) return;
  const random = all[Math.floor(Math.random() * all.length)];
  displayRecipes([random]);
}

// Favs storage
function attachFavouriteEvents() {
  const favBtns = document.querySelectorAll(".favourite-btn");
  favBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      const id = parseInt(e.target.dataset.id);
      toggleFavourite(id);
    });
  });
}

function toggleFavourite(id) {
  const recipe = recipes.find(r => r.id === id) || favourites.find(f => f.id === id);
  if (!recipe) return;

  const exists = favourites.some(f => f.id === id);
  if (exists) {
    favourites = favourites.filter(f => f.id !== id);
  } else {
    favourites.push(recipe);
  }

  localStorage.setItem("favourites", JSON.stringify(favourites));

  if (showingFavourites) displayRecipes(favourites);
  else applyFiltersAndSorting();
}

/* // UI events (Cuisine filters, Time filters, Sorting, Add Favs)
function attachUiEvents() {
  const cuisineButtons = [btnAll, btnAsian, btnFrench, btnMexican, btnItalian];

  // Cuisine filter (multi-select)
  cuisineButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const clickedCuisine = btn.textContent.trim();

      if (clickedCuisine === "All") {
        // Reset all
        activeCuisines = [];
        cuisineButtons.forEach(b => b.classList.remove("active"));
        btnAll.classList.add("active");
      } else {
        btnAll.classList.remove("active");

        if (activeCuisines.includes(clickedCuisine)) {
          activeCuisines = activeCuisines.filter(c => c !== clickedCuisine);
          btn.classList.remove("active");
        } else {
          activeCuisines.push(clickedCuisine);
          btn.classList.add("active");
        }

        if (activeCuisines.length === 0) btnAll.classList.add("active");
      }

      applyFiltersAndSorting();
    });
  });

  // Cooking time filters
  timeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const text = btn.textContent;
      let newTime = null;

      if (text.includes("30")) newTime = "30";
      else if (text.includes("45")) newTime = "45";
      else if (text.includes("1,5")) newTime = "90";
      else if (text.includes("3")) newTime = "180";

      if (activeTime === newTime) {
        activeTime = null;
        timeBtns.forEach(b => b.classList.remove("active"));
      } else {
        activeTime = newTime;
        timeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      }

      applyFiltersAndSorting();
    });
  });

  // Sorting
  sortShortest.addEventListener("click", () => {
    activeSort = activeSort === "asc" ? null : "asc";
    sortShortest.classList.toggle("active", activeSort === "asc");
    sortLongest.classList.remove("active");
    applyFiltersAndSorting();
  });

  sortLongest.addEventListener("click", () => {
    activeSort = activeSort === "desc" ? null : "desc";
    sortLongest.classList.toggle("active", activeSort === "desc");
    sortShortest.classList.remove("active");
    applyFiltersAndSorting();
  });

  // Random recipe
  btnRandom.addEventListener("click", getRandomRecipe);

  // Favourites button
  const originalFavText = btnFavourites.innerHTML;

  btnFavourites.addEventListener("click", e => {
    e.preventDefault();
    showingFavourites = !showingFavourites;
    btnFavourites.innerHTML = showingFavourites
      ? "Back to All Recipes"
      : originalFavText;
    if (showingFavourites) {
      displayRecipes(favourites);
    }
    else {
      applyFiltersAndSorting();
    }
  });
} */

  function initCuisineFilters() {
  const cuisineButtons = [btnAll, btnAsian, btnFrench, btnMexican, btnItalian];

  cuisineButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const clickedCuisine = btn.textContent.trim();

      if (clickedCuisine === "All") {
        activeCuisines = [];
        cuisineButtons.forEach(b => b.classList.remove("active"));
        btnAll.classList.add("active");
      } else {
        btnAll.classList.remove("active");

        if (activeCuisines.includes(clickedCuisine)) {
          activeCuisines = activeCuisines.filter(c => c !== clickedCuisine);
          btn.classList.remove("active");
        } else {
          activeCuisines.push(clickedCuisine);
          btn.classList.add("active");
        }

        if (activeCuisines.length === 0) btnAll.classList.add("active");
      }

      applyFiltersAndSorting();
    });
  });
}

function initTimeFilters() {
  timeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const text = btn.textContent;
      let newTime = null;

      if (text.includes("30")) newTime = "30";
      else if (text.includes("45")) newTime = "45";
      else if (text.includes("1,5")) newTime = "90";
      else if (text.includes("3")) newTime = "180";

      if (activeTime === newTime) {
        activeTime = null;
        timeBtns.forEach(b => b.classList.remove("active"));
      } else {
        activeTime = newTime;
        timeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      }

      applyFiltersAndSorting();
    });
  });
}

function initSortingButtons() {
  sortShortest.addEventListener("click", () => {
    activeSort = activeSort === "asc" ? null : "asc";
    sortShortest.classList.toggle("active", activeSort === "asc");
    sortLongest.classList.remove("active");
    applyFiltersAndSorting();
  });

  sortLongest.addEventListener("click", () => {
    activeSort = activeSort === "desc" ? null : "desc";
    sortLongest.classList.toggle("active", activeSort === "desc");
    sortShortest.classList.remove("active");
    applyFiltersAndSorting();
  });
}

function initRandomButton() {
  btnRandom.addEventListener("click", getRandomRecipe);
}

function initFavouritesButton() {
  const originalFavText = btnFavourites.innerHTML;

  btnFavourites.addEventListener("click", e => {
    e.preventDefault();
    showingFavourites = !showingFavourites;
    btnFavourites.innerHTML = showingFavourites
      ? "Back to All Recipes"
      : originalFavText;

    if (showingFavourites) displayRecipes(favourites);
    else applyFiltersAndSorting();
  });
}

function attachUiEvents() {
  initCuisineFilters();
  initTimeFilters();
  initSortingButtons();
  initRandomButton();
  initFavouritesButton();
}


// Initial load
function init() {
  attachUiEvents();
  btnAll.classList.add("active");
  fetchRecipes();
}

init();
