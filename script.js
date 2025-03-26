// GLOBAL VARIABLES
const API_KEY = 'b362b9edeed54639b64b0e6176d9ab9e';
const ALLOWED_DIETS = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'];
const ALLOWED_CUISINES = ["mediterranean", "middle-eastern", "asian", "italian", "american"];

// FUNCTION TO GET ELEMENT BY ID //
const getElement = id => document.getElementById(id);

// DOM ELEMENTS
const elements = {
  loadingIndicator: getElement("loading"),
  errorContainer: getElement("error-container"),
  filtersInfo: getElement("filters-info"),
  dietFilter: getElement("diet-filter"),
  cuisineFilter: getElement("cuisine-filter"),
  timeFilter: getElement("time-filter"),
  sortFilter: getElement("sort-filter"),
  clearBtn: getElement("clearBtn"),
  randomBtn: getElement("randomBtn"),
  container: getElement("recipe-container"),
  recipeCountElement: getElement("recipe-count"),
  searchInput: getElement("search-input"),
};

// GLOBAL STATE
const state = {
  recipes: [],
  filteredRecipes: [],
  apiQuotaExceeded: false,
  itemsPerPage: 10,
  currentPage: 1
};

const setItemsPerPage = () => {
  state.itemsPerPage = window.innerWidth < 768 ? 5 : 10;
};

// CAPITALIZE //
const capitalize = input => {
  const cap = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  if (Array.isArray(input)) {
    return input
      .filter(item => typeof item === "string")
      .map(cap);
  }

  if (typeof input === "string") {
    return cap(input);
  }

  return input;
};


// TOGGLE LOADING & ERROR MESSAGES //
const toggleLoading = (show, message = "Loading...") => {
  if (show) {
    elements.loadingIndicator.style.display = "block";
    elements.loadingIndicator.innerText = message;
  } else {
    elements.loadingIndicator.style.display = "none";
    elements.loadingIndicator.innerText = "";
  }
};

// Error message 
const showErrorMessage = (message = "Something went wrong. Please try again.") => {
  toggleLoading(false);

  elements.errorContainer.innerHTML = `
    <div class="error-box">
      <p>${message}</p>
    </div>
  `;

  state.apiQuotaExceeded = true;
};

const handleApiError = (error) => {
  console.error("API error:", error);

  const message = error.message === "Failed to fetch"
    ? "Could not connect to the recipe server. Please check your internet or try again later."
    : error.message;

  showErrorMessage(message);
};



// SAVE TO LOCALSTORAGE
const saveRecipesToLocalStorage = (recipes) => {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem("recipesData", JSON.stringify({ recipes, savedDate: today }));
};

// "CALLING" API AND "REFRESH" RECIPES //
const getRecipesFromAPI = async () => {
  const response = await fetch(
    `https://api.spoonacular.com/recipes/random?number=100&apiKey=${API_KEY}`
  );

  if (response.status === 402) {
    throw new Error("API quota exceeded. Please try again tomorrow.");
  } else if (response.status === 404) {
    throw new Error("No recipes found. Try a different search.");
  } else if (response.status === 429) {
    throw new Error("Too many requests. Please slow down and try again soon.");
  } else if (response.status >= 500 && response.status <= 504) {
    throw new Error("Server error. Please try again later.");
  } else if (!response.ok) {
    throw new Error("Something went wrong. Please try again.");
  }

  const data = await response.json();
  return data.recipes;
};


// SAVING RECIPES FROM API AND USING THEM //
const fetchRecipes = async () => {
  toggleLoading(true, "Please wait, loading fresh new recipes!");
  state.apiQuotaExceeded = false;

  try {
    const recipes = await getRecipesFromAPI();
    state.recipes = recipes;

    saveRecipesToLocalStorage(recipes);
    displayRecipes(state.recipes);
  } catch (error) {
    handleApiError(error);
  } finally {
    toggleLoading(false);
  }
};


// LOCALSTORAGE //
const loadSavedRecipes = () => {
  const savedData = localStorage.getItem("recipesData");
  if (!savedData) {
    return fetchRecipes();
  }

  const { recipes: savedRecipes, savedDate } = JSON.parse(savedData);
  const today = new Date().toISOString().split("T")[0];

  if (savedDate === today) {
    state.recipes = savedRecipes;

    displayRecipes(filterAndSortRecipes());
    return;
  }

  fetchRecipes();
};

