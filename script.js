// RECIPE DATA
const apiKey = "a4a3ccd716344f26b393d88964bbac7e";
const URL = `https://api.spoonacular.com/recipes/random?number=10&apiKey=${apiKey}`;
let recipeData = [];

const fetchRecipeData = async () => {
  const cachedRecipeData = localStorage.getItem("recipes");

  if (cachedRecipeData && cachedRecipeData !== "[]") {
    recipeData = JSON.parse(cachedRecipeData);
    loadRecipeData(recipeData);
  } else {
    try {
      const response = await fetch(URL);
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("API limit reached. Please try again later");
        }
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      recipeData = data.recipes;
      localStorage.setItem("recipes", JSON.stringify(recipeData));
      loadRecipeData(recipeData);
    } catch (error) {
      recipesContainer.innerHTML = `<div>${error.message}</div>`;
    }
  }
};

document.addEventListener("DOMContentLoaded", fetchRecipeData);

// DISPLAY RECIPE DATA
const recipesContainer = document.querySelector(".recipes");
let isLoading = true;

const loadRecipeData = (recipesArray) => {
  recipesContainer.innerHTML = "";
  if (isLoading) {
    recipesContainer.innerHTML = `<div>Loading...</div>`;
  }

  if (recipesArray.length) {
    recipesArray.forEach((recipe) => {
      const numberOfIngredients = recipe.extendedIngredients.length;

      const diets = [];
      if (recipe.vegan) diets.push("Vegan");
      if (recipe.vegetarian) diets.push("Vegetarian");
      if (recipe.glutenFree) diets.push("Gluten-free");
      if (recipe.dairyFree) diets.push("Dairy-free");

      const dietInfo = diets.length ? diets.join(", ") : "No specific diet";

      recipesContainer.innerHTML += `
       <div
             class="recipe"
             data-category="${recipe.cuisines.join(", ")} ${diets.join(", ")} ${
        recipe.readyInMinutes
      } ${numberOfIngredients}"
      data-id=${recipe.id}
           >
             <div class="img-container">
               <img
                 class="recipe-img"
                 src=${recipe.image}
               />
             </div>
             <h2 class="recipe-title">${recipe.title}</h2>
             <hr />
             <div class="recipe-text-container">
               <h3 class="recipe-subtitle">Cuisine:</h3>
               <p class="recipe-text">${recipe.cuisines
                 .map((cuisine) => {
                   return cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
                 })
                 .join(", ")}</p>
             </div>
   
             <div class="recipe-text-container">
               <h3 class="recipe-subtitle">Diet:</h3>
               <p class="recipe-text">${dietInfo}</p>
             </div>
   
             <div class="recipe-text-container">
               <h3 class="recipe-subtitle">Time:</h3>
               <p class="recipe-text">${recipe.readyInMinutes}min</p>
             </div>
             <hr />
   
             <div class="recipe-text-container ingredients-container">
               <h3 class="recipe-subtitle">Ingredients:</h3>
               <ul class="ingredients-list">
               ${recipe.extendedIngredients
                 .map((ingredient) => {
                   return `<li class="ingredient">${
                     ingredient.name.charAt(0).toUpperCase() +
                     ingredient.name.slice(1)
                   }</li>`;
                 })
                 .join("")}
               </ul>
             </div>
             <button class="btn like-btn">	&#10084;</button>
           </div>`;
    });
  } else {
    recipesContainer.innerHTML += `
    <div>There are no recipes to display.</div>
    `;
  }

  isLoading = false;
};
loadRecipeData(recipeData);

// LIKED RECIPES
if (!localStorage.getItem("likedRecipes")) {
  localStorage.setItem("likedRecipes", JSON.stringify([]));
}

let likedRecipes = new Set(JSON.parse(localStorage.getItem("likedRecipes")));

const updateLikedRecipes = () => {
  localStorage.setItem(
    "likedRecipes",
    JSON.stringify(Array.from(likedRecipes))
  );
};

const manageLikedRecipes = () => {
  const likeButtons = document.querySelectorAll(".like-btn");

  likeButtons.forEach((btn) => {
    const recipeId = btn.closest(".recipe").dataset.id;

    if (likedRecipes.has(recipeId)) {
      btn.classList.add("liked");
    } else {
      btn.classList.remove("liked");
    }
  });

  likeButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const recipeId = event.target.closest(".recipe").dataset.id;

      if (likedRecipes.has(recipeId)) {
        likedRecipes.delete(recipeId);
        event.target.classList.remove("liked");
      } else {
        likedRecipes.add(recipeId);
        event.target.classList.add("liked");
      }

      updateLikedRecipes();
    });
  });
};
document.addEventListener("DOMContentLoaded", manageLikedRecipes);

