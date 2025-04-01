const allButton = document.getElementById("all");
const italyButton = document.getElementById("italy");
const usaButton = document.getElementById("usa");
const mexicoButton = document.getElementById("mexican");
const asianButton = document.getElementById("asian");

const sortByTimeAscButton = document.getElementById("highToLow");
const sortByTimeDescButton = document.getElementById("lowToHigh");
const recipesSection = document.getElementById("recipes");
const messagesSection = document.getElementById("messages");

const veganButton = document.getElementById("vegan");
const vegetarianButton = document.getElementById("vegetarian");
const glutenFreeButton = document.getElementById("gluten-Free");
const dairyFreeButton = document.getElementById("dairy-Free");

const filterButtons = [allButton, italyButton, usaButton, mexicoButton, asianButton];
const sortButtons = [sortByTimeAscButton, sortByTimeDescButton];
const dietButtons = [veganButton, vegetarianButton, glutenFreeButton, dairyFreeButton];
const randomRecipeButton = document.getElementById("randomRecipe");

let recipes = []; // Global array to store recipes fetched from the API
let currentPage = 1; // Håller reda på vilken sida vi är på
const recipesPerPage = 20; // Hur många recept vi vill hämta per gång
let scrollEnabled = true; // Håller reda på om scroll är aktiverad
const SCROLL_DELAY = 1000; // Delay for enabling scroll after random recipe selection

const updateHTML = (filter, button, buttonGroup) => {
  removeActiveClass(buttonGroup);
  button.classList.add("active");
};

const removeActiveClass = (buttonGroup) => {
  buttonGroup.forEach(button => {
    button.classList.remove("active");
  });
};

const fetchRecipes = (retryCount = 3) => {
  const URL = `https://api.spoonacular.com/recipes/random/?apiKey=a88b42ab50a44e01b8351d8a9d509de7&number=${recipesPerPage}&offset=${(currentPage - 1) * recipesPerPage}`;

  fetch(URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Omvandla svaret till JSON
    })
    .then(data => {
      const newRecipes = data.recipes; // Uppdatera recepten med API-data
      recipes = [...recipes, ...newRecipes]; // Lägg till nya recept till de redan existerande
      displayRecipes(recipes);
      messagesSection.style.display = "none"; // Hide error messages if fetch is successful
    })
    .catch(error => {
      messagesSection.style.display = "block"; // Show error message
      messagesSection.innerHTML = "<p>Failed to fetch recipes. Please try again later.</p>";
    });
};

const displayRecipes = (recipes) => {
  recipesSection.innerHTML = ""; // Clear the existing recipes

  if (recipes.length === 0) {
    messagesSection.style.display = "block"; // Show the message section
    messagesSection.innerHTML = "<p>No recipes found. Please try again later.</p>";
    return;
  }

  messagesSection.style.display = "none"; // Hide the message section if recipes are available

  let htmlContent = ""; // Accumulate HTML content in a variable

  recipes.forEach((recipe) => {
    const ingredientsList = recipe.extendedIngredients.map((ingredient) => {
      return `<li>${ingredient.amount} ${ingredient.unit} ${ingredient.name}</li>`;
    }).join("");

    htmlContent += `
      <a href="${recipe.sourceUrl}" target="_blank">
        <section class="card">
          <img src="${recipe.image}" alt="${recipe.title}">
          <h2>${recipe.title}</h2>
          <hr>
          <p class="details"><span class="bold">Cuisine:</span> ${recipe.cuisines ? recipe.cuisines.join(", ") : "Unknown"}</p>
          <p class="details"><span class="bold">Ready in:</span> ${recipe.readyInMinutes} minutes</p>
          <p class="details"><span class="bold">Diet:</span> ${recipe.vegetarian ? "Vegetarian" : ""} ${recipe.vegan ? "Vegan" : ""} ${recipe.glutenFree ? "Gluten-Free" : ""} ${recipe.dairyFree ? "Dairy-Free" : ""}</p>
          <div class="ingredients">
            <p class="details bold">Ingredients:</p>
            <ul>${ingredientsList}</ul>
          </div>
        </section>
      </a>
    `;
  });

  recipesSection.innerHTML = htmlContent; // Assign the accumulated HTML to innerHTML once
};

