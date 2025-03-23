// === DOM SELECTORS ===
const filterButtons = document.querySelectorAll('.filter-checkbox');
const sortButtons = document.querySelectorAll('.sort-radio');
const lazyButton = document.getElementById('lazy');
const allButton = document.getElementById('all');
const recipeContainer = document.getElementById('recipe-container');
const loadingSpinner = document.getElementById('loading-spinner');

// === GLOBAL VARIABLES ===
let activeFilters = [];
let allRecipes = [];
let workingArray = [];
let selectedSort = 'ascending';

const BASE_URL = "https://api.spoonacular.com/recipes/random";
const API_KEY = "765002ba2ca14dffb9a0e1dd128843f1";
const URL = `${BASE_URL}/?apiKey=${API_KEY}&number=70`;

// === FETCH FROM API ===
const fetchData = async () => {
  try {
    showLoading(true);
    const storedRecipes = localStorage.getItem("recipes");
    const storedTimestamp = localStorage.getItem("recipesTimestamp");
    const now = new Date();

    if (storedRecipes && storedTimestamp) {
      const isFresh = now - new Date(storedTimestamp) < 24 * 60 * 60 * 1000;
      if (isFresh) {
        allRecipes = JSON.parse(storedRecipes);
        workingArray = [...allRecipes];
        applySortAndRender();
        return;
      }
    }

    const response = await fetch(URL);
    if (!response.ok) {
      if (response.status === 402) {
        throw new Error("API quota reached. Please try again tomorrow.");
      } else {
        throw new Error(`Error! Status: ${response.status}`);
      }
    }

    const data = await response.json();
    allRecipes = data.recipes;
    localStorage.setItem("recipes", JSON.stringify(allRecipes));
    localStorage.setItem("recipesTimestamp", now.toISOString());
    workingArray = [...allRecipes];
    applySortAndRender();
  } catch (error) {
    console.error('Fetch error:', error.message);
    recipeContainer.innerHTML = `<p>${error.message}</p>`;
  } finally {
    showLoading(false);
  }
};

const showLoading = (show) => {
  loadingSpinner.style.display = show ? 'flex' : 'none';
};

// === RENDER FUNCTIONS ===
const renderIngredients = (array) => {
  return `<ul>
    ${array.map(ingredient => {
      const amount = ingredient.measures?.metric?.amount ? Math.ceil(ingredient.measures.metric.amount) : "?";
      const unit = ingredient.measures?.metric?.unitShort || "";
      return `<li>${amount} ${unit} ${ingredient.name}</li>`;
    }).join('')}
  </ul>`;
};

const renderInstructions = (recipe) => {
  if (!recipe.analyzedInstructions || recipe.analyzedInstructions.length === 0) return "No instructions available.";
  const steps = recipe.analyzedInstructions[0].steps;
  return `<ol>${steps.map(step => `<li>${step.step}</li>`).join('')}</ol>`;
};

const loadRecipes = (array) => {
  recipeContainer.innerHTML = '';

  const validRecipes = array.filter(recipe =>
    recipe.title &&
    recipe.image &&
    recipe.extendedIngredients &&
    Array.isArray(recipe.extendedIngredients) &&
    recipe.analyzedInstructions &&
    Array.isArray(recipe.analyzedInstructions)
  );

  if (validRecipes.length === 0) {
    const fallbackForCuisine = fallbackRecipes.filter(recipe =>
      recipe.cuisines.some(cuisine =>
        activeFilters.includes(cuisine.toLowerCase())
      )
    );

    if (fallbackForCuisine.length > 0) {
      recipeContainer.innerHTML = `<p>No recipes found from the API. Showing fallback results instead.</p>`;
      loadRecipes(fallbackForCuisine);
    } else {
      recipeContainer.innerHTML = '<p>No recipes found. Try again or choose another filter.</p>';
    }
    return;
  }

  validRecipes.forEach(recipe => {
    const imageUrl = recipe.image?.startsWith('http') ? recipe.image : 'https://via.placeholder.com/300x200?text=No+Image';
    recipeContainer.innerHTML += `
      <article class="recipe-card" style="width: 300px">
        <img src="${imageUrl}" alt="${recipe.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
        <h3>${recipe.title}</h3>
        <div class="border-top-bottom">
          <p><strong>Ready in:</strong> ${recipe.readyInMinutes || "?"} minutes</p>
        </div>
        <p><strong>Ingredients:</strong> ${renderIngredients(recipe.extendedIngredients)}</p>
        <button class="show-instructions-btn">Show Instructions</button>
        <div class="instructions" style="display: none;"><strong>Instructions:</strong>${renderInstructions(recipe)}</div>
      </article>
    `;
  });

  document.querySelectorAll('.show-instructions-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const instructionsDiv = btn.nextElementSibling;
      const isVisible = instructionsDiv.style.display === 'block';
      instructionsDiv.style.display = isVisible ? 'none' : 'block';
      btn.textContent = isVisible ? 'Show Instructions' : 'Hide Instructions';
    });
  });
};

// === FILTER, SORT, LAZY ===
const updateButtons = (id) => {
  if (id === 'all' || id === 'lazy') {
    filterButtons.forEach(btn => {
      if (btn.id !== 'all') btn.checked = false;
    });
  } else {
    const anyChecked = Array.from(filterButtons).some(btn => btn.checked && btn.id !== 'all');
    allButton.checked = !anyChecked;
  }

  const anyCheckedNew = Array.from(filterButtons).some(btn => btn.checked);
  if (!anyCheckedNew) allButton.checked = true;
};

const updateFilters = (button) => {
  if (button.id === 'all') {
    activeFilters = [];
    workingArray = [...allRecipes];
  } else {
    const filterId = button.id.toLowerCase();

    if (button.checked && !activeFilters.includes(filterId)) {
      activeFilters.push(filterId);
    } else {
      activeFilters = activeFilters.filter(f => f !== filterId);
    }

    workingArray = activeFilters.length > 0
      ? allRecipes.filter(recipe =>
          recipe.cuisines?.some(cuisine =>
            activeFilters.includes(cuisine.toLowerCase())
          )
        )
      : [...allRecipes];
  }

  applySortAndRender();
};

const sortAscending = (array) => {
  array.sort((a, b) => (a.readyInMinutes || 0) - (b.readyInMinutes || 0));
};

const sortDescending = (array) => {
  array.sort((a, b) => (b.readyInMinutes || 0) - (a.readyInMinutes || 0));
};

const applySortAndRender = () => {
  if (selectedSort === 'ascending') {
    sortAscending(workingArray);
  } else {
    sortDescending(workingArray);
  }
  loadRecipes(workingArray);
};

const randomRecipe = () => {
  const randomIndex = Math.floor(Math.random() * workingArray.length);
  const chosen = [workingArray[randomIndex]];
  loadRecipes(chosen);
};

// === INIT ===
fetchData();

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    updateButtons(button.id);
    updateFilters(button);
  });
});

sortButtons.forEach(button => {
  button.addEventListener('click', () => {
    selectedSort = button.id;
    applySortAndRender();
  });
});

lazyButton.addEventListener('click', () => {
  updateButtons(lazyButton.id);
  randomRecipe();
});
