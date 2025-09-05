const BASE_URL = "https://api.spoonacular.com/recipes/random"
const API_KEY = "54e612ce8ca44cd3b9e1c1f233a477a1"
const URL = `${BASE_URL}/?apiKey=${API_KEY}&number=40`


let allRecipes = []; // Store recipes globally

// Function to fetch random recipes from Spoonacular API
const fetchRecipes = async () => {
  try {
    const response = await fetch(URL);

    if (!response.ok) {
      if (response.status === 402) {
        displayQuotaMessage();  
        return;
      }
      throw new Error(`Error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.recipes || !Array.isArray(data.recipes)) {
      throw new Error("Invalid API response: No recipes found.");
    }

    console.log("data", data);

    // Filter valid recipes
    allRecipes = data.recipes.filter(
      (recipe) => recipe && recipe.cuisines && recipe.image && recipe.title
    );

    console.log(allRecipes);
    renderRecipes(allRecipes);

  } catch (error) {
    console.error("error", error.message);
    displayQuotaMessage();  
  }
};

// Function to display the quota message when API limits are exceeded
const displayQuotaMessage = () => {
  const messageElement = document.getElementById("quota-message");
  if (messageElement) {
    messageElement.classList.remove("hidden");
    messageElement.classList.add("visible");
  }
};

// Function to render recipes in the DOM
const renderRecipes = (recipes) => {
  const oldContainer = document.getElementById("recipes-container");
  if (oldContainer) {
    oldContainer.remove();
  }

  const container = document.createElement("div");
  container.id = "recipes-container";

  // If no recipes found, display a message
  if (recipes.length === 0) {
    const noRecipesMessage = document.createElement("p");
    noRecipesMessage.className = "no-recipes-message";
    noRecipesMessage.textContent = "No recipes found matching your criteria. Please try a different filter.";
    container.appendChild(noRecipesMessage);
    } else {
      recipes.forEach((recipe) => {
        if (!recipe || !recipe.image) return;

    const recipeCard = document.createElement("div");
    recipeCard.className = "recipe-card";


    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}" />
      <h2>${recipe.title}</h2>
      <hr />
      <p>Cuisines: ${recipe.cuisines.join(", ")}</p>
      <h3>Cooking time: ${recipe.readyInMinutes} minutes</h3>
      <hr />
      <p>Ingredients:</p>
      <ul>
        ${Array.isArray(recipe.extendedIngredients)
        ? recipe.extendedIngredients.map((item) => `<li>${item.original}</li>`).join("")
        : "<li>No ingredients available</li>"
      }
      </ul>
    `;

    container.appendChild(recipeCard);
  });
}
  document.body.appendChild(container);
};

fetchRecipes();

// Event listeners for filtering buttons
document.querySelectorAll(".filter-buttons button").forEach((button) => {
  button.addEventListener("click", (event) => {
    document.querySelectorAll(".filter-buttons button").forEach((btn) => btn.classList.remove("selected"));
    event.target.classList.add("selected");
    const cuisine = event.target.textContent; // Get the selected cuisine
    if (cuisine === "All") {
      renderRecipes(allRecipes);
    } else {
      const filtered = allRecipes.filter(
        (recipe) => recipe.cuisines && recipe.cuisines.includes(cuisine));
      renderRecipes(filtered);
    }
  });
});

// Event listeners for sorting buttons
document.querySelectorAll(".sort-buttons button").forEach(button => {
  button.addEventListener("click", (event) => {
    document.querySelectorAll(".sort-buttons button").forEach(btn => btn.classList.remove("selected"));
    event.target.classList.add("selected");

    // Sort recipes from longest to shortest cooking time and vice versa
    const sortType = event.target.textContent;
    if (sortType === "Descending") {
      const sorted = [...allRecipes].sort((a, b) => b.readyInMinutes - a.readyInMinutes);
      renderRecipes(sorted);
    } else if (sortType === "Ascending") {
      const sorted = [...allRecipes].sort((a, b) => a.readyInMinutes - b.readyInMinutes);
      renderRecipes(sorted);
    }
  });
});


// Random recipe button
document.querySelector(".random-button").addEventListener("click", (event) => {
  document.querySelectorAll("button").forEach(btn => btn.classList.remove("selected"));

  // Add 'selected' class to the random button
  event.target.classList.add("selected");

  const randomRecipe = allRecipes[Math.floor(Math.random() * allRecipes.length)];
  renderRecipes([randomRecipe]);
});




