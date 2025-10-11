// Local recipes – fallback
const recipes = [
  {
    id: 1,
    title: "Avocado Toast",
    image: "https://dummyimage.com/600x400/000/fff",
    servings: 4,
    diets: ["Vegan", "Dairy-free"],
    cuisine: "Mediterranean",
    readyInMinutes: 15,
    qtyIngredients: "Under 5 ingredients",
    ingredients: [
      "Bread",
      "Avocado",
      "Lemon",
      "Salt"
    ],
    pricePerServing: 3.0,
    popularity: 92
  },
  {
    id: 2,
    title: "Spaghetti Carbonara",
    image: "https://dummyimage.com/600x400/000/fff",
    servings: 2,
    diets: ["Gluten-free"],
    cuisine: "Italian",
    readyInMinutes: 20,
    qtyIngredients: "6-10 ingredients",
    ingredients: [
      "Pasta",
      "Eggs",
      "Bacon",
      "Parmesan",
      "Pepper"
    ],
    pricePerServing: 2.5,
    popularity: 85
  },
  {
    id: 3,
    title: "Falafel Wrap",
    image: "https://dummyimage.com/600x400/000/fff",
    servings: 3,
    diets: ["Vegetarian"],
    cuisine: "Middle Eastern",
    readyInMinutes: 60,
    qtyIngredients: "6-10 ingredients",
    ingredients: [
      "Falafel",
      "Pita",
      "Hummus",
      "Lettuce",
      "Tomatoes"
    ],
    pricePerServing: 4.0,
    popularity: 78,
    featured: true,
  },
  {
    id: 4,
    title: "Vegan Curry",
    image: "https://dummyimage.com/600x400/000/fff",
    servings: 4,
    diets: ["Vegan", "Gluten-free", "Dairy-free"],
    cuisine: "Asian",
    readyInMinutes: 90,
    qtyIngredients: "11-15 ingredients",
    ingredients: [
      "Chickpeas",
      "Coconut Milk",
      "Spinach",
      "Curry Paste",
      "Onion",
      "Garlic"
    ],
    pricePerServing: 2.8,
    popularity: 88
  }
];

// This is the website address where we ask for new recipes from the internet
const URL = `https://api.spoonacular.com/recipes/random?number=15&apiKey=f9a94c32c70844888eebfba758e10f35`

// LOADER FUNCTION
// Function to show the loader (the spinning circle while waiting)
const showLoader = () => {
  const recipesContainer = document.getElementById('recipes');
  if (recipesContainer) {
    recipesContainer.innerHTML = `
      <div class="loader-container">
        <div class="loader"></div>
        <p class="loader-text">Loading delicious recipes...</p>
      </div>
    `;
  }
};

