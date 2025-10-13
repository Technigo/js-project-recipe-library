// import backUpData
import { backUpData } from "./backUpData.js"
console.log("backUpData loaded", backUpData)


// Pickups
const buttonsFilter = document.querySelectorAll('.btn-filter')
const buttonsSort = document.querySelectorAll('.btn-sort')
const randomBtn = document.querySelector('.btn-random')
const container = document.getElementById('container')


// API
const API_KEY = "a226b7d82dd04ae1a8a13201ec0d461a"
const API_KEY2 = "37839bb1eaae459a8ce3b8aed9115737"
const URL = `https://api.spoonacular.com/recipes/complexSearch?number=30&apiKey=${API_KEY}&addRecipeInformation=true&cuisines=italian,asian,mediterranean,mexican,european&fillIngredients=true`


// Lets
let allRecipes = []
let currentFilter = []
let currentSort = ""


// Fetch API
const fetchData = async () => {
  try {
    const res = await fetch(URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()
    allRecipes = json.results ?? []

    if (allRecipes.length === 0) {
      container.innerHTML = `<p>The API has reached it's limit. Try again later!</p>`
      console.warn('API returned empty, using backup data.')
      allRecipes = backUpData
    }
  } catch (e) {
    console.error('Fetch failed, using backup data.', e)
    allRecipes = backUpData
  } finally {
    updateUI()
  }
}


// Recipe box
const showRecipes = (recipes) => {
  container.innerHTML = ''

  if (!Array.isArray(recipes) || recipes.length === 0) {
    container.innerHTML = `<p>The filter you chose doesn't match a recipe.</p>`
    return
  }
  recipes.forEach(recipe => {
    container.innerHTML += `
    <div class="card">
    <img src="${recipe.image}"/>
    <h2>${recipe.title}</h2>
    <hr class="solid">
    <li><b>Cuisine: </b>${recipe.cuisines}</li>
    <li><b>Time: </b>${recipe.readyInMinutes}</li>
    <hr class="solid">
    <details>
    <summary><b>Ingredients</b></summary>
    <li><br>${recipe.extendedIngredients.map(ingredients => ingredients.name).join("<br>")}</li>
    </div>`
  })
}


// Filter & Sort
const updateUI = () => {
  let visible = [...allRecipes]

  // ---filter---
  if (currentFilter.length > 0) {
    visible = visible.filter(r =>
      r.cuisines.some(c => currentFilter.includes(c.toLowerCase()))
    )
  }

  // ---sort---
  if (currentSort === 'Ascending') {
    visible.sort((a, b) => a.readyInMinutes - b.readyInMinutes)
  } else if (currentSort === 'Descending') {
    visible.sort((a, b) => b.readyInMinutes - a.readyInMinutes)
  }

  showRecipes(visible)
}


// Eventlisteners
// ---Filter---
buttonsFilter.forEach(button => {
  button.addEventListener("click", () => {
    const filterText = button.innerText.toLowerCase()
    if (filterText === "all") {
      currentFilter = []
    } else {
      currentFilter = [filterText]
    }
    buttonsFilter.forEach(btn => btn.classList.remove("active"))
    button.classList.add("active")
    updateUI()
  })
})


// ---Sort---
buttonsSort.forEach(button => {
  button.addEventListener("click", () => {
    currentSort = button.innerText
    buttonsSort.forEach(btn => btn.classList.remove("active"))
    button.classList.add("active")
    updateUI()
  })
})


// Random Button
randomBtn.addEventListener('click', () => {
  if (allRecipes.length === 0) return
  const idx = Math.floor(Math.random() * allRecipes.length)
  showRecipes([allRecipes[idx]])
})

fetchData()