/* This section is commented out

console.log("script is connected")

//Array of recipe objects
const recipes = [
  {
    title: 'Frutti di Mare',
    cuisine: 'Italian',
    time: 30,
    servings: 4,
    diet: [
      'pescatarian', 
      'dairy-free'
    ],
    image: './Images/Italian-frutti-di-mare.jpg',
    ingredients: [
      '400g Pasta', 
      '500g Black mussels', 
      '300g Shrimps (peeled)',
      '2 Tomatoes', 
      //'3 tbs Olive oil', 
      //'1 glove Basil leaves (for garnish)'
    ]
  },
  {
    title: 'Bucatini with Black Truffle',
    cuisine: 'Italian',
    diet: [
      'pescatarian', 
      'dairy-free'
    ],
    time: 30,
    servings: 4,
    image: './Images/Italian-truffle-spaghetti.jpg',
    ingredients: ['400g Pasta', 
      '1 Black truffle (thinly sliced)', 
      '4 anchovy fillets (minced)', 
      '2 Garlic (gloves)',
      '3 tbs Olive oil',
      //'Salt (pinch)'
    ]
  },
  {
    title: 'Tapas with Shrimp',
    cuisine: 'Spanish',
    diet: [
      'pescatarian', 
      'dairy-free'
    ],
    time: 25,
    servings: 4,
    image: './Images/Spanish-tapas.jpg',
    ingredients: ['1 Baguette', 
      '2 Dozen shrimps', 
      '1 tbs Fresh cilantro', 
      '2 Red bell peppers (minced)', 
      '3 tbs Olive oil', 
      'Salt (pinch)'
    ]
  },
  {
    title: 'Vegetable Stew',
    cuisine: 'Spanish',
    diet: [
      'vegetarian', 
      'dairy-free'
    ],
    time: 40,
    servings: 6,
    image: './Images/Spanish-vegetable-stew.jpg',
    ingredients: [
      '6 Potatoes', 
      '500g Flat green beans', 
      '1/2 White Cabbage', 
      '200 ml vegetable broth', 
      '3 tbs Olive oil', 
      'Salt (pinch)'
    ]
  },
  {
    title: 'Greek Salad',
    cuisine: 'Greek',
    diet: ['vegetarian'],
    time: 20,
    servings: 2,
    image: './Images/Greek-traditional-salad.jpg',
    ingredients: [
      '1 Cabbage', 
      '2 Tomatoes', 
      '1/2 Cucumber', 
      '150g Feta cheese', 
      //'1 Red onion', 
      //'300g Black olives', 
      //'3 tbs Olive oil'
    ]
  },
  {
    title: 'Greek Salad with Pomegranate',
    cuisine: 'Greek',
    diet: [
      'vegetarian', 
      'dairy-free'
    ],
    time: 20,
    servings: 2,
    image: './Images/Greek-salad.jpg',
    ingredients: [
      '2 Tomatoes', 
      '1/2 Cucumber', 
      '1 Red onion', 
      '1/4 Red cabbage', 
      '1 Pomegranate', 
      '200g Corn'
    ]
  }
];

// Function to display recipes
const listRecipes = (filteredRecipes) => {
  const container = document.querySelector('.recipe-container');
  const noMatchMessage = document.querySelector('.no-match');
  container.innerHTML = '';

// If no recipes are found, show the no-match message (only for no match)
  if (filteredRecipes.length === 0) {
    noMatchMessage.style.display = 'block';
  } else {
    noMatchMessage.style.display = 'none';

// Display the recipes
  filteredRecipes.forEach(recipe => {
    container.innerHTML += `
      <div class="recipe-card">
        <img src="${recipe.image}" alt="${recipe.title}">
        <h2>${recipe.title}</h2>
        <hr>
        <h3>Cuisine: ${recipe.cuisine}</h3>
        <h3>Cooking time: ${recipe.time} minutes</h3>
        <hr>
        <p>Ingredients:</p>
        <ul>
          ${recipe.ingredients.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  });
}
};

// Invoking/Calling the function
listRecipes(recipes)

// Event listeners for filters
document.querySelectorAll('.filter-buttons button').forEach(button => {
  button.addEventListener('click', (event) => {
    document.querySelectorAll('.filter-buttons button').forEach(btn => btn.classList.remove('selected')); // Remove 'selected' class from all buttons
    event.target.classList.add('selected'); // Add 'selected' class to the clicked button
    const cuisine = event.target.textContent; // Get the selected cuisine
    if (cuisine === 'All') {
      listRecipes(recipes);
    } else {
      const filtered = recipes.filter(recipe => recipe.cuisine === cuisine);
      listRecipes(filtered);
    }
  });
});

// Event listeners for sort buttons
document.querySelectorAll('.sort-buttons button').forEach(button => {
  button.addEventListener('click', (event) => {
   // Remove 'selected' class from all sort buttons
   document.querySelectorAll('.sort-buttons button').forEach(btn => btn.classList.remove('selected'));

   // Add 'selected' class to the clicked button
   event.target.classList.add('selected');


// From longest to shortest cooking time
   const sortType = event.target.textContent;
   if (sortType === 'Descending') {
     // Sort recipes by number of ingredients (most to least)
     const sorted = [...recipes].sort((a, b) => b.time - a.time);
     listRecipes(sorted);
   } else if (sortType === 'Ascending') {
     // Sort recipes by number of ingredients (least to most)
     const sorted = [...recipes].sort((a, b) => a.time - b.time);
     listRecipes(sorted);
   }
 });
});


// Random recipe button
document.querySelector('.random-button').addEventListener('click', (event) => {
  document.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));

  // Add 'selected' class to the random button
  event.target.classList.add('selected');

  const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
  listRecipes([randomRecipe]);
});


/* Ingreients length, change the number of ingredients to see difference

   const sortType = event.target.textContent;
   if (sortType === 'Descending') {
     // Sort recipes by number of ingredients (most to least)
     const sorted = [...recipes].sort((a, b) => b.ingredients.length - a.ingredients.length);
     listRecipes(sorted);
   } else if (sortType === 'Ascending') {
     // Sort recipes by number of ingredients (least to most)
     const sorted = [...recipes].sort((a, b) => a.ingredients.length - b.ingredients.length);
     listRecipes(sorted);
   }
 });
});

*/

   /* Based on time and whether its is equal or more than/less than 30 minutes

   const sortType = event.target.textContent;
   if (sortType === 'Ascending') {
     const filtered = recipes.filter(recipe => recipe.time >= 30);
     listRecipes(filtered);
   } else if (sortType === 'Descending') {
     const filtered = recipes.filter(recipe => recipe.time < 30);
     listRecipes(filtered);
   }
 });
});

This section is commented out */