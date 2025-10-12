const API_KEY = '0c53a9868a9e4217a3adc272f97c6cf8';
const URL = `https://api.spoonacular.com/recipes/complexSearch?number=60&fillIngredients=true&type=starter,main%20course,dessert,side%20dish,lunch,dinner&cuisine=African,Asian,American,Cajun,European,Latin%20American,Middle%20Eastern&addRecipeInformation=true&apiKey=${API_KEY}`;

const card = document.getElementById('card')
const loadingCard = document.getElementById('loadingCard')
const filterDishButtons = document.querySelectorAll('.filter-dish button');
const filterCuisineButtons = document.querySelectorAll('.filter-cuisine button');
const filterGlutenFreeButton = document.querySelector('.filter-gluten-free button');
const sortButtons = document.querySelectorAll('.sort-button button');
const randomButton =document.querySelector('.random-button button');

const displayRecipes = recipeCard => {
  card.innerHTML = ''

  if (!recipeCard || recipeCard.length === 0) {
    card.innerHTML = `
      <div class='card'>
        <h3>Inga recept hittades</h3>
        <p>Prova att filtrera på något annat.</p>
      </div>`;
    return;}

  recipeCard.forEach(recipe => {
    card.innerHTML += `
     <a target='_blank' href='${recipe.spoonacularSourceUrl}'>
        <div class='card'>
         <img src='${recipe.image}' alt='${recipe.title}'>

          <h3><b>${recipe.title}</b></h3>

          <hr>

          <p><b>Dish type:</b> ${recipe.dishTypes.join(', ') || 'Unknown Dish Type'}</p>
          <p><b>Cuisine:</b> ${recipe.cuisines.join(', ') || 'Unknown Cuisine'}</p>
          <p><b>Time:</b> ${recipe.readyInMinutes || 'N/A'} minutes</p>

          <hr>

          <h4>Ingredients</h4>

          <p class='ingredients-list'>${recipe.extendedIngredients
          ? recipe.extendedIngredients.map(ingredient => ingredient.original).join(',<br> ')
          : 'No ingredients listed'}
          </p>
        </div>
      </a>
    `
  })
}

const localRecipes = [
  {
    title: 'Focaccia Bread',
    image: 'images/focaccia.jpg',
    dishTypes: ['bread', 'side dish'],
    cuisines: ['Italian', 'European'],
    readyInMinutes: 45,
    extendedIngredients: [
      { original: 'flour' },
      { original: 'olive oil' },
      { original: 'yeast' },
      { original: 'salt' }
    ]
  },
  {
    title: 'Veggie Tacos',
    image: 'images/tacos.jpg',
    dishTypes: ['taco', 'main course'],
    cuisines: ['Mexican', 'Latin American'],
    readyInMinutes: 25,
    extendedIngredients: [
      { original: 'tortillas' },
      { original: 'beans' },
      { original: 'avocado' },
      { original: 'lime' }
    ]
  },
  {
    title: 'Ramen Soup',
    image: 'images/ramen.jpg',
    dishTypes: ['soup', 'main course'],
    cuisines: ['Asian'],
    readyInMinutes: 30,
    extendedIngredients: [
      { original: 'noodles' },
      { original: 'egg' },
      { original: 'broth' },
      { original: 'spring onions' }
    ]
  },
  {
  title: 'Pad Thai',
  image: 'images/padthai.jpg',
  dishTypes: ['main course'],
  cuisines: ['Asian'],
  readyInMinutes: 30,
  extendedIngredients: [
    { original: 'rice noodles' },
    { original: 'shrimp' },
    { original: 'bean sprouts' },
    { original: 'peanuts' },
    { original: 'lime' }
  ]
  },
  {
  title: 'Caesar Salad',
  image: 'images/caesarsalad.jpg',
  dishTypes: ['salad', 'side dish'],
  cuisines: ['American'],
  readyInMinutes: 15,
  extendedIngredients: [
    { original: 'romaine lettuce' },
    { original: 'croutons' },
    { original: 'parmesan' },
    { original: 'caesar dressing' }
  ]
  },
  {
  title: 'Chicken Curry',
  image: 'images/chickencurry.jpg',
  dishTypes: ['main course'],
  cuisines: ['Asian'],
  readyInMinutes: 40,
  extendedIngredients: [
    { original: 'chicken' },
    { original: 'coconut milk' },
    { original: 'curry paste' },
    { original: 'onion' },
    { original: 'garlic' }
  ]
}
];

