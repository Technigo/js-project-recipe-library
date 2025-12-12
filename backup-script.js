// ==================================================
// Settings & Constants
// API keys, URLs, and initial setup variables
// ==================================================
document.addEventListener("DOMContentLoaded", () => {

const myHeaders = new Headers();
myHeaders.append('x-api-key', '0c625ab60e6a40a1a4b6cc2e4a5fe9b0');
// Tells the API that we want the data in JSON format
myHeaders.append('Content-Type', 'application/json')

const requestOptions = {
    method: 'GET', // We want to GET (fetch) data
    redirect: 'follow',
    headers: myHeaders // API-key sends as a HTTP-header, more safe without the key in the URL
};

// The address of the API we fetch data from
const URL = 'https://api.spoonacular.com/recipes/random?number=30';

// === Connecting JavaScript variables to HTML elements ===

const randomBtn = document.getElementById("random-recipe");
const cardOverlay = document.getElementById("card-overlay");
const cardContent = document.getElementById("card-content");

const glutenBtn = document.getElementById("gluten-btn");
const dairyBtn = document.getElementById("dairy-btn");
const vegBtn = document.getElementById("veg-btn");
const allBtn = document.getElementById("filter-btn"); 
const descenBtn = document.getElementById("descending-btn");
const ascenBtn = document.getElementById("ascending-btn");

// Get all buttons in the filter section into a single list
const filterButtons = document.querySelectorAll(".filter button")
const sortButtons = document.querySelectorAll(".sort button")

// An empty list that will act as our local "database" for all recipes
let allRecipes = [];

// ==================================================
// Functions
// ==================================================

// A "display engine" that can take any list of recipes and show it on the screen
const displayRecipes = (recipesToShow) => {

    // Finds the container for all the recipe cards
    const recipeContainer = document.getElementById("recipe-container");

    //if (recipesToShow) is flase, undefined - length === 0, checking the list, if it contains any recipes
    // || = if anyone of these two things is true - show empty-state-message
    if (!recipesToShow || recipesToShow.length === 0) {
        recipeContainer.innerHTML = '<p class="empty-state-message">Sorry, no recipes match your filter. Please try another one!</p>';
        return; // terminate the function otherwise it would runt map() with an empty list
    }

    // Builds all the cards in memory first and then adds them to the page all at once
    const allCardsHTML = recipesToShow.map(recipe => createGridCardHTML(recipe)).join('');
    recipeContainer.innerHTML = allCardsHTML;

};

// A function for building the HTML code for a small recipe card in the grid
const createGridCardHTML = (recipe) => {
    const imgUrl = recipe.image;
    const title = recipe.title;
    const time = recipe.readyInMinutes;
    const diets = recipe.diets;
    const ingredients = recipe.extendedIngredients || []; // Use an empty list if ingredients are missing
    //Go through every ingredient in the list.. 
    const ingredientsHTML = ingredients.map(ingredient => {
        return `<li>${ingredient.original}</li>`; //..and make an HTML-list <li> for each item
    }).join(''); //then paste them together in one string

    //Building the HTML were we paste the variables that was created above ${...}
    return `
        <article class="recipe-card">
            <img src="${imgUrl}" alt="Picture of ${title}">
            <div class="grid-card-content">
                <h2 class="recipe-title">${title}</h2>
                <p class="recipe-time"> Cooking Time: <span class="time-answer">${time} minutes </span></p>
                <p>Diets:<span class="diet-answer"> ${diets}</span></p>
                <h3 class="ingredients-title">Ingredients:</h3>
                <ul class="recipe-ingredients">
                    ${ingredientsHTML}
                </ul>
            </div>
        </article>
    `;
};

// A function for building the HTML for the large, detailed card in the popup window
const createOverlayCardHTML = (recipe) => {
    const imgUrl = recipe.image;
    const title = recipe.title;     
    const time = recipe.readyInMinutes;
    const diets = recipe.diets;
    
    const ingredients = recipe.extendedIngredients || [];//the list with ingrediens, if its empty make an empty list to avoid errors
    const instructions = recipe.instructions;
    //Go through every ingredient in the list.. 
    const ingredientsHTML = ingredients.map(ingredient => {
        return `<li>${ingredient.original}</li>`; //..and make an HTML-list <li> for each item
    }).join(''); //Then paste them together in one string

    //Building the HTML were we paste the variables that was created above ${...}
    return `
        <div class="overlay-card-content">
            <img src="${imgUrl}" alt="Picture of ${title}">
            <h2 class="recipe-title">${title}</h2>
            <p class="recipe-time"> Cooking Time: <span class="time-answer">${time} minutes </span></p>
            <p>Diets:<span class="diet-answer"> ${diets}</span></p>
            <h3 class="ingredients-title">Ingredients:</h3>
            <ul class="recipe-ingredients">
                ${ingredientsHTML}
            </ul>
            <p class="recipe-instructions">${instructions}</p>
        </div>
    `;
};

// A function that runs one time at the start to handle the incoming data
const processRecipeData = (result) => {
    // Checks that we actually received a valid list of recipes
    if (result && result.recipes && result.recipes.length > 0) {
        // Saves all recipes to our local "database" 
        allRecipes = result.recipes;
        console.log("All Recipes:", allRecipes);

        // Uses our "display engine" to show all recipes from the start
        displayRecipes(allRecipes);

    } else {
        // If the data was empty or invalid
        console.log("Could not process recipe data, result was empty or invalid");
    }
};

// Listens for clicks on the "random" button
randomBtn.addEventListener("click", () => {
    // First, a safety check to make sure there are recipes in our list
    // If the list doesn't exist or is empty...
    if (!allRecipes || allRecipes.length === 0) {
        // ...log a message to the console...
        console.log("No recipes available to choose from.");
        // ...and stop the function here
        return; 
    }

    // Selects a random index from our allrecipes list
    const randomIndex = Math.floor(Math.random() * allRecipes.length);
    const randomRecipe = allRecipes[randomIndex];

    // Builds the HTML for the popup window with the random recipe
    const cardHTML = createOverlayCardHTML(randomRecipe);
    cardContent.innerHTML = cardHTML;// Puts the HTML into the white box
    cardOverlay.classList.add("visible");// Makes the entire popup window visible
});

// Listens for clicks on the dark background to close the popup
cardOverlay.addEventListener("click", (event) => {
    // Checks if the clicked element was the background itself, and not the box inside it
    if (event.target === cardOverlay) {
        cardOverlay.classList.remove("visible");// Hides the popup window.
    }
});

//activates the class "active", witch removes and ads the colors for the clicked buttons
const updateActiveButton = (clickedButton) => {
    // First, remove the "active" class from all sort buttons
    filterButtons.forEach(button => {
        button.classList.remove("active");
    });
    // Then, add the "active" class to the one that was just clicked
    clickedButton.classList.add("active");
};

//activates the class "active", witch removes and ads/removes the colors for the clicked buttons
const updateActiveSortButton = (clickedButton) => {
    // First, remove the "active" class from all sort buttons
    sortButtons.forEach(button => {
        button.classList.remove("active");
    });
    // Then, add the "active" class to the one that was just clicked
    clickedButton.classList.add("active");
};

// ==================================================
// Event Listeners for Filtering
// ==================================================

// Listens for clicks on the "Gluten free" button
glutenBtn.addEventListener("click", () => {
    updateActiveButton(glutenBtn); // Set this button as active
    console.log("Filtering for 'gluten free'");
    // Creates a new list that only contains recipes where the 'diets' list includes 'gluten free'
    const filtered = allRecipes.filter(recipe => recipe.diets.includes('gluten free'));
    
    // Uses our "display engine" to show the new, filtered list
    displayRecipes(filtered);
});

// Listens for clicks on the "Dairy free" button
dairyBtn.addEventListener("click", () => {
    updateActiveButton(dairyBtn);
    console.log("Filtering for 'dairy free'");
    const filtered = allRecipes.filter(recipe => recipe.diets.includes('dairy free'));
    displayRecipes(filtered);
});

// Listens for clicks on the "Vegetarian" button
vegBtn.addEventListener("click", () => {
    updateActiveButton(vegBtn);
    console.log("Filtering for 'vegetarian'");
    // Some recipes use 'vegetarian: true' instead of in the 'diets' list, so we check that property
    const filtered = allRecipes.filter(recipe => recipe.vegetarian === true); 
    displayRecipes(filtered);
});

// Listens for clicks on the "All" button to reset the filter
allBtn.addEventListener("click", () => {
    updateActiveButton(allBtn); 
    console.log("Showing all recipes again");
    // Calls the "display engine" with the entire, unfiltered allrecipes list
    displayRecipes(allRecipes);
});

descenBtn.addEventListener("click", () => {
    updateActiveSortButton(descenBtn);
    console.log("Sorting recipes by descending cooking time");
    // Making a copy of allRecipes list and sorting it
    const sortedRecipes = [...allRecipes].sort((a, b) => b.readyInMinutes - a.readyInMinutes);
    displayRecipes(sortedRecipes);
});

ascenBtn.addEventListener("click", () => {
    updateActiveSortButton(ascenBtn);
    console.log("Sorting recipes by ascending cooking time");
    // Making a copy of allRecipes list and sorting it
    const sortedRecipes = [...allRecipes].sort((a, b) => a.readyInMinutes - b.readyInMinutes);
    displayRecipes(sortedRecipes);
});

// ==================================================
// Initialization
// This is the code that runs when the page loads
// ==================================================

// Checks if there are saved recipes in the browser's memory (localStorage)
const savedRecipeJSON = localStorage.getItem("savedRecipe");

// IF there are saved recipes...
if (savedRecipeJSON) {
    console.log("Fetching recipes from localStorage...");
    const savedRecipe = JSON.parse(savedRecipeJSON); // Converts the text back into an object
    processRecipeData(savedRecipe);// Uses the saved 
    // ELSE (if it's the first visit or the memory has been cleared)...
} else {
    console.log("Fetching new recipes from the API..."); // Make a call to the API
    fetch(URL, requestOptions)
        .then(response => {
            // If the response did not go wel ( status 402)
            if (!response.ok) {
                // If the error is specifically "API limit reached"
                if (response.status === 402) {
                    // Error message
                    throw new Error('API daily limit reached. Please try again tomorrow.');
                }
                // Other errors
                throw new Error('Could not fetch recipes from the server.');
            }
            // If everyhting went well
            return response.json(); // Converts the response to a JavaScript object
        })
        .then(result => {
            // When we have the data:
            // 1. Save it to the browser's memory for next time
            localStorage.setItem("savedRecipes", JSON.stringify(result));
            // 2. Use the data to build the page
            processRecipeData(result);
        })
        .catch(error => {
            // Catch the error created above and show it to the user
            console.error("error", error);
            document.getElementById("recipe-container").innerHTML = `<p class="error-message">${error.message}</p>`;
        }); // Catches any errors during the API call
}
});
