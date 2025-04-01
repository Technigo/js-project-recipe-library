const recipeCard = document.getElementById("container");
const filterDropdown = document.getElementById("filterDropdown");
const filterDropdownTime = document.getElementById("filterDropdownTime");
const loadingElement = document.getElementById("loading");

let recepiesList = []; // Store API data


const cachedKey = "cachedRecipes";
const cacheExpirationTIme = 1000 * 60 * 60; // 1 hour
// Fetch Data from Spoonacular API
const fetchRecipes = async () => {
    // Show loading indicator
    loadingElement.classList.remove("hidden"); await new Promise(resolve => setTimeout(resolve, 3000));
    const cachedData = localStorage.getItem(cachedKey);
    if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);

        // Check if cache is still valid
        if (Date.now() - timestamp < cacheExpirationTIme) {
            console.log("Using Cached Data:", data);
            recepiesList = data;
            renderRecepies();
            loadingElement.classList.add("hidden");
            return;
        } else {
            console.log("Cache Expired. Fetching New Data...");
        }
    }

    const URL = `https://api.spoonacular.com/recipes/complexSearch?number=20&cuisine=Asian,Italian,American&addRecipeInformation=true&apiKey=b7ce86ca197c48c491b8eadf53278878`;

    try {
        loadingElement.classList.remove("hidden"); 
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate loading time
        const response = await fetch(URL);
        if (!response.ok) {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            alert("API quota exceeded or an error occurred. Please try again later.");
            return; // Stop execution
        }

        const data = await response.json();

        console.log("API Response:", data); // Debugging
        if (!data.results || data.results.length === 0) {
            console.error("No recipes found!");
            return; // Stop execution if no recipes are found
        }

        recepiesList = data.results; // Use 'results' from complexSearch API
        localStorage.setItem(cachedKey, JSON.stringify({ data: recepiesList, timestamp: Date.now() }));
        console.log("Fetched Recipes:", recepiesList);
        renderRecepies(); // Render after fetching
    } catch (error) {
        console.error("Error fetching recipes:", error);
    } finally {
        // Hide loading indicator after fetch completes
        loadingElement.classList.add("hidden");
    }
};

const renderRecepies = (recipes = recepiesList) => {
    const selectedCountry = filterDropdown.value;
    const selectedTime = filterDropdownTime.value;

    recipeCard.innerHTML = ""; // Clear previous recipes

    let filteredRecipes = [...recipes]; // Clone the array safely

    // Filter by Time
    if (selectedTime !== "All") {
        filteredRecipes = filteredRecipes.filter(recipe => {
            const time = recipe.readyInMinutes || 0; // Ensure time exists
            return (selectedTime === "30" && time <= 30) ||
                (selectedTime === "60" && time > 30 && time <= 60) ||
                (selectedTime === "120" && time > 60);
        });
    }

    // Filter by Cuisine (Ensure cuisines exist)
    if (selectedCountry !== "All") {
        filteredRecipes = filteredRecipes.filter(recipe =>
            Array.isArray(recipe.cuisines) && recipe.cuisines.includes(selectedCountry)
        );
    }

    // Display Filtered Recipes
    if (filteredRecipes.length > 0) {
        filteredRecipes.forEach(recipe => {
            recipeCard.innerHTML += `
                <div class="recipe-card">
                    <img src="${recipe.image}" alt="${recipe.title}">
                    <h3>${recipe.title}</h3>
                    <p>Time: ${recipe.readyInMinutes || "Unknown"} minutes</p>
                    <p>Cuisines: ${recipe.cuisines ? recipe.cuisines.join(", ") : "Unknown"}</p>
                    <p>Diets: ${recipe.diets ? recipe.diets.join(", ") : "Unknown"}</p>
                    <p>Popularity: <strong>❤️ ${recipe.aggregateLikes || 0}</strong></p>
                </div>
            `;
        });
    } else {
        recipeCard.innerHTML = `<div class="recipe-card">
            <h3>No recipes found matching your filters.</h3>
        </div>`;
    }
};

