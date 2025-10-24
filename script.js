// --- CONNECTING JS WITH HTML ---
const recipesEl = document.getElementById("recipes");
const msgEl = document.getElementById("msg");
const pills = document.querySelectorAll(".pill");
const randomBtn = document.getElementById("random-btn");

// --- API SETUP ---
const API_KEY = "2065aff4499d4fe29bdfbad342732432";
const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";

// --- STATE ---
let recipes = [];
let filters = {
  kitchen: "all",
  diet: "all",
  time: "all",
  ingredients: "all",
  sort: "popularity",
};

// --- FETCH DATA FUNCTION ---
async function fetchData() {
  recipesEl.innerHTML = `<p>Loading recipes...</p>`;
  msgEl.textContent = "Fetching data...";

  // Build query
  let url = `${BASE_URL}?number=12&addRecipeInformation=true&apiKey=${API_KEY}`;

  if (filters.kitchen !== "all") url += `&cuisine=${filters.kitchen}`;
  if (filters.diet !== "all") url += `&diet=${filters.diet}`;

  try {
    const res = await fetch(url);

    if (res.status === 402) {
      recipesEl.innerHTML = `<p>Daily API quota exceeded. Please try again tomorrow.</p>`;
      msgEl.textContent = "API limit reached.";
      throw new Error("Quota reached");
    }

    const data = await res.json();
    console.log("Fetched data:", data);

    if (!data.results || data.results.length === 0) {
      recipesEl.innerHTML = `<p>No recipes found for your selected filters.</p>`;
      msgEl.textContent = "No results found.";
      return;
    }

    // Normalize data
    recipes = data.results.map(recipe => ({
      id: recipe.id,
      title: recipe.title || "Unknown title",
      image: recipe.image || "https://via.placeholder.com/300x200?text=No+Image",
      kitchen:
        recipe.cuisines && recipe.cuisines.length > 0
          ? recipe.cuisines[0]
          : "Various",
      diet:
        recipe.diets && recipe.diets.length > 0
          ? recipe.diets[0]
          : "General",
      time: recipe.readyInMinutes || 0,
      ingredients: recipe.extendedIngredients
        ? recipe.extendedIngredients.length
        : 0,
      popularity: recipe.aggregateLikes || 0,
    }));

    showRecipes(recipes);
    msgEl.textContent = `Fetched ${recipes.length} recipes (${filters.kitchen}, ${filters.diet})`;
  } catch (err) {
    console.error("Fetch error:", err);
    recipesEl.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
    msgEl.textContent = "Failed to load recipes.";
  }
}

// --- FILTER FUNCTION ---
const filterRecipes = list =>
  list.filter(r => {
    // Time filters
    if (filters.time === "under15" && !(r.time < 15)) return false;
    if (filters.time === "15to30" && !(r.time >= 15 && r.time <= 30)) return false;
    if (filters.time === "30to60" && !(r.time >= 30 && r.time <= 60)) return false;
    if (filters.time === "over60" && !(r.time > 60)) return false;

    // Ingredient filters
    if (filters.ingredients === "under5" && !(r.ingredients < 5)) return false;
    if (filters.ingredients === "6to10" && !(r.ingredients >= 6 && r.ingredients <= 10)) return false;
    if (filters.ingredients === "11to15" && !(r.ingredients >= 11 && r.ingredients <= 15)) return false;
    if (filters.ingredients === "over16" && !(r.ingredients > 16)) return false;

    return true;
  });

// --- SORT FUNCTION ---
const sortRecipes = list => {
  const key = filters.sort;
  const sorted = [...list];
  sorted.sort((a, b) => b[key] - a[key]); // highest first
  return sorted;
};

// --- SHOW RECIPES ---
const showRecipes = list => {
  const filtered = filterRecipes(list);
  const sorted = sortRecipes(filtered);

  recipesEl.innerHTML = sorted.length
    ? sorted
        .map(
          r => `
        <div class="card">
          <img src="${r.image}" alt="${r.title}" class="card-img">
          <div class="card-body">
            <h3>${r.title}</h3>
            <p><strong>Cuisine:</strong> ${r.kitchen}</p>
            <p><strong>Diet:</strong> ${r.diet}</p>
            <p><strong>Time:</strong> ${r.time} min</p>
            <p><strong>Ingredients:</strong> ${r.ingredients}</p>
            <p><strong>Popularity:</strong> ${r.popularity}</p>
          </div>
        </div>`
        )
        .join("")
    : `<p>No recipes match your filters.</p>`;

  msgEl.textContent = `Results: ${sorted.length} | Kitchen: ${filters.kitchen} | Diet: ${filters.diet} | Sort: ${filters.sort}`;
};

// --- EVENT LISTENERS ---
pills.forEach(btn => {
  btn.addEventListener("click", () => {
    const group = btn.parentElement.querySelectorAll(".pill");
    group.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (btn.dataset.kitchen) filters.kitchen = btn.dataset.kitchen;
    if (btn.dataset.diet) filters.diet = btn.dataset.diet;
    if (btn.dataset.time) filters.time = btn.dataset.time;
    if (btn.dataset.ingredients) filters.ingredients = btn.dataset.ingredients;
    if (btn.dataset.sort) filters.sort = btn.dataset.sort;

    if (btn.dataset.kitchen || btn.dataset.diet) {
      fetchData(); // refetch from API
    } else {
      showRecipes(recipes); // filter locally
    }
  });
});

// --- RANDOM RECIPE BUTTON ---
randomBtn.addEventListener("click", () => {
  const random = recipes[Math.floor(Math.random() * recipes.length)];
  showRecipes([random]);
});

// --- INITIAL FETCH ---
fetchData();

