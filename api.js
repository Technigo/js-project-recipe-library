const YOUR_API_KEY = "67f9082ad89f4a5dbe3f592aca788d38";
const URL = `https://api.spoonacular.com/recipes/random?number=4&apiKey=${YOUR_API_KEY}`; // Fetch 4 recipes
let recipes = [];
// Fetch recipes from the API STANDARD FETCH FUNCTION
const fetchRecipes = () => {
    //Use cached fetches if available so i dont run out of api calls
 if(recipe.cousines) {}

    fetch(URL)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched new recipes:", data.recipes);

            recipes = data.recipes; // Store fetched recipes in global variable
            localStorage.setItem('recipes', JSON.stringify(recipes));

            // Process each recipe
            recipes.forEach(recipe => handleRecipeData(recipe));

            // Now that recipes are fetched, add sorting functionality
            sortTime();
            sortPrice();
        })
        .catch(error => console.error('Error fetching the data:', error));
};
    //Use cached fetches if available so i dont run out of api

// Fetch and cache recipes on page load
document.addEventListener('DOMContentLoaded', fetchRecipes);

// Handle the recipe data and create recipe cards
const handleRecipeData = (recipe) => {
    const container = document.getElementById('container');
    const recipeCard = document.createElement('section');
    const time = recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : 'Unknown Time';
    const popularity = recipe.veryPopular ? "Very Popular" : "Not Popular";
    
    recipeCard.classList.add('card');

    // Store all cuisines in a data attribute
    const cuisines = recipe.cuisines && recipe.cuisines.length > 0 ? recipe.cuisines.map(c => c.toLowerCase()).join(",") : "";
    recipeCard.setAttribute("data-cuisines", cuisines);

    // Assign classes for filtering
    if (recipe.vegetarian) {    
        recipeCard.classList.add('vegetarian');
    }
    if (recipe.veryPopular) {
        recipeCard.classList.add('very-popular');
    }
    if (recipe.readyInMinutes) {
        recipeCard.classList.add('time');
    }

    if (recipe.cheap) {
        recipeCard.classList.add('cheap');
    }

    if (recipe.veryHealthy) {
        recipeCard.classList.add('healthy-food');
    }
    
    recipeCard.innerHTML = `
        <img src="${recipe.image || 'default-image.jpg'}" alt="${recipe.title}" />
        <h2>${recipe.title || 'Unknown Title'}</h2>
        <p><strong>Cuisine:</strong> ${cuisines || 'Unknown'}</p>
        <p class="details">
            <span class="bold">Time: </span>${time}
        </p>
        <p class="details">
            <span class="bold">Popularity: </span>${popularity}
        </p>
        <p class="details">
            <span class="bold">This dish is: </span>${recipe.cheap ? "Cheap" : "Not cheap"}
        </p>
        <p class="details">
            <span class="bold">Price: </span>${recipe.pricePerServing}kr
        </p>
        <p class="details">
            <span class="bold">This dish is: </span>${recipe.veryHealthy ? "Healthy" : "Not very healthy"}
        </p>
        <hr />
        <div class="ingredients">
            <p class="details bold">Ingredients</p>
            <ul>
                ${recipe.extendedIngredients?.map(ingredient => `<li>${ingredient.name}</li>`).join('') || '<li>Unknown Ingredients</li>'}
            </ul>
        </div>
        
    `;


    container.appendChild(recipeCard);
};
console.log(recipes[Math.floor(Math.random() * recipes.length)]);

function addToFavorites(recipeTitle) {
    // Get existing favorites from local storage or initialize an empty array
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // Add the new recipe to the favorites array
    favorites.push(recipeTitle);

    // Save the updated favorites array to local storage
    localStorage.setItem('favorites', JSON.stringify(favorites));

    alert(`${recipeTitle} has been added to your favorites!`);
}
function sortTime() {
    document.getElementById("hightolowbtn").addEventListener("click", () => {
        // Create a copy of the recipes array and sort by time
        const sortedRecipes = [...recipes].sort((a, b) => (b.readyInMinutes || 0) - (a.readyInMinutes || 0));

        // Clear the container before appending sorted recipes
        const container = document.getElementById("container");
        container.innerHTML = "";

        // Append sorted recipes
        sortedRecipes.forEach(recipe => handleRecipeData(recipe));
    });
}

function sortPrice() {
    document.getElementById("sort-price-btn").addEventListener("click", () => {
        // Create a copy of the recipes array and sort by price from high to low
        const sortedRecipes = [...recipes].sort((a, b) => (b.pricePerServing || 0) - (a.pricePerServing || 0));

        // Clear the container before appending sorted recipes
        const container = document.getElementById("container");
        container.innerHTML = "";

        // Append sorted recipes
        sortedRecipes.forEach(recipe => handleRecipeData(recipe));
    });
}function randomize() {
    document.getElementById("random-btn").addEventListener("click", () => {
        console.log("Fetching 4 new random recipes...");

        // Fetch new recipes from the API (DO NOT use cached ones)
        fetch(URL)
            .then(response => response.json())
            .then(data => {
                console.log("New random recipes:", data.recipes);
                
                recipes = data.recipes; // Update global variable
                localStorage.setItem("recipes", JSON.stringify(recipes)); // Cache the new recipes
                
                // Clear and display new recipes
                const container = document.getElementById("container");
                container.innerHTML = "";
                recipes.forEach(recipe => handleRecipeData(recipe));
            })
            .catch(error => console.error("Error fetching new recipes:", error));
    });
}

// Run when page loads
document.addEventListener("DOMContentLoaded", () => {
    fetchRecipes();  // Load initial recipes
    randomize();     // Ensure the button fetches new ones
    sortTime();
    sortPrice();
});
// Fetch recipes when page is loaded
// Call randomize to attach event listener
