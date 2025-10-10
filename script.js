//============================= CONSTANTS & DOM REFS =============================
const cardsEl = document.getElementById("cards");
const showAllButton = document.getElementById("btn-show-all");
const cuisineSelect = document.getElementById("cuisine");
const dietSelect = document.getElementById("diet");
const sortTimeSelect = document.getElementById("sortTime");
const sortPopSelect = document.getElementById("sortPop");
const searchInput = document.getElementById("search");

const renderStars = (num) => "⭐".repeat(num);

const CACHE_KEY = "recipesCache"; // localStorage key
const CACHE_TIME = 6 * 60 * 60 * 1000; // 6 hours in ms

const API_KEY = "023721190a824bc5b967171438a1f9af";
const RANDOM_URL = `https://api.spoonacular.com/recipes/random?number=10&apiKey=${API_KEY}`;

//===========================CREATING VARIABLES=====================================//
// Using "let" instead of "const" below because these values will change dynamically
// when the user interacts with the filters, sorting, or search bar.
let selectedCuisine = "all";
let selectedSort = "asc";
let selectedDiet = "diet-all";
let selectedPopular = "most";
let selectedSortType = "time";
let searchQuery = "";

// Create an empty array that will later be filled with recipe data from the API.
const recipes = [];

// ======================== FUNCTIONS TO UPDATE FILTER VALUES ======================== //
// These functions are used when the user changes filter options.
// They update the global variables and re-render the recipe list on the page.

// Updates the selected cuisine type
const setCuisine = (c) => {
  selectedCuisine = c; // Save the chosen cuisine to the variable
  renderResult(); // Re-render the recipes with the updated filter
};

// Updates how the list should be sorted (ascending or descending)
const setSort = (s) => {
  selectedSort = s; //sparar valet
  renderResult();
};

// Updates which diet filter is active.
const setDiet = (d) => {
  selectedDiet = d;
  renderResult();
};

// Updates which popularity filter is active.
const setPopular = (p) => {
  selectedPopular = p;
  renderResult();
};

// ========================= GET THE CURRENT RECIPE LIST (FILTER + SEARCH + SORT) =========================
// Returns a fresh array of recipes based on the user's current selections:

const getCurrentList = () => {
  // Start with a working list we can modify without touching the original array.
  // If "all" is selected, clone the full array; otherwise filter by cuisine.
  let list;
  if (selectedCuisine === "all") {
    list = recipes.slice();
  } else {
    list = recipes.filter((r) => r.cuisine === selectedCuisine);
  }

  // Apply diet filter if the user selected a specific diet.
  if (selectedDiet !== "diet-all") {
    list = list.filter((r) => {
      const d = (r.diet || "").toLowerCase();
      return d === selectedDiet;
    });
  }

  // Apply free-text search over title and ingredients (case-insensitive).
  const query = searchQuery.trim().toLowerCase();
  if (query) {
    list = list.filter((r) => {
      const inTitle = (r.title || "").toLowerCase().includes(query);
      const inIngredients = (r.ingredients || []).some((i) =>
        (i || "").toLowerCase().includes(query)
      );
      return inTitle || inIngredients;
    });
  }

  // Sort the list based on the selected sort type and order.
  if (selectedSortType === "time") {
    // Sort by time (ascending = fastest first, descending = slowest first)
    if (selectedSort === "asc") {
      list.sort((a, b) => a.time - b.time);
    } else {
      list.sort((a, b) => b.time - a.time);
    }
  } else if (selectedSortType === "popular") {
    // Sort by popularity (most/least)
    if (selectedPopular === "most") {
      list.sort((a, b) => b.popularity - a.popularity);
    } else {
      list.sort((a, b) => a.popularity - b.popularity);
    }
  }
  // Return the final filtered/sorted array to be rendered.
  return list;
};

