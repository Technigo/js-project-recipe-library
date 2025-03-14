// API configuration
const API_CONFIG = {
    key: 'ae9a7ed28b524302b564a7e680a506ef',
    url: 'https://api.spoonacular.com/recipes/random',
    recipesPerFetch: 100,
    cacheExpiry: 60 * 60 * 1000 // 1 hour in milliseconds
};

class RecipeManager {
    constructor() {
        this.recipes = [];
        this.favorites = [];
        this.isLoading = false;
        this.currentPage = 1;
        this.recipesPerPage = 10;
        this.currentSort = 'none';
        this.filterMessages = [];
        this.currentFilters = {
            dietary: [],
            time: [],
            ingredients: [],
            search: ''
        };
        
        this.initializeDOM();
        this.setupEventListeners();
        this.loadFavorites();
        this.fetchRecipes();
    }

    initializeDOM() {
        // Cache DOM elements
        this.elements = {
            recipesContainer: document.getElementById('recipesContainer'),
            dietarySelect: document.querySelector('[data-filter-type="dietary"]'),
            timeSelect: document.querySelector('[data-filter-type="time"]'),
            ingredientsSelect: document.querySelector('[data-filter-type="ingredients"]'),
            sortSelect: document.querySelector('[data-filter-type="sort"]'),
            randomRecipeBtn: document.getElementById('randomRecipeBtn'),
            clearFiltersBtn: document.getElementById('clearFiltersBtn'),
            searchInput: document.querySelector('.search-input'),
            searchBtn: document.querySelector('.search-btn'),
            customSelects: document.querySelectorAll('.custom-select')
        };

        // Create and add favorites button
        this.elements.favoritesBtn = this.createFavoritesButton();
    }

    createFavoritesButton() {
        const headerButtons = document.querySelector('.header-buttons');
        const favoritesBtn = document.createElement('button');
        Object.assign(favoritesBtn, {
            id: 'favoritesBtn',
            className: 'favorites-btn',
            textContent: 'View Favorites'
        });
        headerButtons.appendChild(favoritesBtn);
        return favoritesBtn;
    }

