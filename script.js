const URL = "https://api.spoonacular.com/recipes/random?number=12&apiKey=11307b44ec204bb4aba527e2affcfab0"
const BASE_URL = "https://api.spoonacular.com/recipes/"

const recipesContainer = document.getElementById("recipe-container")

const sortButtons = document.querySelectorAll(".sort-btn")

let recipes = []  // Somewhere to store som recipes!

// Get some recipes from the API. Save them in an global varible. Load recipes to website
const fetchRecipeData = () => {
  fetch(URL)
    .then((response) => response.json())
    .then((data) => {
      recipes = data.recipes
      loadRecipies(recipes)  // 
    })
    .catch((error) => {
      recipesContainer.innerHTML = `<p>Limit for the day is reached. Come back tomorrow for more!</p>`
      console.log("Error fetching recipes:", error)
    })
}

fetchRecipeData()


const loadRecipies = (recipesArray) => {
  recipesContainer.innerHTML = ""
  recipesArray.forEach(recept => {
    const allIngredients = recept.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join("")
    recipesContainer.innerHTML += `
      <a href=${recept.sourceUrl}>
        <div class="card">
          <img src=${recept.image} alt="${recept.title}">
          <h2>${recept.title}</h2>
          <p>Cuisine: ${recept.cuisines.join(", ") || "Unknown"}</p>
          <p>Time: ${recept.readyInMinutes} minutes</p>
          <p>Servings: ${recept.servings}</p>
          <p>Diet: ${recept.diets.join(", ") || "None"}</p>
          <p>Ingredients:</p>
          <ul>${allIngredients}</ul>
          <p>Price per serving: $${recept.pricePerServing.toFixed(2)}</p>
        </div>
      </a>`
  })
}

const filtrateRecipes = (value) => {
  if (value.toLowerCase() === "all") {
    loadRecipies(recipes) // When the button for All is clicked it will load all the 12 recipes.
  } else {
    const filteredRecipes = recipes.filter(meal =>
      meal.cuisines && meal.cuisines.some(cuisine => cuisine.toLowerCase() === value.toLowerCase())
    )//Otherwise it will show recipes based on cuisine. meal.cuisines.some will check if some of the cuisines match the selected cuisine.

    if (filteredRecipes.length > 0) {
      loadRecipies(filteredRecipes) // 
    } else {
      recipesContainer.innerHTML = `<p>No recipes found. Try another filter.</p>` // If there is no recipes matching the filter the user gets a message.
    }
  }
}

// Show a random recipe of the ones that is fetched
const generateRandomRecipies = () => {
  const randomIndex = Math.floor(Math.random() * recipes.length)
  const randomRecipe = recipes[randomIndex]
  loadRecipies([randomRecipe])
}

// Create a copy of the array and then it will compare the time aginst each other.
const sortRecipesByTime = (order) => {
  const sortedRecipes = [...recipes].sort((a, b) => {
    return order === "ascending" ? a.readyInMinutes - b.readyInMinutes : b.readyInMinutes - a.readyInMinutes
  })
  loadRecipies(sortedRecipes)
}


// Depending on witch button is clicked the it will filter accordenly. To mark them selected it will first remove the selected and then add it de button that is selected.
document.querySelectorAll(".food-btn").forEach(button => {
  button.addEventListener("click", () => {
    console.log(`Button for ${button.dataset.cuisines} is clicked`)

    if (button.id === "random") {
      generateRandomRecipies()
    } else {
      filtrateRecipes(button.dataset.cuisines)
    }

    document.querySelectorAll(".food-btn").forEach(btn => btn.classList.remove("selectedButton"))
    button.classList.add("selectedButton")
  })
})


sortButtons.forEach(button => {
  button.addEventListener("click", () => {
    sortButtons.forEach(btn => btn.classList.remove("selectedButton"))
    button.classList.add("selectedButton")

    if (button.id === "ascending") {
      sortRecipesByTime("ascending")
    } else {
      sortRecipesByTime("descending")
    }
  })
})