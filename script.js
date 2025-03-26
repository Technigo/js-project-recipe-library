// Accordion menu logic

const setupToggle = (titleSelector, buttonsSelector) => {
  const title = document.querySelector(titleSelector);
  const buttons = document.querySelector(buttonsSelector);
  const arrow = title.querySelector(".toggle-arrow");

  title.addEventListener("click", () => {
    buttons.classList.toggle("toggle-hidden");
    arrow.classList.toggle("rotated");
  });
};

setupToggle(".filters-title", ".filters-buttons");
setupToggle(".sorting-title", ".sorting-buttons");
setupToggle(".surprise-title", ".random-buttons");

// Display recipes

let allRecipes = [];

const loadAllRecipes = (recipes = allRecipes) => {
  
  const recipeGrid = document.querySelector(".recipe-grid-container");

  recipeGrid.innerHTML = "";

  const filteredRecipes = recipes.filter(recipe => recipe.cuisine);

  if (filteredRecipes.length === 0) {
    recipeGrid.innerHTML = `<p class="error-message">No recipes found for the selected filters :(</p>`;
    return;
  }

  filteredRecipes.forEach(recipe => {
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    recipeCard.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.title}">
    <h3>${recipe.title}</h3>
    <hr>
    <p>Cuisine: ${recipe.cuisine}</p>
    <p>Time: ${recipe.readyInMinutes}</p>
    <hr>
    <p>Ingredients:</p>
    <ul class="ingredient-list">
      ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join("")}
    </ul>
    `;

    recipeGrid.appendChild(recipeCard);

  });
};

// Fetch recipes

const fetchRecipes = async () => {
  const apiKey = "2dc58147eaeb4d3bbaefc623ddc286b5";
  const url = `https://api.spoonacular.com/recipes/complexSearch?number=20&apiKey=${apiKey}&fillIngredients=true&addRecipeInformation=true&cuisine=mexican,italian,thai,indian,japanese`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 402) {
        const recipeGrid = document.querySelector(".recipe-grid-container");
        recipeGrid.innerHTML = `<p class="error-message">Error: API call quota has been exceeded for the day.</p>`;
      }
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();

    const formattedRecipes = data.results.map(recipe => {
      const matchedCuisine = recipe.cuisines.find(cuisine => 
        ["mexican", "italian", "thai", "indian", "japanese"].includes(cuisine.toLowerCase())
      );

      return {
        id: recipe.id,
        sourceURL: recipe.sourceURL,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        ingredients: recipe.extendedIngredients.map(ingredient => ingredient.name),
        popularity: recipe.spoonacularScore,
        cuisine: matchedCuisine || "Unknown",
      };

    });

    allRecipes = formattedRecipes;
    loadAllRecipes(allRecipes);

  } catch (error) {
    console.error("Error fetching recipes:", error);
    displayError();
  }
};

window.addEventListener("DOMContentLoaded", () => {
  fetchRecipes();
});

// Filter button logic

const filterButtons = Array.from(document.getElementsByClassName("filter-button"));
const allFoodButton = document.getElementById("all-button");
const activeFilters = [];

filterButtons.forEach(button => {
  button.addEventListener("click", () => selectFilter(button));
});

const selectFilter = (button) => {
  const cuisine = button.innerText;

  if (button === allFoodButton) {
    activeFilters.length = 0;
    filterButtons.forEach(button => button.classList.remove("active-filter"));
    allFoodButton.classList.add("active-filter");
  } else {
    allFoodButton.classList.remove("active-filter");

    if (button.classList.contains("active-filter")) {
      button.classList.remove("active-filter");
      const index = activeFilters.indexOf(cuisine);
      if (index > -1) activeFilters.splice(index, 1);
    } else {
      button.classList.add("active-filter");
      activeFilters.push(cuisine);
    }
  }

  applyFilters();
};

