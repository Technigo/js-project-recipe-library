const URL = "https://api.spoonacular.com/recipes/complexSearch?number=20&apiKey=e1711b2ca9f84dec882725da3bd3acfd&cuisine=Thai,Mexican,Mediterranean,Indian&addRecipeInformation=true&addRecipeInstructions=true&fillIngredients=true"
// const URL = "https://api.spoonacular.com/recipes/complexSearch?number=20&apiKey=5b0eb7cae7ef4a20af3202de42e39e78&cuisine=Thai,Mexican,Mediterranean,Indian&addRecipeInformation=true&addRecipeInstructions=true&fillIngredients=true"


const allBtn = document.getElementById("all")
const filterBtn = document.querySelectorAll(".filter-btn")
const sortBtn = document.querySelectorAll(".sort-btn")
const descBtn = document.getElementById("desc")
const ascBtn = document.getElementById("asc")
const randomBtn = document.querySelector(".random-btn")
const container = document.getElementById("recipe-container")

allBtn.classList.add("active") //default select

//===============================
// like button - add recipes to favorites
//===============================

// save favorite recipes in localStorage
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const attachLikeEvents =() => {
    const likeButtons = document.querySelectorAll(".like-button");

    likeButtons.forEach(button => {
        button.addEventListener("click", () => {
        const card = button.closest(".recipe-card"); // find the closest recipe card
        const recipeId = String(card.dataset.id); // get the recipe ID from card's data-id and turn it into string
        const recipe = results.find(r => String(r.id) === recipeId); // find the recipe object from results array that has the same ID

        if (!recipe) return; // if recipe not found, exit

        // check if the recipe is already in favorites
        if (favorites.some(fav => String(fav.id) === recipeId)) {
            // remove recipe if it is already liked
            favorites = favorites.filter(fav => String(fav.id) !== recipeId);
            button.classList.remove("liked");
        } else {
            // otherwise add recipe to my favorites
            favorites.push(recipe);
            button.classList.add("liked");
        }

        // save recipes in localStorage
        localStorage.setItem("favorites", JSON.stringify(favorites));
        });
    });
};

//===============================
// show favorite recipes
//===============================

const favoriteBtn = document.querySelector(".favorites")

favoriteBtn.addEventListener("click", () => {
    favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length > 0) {
        displayRecipes(favorites);
    } else {
        container.innerHTML = `<p class="no-results"> No favorite recipes yet ❤️</p>`;
    }
});



//===============================
// display recipes
//===============================

const displayRecipes = (recipeArray) => {
    container.innerHTML = "" //reset the container

    recipeArray.forEach(recipe => {
         // ingredients
        let ingredients = [];
        if (recipe.extendedIngredients && Array.isArray(recipe.extendedIngredients)) {
            ingredients = recipe.extendedIngredients.map(ing => ing.original);
        }

        container.innerHTML += `
        <div class="recipe-card" data-id="${recipe.id}">
            <div class="recipe-image">
                <button class="like-button">♡</button>
                <img src="${recipe.image}" alt= "picture of ${recipe.title}"/>
            </div>
            <h3>${recipe.title}</h3>
            <hr class="line">
            <h4><b>Cuisine: </b>${recipe.cuisines && recipe.cuisines.length ? recipe.cuisines.join(", ") : "-"}</h4>
            <h4><b>Time: </b>${recipe.readyInMinutes} minutes</h4>
            <hr class="line">
            <h4>Ingredients</h4>
            <ul>
                ${ingredients.length
                    ? ingredients.map(ing => `<li>${ing}</li>`).join("")
                    : "<li>No ingredient info</li>"
                }
            </ul>
            <button class="view-recipe-button">
                <a href="${recipe.sourceUrl}" target="_blank"><h5>View full recipe</h5></a>
            </button>
        </div>
        `;
    });

    attachLikeEvents();
}

//===============================
// fetch recipes
//===============================

// global variable to store all recipes
let results = []; 

