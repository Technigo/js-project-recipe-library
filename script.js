// Recipe Library - Spoonacular API with localStorage caching
// backupData is loaded globally from backupdata.js script tag

// === UI HELPERS ===

/** Update sort button styling based on selection */
function updateSortSelectedClass() {
    const sortOptions = document.querySelectorAll('.filter-group.sort-group .filter-option');
    sortOptions.forEach(option => {
        const input = option.querySelector('input[type="radio"]');
        if (input && input.checked) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// === API CONFIGURATION & GLOBAL STATE ===

const API_CONFIG = {
    BASE_URL: 'https://api.spoonacular.com',
    API_KEY: '5607f37e52ff4b879d8f5006edbca556',  
    ENDPOINTS: {
        RANDOM: '/recipes/random'
    }
};

// Global recipe storage
let allRecipes = [];
let recipes = [];
let displayedRecipes = [];

// Pagination settings
let recipesPerPage = 15;
let currentPage = 1;

// === DOM ELEMENT REFERENCES ===

const clearFiltersBtn = document.getElementById('clear-filters-btn');
const randomRecipeBtn = document.getElementById('random-recipe-btn');
const favoritesBtn = document.getElementById('favorites-btn');
const recipeContainer = document.getElementById('recipe-container');
const messageDisplay = document.getElementById('message-display');
const searchInput = document.getElementById('search-input');


// === API FUNCTIONS ===

/**
 * Fetch recipes from Spoonacular API with caching fallback
 * ALWAYS merges cache + backup data for maximum variety
 * @param {number} count - Number of recipes to fetch (max: 100)
 * @returns {Promise<Array>} - Array of recipe objects
 */
async function fetchRecipesFromAPI(count = 100) {
    // Helper function to merge cached and backup recipes
    const getMergedRecipes = () => {
        const cachedRecipes = getCachedRecipes() || [];
        const mappedBackup = backupData.recipes.map(mapSpoonacularToLocal);
        
        // Merge both sources, removing duplicates by ID
        const combinedRecipes = [...cachedRecipes];
        const existingIds = new Set(cachedRecipes.map(r => r.id));
        
        let addedFromBackup = 0;
        mappedBackup.forEach(recipe => {
            if (!existingIds.has(recipe.id)) {
                combinedRecipes.push(recipe);
                addedFromBackup++;
            }
        });
        
        return combinedRecipes;
    };

    // If no API key, use merged cache + backup immediately
    if (!API_CONFIG.API_KEY) {
        console.warn('⚠️ No API key found - using merged cache + backup data');
        const mergedRecipes = getMergedRecipes();
        showMessage(`📚 Using ${mergedRecipes.length} recipes (cache + backup library)`, 'success');
        setCachedRecipes(mergedRecipes);
        return mergedRecipes.slice(0, count);
    }

    try {
        await showMessage('🔄 Fetching fresh recipes from Spoonacular...', 'loading', 2000);
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RANDOM}?number=${count}&apiKey=${API_CONFIG.API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const mappedRecipes = data.recipes.map(mapSpoonacularToLocal);
        setCachedRecipes(mappedRecipes);
        return mappedRecipes;
        
    } catch (error) {
        console.error('❌ Failed to fetch recipes:', error);
        
        // Use merged cache + backup data when API fails
        const mergedRecipes = getMergedRecipes();
        const cachedCount = (getCachedRecipes() || []).length;
        
        if (cachedCount > 0) {
            showMessage(`⚠️ API failed - Using ${mergedRecipes.length} recipes (${cachedCount} cached + ${backupData.recipes.length} backup)`, 'success');
        } else {
            showMessage(`📚 Using ${mergedRecipes.length} recipes from backup library`, 'success');
        }
        
        setCachedRecipes(mergedRecipes);
        return mergedRecipes.slice(0, count);
    }
}

/**
 * Transform Spoonacular API data to our local format
 * @param {object} spoonacularRecipe - Recipe from Spoonacular API
 * @returns {object} - Normalized recipe object
 */
function mapSpoonacularToLocal(spoonacularRecipe) {
    const diets = [];
    if (spoonacularRecipe.vegetarian) diets.push('vegetarian');
    if (spoonacularRecipe.vegan) diets.push('vegan');
    if (spoonacularRecipe.glutenFree) diets.push('gluten-free');
    if (spoonacularRecipe.dairyFree) diets.push('dairy-free');

    const cuisine = spoonacularRecipe.cuisines && spoonacularRecipe.cuisines.length > 0 
        ? spoonacularRecipe.cuisines[0] 
        : 'International';

    const ingredients = spoonacularRecipe.extendedIngredients 
        ? spoonacularRecipe.extendedIngredients.map(ing => ing.name)
        : [];

    const pricePerServing = spoonacularRecipe.pricePerServing 
        ? (spoonacularRecipe.pricePerServing / 100).toFixed(2)
        : 2.5;

    const popularity = spoonacularRecipe.aggregateLikes || 
                      Math.round(spoonacularRecipe.spoonacularScore) || 
                      50;

    return {
        id: spoonacularRecipe.id,
        title: spoonacularRecipe.title,
        image: spoonacularRecipe.image,
        readyInMinutes: spoonacularRecipe.readyInMinutes || 30,
        servings: spoonacularRecipe.servings || 4,
        sourceUrl: spoonacularRecipe.sourceUrl || spoonacularRecipe.spoonacularSourceUrl,
        diets: diets,
        cuisine: cuisine,
        ingredients: ingredients,
        pricePerServing: parseFloat(pricePerServing),
        popularity: popularity
    };
}

/**
 * Save recipes to localStorage with 24-hour expiration
 * @param {Array} recipesToCache - Recipes to cache
 */
function setCachedRecipes(recipesToCache) {
    try {
        const cacheData = {
            recipes: recipesToCache,
            timestamp: Date.now(),
            expires: Date.now() + (24 * 60 * 60 * 1000)
        };
        localStorage.setItem('spoonacular_recipes', JSON.stringify(cacheData));
        console.log(`✅ Cached ${recipesToCache.length} recipes`);
    } catch (error) {
        console.warn('⚠️ Failed to cache recipes:', error);
    }
}

/**
 * Get cached recipes from localStorage if not expired
 * @returns {Array|null} - Cached recipes or null
 */
function getCachedRecipes() {
    try {
        const cached = localStorage.getItem('spoonacular_recipes');
        if (!cached) return null;
        
        const cacheData = JSON.parse(cached);
        
        if (Date.now() > cacheData.expires) {
            localStorage.removeItem('spoonacular_recipes');
            return null;
        }
        
        return cacheData.recipes;
    } catch (error) {
        console.warn('Failed to retrieve cached recipes:', error);
        return null;
    }
}

/** Initialize recipes from API */
async function initializeRecipes() {
    try {
        const allFetchedRecipes = await fetchRecipesFromAPI(100);
        allRecipes = allFetchedRecipes;
        recipes = allFetchedRecipes;
        
        if (allRecipes.length === 0) {
            showMessage('❌ No recipes available. Please check your API configuration and internet connection.', 'error');
        }
        
        return allRecipes;
    } catch (error) {
        console.error('Failed to initialize recipes:', error);
        allRecipes = [];
        recipes = [];
        showMessage('❌ Failed to load recipes. Please try refreshing the page.', 'error');
        return [];
    }
}

// === FAVORITES SYSTEM ===

// Initialize favorites from localStorage
let favoriteRecipes = JSON.parse(localStorage.getItem('favorite_recipes') || '[]');
let isShowingFavorites = false;

/** Toggle favorite status of a recipe */
function toggleFavorite(recipeId) {
    const index = favoriteRecipes.indexOf(recipeId);
    
    if (index > -1) {
        favoriteRecipes.splice(index, 1);
        showMessage('❤️ Removed from favorites', 'success');
    } else {
        favoriteRecipes.push(recipeId);
        showMessage('💖 Added to favorites', 'success');
    }
    
    localStorage.setItem('favorite_recipes', JSON.stringify(favoriteRecipes));
    updateHeartIcons();
}

window.toggleFavorite = toggleFavorite;

/** Update heart icons for all displayed recipes */
function updateHeartIcons() {
    document.querySelectorAll('.heart-btn').forEach(btn => {
        const recipeId = parseInt(btn.dataset.recipeId);
        const isFavorited = favoriteRecipes.includes(recipeId);
        
        btn.querySelector('.heart-icon').textContent = isFavorited ? '💖' : '🤍';
        btn.classList.toggle('favorited', isFavorited);
    });
}

/** Show only favorited recipes */
function showFavoritesView() {
    const favRecipes = allRecipes.filter(r => favoriteRecipes.includes(r.id));
    
    if (favRecipes.length === 0) {
        recipeContainer.innerHTML = `
            <div class="empty-state">
                <h3>No favorites yet 💔</h3>
                <p>Click the heart icon to save recipes!</p>
            </div>
        `;
        showMessage('Start adding favorites!', 'error');
        return;
    }
    
    isShowingFavorites = true;
    favoritesBtn.classList.add('selected');
    displayMultipleRecipes(favRecipes);
    showMessage(`💖 ${favRecipes.length} favorite${favRecipes.length === 1 ? '' : 's'}`, 'success');
}

/** Show all recipes (exit favorites view) */
function showAllRecipesView() {
    isShowingFavorites = false;
    favoritesBtn.classList.remove('selected');
    displayMultipleRecipes(allRecipes);
    showMessage('👋 All recipes', 'success');
}

// === FILTER & DISPLAY FUNCTIONS ===

/** Get all current filter selections */
function getAllFilters() {
    return {
        diet: getSelectedFilter('diet'),
        cuisine: getSelectedFilter('cuisine'),
        sort: getSelectedFilter('sort')
    };
}

/**
 * Search recipes by title or ingredients
 * @param {string} searchTerm - Search text
 * @param {array} recipesToSearch - Recipes to search
 * @returns {array} - Matching recipes
 */
function searchRecipes(searchTerm, recipesToSearch = allRecipes) {
    if (!searchTerm || searchTerm.trim() === '') {
        return recipesToSearch;
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    return recipesToSearch.filter(recipe => {
        const titleMatch = recipe.title.toLowerCase().includes(term);
        const ingredientMatch = recipe.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(term)
        );
        return titleMatch || ingredientMatch;
    });
}

/**
 * Filter recipes by selected criteria
 * @param {object} filters - Filter object
 * @param {array} recipesToFilter - Recipes to filter
 * @returns {array} - Filtered recipes
 */
function filterRecipes(filters, recipesToFilter = recipes) {
    return recipesToFilter.filter(recipe => {
        // Diet filter
        if (filters.diet && !recipe.diets.includes(filters.diet)) {
            return false;
        }
        
        // Cuisine filter
        if (filters.cuisine && recipe.cuisine.toLowerCase() !== filters.cuisine.toLowerCase()) {
            return false;
        }
        
        return true;
    });
}

/**
 * Sort recipes by specified criteria
 * @param {array} recipesToSort - Recipes to sort
 * @param {string} sortBy - Sort field
 * @param {boolean} ascending - Sort direction
 * @returns {array} - Sorted recipes
 */
function sortRecipes(recipesToSort, sortBy, ascending = true) {
    const sorted = [...recipesToSort].sort((a, b) => {
        let valueA, valueB;
        
        switch(sortBy) {
            case 'cooking-time':
                valueA = a.readyInMinutes;
                valueB = b.readyInMinutes;
                break;
            case 'popularity':
                valueA = a.popularity;
                valueB = b.popularity;
                break;
            default:
                return 0;
        }
        
        return ascending ? valueA - valueB : valueB - valueA;
    });
    
    return sorted;
}

/**
 * Creates HTML for a recipe card using real recipe data
 * Uses template literals (backticks) to create HTML string
 * @param {object} recipe - Recipe object from the recipes array
 * @returns {string} HTML string for the recipe card
 */
function createRecipeCardHTML(recipe) {
    // Step 1: Create a shortened ingredients list (max 6 ingredients)
    // .slice(0, 6) gets first 6 items
    // .join(', ') puts them together with commas
    const ingredientsList = recipe.ingredients.slice(0, 6).join(', ') + 
                           (recipe.ingredients.length > 6 ? '...' : '');
    
    // Step 2: Check if recipe is favorited to show correct heart icon
    const isFavorited = favoriteRecipes.includes(recipe.id);
    const heartIcon = isFavorited ? '💖' : '🤍';  // Filled or outline heart
    const heartClass = isFavorited ? 'favorited' : '';
    
    // Step 3: Return HTML string using template literals
    // ${} inserts JavaScript values into the string
    return `
        <div class="recipe-card">
            <div class="recipe-image">
                <img src="${recipe.image}" alt="${recipe.title}" loading="lazy" />
                <button class="heart-btn ${heartClass}" data-recipe-id="${recipe.id}" onclick="toggleFavorite(${recipe.id})">
                    <span class="heart-icon">${heartIcon}</span>
                </button>
            </div>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="recipe-meta">
                    <span class="recipe-time">⏱️ ${recipe.readyInMinutes} min</span>
                    <span class="recipe-difficulty">👨‍🍳 ${recipe.servings} servings</span>
                </div>
                <div class="recipe-details">
                    <div><strong>Cuisine:</strong> ${recipe.cuisine}</div>
                    <div><strong>Diet:</strong> ${recipe.diets.length > 0 ? recipe.diets.join(', ') : 'No restrictions'}</div>
                    <div><strong>Price:</strong> $${recipe.pricePerServing}/serving</div>
                </div>
                <div class="recipe-description">
                    <strong>Ingredients:</strong> ${ingredientsList}
                </div>
            </div>
        </div>
    `;
}

/**
 * Display multiple recipes with pagination
 * @param {array} recipesToDisplay - Array of recipe objects to display
 */
function displayMultipleRecipes(recipesToDisplay) {
    displayedRecipes = recipesToDisplay;
    displayPage(recipesToDisplay, 1);
}

/**
 * Display a specific page of recipes
 * @param {array} recipes - All recipes to display
 * @param {number} pageNum - Page number to show
 */
function displayPage(recipes, pageNum = 1) {
    if (recipes.length === 0) {
        displayEmptyState();
        return;
    }
    
    const totalPages = Math.ceil(recipes.length / recipesPerPage);
    currentPage = Math.max(1, Math.min(pageNum, totalPages));
    
    const startIndex = (currentPage - 1) * recipesPerPage;
    const endIndex = startIndex + recipesPerPage;
    const pageRecipes = recipes.slice(startIndex, endIndex);
    
    const recipeCards = pageRecipes.map(r => createRecipeCardHTML(r)).join('');
    
    recipeContainer.innerHTML = `
        <div class="recipe-grid">${recipeCards}</div>
        ${totalPages > 1 ? createPaginationHTML(totalPages) : ''}
    `;
    
    const startNum = startIndex + 1;
    const endNum = startIndex + pageRecipes.length;
    const message = totalPages > 1
        ? `📚 ${startNum}-${endNum} of ${recipes.length} (Page ${currentPage}/${totalPages})`
        : `📚 ${recipes.length} recipe${recipes.length === 1 ? '' : 's'}`;
    showMessage(message, 'success');
}

/**
 * Create pagination HTML
 * @param {number} totalPages - Total number of pages
 * @returns {string} HTML for pagination buttons
 */
function createPaginationHTML(totalPages) {
    return `
        <div class="pagination">
            <button class="pagination-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                ← Previous
            </button>
            <span class="pagination-info">Page ${currentPage} of ${totalPages}</span>
            <button class="pagination-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                Next →
            </button>
        </div>
    `;
}

/**
 * Navigate to a specific page
 * @param {number} pageNum - Page number to go to
 */
function goToPage(pageNum) {
    displayPage(displayedRecipes, pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.goToPage = goToPage;

/**
 * Display empty state when no recipes match filters
 * Shows friendly message encouraging user to adjust filters
 */
function displayEmptyState() {
    recipeContainer.innerHTML = `
        <div class="empty-state">
            <h3>No recipes found 😕</h3>
            <p>Try adjusting your filters to find more recipes!</p>
        </div>
    `;
    showMessage('No recipes match your current filters. Try different selections!', 'error');
}

/**
 * Display a single recipe card
 * Simpler version for showing just one recipe
 * @param {object} recipe - Recipe object to display
 */
function displayRecipe(recipe) {
    // Replace container content with single recipe card
    recipeContainer.innerHTML = createRecipeCardHTML(recipe);
}

/**
 * Show a message to the user
 * Updates the message display area with text and styling
 * @param {string} message - Message to display
 * @param {string} type - Type of message ('success', 'error', or 'loading')
 * @param {number} minDisplayTime - Minimum time to display message in milliseconds (default: 0)
 * @returns {Promise} - Resolves after minimum display time for loading messages
 */
function showMessage(message, type = '', minDisplayTime = 0) {
    // Step 1: Set the text content
    messageDisplay.textContent = message;
    
    // Step 2: Set CSS classes for styling
    // The type determines the color (green for success, red for error)
    messageDisplay.className = `message-display ${type}`;
    
    // Step 3: Return promise for minimum display time (used for loading states)
    if (minDisplayTime > 0) {
        return new Promise(resolve => setTimeout(resolve, minDisplayTime));
    }
    return Promise.resolve();
}

/**
 * Get and display a random recipe
 * Picks one random recipe from all available recipes
 */
function getRandomRecipe() {
    // Step 1: Generate random index
    // Math.random() gives number between 0 and 1
    // Multiply by array length, then floor() rounds down to whole number
    const randomIndex = Math.floor(Math.random() * allRecipes.length);
    
    // Step 2: Get the recipe at that random index
    const randomRecipe = allRecipes[randomIndex];
    
    // Step 3: Clear any existing filters for clean display
    clearAllFiltersQuiet();
    
    // Step 4: Display the single random recipe
    // Wrap in array because displayMultipleRecipes expects an array
    displayMultipleRecipes([randomRecipe]);
    
    // Step 5: Show fun message
    showMessage(`🎲 Here's a random recipe for you: ${randomRecipe.title}! Feeling adventurous?`, 'success');
}

// -------------------------------------------
// State Management Functions
// -------------------------------------------

/**
 * SEARCH INPUT HANDLER: Handle search input with debouncing
 * Delays filtering until user stops typing (300ms delay)
 * Prevents excessive filtering while user is still typing
 */
let searchTimeout; // Store the timeout ID so we can cancel it
function handleSearchInput() {
    // Step 1: Cancel any previous timeout
    // This ensures we only filter once user stops typing
    clearTimeout(searchTimeout);
    
    // Step 2: Set new timeout to filter after 300ms
    searchTimeout = setTimeout(() => {
        // Step 3: Trigger the filter system
        findRecipe();
    }, 300); // 300ms delay
}

/**
 * Clear all filters without updating the display
 * Resets all filter dropdowns and radio buttons to default state
 */
function clearAllFiltersQuiet() {
    // Clear select filters
    const dietFilter = document.getElementById('diet-filter');
    const cuisineFilter = document.getElementById('cuisine-filter');
    
    if (dietFilter) dietFilter.value = '';
    if (cuisineFilter) cuisineFilter.value = '';
    
    // Clear all radio buttons
    const allRadios = document.querySelectorAll('input[type="radio"]');
    allRadios.forEach(radio => {
        radio.checked = false;
    });
    
    // Clear search input
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Reset sort order to ascending (default)
    const orderDesc = document.getElementById('order-desc');
    const orderAsc = document.getElementById('order-asc');
    orderDesc.classList.remove('selected');
    orderAsc.classList.add('selected');
    
    // Update sort display
    updateSortSelectedClass();
}

/**
 * Clear all filter selections and reset the display
 * Like clearAllFiltersQuiet but also shows all recipes again
 */
function clearAllFilters() {
    // Clear native select filters
    const dietFilter = document.getElementById('diet-filter');
    const cuisineFilter = document.getElementById('cuisine-filter');
    
    if (dietFilter) dietFilter.value = '';
    if (cuisineFilter) cuisineFilter.value = '';
    
    // Clear all radio buttons (sort options)
    const allRadios = document.querySelectorAll('input[type="radio"]');
    allRadios.forEach(radio => {
        radio.checked = false;
    });
    
    // Step 3: Clear search input
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Step 4: Reset sort order to ascending (default)
    const orderDesc = document.getElementById('order-desc');
    const orderAsc = document.getElementById('order-asc');
    orderDesc.classList.remove('selected');
    orderAsc.classList.add('selected');
    
    // Step 5: Update sort display
    updateSortSelectedClass();
    
    // Step 6: Show all recipes again
    displayMultipleRecipes(allRecipes);
    showMessage('👋 Filters cleared! Showing all recipes.');
}

/**
 * Main function that handles filtering and displaying recipes
 * This is called every time a filter changes
 */
function findRecipe() {
    // Exit favorites view if user is applying filters
    if (isShowingFavorites) {
        isShowingFavorites = false;
        favoritesBtn.classList.remove('selected');
    }
    
    // Get all current filter selections
    const filters = getAllFilters();
    
    // Get search term from search input
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    
    // Start with all available recipes
    let recipesToShow = [...allRecipes];
    
    // Apply search filter first (if there's a search term)
    if (searchTerm) {
        recipesToShow = searchRecipes(searchTerm, recipesToShow);
    }
    
    // Check if any filters are active
    const hasAnyFilter = filters.diet || filters.cuisine;
    
    // Apply filters if any are selected
    if (hasAnyFilter) {
        recipesToShow = filterRecipes(filters, recipesToShow);
    }
    
    // Apply sorting if a sort option is selected
    if (filters.sort && recipesToShow.length > 0) {
        const orderDesc = document.getElementById('order-desc');
        const ascending = !orderDesc.classList.contains('selected');
        recipesToShow = sortRecipes(recipesToShow, filters.sort, ascending);
    }
    
    // Update the global recipes array
    recipes = recipesToShow;
    
    // Display the filtered/sorted recipes
    displayMultipleRecipes(recipesToShow);
    
    // Create informative message
    let message = '';
    if (searchTerm || hasAnyFilter) {
        const totalCount = recipesToShow.length;
        message = `Found ${totalCount} recipe${totalCount === 1 ? '' : 's'}`;
        
        if (searchTerm) message += ` matching "${searchTerm}"`;
        if (filters.diet) message += ` for ${filters.diet} diet`;
        if (filters.cuisine) message += ` from ${filters.cuisine} cuisine`;
        if (filters.sort) {
            const orderDesc = document.getElementById('order-desc');
            const order = orderDesc.classList.contains('selected') ? 'descending' : 'ascending';
            message += `, sorted by ${filters.sort.replace('-', ' ')} (${order})`;
        }
    } else {
        const totalCount = recipesToShow.length;
        message = `Showing ${totalCount} recipes`;
        if (filters.sort) {
            const orderDesc = document.getElementById('order-desc');
            const order = orderDesc.classList.contains('selected') ? 'descending' : 'ascending';
            message += `, sorted by ${filters.sort.replace('-', ' ')} (${order})`;
        }
        if (totalCount > recipesPerPage) {
            message += ` (scroll for more)`;
        }
    }
    
    // Step 12: Show appropriate message
    if (recipesToShow.length === 0) {
        showMessage('No recipes match your filters. Try adjusting your selections!', 'error');
    } else {
        showMessage(message, 'success');
    }
}

// ===============================================
// SECTION 7: EVENT HANDLERS & INITIALIZATION
// ===============================================
// Event listeners let us respond to user actions like clicks and scrolls

/**
 * Clear Filters Button Click Handler
 * When user clicks the broom button, clear all filters and show all recipes
 */
clearFiltersBtn.addEventListener('click', function() {
    clearAllFilters();
});

/**
 * Random Recipe Button Click Handler
 * When user clicks the dice button, show one random recipe
 */
randomRecipeBtn.addEventListener('click', function() {
    getRandomRecipe();
});

/**
 * Favorites Button Click Handler
 * When user clicks heart button, toggle between favorites view and all recipes view
 */
favoritesBtn.addEventListener('click', function() {
    if (isShowingFavorites) {
        showAllRecipesView();  // Currently showing favorites → switch to all recipes
    } else {
        showFavoritesView();   // Currently showing all → switch to favorites only
    }
});

// Document ready - runs when the page finishes loading
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize recipes from API
    await showMessage('🔄 Loading recipes...', 'loading', 2000);
    
    try {
        await initializeRecipes();
        
        // Display all recipes on page load with infinite scroll
        displayMultipleRecipes(allRecipes);
        showMessage('👋 Welcome! Browse all recipes below or use filters to find your perfect match.');
        
    } catch (error) {
        console.error('Failed to load recipes:', error);
        showMessage('⚠️ Failed to load recipes. Please try refreshing the page.', 'error');
    }

    // Add event listener to search input
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
    }
    
    // Add event listeners to select filters
    const dietFilter = document.getElementById('diet-filter');
    const cuisineFilter = document.getElementById('cuisine-filter');
    
    if (dietFilter) {
        dietFilter.addEventListener('change', findRecipe);
    }
    
    if (cuisineFilter) {
        cuisineFilter.addEventListener('change', findRecipe);
    }
    
    // Add event listeners to radio buttons (sort)
    const allRadios = document.querySelectorAll('input[type="radio"]');
    allRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateSortSelectedClass();
            findRecipe();
        });
    });
    
    // Add event listeners to order direction buttons
    const orderDesc = document.getElementById('order-desc');
    const orderAsc = document.getElementById('order-asc');
    
    // Set default to ascending
    orderAsc.classList.add('selected');
    
    orderDesc.addEventListener('click', function() {
        orderDesc.classList.add('selected');
        orderAsc.classList.remove('selected');
        findRecipe();
    });
    
    orderAsc.addEventListener('click', function() {
        orderAsc.classList.add('selected');
        orderDesc.classList.remove('selected');
        findRecipe();
    });
    
    // Initial state for sort selected
    updateSortSelectedClass();
});

// FILTER HELPER FUNCTIONS

/**
 * Get selected value from filter (native select) or sort (radio buttons)
 * @param {string} name - Filter name ('diet', 'cuisine', 'sort')
 * @returns {string} Selected value or empty string
 */
function getSelectedFilter(name) {
    // For select dropdowns (diet, cuisine)
    const select = document.getElementById(`${name}-filter`);
    if (select) {
        return select.value;
    }
    
    // For radio buttons (sort)
    const selectedRadio = document.querySelector(`input[name="${name}"]:checked`);
    return selectedRadio ? selectedRadio.value : '';
}