const applyFilters = () => {
  let filteredRecipes = allRecipes;

  if (activeFilters.length > 0) {
    filteredRecipes = allRecipes.filter(recipe => 
      activeFilters.includes(recipe.cuisine)
    );
  }

  loadAllRecipes(filteredRecipes);
}

// Sort button logic

const sortButtons = Array.from(document.getElementsByClassName("sorting-button"));
const sortStates = {};
const sortingEmojis = [" ↕️", " ⬆️", " ⬇️"];

sortButtons.forEach(button => {
  sortStates[button.innerText] = 0;
  button.innerText += sortingEmojis[0];
  button.addEventListener("click", () => selectSorting(button));
});

const selectSorting = (button) => {

  let buttonText = button.innerText.split(" ")[0];

  sortButtons.forEach(btn => {
    let btnText = btn.innerText.split(" ")[0];

    if (btn !== button) {
    btn.innerText = btnText + sortingEmojis[0];
    sortStates[btnText] = 0;
    btn.classList.remove("active-sorting");
    }

  });

  if (sortStates[buttonText] === 0) {
    sortStates[buttonText] = 1;
    button.innerText = buttonText + sortingEmojis[1];
    button.classList.add("active-sorting");
  } else if (sortStates[buttonText] === 1) {
    sortStates[buttonText] = 2;
    button.innerText = buttonText + sortingEmojis[2];
  } else {
    sortStates[buttonText] = 0;
    button.innerText = buttonText + sortingEmojis[0];
    button.classList.remove("active-sorting");
  }

  applySorting();
};

const sortByPopularity = (recipes, order) => {
  return recipes.sort((a, b) => {
    if (order === 1) {
      return a.popularity - b.popularity;
    } else if (order === 2) {
      return b.popularity - a.popularity;
    } else {
      return 0;
    }
  });
};

const sortByTime = (recipes, order) => {
  return recipes.sort((a, b) => {
    if (order === 1) {
      return a.readyInMinutes - b.readyInMinutes;
    } else if (order === 2) {
      return b.readyInMinutes - a.readyInMinutes;
    } else {
      return 0;
    }
  });
};

const applySorting = () => {
  let sortedRecipes = activeFilters.length > 0
  ? allRecipes.filter(recipe => activeFilters.includes(recipe.cuisine))
  : allRecipes;

  if (sortStates["Popularity"] > 0) {
    sortedRecipes = sortByPopularity(sortedRecipes, sortStates["Popularity"]);
  } else if (sortStates["Time"] > 0) {
    sortedRecipes = sortByTime(sortedRecipes, sortStates["Time"]);
  }

  loadAllRecipes(sortedRecipes);
}

// Random button logic

const randomButton = document.getElementById("random-button");

const fetchRandomRecipe = async () => {

  const apiKey = "2dc58147eaeb4d3bbaefc623ddc286b5";
  const url = `https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 402) {
        const recipeGrid = document.querySelector(".recipe-grid-container");
        recipeGrid.innerHTML = `<p class="error-message">Error: API call quota has been exceeded for the day.</p>`;
      }
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();
    const recipe = data.recipes[0];
    
    const matchedCuisine = recipe.cuisines.find(cuisine => 
      ["Mexican", "Italian", "Thai", "Indian", "Japanese"].includes(cuisine)
    );

    const formattedRecipe = [{
      id: recipe.id,
      sourceURL: recipe.sourceURL,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      ingredients: recipe.extendedIngredients.map(ing => ing.name),
      popularity: recipe.spoonacularScore,
      cuisine: matchedCuisine || "Unknown",
    }];

    loadAllRecipes(formattedRecipe);
  }

  catch (error) {
    console.error("Error fetching random recipe:", error);
    displayError();
  }
};

randomButton.addEventListener("click", fetchRandomRecipe);

// Error display for the user

const displayError = () => {
  const recipeGrid = document.querySelector(".recipe-grid-container");
  recipeGrid.innerHTML += `<p class="error-message">Error: We are unable to fetch recipes at this time.</p>`;
};