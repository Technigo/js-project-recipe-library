// global variables
const apiKey = "cf8d763903c74744a4d13c68cc9aa6c8";
const url = `https://api.spoonacular.com/recipes/random?number=25&apiKey=${apiKey}`;
let activeFilters = [];
let favoriteRecipes = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
let allRecipes = [];

// DOM elements
const allButtons = document.querySelectorAll(".btn");
const filterButtons = document.querySelectorAll(".filter-container .btn");
const sortButtons = document.querySelectorAll(".sort-container .btn");
const randomButton = document.getElementById("random-button");
const favoriteButton = document.getElementById("favorite-button");
const favoriteButtonHeart = document.getElementById("favorite-button-heart");
const searchButton = document.getElementById("search-button");
const cardContainer = document.getElementById("card-container");
const favoriteRecipeHearts = document.querySelectorAll(".card-container .fa-heart");
const modalOverlay = document.getElementById("modal-overlay");
const modalContent = document.getElementById("modal-content");
const modalCrossIcon = document.getElementById("cross-icon");


// fetch data from API
const fetchData = async () => {
  // create a variable with data from local storage. Set fallback to empty array so value is never null
  const storedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];  

  // show loading state when fetching data
  let fetchLoadingState = true; 

  if (fetchLoadingState === true){
    cardContainer.innerHTML = `<p>Loading...</p>`;
  }
  
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    const fetchedRecipes = data.recipes;

    // turn off loading state
    fetchLoadingState = false;

    // if fetch is successful, save it to local storage and update allRecipes
    if(fetchedRecipes && fetchedRecipes.length > 0 ) {
      localStorage.setItem("recipes", JSON.stringify(fetchedRecipes));
      allRecipes = fetchedRecipes;
    // if the fetch has no data (empty array), update allRecipes with data from local storage
    } else {
      allRecipes = storedRecipes;
    }

    if (allRecipes.length > 0) {
      showRecipeCards(allRecipes);
    } else {
      cardContainer.innerHTML = `<p class="filter-error-message">No recipes found locally or from API.</p>`;
    }
  }
  // if fetch fails
  catch(error) {
    console.error('Fetch error:', error);
    // update allRecipes with data from local storage
    allRecipes = storedRecipes;

    if (allRecipes.length > 0) {
      showRecipeCards(allRecipes);
    } else {
    cardContainer.innerHTML = `<p class="filter-error-message">No recipes found locally or from API.</p>`;
    }
  }
};


const showRecipeCards = (recipeArray) => {
  
  //reset card container before filling it
  cardContainer.innerHTML = "";

  if(!recipeArray || recipeArray.length === 0) {
    cardContainer.innerHTML = `<p class="filter-error-message">Oh no!🥲 Unfortunately there are no recipes matching your current filter. Try another one!</p>`;
  }

  recipeArray.forEach((recipe) => {

    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = recipe.id;

    // check if the recipes id match any id of the recipes in favoriteRecipes. If true, set the variable to the class of active state for the heart icon
    const heartIconClass = favoriteRecipes.some(favoriteRecipe => favoriteRecipe.id === recipe.id) ? "fas" : "far";


    // create elements in each card with content from each recipe
    card.innerHTML += `
      <div class="recipe-content">
        <div class="heart-icon-container">
        <i class="${heartIconClass} fa-heart" style="font-size:24px;"></i>
        </div>
        <img src=${recipe.image} alt=${recipe.title}>
        <h3>${recipe.title}</h3>
        <hr class="solid">
        <div class="recipe-information">
          <p><b>Cuisine:</b> ${
            recipe.cuisines && recipe.cuisines.length > 0
            ? recipe.cuisines.join(", ")
            : "Not specified"
          }</p>
          <p class="time"><b>Time:</b> ${recipe.readyInMinutes} min</p>
          <p><b>Servings:</b> ${recipe.servings}</p>
        </div>
        <hr class="solid">
        <div class="recipe-summary">
          <p>${recipe.summary.split(". ").slice(0, 2).join(". ") + "."}</p>
        </div>
        <div class="recipe-instruction hidden">
          <h4>Instructions:</h4>
          <ol>
          ${recipe.analyzedInstructions[0].steps
            .map(step => `<li>${step.step}</li>`)
            .join("")}
          </ol>
        </div>
        <div class="ingredients hidden">
          <h4>Ingredients:</h4>
          <ul class="ingredient-list"></ul>
        </div>
      </div>
      <button class="card-button btn">Read more</button>
    `
    
    // create a <li> for every ingredient in each recipe and append it to the ingredient list in the card
    recipe.extendedIngredients.forEach((ing) => {
      const eachIngredient = document.createElement("li");
      eachIngredient.textContent = ing.original;
      const ingredientList = card.querySelector(".ingredient-list");
      ingredientList.appendChild(eachIngredient);       
    });

   // append the card to the card container
    cardContainer.appendChild(card);
  });
};


