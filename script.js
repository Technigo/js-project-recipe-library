const checkMix = [ //checkbox
  document.getElementById("vegan"),
  document.getElementById("vegetarian"),
  document.getElementById("gluten free"),
  document.getElementById("dairy free")
]
const costMix = [ //switched to checkbox to be able to sort based on time while unchecked, otherwise these takes presidence
  document.getElementById("low-cost"),
  document.getElementById("high-cost")
]
const timeMix = [ //radio
  document.getElementById("15-min"),
  document.getElementById("30-min"),
  document.getElementById("45-min"),
  document.getElementById("60-min")
]

const container = document.getElementById("recipeHolder")
const randomButton = document.getElementById("randomize")
const loader = document.getElementById("loader")
const spinner = document.getElementById("spinner")

let loadedRecipeCount = 8
const batchSize = 8
let apiLimitReached = false
let isFetching = false

const decimalToFraction = (decimal) => {
  if (decimal >= 1) {
    return decimal.toString();
  }

  const commonDenominators = [2, 3, 4, 5, 6, 8, 10, 12] // use only these denominators, creating more inaccurate, but smaller and actually usable fractions
  let bestFraction = { numerator: 1, denominator: 1, error: Infinity }

  for (let denom of commonDenominators) {
    let num = Math.round(decimal * denom)
    let error = Math.abs(decimal - num / denom)

    if (error < bestFraction.error) {
      bestFraction = { numerator: num, denominator: denom, error }
    }
  }

  return bestFraction.numerator === bestFraction.denominator
    ? '1'
    : `${bestFraction.numerator}/${bestFraction.denominator}`
}


//the recipe in html
const loadRecipes = (recipeObject) => {
  container.innerHTML = '' //resets the container before we load the recipes

  recipeObject.forEach(recipe => {

    container.innerHTML += `
    <a class="card-holder" href="${recipe.sourceUrl}" id="${recipe.id}">
        <picture>
          <img src="${recipe.image}">
        </picture>
        <figcaption>
          <h2>
            ${recipe.title}
          </h2>
        </figcaption>
        <article class="middle-text">
          <h3>
            Cost:
          </h3>
          <p>
          ${Math.floor(recipe.pricePerServing / 10)} $ 
          </p>
          <h3>
            Time:
          </h3>
          <p>
          ${recipe.readyInMinutes} Min
          </p>
        </article>
        <article class="end-text">
          <h3>
            Ingredients:
          </h3>
          <ul>
          ${recipe.nutrition.ingredients.map(ingredient => {
      const fraction = decimalToFraction(ingredient.amount);
      return `<li>${fraction} ${ingredient.unit} ${ingredient.name}</li>`
    }).join('')}
          </ul>
        </article>
    </a>`
  })// creates a list of ingredients, where the name is nested in layers of objects and arrays. math floor to get reasonable values
}

const costCheckboxes = document.querySelectorAll('input[name="cost"]') //changed from radio the checkbox, gathers all

costCheckboxes.forEach(checkbox => {
  checkbox.addEventListener("change", function () {
    if (this.checked) { //if the current document.queryselectorall with name cost is selected, uncheck all others
      costCheckboxes.forEach(cb => {
        if (cb !== this) cb.checked = false // Uncheck all others
      })
    }
    updateRecipes() // Update recipes immediately after change
  })
})

//redone updateRecipes using .filter, .map and ternary operator
const updateRecipes = () => {
  let storedRecipes = JSON.parse(localStorage.getItem("recipes")) || []

  let selectedDiets = checkMix
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.id)

  // Get selected cost filter (low or high), defaulting to null if none are selected
  let selectedCost = costMix.find(checkbox => checkbox.checked)?.value || null
  // Get selected time filter (convert to a number, defaulting to Infinity if none are selected)
  let selectedTime = Number(timeMix.find(radio => radio.checked)?.value) || Infinity

  let filteredRecipes = storedRecipes
    .filter(recipe => Array.isArray(recipe.diets) && recipe.diets.length > 0) // Exclude recipes without diets
    .filter(recipe =>
      selectedDiets.length === 0 || selectedDiets.every(diet => recipe.diets.map(d => d.toLowerCase()).includes(diet))
    )
    .filter(recipe => recipe.readyInMinutes <= selectedTime)

  if (selectedCost) {
    filteredRecipes.sort((a, b) =>
      selectedCost === "low" ? a.pricePerServing - b.pricePerServing :
        selectedCost === "high" ? b.pricePerServing - a.pricePerServing :
          a.readyInMinutes - b.readyInMinutes
    )
  }

  // If there are valid recipes after filtering, display them
  if (filteredRecipes.length) {
    loadRecipes(filteredRecipes) // Loads the recipes properly
  } else {
    container.innerHTML = `<a class="card-holder"><h2>No valid recipes</h2></a>`
  }
}

