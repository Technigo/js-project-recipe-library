// ====== DOM SELECTORS ======
const btnAll = document.getElementById("btnAll")
const btnBreakfast = document.getElementById("btnBreakfast")
const btnLunch = document.getElementById("btnLunch")
const btnFika = document.getElementById("btnFika")
const btnDinner = document.getElementById("btnDinner")
const btnAscending = document.getElementById("btnAscending")
const btnDescending = document.getElementById("btnDescending")
const mealBtns = document.querySelectorAll(".meal-btn")
const timeBtns = document.querySelectorAll(".time-btn")
const randomBtn = document.getElementById("btnRandom")
const recipeContainer = document.getElementById("recipeContainer")
const noResultsContainer = document.getElementById("noResultsContainer")
const loading = document.getElementById("loading")
const searchInput = document.getElementById("searchBar")
const searchBtn = document.getElementById("searchBtn")

// ====== API SETTINGS ======
const URL = `https://api.spoonacular.com/recipes/random?number=15&apiKey=4d3e2b2a43464de48c4a0aac3abf2c52`

// ====== GLOBAL STATE ======
let recipeInfo = []
let activeFilters = {
  mealType: "All",
  sortOrder: null
}

// ====== DISPLAY FUNCTIONS ======
const showRecipes = (recipesToShow) => {
  recipeContainer.innerHTML = ``

  recipesToShow.forEach(recipe => {
    recipeContainer.innerHTML += `
      <div class="recipe-card">
        <img src="${recipe.image}" alt="${recipe.title}">
        <h3>${recipe.title}</h3>
        <hr>
        <h4>
          <span class="label">Meal:</span>
          <span class="value">${recipe.dishTypes?.join(", ") || "N/A"}</span><br>
          <span class="mealLabel">Cooking time:</span>
          <span class="value">${recipe.readyInMinutes} min</span>
        </h4>
        <hr>
        <h4>Ingredients</h4>
        <p>${recipe.extendedIngredients
        ? recipe.extendedIngredients.map(ing => `${ing.name}`).join("<br>")
        : "No ingredients listed"
      }</p>
      </div>`
  })
}

// ====== FILTERING & SORTING ======
const filterAndSorting = () => {
  let filtered = [...recipeInfo]

  // Filter by meal type
  if (activeFilters.mealType && activeFilters.mealType !== "All") {
    filtered = filtered.filter(recipe => recipe.dishTypes?.includes(activeFilters.mealType))
  }

  // Sort by time (ascending or descending)
  if (activeFilters.sortOrder === "asc") {
    filtered.sort((a, b) => a.readyInMinutes - b.readyInMinutes)
  } else if (activeFilters.sortOrder === "desc") {
    filtered.sort((a, b) => b.readyInMinutes - a.readyInMinutes)
  }

  // Display filtered results or show a message if none found
  if (filtered.length > 0) {
    noResultsContainer.innerHTML = ``
    showRecipes(filtered)
  } else {
    recipeContainer.innerHTML = ``
    noResultsContainer.innerHTML = `
      <div class="no-results-container">
        <h3>No recipes found for "${activeFilters.mealType}"</h3>
        <p>Try another filter</p>
      </div>`
  }
}

// ====== SEARCH ======
const searchRecipes = () => {
  const query = searchInput.value.trim().toLowerCase()
  if (!query) {
    filterAndSorting()
    return
  }

  let filtered = [...recipeInfo]

  if (activeFilters.mealType && activeFilters.mealType !== "All") {
    filtered = filtered.filter(recipe =>
      recipe.dishTypes?.includes(activeFilters.mealType)
    )
  }

  filtered = filtered.filter(recipe => {
    const titleMatch = recipe.title.toLowerCase().includes(query)
    const ingredientsMatch = recipe.extendedIngredients?.some(ing =>
      ing.name.toLowerCase().includes(query)
    )
    return titleMatch || ingredientsMatch
  })

  if (filtered.length > 0) {
    noResultsContainer.innerHTML = ``
    showRecipes(filtered)
  } else {
    recipeContainer.innerHTML = ``
    noResultsContainer.innerHTML = `
      <div class="no-results-container">
        <h3>No recipes found matching "${query}"</h3>
        <p>Try another search term or combination of filters.</p>
      </div>`
  }
}