// This is a magic function that tries to get recipes from your computer or from the internet
const fetchRecipes = async () => {
  
  // Show the loader while we're getting recipes
  showLoader();
  
  // CRITICAL: Wait a tiny bit to let the browser actually PAINT the loader to the screen!
  // Without this, JavaScript is too fast and replaces the loader before it's visible
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Start timer to ensure minimum loader display time
  const startTime = Date.now();
  const minLoadTime = 1500; // Minimum 1500ms (1.5 seconds) to show loader
  
  try {
    
    // First, we try to find recipes saved on your computer already (like a cookie jar!)
    const cachedRecipes = localStorage.getItem("recipes");

    if (cachedRecipes) {
      // If we found some saved recipes, we use those instead!
      console.log("Using cached recipes from localStorage");
      const parsedCache = JSON.parse(cachedRecipes);
      
      // Check if it's a list or wrapped in an object
      const recipeArray = Array.isArray(parsedCache) ? parsedCache : parsedCache.recipes || [];
      
      // Wait for minimum load time before showing recipes
      // Calculate how much time has passed since the loader was shown
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsedTime);
      
      // If we loaded data too quickly, wait the remaining time to keep loader visible
      // This ensures users always see the loading state, improving perceived quality
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      console.table(recipeArray);
      return recipeArray;
    }
    
    // If we don't have saved recipes, we ask the internet for new ones
    const response = await fetch(URL);
    
    // If the internet says something went wrong, we handle it
    if (!response.ok) {
      // Special case: we used up all our free recipes for today!
      if (response.status === 402) {
        console.log('');
        console.log('═══════════════════════════════════════════');
        console.log('🚨 API QUOTA LIMIT REACHED! 🚨');
        console.log('═══════════════════════════════════════════');
        console.log('📊 Status: Daily API request limit exceeded (402)');
        console.log('🔄 Fallback: Showing local recipes instead');
        console.log('💡 Tip: Quota resets at midnight (API time)');
        console.log('═══════════════════════════════════════════');
        console.log('');
        showQuotaMessage(); // Show a nice message to the user
        
        // Wait for minimum load time before showing recipes
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadTime - elapsedTime);
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        
        return recipes; // Use the recipes we have in our code
      }
      throw Error(`HTTP error! Status: ${response.status}`);
    }
    
    // If everything worked, we get the new recipes
    const data = await response.json();
    
    // The internet gives us recipes in a special format, so we extract them
    const apiRecipes = data.recipes || [];
    
    // Make sure we actually got recipes back
    if (!Array.isArray(apiRecipes) || apiRecipes.length === 0) {
      console.log("API didn't return any recipes, using local recipes instead");
      
      // Wait for minimum load time before showing recipes
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsedTime);
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      return recipes;
    }
    
    // Save the new recipes on the computer for next time (so we don't have to ask again)
    localStorage.setItem("recipes", JSON.stringify(apiRecipes));
    console.log("Fetched recipes from API");
    console.table(apiRecipes);
    
    // Wait for minimum load time before showing recipes
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minLoadTime - elapsedTime);
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    // Give the recipes back to whoever asked for them
    return apiRecipes;
  } catch (error) {
    // Uh oh! Something went wrong. Let's tell the console and use our backup recipes.
    console.error('Error fetching recipes:', error);
    console.log('Using local recipes from our code as a fallback')
    
    // Wait for minimum load time before showing recipes
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minLoadTime - elapsedTime);
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    return recipes; // Use the recipes we have in our code if anything fails
    
  }
}

// Function to show a message when we've used up our daily API quota
const showQuotaMessage = () => {
  const recipesWrapper = document.getElementById('recipes');
  if (recipesWrapper) {
    const quotaMessage = document.createElement('div');
    quotaMessage.className = 'quota-message';
    quotaMessage.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        margin: 20px 0;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      ">
        <h3 style="margin: 0 0 10px 0;">🎯 API Quota Reached!</h3>
        <p style="margin: 0;">We've reached our daily API limit 😎<br>
        Showing you some delicious local recipes instead!</p>
      </div>
    `;
    recipesWrapper.insertBefore(quotaMessage, recipesWrapper.firstChild);
    
    // Remove the message after 5 seconds so it doesn't stay forever
    setTimeout(() => {
      if (quotaMessage.parentNode) {
        quotaMessage.parentNode.removeChild(quotaMessage);
      }
    }, 5000);
  }
};

// This is a box where we keep all the recipes we found
let allRecipes = recipes; // Start with the recipes we have in our code

// These remember what filters the user picked
let activeCuisine = "All";
let activePopularity = "All";
let activeSort = "Descending";
let searchText = ""; // This remembers what the user typed in the search box
let showOnlyFavorites = false; // This remembers if we're showing only favorites

// Start the app by getting recipes from the internet or computer
// Use async/await to ensure proper timing
(async () => {
  const fetchedRecipes = await fetchRecipes();
  allRecipes = fetchedRecipes; // Save the recipes we got
  
  // Show the recipes on the page (this automatically replaces the loader!)
  showRecipes(allRecipes);
  filterAndSortRecipes(); // Update the filters too
})();

// Find the random button on the page so we can use it later
const buttonRandomElement = document.getElementById('btn-random');
const filtersRoot = document.querySelector(".recipe-library__filters");

// Find the search box on the page
const searchInput = document.getElementById('searchInput');

// Find the favorites button on the page
const buttonFavoritesElement = document.getElementById('btn-favorites');

// LIKE FUNCTIONALITY - Keep track of which recipes are liked
// This box stores recipe IDs that the user has liked (saved on the computer)
let likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || [];

// Function to check if a recipe is liked
const isRecipeLiked = (recipeId) => {
  return likedRecipes.includes(recipeId);
};

// Function to add or remove a like from a recipe (toggle)
const toggleLike = (recipeId) => {
  if (isRecipeLiked(recipeId)) {
    // If already liked, remove it from the list
    likedRecipes = likedRecipes.filter(id => id !== recipeId);
    console.log(`💔 Unliked recipe #${recipeId}. Total likes: ${likedRecipes.length}`);
  } else {
    // If not liked, add it to the list
    likedRecipes.push(recipeId);
    console.log(`❤️ Liked recipe #${recipeId}. Total likes: ${likedRecipes.length}`);
  }
  // Save the updated list to the computer so it remembers
  localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
};