//================== FUNCTION TO DISPLAY RECIPES ON THE PAGE ==================
const renderResult = () => {
  // Get the current list of recipes based on filters and sorting
  const list = getCurrentList();

  // If the list is empty, show a message and stop the function
  if (list.length === 0) {
    cardsEl.innerHTML = `<p>No recipes found. Try another filter</p>`;
    return;
  }

  // Create an empty string to build the HTML for all recipes
  let html = "";
  // Loop through each recipe in the list
  list.forEach((r) => {
    // Make the first letter of cuisine uppercase (e.g., "italian" → "Italian")
    const cuisineText = r.cuisine[0].toUpperCase() + r.cuisine.slice(1);
    // Add the cooking time followed by "minutes"
    const timeText = r.time + " minutes";
    // Get the diet type (vegan, vegetarian, etc.)
    const dietText = r.diet;
    // Convert popularity score into stars
    const popularText = renderStars(r.popularity);
    // Convert the ingredients array into HTML list items (<li>)
    const ingHtml = r.ingredients.map((i) => `<li>${i}</li>`).join(""); //Här görs igridienslistan om från array till html

    // Build the HTML structure for a single recipe card
    html += `
      <article class="recipe">
        <img src="${r.img}" alt="${r.title}" />
        <h3 class="title">${r.title}</h3>
        <div class="meta">
          <p><strong>Cuisine:</strong> <span class="cuisine">${cuisineText}</span></p>
          <p><strong>Diet:</strong> <span>${dietText}</span></p>
          <p><strong>Popularity:</strong>${popularText}</span></p>
          <p><strong>Time:</strong> <span>${timeText}</span></p>
        </div>
        <h4>Ingredients</h4>
        <ul>${ingHtml}</ul>
      </article>
    `;
  });

  // Insert all built HTML into the page
  cardsEl.innerHTML = html;
};

//========================= RENDER A SINGLE RECIPE CARD =========================
const renderSingleResult = (r) => {
  // Make cuisine start with uppercase (e.g., "italian" -> "Italian")
  const cuisineText = r.cuisine[0].toUpperCase() + r.cuisine.slice(1);

  // Build small display strings
  const timeText = r.time + " minutes"; //konstanta variabler skapas.. En visningstext för minuter
  const dietText = r.diet || "-"; // om diet finns skrivs den ut annars "-"
  const popularText = renderStars(r.popularity);

  // Turn the ingredients array into <li> items
  const ingHtml = r.ingredients.map((i) => `<li>${i}</li>`).join(""); //Här görs igridienslistan om från array till html

  // Return one complete recipe card HTML
  return `
       <article class="recipe">
      <img src="${r.img}" alt="${r.title}" />
      <h3 class="title">${r.title}</h3>
      <div class="meta">
        <p><strong>Cuisine:</strong> <span class="cuisine">${cuisineText}</span></p>
        <p><strong>Diet:</strong> <span>${dietText}</span></p>
        <p><strong>Popularity:</strong>${popularText}</p>
        <p><strong>Time:</strong> <span>${timeText}</span></p>
      </div>
      <h4>Ingredients</h4>
      <ul>${ingHtml}</ul>
    </article>
  `;
};

//===================== MAP API RECIPE TO INTERNAL SHAPE =======================
const mapApiRecipe = (r) => ({
  // Title with fallback
  title: r.title || "Untitled",
  cuisine: (r.cuisines?.[0] || "unknown").toLowerCase(),
  diet: (r.diets?.[0] || "none").toLowerCase(),
  popularity: Math.max(
    1,
    Math.min(5, Math.round((r.aggregateLikes || 0) / 100))
  ),
  time: r.readyInMinutes || 0,
  img: r.image || "https://via.placeholder.com/600x400?text=No+image",
  ingredients: (r.extendedIngredients || []).map(
    (i) => i.original || i.name || ""
  ),
});

//=========================== RANDOM BUTTON HANDLER ============================
const randomButton = document.getElementById("btn-random");