// ====== RANDOM RECIPE FEATURE ======
const getRandomRecipe = () => {
  const randomIndex = Math.floor(Math.random() * recipeInfo.length)
  const randomRecipe = recipeInfo[randomIndex]
  showRecipes([randomRecipe])
}

// ====== DATA FETCHING (with caching + error handling) ======
const fetchData = async (URL) => {
  loading.style.display = "block"
  recipeContainer.innerHTML = ``
  noResultsContainer.innerHTML = ``

  try {
    const cachedData = localStorage.getItem("cachedRecipes")
    const cacheTime = localStorage.getItem("cacheTime")

    const now = Date.now()
    const sixHours = 6 * 60 * 60 * 1000 // cache duration

    // Use cache if still valid
    if (cachedData && cacheTime && now - cacheTime < sixHours) {
      recipeInfo = JSON.parse(cachedData)
      loading.style.display = "none"
      filterAndSorting()
    } else {
      // Otherwise, fetch new data
      const response = await fetch(URL)

      // Handle API quota errors
      if (!response.ok) {
        if (response.status === 402 || response.status === 429) {
          loading.style.display = "none"
          recipeContainer.innerHTML = ``
          noResultsContainer.innerHTML = `
            <div class="no-results-container">
              <h3>Daily API quota reached</h3>
              <p>Spoonacular limits the number of requests per day.
              Please try again later or use cached results if available.</p>
            </div>`
          return
        } else {
          throw new Error(`HTTP error ${response ? response.status : "unknown"}`)
        }
      }

      const data = await response.json()
      recipeInfo = data.recipes

      // Save to cache
      localStorage.setItem("cachedRecipes", JSON.stringify(recipeInfo))
      localStorage.setItem("cacheTime", Date.now())

      loading.style.display = "none"
      filterAndSorting()
    }
  } catch (err) {
    loading.style.display = "none"
    noResultsContainer.innerHTML = `
      <div class="no-results-container">
        <h3>Something went wrong</h3>
        <p>${err.message || "Unable to load recipes right now. Please try again later."}</p>
      </div>`
  }
}

// ====== EVENT LISTENERS ======
btnAll.addEventListener("click", () => { activeFilters.mealType = "All"; filterAndSorting() })
btnBreakfast.addEventListener("click", () => { activeFilters.mealType = "breakfast"; filterAndSorting() })
btnLunch.addEventListener("click", () => { activeFilters.mealType = "lunch"; filterAndSorting() })
btnFika.addEventListener("click", () => { activeFilters.mealType = "fika"; filterAndSorting() })
btnDinner.addEventListener("click", () => { activeFilters.mealType = "dinner"; filterAndSorting() })
btnAscending.addEventListener("click", () => { activeFilters.sortOrder = "asc"; filterAndSorting() })
btnDescending.addEventListener("click", () => { activeFilters.sortOrder = "desc"; filterAndSorting() })
randomBtn.addEventListener("click", getRandomRecipe)
searchBtn.addEventListener("click", searchRecipes)
searchInput.addEventListener("keypress", (e) => { if (e.key === "Enter") searchRecipes() })

// ====== INITIAL FETCH ======
fetchData(URL)

// ====== BUTTON STATE TOGGLE ======
mealBtns.forEach(clickedButton => {
  clickedButton.addEventListener("click", () => {
    mealBtns.forEach(currentButton => currentButton.classList.remove("active"))
    clickedButton.classList.add("active")
  })
})

timeBtns.forEach(clickedButton => {
  clickedButton.addEventListener("click", () => {
    timeBtns.forEach(currentButton => currentButton.classList.remove("active"))
    clickedButton.classList.add("active")
  })
})