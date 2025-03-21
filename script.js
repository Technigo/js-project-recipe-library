document.addEventListener("DOMContentLoaded", () => {
  const recipesContainer = document.querySelector("main");
  const filterInputs = document.querySelectorAll(".filter-input");
  const sortInputs = document.querySelectorAll(".sort-input");
  const random = document.getElementById("random");

  let recipes = []; // global array to store recipes

  // Fetch recipes from Spoonacular API
  const fetchRecipes = async () => {
    const apiKey = "40e9f9393aec4ad99ce5388eacd63c94";
    const apiURL = `https://api.spoonacular.com/recipes/random?number=10&apiKey=${apiKey}`;

    try {
     const response = await fetch(apiURL,);

      if (!response.ok) {
        throw new Error("Failed to fetch recipes. ");
      }

      const data = await response.json();

      if (!data.recipes) {
        recipesContainer.innerHTML = "<p>Daily API limit reached. Try again later.</p>";
        return;
      }

      recipes = data.recipes; // Store fetched recipes globally
      renderRecipes(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      recipesContainer.innerHTML = "<p>Failed to load recipes. Try again later.</p>";
    }
  };

  // Render recipes
  const renderRecipes = (recipes) => {
    recipesContainer.innerHTML = "";

    if (recipes.length === 0) {
      recipesContainer.innerHTML = "<p>No recipes found.</p>";
      return;
    }

    recipes.forEach((recipe) => {
      const recipeCard = document.createElement("div");
      recipeCard.classList.add("recipe-card");

      recipeCard.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}">
        <h2>${recipe.title}</h2>
        <p>Ready in ${recipe.readyInMinutes} minutes</p>
        <p>Servings: ${recipe.servings}</p>
        <a href="${recipe.sourceUrl}" target="_blank">View Recipe</a>
      `;

      recipesContainer.appendChild(recipeCard);
    });
  };

  // Filter and sort recipes
  const filterAndSortRecipes = () => {
    let filteredRecipes = [...recipes];

    // Get selected cuisine
    const selectedCuisineInput = document.querySelector("input[name=cuisine]:checked");
    const selectedCuisine = selectedCuisineInput ? selectedCuisineInput.value.toLowerCase() : "all";

    if (selectedCuisine !== "all") {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.cuisines.some(cuisine => cuisine.toLowerCase() === selectedCuisine)
      );
    }

    // Get selected sort option
    const selectedSortInput = document.querySelector("input[name=sort]:checked");
    const selectedSort = selectedSortInput ? selectedSortInput.value : "none";

    if (selectedSort === "popularity") {
      filteredRecipes.sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0));
    } else if (selectedSort === "price") {
      filteredRecipes.sort((a, b) => (a.pricePerServing || 0) - (b.pricePerServing || 0));
    } else if (selectedSort === "time") {
      filteredRecipes.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
    }

    renderRecipes(filteredRecipes);
  };

  // Show a random recipe
  const showRandomRecipe = () => {
    if (recipes.length === 0) {
      recipesContainer.innerHTML = "<p>No recipes available.</p>";
      return;
    }
    const randomIndex = Math.floor(Math.random() * recipes.length);
    renderRecipes([recipes[randomIndex]]);
  };

  // Attach event listeners
  filterInputs.forEach(input => input.addEventListener("change", filterAndSortRecipes));
  sortInputs.forEach(input => input.addEventListener("change", filterAndSortRecipes));
  random.addEventListener("click", showRandomRecipe);

  // Fetch and display recipes on load
  fetchRecipes();
});