// This function shows recipes on the screen
const showRecipes = (recipesToShow) => {
  // Find the place where recipes should go on the page
  const showRecipesWrapper = document.getElementById('recipes');

  // Safety check: make sure recipesToShow is a list of recipes
  if (!Array.isArray(recipesToShow)) {
    console.error("recipesToShow is not a list:", recipesToShow);
    recipesToShow = recipes; // Use our backup recipes if something went wrong
  }

  if (recipesToShow.length === 0) {
    // If no recipes match, show a sad message
    showRecipesWrapper.innerHTML = `
      <div class="empty-state">
        <p>😕 No recipes match what you're looking for.</p>
        <button class="filter-button filter-button--secondary" id="reset-filters">
          Show all recipes
        </button>
      </div>
    `;

    // When someone clicks the reset button, show all recipes again
    document.getElementById("reset-filters").addEventListener("click", () => {
      activeCuisine = "All";
      activePopularity = "All";
      activeSort = "Descending";
      searchText = ""; // Clear the search box
      searchInput.value = ""; // Empty the search box on screen
      showOnlyFavorites = false; // Turn off favorites filter
      buttonFavoritesElement.classList.remove('filter-button--active'); // Make favorites button not active
      filterAndSortRecipes();
      // Update which buttons look active
      renderFilters();
    });
    return;
  }

  // Make a recipe card for each recipe to show on the page
  const recipeCard = recipesToShow.map(recipe => {
    // Check if this recipe should be special/featured
    const featuredClass = recipe.featured ? "recipe-card--featured" : "";
    
    // Make a list of ingredients - they come in different formats from different places
    let ingredientsList = "";
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      // Local recipes: ingredients is a simple list of words
      ingredientsList = recipe.ingredients.map(ing => `<li class="recipe-card__ingredients-item">${ing}</li>`).join("");
    } else if (recipe.extendedIngredients && Array.isArray(recipe.extendedIngredients)) {
      // Internet recipes: extendedIngredients is a list of objects with more info
      ingredientsList = recipe.extendedIngredients.map(ing => `<li class="recipe-card__ingredients-item">${ing.original || ing.name}</li>`).join("");
    } else {
      // If we can't find ingredients, show a message
      ingredientsList = `<li class="recipe-card__ingredients-item">Ingredients not available</li>`;
    }
    
    // Check if this recipe is liked to show filled or empty heart
    const isLiked = isRecipeLiked(recipe.id);
    const heartClass = isLiked ? 'recipe-card__like--active' : '';
    
    return `
    <article class="recipe-card ${featuredClass}">
      <img class="recipe-card__image" src="${recipe.image}" alt="${recipe.title}" />
        <span class="recipe-card__like ${heartClass}" data-recipe-id="${recipe.id}">
          <i data-lucide="heart"></i>
        </span>
        <div class="recipe-card__content">
          <h3 class="recipe-card__title">${recipe.title}</h3>
          <p class="recipe-card__cuisine"><span>Cuisine:</span> ${recipe.cuisine || (recipe.cuisines && recipe.cuisines.length > 0 ? recipe.cuisines[0] : "International")}</p>
          <p class="recipe-card__time"><span>Time:</span> ${recipe.readyInMinutes || "Unknown"} min</p>
          <div class="recipe-card__ingredients">
            <h4 class="recipe-card__ingredients-title">Ingredients</h4>
            <ul class="recipe-card__ingredients-list">
              ${ingredientsList}
            </ul>
          </div>
        </div>
    </article>
  `}).join("");

  // Put all the recipe cards on the page
  showRecipesWrapper.innerHTML = recipeCard;
  lucide.createIcons();
  
  // ATTACH LIKE LISTENERS - Make the hearts clickable!
  // Find all the heart icons on the page
  const likeButtons = document.querySelectorAll('.recipe-card__like');
  likeButtons.forEach(likeButton => {
    likeButton.addEventListener('click', (event) => {
      // Get which recipe was clicked
      const recipeId = parseInt(likeButton.getAttribute('data-recipe-id'));
      
      // Toggle the like (add or remove)
      toggleLike(recipeId);
      
      // Update the heart appearance (fill it or empty it)
      if (isRecipeLiked(recipeId)) {
        likeButton.classList.add('recipe-card__like--active');
      } else {
        likeButton.classList.remove('recipe-card__like--active');
      }
    });
  });
};