let currentRecipes = []
let currentSortOrder = null;

const simplifyButtonText = text => text.trim().toLowerCase() || '';

const getActiveFilters = (buttons) => {
  const active = [...buttons]
  .filter(button => button.classList.contains('active'))
  .map(button => simplifyButtonText(button.textContent));
  if (active.length === 0 || active.includes('all')) return null;
  return new Set(active);
}

const applyFilters = () => {
  let filteredRecipes = currentRecipes;

  const dishTypes = getActiveFilters(filterDishButtons);
  const cuisines = getActiveFilters(filterCuisineButtons);
  const glutenFree = filterGlutenFreeButton.classList.contains('active');

  if (dishTypes) {
    filteredRecipes = filteredRecipes.filter(recipe => recipe.dishTypes.some(type => dishTypes.has(simplifyButtonText(type))));
  } if (cuisines) {
    filteredRecipes = filteredRecipes.filter(recipe => recipe.cuisines.some(cuisine => cuisines.has(simplifyButtonText(cuisine))));
  } if (glutenFree) {
    filteredRecipes = filteredRecipes.filter(recipe => recipe.glutenFree);
  } if (currentSortOrder === 'fast') {
    filteredRecipes = filteredRecipes.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
  } else if (currentSortOrder === 'slow') {
    filteredRecipes = filteredRecipes.sort((a, b) => b.readyInMinutes - a.readyInMinutes);
  }
  displayRecipes(filteredRecipes);
}

const handleError = error => {
  alert("The API request limit has been reached. But don't worry, you can still view some local recipes!");
  currentRecipes = localRecipes;
  displayRecipes(localRecipes);
}

fetch(URL)
.then(response => response.json())
.then(data => {
  currentRecipes = data.results;
  displayRecipes(currentRecipes);
})
.catch(handleError);

filterDishButtons.forEach(button => {
  button.addEventListener('click', () => {
    const isAll = button.textContent.trim().toLowerCase() === 'all';

    if (isAll) {
      filterDishButtons.forEach(button => button.classList.remove('active'));
      button.classList.add('active');
      applyFilters();
    } else {
      const allButton = Array.from(filterDishButtons).find(button => button.textContent.trim().toLowerCase() === 'all');
      if (allButton) allButton.classList.remove('active');

      button.classList.toggle('active');

      const anyActive = Array.from(filterDishButtons).some(button => button.classList.contains('active'));
      if (!anyActive && allButton) {
        allButton.classList.add('active');
      }
      applyFilters();
    }
  });
});

filterCuisineButtons.forEach(button => {
  button.addEventListener('click', () => {
    const isAll = button.textContent.trim().toLowerCase() === 'all';

    if (isAll) {
      filterCuisineButtons.forEach(button => button.classList.remove('active'));
      button.classList.add('active');
      applyFilters();
    } else {
      const allButton = Array.from(filterCuisineButtons).find(button => button.textContent.trim().toLowerCase() === 'all');
      if (allButton) allButton.classList.remove('active');

      button.classList.toggle('active');

      const anyActive = Array.from(filterCuisineButtons).some(button => button.classList.contains('active'));
      if (!anyActive && allButton) {
        allButton.classList.add('active');
      }
      applyFilters();
    }
  });
});

filterGlutenFreeButton.addEventListener('click', () => {
  filterGlutenFreeButton.classList.toggle('active');
  filterGlutenFreeButton.textContent = filterGlutenFreeButton.classList.contains('active') ? 'Yes' : 'No';
  applyFilters();
});

sortButtons.forEach(button => {
  button.addEventListener('click', () => {
    sortButtons.forEach(button => button.classList.remove('active'));
    button.classList.add('active');

    const sortOrder = button.textContent.trim().toLowerCase();

    currentSortOrder = sortOrder.includes('fastest') ? 'fast' : 'slow';
    
    applyFilters();
  });
});

randomButton.addEventListener('click', () => {
  randomButton.classList.toggle('active');
  randomButton.textContent = randomButton.classList.contains('active') ? 'Back to All' : 'Random recipe';
  const randomRecipe = currentRecipes[Math.floor(Math.random() * currentRecipes.length)];

  if (randomButton.classList.contains('active')) {
  displayRecipes([randomRecipe]);
  } else {
    displayRecipes(currentRecipes);
  }
});