// Constants
const API_KEY = 'd003d333cdad4f2ab6b218a0b87d79f2';
const BASE_URL = 'https://api.spoonacular.com/recipes/complexSearch';
const LOCAL_STORAGE_KEY = 'recipeLibraryCache';
const LIKED_RECIPES_KEY = 'likedRecipes';
const AVAILABLE_FILTERS = ["Mediterranean", "Middle Eastern", "Asian", "Italian", "Mexican", "European"];

// DOM Elements
const elements = {
  recipeSection: document.querySelector('.recipe-card-section'),
  recipeCount: document.querySelector('.recipe-count'),
  filterCheckboxes: document.querySelectorAll('input[name="filter"]'),
  sortRadioButtons: document.querySelectorAll('input[name="sort"]'),
  randomRecipeButton: document.querySelector('.random-recipe-button'),
  favoriteRecipeButton: document.getElementById('favorite-recipe-button'),
  searchBar: document.querySelector('.search-input'),
  sortButton: document.querySelector('.sort-button'),
  sortOptions: document.querySelector('.sort-options'),
  showFilterButton: document.getElementById('filter-button'),
  filterSection: document.querySelector('.recipe-filter-section'),
  loadingIndicator: document.createElement('div'),
  overlay: document.querySelector('.overlay')
};

// State
let state = {
  allRecipes: [],
  currentFilter: 'all' // 'all', 'random', 'favorites'
};

// Initialize loading indicator
elements.loadingIndicator.classList.add('loading-indicator');
elements.recipeSection.appendChild(elements.loadingIndicator);


// Loading indicator functions
const loadingIndicator = {
  show: () => {
    elements.loadingIndicator.style.display = 'block';
    elements.recipeSection.innerHTML = '';
    elements.recipeSection.appendChild(elements.loadingIndicator);
  },

  hide: () => {
    elements.loadingIndicator.style.display = 'none';
  }
};

// Recipe utility functions
const recipeUtils = {
  findFirstMatchingCuisine: (recipeCuisines) => {
    if (!recipeCuisines || recipeCuisines.length === 0) {
      return '';
    }

    for (const cuisine of recipeCuisines) {
      if (AVAILABLE_FILTERS.includes(cuisine)) {
        return cuisine;
      }
    }
    return '';
  },

  displayErrorMessage: (message, statusCode) => {
    elements.recipeSection.innerHTML = '';
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');

    if (statusCode === 402) {
      errorMessage.innerHTML = `
        <p>Oops! Looks like our recipe ingredients got lost in the digital kitchen. Please try again in a moment — we're cooking up a fix!</p>
      `;
    } else {
      errorMessage.innerHTML = `
        <p>An error occurred: ${message}</p>
        <p>Please try again later.</p>
      `;
    }

    elements.recipeSection.appendChild(errorMessage);
    recipeDisplay.updateRecipeCount(0);
  }
};