// Function that picks any random recipe and shows it
const showRandomRecipe = () => {
  // List of different dice icons we can show
  const diceNumbers = ["dice-1", "dice-2", "dice-3", "dice-4", "dice-5", "dice-6"];
  // Pick a random recipe from all our recipes
  const randomRecipe = [allRecipes[Math.floor(Math.random() * allRecipes.length)]];
  // Pick a random dice icon to show
  const randomDiceIcon = diceNumbers[Math.floor(Math.random() * diceNumbers.length)];
  // Find the icon on the button
  const iconEl = buttonRandomElement.querySelector("[data-lucide], svg");
  // Change it to the random dice
  iconEl.setAttribute("data-lucide", randomDiceIcon);
  lucide.createIcons();
  // Make sure the random recipe isn't featured
  randomRecipe[0].featured = false;
  // Show just this one recipe
  showRecipes(randomRecipe);
}

// When someone clicks the random button, show a random recipe
buttonRandomElement.addEventListener('click', showRandomRecipe);

// FAVORITES BUTTON - Show only liked recipes when clicked!
buttonFavoritesElement.addEventListener('click', () => {
  // Toggle between showing all recipes and only favorites
  showOnlyFavorites = !showOnlyFavorites;
  
  // Update button appearance to show if it's active
  if (showOnlyFavorites) {
    buttonFavoritesElement.classList.add('filter-button--active');
  } else {
    buttonFavoritesElement.classList.remove('filter-button--active');
  }
  
  // Show the recipes (filtered by favorites if active)
  filterAndSortRecipes();
});

// ===== FILTER CONFIGURATION =====
// Configuration for all filter groups
// Cuisine filters: Limited to 4-5 quick filters, rest shown in sidebar
const filterConfig = [
  {
    key: "cuisine",
    title: "Filter on kitchen",
    style: "filter-button--primary",
    // Quick filters (4-5 most common) - shown in main view
    quickValues: ["All", "Italian", "Asian", "Mediterranean", "American"],
    // All cuisine options - shown in sidebar
    values: ["All", "Italian", "Mediterranean", "Asian", "Middle Eastern", "European", "American", "Southern", "Mexican", "French", "Indian", "Thai"]
  },
  {
    key: "popularity",
    title: "Filter on popularity",
    style: "filter-button--primary",
    values: ["All", "Very Popular", "Popular", "Less Popular"]
  },
  {
    key: "sort",
    title: "Sort on time",
    style: "filter-button--secondary",
    values: ["Descending", "Ascending"]
  }
];

// ===== RENDER FILTERS FUNCTION =====
// Creates all filter buttons on the page
const renderFilters = () => {
  // Go through each filter group (cuisine, popularity, sort)
  filterConfig.forEach(group => {
    // Find the right spot on the page for this group
    const container = document.getElementById(`filter-${group.key}`);

    // For cuisine filters, use quick values (4-5 filters) in main view
    const valuesToShow = group.quickValues || group.values;
    
    // Build the buttons as HTML text
    let buttonsHtml = "";
    valuesToShow.forEach((val, index) => {
      // The first button starts as active/selected
      const activeClass = index === 0 ? "filter-button--active" : "";
      buttonsHtml += `
        <button class="filter-button ${group.style} ${activeClass}">
          ${val}
        </button>
      `;
    });

    // Put the title and buttons into the container
    container.innerHTML = `
      <h2 class="filter-group__title">${group.title}</h2>
      <div class="filter-group__buttons">${buttonsHtml}</div>
    `;
  });

  // Render sidebar cuisine filters (all options)
  renderSidebarFilters();

  // Make the icons appear
  lucide.createIcons();
};

