const recipesContainer = document.querySelector('.recipes-container');
const filtersContainer = document.querySelector('.filters-container');
const sortSelect = document.getElementById('sort-select');
const surpriseButton = document.getElementById('random-recipe-btn');
const includedCuisines =
  'italian,mediterranean,middle eastern,asian,mexican,european';
const includedDiets = ['vegan', 'vegetarian', 'gluten free', 'dairy free'];
const excludedCuisines = [
  'African',
  'American',
  'British',
  'Cajun',
  'Caribbean',
  'Chinese',
  'Eastern European',
  'French',
  'German',
  'Greek',
  'Indian',
  'Irish',
  'Japanese',
  'Jewish',
  'Korean',
  'Latin American',
  'Nordic',
  'Southern',
  'Spanish',
  'Thai',
  'Vietnamese',
];
const searchEndPoint = 'https://api.spoonacular.com/recipes/complexSearch';
const bulkEndPoint = 'https://api.spoonacular.com/recipes/informationBulk';
const API_KEY = '11dcc7d2bf36478dae1c29d5a48bbc42';

let visibleRecipes = [];
let allRecipes = [];

const FILTERS = [
  {
    category: 'diets',
    items: ['vegan', 'vegetarian', 'gluten free', 'dairy free'],
  },
  {
    category: 'cuisine',
    items: [
      'Mediterranean',
      'Middle Eastern',
      'Asian',
      'Italian',
      'Mexican',
      'European',
    ],
  },
  // {
  //   category: 'cooking_time',
  //   items: ['Under 15 min', '15-30 min', '30-60 min', 'Over 60 min'],
  // },
  // {
  //   category: 'Amount_of_ingredients',
  //   items: [
  //     'Under 5 ingredients',
  //     '6-10 ingredients',
  //     '11-15 ingredients',
  //     'Over 15 ingredients',
  //   ],
  // },
];

//Generera filter-knappar
const generateFilterButtons = (aArray) => {
  console.log('generateFilterButtons körs');
  aArray.forEach((filter) => {
    //Filterknappar utom All-knappen
    const filtersContainerChild = document.createElement('div');
    filtersContainerChild.classList.add(
      'filter-container-child',
      filter.category.toLowerCase().replace(/_/g, '-')
    );

    const title = document.createElement('h2');
    title.textContent = filter.category.replace(/_/g, ' ');
    filtersContainerChild.appendChild(title);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add(
      `button-container`,
      `filter-${filter.category.toLowerCase().replace(/_/g, '-')}`
    );

    // Skapar "All"-knappen
    const allButton = document.createElement('button');
    allButton.classList.add('all', 'active');
    allButton.textContent = 'All';
    buttonContainer.appendChild(allButton);

    filter.items.forEach((item) => {
      const button = document.createElement('button');
      button.classList.add('filter-btn');
      button.textContent = item;
      buttonContainer.appendChild(button);
    });

    filtersContainerChild.appendChild(buttonContainer);
    filtersContainer.appendChild(filtersContainerChild);
  });
};

//generera recipie-cards dynamiskt
const generateRecipeCards = (ARRAY) => {
  console.log('generateRecipeCards körs');
  ARRAY.forEach((recipe, index) => {
    const card = document.createElement('article');
    card.classList.add('recipe-card');

    card.style.animationDelay = `${index * 100}ms`;

    card.innerHTML = `
    <div class="img-container">
      <img src="${recipe.image}" alt="Bild på ${recipe.title}">
      </div>
            <h2>${recipe.title}</h2>
            <hr>
            <div class="time-and-cuisine">
            <div class="time">
            <h3>Time:</h3>
            <p>${recipe.readyInMinutes}</p>
            </div>
            <div class="cuisine">
            <h3>Cuisine:</h3>
            <p>${recipe.cuisines
              .filter((cuisine) =>
                includedCuisines.includes(cuisine.toLowerCase())
              )
              .join(', ')}</p>
            </div>
             <div class="Diets">
            <h3>Diets:</h3>
            <p>${recipe.diets
              .filter((diet) => includedDiets.includes(diet.toLowerCase()))
              .join(', ')}</p>
            </div>
            </div>
                        <hr>

            <div class="ingredients">
            <h3>Ingredients:</h3>
            <ul>
              ${recipe.extendedIngredients
                .map((ing) => `<li>${ing.name}</li>`)
                .join('')}
            </ul>
            </div>
    `;
    recipesContainer.appendChild(card);
  });
};

