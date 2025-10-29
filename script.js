document.addEventListener("DOMContentLoaded", async () => {
  // fetches recipes and sets globals before rendering/adding listeners
  const apiResult = await getRecipes();
  let recipes = apiResult.recipes || [];
  let apiErrorMessage = apiResult.error || null;

  // Function to filter and sort recipes, then render them
  function filterAndSortRecipes() {
    const dietInput = document.querySelector('input[name="diet"]:checked');
    const sortInput = document.querySelector('input[name="sort-time"]:checked');
    const diet = dietInput ? dietInput.value : "all";
    const sort = sortInput ? sortInput.value : "desc";

    // Filter
    let filtered = recipes;
    if (diet !== "all") {
      filtered = recipes.filter(recipe => recipe.diets.includes(diet));
    }

    // Sort
    if (sort === "asc") {
      filtered = filtered.slice().sort((a, b) => a.readyInMinutes - b.readyInMinutes);
    } else {
      filtered = filtered.slice().sort((a, b) => b.readyInMinutes - a.readyInMinutes);
    }

    renderRecipes(filtered);
  }

  // Event listeners to all filter and sort radio buttons
  document.querySelectorAll('input[name="diet"], input[name="sort-time"]').forEach(input => {
    input.addEventListener("change", filterAndSortRecipes);
  });

  // Render recipes initially
  filterAndSortRecipes();

  // Event listener for random recipe button
  const randomBtn = document.getElementById('random-recipe-btn');
  if (randomBtn) {
    if (recipes.length === 0) {
      randomBtn.disabled = true; // Disable button if no recipes
    } else {
      randomBtn.addEventListener('click', () => {
        // Pick a random recipe from the array
        const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
        // Render only the random recipe
        renderRecipes([randomRecipe]);
      });
    }
  }
});

// Function to render recipe cards
function renderRecipes(recipesArray) {
  const container = document.querySelector('.recipe-card-container');
  container.innerHTML = ""; // Clear previous cards

  // Shows message when no recipes to display
  if (!recipesArray || recipesArray.length === 0) {
    const message = apiErrorMessage
      ? apiErrorMessage
      : "No recipes found — try different filters or try again later.";
    container.innerHTML = `<p class="no-recipes">${message}</p>`;
    return;
  }

  recipesArray.forEach(recipe => {
    const card = document.createElement('article');
    card.className = 'recipe-card';

    // Recipe card content
    let content = `
      <img class="recipe-images" src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <hr>
      <h4>Ready in: ${recipe.readyInMinutes} min | Servings: ${recipe.servings}</h4>
      ${recipe.diets.length > 0 ? `<h4>Diet: ${recipe.diets.join(', ')}</h4>` : ''}
      <hr>
      <h4>Ingredients</h4>
      <ul>
        ${recipe.extendedIngredients.map(ing => `<li>${ing.name}</li>`).join('')}
      </ul>
    `;

    card.innerHTML = content;

    // Makes the whole card clickable
    card.addEventListener('click', () => {
      window.open(recipe.sourceUrl, '_blank');
    });

    container.appendChild(card);
  });
}