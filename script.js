const apiKey = "9aa66e4ff117445592b772f3a4b89e80";

// DOM refs
const inputEl = document.getElementById("ingredient-input");
const mealTypeEl = document.getElementById("meal-type");
const countryEl = document.getElementById("country-select");
const dietEl = document.getElementById("diet-select");
const sortEl = document.getElementById("sort-select");
const resultsEl = document.getElementById("results");
const detailsEl = document.getElementById("recipe-details");
const detailsContentEl = document.getElementById("recipe-content");

// Map diet selection to Spoonacular params
function buildDietParams(selected) {
  // vegetarian, vegan, gluten free → diet=
  // dairy free → intolerances=dairy
  const params = new URLSearchParams();
  if (!selected) return params;

  if (selected === "dairy free") {
    params.set("intolerances", "dairy");
  } else {
    // Spoonacular accepts "gluten free" as a diet too
    params.set("diet", selected);
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

async function searchRecipes() {
  const ingredient = (inputEl?.value || "").trim();
  const type = mealTypeEl.value;
  const cuisine = countryEl.value;
  const diet = dietEl.value;
  const sort = sortEl.value; // "popularity" or ""

  if (!ingredient) {
    resultsEl.innerHTML = "<p>Please enter an ingredient.</p>";
    return;
  }

  try {
    resultsEl.innerHTML = "<p>Searching…</p>";

    const qs = new URLSearchParams({
      query: ingredient,
      number: "9",
      addRecipeInformation: "true",
      apiKey
    });

    if (type) qs.set("type", type);
    if (cuisine) qs.set("cuisine", cuisine);
    if (sort) qs.set("sort", sort);

    // diet / intolerances
    const dietParams = buildDietParams(diet);
    dietParams.forEach((v, k) => qs.set(k, v));

    const url = `https://api.spoonacular.com/recipes/complexSearch?${qs.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const items = data.results || [];

    if (items.length === 0) {
      resultsEl.innerHTML = "<p>No recipes found.</p>";
      return;
    }

    resultsEl.innerHTML = "";
    items.forEach((r) => resultsEl.appendChild(card(r)));
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = "<p>Something went wrong. Please try again.</p>";
  }
}

async function randomRecipe() {
  const type = mealTypeEl.value;
  const cuisine = countryEl.value;
  const diet = dietEl.value;

  try {
    resultsEl.innerHTML = "<p>Picking a random recipe…</p>";

    // Build tags for /random
    const tags = [];
    if (type) tags.push(type);
    if (cuisine) tags.push(cuisine);
    if (diet) tags.push(diet); // Spoonacular accepts "dairy free" as a tag too

    const qs = new URLSearchParams({
      number: "1",
      apiKey
    });
    if (tags.length) qs.set("tags", tags.join(","));

    const url = `https://api.spoonacular.com/recipes/random?${qs.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const recipes = data.recipes || [];
    if (recipes.length === 0) {
      resultsEl.innerHTML = "<p>No random recipe found. Try different filters.</p>";
      return;
    }

    // Render single card
    resultsEl.innerHTML = "";
    resultsEl.appendChild(card(recipes[0]));
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = "<p>Couldn’t fetch a random recipe.</p>";
  }
}

async function showRecipeDetails(recipeId) {
  try {
    detailsContentEl.innerHTML = "<p>Loading…</p>";
    detailsEl.style.display = "flex";

    const response = await fetch(
      `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const recipe = await response.json();

    const ingredients = Array.isArray(recipe.extendedIngredients)
      ? recipe.extendedIngredients.map((i) => i.original).join(", ")
      : "Not available";

    detailsContentEl.innerHTML = `
      <button id="close-card-btn" onclick="closeDetails()">✖ Close</button>
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
}

// Optional: Enter key to search
inputEl?.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchRecipes();
});