// API and data handling functions
const dataService = {
  fetchRecipes: () => {
    const cachedRecipes = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (cachedRecipes) {
      state.allRecipes = JSON.parse(cachedRecipes);
      console.log('Recipes loaded from cache');
      dataService.loadLikedStates();
      recipeDisplay.displayFilteredSortedRecipes();
      return;
    }

    loadingIndicator.show();
    const url = `${BASE_URL}?number=40&apiKey=${API_KEY}&instructionsRequired=true&addRecipeInformation=true&fillIngredients=true&cuisine=${AVAILABLE_FILTERS.join(',')}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 402) {
            throw new Error('API quota limit reached. Please try again later.');
          } else {
            throw new Error(`API request failed with status: ${response.status}`);
          }
        }
        return response.json();
      })
      .then((data) => {
        state.allRecipes = data.results.map(recipe => ({
          ...recipe,
          firstMatchingCuisine: recipeUtils.findFirstMatchingCuisine(recipe.cuisines),
          isLiked: false
        }));

        console.log('Recipes loaded from API');
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.allRecipes));
        dataService.loadLikedStates();
        recipeDisplay.displayFilteredSortedRecipes();
        loadingIndicator.hide();
      })
      .catch((error) => {
        console.error('Error fetching recipes:', error);
        recipeUtils.displayErrorMessage(error.message, error.message.includes('quota') ? 402 : null);
        loadingIndicator.hide();
      });
  },

  saveLikedStates: () => {
    const likedStates = state.allRecipes.map(recipe => ({
      id: recipe.id,
      isLiked: recipe.isLiked,
    }));
    localStorage.setItem(LIKED_RECIPES_KEY, JSON.stringify(likedStates));
  },

  loadLikedStates: () => {
    const storedLikedStates = localStorage.getItem(LIKED_RECIPES_KEY);
    if (storedLikedStates) {
      const likedStates = JSON.parse(storedLikedStates);
      likedStates.forEach(likedState => {
        const recipe = state.allRecipes.find(r => r.id === likedState.id);
        if (recipe) {
          recipe.isLiked = likedState.isLiked;
        }
      });
    }
  }
};

// Recipe display functions
const recipeDisplay = {
  createRecipeCard: (recipeArray) => {
    elements.recipeSection.innerHTML = '';

    if (recipeArray.length === 0) {
      const noRecipesMessage = document.createElement('p');
      noRecipesMessage.textContent = 'No recipes found matching your criteria.';
      noRecipesMessage.classList.add('no-recipes-message');
      elements.recipeSection.appendChild(noRecipesMessage);
      recipeDisplay.updateRecipeCount(0);
      return;
    }

    const fragment = document.createDocumentFragment();

    recipeArray.forEach((recipe, index) => {
      const article = document.createElement('article');
      article.classList.add('recipe-card');
      article.setAttribute('data-index', index);

      const isFilled = recipe.isLiked ? 'filled' : '';

      article.innerHTML = `
        <div class="recipe-content">
          <div class="recipe-media">
            <img src="${recipe.image}" alt="${recipe.title}">
          </div>
          <div class="recipe-data">
            <h3>${recipe.title}</h3>
            <hr>
            <div class="recipe-info">
              <p><b>Cuisine:</b> ${recipe.firstMatchingCuisine}</p>
              <p><b>Time:</b> ${recipe.readyInMinutes} minutes</p>
              <p><b>Amount of ingredients:</b> ${recipe.extendedIngredients?.length}</p>
            </div>
            <div class="like-container">
              <span class="material-symbols-outlined like-button ${isFilled}">favorite</span>
              <p class="like-count">${recipe.aggregateLikes} likes</p>
            </div>
          </div>
        </div>
      `;

      fragment.appendChild(article);
    });

    elements.recipeSection.appendChild(fragment);
    recipeDisplay.updateRecipeCount(recipeArray.length);

    // Add event listeners
    document.querySelectorAll('.like-button').forEach((button, index) => {
      button.addEventListener('click', (event) => eventHandlers.handleLikeClick(index, event));
    });

    document.querySelectorAll('.recipe-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = card.getAttribute('data-index');
        eventHandlers.handleRecipeCardClick(index);
      });
    });
  },

  updateRecipeCount: (count) => {
    elements.recipeCount.innerHTML = `Recipes (${count})`;
  },

  filterRecipes: () => {
    const selectedFilters = Array.from(elements.filterCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);

    elements.showFilterButton.classList.toggle('active', selectedFilters.length > 0);

    let filteredRecipes = [...state.allRecipes];

    if (state.currentFilter === 'random') {
      filteredRecipes = state.allRecipes.filter(recipe => recipe.firstMatchingCuisine !== '');
      const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
      filteredRecipes = [filteredRecipes[randomIndex]];
    } else if (state.currentFilter === 'favorites') {
      filteredRecipes = state.allRecipes.filter(recipe => recipe.isLiked);
    } else if (selectedFilters.length > 0) {

      filteredRecipes = state.allRecipes.filter(recipe => {

        if (!recipe.cuisines || !Array.isArray(recipe.cuisines)) {
          return false;
        }

        // Case-insensitive comparison
        const recipeCuisines = recipe.cuisines.map(c => c.toLowerCase());
        const lowerCaseFilters = selectedFilters.map(f => f.toLowerCase());

        return recipeCuisines.some(cuisine =>
          lowerCaseFilters.includes(cuisine));
      });
    }

    return filteredRecipes;
  },

  sortRecipes: (recipes) => {
    const selectedSort = Array.from(elements.sortRadioButtons).find(radio => radio.checked);

    if (selectedSort) {
      const sortValue = selectedSort.value;
      elements.sortButton.classList.add('active');

      if (sortValue === 'mostPopularRecipes') {
        recipes.sort((a, b) => b.aggregateLikes - a.aggregateLikes);
      } else if (sortValue === 'shortestCookingTime') {
        recipes.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
      } else if (sortValue === 'fewestIngredients') {
        recipes.sort((a, b) => a.extendedIngredients.length - b.extendedIngredients.length);
      }
    } else {
      elements.sortButton.classList.remove('active');
    }

    return recipes;
  },

  displayFilteredSortedRecipes: () => {
    const filteredRecipes = recipeDisplay.filterRecipes();
    const sortedRecipes = recipeDisplay.sortRecipes([...filteredRecipes]);
    recipeDisplay.createRecipeCard(sortedRecipes);
  },

  searchRecipes: () => {
    const searchTerm = elements.searchBar.value.toLowerCase();
    const filteredRecipes = state.allRecipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm)
    );
    recipeDisplay.createRecipeCard(filteredRecipes);
  }
};

// UI interaction handlers
const uiInteractions = {
  showRandomRecipe: () => {
    if (state.currentFilter === 'random') {
      state.currentFilter = 'all';
      elements.randomRecipeButton.classList.remove('active');
    } else {
      state.currentFilter = 'random';
      elements.randomRecipeButton.classList.add('active');
      elements.favoriteRecipeButton.classList.remove('active');
    }
    recipeDisplay.displayFilteredSortedRecipes();
  },

  showLikedRecipes: () => {
    if (state.currentFilter === 'favorites') {
      state.currentFilter = 'all';
      elements.favoriteRecipeButton.classList.remove('active');
    } else {
      state.currentFilter = 'favorites';
      elements.favoriteRecipeButton.classList.add('active');
      elements.randomRecipeButton.classList.remove('active');
    }
    recipeDisplay.displayFilteredSortedRecipes();
  },

  toggleSortOptions: () => {
    elements.sortOptions.style.display = elements.sortOptions.style.display === 'block' ? 'none' : 'block';
  },

  toggleFilterSection: () => {
    elements.filterSection.classList.toggle('open');
    elements.overlay.classList.toggle('active');

    if (elements.filterSection.classList.contains('open')) {
      const closeButton = document.createElement('button');
      closeButton.classList.add('close-button');
      closeButton.textContent = 'X';
      closeButton.addEventListener('click', uiInteractions.closeFilterSection);
      elements.filterSection.appendChild(closeButton);
    } else {
      uiInteractions.closeFilterSection();
    }
  },

  closeFilterSection: () => {
    elements.filterSection.classList.remove('open');
    elements.overlay.classList.remove('active');
    const closeButton = elements.filterSection.querySelector('.close-button');
    if (closeButton) {
      closeButton.remove();
    }
  },

  resetFilterButtons: () => {
    elements.filterCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    elements.showFilterButton.classList.remove('active');
  }
}

// Event handlers
const eventHandlers = {
  handleLikeClick: (recipeIndex, event) => {
    event.stopPropagation();

    const recipe = state.allRecipes[recipeIndex];
    const likeButton = document.querySelectorAll('.like-button')[recipeIndex];
    const likeCountElement = document.querySelectorAll('.like-count')[recipeIndex];

    recipe.isLiked = !recipe.isLiked;
    recipe.aggregateLikes += recipe.isLiked ? 1 : -1;

    likeButton.classList.toggle('filled', recipe.isLiked);
    likeCountElement.textContent = `${recipe.aggregateLikes} likes`;

    dataService.saveLikedStates();
  },

  handleRecipeCardClick: (recipeIndex) => {
    const recipe = state.allRecipes[recipeIndex];
    if (recipe?.sourceUrl) {
      window.open(recipe.sourceUrl, '_blank');
    } else {
      console.error('Recipe or source URL not found.');
    }
  }
};

// Set up event listeners
const setupEventListeners = () => {
  elements.filterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {

      state.currentFilter = 'all';
      elements.randomRecipeButton.classList.remove('active');
      elements.favoriteRecipeButton.classList.remove('active');

      recipeDisplay.displayFilteredSortedRecipes();
    });
  });

  elements.sortRadioButtons.forEach(radioButton => {
    radioButton.addEventListener('change', recipeDisplay.displayFilteredSortedRecipes);
  });

  elements.randomRecipeButton.addEventListener('click', uiInteractions.showRandomRecipe);
  elements.favoriteRecipeButton.addEventListener('click', uiInteractions.showLikedRecipes);
  elements.searchBar.addEventListener('input', recipeDisplay.searchRecipes);
  elements.sortButton.addEventListener('click', uiInteractions.toggleSortOptions);
  elements.showFilterButton.addEventListener('click', uiInteractions.toggleFilterSection);
  elements.overlay.addEventListener('click', uiInteractions.closeFilterSection);
};

// Initialize application
const init = () => {
  setupEventListeners();
  dataService.fetchRecipes();
};

// Start the application
init();