function openCloseModal() {
  modalOverlay.classList.toggle("hidden");
};


function showCardInModal(cardButton) {
  // find the card which button was clicked
  const clickedCard = cardButton.closest(".card"); 
    
  // copy its inner HTML into the modal content
  modalContent.innerHTML = clickedCard.innerHTML;

  // remove some intial elements from the card
  modalContent.querySelector(".card-button").remove();
  modalContent.querySelector(".heart-icon-container").remove();
  modalContent.querySelector(".recipe-content .recipe-summary").classList.toggle("hidden");

  // make the recipe's instructions and ingredients visible
  modalContent.querySelector(".recipe-content .recipe-instruction").classList.toggle("hidden");
  modalContent.querySelector(".recipe-content .ingredients").classList.toggle("hidden");
};


const filterCardsOnKitchen = activeFilters => {
  // if there are no active filters (all button is active), or if undefined
  if (!activeFilters || activeFilters.length === 0)  {
    const filteredCards = [];
    showRecipeCards(allRecipes);
  } else {
    filteredCards = allRecipes.filter(recipe => 
      recipe.cuisines && recipe.cuisines.some(cuisine =>
        activeFilters.includes(cuisine)
      ));
    showRecipeCards(filteredCards);
  }
};


const sortCardsOnCookingTime = buttonText => {
  // create an array of the cards
  const sortedCardArray = [...document.querySelectorAll(".card")];
  // get the cooking time of each card
  const getTime = (card) => {
    const text = card.querySelector(".time").textContent;
     // extract and return the number from it
    const number = text.match(/\d+/);
    return number ? parseInt(number[0], 10) : 0;
  };

  sortedCardArray.sort((a, b) => {
    if (buttonText === "Descending") {
      return getTime(b) - getTime(a);
    } else if (buttonText === "Ascending") {
      return getTime(a) - getTime(b);
    }
    });

    // re-append the cards in sorted order
    const cardContainer = document.getElementById("card-container");
    sortedCardArray.forEach((card) => 
      cardContainer.appendChild(card)
    );
};


const randomizeCard = () => {
  const randomIndex = Math.floor(Math.random() * allRecipes.length);
  const randomRecipe = allRecipes[randomIndex];
  showRecipeCards([randomRecipe]);
}


const updateActiveFilters = (buttonText, buttonIsActive) => {
  if(buttonText === "All") {
    activeFilters = [];
  } else if(buttonIsActive) {
    activeFilters.push(buttonText);
  } else {
    activeFilters = activeFilters.filter(activeFilter => activeFilter !== buttonText);
  }
  return activeFilters;
}


const updateFavoriteRecipes = (recipeId, recipeIsLiked) => {
  // find the corresponding recipe (in allRecipes) for the clicked card by comparing their recipe ID's
  clickedRecipe = allRecipes.find(recipe => recipe.id === recipeId);
  if (!clickedRecipe) return;

  if (recipeIsLiked === true) {
    // add that recipe to favoriteRecipes, if not already there
    const isAlreadyFavorite = favoriteRecipes.some(favoriteRecipe => favoriteRecipe.id === recipeId);
    if (!isAlreadyFavorite) favoriteRecipes.push(clickedRecipe);
  } else {
    // remove that recipe from favorites
    favoriteRecipes = favoriteRecipes.filter(favoriteRecipe => favoriteRecipe.id !== recipeId);
  }

  addFavoriteRecipesToLocalStorage();
};


// to make sure there are no recipes in favoriteRecipes that no longer exist in allrecipes

