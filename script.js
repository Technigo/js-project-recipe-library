//  ------ Elements  ------ //
const buttonGroups = document.querySelectorAll(".filter-and-buttons, .sorting-and-buttons, .random-button")
const recipeCard = document.getElementById('recipe-card')
const filterButtons = document.querySelectorAll(".filter-and-buttons button")
const sortButtons = document.querySelectorAll(".sorting-and-buttons button")
const randomButton = document.querySelector(".random-button button")
const preferenceOptions = document.querySelectorAll("#dropdownMenu div")

//  ------ API key & URL  ------ //
const apiKey = '0cc881e89fc0422eac77c85260da365d'
const URL = `https://api.spoonacular.com/recipes/random?number=10&apiKey=${apiKey}`

//  ------ Global variables  ------ //
let allMeals = []
let currentPreference = ""


//  ------ Buttons  ------ //
buttonGroups.forEach(group => {
  group.addEventListener("click", e => {
    if (e.target.tagName !== "BUTTON") return // to avoid accidental clicks
    group.querySelectorAll("button").forEach(b => b.classList.remove("selected"))
    e.target.classList.add("selected")
  })
})


//  ------ Data from localStorage as backup if API fails ------ //
function loadFromLocalStorage() {
  const storedRecipes = localStorage.getItem("recipes")
  if (storedRecipes) {
    allMeals = JSON.parse(storedRecipes)

    const filtered = filterByPreference(allMeals)
    renderMeals(filtered)
    return true
  }
  return false
}


// ----Fetch data from Spoonacular API + local storage + error messages--- // 

const fetchData = () => {
  //message when loading recipes
  recipeCard.innerHTML = '<p class="loading">Loading recipes...</p>'

  return fetch(URL)
    .then(response => {
      if (response.status === 402) {
        //error message if api-limit reached
        throw new Error("API limit reached 😑")
      }

      return response.json()
    })

    .then(data => {
      allMeals = data.recipes

      // saves recipes to localStorage for backup
      localStorage.setItem("recipes", JSON.stringify(allMeals))

      // filter preferences 
      const filtered = filterByPreference(allMeals)
      renderMeals(filtered)
    })
    // error control + messages
    .catch(error => {


      if (error.message === "API limit reached 😑") {
        // backup, loading from local storage
        if (!loadFromLocalStorage()) {
          recipeCard.innerHTML = '<p class="error">API quota reached and no saved recipes found.. Please try again tomorrow 🫡</p>'
        }
      } else {
        // something else went wrong 
        recipeCard.innerHTML = '<p class="error"> Something went wrong, please try again 🫣</p>'
      }
    })
}

// ------ Filter recipes on diet/ preference ------//
function filterByPreference(meals) {
  if (!currentPreference || currentPreference === "all") return meals

  return meals.filter(meal =>
    meal.diets && meal.diets.includes(currentPreference)
  )
}


//  ------ Recipe cards  ------ //
function renderMeals(meals) {
  recipeCard.innerHTML = ""

  if (meals.length === 0) { //no matching recipes - message 
    recipeCard.innerHTML = '<p class="error">No recipe match, sorry 🫣</p>'
    return
  }

  meals.forEach(meal => {
    const ingredients = meal.extendedIngredients
      ? meal.extendedIngredients.slice(0, 5).map(ing => ing.name)
      : []

    const cardHTML = `
      <div class="card">
        <img src="${meal.image}" alt="${meal.title}">
        <h3>${meal.title}</h3>
        <p><strong>Cuisine:</strong> ${meal.cuisines?.[0] || 'Unknown'}</p>
        <p><strong>Ready in:</strong> ${meal.readyInMinutes} min</p>
        <p><strong>Ingredients:</strong></p>
        <ul>
          ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
      </div>
    `
    recipeCard.insertAdjacentHTML('beforeend', cardHTML)
  })
}


//  ------ Filter by kitchen/cuisine  ------ //
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("selected"))
    button.classList.add("selected")

    const filter = button.textContent.trim()

    if (filter === "All") {
      const filtered = filterByPreference(allMeals)
      renderMeals(filtered)
    } else {
      const filteredByCuisine = allMeals.filter(meal =>
        meal.cuisines && meal.cuisines.includes(filter)
      )
      const finalFiltered = filterByPreference(filteredByCuisine)
      renderMeals(finalFiltered)
    }
  })
})


//  ------ Filter by cooking time ------ //
sortButtons.forEach(button => {
  button.addEventListener("click", () => {
    sortButtons.forEach(b => b.classList.remove("selected"))
    button.classList.add("selected")

    const sortType = button.textContent.trim().toLowerCase()

    if (sortType === "quick meals") {
      const quickMeals = allMeals.filter(meal => meal.readyInMinutes <= 20)
      const filtered = filterByPreference(quickMeals)
      renderMeals(filtered)
    } else if (sortType === "slow cook's") {
      const slowMeals = allMeals.filter(meal => meal.readyInMinutes > 20)
      const filtered = filterByPreference(slowMeals)
      renderMeals(filtered)
    } else {
      const filtered = filterByPreference(allMeals)
      renderMeals(filtered)
    }
  })
})


//  ------ Get random recipes  ------ //
randomButton.addEventListener("click", () => {
  if (allMeals.length === 0) {
    recipeCard.innerHTML = '<p class="error">No recipe match, sorry 🫣</p>'
    return
  }

  filterButtons.forEach(b => b.classList.remove("selected"))
  sortButtons.forEach(b => b.classList.remove("selected"))

  randomButton.classList.add("selected")

  const randomMeal = allMeals[Math.floor(Math.random() * allMeals.length)]
  renderMeals([randomMeal])
})


//  ------ Preference: dropdown toggle  ------ //
function toggleDropdown() {
  document.getElementById("dropdownMenu").classList.toggle("show")
}


//  ------ Preference: dropdown selection  ------ //
preferenceOptions.forEach(option => {
  option.addEventListener("click", () => {
    preferenceOptions.forEach(o => o.classList.remove("selected"))
    option.classList.add("selected")
    currentPreference = option.dataset.value.toLowerCase()
    const filtered = filterByPreference(allMeals)
    renderMeals(filtered)
  })
})


//  ------ To close dropdown if click anywhere on the page  ------ //
window.addEventListener('click', e => {
  if (!e.target.closest('.preferences')) {
    document.getElementById("dropdownMenu").classList.remove("show")
  }
})


//  ------ Initial page load  ------ //
window.onload = () => {
  fetchData()
}