// Event listeners for filter buttons
allButton.addEventListener("click", () => {
  displayRecipes(recipes);
  updateHTML("all", allButton, filterButtons);
});

italyButton.addEventListener("click", () => {
  const italianRecipes = recipes.filter((recipe) => recipe.cuisines && recipe.cuisines.includes("Italian"));
  displayRecipes(italianRecipes);
  updateHTML("italy", italyButton, filterButtons);
});

usaButton.addEventListener("click", () => {
  const americanRecipes = recipes.filter((recipe) => recipe.cuisines && recipe.cuisines.includes("American"));
  displayRecipes(americanRecipes);
  updateHTML("usa", usaButton, filterButtons);
});

mexicoButton.addEventListener("click", () => {
  const mexicanRecipes = recipes.filter((recipe) => recipe.cuisines && recipe.cuisines.includes("Mexican"));
  displayRecipes(mexicanRecipes);
  updateHTML("mexico", mexicoButton, filterButtons);
});

asianButton.addEventListener("click", () => {
  const asianRecipes = recipes.filter((recipe) => recipe.cuisines && recipe.cuisines.includes("Asian"));
  displayRecipes(asianRecipes);
  updateHTML("asian", asianButton, filterButtons);
});
// Sorting recipes by time
sortByTimeAscButton.addEventListener("click", () => {
  const sortedRecipes = recipes.slice().sort((a, b) => a.readyInMinutes - b.readyInMinutes);
  displayRecipes(sortedRecipes);
  updateHTML("ascending", sortByTimeAscButton, sortButtons);
});

sortByTimeDescButton.addEventListener("click", () => {
  const sortedRecipes = recipes.slice().sort((a, b) => b.readyInMinutes - a.readyInMinutes);
  displayRecipes(sortedRecipes);
  updateHTML("descending", sortByTimeDescButton, sortButtons);
});

// Filter by diet types
veganButton.addEventListener("click", () => {
  const veganRecipes = recipes.filter((recipe) => recipe.vegan);
  displayRecipes(veganRecipes);
  updateHTML("vegan", veganButton, dietButtons);
});

vegetarianButton.addEventListener("click", () => {
  const vegetarianRecipes = recipes.filter((recipe) => recipe.vegetarian);
  displayRecipes(vegetarianRecipes);
  updateHTML("vegetarian", vegetarianButton, dietButtons);
});

glutenFreeButton.addEventListener("click", () => {
  const glutenFreeRecipes = recipes.filter((recipe) => recipe.glutenFree);
  displayRecipes(glutenFreeRecipes);
  updateHTML("gluten-free", glutenFreeButton, dietButtons);
});

dairyFreeButton.addEventListener("click", () => {
  const dairyFreeRecipes = recipes.filter((recipe) => recipe.dairyFree);
  displayRecipes(dairyFreeRecipes);
  updateHTML("dairy-free", dairyFreeButton, dietButtons);
});

randomRecipeButton.addEventListener("click", () => {
  if (scrollEnabled) {
    scrollEnabled = false;

    if (recipes.length > 0) {
      const randomIndex = Math.floor(Math.random() * recipes.length);
      const randomRecipe = [recipes[randomIndex]];
      displayRecipes(randomRecipe);
      updateHTML("randomRecipe", randomRecipeButton, []);

      // Hide messages section when there are recipes
      messagesSection.style.display = "none";
    } else {
      displayRecipes([]);
      // Show the message section when no recipes are available
      messagesSection.style.display = "block";
      messagesSection.innerHTML = "<p>No recipes available. Please try again later.</p>";
    }

    setTimeout(() => {
      scrollEnabled = true;
    }, SCROLL_DELAY);
  }
});

// Event listener for scroll
window.addEventListener('scroll', () => {
  // checking if the user is near the end of the page
  if (scrollEnabled && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    // loading more recipes
    if (recipes.length >= currentPage * recipesPerPage) {
      currentPage++;
      fetchRecipes();
    }
    setTimeout(() => {
      scrollEnabled = true; // Re-enable scroll after a delay
    }, SCROLL_DELAY);
  }
});

// Initial fetch of recipes when the page loads
fetchRecipes();