const presentSelectedFilters = (selectedFilterArray) => {
  const filterValueContainer = document.getElementById('selected-filters');

  const filteredArray = selectedFilterArray.filter(
    (filter) => filter !== 'all'
  );

  filterValueContainer.textContent = filteredArray.length
    ? `Valda filter: ${filteredArray.join(', ')}`
    : 'Valda filter: Inga';
};

const updateMatchCount = () => {
  const matchCountElement = document.getElementById('match-count');
  if (matchCountElement) {
    matchCountElement.textContent = `${visibleRecipes.length} recept matchar dina filter.`;
  }
};

const filterRecipes = () => {
  const selectedFilters = Array.from(
    document.querySelectorAll('.filter-btn.active, .all.active')
  ).map((btn) => btn.textContent.toLowerCase());

  presentSelectedFilters(selectedFilters);

  // Ta bort "all" från de aktiva filtren, då vi hanterar varje kategori separat.
  const selectedFiltersWithoutAll = selectedFilters.filter(
    (filter) => filter !== 'all'
  );

  // Dela upp filtren i dieter respektive cuisines
  const selectedDiets = selectedFiltersWithoutAll.filter((filter) =>
    includedDiets.includes(filter)
  );
  const selectedCuisines = selectedFiltersWithoutAll.filter((filter) =>
    includedCuisines.includes(filter)
  );

  let filteredRecipes = allRecipes.filter((recipe) => {
    const recipeDiets = recipe.diets.map((diet) => diet.toLowerCase());
    const recipeCuisines = recipe.cuisines.map((cuisine) =>
      cuisine.toLowerCase()
    );

    // Om inga dietfilter är specifika så ska receptet accepteras vad gäller dieter
    const matchesDiets =
      selectedDiets.length === 0 ||
      selectedDiets.every((diet) => recipeDiets.includes(diet));

    // Om inga cuisinefilter är specifika så ska receptet accepteras vad gäller cuisine
    const matchesCuisines =
      selectedCuisines.length === 0 ||
      recipeCuisines.some((cuisine) => selectedCuisines.includes(cuisine));

    // Receptet visas endast om det matchar båda kategorierna
    return matchesDiets && matchesCuisines;
  });

  visibleRecipes = filteredRecipes;
  console.log('filteredRecipes resultat:', filteredRecipes);
  return filteredRecipes;
};

const sortVisibleRecipes = () => {
  console.log('sortVisibleRecipes körs');

  if (visibleRecipes.length === 0) return; // Om inga kort finns, gör ingenting

  //Hämta sorteringsval från vår selector
  const sortOrder = sortSelect.value;

  let sortedRecipes = [...visibleRecipes];

  //Sortera recepten beroende på användarens val
  if (sortOrder === 'longest') {
    sortedRecipes.sort((a, b) => b.readyInMinutes - a.readyInMinutes);
  } else if (sortOrder === 'shortest') {
    sortedRecipes.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
  } else if (sortOrder === 'none') {
    // Om 'none' är valt, gör ingen sortering – listan förblir oförändrad
  }

  //rensa container och generera nya kort på den sorterade listan
  recipesContainer.innerHTML = '';
  generateRecipeCards(sortedRecipes);
};

const getRandomRecipe = () => {
  console.log('getRandomRecipe');

  if (allRecipes.length === 0) {
    recipesContainer.innerHTML =
      '<p>Hoppsan! Vi hittade inget roligt recept idag...</p>';
    return;
  }

  const randomIndex = Math.floor(Math.random() * allRecipes.length);
  const randomRecipe = allRecipes[randomIndex];

  console.log('Random Recipe Selected:', randomRecipe); // Debugging

  // Clear the container and display only the random recipe
  recipesContainer.innerHTML = '';
  generateRecipeCards([randomRecipe]);
};