// ===== RENDER SIDEBAR FILTERS =====
// Populates the sidebar with ALL filter options (cuisine, popularity, sort)
const renderSidebarFilters = () => {
  const sidebarContainer = document.getElementById('sidebar-filters');
  
  if (!sidebarContainer) return;
  
  // Build sections for each filter group
  let sectionsHtml = "";
  
  filterConfig.forEach(group => {
    let buttonsHtml = "";
    group.values.forEach((val, index) => {
      const activeClass = index === 0 ? "filter-button--active" : "";
      buttonsHtml += `
        <button class="filter-button ${group.style} ${activeClass} sidebar-filter-btn" 
                data-filter-type="${group.key}" 
                data-filter-value="${val}">
          ${val}
        </button>
      `;
    });
    
    sectionsHtml += `
      <div class="filter-sidebar__section">
        <h3 class="filter-sidebar__section-title">${group.title}</h3>
        ${buttonsHtml}
      </div>
    `;
  });
  
  sidebarContainer.innerHTML = sectionsHtml;
};

// Make all the icons appear on the page
lucide.createIcons();

// Create all the filter buttons when the page loads
renderFilters();

// This function filters and sorts the recipes based on what the user picked
function filterAndSortRecipes() {
  let list = [...allRecipes]; // Make a copy of all recipes to work with

  // Filter by favorites (if favorites button is active)
  if (showOnlyFavorites) {
    list = list.filter(recipe => isRecipeLiked(recipe.id));
    
    // Show in console how many favorites we found
    console.log(`📌 Showing ${list.length} favorite recipe(s)`);
    
    // If no recipes are liked, show a message
    if (list.length === 0) {
      const showRecipesWrapper = document.getElementById('recipes');
      showRecipesWrapper.innerHTML = `
        <div class="empty-state">
          <p>💔 You haven't liked any recipes yet!</p>
          <p>Click the ❤️ on a recipe to add it to your favorites.</p>
        </div>
      `;
      return;
    }
  }

  // Filter by search text (if user typed something)
  if (searchText !== "") {
    list = list.filter(recipe => {
      // Check if the recipe title contains what the user typed
      const titleMatch = recipe.title.toLowerCase().includes(searchText.toLowerCase());
      
      // Check if any ingredient contains what the user typed
      let ingredientMatch = false;
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        ingredientMatch = recipe.ingredients.some(ing => 
          ing.toLowerCase().includes(searchText.toLowerCase())
        );
      } else if (recipe.extendedIngredients && Array.isArray(recipe.extendedIngredients)) {
        ingredientMatch = recipe.extendedIngredients.some(ing => 
          (ing.original || ing.name || "").toLowerCase().includes(searchText.toLowerCase())
        );
      }
      
      // Keep the recipe if either title or ingredient matches
      return titleMatch || ingredientMatch;
    });
  }

  // Filter by kitchen/cuisine type
  if (activeCuisine !== "All") {
    list = list.filter(r => {
      // Handle both local recipes (cuisine) and internet recipes (cuisines)
      if (r.cuisine) {
        return r.cuisine === activeCuisine;
      } else if (r.cuisines && Array.isArray(r.cuisines)) {
        return r.cuisines.includes(activeCuisine);
      }
      return false;
    });
  }

  // Filter by popularity
  if (activePopularity !== "All") {
    list = list.filter(r => {
      const popularity = r.popularity || r.aggregateLikes || 0; // Internet recipes use aggregateLikes
      
      if (activePopularity === "Very Popular") {
        return popularity >= 85; // 85 or higher = Very Popular
      } else if (activePopularity === "Popular") {
        return popularity >= 70 && popularity < 85; // 70-84 = Popular
      } else if (activePopularity === "Less Popular") {
        return popularity < 70; // Under 70 = Less Popular
      }
      return true;
    });
  }

  // Sort by cooking time
  list.sort((a, b) => {
    return activeSort === "Ascending"
      ? a.readyInMinutes - b.readyInMinutes // Fastest first
      : b.readyInMinutes - a.readyInMinutes; // Slowest first
  });

  // Show the filtered recipes on the page
  showRecipes(list);
}