// SHOWING FAVOURITE RECIPES
let viewingFavRecipes = false;
const favRecipesButton = document.querySelector(".fav-btn");
let likedRecipeData = [];

const toggleFavRecipes = () => {
  viewingFavRecipes = !viewingFavRecipes;

  if (viewingFavRecipes) {
    favRecipesButton.textContent = "View All Recipes";
    showLikedRecipes();
  } else {
    favRecipesButton.textContent = "View Favourites";
    loadRecipeData(recipeData);
    manageLikedRecipes();
  }
};

const showLikedRecipes = () => {
  likedRecipeData = recipeData.filter((recipe) =>
    likedRecipes.has(String(recipe.id))
  );

  loadRecipeData(likedRecipeData);
  manageLikedRecipes();
};

favRecipesButton.addEventListener("click", toggleFavRecipes);

// RANDOM RECIPE
const randomRecipeBtn = document.querySelector(".recipe-btn");
const getRandomRecipe = () => {
  randomRecipeBtn.addEventListener("click", () => {
    const randomRecipe = [
      recipeData[Math.floor(Math.random() * recipeData.length)],
    ];
    loadRecipeData(randomRecipe);
    manageLikedRecipes();
  });
};
getRandomRecipe();

// DROPDOWN
let dropdowns = document.querySelectorAll(".dropdown");

function closeAllDropdowns() {
  dropdowns.forEach((dropdown) => {
    const dropdownItems = dropdown.querySelector(".dropdown-items");
    dropdownItems.classList.remove("dropdown-open");
  });
}

dropdowns.forEach((dropdown) => {
  const dropdownSelected = dropdown.querySelector(".dropdown-selected");
  const dropdownItems = dropdown.querySelector(".dropdown-items");
  const dropdownOptions = dropdown.querySelectorAll(".dropdown-option");

  dropdownSelected.addEventListener("click", () => {
    if (dropdownItems.classList.contains("dropdown-open")) {
      dropdownItems.classList.remove("dropdown-open");
    } else {
      closeAllDropdowns();
      dropdownItems.classList.add("dropdown-open");
    }
  });

  dropdownOptions.forEach((option) => {
    option.addEventListener("click", () => {
      dropdownSelected.textContent = option.textContent;
      dropdownItems.classList.remove("dropdown-open");
    });
  });

  window.addEventListener("click", (event) => {
    if (!event.target.matches(".dropdown-selected")) {
      if (dropdownItems.classList.contains("dropdown-open")) {
        dropdownItems.classList.remove("dropdown-open");
      }
    }
  });
});

// DROPDOWN FILTER AND SORT
const filterOptions = document.querySelectorAll(".dropdown-option[data-filter");
const sortByOptions = document.querySelectorAll(".dropdown-option[data-sort]");
const recipes = document.querySelectorAll(".recipe");
let dietFilterValue = "all";
let cuisineFilterValue = "all";
let sortByValue;

const filterRecipes = () => {
  let recipesToFilter = viewingFavRecipes ? likedRecipeData : recipeData;

  let filteredRecipes = recipesToFilter.filter((recipe) => {
    const category =
      recipe.cuisines.join(", ").toLowerCase() + ", " + recipe.diets.join(", ");
    const matchesDiet =
      dietFilterValue === "all" || category.includes(dietFilterValue);
    const matchesCuisine =
      cuisineFilterValue === "all" || category.includes(cuisineFilterValue);

    return matchesCuisine && matchesDiet;
  });

  if (sortByValue === "cook-time-asc") {
    filteredRecipes.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
  } else if (sortByValue === "cook-time-desc") {
    filteredRecipes.sort((a, b) => b.readyInMinutes - a.readyInMinutes);
  } else if (sortByValue === "ingredients-asc") {
    filteredRecipes.sort(
      (a, b) => a.extendedIngredients.length - b.extendedIngredients.length
    );
  } else if (sortByValue === "ingredients-desc") {
    filteredRecipes.sort(
      (a, b) => b.extendedIngredients.length - a.extendedIngredients.length
    );
  }

  loadRecipeData(filteredRecipes);
  manageLikedRecipes();
};

filterOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const filter = option.getAttribute("data-filter");

    if (option.classList.contains("diet-option")) {
      dietFilterValue = filter;
    } else if (option.classList.contains("cuisine-option")) {
      cuisineFilterValue = filter;
    }

    filterRecipes();
  });
});

sortByOptions.forEach((option) => {
  option.addEventListener("click", () => {
    sortByValue = option.getAttribute("data-sort");

    filterRecipes();
  });
});
