document.addEventListener("DOMContentLoaded", () => {
  const API_URL =
    "https://api.spoonacular.com/recipes/random?number=80&include-tags=vegetarian&apiKey=1f7a525474994d99b2f2a00a1f826e01";

  //DOM Elements
  const recipesGrid = document.querySelector(".recipes-grid");
  const filterDropdown = document.querySelector(".filter-dropdown");
  const sortDropdown = document.querySelector(".sort-dropdown");
  const getRandomRecipe = document.querySelector(".random-btn");
  const randomButtonContainer = document.querySelector(
    ".random-button-container"
  );
  const loader = document.getElementById("loader");

  //State variables
  let activeRecipes = [];
  let allRecipes = [];
  let isLoading = false;

  //Functions
  const loadMoreRecipes = async () => {
    loader.style.display = "block";

    const newRecipes = await fetchRecipes();

    if (newRecipes.length > 0) {
      activeRecipes = [...activeRecipes, ...newRecipes];
      displayRecipes(activeRecipes);
    }

    loader.style.display = "none";
  };

  const fetchRecipes = async () => {
    const cachedData = localStorage.getItem("cachedRecipes");
    const cacheTimestamp = localStorage.getItem("cacheTimestamp");
    const cacheExpiry = 60 * 60 * 1000;

    if (
      cachedData &&
      cacheTimestamp &&
      Date.now() - cacheTimestamp < cacheExpiry
    ) {
      return JSON.parse(cachedData);
    }

    try {
      const response = await fetch(API_URL);

      if (response.status === 402) {
        console.warn(
          "Quota limit reached! Calling showQuotaExceededMessage()."
        );
        showQuotaExceededMessage();
        return [];
      }

      const data = await response.json();

      localStorage.setItem("cachedRecipes", JSON.stringify(data.recipes));
      localStorage.setItem("cacheTimestamp", Date.now().toString());

      return data.recipes;
    } catch (error) {
      console.warn("Error fetching recipes:", error);
      return [];
    }
  };

  const displayRecipes = (recipes) => {
    const closeDropdowns = () => {
      document.querySelectorAll(".dropdown-content").forEach((content) => {
        content.style.display = "none";
      });

      document.querySelectorAll(".dropdown.content").forEach((btn) => {
        btn.classList.remove("active");
      });
    };
    recipesGrid.innerHTML = "";
    if (recipes.length === 0) {
      recipesGrid.classList.add("no-recipes-active");
      randomButtonContainer.classList.add("hidden");
      recipesGrid.innerHTML = `<div class="no-recipes">
    <img src="computersaysno.gif" alt="No recipes match your filters.">
    <p>No recipes match the filters. Sorry ♥️! </p>
    <button class="reset-filters-btn">Reset filters</button>
      </div>
      `;

      closeDropdowns();

      document
        .querySelector(".reset-filters-btn")
        .addEventListener("click", resetFilters);

      return;
    }

    recipesGrid.classList.remove("no-recipes-active");
    randomButtonContainer.classList.remove("hidden");
    randomButtonContainer.style.display = "flex";

    recipes.forEach((recipe) => {
      const card = document.createElement("div");
      card.classList.add("recipe-card");
      card.innerHTML = `
        <a href="${
          recipe.sourceUrl
        }" target="_blank" rel="noopener noreferrer" class="recipe-link">
        <img src="${recipe.image}" alt="${recipe.title}">
        <div class="recipe-content">
          <h3 class="recipe-title">${recipe.title}</h3>
          <hr>
          <div>
            <p class="recipe-meta">
              <span class="material-icons">restaurant</span> ${
                recipe.cuisines[0] || "-"
              }</p>
            <p class="recipe-meta">
              <span class="material-icons">schedule</span> ${
                recipe.readyInMinutes
              } min
            </p>
          </div>
          <hr>
          <h4 class="recipe-subtitle">Ingredients</h4>
          <ul class="ingredient-list">
            ${recipe.extendedIngredients
              .slice(0, 4)
              .map(
                (ingredient) =>
                  `<li class="ingredient-list-item">${capitalize(
                    ingredient.name
                  )}</li>`
              )
              .join("")}
          </ul>
        </div>
      `;
      recipesGrid.appendChild(card);
    });
  };

  const resetFilters = () => {
    document
      .querySelectorAll('input[type="checkbox"], input[type="radio"]')
      .forEach((input) => {
        input.checked = false;
      });

    displayRecipes(allRecipes);
  };

  const showQuotaExceededMessage = () => {
    if (loader) loader.style.display = "none";

    const quotaMessage = document.querySelector(".quota-message");

    if (recipesGrid) {
      recipesGrid.style.display = "block";
    }

    if (quotaMessage) {
      quotaMessage.style.display = "block";
      quotaMessage.style.opacity = "1";
    } else {
      console.error("Quota message element not found.");
    }
  };

  const filterRecipes = (recipes) => {
    const dietFilters = {
      "gluten-free":
        Array.from(
          document.querySelectorAll(
            'input[name="diet"][value="gluten-free"]:checked'
          )
        ).length > 0,
      "dairy-free":
        Array.from(
          document.querySelectorAll(
            'input[name="diet"][value="dairy-free"]:checked'
          )
        ).length > 0,
      vegan:
        Array.from(
          document.querySelectorAll('input[name="diet"][value="vegan"]:checked')
        ).length > 0,
      vegetarian:
        Array.from(
          document.querySelectorAll(
            'input[name="diet"][value="vegetarian"]:checked'
          )
        ).length > 0,
    };

    const cuisineFilters = Array.from(
      document.querySelectorAll('input[name="cuisine"]:checked')
    ).map((el) => el.value);

    const timeFilters = Array.from(
      document.querySelectorAll('input[name="time"]:checked')
    ).map((el) => el.value);

    return recipes.filter((recipe) => {
      const dietMatch =
        (!dietFilters["gluten-free"] &&
          !dietFilters["dairy-free"] &&
          !dietFilters["vegan"] &&
          !dietFilters["vegetarian"]) ||
        ((dietFilters["gluten-free"] ? recipe.glutenFree : true) &&
          (dietFilters["dairy-free"] ? recipe.dairyFree : true) &&
          (dietFilters["vegan"] ? recipe.vegan : true) &&
          (dietFilters["vegetarian"] ? recipe.vegetarian : true));

      const cuisineMatch =
        cuisineFilters.length === 0 ||
        cuisineFilters.some((cuisine) =>
          recipe.cuisines.some((c) => c.toLowerCase() === cuisine.toLowerCase())
        );

      const timeMatch =
        timeFilters.length === 0 ||
        timeFilters.includes(getTimeCategory(recipe.readyInMinutes));

      return dietMatch && cuisineMatch && timeMatch;
    });
  };

  const sortRecipes = (recipes) => {
    const sortMethod = document.querySelector(
      'input[name="sort"]:checked'
    )?.value;
    if (!sortMethod) return recipes;

    const [property, direction] = sortMethod.split("-");
    return recipes.sort((a, b) => {
      let valueA, valueB;
      switch (property) {
        case "time":
          valueA = a.readyInMinutes;
          valueB = b.readyInMinutes;
          break;
        case "popularity":
          valueA = a.aggregateLikes;
          valueB = b.aggregateLikes;
          break;
        case "price":
          valueA = a.pricePerServing;
          valueB = b.pricePerServing;
          break;
        default:
          return 0;
      }
      return direction === "asc" ? valueA - valueB : valueB - valueA;
    });
  };

  const getTimeCategory = (time) => {
    if (time < 15) return "under15";
    if (time >= 15 && time <= 30) return "15-30";
    if (time > 30 && time <= 60) return "30-60";
    return "over60";
  };

  const capitalize = (s) =>
    s && String(s[0]).toUpperCase() + String(s).slice(1);

  const updateRecipes = async () => {
    const loader = document.getElementById("loader");
    loader.style.display = "block";
    randomButtonContainer.style.display = "none";

    try {
      if (allRecipes.length === 0) {
        allRecipes = await fetchRecipes();
        if (allRecipes.length === 0) return;
      }
      const recipes = allRecipes;
      const filteredRecipes = filterRecipes(recipes);
      const sortedRecipes = sortRecipes(filteredRecipes);
      activeRecipes = sortedRecipes;

      displayRecipes(sortedRecipes);
    } catch (error) {
      console.error("Error updating recipes:", error);
    } finally {
      loader.style.display = "none";
    }
  };

  filterDropdown.addEventListener("change", updateRecipes);
  sortDropdown.addEventListener("change", updateRecipes);

  //Event listeners
  getRandomRecipe.addEventListener("click", () => {
    if (activeRecipes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * activeRecipes.length);
    const randomRecipe = activeRecipes[randomIndex];
    displayRecipes([randomRecipe]);
  });

  window.addEventListener("scroll", async () => {
    if (isLoading) return;

    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 50
    ) {
      isLoading = true;
      await loadMoreRecipes();
      isLoading = false;
    }
  });

  document.querySelectorAll(".dropdown-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dropdown-content").forEach((content) => {
        if (content !== btn.nextElementSibling) {
          content.style.display = "none";
        }
      });

      document.querySelectorAll(".dropdown-btn").forEach((otherBtn) => {
        if (otherBtn !== btn) {
          otherBtn.classList.remove("active");
        }
      });

      btn.classList.toggle("active");
      const content = btn.nextElementSibling;
      content.style.display =
        content.style.display === "block" ? "none" : "block";
    });
  });

  document.addEventListener("click", (e) => {
    if (
      !e.target.matches(".dropdown-btn") &&
      !e.target.closest(".dropdown-content")
    ) {
      document.querySelectorAll(".dropdown-content").forEach((content) => {
        content.style.display = "none";
      });
      document.querySelectorAll(".dropdown-btn").forEach((btn) => {
        btn.classList.remove("active");
      });
    }
  });

  updateRecipes();
});