// Fetch API Data and Set Up Filters
fetchRecipes().then(() => {
    filterDropdown.addEventListener("change", () => renderRecepies());
    filterDropdownTime.addEventListener("change", () => renderRecepies());
});

const sortAscButton = document.getElementById("sort-asc");
const sortDescButton = document.getElementById("sort-desc");
const sortTimeButton = document.getElementById("sort-time");

const sortReceipecs = (order) => {
    document.querySelectorAll(".sort-btn").forEach(btn => btn.classList.remove("active"));
    if (order === "time") {
        recepiesList.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
        sortTimeButton.classList.add("active");
    } if (order === "likes-asc") {
        recepiesList.sort((a, b) => Number(a.aggregateLikes || 0) - Number(b.aggregateLikes || 0));
        sortAscButton.classList.add("active");
    }
    else if (order === "likes-desc") {
        recepiesList.sort((a, b) => Number(b.aggregateLikes || 0) - Number(a.aggregateLikes || 0));
        sortDescButton.classList.add("active");
    }


    renderRecepies();
    updatePlaceholder(); // Update placeholder after sorting
};

sortAscButton.addEventListener("click", () => sortReceipecs("likes-asc"));
sortDescButton.addEventListener("click", () => sortReceipecs("likes-desc"));
sortTimeButton.addEventListener("click", () => sortReceipecs("time"));

const searchInput = document.getElementById("searchInput");

const searchRecepies = () => {
    const searchValue = searchInput.value.toLowerCase();
    const filteredRecepies = recepiesList.filter(recipe =>
        recipe.title && recipe.title.toLowerCase().includes(searchValue) // Check if `title` exists
    );
    console.log(filteredRecepies);
    renderRecepies(filteredRecepies);
};

searchInput.addEventListener("input", searchRecepies);

// Render Recipes Based on Selected Filters

const randomButton = document.getElementById("random-btn");
const randomReceipie = () => {
    const randomRecipe = Math.floor(Math.random() * recepiesList.length);
    console.log("Random Recipe:", recepiesList[randomRecipe]);
    renderRecepies([recepiesList[randomRecipe]]);
};
randomButton.addEventListener("click", randomReceipie);

function updatePlaceholder() {
    let selectedCountry = document.getElementById("filterDropdown").value;
    let selectedTime = document.getElementById("filterDropdownTime").value;
    let placeholder = document.getElementById("placeholder");

    let sortOrder = "";
    if (document.getElementById("sort-asc").classList.contains("active")) {
        sortOrder = "Ascending on Popularity";
    } else if (document.getElementById("sort-desc").classList.contains("active")) {
        sortOrder = "Descending on Popularity";
    } else if (document.getElementById("sort-time").classList.contains("active")) {
        sortOrder = "Sort by Time";
    }

    let placeholderText = "None";

    if (selectedCountry !== "All" || selectedTime !== "All" || sortOrder) {
        placeholderText = `Cuisine: ${selectedCountry}, Time: ${selectedTime}, Sort: ${sortOrder}`;
    }

    placeholder.innerHTML = placeholderText;
}

document.getElementById("filterDropdown").addEventListener("change", updatePlaceholder);
document.getElementById("filterDropdownTime").addEventListener("change", updatePlaceholder);

document.getElementById("clearFilters").addEventListener("click", () => {
    // Reset dropdowns
    document.getElementById("filterDropdown").value = "All";
    document.getElementById("filterDropdownTime").value = "All";

    // Trigger change event to update the displayed text
    document.getElementById("filterDropdown").dispatchEvent(new Event("change"));
    document.getElementById("filterDropdownTime").dispatchEvent(new Event("change"));

    // Clear placeholder
    document.getElementById("placeholder").innerHTML = "None";

    // Reset sorting (you might need to update the button styles too)
    document.querySelectorAll(".sort-btn").forEach(btn => btn.classList.remove("active"));

    // Reload all recipes (assuming fetchReceipes fetches all recipes)
    fetchRecipes();
});

updatePlaceholder();