const fetchData = async () => {
  if (apiLimitReached) return // Stop fetching if API limit reached

  const apiKey = "320b154c621249e194a24f0ee7f4ec7b";
  const includedDiets = "vegan|vegetarian|gluten free|dairy free";
  const URLExtended = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&number=${loadedRecipeCount}&diet=${includedDiets}&maxReadyTime=200&addRecipeInformation=true&addRecipeNutrition=true&instructionsRequired=true`;

  try {
    loader.classList.add("display")
    spinner.classList.add("display-spinner")

    const response = await fetch(URLExtended)

    if (!response.ok) {
      const errorData = await response.json() // Parse error details
      if (response.status === 402 || (errorData.message && errorData.message.toLowerCase().includes("quota"))) {
        apiLimitReached = true // Set API limit flag
        if (!document.getElementById("limit-message")) {
          container.innerHTML += `<a class="card-holder" id="limit-message">API limit reached. Try again later.</a>`
        }
        loader.classList.remove("display")
        spinner.classList.remove("display-spinner")
        return
      }
      throw new Error(errorData.message || "Unknown API error")
    }

    const { results = [] } = await response.json()

    loader.classList.remove("display")
    spinner.classList.remove("display-spinner")

    let storedRecipes = JSON.parse(localStorage.getItem("recipes")) || []
    let uniqueRecipes = [...new Map([...storedRecipes, ...results].map(r => [r.id, r])).values()]
    //this one is a doosy. storedRecipes and results are combined and mapped by looping through recipe (r) and creating pairs, and new Map store unique recipe id's, which removes duplicate recipes. .values only takes out the recipe objects and the first ... converts the map back into a usable array. Damn, i need a lecture in spread operators

    localStorage.setItem("recipes", JSON.stringify(uniqueRecipes))
    loadedRecipeCount += batchSize

    updateRecipes()
  } catch (error) {
    console.error("Error fetching recipes:", error)
  }
}



const checkScroll = async () => {
  if (isFetching) return //prevent multiple api calls

  let storedRecipes = JSON.parse(localStorage.getItem("recipes")) || [] //call upon localStorage

  let selectedTime = timeMix.find(radio => radio.checked).value

  // Check if any filters or sorting options are selected
  const isFiltered =
    checkMix.some(checkbox => checkbox.checked) || // Diet filters
    costMix.some(checkbox => checkbox.checked) || // Cost sorting
    (selectedTime && selectedTime !== "200") // Only block if time is selected & not "60-min"


  // Check if we've loaded all recipes from localStorage
  const displayedRecipes = container.querySelectorAll(".card-holder").length // Count how many are currently displayed

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) { //only trigger when at the bottom of browser screen - 200px

    if (isFiltered) {
      if (!document.getElementById("sorting-enabled")) {
        container.innerHTML += `
        <a class="card-holder" id="sorting-enabled">
          <h2>No new recipes loaded do to sorting being selected</h2>
        </a>
      `
      }
      return // Don't fetch more recipes if filters are active
    }

    if (displayedRecipes < storedRecipes.length) { //only fetch more if we haven't loaded all available
      loadRecipes(storedRecipes.slice(displayedRecipes, displayedRecipes + batchSize)) //load more recipes
    }
    else if (!apiLimitReached) {
      isFetching = true
      fetchData()
      isFetching = false
    }
  }
}


const initialLoad = async () => {
  const storedRecipes = JSON.parse(localStorage.getItem("recipes")) || []

  if (storedRecipes.length === 0) {
    await fetchData() //fetch new recipes if none are stored
  }
  else {
    loadRecipes(storedRecipes)
  }
}


window.addEventListener("scroll", checkScroll)
document.addEventListener("DOMContentLoaded", initialLoad)
//event listeners that active on page load, or scroll, to fetch recipes, as well a fetching or loading recipes

// Listen for changes on checkboxes
checkMix.forEach(checkbox => {
  checkbox.addEventListener("change", () => {
    let storedRecipes = JSON.parse(localStorage.getItem("recipes")) || []
    updateRecipes(storedRecipes)
  })
})

// Listen for changes on radio buttons
costMix.forEach(checkbox => {
  checkbox.addEventListener("change", () => {
    let storedRecipes = JSON.parse(localStorage.getItem("recipes")) || []
    updateRecipes(storedRecipes)
  })
})

timeMix.forEach(radio => {
  radio.addEventListener("change", () => {
    let storedRecipes = JSON.parse(localStorage.getItem("recipes")) || []
    updateRecipes(storedRecipes)
  })
})

randomButton.addEventListener("click", () => {
  let storedRecipes = JSON.parse(localStorage.getItem("recipes")) || []

  const randomIndex = Math.floor(Math.random() * storedRecipes.length) //randomize function for all recipes
  const randomRecipe = [storedRecipes[randomIndex]]
  loadRecipes(randomRecipe)
})