// GET DIET TEXT 
const getDietText = recipe => {
  if (recipe.vegan) return "Vegan";
  if (recipe.vegetarian) return "Vegetarian";
  if (recipe.glutenFree) return "Gluten free";
  if (recipe.dairyFree) return "Dairy free";

  if (Array.isArray(recipe.diets) && recipe.diets.length > 0) {
    const firstAllowedDiet = recipe.diets.find(diet =>
      ALLOWED_DIETS.includes(diet.toLowerCase())
    );

    if (firstAllowedDiet) {
      return capitalize(firstAllowedDiet.replace("-", " "));
    }
  }
  return "No specific diet";
};

// GET CUISINE TEXT 
const getCuisineText = recipe => {
  if (Array.isArray(recipe.cuisines) && recipe.cuisines.length > 0) {
    const firstAllowedCuisine = recipe.cuisines.find(cuisine =>
      ALLOWED_CUISINES.includes(cuisine.toLowerCase())
    );

    if (firstAllowedCuisine) {
      return capitalize(firstAllowedCuisine.replace("-", " "));
    }
  }
  return "Not specified";
};

// CREATE RECIPE CARD
const createRecipeCard = recipe => {
  const recipeCard = document.createElement("div");
  recipeCard.classList.add("recipe-card");

  const finalDiet = getDietText(recipe);
  const cuisine = getCuisineText(recipe);
  const time = recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "Unknown time";
  const ingredientList = recipe.extendedIngredients || [];

  const allIngredients = ingredientList
    .map(ing => capitalize(ing.name))
    .join(", ");

  const ingredients = ingredientList.length
    ? allIngredients
    : "No ingredients listed";

  recipeCard.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.title}" 
     onerror="this.onerror=null; this.src=
     'https://placehold.co/300x200?text=No+Image&font=roboto'">
    <h3>${capitalize(recipe.title)}</h3>
    <hr class="recipe-divider">
    <p><strong>Diet:</strong> ${finalDiet}</p>
    <p><strong>Cuisine:</strong> ${cuisine}</p>
    <p><strong>Time:</strong> ${time}</p>
    <hr class="recipe-divider">
   <p><strong>Ingredients:</strong> ${ingredients}</p>
      <a href="${recipe.sourceUrl}" 
      target="_blank" class="view-recipe-btn">View Full Recipe</a>
  `;

  return recipeCard;
};

// DISPLAY RECIPES //
const displayRecipes = (recipeList = []) => {
  state.filteredRecipes = recipeList;
  elements.errorContainer.innerHTML = "";


  if (!Array.isArray(recipeList)) {
    console.error("Error: recipeList is not an array!",
      recipeList);
    return;
  }

  elements.container.innerHTML = "";
  const startIndex = (state.currentPage - 1) * state.itemsPerPage + 1;
  const endIndex = Math.min(startIndex + state.itemsPerPage - 1, recipeList.length);

  elements.recipeCountElement.textContent =
    `Showing ${startIndex}-${endIndex} of ${recipeList.length} recipes`;

  if (state.apiQuotaExceeded) return;

  if (recipeList.length === 0) {
    elements.container.innerHTML = `
    <p class="no-recipes">Sorry, no recipes found. 
    Try adjusting your selections!</p>`;
    return;
  }

  const paginatedRecipes = getPaginatedRecipes(recipeList);

  paginatedRecipes.forEach(recipe => {
    const card = createRecipeCard(recipe);
    if (card) elements.container.appendChild(card);
  });

  updatePaginationControls(recipeList);

  const topOffset = elements.container.getBoundingClientRect().top + window.pageYOffset - 100;

  window.scrollTo({
    top: topOffset,
    behavior: "smooth"
  });
};

// FILTERS & SORTING //
const updateFilterStyle = filterElement => {
  filterElement.classList.remove("active-filter", "sort-active");
  if (filterElement === elements.sortFilter) {
    filterElement.style.backgroundColor = "#ffecea";
    filterElement.style.color = "#0018a4";
  } else {
    filterElement.style.backgroundColor = "#ccffe2";
    filterElement.style.color = "#0018a4";
  }
  filterElement.style.border = "2px solid #FAFBFF";

  if (filterElement.value !== "all" && filterElement.value !== "none") {
    if (filterElement === elements.sortFilter) {
      filterElement.style.backgroundColor = "#ff6589";
      filterElement.classList.add("sort-active");
    } else {
      filterElement.style.backgroundColor = "#0018a4";
      filterElement.classList.add("active-filter");
    }
    filterElement.style.color = "white";
    filterElement.style.border = filterElement === elements.sortFilter
      ? "2px solid #ff6589"
      : "2px solid #0018a4";
  }
};

// UPDATE FILTERS INFO //
const updateFiltersInfo = () => {
  const activeFilters = [];

  // CHECK DIET FILTER
  if (elements.dietFilter.value !== "all") {
    activeFilters.push(capitalize(elements.dietFilter.value));
  }

  //  CHECK CUISINE FILTER
  if (elements.cuisineFilter.value !== "all") {
    activeFilters.push(capitalize(elements.cuisineFilter.value));
  }

  // CHECK TIME FILTER
  if (elements.timeFilter.value !== "all") {
    const timeText = {
      "under-15": "Under 15 min",
      "15-30": "15-30 min",
      "30-60": "30-60 min",
      "over-60": "Over 60 min"
    }[elements.timeFilter.value];
    activeFilters.push(timeText);
  }

  // CHECK SORT FILTER
  const sortText = elements.sortFilter.value !== "none"
    ? `Sorted by: ${elements.sortFilter.value === "time-asc" ? "Time" : "Popularity"}`
    : "";

  // CREATE FILTERS INFO TEXT
  const filtersText = activeFilters.length > 0
    ? `Selected filters: ${activeFilters.join(", ")}`
    : "Selected filters: None";

  elements.filtersInfo.innerHTML = `
    <p class="filter-text">${filtersText}</p>
    ${sortText ? `<p class="sort-text">${sortText}</p>` : ""}
  `;
};

// RESET FILTERS //
const resetFilters = () => {
  elements.errorContainer.innerHTML = "";

  [elements.dietFilter, elements.cuisineFilter, elements.timeFilter].forEach(filter => {
    filter.value = "all";
    filter.classList.remove("active-filter");
    filter.style.backgroundColor = "#ccffe2";
    filter.style.color = "#0018a4";
    filter.style.border = "2px solid #FAFBFF";
  });

  elements.sortFilter.value = "none";
  elements.sortFilter.classList.remove("sort-active");
  elements.sortFilter.style.backgroundColor = "#ffecea";
  elements.sortFilter.style.color = "#0018a4";
  elements.sortFilter.style.border = "2px solid #FAFBFF";

  elements.searchInput.value = "";
  elements.filtersInfo.innerHTML = "";

  state.currentPage = 1;
  setItemsPerPage();
  displayRecipes(filterAndSortRecipes());
};

// FILTER FUNCTIONS //
const filterByDiet = recipe => {
  if (elements.dietFilter.value === "all") return true;

  const selectedDiet = elements.dietFilter.value.replace("-", " ").toLowerCase();
  const dietProperties = {
    "vegan": recipe.vegan,
    "vegetarian": recipe.vegetarian,
    "gluten free": recipe.glutenFree,
    "dairy free": recipe.dairyFree
  };

  return dietProperties[selectedDiet] ||
    (Array.isArray(recipe.diets) && recipe.diets.some(diet =>
      diet.toLowerCase() === selectedDiet));
};

const filterByCuisine = recipe => {
  if (elements.cuisineFilter.value === "all") return true;

  return Array.isArray(recipe.cuisines) && recipe.cuisines.some(cuisine =>
    cuisine.toLowerCase() === elements.cuisineFilter.value.toLowerCase());
};

const filterByTime = recipe => {
  if (elements.timeFilter.value === "all" || !recipe.readyInMinutes) return true;

  const time = recipe.readyInMinutes;
  const timeRanges = {
    "under-15": time < 15,
    "15-30": time >= 15 && time <= 30,
    "30-60": time > 30 && time <= 60,
    "over-60": time > 60
  };

  return timeRanges[elements.timeFilter.value] || false;
};

// SORT RECIPES //
const sortRecipes = recipes => {
  const sortValue = elements.sortFilter.value;
  if (sortValue === "none") return recipes;

  const sortedRecipes = [...recipes];

  switch (sortValue) {
    case "time-asc":
      return sortedRecipes.sort((a, b) =>
        (a.readyInMinutes || 0) - (b.readyInMinutes || 0));
    case "popularity-desc":
      return sortedRecipes.sort((a, b) =>
        (b.aggregateLikes || 0) - (a.aggregateLikes || 0));
    default:
      return sortedRecipes;
  }
};

// GET RANDOM RECIPE //
const getRandomRecipeFromList = recipes => {
  return recipes[Math.floor(Math.random() * recipes.length)];
};

const getRandomRecipe = () => {
  if (state.recipes.length === 0) return;

  const filteredRecipes = filterAndSortRecipes();
  if (filteredRecipes.length === 0) return;

  const randomRecipe = getRandomRecipeFromList(filteredRecipes);
  displayRecipes([randomRecipe]);
};

// SEARCH RECIPES //
const searchRecipes = () => {
  const searchTerm = elements.searchInput.value.toLowerCase().trim();

  state.currentPage = 1;

  if (!searchTerm) {
    displayRecipes(filterAndSortRecipes());
    return;
  }

  const matchesSearch = recipe => {
    const searchFields = [
      recipe.title,
      ...(recipe.cuisines || []),
      ...(recipe.diets || []),
      ...(recipe.extendedIngredients?.map(ing => ing.name) || [])
    ];

    return searchFields.some(field =>
      field?.toString().toLowerCase().includes(searchTerm)
    );
  };

  const searchResults = filterAndSortRecipes().filter(matchesSearch);
  displayRecipes(searchResults);
};

// FILTER & SORT LOGIC //
const filterAndSortRecipes = () => {
  return sortRecipes(
    state.recipes.filter(recipe =>
      filterByDiet(recipe) &&
      filterByCuisine(recipe) &&
      filterByTime(recipe)));
};

// PAGINATION //
const getPaginatedRecipes = recipeList => {
  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const endIndex = startIndex + state.itemsPerPage;
  return recipeList.slice(startIndex, endIndex);
};

const updatePaginationControls = (recipeList) => {
  const totalPages = Math.ceil(recipeList.length / state.itemsPerPage);
  const currentPageSpan = document.getElementById("currentPageDisplay");

  currentPageSpan.textContent = `Page ${state.currentPage} of ${totalPages}`;
  document.getElementById("prevPage").disabled = state.currentPage === 1;
  document.getElementById("nextPage").disabled = state.currentPage === totalPages;
};


// EVENT LISTENERS //
const initializeEventListeners = () => {
  [elements.dietFilter, elements.cuisineFilter,
  elements.timeFilter].forEach(filter => {
    filter.addEventListener("change", () => {
      state.currentPage = 1;
      updateFilterStyle(filter);
      updateFiltersInfo();
      displayRecipes(filterAndSortRecipes());
    });
  });

  elements.sortFilter.addEventListener("change", () => {
    state.currentPage = 1;
    updateFilterStyle(elements.sortFilter);
    updateFiltersInfo();
    displayRecipes(filterAndSortRecipes());
  });

  elements.clearBtn.addEventListener("click", () => {
    resetFilters();
    displayRecipes(state.recipes);
  });

  elements.randomBtn.addEventListener("click", getRandomRecipe);
  elements.searchInput.addEventListener("input", searchRecipes);
};

document.getElementById("prevPage").addEventListener("click", () => {
  if (state.currentPage > 1) {
    state.currentPage--;
    displayRecipes(state.filteredRecipes);
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  const totalPages = Math.ceil(state.filteredRecipes.length / state.itemsPerPage);
  if (state.currentPage < totalPages) {
    state.currentPage++;
    displayRecipes(state.filteredRecipes);
  }
});



// INITIALIZE PAGE //
document.addEventListener("DOMContentLoaded", () => {
  setItemsPerPage();
  loadSavedRecipes();
  initializeEventListeners();
});