const updateRecipesUI = () => {
  // Rensa container
  recipesContainer.innerHTML = '';

  // Om inga recept finns, visa ett meddelande
  if (!visibleRecipes || visibleRecipes.length === 0) {
    recipesContainer.innerHTML = '<p>Inga recept matchar dina filter.</p>';
    return;
  }

  // Generera receptkort med de filtrerade recepten
  generateRecipeCards(visibleRecipes);
};

//En renderingsfunktion (sortering ligger här)
const renderRecipes = () => {
  // Hämta sorteringsvalet
  const sortOrder = sortSelect.value;
  let recipesToRender = [...visibleRecipes]; // Arbeta med en kopia

  // Applicera sortering baserat på sortOrder
  if (sortOrder === 'longest') {
    recipesToRender.sort((a, b) => b.readyInMinutes - a.readyInMinutes);
  } else if (sortOrder === 'shortest') {
    recipesToRender.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
  }
  // Om "none" är valt, lämnas listan oförändrad

  // Rensa containern
  recipesContainer.innerHTML = '';

  updateMatchCount();

  // Rendera recepten eller visa ett meddelande om listan är tom
  if (recipesToRender.length === 0) {
    recipesContainer.innerHTML = '<p>Inga recept matchar dina filter.</p>';
  } else {
    generateRecipeCards(recipesToRender);
  }
};

//
const initApp = async () => {
  generateFilterButtons(FILTERS);

  const cachedData = localStorage.getItem('allRecipes');
  if (cachedData) {
    allRecipes = JSON.parse(cachedData);
  } else {
    allRecipes = await fetchRecipes();
    localStorage.setItem('allRecipes', JSON.stringify(allRecipes));
  }
  visibleRecipes = [...allRecipes];

  renderRecipes();

  // Eventlyssnare filtersContainer
  filtersContainer.addEventListener('click', (event) => {
    if (event.target.tagName !== 'BUTTON') return;

    const btn = event.target;
    const container = btn.parentElement;
    const allBtn = container.querySelector('.all');
    const individualBtns = container.querySelectorAll('.filter-btn');

    if (btn.classList.contains('all')) {
      // Om "all" klickas: om den inte är aktiv, aktivera den och ta bort active från övriga.
      // Om den är aktiv, ta bort active.
      if (!btn.classList.contains('active')) {
        btn.classList.add('active');
        individualBtns.forEach((b) => b.classList.remove('active'));
      } else {
        btn.classList.remove('active');
      }
    } else {
      // Om en individuell knapp klickas: toggla den och se till att "all" blir inaktiv.
      btn.classList.toggle('active');
      allBtn.classList.remove('active');
    }

    // Uppdatera state och rendera
    visibleRecipes = filterRecipes();
    renderRecipes();
  });

  sortSelect.addEventListener('change', () => {
    renderRecipes();
  });

  surpriseButton.addEventListener('click', getRandomRecipe);
};

document.addEventListener('DOMContentLoaded', initApp);

//Fetch fron ComplexSearch with the Bulkfetch from fetchRecipieDetails to get recipies with specific Cuisines
const fetchRecipes = async () => {
  try {
    const url = `${searchEndPoint}?apiKey=${API_KEY}&number=30&cuisine=${includedCuisines}`;
    console.log('Fetching recipes from:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('No recipes found for the given cuisines.');
    }

    console.log('Result from complexSearch:', data.results);

    const recipeIds = data.results.map((recipe) => recipe.id).join(',');
    console.log('recipe ids', recipeIds);
    return fetchRecipeDetails(recipeIds);
  } catch (error) {
    console.error('Error fetching recipes:', error.message);
    return [];
  }
};

//Need to fetch to get ingridiets... with bulk, dont find any other way....
const fetchRecipeDetails = async (recipeIds) => {
  try {
    const url = `${bulkEndPoint}?apiKey=${API_KEY}&ids=${recipeIds}`;
    console.log('Fetching detailed recipe data from:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Detailed recipe data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching recipe details:', error.message);
    return [];
  }
};

//Initiera hela appen när sidan laddas
document.addEventListener('DOMContentLoaded', initApp);
