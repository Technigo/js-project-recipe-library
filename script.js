const apiKey = "a229b49155dd40a782013d0a5e906f70";

// Cached DOM references
const inputEl = document.getElementById("ingredient-input");
const mealTypeEl = document.getElementById("meal-type");
const countryEl = document.getElementById("country-select");
const resultsEl = document.getElementById("results");
const detailsEl = document.getElementById("recipe-details");
const detailsContentEl = document.getElementById("recipe-content");

// Search function with filters
async function searchRecipes() {
  const ingredient = (inputEl?.value || "").trim();
  const mealType = mealTypeEl.value;
  const cuisine = countryEl.value;

  if (!ingredient) {
    resultsEl.innerHTML = "<p>Please enter an ingredient.</p>";
    return;
  }

  try {
    resultsEl.innerHTML = "<p>Searching…</p>";

    // Use complexSearch for cuisine & type filters
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
      ingredient
    )}&type=${encodeURIComponent(mealType)}&cuisine=${encodeURIComponent(
      cuisine
    )}&number=6&addRecipeInformation=true&apiKey=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      resultsEl.innerHTML = "<p>No recipes found.</p>";
      return;
    }

    // Render recipe cards
    resultsEl.innerHTML = "";
    data.results.forEach((recipe) => {
      const card = document.createElement("div");
      card.className = "recipe-item";

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

      card.append(img, title, link);
      resultsEl.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = "<p>Something went wrong. Please try again.</p>";
  }
}

// Fetch and display detailed recipe info
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

    // Add Close button directly in the card
    detailsContentEl.innerHTML = `
      <button id="close-card-btn" onclick="closeDetails()">✖ Close</button>
      <h2>${recipe.title}</h2>
      <img src="${recipe.image}" alt="${recipe.title}">
      <p><strong>Cuisine:</strong> ${recipe.cuisines.join(", ") || "N/A"}</p>
      <p><strong>Meal Type:</strong> ${recipe.dishTypes.join(", ") || "N/A"}</p>
      <p><strong>Ingredients:</strong> ${ingredients}</p>
      <p><strong>Instructions:</strong> ${
        recipe.instructions || "No instructions provided."
      }</p>
    `;
  } catch (err) {
    console.error(err);
    detailsContentEl.innerHTML = "<p>Couldn't load recipe details.</p>";
  }
}

function closeDetails() {
  detailsEl.style.display = "none";
}
