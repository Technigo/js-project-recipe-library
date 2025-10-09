const API_KEY = "a7476db9e2f54ace9d93f0d28af5e272"
const URL = `https://api.spoonacular.com/recipes/complexSearch?number=10&fillIngredients=true&addRecipeInformation=true&apiKey=${API_KEY}`

const card = document.getElementById('card')
const loadingCard = document.getElementById('loadingCard')
const filterDishButtons = document.querySelectorAll('.filter-dish button');
const filterCuisineButtons = document.querySelectorAll('.filter-cuisine button');
const filterGlutenFreeButton = document.querySelector('.filter-gluten-free button');
const sortButtons = document.querySelectorAll('.sort-button button');
//const filterRecipeByCuisine = document.getElementById('filterRecipe')
//const sortRecipeByTime = document.getElementById('sortRecipe')

const displayRecipes = recipeCard => {
  card.innerHTML = ''

  recipeCard.forEach(recipe => {
    card.innerHTML += `
     <a target="_blank" href="${recipe.spoonacularSourceUrl}">
        <div class="card">
         <img src="${recipe.image}" alt="${recipe.title}">

          <h3><b>${recipe.title}</b></h3>

          <hr>

          <p><b>Dish type:</b> ${recipe.dishTypes.join(', ') || "Unknown Dish Type"}</p>
          <p><b>Cuisine:</b> ${recipe.cuisines.join(', ') || "Unknown Cuisine"}</p>
          <p><b>Time:</b> ${recipe.readyInMinutes || "N/A"} minutes</p>

          <hr>

          <h4>Ingredients</h4>

          <p class="ingredients-list">${recipe.extendedIngredients
          ? recipe.extendedIngredients.map(i => i.name).join(',<br> ')
          : 'No ingredients listed'}
          </p>
        </div>
      </a>
    `
  })
}

const localRecipes = [
  {
    title: "Focaccia Bread",
    image: "images/focaccia.jpg",
    dishTypes: ["bread", "side dish"],
    cuisines: ["Italian"],
    readyInMinutes: 45,
    extendedIngredients: [
      { name: "flour" },
      { name: "olive oil" },
      { name: "yeast" },
      { name: "salt" }
    ]
  },
  {
    title: "Veggie Tacos",
    image: "images/tacos.jpg",
    dishTypes: ["taco", "main course"],
    cuisines: ["Mexican"],
    readyInMinutes: 25,
    extendedIngredients: [
      { name: "tortillas" },
      { name: "beans" },
      { name: "avocado" },
      { name: "lime" }
    ]
  },
  {
    title: "Ramen Soup",
    image: "images/ramen.jpg",
    dishTypes: ["soup", "main course"],
    cuisines: ["Asian"],
    readyInMinutes: 30,
    extendedIngredients: [
      { name: "noodles" },
      { name: "egg" },
      { name: "broth" },
      { name: "spring onions" }
    ]
  },
  {
  title: "Pad Thai",
  image: "images/padthai.jpg",
  dishTypes: ["main course"],
  cuisines: ["Asian"],
  readyInMinutes: 30,
  extendedIngredients: [
    { name: "rice noodles" },
    { name: "shrimp" },
    { name: "bean sprouts" },
    { name: "peanuts" },
    { name: "lime" }
  ]
},
{
  title: "Caesar Salad",
  image: "images/caesarsalad.jpg",
  dishTypes: ["salad", "side dish"],
  cuisines: ["American"],
  readyInMinutes: 15,
  extendedIngredients: [
    { name: "romaine lettuce" },
    { name: "croutons" },
    { name: "parmesan" },
    { name: "caesar dressing" }
  ]
},
{
  title: "Chicken Curry",
  image: "images/chickencurry.jpg",
  dishTypes: ["main course"],
  cuisines: ["Asian"],
  readyInMinutes: 40,
  extendedIngredients: [
    { name: "chicken" },
    { name: "coconut milk" },
    { name: "curry paste" },
    { name: "onion" },
    { name: "garlic" }
  ]
}
];

let currentRecipes = []

const handleError = error => {
  console.error("Something went wrong:", error);
    /*loadingCard.innerHTML = `<p>No recipes found at the moment, try to refresh the page.<p/>`,*/
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
    const isAll = button.textContent.trim().toLowerCase() === "all";

    if (isAll) {
    
      filterDishButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    } else {
      const allButton = Array.from(filterDishButtons).find(btn => btn.textContent.trim().toLowerCase() === "all");
      if (allButton) allButton.classList.remove('active');

      button.classList.toggle('active');

      const anyActive = Array.from(filterDishButtons).some(btn => btn.classList.contains('active'));
      if (!anyActive && allButton) {
        allButton.classList.add('active');
      }
    }
  });
});

filterCuisineButtons.forEach(button => {
  button.addEventListener('click', () => {
    const isAll = button.textContent.trim().toLowerCase() === "all";

    if (isAll) {

      filterCuisineButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    } else {
      const allButton = Array.from(filterCuisineButtons).find(btn => btn.textContent.trim().toLowerCase() === "all");
      if (allButton) allButton.classList.remove('active');

      button.classList.toggle('active');

      const anyActive = Array.from(filterCuisineButtons).some(btn => btn.classList.contains('active'));
      if (!anyActive && allButton) {
        allButton.classList.add('active');
      }
    }
  });
});

filterGlutenFreeButton.addEventListener('click', () => {
  filterGlutenFreeButton.classList.toggle('active');
  filterGlutenFreeButton.textContent = filterGlutenFreeButton.classList.contains('active') ? 'Yes' : 'No';
});

sortButtons.forEach(button => {
  button.addEventListener('click', () => {
    sortButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

const sortRecipes = (order) => {
  const sorted = [...currentRecipes].sort((a, b) => 
    order === 'asc'
      ? a.readyInMinutes - b.readyInMinutes
      : b.readyInMinutes - a.readyInMinutes
  );

  displayRecipes(sorted);
};

document.querySelectorAll('.sort-button button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.sort-button button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const value = button.textContent.trim().toLowerCase();
    if (value === 'ascending') sortRecipes('asc');
    else sortRecipes('desc');
  });
});