// This function makes the filter buttons work when you click them
function attachFilterListeners() {
  const allButtons = document.querySelectorAll(".filter-button");

  allButtons.forEach(button => {
    button.addEventListener("click", () => {
      const group = button.closest(".filter-group");

      if (group) {
        const groupTitle = group.querySelector("h2").innerText;

        // Figure out which type of filter button was clicked
        if (groupTitle.includes("kitchen")) {
          activeCuisine = button.innerText;
        } else if (groupTitle.includes("popularity")) {
          activePopularity = button.innerText;
        } else if (groupTitle.includes("time")) {
          activeSort = button.innerText;
        }

        // Remove the active highlight from all buttons in this group
        const groupButtons = group.querySelectorAll(".filter-button");
        groupButtons.forEach(b => b.classList.remove("filter-button--active"));

        // Add the active highlight to the button that was clicked
        button.classList.add("filter-button--active");

        // Show the recipes that match the new filters
        filterAndSortRecipes();
      }
      // Note: Random and Favorites buttons have their own event listeners below
      // So we don't need to handle them here anymore!
    });
  });
}

// Connect the buttons to their click actions
attachFilterListeners();

// Note: filterAndSortRecipes() is called AFTER fetchRecipes() completes
// Don't call it here or it will replace the loader too early!

// ===== SEARCH FUNCTIONALITY =====
// Search recipes as you type!
// Listen for when someone types in the search box
searchInput.addEventListener('input', (event) => {
  // Get what the user typed
  searchText = event.target.value;
  // Show only recipes that match what they typed
  filterAndSortRecipes();
});

// ===== SIDEBAR FUNCTIONALITY =====
// Elements for sidebar interaction
const sidebarOverlay = document.getElementById('sidebar-overlay');
const filterSidebar = document.getElementById('filter-sidebar');
const btnFilterToggle = document.getElementById('btn-filter-toggle');
const btnCloseSidebar = document.getElementById('btn-close-sidebar');

// Function to open the sidebar
const openSidebar = () => {
  filterSidebar.classList.add('active');
  sidebarOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scrolling when sidebar is open
};

// Function to close the sidebar
const closeSidebar = () => {
  filterSidebar.classList.remove('active');
  sidebarOverlay.classList.remove('active');
  document.body.style.overflow = ''; // Re-enable scrolling
};

// Open sidebar when clicking "All Filters" button
btnFilterToggle.addEventListener('click', openSidebar);

// Close sidebar when clicking close button
btnCloseSidebar.addEventListener('click', closeSidebar);

// Close sidebar when clicking overlay (outside the sidebar)
sidebarOverlay.addEventListener('click', closeSidebar);

// ===== SIDEBAR FILTER LISTENERS =====
// Handle clicks on ALL filters in the sidebar (cuisine, popularity, sort)
const attachSidebarFilterListeners = () => {
  const sidebarButtons = document.querySelectorAll('.sidebar-filter-btn');
  
  sidebarButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filterType = button.getAttribute('data-filter-type');
      const filterValue = button.getAttribute('data-filter-value');
      
      // Update the appropriate filter variable
      if (filterType === 'cuisine') {
        activeCuisine = filterValue;
      } else if (filterType === 'popularity') {
        activePopularity = filterValue;
      } else if (filterType === 'sort') {
        activeSort = filterValue;
      }
      
      // Update active state on sidebar buttons in the same section
      const sectionButtons = button.parentElement.querySelectorAll('.sidebar-filter-btn');
      sectionButtons.forEach(btn => btn.classList.remove('filter-button--active'));
      button.classList.add('filter-button--active');
      
      // Update active state on main filter buttons (if visible on desktop)
      const mainButtons = document.querySelectorAll(`#filter-${filterType} .filter-button`);
      mainButtons.forEach(btn => {
        btn.classList.remove('filter-button--active');
        if (btn.innerText === filterValue) {
          btn.classList.add('filter-button--active');
        }
      });
      
      // Apply filters and show recipes
      filterAndSortRecipes();
      
      // Close sidebar after selecting a filter
      closeSidebar();
    });
  });
};

// Attach sidebar filter listeners after rendering filters
attachSidebarFilterListeners();
