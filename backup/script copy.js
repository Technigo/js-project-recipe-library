//* ----- Create recipe cars  --- Manual Fold -----
const recipesPlaceholder = document.querySelector("#recipes-placeholder")

const renderRecipes = (recipeArray) => {
  recipesPlaceholder.innerHTML = ""

  if (recipeArray.length === 0) {
    emptySelect()
    return
  }

  recipeArray.forEach(recipe => {

    const recipeCard = document.createElement("article")
    recipeCard.classList.add("recipe-card")

    const foodImgBg = document.createElement("div")
    foodImgBg.classList.add("food-img-bg")

    const imgFoodCard = document.createElement('img')
    imgFoodCard.classList.add("img-food-card")
    imgFoodCard.src = recipe.image
    imgFoodCard.alt = recipe.title

    const foodCardText = document.createElement("div")
    foodCardText.classList.add("food-card-text")

    const recipeTitle = document.createElement("h3")
    recipeTitle.classList.add('recipe-title')
    recipeTitle.textContent = recipe.title

    const recipeInfo = document.createElement('div')
    recipeInfo.classList.add('recipe-info')
    recipeInfo.innerHTML = `
      <hr>
      <strong>Ready in:</strong> ${recipe.readyInMinutes} minutes<br>
      <strong>Servings:</strong> ${recipe.servings}<br>
      <strong>Cuisine:</strong> ${recipe.cuisine}<br>
      <strong>Price per serving:</strong> ${recipe.pricePerServing}<br>
      <strong>Diets: </strong> ${recipe.diets}
    `

    foodImgBg.appendChild(imgFoodCard)
    foodCardText.appendChild(recipeTitle)
    foodCardText.appendChild(recipeInfo)
    recipeCard.appendChild(foodImgBg)
    recipeCard.appendChild(foodCardText)
    recipesPlaceholder.appendChild(recipeCard)
  })
}

renderRecipes(recipes)

//* ----- Sort on kitchen  --- Manual Fold -----
// todo: Need to add button highlght
// todo: to add add deselect on extra click
// Dom selectors
const mexicoBtn = document.querySelector("#mexico-btn")
const italyBtn = document.querySelector("#italy-btn")
const asiaBtn = document.querySelector("#asia-btn")
const mediterraneanBtn = document.querySelector("#mediterranean-btn")
//! Special button for testing 
const emptyBtn = document.querySelector("#empthy-btn")

// Select all cuisine buttons
const cusineBtns = [mexicoBtn, italyBtn, asiaBtn, mediterraneanBtn]

// Filter on kitchen function
const filterOnKitchen = (event, cuisine, activeBtn) => {
  const filteredArray = recipes.filter(recipe => recipe.cuisine === cuisine)

  // Remove active class from all buttons
  cusineBtns.forEach(btn => {
    btn.classList.remove("kitchen-btn-active")
  })

  // Toggle the active class only for the clicked button
  if (!activeBtn.classList.contains("kitchen-btn-active")) {
    activeBtn.classList.add("kitchen-btn-active")
  }

  event.preventDefault()
  renderRecipes(filteredArray)
}

// Event listeners for buttons
mexicoBtn.addEventListener("click", (event) => filterOnKitchen(event, "Mexican", mexicoBtn))
italyBtn.addEventListener("click", (event) => filterOnKitchen(event, "Italian", italyBtn))
asiaBtn.addEventListener("click", (event) => filterOnKitchen(event, "Asian", asiaBtn))
mediterraneanBtn.addEventListener("click", (event) => filterOnKitchen(event, "Mediterranean", mediterraneanBtn))
emptyBtn.addEventListener("click", (event) => filterOnKitchen(event, "empty", emptyBtn))

//* ----- Sort on Time  --- Manual Fold -----
// Variables
const decendBtn = document.querySelector("#decend-btn")
const acendBtn = document.querySelector("#acend-btn")
const timeBtns = [acendBtn, decendBtn]

// Sort descending (highest time first)
const sortOnTimeDecend = (event) => {
  event.preventDefault()

  const sortedArray = recipes.slice().sort((a, b) => b.readyInMinutes - a.readyInMinutes)

  // Remove active class from all buttons
  timeBtns.forEach(btn => btn.classList.remove("time-btn-active"))

  // Add active class to clicked button
  decendBtn.classList.add("time-btn-active")

  renderRecipes(sortedArray)
}

// Sort ascending (lowest time first)
const sortOnTimeAcend = (event) => {
  event.preventDefault()

  const sortedArray = recipes.slice().sort((a, b) => a.readyInMinutes - b.readyInMinutes)

  // Remove active class from all buttons
  timeBtns.forEach(btn => btn.classList.remove("time-btn-active"))

  // Add active class to clicked button
  acendBtn.classList.add("time-btn-active")

  renderRecipes(sortedArray)
}

// Event listeners
decendBtn.addEventListener("click", sortOnTimeDecend)
acendBtn.addEventListener("click", sortOnTimeAcend)

//* ----- Sort Random  --- Manual Fold -----
// todo: Need to add button highlght
// todo: to add add deselect on extra click
const randomBtn = document.querySelector("#random-btn")

const getRandomRecipe = (event) => {
  event.preventDefault()
  const randomIndex = Math.floor(Math.random() * recipes.length)
  const randomRecipe = [recipes[randomIndex]]
  renderRecipes(randomRecipe)
}

randomBtn.addEventListener("click", getRandomRecipe)

//* ----- Empty Selection  --- Manual Fold -----
const emptySelect = () => {
  recipesPlaceholder.innerHTML = `
  <h3>There are no recipes available with these attributes.</h3>`
}

