//#region --- Main Const ----- 
const recipesPlaceholder = document.querySelector("#recipes-placeholder") //Placeholder for content
let recipesData = [] // Store fetched recipes globally
let filteredRecipes = [] // Stores the currently filtered recipes

//#endregion

//#region --- Refactor recipe -----
const refactorVegetarian = (recipe) => (recipe.vegetarian ? "Yes" : "No")
const refactorVegan = (recipe) => (recipe.vegan ? "Yes" : "No")
const refactorPricePerServing = (recipe) => parseFloat((recipe.pricePerServing / 6).toFixed(0))

//#endregion

//#region --- Clear inner HTML -----
const clearContent = () => {
  recipesPlaceholder.innerHTML = ""
}

//#endregion 

//#region --- Render recipes  -----
const renderRecipes = (recipes) => {

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
            <strong>Vegetarian:</strong> ${refactorVegetarian(recipe)}<br>
            <strong>Vegan:</strong> ${refactorVegan(recipe)}<br>
            <strong>Price per serving:</strong> ${refactorPricePerServing(recipe)}<br>
          </div>
        </div>
      </article>`
  })
}

//#endregion

//#region --- Fetch Api -----
const baseUrl = "https://api.spoonacular.com/recipes/random?number=30"
const apiKey = "5ae255282a9f4e2aaf47dbc4e205c58b"
const CACHE_KEY = "cachedRecipes"
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000 // Cache expires in 24 hours

const fetchApiData = () => {
  const cachedData = localStorage.getItem(CACHE_KEY)
  const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`)

  if (cachedData && cachedTimestamp && (Date.now() - cachedTimestamp < CACHE_EXPIRATION)) {
    console.log("Using cached data")
    recipesData = JSON.parse(cachedData)
    renderRecipes(recipesData)
  } else {
    console.log("Fetching new data from API...")
    fetch(`${baseUrl}&apiKey=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        recipesData = data.recipes || backupRecipes().recipes
        recipesData = recipesData.filter(recipe => recipe.cuisines.length > 0 && recipe.image && recipe.title)

        // Save to localStorage
        localStorage.setItem(CACHE_KEY, JSON.stringify(recipesData))
        localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now())

        renderRecipes(recipesData)
      })
      .catch(error => {
        console.error("Error fetching recipe data:", error)
        recipesPlaceholder.innerHTML = "<h2>We are out of free recipes, please try again tomorrow!</h2>"
      })
  }
}

fetchApiData()
clearContent()

//#endregion

//#region --- Sort on Time -----
const descendBtn = document.querySelector("#descend-btn")
const ascendBtn = document.querySelector("#ascend-btn")
const timeBtns = [ascendBtn, descendBtn]

const sortOnTimeDescend = (event) => {
  event.preventDefault()
  const arrayToSort = filteredRecipes.length > 0 ? filteredRecipes : recipesData
  const sortedArray = [...arrayToSort].sort((a, b) => b.readyInMinutes - a.readyInMinutes)

  timeBtns.forEach(btn => btn.classList.remove("time-btn-active"))
  descendBtn.classList.add("time-btn-active")

  clearContent()
  renderRecipes(sortedArray)
}

const sortOnTimeAscend = (event) => {
  event.preventDefault()
  const arrayToSort = filteredRecipes.length > 0 ? filteredRecipes : recipesData
  const sortedArray = [...arrayToSort].sort((a, b) => a.readyInMinutes - b.readyInMinutes)

  timeBtns.forEach(btn => btn.classList.remove("time-btn-active"))
  ascendBtn.classList.add("time-btn-active")

  clearContent()
  renderRecipes(sortedArray)
}

descendBtn.addEventListener("click", sortOnTimeDescend)
ascendBtn.addEventListener("click", sortOnTimeAscend)

//#endregion

//#region --- Sort on kitchen -----
const mexicoBtn = document.querySelector("#mexico-btn")
const italyBtn = document.querySelector("#italy-btn")
const asiaBtn = document.querySelector("#asia-btn")
const mediterraneanBtn = document.querySelector("#mediterranean-btn")
const americanBtn = document.querySelector("#american-btn")
const europeBtn = document.querySelector("#europe-btn")
const cusineBtns = [mexicoBtn, italyBtn, asiaBtn, americanBtn, europeBtn, mediterraneanBtn]

const filterOnKitchen = (event, cuisine, activeBtn) => {
  event.preventDefault()
  filteredRecipes = recipesData.filter(recipe => recipe.cuisines.includes(cuisine))
  cusineBtns.forEach(btn => btn.classList.remove("kitchen-btn-active"))
  activeBtn.classList.add("kitchen-btn-active")
  selectAllBtn.classList.remove("kitchen-btn-active")

  clearContent()
  renderRecipes(filteredRecipes)
}

mexicoBtn.addEventListener("click", (event) => filterOnKitchen(event, "Mexican", mexicoBtn))
italyBtn.addEventListener("click", (event) => filterOnKitchen(event, "Italian", italyBtn))
asiaBtn.addEventListener("click", (event) => filterOnKitchen(event, "Asian", asiaBtn))
americanBtn.addEventListener("click", (event) => filterOnKitchen(event, "American", americanBtn))
europeBtn.addEventListener("click", (event) => filterOnKitchen(event, "European", europeBtn))
mediterraneanBtn.addEventListener("click", (event) => filterOnKitchen(event, "Mediterranean", mediterraneanBtn))

//#endregion

//#region --- Sort Random -----
const randomBtn = document.querySelector("#random-btn")

const getRandomRecipe = (event) => {
  event.preventDefault()
  const randomIndex = Math.floor(Math.random() * recipesData.length)
  const randomRecipe = [recipesData[randomIndex]]
  clearContent()
  renderRecipes(randomRecipe)
}

randomBtn.addEventListener("click", getRandomRecipe)

//#endregion

//#region --- Select all btn ----

const selectAllBtn = document.querySelector("#select-all-btn")

const selectAllRecepies = (event) => {
  event.preventDefault()
  renderRecipes(recipesData)
  cusineBtns.forEach(btn => btn.classList.remove("kitchen-btn-active"))
  selectAllBtn.classList.add("kitchen-btn-active")
}

selectAllBtn.addEventListener("click", selectAllRecepies)

//#endregion 

//#region --- Search for recipe -----
const searchInput = document.querySelector("#search")
const searchSubmit = document.querySelector("button[type='submit']")

const searchForRecipe = (event) => {
  event.preventDefault()

  const userInput = searchInput.value.toLowerCase()
  const filteredRecipes = recipesData.filter(recipe =>
    recipe.title.toLowerCase().includes(userInput)
  )

  if (filteredRecipes.length > 0) {
    clearContent()
    renderRecipes(filteredRecipes)
  } else {
    recipesPlaceholder.innerHTML = "<h2>No recipes found.</h2>"
  }
}

searchSubmit.addEventListener("click", searchForRecipe)

//#endregion

//#region --- Filter: Price per servning -----
const priceSlider = document.querySelector("#price-slider")
const priceOutput = document.querySelector("#price-output")

priceOutput.textContent = `${priceSlider.value} sek`

const filterByPrice = () => {
  priceOutput.textContent = `${priceSlider.value} sek`
  const maxPrice = Number(priceSlider.value)
  filteredRecipes = recipesData.filter(recipe => refactorPricePerServing(recipe) <= maxPrice)

  clearContent()
  renderRecipes(filteredRecipes)
}

priceSlider.addEventListener("input", filterByPrice)

//#endregion

//#region --- Update recipes on scroll -----

const loadMoreRecipesOnScroll = () => {
  if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
    fetchApiData()
  }
}

window.addEventListener('scroll', loadMoreRecipesOnScroll)

//#endregion


window.addEventListener("load", () => {
  clearContent(); // Clear previous content
  renderRecipes(recipesData); // Show all recipes
});