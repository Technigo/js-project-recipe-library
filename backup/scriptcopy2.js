//* ----- Main Const  --- Manual Fold -----
const recipesPlaceholder = document.querySelector("#recipes-placeholder")
let recipesData = [] // Store fetched recipes globally

//

//* ----- Refactor recipe values  --- Manual Fold -----
const RefactorVegetarian = (recipe) => (recipe.vegetarian ? "Yes" : "No")
const RefactorVegan = (recipe) => (recipe.vegan ? "Yes" : "No")

//

//* ----- Render recipes  --- Manual Fold -----
const renderRecipes = (recipes) => {
  recipesPlaceholder.innerHTML = ""

  if (recipes.length === 0) {
    recipesPlaceholder.innerHTML = "<h2>There are no recipes available with these attributes.</h2>"
    return
  }

  recipes.forEach(recipe => {
    recipesPlaceholder.innerHTML += `
      <article class="recipe-card">
        <div class="food-img-bg">
          <img class="img-food-card" src="${recipe.image}" alt="${recipe.title}">
        </div>
        <div class="food-card-text">
          <h3 class="recipe-title">${recipe.title}</h3>
          <div class="recipe-info">
            <hr>
            <strong>cuisines:</strong> ${recipe.cuisines}<br>
            <strong>Ready in:</strong> ${recipe.readyInMinutes} minutes<br>
            <strong>Servings:</strong> ${recipe.servings}<br>
            <strong>Vegetarian:</strong> ${RefactorVegetarian(recipe)}<br>
            <strong>Vegan:</strong> ${RefactorVegan(recipe)}
          </div>
        </div>
      </article>`
    console.log(recipesData)
  })
}

//* ----- Fetch Api & Render recipes --- Manual Fold -----
const fetchApiData = () => {
  fetch(`https://api.spoonacular.com/recipes/random?number=10&apiKey=0d04fb7d468f486983bb9dd3fd16b3a0`)
    .then(response => response.json())
    .then(data => {
      // Filter out recipes with empty cuisines
      recipesData = data.recipes.filter(recipe => recipe.cuisines.length > 0)
      renderRecipes(recipesData)
    })
    .catch(error => console.error("Error fetching recipe data:", error))

}

fetchApiData()



//

//* ----- Sort on Time  --- Manual Fold -----
// Variables
const descendBtn = document.querySelector("#descend-btn")
const ascendBtn = document.querySelector("#ascend-btn")
const timeBtns = [ascendBtn, descendBtn]

const sortOnTimeDescend = (event) => {
  event.preventDefault()
  const sortedArray = recipesData.sort((a, b) => b.readyInMinutes - a.readyInMinutes)
  timeBtns.forEach(btn => btn.classList.remove("time-btn-active"))
  descendBtn.classList.add("time-btn-active")
  renderRecipes(sortedArray)
}

const sortOnTimeAscend = (event) => {
  event.preventDefault()
  const sortedArray = recipesData.sort((a, b) => a.readyInMinutes - b.readyInMinutes)
  timeBtns.forEach(btn => btn.classList.remove("time-btn-active"))
  ascendBtn.classList.add("time-btn-active")
  renderRecipes(sortedArray)
}

descendBtn.addEventListener("click", sortOnTimeDescend)
ascendBtn.addEventListener("click", sortOnTimeAscend)

//

//* ----- Sort on kitchen  --- Manual Fold -----
// Dom selectors
const mexicoBtn = document.querySelector("#mexico-btn")
const italyBtn = document.querySelector("#italy-btn")
const asiaBtn = document.querySelector("#asia-btn")
const mediterraneanBtn = document.querySelector("#mediterranean-btn")
const americanBtn = document.querySelector("#american-btn")
const europeBtn = document.querySelector("#europe-btn")
//! Special button for testing 
const emptyBtn = document.querySelector("#empthy-btn")

// Select all cuisine buttons
const cusineBtns = [mexicoBtn, italyBtn, asiaBtn, americanBtn, europeBtn, mediterraneanBtn]

// Filter on kitchen function
const filterOnKitchen = (event, cuisine, activeBtn) => {
  event.preventDefault()

  const filteredArray = recipesData.filter(recipe => recipe.cuisines.includes(cuisine))

  // Remove active class from all buttons
  cusineBtns.forEach(btn => btn.classList.remove("kitchen-btn-active"))

  // Toggle the active class only for the clicked button
  activeBtn.classList.add("kitchen-btn-active")

  renderRecipes(filteredArray)
}

// Event listeners for buttons
mexicoBtn.addEventListener("click", (event) => filterOnKitchen(event, "Mexican", mexicoBtn))
italyBtn.addEventListener("click", (event) => filterOnKitchen(event, "Italian", italyBtn))
asiaBtn.addEventListener("click", (event) => filterOnKitchen(event, "Asian", asiaBtn))
americanBtn.addEventListener("click", (event) => filterOnKitchen(event, "American", americanBtn))
europeBtn.addEventListener("click", (event) => filterOnKitchen(event, "European", europeBtn))
mediterraneanBtn.addEventListener("click", (event) => filterOnKitchen(event, "Mediterranean", mediterraneanBtn))
emptyBtn.addEventListener("click", (event) => filterOnKitchen(event, "empty", emptyBtn))

//

//* ----- Sort Random  --- Manual Fold -----

const randomBtn = document.querySelector("#random-btn")

const getRandomRecipe = (event) => {
  event.preventDefault()
  const randomIndex = Math.floor(Math.random() * recipesData.length)
  const randomRecipe = [recipesData[randomIndex]]
  renderRecipes(randomRecipe)
}

randomBtn.addEventListener("click", getRandomRecipe)

//

//* ----- Search for recipe --- Manual Fold -----

const searchInput = document.querySelector("#search")
const searchSubmit = document.querySelector("button[type='submit']")

const searchForRecipe = (event) => {
  event.preventDefault()

  const userInput = searchInput.value.toLowerCase()
  const filteredRecipes = recipesData.filter(recipe =>
    recipe.title.toLowerCase().includes(userInput)
  )

  if (filteredRecipes.length > 0) {
    renderRecipes(filteredRecipes) // Show matching recipes
  } else {
    recipesPlaceholder.innerHTML = "<h2>No recipes found.</h2>"
  }
}

searchSubmit.addEventListener("click", searchForRecipe)

//

// testing 

// const testContainer = document.querySelector("#testContainer") 