const fetchData = async () => {
    try {
    // fetch the data
    const response = await fetch(URL);

    // check the status
    if (!response.ok) {
      // show 402/403/429 when it hits the limit
        if (response.status === 402 || response.status === 403 || response.status === 429) {
        showApiLimitMessage();
        return; 
        }

      // other errors treated as normal errors
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // convert to JSON
    const data = await response.json();
    console.log("API response:", data);

    // check the data is entered correctly
    if (data.results && Array.isArray(data.results)) {
        results = data.results;
        displayRecipes(data.results);
        searchInput.addEventListener("input", filterSearchResults); // enable search after data is loaded
    } else {
        container.innerHTML = `<p class="no-results">No recipes found 🥲 Check your API key or quota.</p>`;
    }

    } catch (error) {
        console.error("Error fetching data:", error);
        showErrorMessage();
    }
};

// API error message
const showApiLimitMessage = () => {
    container.innerHTML = `
    <p class="no-results">
        ⚠️ API limit reached for today ⚠️<br>
        Please try again tomorrow.
    </p>
    `;
};

// normal error message
const showErrorMessage = () => {
    container.innerHTML = `
        <p class="no-results">
        Something went wrong while fetching recipes 🥲<br>
        Please try again later.
        </p>
    `;
};


fetchData();


//===============================
// filter + sort recipes
//===============================

// save the selected filters here
let activeFilters = [];
let currentSort = null; // asc or desc


filterBtn.forEach((button) => {
    button.addEventListener("click", () => {
        const cuisine = button.id.toLowerCase();

        // when all button is clicked
        if (cuisine === "all") {
            filterBtn.forEach(btn => btn.classList.remove("active"));
            allBtn.classList.add("active");

            activeFilters = []; // reset filters

            applyKitchenFilters(); // show all recipes
            return;
        }
        
        // other filter buttons
        if (button.classList.contains("active")) {
            button.classList.remove("active");
            activeFilters = activeFilters.filter(item => item !== cuisine);
        } else {
            button.classList.add("active");
            activeFilters.push(cuisine);
        }

        const anyActive = Array.from(filterBtn).some(
            btn => btn.id !== "all" && btn.classList.contains("active")
        );

        // remove active from all if there are other active filter buttons
        if (anyActive) {
            allBtn.classList.remove("active");
        } else {
            // all becomes active when no other active filters
            allBtn.classList.add("active");
            activeFilters = []; //reset filters
        }

        applyKitchenFilters();
    });
});

// sort buttons
descBtn.addEventListener("click", () => {
    currentSort = "desc";
    applyKitchenFilters();
});

ascBtn.addEventListener("click", () => {
    currentSort = "asc";
    applyKitchenFilters();
})

// only one button can be selected
sortBtn.forEach(sortButton => {
    sortButton.addEventListener("click", () => {
        sortBtn.forEach(btn => btn.classList.remove("active"));
        sortButton.classList.add("active");
    });
});

// main function : filter + sort
const applyKitchenFilters = () => {
    let filtered = [...results]; // make a copy of all recipes 

    //apply filters
    if (activeFilters.length > 0) {
        filtered = filtered.filter(recipe => {
            if (Array.isArray(recipe.cuisines) && recipe.cuisines.length > 0) {
                return recipe.cuisines.some(c => activeFilters.includes(c.toLowerCase()));
            }
            return false;
        });
    }

    // apply sorting
    if (currentSort === "desc") {
        filtered.sort((a,b) => b.readyInMinutes - a.readyInMinutes);
    } else if (currentSort === "asc") {
        filtered.sort((a,b) => a.readyInMinutes - b.readyInMinutes);
    }

    // show empty message
    if (filtered.length > 0) {
        displayRecipes(filtered);
    } else {
        container.innerHTML = `<p class="no-results">No recipes found</p>`;
    }
};

//===============================
// pick a random recipe
//===============================

// change the color of the button when clicked
randomBtn.addEventListener("click", () => {
    randomBtn.classList.toggle("active");
})

randomBtn.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * results.length); 
    const randomRecipe = results[randomIndex]; 
    displayRecipes([randomRecipe])
})


//===============================
// search recipes
//===============================

const searchInput = document.getElementById("text-input");
const noResultsMessage = document.getElementById("no-results"); 

// show and hide search results
const showSearchResult = (target) => target.style.display = "";
const hideSearchResult = (target) => target.style.display = "none";

// search recipes by keyword
const filterSearchResults = () => {
    const keyword = searchInput.value.trim().toLowerCase();
    const searchTargets = document.querySelectorAll('.recipe-card');
    let matchFound = false;

    searchTargets.forEach((target) => {
        const text = target.textContent.toLowerCase();
        // check if the keyword is in the text content and show/hide the recipe card
        if (text.includes(keyword)) {
            showSearchResult(target);
            matchFound = true;
        } else {
            hideSearchResult(target);
        }
    });

    // show no results message if no hits
    if (!matchFound && keyword.length > 0) {
        noResultsMessage.style.display = "block";
    } else {
        noResultsMessage.style.display = "none";
    }
};

// add event listener to the search input
searchInput.addEventListener("input", filterSearchResults);

