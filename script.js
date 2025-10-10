// Replace this with your valid Spoonacular API key
const apiKey = "edf4c3d520ec43ff9f8def394e4820e9";

// DOM refs
const formEl = document.getElementById("search-form");
const inputEl = document.getElementById("ingredient-input");
const mealTypeEl = document.getElementById("meal-type");
const countryEl = document.getElementById("country-select");
const dietEl = document.getElementById("diet-select");
const sortEl = document.getElementById("sort-select");
const resultsEl = document.getElementById("results");
const detailsEl = document.getElementById("recipe-details");
const detailsContentEl = document.getElementById("recipe-content");
const searchBtn = document.getElementById("search-button");
const randomBtn = document.getElementById("random-button");

// Map diet selection to Spoonacular params
function buildDietParams(selected) {
  const params = new URLSearchParams();
  if (!selected) return params;

  if (selected === "dairy free") {
    params.set("intolerances", "dairy");
  } else {
    params.set("diet", selected); // Spoonacular accepts "gluten free" here too
  }
  return params;
}

function card(recipe) {
  const div = document.createElement("div");
  div.className = "recipe-item";

  const img = document.createElement("img");
  img.src = recipe.image;
  img.alt = recipe.title;

  const title = document.createElement("h3");
  title.textContent = recipe.title;

  const link = document.createElement("a");
  link.href = "#";
  link.textContent = "View Recipe";
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    await showRecipeDetails(recipe.id);
  });

  div.append(img, title, link);
  return div;
}

function setLoading(loading, message = "Searching…") {
  if (loading) {
    resultsEl.innerHTML = `<p>${message}</p>`;
    searchBtn.disabled = true;
    randomBtn.disabled = true;
    searchBtn.style.opacity = 0.7;
    randomBtn.style.opacity = 0.7;
  } else {
    searchBtn.disabled = false;
    randomBtn.disabled = false;
    searchBtn.style.opacity = "";
    randomBtn.style.opacity = "";
  }
}

async function searchRecipes() {
  const ingredient = (inputEl?.value || "").trim();
  if (!ingredient) {
    resultsEl.innerHTML = "<p>Please enter an ingredient.</p>";
    return;
  }

  const type = mealTypeEl.value;
  const cuisine = countryEl.value;
  const diet = dietEl.value;
  const sort = sortEl.value;

  try {
    setLoading(true, "Searching…");

    const qs = new URLSearchParams({
      query: ingredient,
      number: "9",
      addRecipeInformation: "true",
      apiKey
    });

    if (type) qs.set("type", type);
    if (cuisine) qs.set("cuisine", cuisine);
    if (sort) qs.set("sort", sort);

    const dietParams = buildDietParams(diet);
    dietParams.forEach((v, k) => qs.set(k, v));

    const url = `https://api.spoonacular.com/recipes/complexSearch?${qs.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      const msg = response.status === 402 || response.status === 401
        ? "API key error or quota reached. Please check your Spoonacular API key."
        : `Request failed (HTTP ${response.status}).`;
      throw new Error(msg);
    }

    const data = await response.json();
    const items = data.results || [];

    resultsEl.innerHTML = items.length
      ? ""
      : "<p>No recipes found. Try another ingredient or adjust filters.</p>";

    items.forEach((r) => resultsEl.appendChild(card(r)));
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = `<p>${err.message || "Something went wrong. Please try again."}</p>`;
  } finally {
    setLoading(false);
  }
}

async function randomRecipe() {
  const type = mealTypeEl.value;
  const cuisine = countryEl.value;
  const diet = dietEl.value;

  try {
    setLoading(true, "Picking a random recipe…");

    const tags = [];
    if (type) tags.push(type);
    if (cuisine) tags.push(cuisine);
    if (diet) tags.push(diet); // Spoonacular accepts "dairy free" tag too

    const qs = new URLSearchParams({ number: "1", apiKey });
    if (tags.length) qs.set("tags", tags.join(","));

    const url = `https://api.spoonacular.com/recipes/random?${qs.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      const msg = response.status === 402 || response.status === 401
        ? "API key error or quota reached. Please check your Spoonacular API key."
        : `Request failed (HTTP ${response.status}).`;
      throw new Error(msg);
    }

    const data = await response.json();
    const recipes = data.recipes || [];

    resultsEl.innerHTML = recipes.length
      ? ""
      : "<p>No random recipe found. Try different filters.</p>";

    if (recipes.length) resultsEl.appendChild(card(recipes[0]));
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = `<p>${err.message || "Couldn’t fetch a random recipe."}</p>`;
  } finally {
    setLoading(false);
  }
}

async function showRecipeDetails(recipeId) {
  try {
    detailsContentEl.innerHTML = "<p>Loading…</p>";
    detailsEl.style.display = "flex";
    detailsEl.setAttribute("aria-hidden", "false");

    const response = await fetch(
      `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const recipe = await response.json();

    const ingredients = Array.isArray(recipe.extendedIngredients)
      ? recipe.extendedIngredients.map((i) => i.original).join(", ")
      : "Not available";

    detailsContentEl.innerHTML = `
      <button id="close-card-btn" aria-label="Close details" onclick="closeDetails()">✖ Close</button>
      <h2>${recipe.title}</h2>
      <img src="${recipe.image}" alt="${recipe.title}">
      <p><strong>Cuisine:</strong> ${recipe.cuisines?.join(", ") || "N/A"}</p>
      <p><strong>Meal Type:</strong> ${recipe.dishTypes?.join(", ") || "N/A"}</p>
      <p><strong>Ingredients:</strong> ${ingredients}</p>
      <p><strong>Instructions:</strong> ${recipe.instructions || "No instructions provided."}</p>
    `;
  } catch (err) {
    console.error(err);
    detailsContentEl.innerHTML = "<p>Couldn't load recipe details.</p>";
  }
}

function closeDetails() {
  detailsEl.style.display = "none";
  detailsEl.setAttribute("aria-hidden", "true");
}

// Close modal when clicking outside content (mobile-friendly)
detailsEl.addEventListener("click", (e) => {
  if (e.target === detailsEl) closeDetails();
});

// Close with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDetails();
});

/* --- Event bindings --- */

// Submit form triggers search (so Enter works)
formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  searchRecipes();
});

// Buttons
searchBtn.addEventListener("click", searchRecipes);
randomBtn.addEventListener("click", randomRecipe);