randomButton.addEventListener("click", () => {
  // Get the currently filtered/sorted list
  const list = getCurrentList();
  if (!list.length) {
    cardsEl.innerHTML = "<p>No recipes to randomize. Adjust the filters!</p>";
    return;
  }

  // Pick a random recipe from the list
  const randomIndex = Math.floor(Math.random() * list.length);
  const recipe = list[randomIndex];

  // Replace the grid with the single random recipe card
  cardsEl.innerHTML = renderSingleResult(recipe);

  // Reveal the "Show all" button so the user can restore the list
  showAllButton.style.display = "inline-block";
});

//===================== FETCH RECIPES (WITH SIMPLE CACHE) ======================
const fetchRecipes = async () => {
  cardsEl.innerHTML = "<p>Fetching recipes…</p>";

  // 1) Try cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const saved = JSON.parse(cached);
    const tooOld = Date.now() - saved.timestamp > CACHE_TIME;

    // Use cached recipes and render immediately
    if (!tooOld) {
      cardsEl.innerHTML = "<p>Showing recipes from cache</p>";
      recipes.length = 0;
      recipes.push(...saved.items);
      renderResult();
      return; // stop here if cache is fresh
    }
  }

  // 2) Fetch via RANDOM endpoint (ensures extendedIngredients are present)
  try {
    const res = await fetch(RANDOM_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));

    const json = await res.json();
    const mapped = (json.recipes || []).map(mapApiRecipe);

    // Replace current recipes and render the grid
    recipes.length = 0;
    recipes.push(...mapped);
    renderResult();

    // 3) Save to localStorage for next time
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), items: mapped })
    );

    //Error messages
  } catch (error) {
    console.error("Fetch error:", error);
    let message;
    switch (error.message) {
      case "401":
        message = "<p>Invalid or missing API key (401).</p>";
        break;
      case "402":
      case "429":
        message = `
          <p>You have reached your daily API quota or are rate-limited (402/429).</p>
          <p>Try again tomorrow, reduce requests, or use cached data.</p>
        `;
        break;
      default:
        message =
          "<p>Could not fetch recipes right now. Please try again later.</p>";
    }
    cardsEl.innerHTML = message;
  }
};

//======================= FILTER & SORT EVENT LISTENERS ========================
// Cuisine filter
document.getElementById("cuisine").addEventListener("change", (e) => {
  setCuisine(e.target.value); // uppdaterar state
  renderResult(); // rita om listan (eller hämta från API om du vill)
});

// Diet filter
document.getElementById("diet").addEventListener("change", (e) => {
  setDiet(e.target.value);
  renderResult();
});

// Sort by time (asc/desc)
document.getElementById("sortTime").addEventListener("change", (e) => {
  selectedSortType = "time";
  setSort(e.target.value); // "asc" eller "desc"
});

// Sort by popularity (most/least)
document.getElementById("sortPop").addEventListener("change", (e) => {
  selectedSortType = "popular";
  setPopular(e.target.value); // "most" eller "least"
});
document.getElementById("btn-show-all").addEventListener("click", () => {
  renderResult();
});
document.getElementById("search").addEventListener("input", (e) => {
  searchQuery = e.target.value; // uppdatera state
  renderResult(); // rita om listan
});

//=========================== SHOW-ALL BUTTON HANDLER ==========================
showAllButton.addEventListener("click", () => {
  // Re-render the full filtered/sorted grid
  renderResult();

  // Hide the button again
  showAllButton.style.display = "none";
});

//============================== INITIALIZATION ================================
document.addEventListener("DOMContentLoaded", () => {
  cuisineSelect.value = selectedCuisine; // "all"
  dietSelect.value = selectedDiet; // "diet-all"
  sortTimeSelect.value = selectedSort; // "asc"
  sortPopSelect.value = selectedPopular; // "most"

  fetchRecipes();
});