const addFavoriteRecipesToLocalStorage = () => {
// create a set of valid recipe IDs from allRecipes
const validRecipeIds = new Set(allRecipes.map(recipe => recipe.id));

// filter favoriteRecipes so only recipes that exist in allRecipes are left
favoriteRecipes = favoriteRecipes.filter(favoriteRecipe => validRecipeIds.has(favoriteRecipe.id));

// save cleaned favoriteRecipes to localStorage
localStorage.setItem("favoriteRecipes", JSON.stringify(favoriteRecipes));
}



const filterCardsOnSearch = liveInputText => {
  if (liveInputText && liveInputText.length > 0) {
    const filteredCards = allRecipes.filter(recipe => (recipe.title.toLowerCase()).includes(liveInputText.toLowerCase()));
    showRecipeCards(filteredCards);
  } else {
    showRecipeCards(allRecipes);
  }
};


// event listeners

document.addEventListener("DOMContentLoaded", () => {
  fetchData();
});



filterButtons.forEach(filterButton => {
  filterButton.addEventListener("click", () => {
    const buttonText = filterButton.innerText;
    // if the clicked button is "All", remove the class "active" from all the other buttons
    if(buttonText === "All") {
      allButtons.forEach((button) => button.classList.remove("active"));
      filterButton.classList.add("active");
    // if the clicked button is any other, remove the class "active" from the filterAllButton and toggle the class on the clicked button
    } else if(buttonText !== "All") {
      const filterAllButton = document.getElementById("filter-all-button");
      filterAllButton.classList.remove("active");
      filterButton.classList.toggle("active");
      // remove "active" from sorting buttons or random button, in case they are active
      sortButtons.forEach((sortButton) => sortButton.classList.remove("active"));
      randomButton.classList.remove("active");
    }

    // create a variable to know if button is currently active
    const buttonIsActive = filterButton.classList.contains("active");

    updateActiveFilters(buttonText, buttonIsActive);
    filterCardsOnKitchen(activeFilters);
  });
}); 


sortButtons.forEach(sortButton => {
  sortButton.addEventListener("click", () => {
    // remove active state from all sort buttons
    sortButtons.forEach((sortButton) => sortButton.classList.remove("active"));
    
    sortButton.classList.add("active");
    
    const buttonText = sortButton.innerText;
    // if button is clicked to active
    if (sortButton.classList.contains("active")) {
      sortCardsOnCookingTime(buttonText);
    }
  });
}); 


randomButton.addEventListener("click", () => {
  // remove the active state from all buttons
  allButtons.forEach((button) => button.classList.remove("active"));

  randomButton.classList.toggle("active");

  if(randomButton.classList.contains("active")) {
    randomizeCard(); 
  } else {
    showRecipeCards(allRecipes);
  }
});


// set click listener on cardContainer that always exist in the DOM, since the card and heart icons are added dynamically 
cardContainer.addEventListener("click", (e) => {
  // the closest heart of clicked element (e.target is the DOM element that was clicked)
  const heartIcon = e.target.closest(".far, .fas");
   // the recipe id of the closest card of the clicked element
  const recipeId = parseInt(e.target.closest(".card").dataset.id);

  // exit if the click is not the heart icon
  if (!heartIcon) return;

  // toggle active state of the heart icon
  heartIcon.classList.toggle("far");
  heartIcon.classList.toggle("fas");

  const recipeIsLiked = heartIcon.classList.contains("fas");
  
  updateFavoriteRecipes(recipeId, recipeIsLiked);
});



// set click listener on cardContainer that always exist in the DOM, since the card and its buttons are added dynamically 
cardContainer.addEventListener("click", (e) => {
  // e.target is the DOM element that was clicked.
  const cardButton = e.target.closest(".card-button");

  // exit if the click is not the card button
  if (!cardButton) return;

  openCloseModal();
  showCardInModal(cardButton);
});


  
modalCrossIcon.addEventListener("click", openCloseModal);


favoriteButton.addEventListener("click", () => {
  const favoriteButtonIsActive = favoriteButton.classList.toggle("active");

  // remove active state from all other buttons
  allButtons.forEach((button) => {
    if(button !== favoriteButton) button.classList.remove("active");
  });
  
  showRecipeCards(favoriteButtonIsActive ? favoriteRecipes: allRecipes);

});


searchButton.addEventListener("input", (e) =>{
  const liveInputText = e.target.value;
  filterCardsOnSearch(liveInputText);
});