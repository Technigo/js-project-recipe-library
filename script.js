const recipesEl = document.getElementById("recipes");
const msgEl = document.getElementById("msg");
const pills = document.querySelectorAll(".pill");

const API_KEY = "df0bfbeda16544f99c228b0621c5662a";
const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";

let DATA = [];
let state = {
  kitchen: "all",
  diet: "all",
  time: "all",
  ingredients: "all",
  sort: "time",
  order: "asc"
};

// --- FETCH DATA ---
const fetchData = () => {
  recipesEl.innerHTML = `<p>Loading recipes...</p>`;

  // Build dynamic query string based on selected filters
  const params = new URLSearchParams({
    number: 12,
    addRecipeInformation: true,
    apiKey: API_KEY,
  });

  if (state.kitchen !== "all") params.append("cuisine", state.kitchen);
  if (state.diet !== "all") params.append("diet", state.diet);

  const url = `${BASE_URL}?${params.toString()}`;

  fetch(url)
    .then(res => {
      if (res.status === 402) {
        recipesEl.innerHTML = `<p>Daily API quota exceeded. Please try again tomorrow.</p>`;
        msgEl.textContent = "⚠️ API limit reached";
        throw new Error("Quota reached");
      }
      return res.json();
    })
    .then(data => {
      console.log("Fetched data:", data);

      if (!data.results || data.results.length === 0) {
        recipesEl.innerHTML = `<p>No recipes found for your selected filters.</p>`;
        msgEl.textContent = "No results found.";
        return;
      }

      // Normalize data
      DATA = data.results.map(recipe => ({
        title: recipe.title,
        image: recipe.image,
        kitchen: recipe.cuisines[0] || "Unknown",
        diet: recipe.diets[0] || "General",
        time: recipe.readyInMinutes || 0,
        ingredients: recipe.extendedIngredients
          ? recipe.extendedIngredients.length
          : 0,
        popularity: recipe.aggregateLikes || 0
      }));

      showRecipes(DATA);
      msgEl.textContent = `Fetched ${DATA.length} recipes (${state.kitchen}, ${state.diet})`;
    })
    .catch(err => {
      console.error("Fetch error:", err);
      recipesEl.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
      msgEl.textContent = "❌ Failed to load recipes.";
    });
};

// --- FILTER FUNCTION (time + ingredients) ---
const filterRecipes = list =>
  list.filter(r => {
    // Cooking time
    if (state.time === "under15" && !(r.time < 15)) return false;
    if (state.time === "15to30" && !(r.time >= 15 && r.time <= 30)) return false;
    if (state.time === "30to60" && !(r.time >= 30 && r.time <= 60)) return false;
    if (state.time === "over60" && !(r.time > 60)) return false;

    // Ingredient amount
    if (state.ingredients === "under5" && !(r.ingredients < 5)) return false;
    if (state.ingredients === "6to10" && !(r.ingredients >= 6 && r.ingredients <= 10)) return false;
    if (state.ingredients === "11to15" && !(r.ingredients >= 11 && r.ingredients <= 15)) return false;
    if (state.ingredients === "over16" && !(r.ingredients > 16)) return false;

    return true;
  });

// --- SORT FUNCTION ---
const sortRecipes = list => {
  const key = state.sort;
  const sorted = [...list];
  sorted.sort((a, b) =>
    state.order === "asc" ? a[key] - b[key] : b[key] - a[key]
  );
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

  msgEl.textContent = `Results: ${sorted.length} | Kitchen: ${state.kitchen} | Diet: ${state.diet} | Sort: ${state.sort} (${state.order})`;
};

// --- EVENT LISTENERS ---
pills.forEach(btn => {
  btn.addEventListener("click", () => {
    const group = btn.parentElement.querySelectorAll(".pill");
    group.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (btn.dataset.kitchen) state.kitchen = btn.dataset.kitchen;
    if (btn.dataset.diet) state.diet = btn.dataset.diet;
    if (btn.dataset.time) state.time = btn.dataset.time;
    if (btn.dataset.ingredients) state.ingredients = btn.dataset.ingredients;
    if (btn.dataset.sort) state.sort = btn.dataset.sort;
    if (btn.dataset.order) state.order = btn.dataset.order;

    // If user changes kitchen or diet → refetch from API
    if (btn.dataset.kitchen || btn.dataset.diet) {
      fetchData();
    } else {
      // Other filters (time, ingredients, sorting) work locally
      showRecipes(DATA);
    }
  });
});

// --- INIT ---
fetchData();

