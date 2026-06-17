document.addEventListener("DOMContentLoaded", () => { // runs init(), to load the script after the page content has been loaded
  // Dom elements: 
  const recipeContainer = document.getElementById("recipeAPI");
  const messageSection = document.getElementById("message-section");
  const checkboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
  const radios = document.querySelectorAll('.sort-group input[type="radio"]');
  const randomBtn = document.getElementById("random-btn");

  // API URL:
  const URL = `https://api.spoonacular.com/recipes/random?number=19&apiKey=98b7665281e94cf1b1803b2556236fdc`;

  let recipes = []; // > this array holds all the recipes that has been fethced from the API so they can be used for filtering and sorting without making an other API request!

  // Fetch recipes && error && max daily quota
  const fetchData = () => {
    fetch(URL)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "failed") {
          if (data.message && data.message.includes("daily quota")) {
            displayMaxQuotaMessage();
          } else {
            messageSection.innerHTML = `<h2 style="color:red;">An error occurred. Please try again later.</h2>`;
          }
          return;
        }
        recipes = data.recipes;
        loadRecipes(recipes);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        messageSection.innerHTML = `<h2 style="color:red;">Failed to load recipes. Please try again later.</h2>`;
      });
  };

  const displayMaxQuotaMessage = () => {
    messageSection.innerHTML = `
      <h2 style="color:red;">I'm so sorry, but you have reached the daily API limit.</h2>
      <p>But no stress, try again tomorrow!</p>`;
  };


  // dynamic recipes cards template: 
  const loadRecipes = (recipes) => {
    recipeContainer.innerHTML = "";
    recipes.forEach(recipe => {
      const ingredientsList = recipe.extendedIngredients
        ?.map(ingredient => `<li>${ingredient.original}</li>`)
        .join("") || "Unknown ingredients";

      const dietList = recipe.diets.length > 0
        ? recipe.diets.slice(0, 2).join(", ") + (recipe.diets.length > 2 ? "..." : "")
        : "No particular diet";

      const recipeCard = `
      <a href="${recipe.sourceUrl}" target="_blank">
      <article class="recipe-card">
            <img src="${recipe.image}" alt="${recipe.title}">
            <h2 class="title">${recipe.title}</h2>
            <hr class="divider">
            <div class="recipe-info">
              <div class="info-item">
                <span class="label">Diet: </span>
                <span class="value">${dietList}</span>
              </div> 
              <div class="info-item">
                <span class="label">Time:</span>
                <span class="value">${recipe.readyInMinutes} minutes</span>
              </div>
              <div class="info-item">
                <span class="label">Servings:</span>
                <span class="value">${recipe.servings}</span>
              </div>
            </div>
            <hr class="divider">
            <div class="ingredients">
              <h3>Ingredients:</h3>
              <ul>${ingredientsList}</ul>
            </div>
            </article>
            </a>
      `;

      recipeContainer.innerHTML += recipeCard;
    });
  };

  // Filtering and random:
  const filterRecipes = () => {
    let filteredRecipes = [...recipes];

    const selectedFilters = Array.from(checkboxes)
      .filter(checkbox => checkbox.checked && checkbox.id !== "filter-all")
      .map(checkbox => checkbox.value.toLowerCase());

    if (selectedFilters.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        selectedFilters.every(filter => {
          if (filter === "vegan") {
            return recipe.vegan || recipe.diets.includes("vegan");
          } else if (filter === "vegetarian") {
            return recipe.vegetarian || recipe.diets.includes("vegetarian");
          } else if (filter === "gluten free") {
            return recipe.glutenFree || recipe.diets.includes("gluten free");
          } else if (filter === "dairy-free") {
            return recipe.dairyFree || recipe.diets.includes("dairy free");
          } else if (filter === "pescatarian") {
            return recipe.pescatarian || recipe.diets.includes("pescatarian");
          } else {
            return true;
          }
        })
      );
    }

    // Sorting
    let selectedSort;
    for (let i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        selectedSort = radios[i].value;
        break;
      }
    }

    if (selectedSort === "Shortest") {
      filteredRecipes.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
    } else if (selectedSort === "Longest") {
      filteredRecipes.sort((a, b) => b.readyInMinutes - a.readyInMinutes);
    }

    // Update the DOM based on the filtered recipes
    if (filteredRecipes.length > 0) {
      loadRecipes(filteredRecipes);
    } else {
      showEmptyState();
    }
  };

  // empty state message
  const showEmptyState = () => {
    recipeContainer.innerHTML = ""; // Clear the recipe container
    messageSection.innerHTML = `
      <h2 style="color:#0F18A4; text-decoration: underline; text-decoration-color: #DE788B;">
        .... hmm, is there such a thing? I don't have that, sorry! Try something else?
      </h2>
    `;
  };

  // dynamic messages, on btn selection
  const updateMessage = () => {
    let message = "";
    const isAllSelected = document.getElementById("filter-all")?.checked;

    if (isAllSelected) {
      message = "You greedy foody!";
      clearSelections();
    } else {
      if (document.getElementById("filter-vegan")?.checked)
        message += "Oh I see, what about fish or eggs sometimes? Are you sure you are not Vegetarian?";
      if (document.getElementById("filter-vegetarian")?.checked)
        message += "<br>Good choice, better cutting on all that meat!";
      if (document.getElementById("filter-gluten-free")?.checked)
        message += "<br>I'm with you, gluten is poison!";
      if (document.getElementById("filter-dairy-free")?.checked)
        message += "<br>Are you sure you can give up cheese?";
      if (document.getElementById("filter-meat-based")?.checked)
        message += "<br>Sometimes it's okay to have some meat.";
      if (document.getElementById("sort-shortest")?.checked)
        message += "<br>Trying to impress someone with little time?";
      if (document.getElementById("sort-longest")?.checked)
        message += "<br>Do you really want to spend hours in the kitchen?";
    }

    messageSection.innerHTML = message || "Hey, welcome! Please pick a recipe of your liking";
  };

  // inizialize and event listeners: 

  const clearSelections = () => {
    checkboxes.forEach(checkbox => (checkbox.checked = false));
    radios.forEach(radio => (radio.checked = false));
  };


  const init = () => {
    fetchData();

    checkboxes.forEach(checkbox =>
      checkbox.addEventListener("change", () => {
        updateMessage();
        filterRecipes();
      })
    );

    radios.forEach(radio =>
      radio.addEventListener("change", () => {
        updateMessage();
        filterRecipes();
      })
    );

    randomBtn?.addEventListener("click", () => {
      if (recipes.length > 0) {
        const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
        loadRecipes([randomRecipe]); // Show only one random recipe
      } else {
        messageSection.innerHTML = `<h2 style="color:red;">No recipes available. Try reloading.</h2>`;
      }
    });

    updateMessage();
  };

  init();
});
