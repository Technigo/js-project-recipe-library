// This is where I store recipes globally
let allRecipes = []
let filteredRecipes = []

// Fetch from API
const fetchRecipes = () => {

  const URL = 'https://api.spoonacular.com/recipes/random?number=24&apiKey=427f448f971e4dcea73ae654c0850b2a'

  const loadingMessage = document.querySelector('#loadingMessage')
  const errorMessage = document.getElementById('errorMessage')

  // Show loading message while fetching
  loadingMessage.style.display = 'block'

  errorMessage.innerHTML = ''

  fetch(URL)
    .then(response => response.json())
    .then(data => {
      // If API limit is reached, show error message
      if (data.code === 402) {
        errorMessage.innerHTML = `
          <h2>Uh oh! You've reached the daily limit of recipe requests. ✨</h2>
          <p>Here are some saved recipes for you, but come back tomorrow if you want to get more!</p>`
        throw new Error("You've reached the daily limit of recipe requests.")
      }

      allRecipes = data.recipes
      filteredRecipes = [...allRecipes]

      // Save the recipes in local storage
      localStorage.setItem('recipes', JSON.stringify(allRecipes))

      displayRecipes(filteredRecipes)
    })
    .catch((error) => {
      console.error(error.message)

      // If API runs out, try loading from local storage
      const cachedRecipes = localStorage.getItem('recipes')
      if (cachedRecipes) {
        allRecipes = JSON.parse(cachedRecipes)
        filteredRecipes = [...allRecipes]
        displayRecipes(filteredRecipes)
      } else {
        // Show error message when no cached recipes exist
        errorMessage.innerHTML = `
          <h2>Uh oh! There is a problem when loading recipes. Come back tomorrow. ✨</h2> 
          <p>${error.message}</p>`
      }
    })
    .finally(() => {
      // Hide loading message when request finish so its not showing all the time
      loadingMessage.style.display = 'none'
    })
}


//Display fetched recipes in my card container
const displayRecipes = (recipesToDisplay) => {
  const cardContainer = document.querySelector('#cards')
  cardContainer.innerHTML = ''

  recipesToDisplay.forEach(recipe => {

    let dietLabels = []

    //checks what diet the recipe is and adds it to the dietLabels array above
    if (recipe.vegan) dietLabels.push("Vegan")
    if (recipe.vegetarian) dietLabels.push("Vegetarian")
    if (recipe.glutenFree) dietLabels.push("Gluten Free")
    if (recipe.dairyFree) dietLabels.push("Dairy Free")

    cardContainer.innerHTML += `
      <article class="card">
      <div class="card-image">
        <img
          src="${recipe.image}"
          alt="Recipe image"
        />
      </div>
      <h2>${recipe.title}</h2>
      <hr>
      <div class="instructions">
        <h3 class="title">Diet:</h3>
        <p>${dietLabels.length > 0 ? dietLabels.join(", ") : "No specific diet"}</p>
      </div>
      <div class="instructions">
        <h3 class="title">Time:</h3>
        <p>${recipe.readyInMinutes} min</p>
      </div>
      <hr>
      <div class="ingredients">
        <h4 class="title">Ingredient list:</h4>
        <ul>
          ${recipe.extendedIngredients.map(ingredient =>
      `<li>${ingredient.original}</li>`).join("")}
        </ul>
      </div>
      <button class="button btn-random instructionsBtn">⬇️ Recipe instructions</button>
      <div class="instructionList" style="display: none;">
        <p>${recipe.instructions}</p>
      </div>
      <hr>
        <a
          href="${recipe.sourceUrl}"
          target="_blank"
          class="recipe-link"
        >🔗 View Full Recipe</a>
    </article>`
  })
}

// Function to filter recipes based on diet
const filterByDiet = (filterType) => {
  if (filterType === "all") {
    filteredRecipes = [...allRecipes]
  } else {
    filteredRecipes = allRecipes.filter(recipe => recipe[filterType] === true)
  }

  if (filteredRecipes.length === 0) {
    document.querySelector('#cards').innerHTML = `<p>❌ No ${filterType} recipes found. Why don't you pick another one?✨ </p>`
  } else {
    displayRecipes(filteredRecipes)
  }
}

// Function to sort recipes by readyInMinutes
const sortByReadyTime = (order) => {
  if (order === 'ascending') {
    filteredRecipes.sort((a, b) => a.readyInMinutes - b.readyInMinutes)
  } else {
    filteredRecipes.sort((a, b) => b.readyInMinutes - a.readyInMinutes)
  }

  displayRecipes(filteredRecipes)
}

//click button to show instructions for recipes
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('instructionsBtn')) {
    const instructionDiv = event.target.nextElementSibling

    if (instructionDiv && instructionDiv.classList.contains('instructionList')) {
      instructionDiv.style.display = instructionDiv.style.display === 'none' ? 'block' : 'none'
    }
  }
})

// Function to display a random recipe
const surpriseMe = () => {
  if (allRecipes.length > 0) {
    const randomRecipe = allRecipes[Math.floor(Math.random() * allRecipes.length)]
    displayRecipes([randomRecipe])
  }
}

// All event listeners
document.querySelectorAll('.btn-filter input').forEach(button => {
  button.addEventListener("change", (event) => {
    filterByDiet(event.target.value)
  })
})

document.querySelectorAll('.btn-sort input').forEach(button => {
  button.addEventListener("change", (event) => {
    sortByReadyTime(event.target.value)
  })
})

document.querySelector('#randomBtn').addEventListener("click", surpriseMe)

// Display recipes from the start
fetchRecipes()