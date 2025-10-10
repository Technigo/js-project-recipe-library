
const API_KEY = "9db39a66159f43d287c05363e2271c81"
const URL = `https://api.spoonacular.com/recipes/random?number=20&apiKey=${API_KEY}`
const URL2 = `https://api.spoonacular.com/recipes/complexSearch?number=20&sort=random&addRecipeInformation=true&apiKey=${API_KEY}`

// ---------------------------------------------------------- 
// |||||||||||||||| Show all recipes on page ||||||||||||||||
// ----------------------------------------------------------
const recipeSection = document.querySelector(".recipeSection")

const displayedRecipes = (recipes) => {
  recipeSection.innerHTML = ""

  if (recipes.length === 0) {
    recipeSection.innerHTML = `
      <div class="no-matches">
        <p>Oops no recipes found...<br> Try something else!</p>
      </div>
    `
    return
  }

  recipes.forEach(recipe => {
    recipeSection.innerHTML += `
      <article class="recipe">
      <div class="topImageContainer">
        <img class="topImage" src="${recipe.image}" alt="photo of food">
        <div class="recipeHeadingSection">
          <h2 class="recipeHeading">${recipe.title}</h2>
        </div>
      </div>
      <div class="generalInfo">
        <ul>
          <li class="cuisine"><span>Cuisine:</span> ${recipe.cuisines?.[0] || "No cuisine listed"}</li>
          <li class="readyIn"><span>Time:</span> ${recipe.readyInMinutes} min</li>
          <li class="readyIn"><span>Health score:</span> ${recipe.healthScore}</li>
        </ul>
      </div>
      <div class="ingredients">
        <h3>Ingredients</h3>
        <ul>
          ${recipe.extendedIngredients?.map(ingredient => `<li> ${ingredient.original} </li>`).join("") || "<li>No ingredients available</li>"}
        </ul>
      </div>
    </article>
    `
  })
}

// -------------------------------------------------------- 
// |||||||||||||||| Get recipes from API |||||||||||||||||
// --------------------------------------------------------

let recipes = []

const getRecipes = async () => {
  try {
    const response = await fetch(URL)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    recipes = data.recipes
    console.log("Recipes fetched from API", data.recipes)
    displayedRecipes(recipes)

    return true
  } catch (error) {
    console.error("Failing to fetch API:", error)
    return false
  }
}

// import backup data from separate file if API limit is reached
import { backupData } from './backupData.js'

const getLocalRecipes = async (backupData) => {
  const data = backupData
  recipes = data.recipes
  console.log("Showing locally stored recipes", data.recipes)
  displayedRecipes(recipes)
}

const apiOrLocal = async () => {
  const APIWorks = await getRecipes() //Tries to run function getRecipes first (from API)

  if (!APIWorks) {
    alert("The API credit limit has been reached... But don't worry, showing locally stored recipes instead.")
    getLocalRecipes(backupData)
  } // if getRecipes function does not work (api has reached a limit), run getLocalRecipes instead.
}

apiOrLocal()

// ---------------------------------------------------------------- 
// |||||||||||||||| Show filtered recipes on page |||||||||||||||||
// ----------------------------------------------------------------
const dietFilterDropdown = document.getElementById("dietFilterDropdown")

const selectedDiet = () => {
  const dietFilter = dietFilterDropdown.value.toLowerCase()

  if (dietFilter === "all") {
    displayedRecipes(recipes)
  } else {
    const chosenDiet = recipes.filter(recipe => recipe.diets?.map(diet => diet.toLowerCase()).includes(dietFilter)
    )
    displayedRecipes(chosenDiet)
  }
}

dietFilterDropdown.addEventListener("change", selectedDiet)

const dishFilterDropdown = document.getElementById("dishFilterDropdown")

const selectedDish = () => {
  const dishFilter = dishFilterDropdown.value.toLowerCase()

  if (dishFilter === "all") {
    displayedRecipes(recipes)
  } else {
    const chosenDish = recipes.filter(recipe => recipe.dishTypes?.map(dish => dish.toLowerCase()).includes(dishFilter))
    displayedRecipes(chosenDish)
  }
}

dishFilterDropdown.addEventListener("change", selectedDish)

// -------------------------------------------------------- 
// |||||||||||||||| sort recipes on page ||||||||||||||||||
// --------------------------------------------------------
const sortingButton = document.querySelectorAll(".sortButton")
const fastMeals = document.getElementById("fastMeals")
const popularMeals = document.getElementById("popularMeals")
const cookingTimeDropdown = document.getElementById("cookingTimeDropdown")
const healthScoreDropdown = document.getElementById("healthScoreDropdown")

const cookingTimeSorting = () => {
  const chosenCookingTime = cookingTimeDropdown.value
  if (chosenCookingTime === "fastMeals") {
    displayedRecipes([...recipes].sort((a, b) => a.readyInMinutes - b.readyInMinutes))
  } else if (chosenCookingTime === "slowMeals") {
    displayedRecipes([...recipes].sort((a, b) => b.readyInMinutes - a.readyInMinutes))
  } else {
    displayedRecipes(recipes)
  }

}

cookingTimeDropdown.addEventListener("change", cookingTimeSorting)

const healthScoreSorting = () => {
  const chosenHealthScore = healthScoreDropdown.value
  if (chosenHealthScore === "healthyMeals") {
    displayedRecipes([...recipes].sort((a, b) => a.healthScore - b.healthScore))
  } else if (chosenHealthScore === "unHealthyMeals") {
    displayedRecipes([...recipes].sort((a, b) => b.healthScore - a.healthScore))
  } else {
    displayedRecipes(recipes)
  }
}

healthScoreDropdown.addEventListener("change", healthScoreSorting)

// -------------------------------------------------------- 
// ||||||||||||||||| Get random recipe ||||||||||||||||||||
// --------------------------------------------------------
const randomButton = document.getElementById("randomButton")

const getRandomRecipe = () => {
  randomButton.classList.toggle("active")
  if (randomButton.classList.contains("active")) {
    const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)]
    displayedRecipes([randomRecipe])
    randomButton.value = "Back to all recipes"
  } else {
    displayedRecipes(recipes)
    randomButton.value = "Random recipe"
  }

}

randomButton.addEventListener("click", getRandomRecipe)

// -------------------------------------------------------- 
// ||||||||||||||||||||| Search bar |||||||||||||||||||||||
// --------------------------------------------------------
const searchInput = document.querySelector("[data-search]")

searchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase()

  const filteredRecipes = recipes.filter(recipe => {
    const titleMatch = recipe.title.toLowerCase().includes(value)

    return titleMatch
  })

  displayedRecipes(filteredRecipes)
})