    setupEventListeners() {
        // Setup custom select elements
        this.elements.customSelects.forEach(select => this.setupCustomSelect(select));

        // Global click handler for closing dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-select')) {
                this.elements.customSelects.forEach(select => select.classList.remove('open'));
            }
        });

        // Global escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.elements.customSelects.forEach(select => select.classList.remove('open'));
            }
        });

        // Button click handlers
        this.elements.randomRecipeBtn.addEventListener('click', () => this.handleRandomRecipe());
        this.elements.clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.favoritesBtn.addEventListener('click', () => this.toggleFavoritesView());

        // Search input handlers
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
    }

    setupCustomSelect(select) {
        const button = select.querySelector('.select-button');
        
        button.addEventListener('click', () => {
            const wasOpen = select.classList.contains('open');
            this.elements.customSelects.forEach(s => s.classList.remove('open'));
            if (!wasOpen) select.classList.add('open');
        });

        if (select.dataset.filterType !== 'sort') {
            this.setupFilterSelect(select);
        } else {
            this.setupSortSelect(select);
        }
    }

    setupFilterSelect(select) {
        const checkboxes = select.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const filterType = select.dataset.filterType;
                const value = checkbox.dataset.value;
                
                this.updateFilter(filterType, value, checkbox.checked, select);
                this.updateFilterButtonText(select, checkboxes);
                this.filterRecipes();
            });
        });
    }

    setupSortSelect(select) {
        const sortOptions = select.querySelectorAll('li');
        sortOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.currentSort = option.dataset.value;
                
                const buttonText = select.querySelector('.selected-value');
                buttonText.textContent = option.textContent;
                
                select.classList.toggle('has-active-sort', this.currentSort !== 'none');
                this.addFilterMessage('sort', [option.textContent]);
                this.filterRecipes();
                select.classList.remove('open');
            });
        });
    }

    updateFilter(filterType, value, isChecked, select) {
        if (isChecked) {
            this.currentFilters[filterType].push(value);
            select.classList.add('has-active-filters');
        } else {
            this.currentFilters[filterType] = this.currentFilters[filterType].filter(v => v !== value);
            if (this.currentFilters[filterType].length === 0) {
                select.classList.remove('has-active-filters');
            }
        }
    }

    updateFilterButtonText(select, checkboxes) {
        const selectedValues = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.parentNode.textContent.trim());
        
        const buttonText = select.querySelector('.selected-value');
        const defaultText = buttonText.dataset.default || buttonText.textContent;
        
        // Update button text and class based on selection
        if (selectedValues.length > 0) {
            buttonText.textContent = `${selectedValues.length} selected`;
            select.classList.add('has-active-filters');
        } else {
            // Use the original filter title when no options are selected
            const filterType = select.dataset.filterType;
            const filterTitles = {
                dietary: 'Dietary Preferences',
                time: 'Cooking Time',
                ingredients: 'Number of Ingredients'
            };
            buttonText.textContent = filterTitles[filterType] || defaultText;
            select.classList.remove('has-active-filters');
        }
        
        this.addFilterMessage(select.dataset.filterType, selectedValues);
    }

    // Helper functions
    createFilterMessage(filterType, selectedItems) {
        const filterNames = {
            dietary: 'dietary preferences',
            time: 'cooking time',
            ingredients: 'number of ingredients',
            sort: 'sorting',
            search: 'search query',
            favorites: 'favorites view'
        };
        
        if (filterType === 'time') {
            if (selectedItems.length === 0) {
                return `Cleared cooking time filter`;
            }
            
            const timeFilters = this.currentFilters.time.map(Number);
            const minTime = Math.min(...timeFilters);
            const maxTime = Math.max(...timeFilters);
            
            // Adjust based on your time filter values
            const getTimeRange = time => {
                if (time === 15) return '0-15';
                if (time === 30) return '15-30';
                if (time === 60) return '30-60';
                if (time === 61) return '60+';
                return '';
            };
            
            const minRange = getTimeRange(minTime);
            const maxRange = getTimeRange(maxTime);
            
            return `Selected cooking times: ${minRange} to ${maxRange} min`;
        }
        
        if (filterType === 'random') {
            return `Selected "${selectedItems[0]}"`;
        }

        if (filterType === 'search') {
            return `Searched for: "${selectedItems[0]}"`;
        }

        if (filterType === 'favorites') {
            // Check the actual state of the favorites button
            return this.elements.favoritesBtn.classList.contains('active') 
                ? 'Viewing favorite recipes'
                : 'Viewing all recipes';
        }
        
        return selectedItems.length === 0
            ? `Cleared ${filterNames[filterType]} filter`
            : `Selected ${filterNames[filterType]}: ${selectedItems.join(', ')}`;
    }

    createMessageCard() {
        const messageHtml = `
            <div class="recipe-content">
                <h3 class="recipe-title">Filter and Sort History</h3>
                <div class="message-container">
                    ${this.filterMessages.length > 0 
                        ? this.filterMessages.map(msg => `<p class="filter-message">${msg}</p>`).join('')
                        : '<p class="filter-message">No filters or sorting applied yet</p>'
                    }
                </div>
            </div>
        `;
        return this.createCard('message-card', messageHtml);
    }

    createNoResultsCard() {
        const isViewingFavorites = this.elements.favoritesBtn.classList.contains('active');
        
        const noResultsHtml = isViewingFavorites && this.favorites.length === 0 ? `
            <div class="recipe-content">
                <div class="no-results-content">
                    <svg class="no-results-icon" viewBox="0 0 24 24" width="48" height="48">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <h3>No favorite recipes yet</h3>
                    <p>Click the heart icon on any recipe to add it to your favorites!</p>
                </div>
            </div>
        ` : `
            <div class="recipe-content">
                <div class="no-results-content">
                    <svg class="no-results-icon" viewBox="0 0 24 24" width="48" height="48">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    <h3>No recipes found ${this.formatFilterDescription(this.currentFilters)}.</h3>
                    <p>Try adjusting your filters to see more recipes.</p>
                </div>
            </div>
        `;
        return this.createCard('no-results-card', noResultsHtml);
    }

    createLoadingCard() {
        const loadingHtml = `
            <div class="recipe-content">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h3>Loading recipes...</h3>
                    <p>Getting delicious recipes for you</p>
                </div>
            </div>
        `;
        return this.createCard('loading-card', loadingHtml);
    }

    createRecipeCard(recipe) {
        // Extract ingredients from Spoonacular format
        const ingredients = recipe.extendedIngredients 
            ? recipe.extendedIngredients.map(ing => ing.original || ing.name)
            : [];
        
        // Check if recipe is in favorites
        const isFavorite = this.favorites.some(fav => fav.id === recipe.id);
        const recipeHtml = `
            <div class="recipe-content">
                <div style="position: relative;">
                    ${recipe.image ? `
                        <img src="${recipe.image}" alt="${recipe.title}" style="width:100%; border-radius:8px; margin-bottom:12px;">
                        <button class="favorite-btn ${isFavorite ? 'is-favorite' : ''}" data-id="${recipe.id}" style="position: absolute; top: 8px; right: 8px;">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
                <a href="${recipe.sourceUrl || `#recipe-${recipe.id}`}" class="recipe-link" target="_blank">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-info">
                        <p>Time: ${recipe.readyInMinutes || '?'} minutes</p>
                    </div>
                    <div class="recipe-ingredients">
                        <h4>Ingredients:</h4>
                        <ul>
                            ${ingredients.slice(0, 8).map(ingredient => `<li>${ingredient}</li>`).join('')}
                            ${ingredients.length > 8 ? `<li>+ ${ingredients.length - 8} more ingredients</li>` : ''}
                        </ul>
                    </div>
                </a>
            </div>
        `;
        const card = this.createCard('recipe-card', recipeHtml);
        
        // Add event listener for the favorite button
        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleFavorite(recipe);
            favoriteBtn.classList.toggle('is-favorite');
        });
        
        return card;
    }

    createCard(className, innerHTML) {
        const card = document.createElement('div');
        card.className = `recipe-card ${className}`;
        card.innerHTML = innerHTML;
        return card;
    }

    formatFilterDescription(filters) {
        const parts = [];
        if (filters.dietary.length) parts.push(`with dietary preferences: ${filters.dietary.join(', ')}`);
        if (filters.time.length) parts.push(`within cooking time: ${filters.time.join(', ')} minutes`);
        if (filters.ingredients.length) parts.push(`with ingredient count: ${filters.ingredients.join(', ')}`);
        if (filters.search) parts.push(`matching search: "${filters.search}"`);
        return parts.length ? ` (${parts.join('; ')})` : '';
    }

    // Filter functions
    dietaryFilter(recipes) {
        return !this.currentFilters.dietary.length ? recipes :
            recipes.filter(recipe => 
                this.currentFilters.dietary.some(diet => 
                    // Check if recipe has matching diet property
                    (recipe.diets && recipe.diets.some(d => 
                        d.toLowerCase() === diet.toLowerCase())
                    )
                )
            );
    }

    timeFilter(recipes) {
        return !this.currentFilters.time.length ? recipes :
            recipes.filter(recipe => {
                const time = recipe.readyInMinutes || 0;
                return this.currentFilters.time.some(range => {
                    const rangeNum = parseInt(range);
                    if (rangeNum === 15) return time <= 15;
                    if (rangeNum === 30) return time > 15 && time <= 30;
                    if (rangeNum === 60) return time > 30 && time <= 60;
                    if (rangeNum === 61) return time > 60;
                    return false;
                });
            });
    }

    ingredientsFilter(recipes) {
        return !this.currentFilters.ingredients.length ? recipes :
            recipes.filter(recipe => {
                const count = recipe.extendedIngredients ? recipe.extendedIngredients.length : 0;
                return this.currentFilters.ingredients.some(range => {
                    const rangeNum = parseInt(range);
                    if (rangeNum === 5) return count <= 5;
                    if (rangeNum === 10) return count > 5 && count <= 10;
                    if (rangeNum === 15) return count > 10 && count <= 15;
                    if (rangeNum === 16) return count > 15;
                    return false;
                });
            });
    }

    searchFilter(recipes) {
        // Debounce the search to avoid too frequent updates
        let searchTimeout;
        const performSearch = () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const filteredRecipes = !searchTerm ? recipes :
                    recipes.filter(recipe => {
                        const titleMatch = recipe.title.toLowerCase().includes(searchTerm);
                        const ingredientMatch = recipe.extendedIngredients && 
                            recipe.extendedIngredients.some(ing => 
                                (ing.name && ing.name.toLowerCase().includes(searchTerm)) || 
                                (ing.original && ing.original.toLowerCase().includes(searchTerm))
                            );
                        return titleMatch || ingredientMatch;
                    });
                this.filterRecipes();
            }, 30);
        };

        // Add input event listener for live search
        this.elements.searchInput.addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            performSearch();
        });

        // Return filtered recipes
        return !this.currentFilters.search ? recipes :
            recipes.filter(recipe => {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const titleMatch = recipe.title.toLowerCase().includes(searchTerm);
                const ingredientMatch = recipe.extendedIngredients && 
                    recipe.extendedIngredients.some(ing => 
                        (ing.name && ing.name.toLowerCase().includes(searchTerm)) || 
                        (ing.original && ing.original.toLowerCase().includes(searchTerm))
                    );
                return titleMatch || ingredientMatch;
            });
    }

    sortRecipes(recipes) {
        if (this.currentSort === 'none') return recipes;

        const sortFunctions = {
            time: (a, b) => (a.readyInMinutes || 0) - (b.readyInMinutes || 0),
            popularity: (a, b) => (b.aggregateLikes || 0) - (a.aggregateLikes || 0),
            price: (a, b) => (a.pricePerServing || 0) - (b.pricePerServing || 0),
            ingredients: (a, b) => (a.extendedIngredients?.length || 0) - (b.extendedIngredients?.length || 0)
        };

        return [...recipes].sort(sortFunctions[this.currentSort] || (() => 0));
    }

    // Main functions
    filterRecipes() {
        const showingFavorites = this.elements.favoritesBtn.classList.contains('active');
        
        if (this.recipes.length === 0 && !showingFavorites) {
            return; // No recipes to filter yet
        }
        
        // Start with either favorites or all recipes depending on view
        let filteredRecipes = showingFavorites ? this.favorites : this.recipes;
        
        // Apply all filters
        filteredRecipes = this.dietaryFilter(filteredRecipes);
        filteredRecipes = this.timeFilter(filteredRecipes);
        filteredRecipes = this.ingredientsFilter(filteredRecipes);
        filteredRecipes = this.searchFilter(filteredRecipes);
        
        // Sort the filtered results
        filteredRecipes = this.sortRecipes(filteredRecipes);
        
        // Render with the current view state
        this.renderRecipes(filteredRecipes, false, showingFavorites);
    }

    renderRecipes(recipesToRender, isRandomRecipe = false, showingFavorites = false) {
        this.elements.recipesContainer.innerHTML = '';
        
        // Show loading indicator
        if (this.isLoading) {
            this.elements.recipesContainer.appendChild(this.createLoadingCard());
            return;
        }
        
        // Show message card only if not a random recipe
        if (!isRandomRecipe) {
            this.elements.recipesContainer.appendChild(this.createMessageCard());
        }
        
        if (recipesToRender.length === 0) {
            this.elements.recipesContainer.appendChild(this.createNoResultsCard());
            return;
        }
        
        // Calculate pagination
        const totalPages = Math.ceil(recipesToRender.length / this.recipesPerPage);
        const startIndex = (this.currentPage - 1) * this.recipesPerPage;
        const endIndex = Math.min(startIndex + this.recipesPerPage, recipesToRender.length);
        
        // Render only the recipes for the current page
        const recipesForCurrentPage = recipesToRender.slice(startIndex, endIndex);
        
        recipesForCurrentPage.forEach(recipe => {
            this.elements.recipesContainer.appendChild(this.createRecipeCard(recipe));
        });

        // Add pagination controls
        if (totalPages > 1) {
            const paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-container';
            
            // Create pagination controls
            const paginationHtml = `
                <div class="pagination">
                    <button class="pagination-btn prev-btn" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>
                    <div class="page-numbers">
                        ${this.createPageNumbers(this.currentPage, totalPages)}
                    </div>
                    <button class="pagination-btn next-btn" ${this.currentPage === totalPages ? 'disabled' : ''}>Next</button>
                </div>
            `;
            
            paginationContainer.innerHTML = paginationHtml;
            this.elements.recipesContainer.appendChild(paginationContainer);
            
            // Add event listeners to pagination buttons
            const prevBtn = paginationContainer.querySelector('.prev-btn');
            const nextBtn = paginationContainer.querySelector('.next-btn');
            const pageButtons = paginationContainer.querySelectorAll('.page-number');
            
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderRecipes(recipesToRender, isRandomRecipe, showingFavorites);
                    window.scrollTo(0, 0);
                }
            });
            
            nextBtn.addEventListener('click', () => {
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderRecipes(recipesToRender, isRandomRecipe, showingFavorites);
                    window.scrollTo(0, 0);
                }
            });
            
            pageButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.currentPage = parseInt(button.dataset.page);
                    this.renderRecipes(recipesToRender, isRandomRecipe, showingFavorites);
                    window.scrollTo(0, 0);
                });
            });
        }
    }

    // Helper function to create page number buttons
    createPageNumbers(currentPage, totalPages) {
        let pageNumbers = '';
        const maxVisiblePages = 5;
        
        // Calculate range of page numbers to show
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Adjust if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // Add first page button if not included in range
        if (startPage > 1) {
            pageNumbers += `<button class="page-number" data-page="1">1</button>`;
            if (startPage > 2) {
                pageNumbers += `<span class="page-ellipsis">...</span>`;
            }
        }
        
        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers += `<button class="page-number ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        
        // Add last page button if not included in range
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers += `<span class="page-ellipsis">...</span>`;
            }
            pageNumbers += `<button class="page-number" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        return pageNumbers;
    }

    addFilterMessage(filterType, selectedItems) {
        const message = this.createFilterMessage(filterType, selectedItems);
        this.filterMessages.unshift(message); // Add to the beginning
        
        // Keep only the last 5 messages
        if (this.filterMessages.length > 5) {
            this.filterMessages.pop();
        }
    }

    resetUIState() {
        // Reset all select components to default state
        this.elements.customSelects.forEach(select => {
            const filterType = select.dataset.filterType;
            select.classList.remove('has-active-filters', 'has-active-sort', 'open');
            
            if (filterType !== 'sort') {
                const checkboxes = select.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => checkbox.checked = false);
                
                const buttonText = select.querySelector('.selected-value');
                buttonText.textContent = buttonText.dataset.default || buttonText.textContent;
            } else {
                const buttonText = select.querySelector('.selected-value');
                buttonText.textContent = 'No sorting';
            }
        });

        // Clear search input
        this.elements.searchInput.value = '';
    }

    clearAllFilters() {
        // Reset filter state
        Object.keys(this.currentFilters).forEach(key => {
            this.currentFilters[key] = [];
        });
        this.currentFilters.search = '';
        this.currentSort = 'none';
        
        // Reset UI
        this.resetUIState();
        
        // Reset pagination
        this.currentPage = 1;
        
        // Add message
        this.addFilterMessage('clear', ['all filters']);
        
        // Re-filter recipes while maintaining favorites view
        this.filterRecipes();
    }

    handleRandomRecipe() {
        if (this.recipes.length > 0) {
            const randomRecipe = this.recipes[Math.floor(Math.random() * this.recipes.length)];
            this.currentFilters = {
                dietary: [],
                time: [],
                ingredients: [],
                search: ''
            };
            this.currentSort = 'none';
            this.currentPage = 1;
            this.resetUIState();
            this.addFilterMessage('random', [randomRecipe.title]);
            this.renderRecipes([randomRecipe], true);
        }
    }

    // Local storage functions
    saveToLocalStorage(key, data) {
        try {
            const item = {
                timestamp: Date.now(),
                data: data
            };
            localStorage.setItem(key, JSON.stringify(item));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    getFromLocalStorage(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            
            const parsedItem = JSON.parse(item);
            const now = Date.now();
            
            // Check if cache is expired
            if (now - parsedItem.timestamp > API_CONFIG.cacheExpiry) {
                localStorage.removeItem(key);
                return null;
            }
            
            return parsedItem.data;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    // Favorites functions
    toggleFavorite(recipe) {
        const index = this.favorites.findIndex(fav => fav.id === recipe.id);
        
        if (index === -1) {
            // Add to favorites
            this.favorites.push(recipe);
            this.addFilterMessage('favorite', [`Added "${recipe.title}" to favorites`]);
        } else {
            // Remove from favorites
            this.favorites.splice(index, 1);
            this.addFilterMessage('favorite', [`Removed "${recipe.title}" from favorites`]);
            
            // If we're currently viewing favorites, update the view
            if (this.elements.favoritesBtn.classList.contains('active')) {
                this.filterRecipes();
            }
        }
        
        // Save to local storage
        this.saveToLocalStorage('favorites', this.favorites);
    }

    loadFavorites() {
        const storedFavorites = this.getFromLocalStorage('favorites');
        if (storedFavorites) {
            this.favorites = storedFavorites;
        }
    }

    // Fetch recipes from Spoonacular API
    async fetchRecipes(isInitial = true) {
        // Try to get from cache first if it's the initial load
        if (isInitial) {
            const cachedRecipes = this.getFromLocalStorage('recipes');
            if (cachedRecipes && cachedRecipes.length > 0) {
                this.recipes = cachedRecipes;
                this.filterRecipes();
                return;
            }
        }

        this.isLoading = true;
        this.renderRecipes([], false); // Show loading state
        
        try {
            const response = await fetch(`${API_CONFIG.url}?apiKey=${API_CONFIG.key}&number=${API_CONFIG.recipesPerFetch}`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (isInitial) {
                this.recipes = data.recipes;
                // Save to local storage
                this.saveToLocalStorage('recipes', this.recipes);
            } else {
                // Append new recipes
                this.recipes = [...this.recipes, ...data.recipes];
                this.saveToLocalStorage('recipes', this.recipes);
            }
            
            this.isLoading = false;
            
            // Initialize the page with the fetched recipes
            this.filterRecipes();
        } catch (error) {
            console.error('Error fetching recipes:', error);
            this.isLoading = false;
            
            // Handle API quota exceeded
            if (error.message.includes('402')) {
                this.elements.recipesContainer.innerHTML = `
                    <div class="recipe-card no-results-card">
                        <div class="recipe-content">
                            <div class="no-results-content">
                                <h3>Daily API Quota Exceeded</h3>
                                <p>Sorry, we've reached our daily limit for recipe requests. Please try again tomorrow!</p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                this.elements.recipesContainer.innerHTML = `
                    <div class="recipe-card no-results-card">
                        <div class="recipe-content">
                            <div class="no-results-content">
                                <h3>Error Loading Recipes</h3>
                                <p>Something went wrong while fetching recipes. Please try again later.</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    }

    // Search function
    handleSearch() {
        const searchTerm = this.elements.searchInput.value.trim();
        this.currentFilters.search = searchTerm;
        
        // Reset pagination
        this.currentPage = 1;
        
        if (searchTerm) {
            this.addFilterMessage('search', [searchTerm]);
        } else {
            this.addFilterMessage('search', ['']);
        }
        
        this.filterRecipes();
    }

    // View favorites function
    toggleFavoritesView() {
        this.elements.favoritesBtn.classList.toggle('active');
        
        // Reset pagination
        this.currentPage = 1;
        
        if (this.elements.favoritesBtn.classList.contains('active')) {
            this.elements.favoritesBtn.textContent = 'View All Recipes';
            this.addFilterMessage('favorites', ['Viewing favorite recipes']);
        } else {
            this.elements.favoritesBtn.textContent = 'View Favorites';
            this.addFilterMessage('favorites', ['Viewing all recipes']);
        }
        
        // Apply current filters to either favorites or all recipes
        this.filterRecipes();
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new RecipeManager();
});
