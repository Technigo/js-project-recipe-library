// DOM selectors
const cardsContainer = document.getElementById("cards-section")
const filterOptions = document.querySelectorAll(".filter-option")
const sortingOptions = document.querySelectorAll(".sorting-option")
const randomButton = document.getElementById("random-button")
const dropdowns = document.querySelectorAll('.dropdown')
const resetFiltersButton = document.getElementById('reset-filters-button')
const resetSortingButton = document.getElementById('reset-sorting-button')

// global variables
const BASE_URL = 'https://api.spoonacular.com/recipes/random'
const API_KEY = 'cff3c1af29a94a72bf19a8b99732e061'
const URL = `${BASE_URL}?apiKey=${API_KEY}&number=100`
let fetchedRecipes = []

// initial loading of site
const initalLoading = () => {
  // check if there are recipes in local storage
  const storedRecipes = localStorage.getItem('recipes')
  // if there are recipes in local storage - use them
  if (storedRecipes) {
    fetchedRecipes = JSON.parse(storedRecipes)
    showRecipes(fetchedRecipes)
  } else {
    // if local storage is empty - fetch data from api
    fetchData()
  }
}

// fetch data from api
const fetchData = async () => {
  try {
    // fetch data from api
    const response = await fetch(URL)
    if (!response.ok) {
      // if daily quota has been reached, error status will be 402 (payment required) - then show a message to the user
      if (response.status === 402) {
        cardsContainer.innerHTML =
          `
          <article class="card placeholder">
            <h2>Sorry, we have reached our daily quota of requests!</h2>
            <p>Please try again tomorrow.</p>
          </article>
        `
      }
      throw new Error(`Error! Status: ${response.status}`)
    }
    const data = await response.json()
    // filter out recipes that are missing required data
    const validRecipes = data.recipes.filter(recipe => {
      return recipe.title && recipe.image && recipe.imageType && recipe.diets.length > 0 && recipe.cuisines.length > 0 && recipe.readyInMinutes && recipe.spoonacularScore && recipe.instructions.startsWith('<ol>')
    })
    // save the valid recipes in the global variable
    fetchedRecipes = validRecipes
    // save the valid recipes in local storage
    console.log(fetchedRecipes)
    localStorage.setItem('recipes', JSON.stringify(fetchedRecipes))
    // show the fetched recipes
    showRecipes(fetchedRecipes)

  } catch (error) {
    console.error('error: ', error.message)
    // inner html to show error message to user
  }
}

// function to run when a filter/sorting option is changed 
const renderRecipes = () => {
  // check which filters/sorting are selected
  const selectedFilters = findSelectedFilters()
  const selectedSorting = findSelectedSorting()
  // filter recipes
  const filteredRecipes = applyFilters(selectedFilters)
  // sort recipes
  const sortedRecipes = sortRecipes(filteredRecipes, selectedSorting)
  // show recipes
  showRecipes(sortedRecipes)
}

// loop through the filter options to check which ones are selected
const findSelectedFilters = () => {
  // variable to save the selections
  let selectedFilters = {
    diets: [],
    cuisines: [],
    cookingTime: [],
    numberOfIngredients: []
  }
  // if checkbox is checked - add input.id to filtering object (input.name is the key)
  filterOptions.forEach(option => {
    (option.checked ? selectedFilters[option.name].push(option.id) : null)
  })
  return selectedFilters
}

// loop through sorting options to check which one is selected
const findSelectedSorting = () => {
  let selectedSorting = null
  // if radio is checked add id to sorting varaible
  sortingOptions.forEach(option => {
    (option.checked ? selectedSorting = option.id : null)
  })
  return selectedSorting
}

// apply selcted filters
const applyFilters = (selectedFilters) => {
  // if no filters are selected - filteredRecipes will be all recipes
  let filteredRecipes = fetchedRecipes
  // loop through the selected filtersArray
  for (const [key, value] of Object.entries(selectedFilters)) {
    // filters where option(s) has been selected have a value.length > 0
    if (value.length > 0) {
      // if several options have been selected - show recipes matching either of the options
      let matchingRecipes = []
      value.forEach(val => {
        // filter on the selected filter
        const recipesMatch = filterRecipes(fetchedRecipes, key, val)
        // if recipe is not already in matchingRecipes - add it
        recipesMatch.forEach(recipe => {
          if (!matchingRecipes.includes(recipe)) {
            matchingRecipes.push(recipe)
          }
        })
      })
      // only filter on the matching recipes array when checking next filter group
      filteredRecipes = matchingRecipes
    }
  }
  return filteredRecipes
}

// filter recipes
const filterRecipes = (recipeArray, filter, value) => {
  let filteredRecipes
  // different cases depending on the filter
  switch (filter) {
    case 'diets':
      // filter on diets - if recipe.value is true
      filteredRecipes = recipeArray.filter(recipe => recipe[value])
      break
    case 'cuisines':
      // filter on cuisine 
      // using .toLowerCase() and .replace(' ', '-') to change eg. 'Middle Eastern' to 'middle-eastern'
      filteredRecipes = recipeArray.filter(recipe => (recipe[filter].map(value => value.toLowerCase().replace(' ', '-')).includes(value)))
      break
    case 'cookingTime':
      // filter on cooking time
      switch (value) {
        case 'under-15-min':
          filteredRecipes = recipeArray.filter(recipe => (recipe.readyInMinutes < 15))
          break
        case '15-30-min':
          filteredRecipes = recipeArray.filter(recipe => (recipe.readyInMinutes >= 15 && recipe.readyInMinutes <= 30))
          break
        case '30-60-min':
          filteredRecipes = recipeArray.filter(recipe => (recipe.readyInMinutes >= 30 && recipe.readyInMinutes <= 60))
          break
        case 'over-60-min':
          filteredRecipes = recipeArray.filter(recipe => (recipe.readyInMinutes > 60))
          break
        default:
          break
      }
      break
    case 'numberOfIngredients':
      // filter on number of ingredients
      switch (value) {
        case 'under-5-ingredients':
          filteredRecipes = recipeArray.filter(recipe => (recipe.extendedIngredients.length < 5))
          break
        case '5-10-ingredients':
          filteredRecipes = recipeArray.filter(recipe => (recipe.extendedIngredients.length >= 5 && recipe.extendedIngredients.length <= 10))
          break
        case '11-15-ingredients':
          filteredRecipes = recipeArray.filter(recipe => (recipe.extendedIngredients.length >= 11 && recipe.extendedIngredients.length <= 15))
          break
        case 'over-15-ingredients':
          filteredRecipes = recipeArray.filter(recipe => (recipe.extendedIngredients.length > 15))
          break
        default:
          break
      }
      break
    default:
      break
  }
  return filteredRecipes
}

// sort recipes function
const sortRecipes = (recipesArray, sortingOption) => {
  let sortedRecipes
  // if a sorting option is selected - sort recipes array
  if (sortingOption) {
    const sortOn = sortingOption.split('-')[0]
    const sortingOrder = sortingOption.split('-')[1]
    // different cases for each sorting option
    switch (sortOn) {
      case 'time':
        switch (sortingOrder) {
          case 'ascending':
            sortedRecipes = recipesArray.sort((a, b) => (a.readyInMinutes - b.readyInMinutes))
            break
          case 'descending':
            sortedRecipes = recipesArray.sort((a, b) => (b.readyInMinutes - a.readyInMinutes))
            break
          default:
            break
        }
        break
      case 'popularity':
        switch (sortingOrder) {
          case 'ascending':
            sortedRecipes = recipesArray.sort((a, b) => (a.spoonacularScore - b.spoonacularScore))
            break
          case 'descending':
            sortedRecipes = recipesArray.sort((a, b) => (b.spoonacularScore - a.spoonacularScore))
            break
          default:
            break
        }
        break
      case 'price':
        switch (sortingOrder) {
          case 'ascending':
            sortedRecipes = recipesArray.sort((a, b) => (a.pricePerServing - b.pricePerServing))
            break
          case 'descending':
            sortedRecipes = recipesArray.sort((a, b) => (b.pricePerServing - a.pricePerServing))
            break
          default:
            break
        }
        break
      case 'ingredients':
        switch (sortingOrder) {
          case 'ascending':
            sortedRecipes = recipesArray.sort((a, b) => (a.extendedIngredients.length - b.extendedIngredients.length))
            break
          case 'descending':
            sortedRecipes = recipesArray.sort((a, b) => (b.extendedIngredients.length - a.extendedIngredients.length))
            break
          default:
            break
        }
        break
      default:
        break
    }
  } else {
    // if no sorting option is selected - sort array on recipe id
    sortedRecipes = recipesArray.sort((a, b) => (a.id - b.id))
  }
  return sortedRecipes
}

// pick a random recipe
const pickARandomRecipe = (recipesArray) => {
  let randomRecipe = []
  // if no recipes in array (e.g when daily quota has been reached) - do nothing
  if (recipesArray.length === 0) {
    return
  }
  // else pick a random recipe from the array
  else {
    randomRecipe = [recipesArray[Math.floor(Math.random() * recipesArray.length)]]
  }
  showRecipes(randomRecipe)
}

// show recipes - create a card and add recipe information
const showRecipes = (recipesArray) => {
  // clear cards container
  cardsContainer.innerHTML = ""
  // if no recipes matches the selected filters - recipesArray will be empty
  if (recipesArray.length === 0) {
    // display a message to the user
    cardsContainer.innerHTML +=
      `
    <article class="card placeholder">
      <h2>No recipes matching the selected filters</h2>
    </article>
    `
  } else {
    // display recipes in array
    cardsContainer.innerHTML += `<div class="results-count"><p>${recipesArray.length} recipes</p></div>`
    recipesArray.forEach(recipe => {
      cardsContainer.innerHTML +=
        `
        <article class="card">
          <a href="${recipe.sourceUrl}" target="_blank">
            <img src="${recipe.image}" alt="${recipe.title}">
            <h2>${recipe.title}</h2>
          </a>
          <hr>
          <div class="information">
            <span>
            <h3>Diets:</h3>
              <p>${recipe.diets.join(', ')}</p>
            </span>
            <span>
              <h3>Cuisines:</h3>
              <p>${recipe.cuisines.join(', ')}</p>
            </span>
            <span>
              <h3>Time:</h3>
              <p>${recipe.readyInMinutes} minutes</p>
            </span>
            <span>
              <h3>Price:</h3>
              <p>$${(recipe.pricePerServing / 100).toPrecision(2)} per serving</p>
            </span>
            <span>
              <h3>Popularity:</h3>
              <p>${Math.round(recipe.spoonacularScore)}</p>
            </span>
          </div>
          <hr>
          <div class="details-container">
            <div class="details-buttons-container">
              <button type="button" id="ingredientsBtn${recipe.id}" class="details-button active" onclick="toggleInstructions(${recipe.id})">
                Ingredients
              </button>
              <button type="button" id="instructionsBtn${recipe.id}" class="details-button" onclick="toggleInstructions(${recipe.id})">
                Instructions
              </button>
            </div>
            <div id="ingredients${recipe.id}" class="details active">
              <ul>${recipe.extendedIngredients.map((ingredient) => `<li>${ingredient.amount} ${ingredient.unit} ${ingredient.name}</li>`).join('')}</ul>
            </div>
            <div id="instructions${recipe.id}" class="details">
              ${recipe.instructions}
            </div>
          </div>
        </article>
      `
    })
  }
}

// function to toggle ingredients and instructions
const toggleInstructions = (recipeId) => {
  // local DOM elements
  const ingredientsBtn = document.getElementById(`ingredientsBtn${recipeId}`)
  const ingredients = document.getElementById(`ingredients${recipeId}`)
  const instructionsBtn = document.getElementById(`instructionsBtn${recipeId}`)
  const instructions = document.getElementById(`instructions${recipeId}`)
  // toggle classes to show/hide ingredients and instructions
  ingredientsBtn.classList.toggle('active')
  ingredients.classList.toggle('active')
  instructionsBtn.classList.toggle('active')
  instructions.classList.toggle('active')
}

// event listeners
// filter/sorting options is changed (checked/unchecked by user)
filterOptions.forEach(option => {
  option.addEventListener("change", () => renderRecipes())
})
sortingOptions.forEach(option => {
  option.addEventListener("change", () => renderRecipes())
})
// random recipe button is clicked
randomButton.addEventListener("click", () => {
  pickARandomRecipe(fetchedRecipes)
  filterOptions.forEach(option => {
    option.checked = false
  })
  sortingOptions.forEach(option => {
    option.checked = false
  })
})
// toggle dropdowns
dropdowns.forEach(dropdown => {
  dropdown.addEventListener('click', () => {
    // show/hide options
    dropdown.nextElementSibling.classList.toggle('expanded')
    // change dropdown-icon
    dropdown.nextElementSibling.classList.contains('expanded')
      ? dropdown.querySelector('.dropdown-icon').innerHTML = '&#9650'
      : dropdown.querySelector('.dropdown-icon').innerHTML = '&#9660'
  })
})
// reset filters buttons is clicked
resetFiltersButton.addEventListener('click', () => {
  filterOptions.forEach(option => {
    option.checked = false
  })
  renderRecipes()
})
// reset sorting buttons is clicked
resetSortingButton.addEventListener('click', () => {
  sortingOptions.forEach(option => {
    option.checked = false
  })
  renderRecipes()
})

// on page load
document.addEventListener("DOMContentLoaded", () => initalLoading())



// saved recipes from a fetch to play around with - REMOVE BEFORE FINAL SUBMISSION
const exampleRecipes = [
  {
    "id": 632021,
    "image": "https://img.spoonacular.com/recipes/632021-556x370.jpg",
    "imageType": "jpg",
    "title": "Ahi Tuna Ceviche",
    "readyInMinutes": 45,
    "servings": 3,
    "sourceUrl": "https://www.foodista.com/recipe/7FBJ3QLN/ahi-tuna-ceviche",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": true,
    "dairyFree": true,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 2,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 3,
    "healthScore": 17,
    "creditsText": "foodista.com",
    "license": null,
    "sourceName": "foodista.com",
    "pricePerServing": 228.84,
    "extendedIngredients": [
      {
        "id": 15117,
        "aisle": "Seafood",
        "image": "tuna-steak.png",
        "consistency": "SOLID",
        "name": "ahi tuna steak",
        "nameClean": "ahi tuna steak",
        "original": "1 ahi tuna steak (approx. less than a 1 lb.)",
        "originalName": "ahi tuna steak (approx. less than a 1 lb.)",
        "amount": 1,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 2064,
        "aisle": "Produce",
        "image": "mint.jpg",
        "consistency": "SOLID",
        "name": "mint",
        "nameClean": "mint",
        "original": "5 small leaves of fresh mint",
        "originalName": "fresh mint",
        "amount": 5,
        "unit": "small leaves",
        "meta": [
          "fresh"
        ],
        "measures": {
          "us": {
            "amount": 5,
            "unitShort": "small leaves",
            "unitLong": "small leaves"
          },
          "metric": {
            "amount": 5,
            "unitShort": "small leaves",
            "unitLong": "small leaves"
          }
        }
      },
      {
        "id": 10012023,
        "aisle": "Spices and Seasonings",
        "image": "black-sesame-seeds-or-chia-seeds.png",
        "consistency": "SOLID",
        "name": "juice of lime",
        "nameClean": "black sesame seeds",
        "original": "1/2 tablespoon rice vinegar (recommended: O Yuzu Rice Vinegar by O 1/2 of a Serrano pepper, very thinly sliced1 Juice of lime5 small leaves of fresh mintsprinkle of black sesame seeds (optional)",
        "originalName": "rice vinegar (recommended: O Yuzu Rice Vinegar by O 1/2 of a Serrano pepper, very thinly sliced1 Juice of lime5 small leaves of fresh mintsprinkle of black sesame seeds (optional)",
        "amount": 0.5,
        "unit": "",
        "meta": [
          "fresh",
          "black"
        ],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 9160,
        "aisle": "Produce",
        "image": "lime-juice.png",
        "consistency": "LIQUID",
        "name": "juice of lime",
        "nameClean": "lime juice",
        "original": "1 Juice of lime",
        "originalName": "Juice of lime",
        "amount": 1,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 11977,
        "aisle": "Produce",
        "image": "serrano-pepper.jpg",
        "consistency": "SOLID",
        "name": "serrano pepper",
        "nameClean": "serrano pepper",
        "original": "1/2 of a Serrano pepper, very thinly sliced",
        "originalName": "Serrano pepper, very thinly sliced",
        "amount": 0.5,
        "unit": "",
        "meta": [
          "very thinly sliced"
        ],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 4058,
        "aisle": "Ethnic Foods",
        "image": "sesame-oil.png",
        "consistency": "LIQUID",
        "name": "sesame oil",
        "nameClean": "sesame oil",
        "original": "1 tsp. sesame oil",
        "originalName": "sesame oil",
        "amount": 1,
        "unit": "tsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          }
        }
      },
      {
        "id": 11977,
        "aisle": "Produce",
        "image": "serrano-pepper.jpg",
        "consistency": "SOLID",
        "name": "in bowl mix soy sauce",
        "nameClean": "serrano pepper",
        "original": "1In medium bowl mix soy sauce, toasted sesame oil, rice vinegar, Serrano pepper, lime juice, mint, and sesame seeds. Then add diced tuna and toss to coat.",
        "originalName": "1In medium bowl mix soy sauce, toasted sesame oil, rice vinegar, Serrano pepper, lime juice, mint, and sesame seeds. Then add diced tuna and toss to coat",
        "amount": 3,
        "unit": "servings",
        "meta": [
          "diced",
          "toasted"
        ],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 3,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 16124,
        "aisle": "Condiments",
        "image": "soy-sauce.jpg",
        "consistency": "LIQUID",
        "name": "soy sauce",
        "nameClean": "soy sauce",
        "original": "5 tbsp. soy sauce",
        "originalName": "soy sauce",
        "amount": 5,
        "unit": "tbsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 5,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 5,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 11507,
        "aisle": "Produce",
        "image": "sweet-potato.png",
        "consistency": "SOLID",
        "name": "even roasted sweet potato",
        "nameClean": "sweet potato",
        "original": "3Serve immediately by mounding atop crackers, chips, micro-greens, or even roasted sweet potato slices.",
        "originalName": "3Serve immediately by mounding atop crackers, chips, micro-greens, or even roasted sweet potato",
        "amount": 1,
        "unit": "slices",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "slice",
            "unitLong": "slice"
          },
          "metric": {
            "amount": 1,
            "unitShort": "slice",
            "unitLong": "slice"
          }
        }
      }
    ],
    "summary": "If you want to add more <b>Latin American</b> recipes to your recipe box, Ahi Tuna Ceviche might be a recipe you should try. One serving contains <b>117 calories</b>, <b>16g of protein</b>, and <b>4g of fat</b>. For <b>$2.29 per serving</b>, you get a main course that serves 3. It is brought to you by Foodista. It is a good option if you're following a <b>gluten free, dairy free, and pescatarian</b> diet. Not a lot of people made this recipe, and 3 would say it hit the spot. A mixture of ahi tuna steak, sesame oil, serrano pepper, and a handful of other ingredients are all it takes to make this recipe so scrumptious. From preparation to the plate, this recipe takes roughly <b>45 minutes</b>. All things considered, we decided this recipe <b>deserves a spoonacular score of 63%</b>. This score is good. Similar recipes include <a href=\"https://spoonacular.com/recipes/margarita-ahi-tuna-ceviche-883481\">Margaritan Ahi Tuna Ceviche</a>, <a href=\"https://spoonacular.com/recipes/uncle-bills-ahi-ahi-tuna-85052\">Uncle Bill's Ahi Ahi Tuna</a>, and <a href=\"https://spoonacular.com/recipes/chili-crusted-ahi-tuna-avocado-salad-with-cilantro-garlic-dressing-gf-and-fave-five-friday-healthy-tuna-1259649\">Chili Crusted Ahi Tuna & Avocado Salad with Cilantro Garlic Dressing (GF!) … and Fave Five Friday: Healthy Tuna</a>.",
    "cuisines": [
      "South American",
      "Latin American"
    ],
    "dishTypes": [
      "lunch",
      "main course",
      "main dish",
      "dinner"
    ],
    "diets": [
      "gluten free",
      "dairy free",
      "pescatarian"
    ],
    "occasions": [],
    "instructions": "<ol><li>In medium bowl mix soy sauce, toasted sesame oil, rice vinegar, Serrano pepper, lime juice, mint, and sesame seeds. Then add diced tuna and toss to coat.</li><li>The tuna is ready to eat as soon as it's tossed and coated but you can marinate it for a few minutes if desired. The tuna will start to turn white almost immediately, a sign that it is cooking from the acidity of the lime juice. It is not necessary to cook the tuna. In fact, it is best served immediately while it is melt-in-your-mouth tender and moist.</li><li>Serve immediately by mounding atop crackers, chips, micro-greens, or even roasted sweet potato slices.</li></ol>",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "In medium bowl mix soy sauce, toasted sesame oil, rice vinegar, Serrano pepper, lime juice, mint, and sesame seeds. Then add diced tuna and toss to coat.The tuna is ready to eat as soon as it's tossed and coated but you can marinate it for a few minutes if desired. The tuna will start to turn white almost immediately, a sign that it is cooking from the acidity of the lime juice. It is not necessary to cook the tuna. In fact, it is best served immediately while it is melt-in-your-mouth tender and moist.",
            "ingredients": [
              {
                "id": 11977,
                "name": "serrano pepper",
                "localizedName": "serrano pepper",
                "image": "serrano-pepper.jpg"
              },
              {
                "id": 1022053,
                "name": "rice vinegar",
                "localizedName": "rice vinegar",
                "image": "rice-vinegar.png"
              },
              {
                "id": 12023,
                "name": "sesame seeds",
                "localizedName": "sesame seeds",
                "image": "sesame-seeds.png"
              },
              {
                "id": 9160,
                "name": "lime juice",
                "localizedName": "lime juice",
                "image": "lime-juice.png"
              },
              {
                "id": 4058,
                "name": "sesame oil",
                "localizedName": "sesame oil",
                "image": "sesame-oil.png"
              },
              {
                "id": 16124,
                "name": "soy sauce",
                "localizedName": "soy sauce",
                "image": "soy-sauce.jpg"
              },
              {
                "id": 2064,
                "name": "mint",
                "localizedName": "mint",
                "image": "mint.jpg"
              },
              {
                "id": 10015121,
                "name": "tuna",
                "localizedName": "tuna",
                "image": "canned-tuna.png"
              }
            ],
            "equipment": [
              {
                "id": 404783,
                "name": "bowl",
                "localizedName": "bowl",
                "image": "https://spoonacular.com/cdn/equipment_100x100/bowl.jpg"
              }
            ]
          },
          {
            "number": 2,
            "step": "Serve immediately by mounding atop crackers, chips, micro-greens, or even roasted sweet potato slices.",
            "ingredients": [
              {
                "id": 11507,
                "name": "sweet potato",
                "localizedName": "sweet potato",
                "image": "sweet-potato.png"
              },
              {
                "id": 18621,
                "name": "crackers",
                "localizedName": "crackers",
                "image": "crackers.jpg"
              },
              {
                "id": 21052,
                "name": "greens",
                "localizedName": "greens",
                "image": "mixed-greens-or-mesclun.jpg"
              },
              {
                "id": 11408,
                "name": "french fries",
                "localizedName": "french fries",
                "image": "french-fries-isolated.jpg"
              }
            ],
            "equipment": []
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 66.28046417236328,
    "spoonacularSourceUrl": "https://spoonacular.com/ahi-tuna-ceviche-632021"
  },
  {
    "id": 633668,
    "image": "https://img.spoonacular.com/recipes/633668-556x370.jpg",
    "imageType": "jpg",
    "title": "Baked Lemon~Lime Chicken Wings",
    "readyInMinutes": 45,
    "servings": 4,
    "sourceUrl": "https://www.foodista.com/recipe/YFLKPJ7V/baked-lemon-lime-chicken-wings",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": true,
    "dairyFree": true,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 26,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 5,
    "healthScore": 7,
    "creditsText": "Foodista.com – The Cooking Encyclopedia Everyone Can Edit",
    "license": "CC BY 3.0",
    "sourceName": "Foodista",
    "pricePerServing": 218.68,
    "extendedIngredients": [
      {
        "id": 5100,
        "aisle": "Meat",
        "image": "chicken-wings.png",
        "consistency": "SOLID",
        "name": "chicken wings",
        "nameClean": "chicken wings",
        "original": "3 lbs. chicken wings",
        "originalName": "chicken wings",
        "amount": 3,
        "unit": "lbs",
        "meta": [],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "lb",
            "unitLong": "pounds"
          },
          "metric": {
            "amount": 734.82,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 9152,
        "aisle": "Produce",
        "image": "lemon-juice.jpg",
        "consistency": "LIQUID",
        "name": "juice of lemon",
        "nameClean": "lemon juice",
        "original": "Juice of 1 lemon",
        "originalName": "Juice of lemon",
        "amount": 1,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 9160,
        "aisle": "Produce",
        "image": "lime-juice.png",
        "consistency": "LIQUID",
        "name": "juice of lime",
        "nameClean": "lime juice",
        "original": "Juice of 1 lime plus the zest",
        "originalName": "Juice of lime plus the zest",
        "amount": 1,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 11215,
        "aisle": "Produce",
        "image": "garlic.png",
        "consistency": "SOLID",
        "name": "garlic",
        "nameClean": "garlic",
        "original": "3 cloves of garlic – sliced",
        "originalName": "garlic – sliced",
        "amount": 3,
        "unit": "cloves",
        "meta": [
          "sliced"
        ],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "cloves",
            "unitLong": "cloves"
          },
          "metric": {
            "amount": 3,
            "unitShort": "cloves",
            "unitLong": "cloves"
          }
        }
      },
      {
        "id": 19296,
        "aisle": "Nut butters, Jams, and Honey",
        "image": "honey.png",
        "consistency": "LIQUID",
        "name": "honey",
        "nameClean": "honey",
        "original": "4 tablespoons of honey",
        "originalName": "honey",
        "amount": 4,
        "unit": "tablespoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 4,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 19335,
        "aisle": "Baking",
        "image": "sugar-in-bowl.png",
        "consistency": "SOLID",
        "name": "sugar",
        "nameClean": "sugar",
        "original": "½ cup of sugar",
        "originalName": "sugar",
        "amount": 0.5,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 100,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 14096,
        "aisle": "Alcoholic Beverages",
        "image": "red-wine.jpg",
        "consistency": "LIQUID",
        "name": "red wine",
        "nameClean": "red wine",
        "original": "½ cup of red wine",
        "originalName": "red wine",
        "amount": 0.5,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 120,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 6194,
        "aisle": "Canned and Jarred",
        "image": "chicken-broth.png",
        "consistency": "LIQUID",
        "name": "chicken broth",
        "nameClean": "chicken broth",
        "original": "1 cup of chicken broth",
        "originalName": "chicken broth",
        "amount": 1,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "cup",
            "unitLong": "cup"
          },
          "metric": {
            "amount": 235,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 4669,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "vegetable-oil.jpg",
        "consistency": "LIQUID",
        "name": "vegetable oil",
        "nameClean": "vegetable oil",
        "original": "¼ cup vegetable oil",
        "originalName": "vegetable oil",
        "amount": 0.25,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.25,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 54.5,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 10211297,
        "aisle": "Produce",
        "image": "parsley.jpg",
        "consistency": "SOLID",
        "name": "parsley",
        "nameClean": "fresh flat leaf parsley",
        "original": "Handful of fresh Italian parsley",
        "originalName": "fresh Italian parsley",
        "amount": 1,
        "unit": "Handful",
        "meta": [
          "fresh",
          "italian"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Handful",
            "unitLong": "Handful"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Handful",
            "unitLong": "Handful"
          }
        }
      },
      {
        "id": 11165,
        "aisle": "Produce",
        "image": "cilantro.png",
        "consistency": "SOLID",
        "name": "cilantro",
        "nameClean": "cilantro",
        "original": "Handful of fresh cilantro",
        "originalName": "fresh cilantro",
        "amount": 1,
        "unit": "Handful",
        "meta": [
          "fresh"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Handful",
            "unitLong": "Handful"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Handful",
            "unitLong": "Handful"
          }
        }
      },
      {
        "id": 2047,
        "aisle": "Spices and Seasonings",
        "image": "salt.jpg",
        "consistency": "SOLID",
        "name": "salt",
        "nameClean": "table salt",
        "original": "Dashes of salt",
        "originalName": "salt",
        "amount": 1,
        "unit": "Dashes",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Dashes",
            "unitLong": "Dashe"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Dashes",
            "unitLong": "Dashe"
          }
        }
      },
      {
        "id": 1002030,
        "aisle": "Spices and Seasonings",
        "image": "pepper.jpg",
        "consistency": "SOLID",
        "name": "ground pepper",
        "nameClean": "black pepper",
        "original": "Dashes of fresh ground black pepper",
        "originalName": "fresh ground black pepper",
        "amount": 1,
        "unit": "Dashes",
        "meta": [
          "fresh",
          "black"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Dashes",
            "unitLong": "Dashe"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Dashes",
            "unitLong": "Dashe"
          }
        }
      }
    ],
    "summary": "Baked Lemon~Lime Chicken Wings might be just the hor d'oeuvre you are searching for. This recipe serves 4. One serving contains <b>725 calories</b>, <b>34g of protein</b>, and <b>43g of fat</b>. For <b>$2.19 per serving</b>, this recipe <b>covers 17%</b> of your daily requirements of vitamins and minerals. 5 people were impressed by this recipe. Only a few people really liked this American dish. It is a good option if you're following a <b>gluten free and dairy free</b> diet. If you have cilantro, honey, ground pepper, and a few other ingredients on hand, you can make it. It is brought to you by Foodista. From preparation to the plate, this recipe takes about <b>45 minutes</b>. All things considered, we decided this recipe <b>deserves a spoonacular score of 39%</b>. This score is rather bad. If you like this recipe, you might also like recipes such as <a href=\"https://spoonacular.com/recipes/chile-lime-chicken-wings-baked-1124125\">Chile Lime Chicken Wings (Baked)</a>, <a href=\"https://spoonacular.com/recipes/tequila-lime-baked-chicken-wings-718888\">Tequila Lime Baked Chicken Wings</a>, and <a href=\"https://spoonacular.com/recipes/baked-honey-lime-chicken-wings-112348\">Baked Honey-Lime Chicken Wings</a>.",
    "cuisines": [
      "American"
    ],
    "dishTypes": [
      "antipasti",
      "lunch",
      "main course",
      "starter",
      "snack",
      "appetizer",
      "main dish",
      "antipasto",
      "hor d'oeuvre",
      "dinner"
    ],
    "diets": [
      "gluten free",
      "dairy free"
    ],
    "occasions": [],
    "instructions": "Combine all of the ingredients for the marinade. Add the chicken wings and place in the refrigerator for at least 1 hour or up to a few hours.\nPreheat Oven 350 degrees:\nPlace the chicken wings in a baking pan and spoon the marinade over the wings.\nPlace in the oven for 35-40 minutes until a beautiful golden color.",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Combine all of the ingredients for the marinade.",
            "ingredients": [
              {
                "id": 0,
                "name": "marinade",
                "localizedName": "marinade",
                "image": "seasoning.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 2,
            "step": "Add the chicken wings and place in the refrigerator for at least 1 hour or up to a few hours.",
            "ingredients": [
              {
                "id": 5100,
                "name": "chicken wings",
                "localizedName": "chicken wings",
                "image": "chicken-wings.png"
              }
            ],
            "equipment": [],
            "length": {
              "number": 60,
              "unit": "minutes"
            }
          }
        ]
      },
      {
        "name": "Preheat Oven 350 degrees",
        "steps": [
          {
            "number": 1,
            "step": "Place the chicken wings in a baking pan and spoon the marinade over the wings.",
            "ingredients": [
              {
                "id": 5100,
                "name": "chicken wings",
                "localizedName": "chicken wings",
                "image": "chicken-wings.png"
              },
              {
                "id": 0,
                "name": "marinade",
                "localizedName": "marinade",
                "image": "seasoning.png"
              }
            ],
            "equipment": [
              {
                "id": 404646,
                "name": "baking pan",
                "localizedName": "baking pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/roasting-pan.jpg"
              }
            ]
          },
          {
            "number": 2,
            "step": "Place in the oven for 35-40 minutes until a beautiful golden color.",
            "ingredients": [],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              }
            ],
            "length": {
              "number": 40,
              "unit": "minutes"
            }
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 50.630916595458984,
    "spoonacularSourceUrl": "https://spoonacular.com/baked-lemonlime-chicken-wings-633668"
  },
  {
    "id": 636962,
    "image": "https://img.spoonacular.com/recipes/636962-556x370.jpg",
    "imageType": "jpg",
    "title": "Caprese Quick Bread",
    "readyInMinutes": 45,
    "servings": 12,
    "sourceUrl": "https://www.foodista.com/recipe/W5MF623S/caprese-quick-bread",
    "vegetarian": true,
    "vegan": false,
    "glutenFree": false,
    "dairyFree": false,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 3,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 19,
    "healthScore": 1,
    "creditsText": "foodista.com",
    "license": null,
    "sourceName": "foodista.com",
    "pricePerServing": 43.26,
    "extendedIngredients": [
      {
        "id": 20081,
        "aisle": "Baking",
        "image": "flour.png",
        "consistency": "SOLID",
        "name": "flour",
        "nameClean": "wheat flour",
        "original": "¾ cups All-purpose Flour",
        "originalName": "All-purpose Flour",
        "amount": 0.75,
        "unit": "cups",
        "meta": [
          "all-purpose"
        ],
        "measures": {
          "us": {
            "amount": 0.75,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 93.75,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 93824,
        "aisle": "Baking",
        "image": "flour.png",
        "consistency": "SOLID",
        "name": "flour",
        "nameClean": "white whole wheat flour",
        "original": "¾ cups White Whole Wheat Flour",
        "originalName": "White Whole Wheat Flour",
        "amount": 0.75,
        "unit": "cups",
        "meta": [
          "whole wheat",
          "white"
        ],
        "measures": {
          "us": {
            "amount": 0.75,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 90,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 18369,
        "aisle": "Baking",
        "image": "white-powder.jpg",
        "consistency": "SOLID",
        "name": "baking powder",
        "nameClean": "baking powder",
        "original": "1 Tablespoon Baking Powder",
        "originalName": "Baking Powder",
        "amount": 1,
        "unit": "Tablespoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      },
      {
        "id": 2047,
        "aisle": "Spices and Seasonings",
        "image": "salt.jpg",
        "consistency": "SOLID",
        "name": "salt",
        "nameClean": "table salt",
        "original": "½ teaspoons Salt",
        "originalName": "Salt",
        "amount": 0.5,
        "unit": "teaspoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 2003,
        "aisle": "Spices and Seasonings",
        "image": "basil.jpg",
        "consistency": "SOLID",
        "name": "basil",
        "nameClean": "dried basil",
        "original": "1 Tablespoon Dried Basil",
        "originalName": "Dried Basil",
        "amount": 1,
        "unit": "Tablespoon",
        "meta": [
          "dried"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      },
      {
        "id": 1026,
        "aisle": "Cheese",
        "image": "mozzarella.png",
        "consistency": "SOLID",
        "name": "weight lite mozzarella cheese",
        "nameClean": "mozzarella",
        "original": "4 ounces, weight Lite Mozzarella Cheese, Shredded",
        "originalName": "weight Lite Mozzarella Cheese, Shredded",
        "amount": 4,
        "unit": "ounces",
        "meta": [
          "shredded"
        ],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 113.398,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 4053,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "olive-oil.jpg",
        "consistency": "LIQUID",
        "name": "olive oil",
        "nameClean": "olive oil",
        "original": "1 Tablespoon Olive Oil",
        "originalName": "Olive Oil",
        "amount": 1,
        "unit": "Tablespoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      },
      {
        "id": 1123,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "egg.png",
        "consistency": "SOLID",
        "name": "egg",
        "nameClean": "egg",
        "original": "1 whole Egg, Lightly Beaten",
        "originalName": "whole Egg, Lightly Beaten",
        "amount": 1,
        "unit": "",
        "meta": [
          "whole",
          "lightly beaten"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 1085,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "img.spoonacular.",
        "consistency": "LIQUID",
        "name": "non-fat milk",
        "nameClean": "fat free milk",
        "original": "1 cup Non-fat Milk",
        "originalName": "Non-fat Milk",
        "amount": 1,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "cup",
            "unitLong": "cup"
          },
          "metric": {
            "amount": 245,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 11955,
        "aisle": "Produce",
        "image": "sundried-tomatoes.jpg",
        "consistency": "SOLID",
        "name": "sundried tomatoes",
        "nameClean": "sun dried tomatoes",
        "original": "¼ cups Sundried Tomatoes, Diced, Not Oil Packed",
        "originalName": "Sundried Tomatoes, Diced, Not Oil Packed",
        "amount": 0.25,
        "unit": "cups",
        "meta": [
          "diced",
          "packed"
        ],
        "measures": {
          "us": {
            "amount": 0.25,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 27.5,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 1001,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "butter-sliced.jpg",
        "consistency": "SOLID",
        "name": "butter",
        "nameClean": "butter",
        "original": "¾ Tablespoons Butter, Melted",
        "originalName": "Butter, Melted",
        "amount": 0.75,
        "unit": "Tablespoons",
        "meta": [
          "melted"
        ],
        "measures": {
          "us": {
            "amount": 0.75,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 0.75,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      }
    ],
    "summary": "Forget going out to eat or ordering takeout every time you crave Mediterranean food. Try making Caprese Quick Bread at home. Watching your figure? This lacto ovo vegetarian recipe has <b>118 calories</b>, <b>5g of protein</b>, and <b>5g of fat</b> per serving. This recipe serves 12 and costs 43 cents per serving. 19 people have made this recipe and would make it again. A couple people really liked this breakfast. From preparation to the plate, this recipe takes about <b>45 minutes</b>. It is brought to you by Foodista. A mixture of flour, olive oil, weight lite mozzarella cheese, and a handful of other ingredients are all it takes to make this recipe so tasty. Taking all factors into account, this recipe <b>earns a spoonacular score of 26%</b>, which is rather bad. Try <a href=\"https://spoonacular.com/recipes/caprese-quick-bread-1411633\">Caprese Quick Bread</a>, <a href=\"https://spoonacular.com/recipes/quick-caprese-salad-551296\">Quick Caprese Salad</a>, and <a href=\"https://spoonacular.com/recipes/quick-and-easy-caprese-salad-657537\">Quick and Easy Caprese Salad</a> for similar recipes.",
    "cuisines": [
      "Mediterranean",
      "Italian",
      "European"
    ],
    "dishTypes": [
      "morning meal",
      "brunch",
      "breakfast"
    ],
    "diets": [
      "lacto ovo vegetarian"
    ],
    "occasions": [],
    "instructions": "Heat oven to 350. Spray a 9x5x3 loaf pan or two mini bread pans with cooking spray.\nStir together flours,cheese, baking powder, basil and salt in medium bowl. Add olive oil, egg and milk, stir till combined. Fold in sundried tomatoes.\nPour into pan, drizzle melted butter over top of bread. (Bread will be thick, flatten it out with your fingers)\nBake 30 minutes for mini loaf pans and 40  50 minutes for large loaf pan, or until golden brown and toothpick inserted in center comes out clean. Cool 5 minutes, remove from pan to wire rack. Cool 30 minutes before slicing, if you can control yourself!",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Heat oven to 35",
            "ingredients": [],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              }
            ]
          },
          {
            "number": 2,
            "step": "Spray a 9x5x3 loaf pan or two mini bread pans with cooking spray.",
            "ingredients": [
              {
                "id": 4679,
                "name": "cooking spray",
                "localizedName": "cooking spray",
                "image": "cooking-spray.png"
              },
              {
                "id": 18064,
                "name": "bread",
                "localizedName": "bread",
                "image": "white-bread.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404715,
                "name": "loaf pan",
                "localizedName": "loaf pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/loaf-pan.png"
              }
            ]
          },
          {
            "number": 3,
            "step": "Stir together flours,cheese, baking powder, basil and salt in medium bowl.",
            "ingredients": [
              {
                "id": 18369,
                "name": "baking powder",
                "localizedName": "baking powder",
                "image": "white-powder.jpg"
              },
              {
                "id": 1041009,
                "name": "cheese",
                "localizedName": "cheese",
                "image": "https://spoonacular.com/cdn/ingredients_100x100/cheddar-cheese.png"
              },
              {
                "id": 2044,
                "name": "basil",
                "localizedName": "basil",
                "image": "basil.jpg"
              },
              {
                "id": 2047,
                "name": "salt",
                "localizedName": "salt",
                "image": "salt.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404783,
                "name": "bowl",
                "localizedName": "bowl",
                "image": "https://spoonacular.com/cdn/equipment_100x100/bowl.jpg"
              }
            ]
          },
          {
            "number": 4,
            "step": "Add olive oil, egg and milk, stir till combined. Fold in sundried tomatoes.",
            "ingredients": [
              {
                "id": 11955,
                "name": "sun dried tomatoes",
                "localizedName": "sun dried tomatoes",
                "image": "sundried-tomatoes.jpg"
              },
              {
                "id": 4053,
                "name": "olive oil",
                "localizedName": "olive oil",
                "image": "olive-oil.jpg"
              },
              {
                "id": 1077,
                "name": "milk",
                "localizedName": "milk",
                "image": "milk.png"
              },
              {
                "id": 1123,
                "name": "egg",
                "localizedName": "egg",
                "image": "egg.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 5,
            "step": "Pour into pan, drizzle melted butter over top of bread. (Bread will be thick, flatten it out with your fingers)",
            "ingredients": [
              {
                "id": 1001,
                "name": "butter",
                "localizedName": "butter",
                "image": "butter-sliced.jpg"
              },
              {
                "id": 18064,
                "name": "bread",
                "localizedName": "bread",
                "image": "white-bread.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ]
          },
          {
            "number": 6,
            "step": "Bake 30 minutes for mini loaf pans and 40  50 minutes for large loaf pan, or until golden brown and toothpick inserted in center comes out clean. Cool 5 minutes, remove from pan to wire rack. Cool 30 minutes before slicing, if you can control yourself!",
            "ingredients": [],
            "equipment": [
              {
                "id": 404715,
                "name": "loaf pan",
                "localizedName": "loaf pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/loaf-pan.png"
              },
              {
                "id": 404644,
                "name": "toothpicks",
                "localizedName": "toothpicks",
                "image": "https://spoonacular.com/cdn/equipment_100x100/toothpicks.jpg"
              },
              {
                "id": 405900,
                "name": "wire rack",
                "localizedName": "wire rack",
                "image": "https://spoonacular.com/cdn/equipment_100x100/wire-rack.jpg"
              },
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              }
            ],
            "length": {
              "number": 115,
              "unit": "minutes"
            }
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 31.402481079101562,
    "spoonacularSourceUrl": "https://spoonacular.com/caprese-quick-bread-636962"
  },
  {
    "id": 636970,
    "image": "https://img.spoonacular.com/recipes/636970-556x370.jpg",
    "imageType": "jpg",
    "title": "Caramel Almond Berry Trifle",
    "readyInMinutes": 30,
    "servings": 10,
    "sourceUrl": "https://www.foodista.com/recipe/RXWYTJSZ/caramel-almond-berry-trifle-recipe",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": true,
    "dairyFree": false,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 8,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 3,
    "healthScore": 3,
    "creditsText": "Foodista.com – The Cooking Encyclopedia Everyone Can Edit",
    "license": "CC BY 3.0",
    "sourceName": "Foodista",
    "pricePerServing": 60.71,
    "extendedIngredients": [
      {
        "id": 1002050,
        "aisle": "Baking",
        "image": "extract.png",
        "consistency": "LIQUID",
        "name": "almond extract",
        "nameClean": "almond extract",
        "original": "1 teaspoon Almond extract",
        "originalName": "Almond extract",
        "amount": 1,
        "unit": "teaspoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          }
        }
      },
      {
        "id": 1009054,
        "aisle": "Produce",
        "image": "berries-mixed.jpg",
        "consistency": "SOLID",
        "name": "berries",
        "nameClean": "berries",
        "original": "Fresh Berries",
        "originalName": "Fresh Berries",
        "amount": 10,
        "unit": "servings",
        "meta": [
          "fresh"
        ],
        "measures": {
          "us": {
            "amount": 10,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 10,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 19364,
        "aisle": "Nut butters, Jams, and Honey",
        "image": "caramel-sauce.jpg",
        "consistency": "SOLID",
        "name": "mrs richardson's butterscotch caramel sauce",
        "nameClean": "caramel sauce",
        "original": "1/2 cup Mrs Richardson's Butterscotch Caramel sauce",
        "originalName": "Mrs Richardson's Butterscotch Caramel sauce",
        "amount": 0.5,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 113,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 19206,
        "aisle": "Baking",
        "image": "vanilla-pudding.png",
        "consistency": "SOLID",
        "name": "vanilla pudding",
        "nameClean": "instant vanilla pudding mix",
        "original": "1 large box instant vanilla pudding",
        "originalName": "box instant vanilla pudding",
        "amount": 1,
        "unit": "large",
        "meta": [
          "instant"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "large",
            "unitLong": "large"
          },
          "metric": {
            "amount": 1,
            "unitShort": "large",
            "unitLong": "large"
          }
        }
      },
      {
        "id": 1077,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "milk.png",
        "consistency": "LIQUID",
        "name": "milk",
        "nameClean": "milk",
        "original": "3 cups milk",
        "originalName": "milk",
        "amount": 3,
        "unit": "cups",
        "meta": [],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 732,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 1200,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "img.spoonacular.",
        "consistency": "SOLID",
        "name": "cool whip",
        "nameClean": "fat free whipped topping",
        "original": "1 tub Cool Whip",
        "originalName": "Cool Whip",
        "amount": 1,
        "unit": "tub",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tub",
            "unitLong": "tub"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tub",
            "unitLong": "tub"
          }
        }
      },
      {
        "id": 18133,
        "aisle": "Bakery/Bread",
        "image": "pound-cake.jpg",
        "consistency": "SOLID",
        "name": "pound cake",
        "nameClean": "pound cake",
        "original": "1 pound cake",
        "originalName": "pound cake",
        "amount": 1,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      }
    ],
    "summary": "Caramel Almond Berry Trifle might be a good recipe to expand your dessert recipe box. This recipe makes 10 servings with <b>191 calories</b>, <b>5g of protein</b>, and <b>4g of fat</b> each. For <b>61 cents per serving</b>, this recipe <b>covers 6%</b> of your daily requirements of vitamins and minerals. It is a <b>very reasonably priced</b> recipe for fans of European food. This recipe is liked by 3 foodies and cooks. Head to the store and pick up almond extract, milk, mrs richardson's butterscotch caramel sauce, and a few other things to make it today. It is a good option if you're following a <b>gluten free</b> diet. From preparation to the plate, this recipe takes roughly <b>30 minutes</b>. It is brought to you by Foodista. With a spoonacular <b>score of 33%</b>, this dish is not so amazing. Try <a href=\"https://spoonacular.com/recipes/almond-fresh-berry-trifle-130535\">Almond Fresh Berry Trifle</a>, <a href=\"https://spoonacular.com/recipes/berry-trifle-325345\">Berry Trifle</a>, and <a href=\"https://spoonacular.com/recipes/berry-trifle-59329\">Berry Trifle</a> for similar recipes.",
    "cuisines": [
      "English",
      "British",
      "Scottish",
      "European"
    ],
    "dishTypes": [
      "dessert"
    ],
    "diets": [
      "gluten free"
    ],
    "occasions": [],
    "instructions": "<ol><li>Mix large box of pudding and milk (according to directions)</li><li>Add one cap full of almond extract, mix well, and set aside to set.</li><li>After pudding has set, let's start the layers. First a thick layer of pudding, a layer of the pound cake, add berries, drizzle caramel sauce over berries, add Cool Whip layer, then repeat layers.</li><li>Top with additional berries and caramel.</li></ol>",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Mix large box of pudding and milk (according to directions)",
            "ingredients": [
              {
                "id": 1077,
                "name": "milk",
                "localizedName": "milk",
                "image": "milk.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 2,
            "step": "Add one cap full of almond extract, mix well, and set aside to set.After pudding has set, let's start the layers. First a thick layer of pudding, a layer of the pound cake, add berries, drizzle caramel sauce over berries, add Cool Whip layer, then repeat layers.Top with additional berries and caramel.",
            "ingredients": [
              {
                "id": 1002050,
                "name": "almond extract",
                "localizedName": "almond extract",
                "image": "extract.png"
              },
              {
                "id": 19364,
                "name": "caramel sauce",
                "localizedName": "caramel sauce",
                "image": "caramel-sauce.jpg"
              },
              {
                "id": 18133,
                "name": "pound cake",
                "localizedName": "pound cake",
                "image": "pound-cake.jpg"
              },
              {
                "id": 1009054,
                "name": "berries",
                "localizedName": "berries",
                "image": "https://spoonacular.com/cdn/ingredients_100x100/berries-mixed.jpg"
              },
              {
                "id": 19074,
                "name": "caramel",
                "localizedName": "caramel",
                "image": "soft-caramels.jpg"
              }
            ],
            "equipment": []
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 39.21820831298828,
    "spoonacularSourceUrl": "https://spoonacular.com/caramel-almond-berry-trifle-636970"
  },
  {
    "id": 638369,
    "image": "https://img.spoonacular.com/recipes/638369-556x370.jpg",
    "imageType": "jpg",
    "title": "Korean Sweet n Sour Chicken",
    "readyInMinutes": 30,
    "servings": 4,
    "sourceUrl": "https://www.foodista.com/recipe/6458DTC4/chicken-tangsuyuk-sweet-n-sour-chicken",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": false,
    "dairyFree": true,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 15,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 2,
    "healthScore": 35,
    "creditsText": "foodista.com",
    "license": null,
    "sourceName": "foodista.com",
    "pricePerServing": 271.36,
    "extendedIngredients": [
      {
        "id": 11124,
        "aisle": "Produce",
        "image": "sliced-carrot.png",
        "consistency": "SOLID",
        "name": "carrots",
        "nameClean": "carrot",
        "original": "•2 carrots, cut into thin pieces",
        "originalName": "carrots, cut into thin pieces",
        "amount": 2,
        "unit": "",
        "meta": [
          "cut into thin pieces"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 5062,
        "aisle": "Meat",
        "image": "chicken-breasts.png",
        "consistency": "SOLID",
        "name": "chicken breasts",
        "nameClean": "chicken breast",
        "original": "2 lbs boneless chicken breasts, cut into strips",
        "originalName": "boneless chicken breasts, cut into strips",
        "amount": 2,
        "unit": "lbs",
        "meta": [
          "boneless",
          "cut into strips"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "lb",
            "unitLong": "pounds"
          },
          "metric": {
            "amount": 907.185,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 2048,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "apple-cider-vinegar.jpg",
        "consistency": "LIQUID",
        "name": "cider vinegar",
        "nameClean": "apple cider vinegar",
        "original": "•3 tbsp cider vinegar",
        "originalName": "cider vinegar",
        "amount": 3,
        "unit": "tbsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 3,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 20027,
        "aisle": "Baking",
        "image": "white-powder.jpg",
        "consistency": "SOLID",
        "name": "corn starch",
        "nameClean": "corn starch",
        "original": "•2 tbsp corn starch (+ 2 tbsp water mixed together)",
        "originalName": "corn starch (+ 2 tbsp water mixed together)",
        "amount": 2,
        "unit": "tbsp",
        "meta": [
          "mixed"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 20027,
        "aisle": "Baking",
        "image": "white-powder.jpg",
        "consistency": "SOLID",
        "name": "cornstarch",
        "nameClean": "corn starch",
        "original": "•2 tbsp cornstarch",
        "originalName": "cornstarch",
        "amount": 2,
        "unit": "tbsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 99296,
        "aisle": "Health Foods",
        "image": "edamame.png",
        "consistency": "SOLID",
        "name": "edamame",
        "nameClean": "edamame",
        "original": "•1 cup edamame",
        "originalName": "edamame",
        "amount": 1,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "cup",
            "unitLong": "cup"
          },
          "metric": {
            "amount": 148,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 1123,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "egg.png",
        "consistency": "SOLID",
        "name": "egg",
        "nameClean": "egg",
        "original": "•1 beaten egg",
        "originalName": "beaten egg",
        "amount": 1,
        "unit": "",
        "meta": [
          "beaten"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 20081,
        "aisle": "Baking",
        "image": "flour.png",
        "consistency": "SOLID",
        "name": "flour",
        "nameClean": "wheat flour",
        "original": "•½ cup flour",
        "originalName": "flour",
        "amount": 0.5,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 62.5,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 11282,
        "aisle": "Produce",
        "image": "brown-onion.png",
        "consistency": "SOLID",
        "name": "onion",
        "nameClean": "onion",
        "original": "•1 medium size onion, cut into strips",
        "originalName": "onion, cut into strips",
        "amount": 1,
        "unit": "medium size",
        "meta": [
          "cut into strips"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "medium size",
            "unitLong": "medium size"
          },
          "metric": {
            "amount": 1,
            "unitShort": "medium size",
            "unitLong": "medium size"
          }
        }
      },
      {
        "id": 9273,
        "aisle": "Beverages",
        "image": "pineapple-juice.jpg",
        "consistency": "LIQUID",
        "name": "pineapple juice",
        "nameClean": "pineapple juice",
        "original": "•1/4 cup pineapple juice (optional if available)",
        "originalName": "pineapple juice (optional if available)",
        "amount": 0.25,
        "unit": "cup",
        "meta": [
          "(optional if available)"
        ],
        "measures": {
          "us": {
            "amount": 0.25,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 59,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 16124,
        "aisle": "Condiments",
        "image": "soy-sauce.jpg",
        "consistency": "LIQUID",
        "name": "soy sauce",
        "nameClean": "soy sauce",
        "original": "•2 tbsp soy sauce",
        "originalName": "soy sauce",
        "amount": 2,
        "unit": "tbsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 19335,
        "aisle": "Baking",
        "image": "sugar-in-bowl.png",
        "consistency": "SOLID",
        "name": "sugar",
        "nameClean": "sugar",
        "original": "•3 tbsp sugar",
        "originalName": "sugar",
        "amount": 3,
        "unit": "tbsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 3,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 4669,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "vegetable-oil.jpg",
        "consistency": "LIQUID",
        "name": "vegetable oil",
        "nameClean": "vegetable oil",
        "original": "Vegetable Oil",
        "originalName": "Vegetable Oil",
        "amount": 4,
        "unit": "servings",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 14412,
        "aisle": "Beverages",
        "image": "water.png",
        "consistency": "LIQUID",
        "name": "water",
        "nameClean": "water",
        "original": "•1 cup of water",
        "originalName": "of water",
        "amount": 1,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "cup",
            "unitLong": "cup"
          },
          "metric": {
            "amount": 236.588,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      }
    ],
    "summary": "Korean Sweet n Sour Chicken requires roughly <b>30 minutes</b> from start to finish. One serving contains <b>604 calories</b>, <b>56g of protein</b>, and <b>22g of fat</b>. This recipe serves 4 and costs $2.71 per serving. A mixture of sugar, soy sauce, cider vinegar, and a handful of other ingredients are all it takes to make this recipe so flavorful. This recipe from Foodista has 2 fans. This recipe is typical of Chinese cuisine. It works well as a main course. It is a good option if you're following a <b>dairy free</b> diet. With a spoonacular <b>score of 78%</b>, this dish is pretty good. Similar recipes are <a href=\"https://spoonacular.com/recipes/korean-sweet-n-sour-chicken-1229083\">Korean Sweet n Sour Chicken</a>, <a href=\"https://spoonacular.com/recipes/korean-cabbage-wraps-with-sweet-and-sour-cucumber-salad-301159\">Korean Cabbage Wraps with Sweet-and-Sour Cucumber Salad</a>, and <a href=\"https://spoonacular.com/recipes/grilled-korean-bbq-short-rib-dogs-with-sweet-peach-relish-spicy-korean-slaw-549399\">Grilled Korean BBQ Short Rib Dogs with Sweet Peach Relish + Spicy Korean Slaw</a>.",
    "cuisines": [
      "Chinese",
      "Asian"
    ],
    "dishTypes": [
      "lunch",
      "main course",
      "main dish",
      "dinner"
    ],
    "diets": [
      "dairy free"
    ],
    "occasions": [],
    "instructions": "<ol><li>Cut the chicken into thin strips, about 1 or 2-inch pieces. Add soy sauce to the chicken for a short marination; mix well and set aside.</li><li>Cut the vegetables into large bite-sized pieces. Set aside until the sauce is ready and thickened.</li><li>Make batter by mixing the flour, cornstarch, water and beaten egg. Add more flour until a thick consistency is reached. Dip the marinated chicken strips into the batter.</li><li>Bring vegetable oil to medium high heat. Deep fry each of the strips for about 3, 4 min for each batch or until browned and cooked through. When finished, place on paper towel-lined dish to remove excess oil. Once the first round of frying is done, heat the oil and re-fry the batch for the 2nd time to make it really crispy (optional).</li><li>To make the sauce bring the following ingredients in a saucepan: one cup of water along 3 tbsp vinegar, 3 tbsp sugar, and 2 tbsp of soy sauce. Bring to a rapid boil and then add the mixture of cornstarch and water. Add desired vegetables and let simmer for about 5 minutes or until it thickens.</li><li>On a large plate, add the fried chicken strips, then pour over the sauce/vegetable mixture and serve while warm.</li></ol>",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Cut the chicken into thin strips, about 1 or 2-inch pieces.",
            "ingredients": [
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 2,
            "step": "Add soy sauce to the chicken for a short marination; mix well and set aside.",
            "ingredients": [
              {
                "id": 16124,
                "name": "soy sauce",
                "localizedName": "soy sauce",
                "image": "soy-sauce.jpg"
              },
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 3,
            "step": "Cut the vegetables into large bite-sized pieces. Set aside until the sauce is ready and thickened.Make batter by mixing the flour, cornstarch, water and beaten egg.",
            "ingredients": [
              {
                "id": 20027,
                "name": "corn starch",
                "localizedName": "corn starch",
                "image": "white-powder.jpg"
              },
              {
                "id": 11583,
                "name": "vegetable",
                "localizedName": "vegetable",
                "image": "mixed-vegetables.png"
              },
              {
                "id": 20081,
                "name": "all purpose flour",
                "localizedName": "all purpose flour",
                "image": "flour.png"
              },
              {
                "id": 0,
                "name": "sauce",
                "localizedName": "sauce",
                "image": ""
              },
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              },
              {
                "id": 1123,
                "name": "egg",
                "localizedName": "egg",
                "image": "egg.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 4,
            "step": "Add more flour until a thick consistency is reached. Dip the marinated chicken strips into the batter.Bring vegetable oil to medium high heat. Deep fry each of the strips for about 3, 4 min for each batch or until browned and cooked through. When finished, place on paper towel-lined dish to remove excess oil. Once the first round of frying is done, heat the oil and re-fry the batch for the 2nd time to make it really crispy (optional).To make the sauce bring the following ingredients in a saucepan: one cup of water along 3 tbsp vinegar, 3 tbsp sugar, and 2 tbsp of soy sauce. Bring to a rapid boil and then add the mixture of cornstarch and water.",
            "ingredients": [
              {
                "id": 1015062,
                "name": "chicken tenders",
                "localizedName": "chicken tenders",
                "image": "chicken-tenders-or-fingers.png"
              },
              {
                "id": 4669,
                "name": "vegetable oil",
                "localizedName": "vegetable oil",
                "image": "vegetable-oil.jpg"
              },
              {
                "id": 20027,
                "name": "corn starch",
                "localizedName": "corn starch",
                "image": "white-powder.jpg"
              },
              {
                "id": 16124,
                "name": "soy sauce",
                "localizedName": "soy sauce",
                "image": "soy-sauce.jpg"
              },
              {
                "id": 2053,
                "name": "vinegar",
                "localizedName": "vinegar",
                "image": "vinegar-(white).jpg"
              },
              {
                "id": 20081,
                "name": "all purpose flour",
                "localizedName": "all purpose flour",
                "image": "flour.png"
              },
              {
                "id": 0,
                "name": "sauce",
                "localizedName": "sauce",
                "image": ""
              },
              {
                "id": 19335,
                "name": "sugar",
                "localizedName": "sugar",
                "image": "sugar-in-bowl.png"
              },
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              },
              {
                "id": 0,
                "name": "dip",
                "localizedName": "dip",
                "image": ""
              },
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              }
            ],
            "equipment": [
              {
                "id": 405895,
                "name": "paper towels",
                "localizedName": "paper towels",
                "image": "https://spoonacular.com/cdn/equipment_100x100/paper-towels.jpg"
              },
              {
                "id": 404669,
                "name": "sauce pan",
                "localizedName": "sauce pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/sauce-pan.jpg"
              }
            ],
            "length": {
              "number": 4,
              "unit": "minutes"
            }
          },
          {
            "number": 5,
            "step": "Add desired vegetables and let simmer for about 5 minutes or until it thickens.On a large plate, add the fried chicken strips, then pour over the sauce/vegetable mixture and serve while warm.",
            "ingredients": [
              {
                "id": 1015062,
                "name": "chicken tenders",
                "localizedName": "chicken tenders",
                "image": "chicken-tenders-or-fingers.png"
              },
              {
                "id": 11583,
                "name": "vegetable",
                "localizedName": "vegetable",
                "image": "mixed-vegetables.png"
              },
              {
                "id": 0,
                "name": "sauce",
                "localizedName": "sauce",
                "image": ""
              }
            ],
            "equipment": [],
            "length": {
              "number": 5,
              "unit": "minutes"
            }
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 80.89018249511719,
    "spoonacularSourceUrl": "https://spoonacular.com/korean-sweet-n-sour-chicken-638369"
  },
  {
    "id": 640621,
    "image": "https://img.spoonacular.com/recipes/640621-556x370.jpg",
    "imageType": "jpg",
    "title": "Creamy Chicken Tikka Masala",
    "readyInMinutes": 45,
    "servings": 4,
    "sourceUrl": "https://www.foodista.com/recipe/B37W5NWL/creamy-chicken-tikka-masala",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": true,
    "dairyFree": false,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 23,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 11,
    "healthScore": 9,
    "creditsText": "foodista.com",
    "license": null,
    "sourceName": "foodista.com",
    "pricePerServing": 222.19,
    "extendedIngredients": [
      {
        "id": 1002030,
        "aisle": "Spices and Seasonings",
        "image": "pepper.jpg",
        "consistency": "SOLID",
        "name": "pepper",
        "nameClean": "black pepper",
        "original": "1/2 teaspoon freshly ground black pepper",
        "originalName": "freshly ground black pepper",
        "amount": 0.5,
        "unit": "teaspoon",
        "meta": [
          "black",
          "freshly ground"
        ],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 11549,
        "aisle": "Canned and Jarred",
        "image": "tomato-sauce-or-pasta-sauce.jpg",
        "consistency": "SOLID",
        "name": "tomato sauce",
        "nameClean": "canned tomato sauce",
        "original": "1 can (8 ounce) tomato sauce",
        "originalName": "can tomato sauce",
        "amount": 8,
        "unit": "ounce",
        "meta": [
          "canned"
        ],
        "measures": {
          "us": {
            "amount": 8,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 226.796,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 2031,
        "aisle": "Spices and Seasonings",
        "image": "chili-powder.jpg",
        "consistency": "SOLID",
        "name": "cayenne pepper",
        "nameClean": "ground cayenne pepper",
        "original": "1/2 teaspoon cayenne pepper",
        "originalName": "cayenne pepper",
        "amount": 0.5,
        "unit": "teaspoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 11165,
        "aisle": "Produce",
        "image": "cilantro.png",
        "consistency": "SOLID",
        "name": "cilantro",
        "nameClean": "cilantro",
        "original": "1/4 cup chopped fresh cilantro",
        "originalName": "chopped fresh cilantro",
        "amount": 0.25,
        "unit": "cup",
        "meta": [
          "fresh",
          "chopped"
        ],
        "measures": {
          "us": {
            "amount": 0.25,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 4,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 10211216,
        "aisle": "Produce",
        "image": "ginger.png",
        "consistency": "SOLID",
        "name": "ginger",
        "nameClean": "fresh ginger",
        "original": "1 tablespoon minced fresh ginger",
        "originalName": "minced fresh ginger",
        "amount": 1,
        "unit": "tablespoon",
        "meta": [
          "fresh",
          "minced"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      },
      {
        "id": 11215,
        "aisle": "Produce",
        "image": "garlic.png",
        "consistency": "SOLID",
        "name": "garlic",
        "nameClean": "garlic",
        "original": "1 clove garlic, minced",
        "originalName": "garlic, minced",
        "amount": 1,
        "unit": "clove",
        "meta": [
          "minced"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "clove",
            "unitLong": "clove"
          },
          "metric": {
            "amount": 1,
            "unitShort": "clove",
            "unitLong": "clove"
          }
        }
      },
      {
        "id": 1012010,
        "aisle": "Spices and Seasonings",
        "image": "cinnamon.jpg",
        "consistency": "SOLID",
        "name": "ground cinnamon",
        "nameClean": "ground cinnamon",
        "original": "1 teaspoon ground cinnamon",
        "originalName": "ground cinnamon",
        "amount": 1,
        "unit": "teaspoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          }
        }
      },
      {
        "id": 1012014,
        "aisle": "Spices and Seasonings",
        "image": "ground-cumin.jpg",
        "consistency": "SOLID",
        "name": "ground cumin",
        "nameClean": "ground cumin",
        "original": "2 teaspoons ground cumin",
        "originalName": "ground cumin",
        "amount": 2,
        "unit": "teaspoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 1053,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "fluid-cream.jpg",
        "consistency": "LIQUID",
        "name": "heavy cream",
        "nameClean": "cream",
        "original": "1 cup heavy cream",
        "originalName": "heavy cream",
        "amount": 1,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "cup",
            "unitLong": "cup"
          },
          "metric": {
            "amount": 238,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 11979,
        "aisle": "Ethnic Foods",
        "image": "jalapeno-pepper.png",
        "consistency": "SOLID",
        "name": "jalapeno pepper",
        "nameClean": "jalapeno pepper",
        "original": "1 jalapeno pepper, finely chopped",
        "originalName": "jalapeno pepper, finely chopped",
        "amount": 1,
        "unit": "",
        "meta": [
          "finely chopped"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 9152,
        "aisle": "Produce",
        "image": "lemon-juice.jpg",
        "consistency": "LIQUID",
        "name": "lemon juice",
        "nameClean": "lemon juice",
        "original": "1 tablespoon lemon juice",
        "originalName": "lemon juice",
        "amount": 1,
        "unit": "tablespoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      },
      {
        "id": 2028,
        "aisle": "Spices and Seasonings",
        "image": "paprika.jpg",
        "consistency": "SOLID",
        "name": "paprika",
        "nameClean": "paprika",
        "original": "2 teaspoons paprika",
        "originalName": "paprika",
        "amount": 2,
        "unit": "teaspoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 2047,
        "aisle": "Spices and Seasonings",
        "image": "salt.jpg",
        "consistency": "SOLID",
        "name": "salt",
        "nameClean": "table salt",
        "original": "1/4 teaspoon salt",
        "originalName": "salt",
        "amount": 0.25,
        "unit": "teaspoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.25,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.25,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 1055062,
        "aisle": "Meat",
        "image": "chicken-breasts.png",
        "consistency": "SOLID",
        "name": "chicken breasts",
        "nameClean": "boneless skinless chicken breast",
        "original": "3 boneless skinless chicken breasts, cut into bite-size pieces",
        "originalName": "boneless skinless chicken breasts, cut into bite-size pieces",
        "amount": 3,
        "unit": "",
        "meta": [
          "boneless",
          "skinless",
          "cut into bite-size pieces"
        ],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 3,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 1145,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "butter-sliced.jpg",
        "consistency": "SOLID",
        "name": "butter",
        "nameClean": "unsalted butter",
        "original": "1/2 cup unsalted butter, melted (1 stick)",
        "originalName": "unsalted butter, melted (1 stick)",
        "amount": 0.5,
        "unit": "cup",
        "meta": [
          "unsalted",
          "melted",
          "(1 stick)"
        ],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 113.5,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 1116,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "plain-yogurt.jpg",
        "consistency": "SOLID",
        "name": "yogurt",
        "nameClean": "yogurt",
        "original": "1 cup yogurt",
        "originalName": "yogurt",
        "amount": 1,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "cup",
            "unitLong": "cup"
          },
          "metric": {
            "amount": 245,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      }
    ],
    "summary": "The recipe Creamy Chicken Tikka Masala could satisfy your Indian craving in about <b>45 minutes</b>. This gluten free, primal, and ketogenic recipe serves 4 and costs <b>$2.22 per serving</b>. This main course has <b>567 calories</b>, <b>23g of protein</b>, and <b>49g of fat</b> per serving. Head to the store and pick up heavy cream, salt, ground cinnamon, and a few other things to make it today. This recipe is liked by 11 foodies and cooks. It is brought to you by Foodista. With a spoonacular <b>score of 53%</b>, this dish is pretty good. Similar recipes are <a href=\"https://spoonacular.com/recipes/creamy-chicken-tikka-masala-1525147\">Creamy Chicken Tikka Masala</a>, <a href=\"https://spoonacular.com/recipes/chicken-in-creamy-tomato-curry-chicken-tikka-masala-1213577\">Chicken in Creamy Tomato Curry: Chicken Tikka Masala</a>, and <a href=\"https://spoonacular.com/recipes/chicken-in-creamy-tomato-curry-chicken-tikka-masala-311933\">Chicken in Creamy Tomato Curry: Chicken Tikka Masala</a>.",
    "cuisines": [
      "Indian",
      "Asian"
    ],
    "dishTypes": [
      "lunch",
      "main course",
      "main dish",
      "dinner"
    ],
    "diets": [
      "gluten free",
      "primal",
      "ketogenic"
    ],
    "occasions": [],
    "instructions": "<ol><li>In a large bowl, combine yogurt, lemon juice, 2 teaspoons cumin, cinnamon, cayenne, black pepper, ginger, and 4 teaspoons salt. Stir in chicken, cover, and refrigerate for 1 hour.</li><li>Preheat a grill for high heat.</li><li>Lightly oil the grill grate. Thread chicken onto skewers, and discard marinade. Grill until juices run clear, about 5 minutes on each side.</li><li>Melt butter in a large heavy skillet over medium heat. Saute garlic and jalapeno for 1 minute. Season with 2 teaspoons cumin, paprika, and 3 teaspoons salt. Stir in tomato sauce and cream. Simmer on low heat until sauce thickens, about 20 minutes. Add grilled chicken, and simmer for 10 minutes. Transfer to a serving platter, and garnish with fresh cilantro.</li><li>Makes 4 servings</li></ol>",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "In a large bowl, combine yogurt, lemon juice, 2 teaspoons cumin, cinnamon, cayenne, black pepper, ginger, and 4 teaspoons salt. Stir in chicken, cover, and refrigerate for 1 hour.Preheat a grill for high heat.Lightly oil the grill grate. Thread chicken onto skewers, and discard marinade. Grill until juices run clear, about 5 minutes on each side.Melt butter in a large heavy skillet over medium heat.",
            "ingredients": [
              {
                "id": 1002030,
                "name": "black pepper",
                "localizedName": "black pepper",
                "image": "pepper.jpg"
              },
              {
                "id": 9152,
                "name": "lemon juice",
                "localizedName": "lemon juice",
                "image": "lemon-juice.jpg"
              },
              {
                "id": 2010,
                "name": "cinnamon",
                "localizedName": "cinnamon",
                "image": "https://spoonacular.com/cdn/ingredients_100x100/cinnamon.jpg"
              },
              {
                "id": 0,
                "name": "marinade",
                "localizedName": "marinade",
                "image": "seasoning.png"
              },
              {
                "id": 2031,
                "name": "ground cayenne pepper",
                "localizedName": "ground cayenne pepper",
                "image": "chili-powder.jpg"
              },
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              },
              {
                "id": 1001,
                "name": "butter",
                "localizedName": "butter",
                "image": "butter-sliced.jpg"
              },
              {
                "id": 11216,
                "name": "ginger",
                "localizedName": "ginger",
                "image": "ginger.png"
              },
              {
                "id": 1116,
                "name": "yogurt",
                "localizedName": "yogurt",
                "image": "plain-yogurt.jpg"
              },
              {
                "id": 1002014,
                "name": "cumin",
                "localizedName": "cumin",
                "image": "ground-cumin.jpg"
              },
              {
                "id": 2047,
                "name": "salt",
                "localizedName": "salt",
                "image": "salt.jpg"
              },
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              }
            ],
            "equipment": [
              {
                "id": 3065,
                "name": "skewers",
                "localizedName": "skewers",
                "image": "https://spoonacular.com/cdn/equipment_100x100/wooden-skewers.jpg"
              },
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              },
              {
                "id": 404706,
                "name": "grill",
                "localizedName": "grill",
                "image": "https://spoonacular.com/cdn/equipment_100x100/grill.jpg"
              },
              {
                "id": 404783,
                "name": "bowl",
                "localizedName": "bowl",
                "image": "https://spoonacular.com/cdn/equipment_100x100/bowl.jpg"
              }
            ],
            "length": {
              "number": 65,
              "unit": "minutes"
            }
          },
          {
            "number": 2,
            "step": "Saute garlic and jalapeno for 1 minute. Season with 2 teaspoons cumin, paprika, and 3 teaspoons salt. Stir in tomato sauce and cream. Simmer on low heat until sauce thickens, about 20 minutes.",
            "ingredients": [
              {
                "id": 11549,
                "name": "tomato sauce",
                "localizedName": "tomato sauce",
                "image": "https://spoonacular.com/cdn/ingredients_100x100/tomato-sauce-or-pasta-sauce.jpg"
              },
              {
                "id": 11979,
                "name": "jalapeno pepper",
                "localizedName": "jalapeno pepper",
                "image": "jalapeno-pepper.png"
              },
              {
                "id": 2028,
                "name": "paprika",
                "localizedName": "paprika",
                "image": "paprika.jpg"
              },
              {
                "id": 11215,
                "name": "garlic",
                "localizedName": "garlic",
                "image": "garlic.png"
              },
              {
                "id": 1053,
                "name": "cream",
                "localizedName": "cream",
                "image": "fluid-cream.jpg"
              },
              {
                "id": 1002014,
                "name": "cumin",
                "localizedName": "cumin",
                "image": "ground-cumin.jpg"
              },
              {
                "id": 0,
                "name": "sauce",
                "localizedName": "sauce",
                "image": ""
              },
              {
                "id": 2047,
                "name": "salt",
                "localizedName": "salt",
                "image": "salt.jpg"
              }
            ],
            "equipment": [],
            "length": {
              "number": 21,
              "unit": "minutes"
            }
          },
          {
            "number": 3,
            "step": "Add grilled chicken, and simmer for 10 minutes.",
            "ingredients": [
              {
                "id": 1015114,
                "name": "grilled chicken",
                "localizedName": "grilled chicken",
                "image": "rotisserie-chicken.png"
              }
            ],
            "equipment": [],
            "length": {
              "number": 10,
              "unit": "minutes"
            }
          },
          {
            "number": 4,
            "step": "Transfer to a serving platter, and garnish with fresh cilantro.Makes 4 servings",
            "ingredients": [
              {
                "id": 11165,
                "name": "fresh cilantro",
                "localizedName": "fresh cilantro",
                "image": "cilantro.png"
              }
            ],
            "equipment": []
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 57.893829345703125,
    "spoonacularSourceUrl": "https://spoonacular.com/creamy-chicken-tikka-masala-640621"
  },
  {
    "id": 641145,
    "image": "https://img.spoonacular.com/recipes/641145-556x370.jpg",
    "imageType": "jpg",
    "title": "Curry-Braised Chicken",
    "readyInMinutes": 75,
    "servings": 4,
    "sourceUrl": "http://www.foodista.com/recipe/YN6PSSKQ/curry-braised-chicken",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": true,
    "dairyFree": true,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": true,
    "weightWatcherSmartPoints": 21,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 2,
    "healthScore": 18,
    "creditsText": "foodista.com",
    "license": null,
    "sourceName": "foodista.com",
    "pricePerServing": 219.68,
    "extendedIngredients": [
      {
        "id": 10020444,
        "aisle": "Pasta and Rice",
        "image": "rice-white-long-grain-or-basmatii-cooked.jpg",
        "consistency": "SOLID",
        "name": "basmati rice",
        "nameClean": "basmati rice",
        "original": "basmati rice",
        "originalName": "basmati rice",
        "amount": 4,
        "unit": "servings",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 19334,
        "aisle": "Baking",
        "image": "light-brown-sugar.jpg",
        "consistency": "SOLID",
        "name": "brown sugar",
        "nameClean": "golden brown sugar",
        "original": "1 Tbsp. palm or brown sugar",
        "originalName": "palm or brown sugar",
        "amount": 1,
        "unit": "Tbsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      },
      {
        "id": 6179,
        "aisle": "Ethnic Foods",
        "image": "asian-fish-sauce.jpg",
        "consistency": "LIQUID",
        "name": "fish sauce",
        "nameClean": "fish sauce",
        "original": "2 Tbsp. fish sauce",
        "originalName": "fish sauce",
        "amount": 2,
        "unit": "Tbsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 9160,
        "aisle": "Produce",
        "image": "lime-juice.png",
        "consistency": "LIQUID",
        "name": "lime juice",
        "nameClean": "lime juice",
        "original": "2 Tbsp. fresh lime juice, or wedges for serving",
        "originalName": "fresh lime juice, or wedges for serving",
        "amount": 2,
        "unit": "Tbsp",
        "meta": [
          "fresh",
          "for serving"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 10211821,
        "aisle": "Produce",
        "image": "bell-pepper-orange.png",
        "consistency": "SOLID",
        "name": "bell pepper",
        "nameClean": "bell pepper",
        "original": "pepper",
        "originalName": "pepper",
        "amount": 4,
        "unit": "servings",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 2047,
        "aisle": "Spices and Seasonings",
        "image": "salt.jpg",
        "consistency": "SOLID",
        "name": "salt",
        "nameClean": "table salt",
        "original": "Salt",
        "originalName": "Salt",
        "amount": 4,
        "unit": "servings",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 1055062,
        "aisle": "Meat",
        "image": "chicken-breasts.png",
        "consistency": "SOLID",
        "name": "chicken breasts",
        "nameClean": "boneless skinless chicken breast",
        "original": "2 large boneless, skinless, chicken breasts",
        "originalName": "boneless, skinless, chicken breasts",
        "amount": 2,
        "unit": "large",
        "meta": [
          "boneless",
          "skinless"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "large",
            "unitLong": "larges"
          },
          "metric": {
            "amount": 2,
            "unitShort": "large",
            "unitLong": "larges"
          }
        }
      },
      {
        "id": 12117,
        "aisle": "Canned and Jarred",
        "image": "coconut-milk.png",
        "consistency": "LIQUID",
        "name": "coconut milk",
        "nameClean": "unsweetened coconut milk",
        "original": "1 (14oz) can unsweetened coconut milk",
        "originalName": "unsweetened coconut milk",
        "amount": 14,
        "unit": "oz",
        "meta": [
          "unsweetened",
          "canned"
        ],
        "measures": {
          "us": {
            "amount": 14,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 396.893,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 4669,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "vegetable-oil.jpg",
        "consistency": "LIQUID",
        "name": "vegetable oil",
        "nameClean": "vegetable oil",
        "original": "2 Tbsp. grapeseed or vegetable oil",
        "originalName": "grapeseed or vegetable oil",
        "amount": 2,
        "unit": "Tbsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 10093605,
        "aisle": "Ethnic Foods",
        "image": "green-curry-paste.png",
        "consistency": "SOLID",
        "name": "curry paste",
        "nameClean": "green curry paste",
        "original": "2 Tbsp. curry paste (green, red, or yellow)",
        "originalName": "curry paste (green, red, or yellow)",
        "amount": 2,
        "unit": "Tbsp",
        "meta": [
          "green",
          "red",
          "yellow",
          "(, , or )"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      }
    ],
    "summary": "Forget going out to eat or ordering takeout every time you crave Indian food. Try making Curry-Braised Chicken at home. This recipe serves 4. For <b>$2.2 per serving</b>, this recipe <b>covers 26%</b> of your daily requirements of vitamins and minerals. This main course has <b>565 calories</b>, <b>19g of protein</b>, and <b>33g of fat</b> per serving. This recipe is liked by 2 foodies and cooks. If you have lime juice, chicken breasts, coconut milk, and a few other ingredients on hand, you can make it. From preparation to the plate, this recipe takes around <b>1 hour and 15 minutes</b>. It is brought to you by Foodista. It is a good option if you're following a <b>gluten free, dairy free, and fodmap friendly</b> diet. With a spoonacular <b>score of 64%</b>, this dish is good. Try <a href=\"https://spoonacular.com/recipes/curry-braised-chicken-legs-1531923\">Curry Braised Chicken Legs</a>, <a href=\"https://spoonacular.com/recipes/coconut-curry-braised-chicken-thighs-1040009\">Coconut-Curry Braised Chicken Thighs</a>, and <a href=\"https://spoonacular.com/recipes/curry-and-yogurt-braised-chicken-thighs-74523\">Curry-and-Yogurt-Braised Chicken Thighs</a> for similar recipes.",
    "cuisines": [
      "Indian",
      "Asian"
    ],
    "dishTypes": [
      "lunch",
      "main course",
      "main dish",
      "dinner"
    ],
    "diets": [
      "gluten free",
      "dairy free",
      "fodmap friendly"
    ],
    "occasions": [],
    "instructions": "<ol><li>Preheat your oven to 325 degrees Fahrenheit.</li><li>Cut the chicken breasts in half. Heat oil over medium-high in a Dutch oven. Dust chicken with salt and pepper, then brown 1-2 minutes per side in the oil, working in batches. Set chicken aside.</li><li>Add curry paste to the Dutch oven, then use a wooden spoon to break up large pieces and work the paste into the hot oil. Once combined, add the coconut milk and use the wooden spoon to release any browned pieces of chicken stuck to the pot. Stir in the fish sauce and sugar.</li><li>Cover the Dutch oven and place in the oven. Bake for 45-55 minutes, or until chicken is cooked through and no longer pink.</li><li>Stir in the lime juice and serve with cooked rice.</li></ol>",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Preheat your oven to 325 degrees Fahrenheit.",
            "ingredients": [],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg",
                "temperature": {
                  "number": 325,
                  "unit": "Fahrenheit"
                }
              }
            ]
          },
          {
            "number": 2,
            "step": "Cut the chicken breasts in half.",
            "ingredients": [
              {
                "id": 5062,
                "name": "chicken breast",
                "localizedName": "chicken breast",
                "image": "chicken-breasts.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 3,
            "step": "Heat oil over medium-high in a Dutch oven. Dust chicken with salt and pepper, then brown 1-2 minutes per side in the oil, working in batches. Set chicken aside.",
            "ingredients": [
              {
                "id": 1102047,
                "name": "salt and pepper",
                "localizedName": "salt and pepper",
                "image": "salt-and-pepper.jpg"
              },
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              },
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404667,
                "name": "dutch oven",
                "localizedName": "dutch oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/dutch-oven.jpg"
              }
            ],
            "length": {
              "number": 2,
              "unit": "minutes"
            }
          },
          {
            "number": 4,
            "step": "Add curry paste to the Dutch oven, then use a wooden spoon to break up large pieces and work the paste into the hot oil. Once combined, add the coconut milk and use the wooden spoon to release any browned pieces of chicken stuck to the pot. Stir in the fish sauce and sugar.Cover the Dutch oven and place in the oven.",
            "ingredients": [
              {
                "id": 12118,
                "name": "coconut milk",
                "localizedName": "coconut milk",
                "image": "coconut-milk.png"
              },
              {
                "id": 93605,
                "name": "curry paste",
                "localizedName": "curry paste",
                "image": "chili-paste.png"
              },
              {
                "id": 6179,
                "name": "fish sauce",
                "localizedName": "fish sauce",
                "image": "asian-fish-sauce.jpg"
              },
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              },
              {
                "id": 19335,
                "name": "sugar",
                "localizedName": "sugar",
                "image": "sugar-in-bowl.png"
              },
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404732,
                "name": "wooden spoon",
                "localizedName": "wooden spoon",
                "image": "https://spoonacular.com/cdn/equipment_100x100/wooden-spoon.jpg"
              },
              {
                "id": 404667,
                "name": "dutch oven",
                "localizedName": "dutch oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/dutch-oven.jpg"
              },
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              }
            ]
          },
          {
            "number": 5,
            "step": "Bake for 45-55 minutes, or until chicken is cooked through and no longer pink.Stir in the lime juice and serve with cooked rice.",
            "ingredients": [
              {
                "id": 10220445,
                "name": "cooked rice",
                "localizedName": "cooked rice",
                "image": "uncooked-white-rice.png"
              },
              {
                "id": 9160,
                "name": "lime juice",
                "localizedName": "lime juice",
                "image": "lime-juice.png"
              },
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              }
            ],
            "length": {
              "number": 55,
              "unit": "minutes"
            }
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 66.22874450683594,
    "spoonacularSourceUrl": "https://spoonacular.com/curry-braised-chicken-641145"
  },
  {
    "id": 644488,
    "image": "https://img.spoonacular.com/recipes/644488-556x370.jpg",
    "imageType": "jpg",
    "title": "German Rhubarb Cake with Meringue",
    "readyInMinutes": 45,
    "servings": 12,
    "sourceUrl": "https://www.foodista.com/recipe/68PX6QXK/german-rhubarb-cake-with-meringue",
    "vegetarian": true,
    "vegan": false,
    "glutenFree": false,
    "dairyFree": true,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 8,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 15,
    "healthScore": 3,
    "creditsText": "Foodista.com – The Cooking Encyclopedia Everyone Can Edit",
    "license": "CC BY 3.0",
    "sourceName": "Foodista",
    "pricePerServing": 57.05,
    "extendedIngredients": [
      {
        "id": 9307,
        "aisle": "Produce",
        "image": "rhubarb.jpg",
        "consistency": "SOLID",
        "name": "rhubarb",
        "nameClean": "rhubarb",
        "original": "21 ounces (600 g) rhubarb, peeled and cubed",
        "originalName": "21 ounces rhubarb, peeled and cubed",
        "amount": 600,
        "unit": "g",
        "meta": [
          "cubed",
          "peeled"
        ],
        "measures": {
          "us": {
            "amount": 1.323,
            "unitShort": "lb",
            "unitLong": "pounds"
          },
          "metric": {
            "amount": 600,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 19335,
        "aisle": "Baking",
        "image": "sugar-in-bowl.png",
        "consistency": "SOLID",
        "name": "sugar",
        "nameClean": "sugar",
        "original": "2 Tablespoons sugar",
        "originalName": "sugar",
        "amount": 2,
        "unit": "Tablespoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 19335,
        "aisle": "Baking",
        "image": "sugar-in-bowl.png",
        "consistency": "SOLID",
        "name": "sugar",
        "nameClean": "sugar",
        "original": "2/3 cup (130 g) sugar",
        "originalName": "2/3 cup sugar",
        "amount": 130,
        "unit": "g",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4.586,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 130,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 2050,
        "aisle": "Baking",
        "image": "vanilla-extract.jpg",
        "consistency": "LIQUID",
        "name": "vanilla extract",
        "nameClean": "vanilla extract",
        "original": "1 teaspoon (5 ml) vanilla extract",
        "originalName": "teaspoon vanilla extract",
        "amount": 5,
        "unit": "ml",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.149,
            "unitShort": "fl. oz",
            "unitLong": "fl. ozs"
          },
          "metric": {
            "amount": 5,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 2047,
        "aisle": "Spices and Seasonings",
        "image": "salt.jpg",
        "consistency": "SOLID",
        "name": "salt",
        "nameClean": "table salt",
        "original": "1/8 teaspoon salt",
        "originalName": "salt",
        "amount": 0.125,
        "unit": "teaspoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.125,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.125,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 1123,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "egg.png",
        "consistency": "SOLID",
        "name": "eggs",
        "nameClean": "egg",
        "original": "2 large eggs",
        "originalName": "eggs",
        "amount": 2,
        "unit": "large",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "large",
            "unitLong": "larges"
          },
          "metric": {
            "amount": 2,
            "unitShort": "large",
            "unitLong": "larges"
          }
        }
      },
      {
        "id": 20081,
        "aisle": "Baking",
        "image": "flour.png",
        "consistency": "SOLID",
        "name": "flour",
        "nameClean": "wheat flour",
        "original": "1 1/4 cup (150 g) flour",
        "originalName": "1/4 cup flour",
        "amount": 150,
        "unit": "g",
        "meta": [],
        "measures": {
          "us": {
            "amount": 5.291,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 150,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 12061,
        "aisle": "Nuts",
        "image": "almonds.jpg",
        "consistency": "SOLID",
        "name": "roasted almonds",
        "nameClean": "almonds",
        "original": "1 3/4 ounces (50 g) roasted almonds, ground",
        "originalName": "3/4 ounces roasted almonds, ground",
        "amount": 50,
        "unit": "g",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1.764,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 50,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 18369,
        "aisle": "Baking",
        "image": "white-powder.jpg",
        "consistency": "SOLID",
        "name": "baking powder",
        "nameClean": "baking powder",
        "original": "2 teaspoons baking powder",
        "originalName": "baking powder",
        "amount": 2,
        "unit": "teaspoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 1124,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "egg-white.jpg",
        "consistency": "SOLID",
        "name": "egg whites",
        "nameClean": "egg whites",
        "original": "3 egg whites",
        "originalName": "egg whites",
        "amount": 3,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 3,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 19335,
        "aisle": "Baking",
        "image": "sugar-in-bowl.png",
        "consistency": "SOLID",
        "name": "sugar",
        "nameClean": "sugar",
        "original": "3/4 cup (150 g) sugar",
        "originalName": "3/4 cup sugar",
        "amount": 150,
        "unit": "g",
        "meta": [],
        "measures": {
          "us": {
            "amount": 5.291,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 150,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 10112061,
        "aisle": "Baking",
        "image": "almonds.jpg",
        "consistency": "SOLID",
        "name": "almonds",
        "nameClean": "sliced almonds",
        "original": "sliced almonds for topping",
        "originalName": "sliced almonds for topping",
        "amount": 12,
        "unit": "servings",
        "meta": [
          "sliced",
          "for topping"
        ],
        "measures": {
          "us": {
            "amount": 12,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 12,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      }
    ],
    "summary": "German Rhubarb Cake with Meringue requires around <b>45 minutes</b> from start to finish. For <b>57 cents per serving</b>, this recipe <b>covers 6%</b> of your daily requirements of vitamins and minerals. One serving contains <b>201 calories</b>, <b>5g of protein</b>, and <b>4g of fat</b>. This recipe serves 12. <b>Mother's Day</b> will be even more special with this recipe. A mixture of roasted almonds, baking powder, sugar, and a handful of other ingredients are all it takes to make this recipe so scrumptious. 15 people were glad they tried this recipe. It works well as a dessert. It is a good option if you're following a <b>dairy free and lacto ovo vegetarian</b> diet. It is brought to you by Foodista. It is a <b>very reasonably priced</b> recipe for fans of European food. Overall, this recipe earns a <b>not so outstanding spoonacular score of 37%</b>. If you like this recipe, you might also like recipes such as <a href=\"https://spoonacular.com/recipes/german-rhubarb-cake-with-meringue-1200527\">German Rhubarb Cake with Meringue</a>, <a href=\"https://spoonacular.com/recipes/rhubarb-meringue-cake-381275\">Rhubarb Meringue Cake</a>, and <a href=\"https://spoonacular.com/recipes/rhubarb-meringue-tart-72822\">Rhubarb Meringue Tart</a>.",
    "cuisines": [
      "German",
      "European"
    ],
    "dishTypes": [
      "dessert"
    ],
    "diets": [
      "dairy free",
      "lacto ovo vegetarian"
    ],
    "occasions": [
      "spring",
      "mother's day"
    ],
    "instructions": "Preheat the oven to 350F Convection. Grease a round 26 cm Spring pan (9 1/2 inch).\nWash, dry and peel the rhubarb. Cut it in little pieces, mix with 2 tablespoon of sugar and let sit for at least 1/2 hour. It will extract a lot of water that needs to be drained. Pat rhubarb dry for further use.\nIn a kitchen machine beat together butter, sugar and vanilla extract until the butter is fluffy and the sugar is dissolved. Put in the eggs, one at a time and mix well.\nIn a separate bowl sift together flour, ground almonds, salt and baking powder, add slowly to the egg mixture. Dont over mix.\nFill dough into the spring pan, top with dried rhubarb and bake for 25 min.\nIn the mean time prepare the meringue/ baiser topping. Beat egg whites until stiff peaks form. Slowly add the sugar until meringue is firm and shiny.\nSpread the meringue evenly over the rhubarb and decorate with almond slices. Return to the oven for another 15 min. Cover the cake with aluminum foil after 5 min. in case the meringue does turn too dark.\nCool completely before removing the cake from the pan.",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Preheat the oven to 350F Convection. Grease a round 26 cm Spring pan (9 1/2 inch).",
            "ingredients": [],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg",
                "temperature": {
                  "number": 350,
                  "unit": "Fahrenheit"
                }
              },
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ]
          },
          {
            "number": 2,
            "step": "Wash, dry and peel the rhubarb.",
            "ingredients": [
              {
                "id": 9307,
                "name": "rhubarb",
                "localizedName": "rhubarb",
                "image": "rhubarb.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 3,
            "step": "Cut it in little pieces, mix with 2 tablespoon of sugar and let sit for at least 1/2 hour. It will extract a lot of water that needs to be drained. Pat rhubarb dry for further use.",
            "ingredients": [
              {
                "id": 0,
                "name": "extract",
                "localizedName": "extract",
                "image": ""
              },
              {
                "id": 9307,
                "name": "rhubarb",
                "localizedName": "rhubarb",
                "image": "rhubarb.jpg"
              },
              {
                "id": 19335,
                "name": "sugar",
                "localizedName": "sugar",
                "image": "sugar-in-bowl.png"
              },
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              }
            ],
            "equipment": [],
            "length": {
              "number": 120,
              "unit": "minutes"
            }
          },
          {
            "number": 4,
            "step": "In a kitchen machine beat together butter, sugar and vanilla extract until the butter is fluffy and the sugar is dissolved. Put in the eggs, one at a time and mix well.",
            "ingredients": [
              {
                "id": 2050,
                "name": "vanilla extract",
                "localizedName": "vanilla extract",
                "image": "vanilla-extract.jpg"
              },
              {
                "id": 1001,
                "name": "butter",
                "localizedName": "butter",
                "image": "butter-sliced.jpg"
              },
              {
                "id": 19335,
                "name": "sugar",
                "localizedName": "sugar",
                "image": "sugar-in-bowl.png"
              },
              {
                "id": 1123,
                "name": "egg",
                "localizedName": "egg",
                "image": "egg.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 5,
            "step": "In a separate bowl sift together flour, ground almonds, salt and baking powder, add slowly to the egg mixture. Dont over mix.",
            "ingredients": [
              {
                "id": 93740,
                "name": "almond meal",
                "localizedName": "almond meal",
                "image": "almond-meal-or-almond-flour.jpg"
              },
              {
                "id": 18369,
                "name": "baking powder",
                "localizedName": "baking powder",
                "image": "white-powder.jpg"
              },
              {
                "id": 20081,
                "name": "all purpose flour",
                "localizedName": "all purpose flour",
                "image": "flour.png"
              },
              {
                "id": 2047,
                "name": "salt",
                "localizedName": "salt",
                "image": "salt.jpg"
              },
              {
                "id": 1123,
                "name": "egg",
                "localizedName": "egg",
                "image": "egg.png"
              }
            ],
            "equipment": [
              {
                "id": 404783,
                "name": "bowl",
                "localizedName": "bowl",
                "image": "https://spoonacular.com/cdn/equipment_100x100/bowl.jpg"
              }
            ]
          },
          {
            "number": 6,
            "step": "Fill dough into the spring pan, top with dried rhubarb and bake for 25 min.",
            "ingredients": [
              {
                "id": 9307,
                "name": "rhubarb",
                "localizedName": "rhubarb",
                "image": "rhubarb.jpg"
              },
              {
                "id": 0,
                "name": "dough",
                "localizedName": "dough",
                "image": "pizza-dough"
              }
            ],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              },
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ],
            "length": {
              "number": 25,
              "unit": "minutes"
            }
          },
          {
            "number": 7,
            "step": "In the mean time prepare the meringue/ baiser topping. Beat egg whites until stiff peaks form. Slowly add the sugar until meringue is firm and shiny.",
            "ingredients": [
              {
                "id": 1124,
                "name": "egg whites",
                "localizedName": "egg whites",
                "image": "egg-white.jpg"
              },
              {
                "id": 19335,
                "name": "sugar",
                "localizedName": "sugar",
                "image": "sugar-in-bowl.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 8,
            "step": "Spread the meringue evenly over the rhubarb and decorate with almond slices. Return to the oven for another 15 min. Cover the cake with aluminum foil after 5 min. in case the meringue does turn too dark.",
            "ingredients": [
              {
                "id": 10112061,
                "name": "sliced almonds",
                "localizedName": "sliced almonds",
                "image": "almonds.jpg"
              },
              {
                "id": 9307,
                "name": "rhubarb",
                "localizedName": "rhubarb",
                "image": "rhubarb.jpg"
              },
              {
                "id": 0,
                "name": "spread",
                "localizedName": "spread",
                "image": ""
              }
            ],
            "equipment": [
              {
                "id": 404765,
                "name": "aluminum foil",
                "localizedName": "aluminum foil",
                "image": "https://spoonacular.com/cdn/equipment_100x100/aluminum-foil.png"
              },
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              }
            ],
            "length": {
              "number": 20,
              "unit": "minutes"
            }
          },
          {
            "number": 9,
            "step": "Cool completely before removing the cake from the pan.",
            "ingredients": [],
            "equipment": [
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ]
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 42.69517517089844,
    "spoonacularSourceUrl": "https://spoonacular.com/german-rhubarb-cake-with-meringue-644488"
  },
  {
    "id": 647631,
    "image": "https://img.spoonacular.com/recipes/647631-556x370.jpg",
    "imageType": "jpg",
    "title": "Hummus Soup",
    "readyInMinutes": 45,
    "servings": 40,
    "sourceUrl": "https://www.foodista.com/recipe/YYRPDY8M/hummus-soup",
    "vegetarian": true,
    "vegan": true,
    "glutenFree": true,
    "dairyFree": true,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 1,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 3,
    "healthScore": 5,
    "creditsText": "Foodista.com – The Cooking Encyclopedia Everyone Can Edit",
    "license": "CC BY 3.0",
    "sourceName": "Foodista",
    "pricePerServing": 25.06,
    "extendedIngredients": [
      {
        "id": 14412,
        "aisle": "Beverages",
        "image": "water.png",
        "consistency": "LIQUID",
        "name": "water",
        "nameClean": "water",
        "original": "4 cups of water",
        "originalName": "water",
        "amount": 4,
        "unit": "cups",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 946.352,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 4053,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "olive-oil.jpg",
        "consistency": "LIQUID",
        "name": "olive oil",
        "nameClean": "olive oil",
        "original": "4 tablespoons of olive oil, approx",
        "originalName": "olive oil, approx",
        "amount": 4,
        "unit": "tablespoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 4,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 16058,
        "aisle": "Canned and Jarred",
        "image": "chickpeas.png",
        "consistency": "SOLID",
        "name": "chickpeas",
        "nameClean": "canned chickpeas",
        "original": "3 cans of organic chickpeas, drained",
        "originalName": "organic chickpeas, drained",
        "amount": 3,
        "unit": "cans",
        "meta": [
          "organic",
          "drained"
        ],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "cans",
            "unitLong": "cans"
          },
          "metric": {
            "amount": 3,
            "unitShort": "cans",
            "unitLong": "cans"
          }
        }
      },
      {
        "id": 12023,
        "aisle": "Ethnic Foods",
        "image": "sesame-seeds.png",
        "consistency": "SOLID",
        "name": "sesame tahini",
        "nameClean": "sesame seeds",
        "original": "6 tablespoons of sesame tahini",
        "originalName": "sesame tahini",
        "amount": 6,
        "unit": "tablespoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 6,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 6,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 11215,
        "aisle": "Produce",
        "image": "garlic.png",
        "consistency": "SOLID",
        "name": "garlic",
        "nameClean": "garlic",
        "original": "3 cloves of garlic, minced",
        "originalName": "garlic, minced",
        "amount": 3,
        "unit": "cloves",
        "meta": [
          "minced"
        ],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "cloves",
            "unitLong": "cloves"
          },
          "metric": {
            "amount": 3,
            "unitShort": "cloves",
            "unitLong": "cloves"
          }
        }
      },
      {
        "id": 9152,
        "aisle": "Produce",
        "image": "lemon-juice.jpg",
        "consistency": "LIQUID",
        "name": "lemons",
        "nameClean": "lemon juice",
        "original": "2 cups whole lemons, cut up and squeezed into the soup or ½ of lemon juice",
        "originalName": "whole lemons, cut up and squeezed into the soup or ½ of lemon juice",
        "amount": 2,
        "unit": "cups",
        "meta": [
          "whole"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 488,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 1002014,
        "aisle": "Spices and Seasonings",
        "image": "ground-cumin.jpg",
        "consistency": "SOLID",
        "name": "cumin",
        "nameClean": "cumin",
        "original": "2 teaspoons of cumin",
        "originalName": "cumin",
        "amount": 2,
        "unit": "teaspoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 2043,
        "aisle": "Spices and Seasonings",
        "image": "turmeric.jpg",
        "consistency": "SOLID",
        "name": "tumeric",
        "nameClean": "turmeric",
        "original": "2 teaspoons of tumeric",
        "originalName": "tumeric",
        "amount": 2,
        "unit": "teaspoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 2015,
        "aisle": "Spices and Seasonings",
        "image": "curry-powder.jpg",
        "consistency": "SOLID",
        "name": "curry powder",
        "nameClean": "curry powder",
        "original": "4 teaspoons of curry powder, approx",
        "originalName": "curry powder, approx",
        "amount": 4,
        "unit": "teaspoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 4,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 2010,
        "aisle": "Spices and Seasonings",
        "image": "cinnamon.jpg",
        "consistency": "SOLID",
        "name": "cinnamon",
        "nameClean": "cinnamon",
        "original": "4 teaspoons of cinnamon",
        "originalName": "cinnamon",
        "amount": 4,
        "unit": "teaspoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 4,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 1102047,
        "aisle": "Spices and Seasonings",
        "image": "salt-and-pepper.jpg",
        "consistency": "SOLID",
        "name": "sea salt and pepper",
        "nameClean": "salt and pepper",
        "original": "of sea salt and pepper",
        "originalName": "of sea salt and pepper",
        "amount": 40,
        "unit": "servings",
        "meta": [],
        "measures": {
          "us": {
            "amount": 40,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 40,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      }
    ],
    "summary": "Forget going out to eat or ordering takeout every time you crave middl eastern food. Try making Hummus Soup at home. This gluten free, dairy free, lacto ovo vegetarian, and vegan recipe serves 40 and costs <b>25 cents per serving</b>. This hor d'oeuvre has <b>54 calories</b>, <b>2g of protein</b>, and <b>3g of fat</b> per serving. Not a lot of people made this recipe, and 3 would say it hit the spot. If you have sea salt and pepper, tumeric, chickpeas, and a few other ingredients on hand, you can make it. It will be a hit at your <b>Autumn</b> event. It is brought to you by Foodista. From preparation to the plate, this recipe takes approximately <b>45 minutes</b>. With a spoonacular <b>score of 49%</b>, this dish is pretty good. If you like this recipe, you might also like recipes such as <a href=\"https://spoonacular.com/recipes/hummus-soup-1357081\">Hummus Soup</a>, <a href=\"https://spoonacular.com/recipes/hummus-soup-1376959\">Hummus Soup</a>, and <a href=\"https://spoonacular.com/recipes/chilled-hummus-soup-597156\">Chilled Hummus Soup</a>.",
    "cuisines": [
      "Middle Eastern"
    ],
    "dishTypes": [
      "antipasti",
      "soup",
      "starter",
      "snack",
      "appetizer",
      "antipasto",
      "hor d'oeuvre"
    ],
    "diets": [
      "gluten free",
      "dairy free",
      "lacto ovo vegetarian",
      "vegan"
    ],
    "occasions": [
      "fall",
      "winter"
    ],
    "instructions": "Place water into a medium-sized pot. Chop up the garlic and add it to the pot, cover, and let boil for 10-15 minutes. Add the chickpeas and tahini, along with the salt, pepper, cumin, curry, cinnamon, and tumeric and let cook for another 20 minutes. Turn off the flame and blend (either with a hand blender or regular one). Top off with various seasonings and a drizzle of tahini for a garnish.",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Place water into a medium-sized pot. Chop up the garlic and add it to the pot, cover, and let boil for 10-15 minutes.",
            "ingredients": [
              {
                "id": 11215,
                "name": "garlic",
                "localizedName": "garlic",
                "image": "garlic.png"
              },
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              }
            ],
            "equipment": [
              {
                "id": 404752,
                "name": "pot",
                "localizedName": "pot",
                "image": "https://spoonacular.com/cdn/equipment_100x100/stock-pot.jpg"
              }
            ],
            "length": {
              "number": 15,
              "unit": "minutes"
            }
          },
          {
            "number": 2,
            "step": "Add the chickpeas and tahini, along with the salt, pepper, cumin, curry, cinnamon, and tumeric and let cook for another 20 minutes. Turn off the flame and blend (either with a hand blender or regular one). Top off with various seasonings and a drizzle of tahini for a garnish.",
            "ingredients": [
              {
                "id": 1042027,
                "name": "seasoning",
                "localizedName": "seasoning",
                "image": "seasoning.png"
              },
              {
                "id": 16057,
                "name": "chickpeas",
                "localizedName": "chickpeas",
                "image": "chickpeas.png"
              },
              {
                "id": 2010,
                "name": "cinnamon",
                "localizedName": "cinnamon",
                "image": "https://spoonacular.com/cdn/ingredients_100x100/cinnamon.jpg"
              },
              {
                "id": 2043,
                "name": "turmeric",
                "localizedName": "turmeric",
                "image": "turmeric.jpg"
              },
              {
                "id": 1002030,
                "name": "pepper",
                "localizedName": "pepper",
                "image": "pepper.jpg"
              },
              {
                "id": 12698,
                "name": "tahini",
                "localizedName": "tahini",
                "image": "tahini-paste.png"
              },
              {
                "id": 1002014,
                "name": "cumin",
                "localizedName": "cumin",
                "image": "ground-cumin.jpg"
              },
              {
                "id": 2047,
                "name": "salt",
                "localizedName": "salt",
                "image": "salt.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404776,
                "name": "immersion blender",
                "localizedName": "immersion blender",
                "image": "https://spoonacular.com/cdn/equipment_100x100/immersion-blender.png"
              }
            ],
            "length": {
              "number": 20,
              "unit": "minutes"
            }
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 46.63080978393555,
    "spoonacularSourceUrl": "https://spoonacular.com/hummus-soup-647631"
  },
  {
    "id": 648479,
    "image": "https://img.spoonacular.com/recipes/648479-556x370.jpg",
    "imageType": "jpg",
    "title": "Japanese Mabo Tofu With Eggplant",
    "readyInMinutes": 45,
    "servings": 4,
    "sourceUrl": "https://www.foodista.com/recipe/7GMSDHPD/japanese-mabo-tofu-with-eggplant",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": true,
    "dairyFree": true,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 11,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 2,
    "healthScore": 9,
    "creditsText": "Foodista.com – The Cooking Encyclopedia Everyone Can Edit",
    "license": "CC BY 3.0",
    "sourceName": "Foodista",
    "pricePerServing": 167.74,
    "extendedIngredients": [
      {
        "id": 20444,
        "aisle": "Pasta and Rice",
        "image": "uncooked-white-rice.png",
        "consistency": "SOLID",
        "name": "japanese rice",
        "nameClean": "rice",
        "original": "Japanese rice",
        "originalName": "Japanese rice",
        "amount": 4,
        "unit": "servings",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 11209,
        "aisle": "Produce",
        "image": "eggplant.png",
        "consistency": "SOLID",
        "name": "eggplant",
        "nameClean": "eggplant",
        "original": "1 Chinese eggplant (smaller than regular eggplant)",
        "originalName": "Chinese eggplant (smaller than regular eggplant)",
        "amount": 1,
        "unit": "small",
        "meta": [
          "chinese",
          "(smaller than regular eggplant)"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "small",
            "unitLong": "small"
          },
          "metric": {
            "amount": 1,
            "unitShort": "small",
            "unitLong": "small"
          }
        }
      },
      {
        "id": 11282,
        "aisle": "Produce",
        "image": "brown-onion.png",
        "consistency": "SOLID",
        "name": "onion",
        "nameClean": "onion",
        "original": "1 medium size onion, finely chopped",
        "originalName": "onion, finely chopped",
        "amount": 1,
        "unit": "medium size",
        "meta": [
          "finely chopped"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "medium size",
            "unitLong": "medium size"
          },
          "metric": {
            "amount": 1,
            "unitShort": "medium size",
            "unitLong": "medium size"
          }
        }
      },
      {
        "id": 10211216,
        "aisle": "Produce",
        "image": "ginger.png",
        "consistency": "SOLID",
        "name": "ginger",
        "nameClean": "fresh ginger",
        "original": "1 tablespoon fresh ginger, finely chopped",
        "originalName": "fresh ginger, finely chopped",
        "amount": 1,
        "unit": "tablespoon",
        "meta": [
          "fresh",
          "finely chopped"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      },
      {
        "id": 10211215,
        "aisle": "Produce",
        "image": "garlic.jpg",
        "consistency": "SOLID",
        "name": "garlic cloves",
        "nameClean": "whole garlic cloves",
        "original": "2 garlic cloves, finely chopped",
        "originalName": "garlic cloves, finely chopped",
        "amount": 2,
        "unit": "",
        "meta": [
          "finely chopped"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 10023572,
        "aisle": "Meat",
        "image": "fresh-ground-beef.jpg",
        "consistency": "SOLID",
        "name": "ground beef",
        "nameClean": "ground chuck",
        "original": "3/4 pound ground beef (or pork)",
        "originalName": "ground beef (or pork)",
        "amount": 0.75,
        "unit": "pound",
        "meta": [
          "(or pork)"
        ],
        "measures": {
          "us": {
            "amount": 0.75,
            "unitShort": "lb",
            "unitLong": "pounds"
          },
          "metric": {
            "amount": 340.194,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 11291,
        "aisle": "Produce",
        "image": "spring-onions.jpg",
        "consistency": "SOLID",
        "name": "spring onions",
        "nameClean": "spring onions",
        "original": "4 spring onions, finely chopped",
        "originalName": "spring onions, finely chopped",
        "amount": 4,
        "unit": "",
        "meta": [
          "finely chopped"
        ],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 4,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 4582,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "vegetable-oil.jpg",
        "consistency": "LIQUID",
        "name": "oil",
        "nameClean": "cooking oil",
        "original": "2 tablespoons neutral oil (canola, grapeseed)",
        "originalName": "neutral oil (canola, grapeseed)",
        "amount": 2,
        "unit": "tablespoons",
        "meta": [
          "neutral",
          "(canola, grapeseed)"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 4058,
        "aisle": "Ethnic Foods",
        "image": "sesame-oil.png",
        "consistency": "LIQUID",
        "name": "sesame oil",
        "nameClean": "sesame oil",
        "original": "1 tablespoon sesame oil",
        "originalName": "sesame oil",
        "amount": 1,
        "unit": "tablespoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      },
      {
        "id": 16124,
        "aisle": "Condiments",
        "image": "soy-sauce.jpg",
        "consistency": "LIQUID",
        "name": "soy sauce",
        "nameClean": "soy sauce",
        "original": "6 tablespoons soy sauce",
        "originalName": "soy sauce",
        "amount": 6,
        "unit": "tablespoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 6,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 6,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 43479,
        "aisle": "Alcoholic Beverages",
        "image": "fish-sauce.jpg",
        "consistency": "SOLID",
        "name": "cooking sake",
        "nameClean": "shaoxing wine",
        "original": "2 tablespoons cooking sake",
        "originalName": "cooking sake",
        "amount": 2,
        "unit": "tablespoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 19335,
        "aisle": "Baking",
        "image": "sugar-in-bowl.png",
        "consistency": "SOLID",
        "name": "sugar",
        "nameClean": "sugar",
        "original": "1 1/2 teaspoons sugar",
        "originalName": "sugar",
        "amount": 1.5,
        "unit": "teaspoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 1.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 14412,
        "aisle": "Beverages",
        "image": "water.png",
        "consistency": "LIQUID",
        "name": "water",
        "nameClean": "water",
        "original": "2 tablespoons water",
        "originalName": "water",
        "amount": 2,
        "unit": "tablespoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 1072009,
        "aisle": "Ethnic Foods",
        "image": "chili-powder.jpg",
        "consistency": "SOLID",
        "name": "to-ban-jan",
        "nameClean": "gochugaru",
        "original": "1 tablespoon to-ban-jan (Korean red chili paste)",
        "originalName": "to-ban-jan (Korean red chili paste)",
        "amount": 1,
        "unit": "tablespoon",
        "meta": [
          "red",
          "(Korean chili paste)"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      }
    ],
    "summary": "You can never have too many main course recipes, so give Japanese Mabo Tofu With Eggplant a try. One portion of this dish contains about <b>20g of protein</b>, <b>28g of fat</b>, and a total of <b>397 calories</b>. This recipe serves 4. For <b>$1.68 per serving</b>, this recipe <b>covers 17%</b> of your daily requirements of vitamins and minerals. This recipe from Foodista has 2 fans. If you have ginger, sesame oil, oil, and a few other ingredients on hand, you can make it. Only a few people really liked this Japanese dish. It is a good option if you're following a <b>gluten free and dairy free</b> diet. From preparation to the plate, this recipe takes around <b>45 minutes</b>. All things considered, we decided this recipe <b>deserves a spoonacular score of 42%</b>. This score is good. If you like this recipe, you might also like recipes such as <a href=\"https://spoonacular.com/recipes/japanese-mabo-tofu-with-eggplant-1371825\">Japanese Mabo Tofu With Eggplant</a>, <a href=\"https://spoonacular.com/recipes/mapo-tofu-mabo-dofu-540861\">Mapo Tofu (Mabo Dofu)</a>, and <a href=\"https://spoonacular.com/recipes/japanese-eggplant-1381037\">Japanese Eggplant</a>.",
    "cuisines": [
      "Japanese",
      "Asian"
    ],
    "dishTypes": [
      "lunch",
      "main course",
      "main dish",
      "dinner"
    ],
    "diets": [
      "gluten free",
      "dairy free"
    ],
    "occasions": [],
    "instructions": "Cook rice according to directions on package (I like to use Nishiki rice).\nSlice eggplant lengthwise into 4 strips. Slice horizontally into quarters. Set aside.\nIn a pan over medium/high heat, add 2 tbsp oil, garlic, ginger, onions and half of the spring onions. Cook for 3 to 4 minutes, until onions are translucent.\nAdd ground beef and season with a bit of salt & pepper. When the meat is cooked, add to-ban-jan and stir.\nAdd sesame oil and eggplant and cook for 5 to 7 minutes, until the strips are soft and cooked through. Add tofu and delicately break it up while mixing it in.\nAdd sake, sugar, water, 4 tbsp soy sauce, stir and cook for a couple of minutes. Add the remaining 2 tbsp soy sauce and spring onions, stir and turn the heat off. Serve over rice.",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Cook rice according to directions on package (I like to use Nishiki rice).",
            "ingredients": [
              {
                "id": 20444,
                "name": "rice",
                "localizedName": "rice",
                "image": "uncooked-white-rice.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 2,
            "step": "Slice eggplant lengthwise into 4 strips. Slice horizontally into quarters. Set aside.",
            "ingredients": [
              {
                "id": 11209,
                "name": "eggplant",
                "localizedName": "eggplant",
                "image": "eggplant.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 3,
            "step": "In a pan over medium/high heat, add 2 tbsp oil, garlic, ginger, onions and half of the spring onions. Cook for 3 to 4 minutes, until onions are translucent.",
            "ingredients": [
              {
                "id": 11291,
                "name": "spring onions",
                "localizedName": "spring onions",
                "image": "spring-onions.jpg"
              },
              {
                "id": 11215,
                "name": "garlic",
                "localizedName": "garlic",
                "image": "garlic.png"
              },
              {
                "id": 11216,
                "name": "ginger",
                "localizedName": "ginger",
                "image": "ginger.png"
              },
              {
                "id": 11282,
                "name": "onion",
                "localizedName": "onion",
                "image": "brown-onion.png"
              },
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ],
            "length": {
              "number": 3,
              "unit": "minutes"
            }
          },
          {
            "number": 4,
            "step": "Add ground beef and season with a bit of salt & pepper. When the meat is cooked, add to-ban-jan and stir.",
            "ingredients": [
              {
                "id": 1102047,
                "name": "salt and pepper",
                "localizedName": "salt and pepper",
                "image": "salt-and-pepper.jpg"
              },
              {
                "id": 10023572,
                "name": "ground beef",
                "localizedName": "ground beef",
                "image": "fresh-ground-beef.jpg"
              },
              {
                "id": 1065062,
                "name": "meat",
                "localizedName": "meat",
                "image": "whole-chicken.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 5,
            "step": "Add sesame oil and eggplant and cook for 5 to 7 minutes, until the strips are soft and cooked through.",
            "ingredients": [
              {
                "id": 4058,
                "name": "sesame oil",
                "localizedName": "sesame oil",
                "image": "sesame-oil.png"
              },
              {
                "id": 11209,
                "name": "eggplant",
                "localizedName": "eggplant",
                "image": "eggplant.png"
              }
            ],
            "equipment": [],
            "length": {
              "number": 5,
              "unit": "minutes"
            }
          },
          {
            "number": 6,
            "step": "Add tofu and delicately break it up while mixing it in.",
            "ingredients": [
              {
                "id": 16213,
                "name": "tofu",
                "localizedName": "tofu",
                "image": "tofu.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 7,
            "step": "Add sake, sugar, water, 4 tbsp soy sauce, stir and cook for a couple of minutes.",
            "ingredients": [
              {
                "id": 16124,
                "name": "soy sauce",
                "localizedName": "soy sauce",
                "image": "soy-sauce.jpg"
              },
              {
                "id": 19335,
                "name": "sugar",
                "localizedName": "sugar",
                "image": "sugar-in-bowl.png"
              },
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              },
              {
                "id": 43479,
                "name": "sake",
                "localizedName": "sake",
                "image": "sake.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 8,
            "step": "Add the remaining 2 tbsp soy sauce and spring onions, stir and turn the heat off.",
            "ingredients": [
              {
                "id": 11291,
                "name": "spring onions",
                "localizedName": "spring onions",
                "image": "spring-onions.jpg"
              },
              {
                "id": 16124,
                "name": "soy sauce",
                "localizedName": "soy sauce",
                "image": "soy-sauce.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 9,
            "step": "Serve over rice.",
            "ingredients": [
              {
                "id": 20444,
                "name": "rice",
                "localizedName": "rice",
                "image": "uncooked-white-rice.png"
              }
            ],
            "equipment": []
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 52.659217834472656,
    "spoonacularSourceUrl": "https://spoonacular.com/japanese-mabo-tofu-with-eggplant-648479"
  },
  {
    "id": 648974,
    "image": "https://img.spoonacular.com/recipes/648974-556x370.jpg",
    "imageType": "jpg",
    "title": "Kk's Fish Tacos",
    "readyInMinutes": 45,
    "servings": 10,
    "sourceUrl": "https://www.foodista.com/recipe/2TTY2HPQ/kks-fish-tacos",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": false,
    "dairyFree": true,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 12,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 2,
    "healthScore": 36,
    "creditsText": "foodista.com",
    "license": null,
    "sourceName": "foodista.com",
    "pricePerServing": 454.32,
    "extendedIngredients": [
      {
        "id": 15261,
        "aisle": "Seafood",
        "image": "raw-tilapia.jpg",
        "consistency": "SOLID",
        "name": "tilapia",
        "nameClean": "tilapia",
        "original": "12 fillets Tilapia (frozen or fresh)",
        "originalName": "fillets Tilapia (frozen or fresh)",
        "amount": 12,
        "unit": "fillet",
        "meta": [
          "fresh",
          "()"
        ],
        "measures": {
          "us": {
            "amount": 12,
            "unitShort": "fillet",
            "unitLong": "fillets"
          },
          "metric": {
            "amount": 12,
            "unitShort": "fillet",
            "unitLong": "fillets"
          }
        }
      },
      {
        "id": 10218364,
        "aisle": "Pasta and Rice",
        "image": "flour-tortilla.jpg",
        "consistency": "SOLID",
        "name": "flour tortillas",
        "nameClean": "flour tortilla",
        "original": "20 smalls flour tortillas",
        "originalName": "s flour tortillas",
        "amount": 20,
        "unit": "small",
        "meta": [],
        "measures": {
          "us": {
            "amount": 20,
            "unitShort": "small",
            "unitLong": "smalls"
          },
          "metric": {
            "amount": 20,
            "unitShort": "small",
            "unitLong": "smalls"
          }
        }
      },
      {
        "id": 11165,
        "aisle": "Produce",
        "image": "cilantro.png",
        "consistency": "SOLID",
        "name": "cilantro",
        "nameClean": "cilantro",
        "original": "1 cup finely chopped cilantro",
        "originalName": "finely chopped cilantro",
        "amount": 1,
        "unit": "cup",
        "meta": [
          "finely chopped"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "cup",
            "unitLong": "cup"
          },
          "metric": {
            "amount": 16,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 9159,
        "aisle": "Produce",
        "image": "lime.jpg",
        "consistency": "SOLID",
        "name": "limes",
        "nameClean": "lime",
        "original": "4 limes, wedged",
        "originalName": "limes, wedged",
        "amount": 4,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 4,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 11252,
        "aisle": "Produce",
        "image": "iceberg-lettuce.jpg",
        "consistency": "SOLID",
        "name": "iceberg lettuce",
        "nameClean": "lettuce",
        "original": "1/2 head of iceberg lettuce, finely-chopped",
        "originalName": "iceberg lettuce, finely-chopped",
        "amount": 0.5,
        "unit": "head",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "head",
            "unitLong": "heads"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "head",
            "unitLong": "heads"
          }
        }
      },
      {
        "id": 11529,
        "aisle": "Produce",
        "image": "tomato.png",
        "consistency": "SOLID",
        "name": "tomatoes",
        "nameClean": "tomato",
        "original": "4 tomatoes, diced",
        "originalName": "tomatoes, diced",
        "amount": 4,
        "unit": "",
        "meta": [
          "diced"
        ],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 4,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 11282,
        "aisle": "Produce",
        "image": "brown-onion.png",
        "consistency": "SOLID",
        "name": "onion",
        "nameClean": "onion",
        "original": "1 medium-large onion, diced",
        "originalName": "large onion, diced",
        "amount": 1,
        "unit": "medium",
        "meta": [
          "diced"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "medium",
            "unitLong": "medium"
          },
          "metric": {
            "amount": 1,
            "unitShort": "medium",
            "unitLong": "medium"
          }
        }
      },
      {
        "id": 10028033,
        "aisle": "Bakery/Bread",
        "image": "italian-bread.jpg",
        "consistency": "SOLID",
        "name": "bread crumbs",
        "nameClean": "italian bread",
        "original": "2 cups Italian bread crumbs",
        "originalName": "Italian bread crumbs",
        "amount": 2,
        "unit": "cups",
        "meta": [
          "italian"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 56,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 1002031,
        "aisle": "Spices and Seasonings",
        "image": "chili-powder.jpg",
        "consistency": "SOLID",
        "name": "creole seasoning",
        "nameClean": "creole seasoning",
        "original": "seasoning salt or creole seasoning",
        "originalName": "seasoning salt or creole seasoning",
        "amount": 10,
        "unit": "servings",
        "meta": [],
        "measures": {
          "us": {
            "amount": 10,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 10,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 4669,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "vegetable-oil.jpg",
        "consistency": "LIQUID",
        "name": "lard",
        "nameClean": "vegetable oil",
        "original": "2 cups vegetable oil, olive oil, or lard (use to pan guacamole, salsa, and queso",
        "originalName": "vegetable oil, olive oil, or lard (use to pan guacamole, salsa, and queso",
        "amount": 2,
        "unit": "cups",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 436,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      }
    ],
    "summary": "You can never have too many main course recipes, so give Kk's Fish Tacos a try. This recipe serves 10. One portion of this dish contains roughly <b>48g of protein</b>, <b>20g of fat</b>, and a total of <b>520 calories</b>. For <b>$4.54 per serving</b>, this recipe <b>covers 31%</b> of your daily requirements of vitamins and minerals. It is brought to you by Foodista. This recipe is typical of Mexican cuisine. If you have lard, tomatoes, cilantro, and a few other ingredients on hand, you can make it. From preparation to the plate, this recipe takes about <b>45 minutes</b>. This recipe is liked by 2 foodies and cooks. It is a good option if you're following a <b>dairy free and pescatarian</b> diet. Overall, this recipe earns a <b>tremendous spoonacular score of 87%</b>. <a href=\"https://spoonacular.com/recipes/jack-crevalle-or-other-fish-fish-tacos-99001\">Jack Crevalle (Or Other Fish) Fish Tacos</a>, <a href=\"https://spoonacular.com/recipes/jack-crevalle-or-other-fish-fish-tacos-1238661\">Jack Crevalle (Or Other Fish) Fish Tacos</a>, and <a href=\"https://spoonacular.com/recipes/fish-tacos-543347\">Fish Tacos</a> are very similar to this recipe.",
    "cuisines": [
      "Mexican"
    ],
    "dishTypes": [
      "lunch",
      "main course",
      "main dish",
      "dinner"
    ],
    "diets": [
      "dairy free",
      "pescatarian"
    ],
    "occasions": [],
    "instructions": "In pie pan/deep dish add your Italian bread crumbs.\nIn large enough pan to fit at least two fillets at a time, add about 1 cup of oil and bring up to a sizzling temp. (after frying about half the fish, you may need to add more oil to the pan)\nIf frozen thaw your tilapia in lukewarm water, drain well.\nOnce oil is ready, take one of the fillets, thoroughly coat both sides with the bread crumbs.  Place in the oil and cook til each side is brown (~2-3 minutes/side).  Place on sheets of paper towel to drain away more of the oil.\nLightly season the top side of fish with you salt or creole seasoning.\nWhile frying up the rest of your fillets, chop up all of your accouterments.\nWhen everything is ready, microwave your tortillas for about 30 seconds on high, completely covered in paper towel or a clean dishtowel.\nMake a taco building buffet: add your fish, a little queso, your veggies, a pinch of cilantro, and then salsa and/or guac. Use the lime wedges to give your taco a little extra kick of citrus!",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "In pie pan/deep dish add your Italian bread crumbs.",
            "ingredients": [
              {
                "id": 10028033,
                "name": "italian bread",
                "localizedName": "italian bread",
                "image": "italian-bread.jpg"
              }
            ],
            "equipment": [
              {
                "id": 405915,
                "name": "pie form",
                "localizedName": "pie form",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pie-pan.png"
              }
            ]
          },
          {
            "number": 2,
            "step": "In large enough pan to fit at least two fillets at a time, add about 1 cup of oil and bring up to a sizzling temp. (after frying about half the fish, you may need to add more oil to the pan)",
            "ingredients": [
              {
                "id": 10115261,
                "name": "fish",
                "localizedName": "fish",
                "image": "fish-fillet.jpg"
              },
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ]
          },
          {
            "number": 3,
            "step": "If frozen thaw your tilapia in lukewarm water, drain well.",
            "ingredients": [
              {
                "id": 15261,
                "name": "tilapia",
                "localizedName": "tilapia",
                "image": "raw-tilapia.jpg"
              },
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 4,
            "step": "Once oil is ready, take one of the fillets, thoroughly coat both sides with the bread crumbs.",
            "ingredients": [
              {
                "id": 18079,
                "name": "breadcrumbs",
                "localizedName": "breadcrumbs",
                "image": "breadcrumbs.jpg"
              },
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 5,
            "step": "Place in the oil and cook til each side is brown (~2-3 minutes/side).",
            "ingredients": [
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              }
            ],
            "equipment": [],
            "length": {
              "number": 3,
              "unit": "minutes"
            }
          },
          {
            "number": 6,
            "step": "Place on sheets of paper towel to drain away more of the oil.",
            "ingredients": [
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              }
            ],
            "equipment": [
              {
                "id": 405895,
                "name": "paper towels",
                "localizedName": "paper towels",
                "image": "https://spoonacular.com/cdn/equipment_100x100/paper-towels.jpg"
              }
            ]
          },
          {
            "number": 7,
            "step": "Lightly season the top side of fish with you salt or creole seasoning.",
            "ingredients": [
              {
                "id": 1002031,
                "name": "creole seasoning",
                "localizedName": "creole seasoning",
                "image": "chili-powder.jpg"
              },
              {
                "id": 10115261,
                "name": "fish",
                "localizedName": "fish",
                "image": "fish-fillet.jpg"
              },
              {
                "id": 2047,
                "name": "salt",
                "localizedName": "salt",
                "image": "salt.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 8,
            "step": "While frying up the rest of your fillets, chop up all of your accouterments.",
            "ingredients": [],
            "equipment": []
          },
          {
            "number": 9,
            "step": "When everything is ready, microwave your tortillas for about 30 seconds on high, completely covered in paper towel or a clean dishtowel.",
            "ingredients": [
              {
                "id": 18364,
                "name": "tortilla",
                "localizedName": "tortilla",
                "image": "flour-tortilla.jpg"
              }
            ],
            "equipment": [
              {
                "id": 405895,
                "name": "paper towels",
                "localizedName": "paper towels",
                "image": "https://spoonacular.com/cdn/equipment_100x100/paper-towels.jpg"
              },
              {
                "id": 404762,
                "name": "microwave",
                "localizedName": "microwave",
                "image": "https://spoonacular.com/cdn/equipment_100x100/microwave.jpg"
              }
            ]
          },
          {
            "number": 10,
            "step": "Make a taco building buffet: add your fish, a little queso, your veggies, a pinch of cilantro, and then salsa and/or guac. Use the lime wedges to give your taco a little extra kick of citrus!",
            "ingredients": [
              {
                "id": 1029159,
                "name": "lime wedge",
                "localizedName": "lime wedge",
                "image": "lime-wedge.jpg"
              },
              {
                "id": 11165,
                "name": "cilantro",
                "localizedName": "cilantro",
                "image": "cilantro.png"
              },
              {
                "id": 6164,
                "name": "salsa",
                "localizedName": "salsa",
                "image": "salsa.png"
              },
              {
                "id": 10115261,
                "name": "fish",
                "localizedName": "fish",
                "image": "fish-fillet.jpg"
              }
            ],
            "equipment": []
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 80.63272094726562,
    "spoonacularSourceUrl": "https://spoonacular.com/kks-fish-tacos-648974"
  },
  {
    "id": 651190,
    "image": "https://img.spoonacular.com/recipes/651190-556x370.jpg",
    "imageType": "jpg",
    "title": "Masala-Tofu Burger",
    "readyInMinutes": 45,
    "servings": 4,
    "sourceUrl": "https://www.foodista.com/recipe/DGH6HX5S/masala-tofu-burger",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": false,
    "dairyFree": true,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 12,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 2,
    "healthScore": 40,
    "creditsText": "foodista.com",
    "license": null,
    "sourceName": "foodista.com",
    "pricePerServing": 355.9,
    "extendedIngredients": [
      {
        "id": 11282,
        "aisle": "Produce",
        "image": "brown-onion.png",
        "consistency": "SOLID",
        "name": "onion- shopping list",
        "nameClean": "onion",
        "original": "1 medium white onion- finely chopped shopping list",
        "originalName": "white onion- finely chopped shopping list",
        "amount": 1,
        "unit": "medium",
        "meta": [
          "white",
          "finely chopped"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "medium",
            "unitLong": "medium"
          },
          "metric": {
            "amount": 1,
            "unitShort": "medium",
            "unitLong": "medium"
          }
        }
      },
      {
        "id": 11821,
        "aisle": "Produce",
        "image": "red-pepper.jpg",
        "consistency": "SOLID",
        "name": "red/orange/green bell pepper- shopping list",
        "nameClean": "red pepper",
        "original": "1 red/orange/green bell pepper- finely diced shopping list",
        "originalName": "red/orange/green bell pepper- finely diced shopping list",
        "amount": 1,
        "unit": "",
        "meta": [
          "diced",
          "finely"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 11322,
        "aisle": "Frozen",
        "image": "peas-and-carrots.jpg",
        "consistency": "SOLID",
        "name": "peas-carrots mix shopping list",
        "nameClean": "peas and carrots",
        "original": "1 cup frozen peas-carrots mix (thawed) shopping list",
        "originalName": "frozen peas-carrots mix (thawed) shopping list",
        "amount": 1,
        "unit": "cup",
        "meta": [
          "frozen",
          "thawed",
          "()"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "cup",
            "unitLong": "cup"
          },
          "metric": {
            "amount": 140,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 11819,
        "aisle": "Produce",
        "image": "red-chili.jpg",
        "consistency": "SOLID",
        "name": "chillies shopping list",
        "nameClean": "chili pepper",
        "original": "4 small green chillies (not serrano) shopping list",
        "originalName": "green chillies (not serrano) shopping list",
        "amount": 4,
        "unit": "small",
        "meta": [
          "green",
          "(not serrano)"
        ],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "small",
            "unitLong": "smalls"
          },
          "metric": {
            "amount": 4,
            "unitShort": "small",
            "unitLong": "smalls"
          }
        }
      },
      {
        "id": 16213,
        "aisle": "Refrigerated",
        "image": "tofu.png",
        "consistency": "SOLID",
        "name": "tofu - shopping list",
        "nameClean": "tofu",
        "original": "3/4 cup firm cubed tofu (I used Nasoya Brand)- drained well shopping list",
        "originalName": "firm cubed tofu (I used Nasoya Brand)- drained well shopping list",
        "amount": 0.75,
        "unit": "cup",
        "meta": [
          "firm",
          "cubed",
          "drained",
          "well",
          "(I used Nasoya Brand)"
        ],
        "measures": {
          "us": {
            "amount": 0.75,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 186,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 11352,
        "aisle": "Produce",
        "image": "potatoes-yukon-gold.png",
        "consistency": "SOLID",
        "name": "potato- boils",
        "nameClean": "potato",
        "original": "1 medium potato- boils, peeled, diced shopping list",
        "originalName": "potato- boils, peeled, diced shopping list",
        "amount": 1,
        "unit": "medium",
        "meta": [
          "diced",
          "peeled"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "medium",
            "unitLong": "medium"
          },
          "metric": {
            "amount": 1,
            "unitShort": "medium",
            "unitLong": "medium"
          }
        }
      },
      {
        "id": 11215,
        "aisle": "Produce",
        "image": "garlic.png",
        "consistency": "SOLID",
        "name": "garlic- shopping list",
        "nameClean": "garlic",
        "original": "2 cloves garlic- minced shopping list",
        "originalName": "garlic- minced shopping list",
        "amount": 2,
        "unit": "cloves",
        "meta": [
          "minced"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "cloves",
            "unitLong": "cloves"
          },
          "metric": {
            "amount": 2,
            "unitShort": "cloves",
            "unitLong": "cloves"
          }
        }
      },
      {
        "id": 1012024,
        "aisle": "Spices and Seasonings",
        "image": "black-pepper.png",
        "consistency": "SOLID",
        "name": "mustard seeds shopping list",
        "nameClean": "black mustard seeds",
        "original": "1/2 tablespoon black mustard seeds shopping list",
        "originalName": "black mustard seeds shopping list",
        "amount": 0.5,
        "unit": "tablespoon",
        "meta": [
          "black"
        ],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 93604,
        "aisle": "Ethnic Foods",
        "image": "curry-leaves.jpg",
        "consistency": "SOLID",
        "name": "curry leaves shopping list",
        "nameClean": "curry leaves",
        "original": "5 curry leaves shopping list",
        "originalName": "curry leaves shopping list",
        "amount": 5,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 5,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 5,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 1032035,
        "aisle": "Spices and Seasonings",
        "image": "curry-powder.jpg",
        "consistency": "SOLID",
        "name": "hing shopping list",
        "nameClean": "asafoetida",
        "original": "pinch hing (Asafoetida optional) shopping list",
        "originalName": "pinch hing (Asafoetida optional) shopping list",
        "amount": 1,
        "unit": "pinch",
        "meta": [
          "(Asafoetida optional)"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "pinch",
            "unitLong": "pinch"
          },
          "metric": {
            "amount": 1,
            "unitShort": "pinch",
            "unitLong": "pinch"
          }
        }
      },
      {
        "id": 1012014,
        "aisle": "Spices and Seasonings",
        "image": "ground-cumin.jpg",
        "consistency": "SOLID",
        "name": "cumin powder shopping list",
        "nameClean": "ground cumin",
        "original": "1 teaspoon cumin powder shopping list",
        "originalName": "cumin powder shopping list",
        "amount": 1,
        "unit": "teaspoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          }
        }
      },
      {
        "id": 2043,
        "aisle": "Spices and Seasonings",
        "image": "turmeric.jpg",
        "consistency": "SOLID",
        "name": "turmeric shopping list",
        "nameClean": "turmeric",
        "original": "1 teaspoon turmeric shopping list",
        "originalName": "turmeric shopping list",
        "amount": 1,
        "unit": "teaspoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          }
        }
      },
      {
        "id": 9150,
        "aisle": "Produce",
        "image": "lemon.png",
        "consistency": "SOLID",
        "name": "lemon shopping list",
        "nameClean": "lemon",
        "original": "1 lemon shopping list",
        "originalName": "lemon shopping list",
        "amount": 1,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 2047,
        "aisle": "Spices and Seasonings",
        "image": "salt.jpg",
        "consistency": "SOLID",
        "name": "salt shopping list",
        "nameClean": "table salt",
        "original": "1 teaspoon salt (or to taste) shopping list",
        "originalName": "salt (or to taste) shopping list",
        "amount": 1,
        "unit": "teaspoon",
        "meta": [
          "to taste",
          "(or )"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          }
        }
      },
      {
        "id": 11165,
        "aisle": "Produce",
        "image": "cilantro.png",
        "consistency": "SOLID",
        "name": "cilantro- washed-finely shopping list",
        "nameClean": "cilantro",
        "original": "1/2 bunch cilantro- washed-finely chopped shopping list",
        "originalName": "cilantro- washed-finely chopped shopping list",
        "amount": 0.5,
        "unit": "bunch",
        "meta": [
          "chopped"
        ],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "bunch",
            "unitLong": "bunches"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "bunch",
            "unitLong": "bunches"
          }
        }
      },
      {
        "id": 18079,
        "aisle": "Pasta and Rice",
        "image": "breadcrumbs.jpg",
        "consistency": "SOLID",
        "name": "indian breadcrumbs shopping list",
        "nameClean": "breadcrumbs",
        "original": "3/4 cup Indian Breadcrumbs (recipe below) shopping list",
        "originalName": "Indian Breadcrumbs (recipe below) shopping list",
        "amount": 0.75,
        "unit": "cup",
        "meta": [
          "(recipe below)"
        ],
        "measures": {
          "us": {
            "amount": 0.75,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 81,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 4669,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "vegetable-oil.jpg",
        "consistency": "LIQUID",
        "name": "vegetable oil shopping list",
        "nameClean": "vegetable oil",
        "original": "1/2 tablespoon vegetable oil shopping list",
        "originalName": "vegetable oil shopping list",
        "amount": 0.5,
        "unit": "tablespoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 4679,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "cooking-spray.png",
        "consistency": "LIQUID",
        "name": "pam original flavor shopping list",
        "nameClean": "vegetable oil cooking spray",
        "original": "PAM original flavor shopping list",
        "originalName": "PAM original flavor shopping list",
        "amount": 4,
        "unit": "servings",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 10611282,
        "aisle": "Produce",
        "image": "white-onion.png",
        "consistency": "SOLID",
        "name": "red/white onion",
        "nameClean": "white onion",
        "original": "1 red/white onion- cut into thick slices shopping list",
        "originalName": "red/white onion- cut into thick slices shopping list",
        "amount": 1,
        "unit": "",
        "meta": [
          "thick",
          "cut into  slices shopping list"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 10011529,
        "aisle": "Produce",
        "image": "beefsteak-tomato.jpg",
        "consistency": "SOLID",
        "name": "beefsteak tomatoes",
        "nameClean": "beefsteak tomato",
        "original": "2 beefsteak tomatoes- cut into thick slices shopping list",
        "originalName": "beefsteak tomatoes- cut into thick slices shopping list",
        "amount": 2,
        "unit": "",
        "meta": [
          "thick",
          "cut into  slices shopping list"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 11165,
        "aisle": "Produce",
        "image": "cilantro.png",
        "consistency": "SOLID",
        "name": "cilantro shopping list",
        "nameClean": "cilantro",
        "original": "few sprigs of cilantro shopping list",
        "originalName": "few of cilantro shopping list",
        "amount": 3,
        "unit": "sprigs",
        "meta": [],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "sprigs",
            "unitLong": "sprigs"
          },
          "metric": {
            "amount": 3,
            "unitShort": "sprigs",
            "unitLong": "sprigs"
          }
        }
      },
      {
        "id": 98991,
        "aisle": "Condiments",
        "image": "mint-chutney.png",
        "consistency": "LIQUID",
        "name": "mint-cilantro chutney spread shopping list",
        "nameClean": "mint chutney",
        "original": "1/2 cup mint-cilantro chutney spread (recipe below) shopping list",
        "originalName": "mint-cilantro chutney spread (recipe below) shopping list",
        "amount": 0.5,
        "unit": "cup",
        "meta": [
          "(recipe below)"
        ],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 118.294,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 98940,
        "aisle": "Bakery/Bread",
        "image": "french-rolls.jpg",
        "consistency": "SOLID",
        "name": "portugese rolls",
        "nameClean": "sub bun",
        "original": "4 Portugese Rolls (Or anything you like)- toasted shopping list",
        "originalName": "Portugese Rolls (Or anything you like)- toasted shopping list",
        "amount": 4,
        "unit": "",
        "meta": [
          "or anything you like)- toasted shopping list"
        ],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 4,
            "unitShort": "",
            "unitLong": ""
          }
        }
      }
    ],
    "summary": "Forget going out to eat or ordering takeout every time you crave American food. Try making Masala-Tofu Burger at home. One serving contains <b>495 calories</b>, <b>19g of protein</b>, and <b>11g of fat</b>. This dairy free recipe serves 4 and costs <b>$3.56 per serving</b>. This recipe from Foodista requires lemon shopping list, salt shopping list, potato- boils, and cilantro- washed-finely shopping list. Not a lot of people really liked this main course. 2 people have tried and liked this recipe. From preparation to the plate, this recipe takes around <b>45 minutes</b>. With a spoonacular <b>score of 87%</b>, this dish is super. Similar recipes include <a href=\"https://spoonacular.com/recipes/masala-tofu-burger-1364501\">Masala-Tofu Burger</a>, <a href=\"https://spoonacular.com/recipes/veggie-masala-burger-patty-33366\">Veggie Masala Burger Patty</a>, and <a href=\"https://spoonacular.com/recipes/tofu-tikka-masala-1171919\">Tofu Tikka Masala</a>.",
    "cuisines": [
      "American"
    ],
    "dishTypes": [
      "lunch",
      "main course",
      "main dish",
      "dinner"
    ],
    "diets": [
      "dairy free"
    ],
    "occasions": [],
    "instructions": "In a large skillet over medium-high heat, add spray with a generous amount of PAM and add oil. Add mustard seeds and saute for 30 seconds-till you hear popping noises. Add curry leaves- BE CAREFUL, they pop hot oil! Add onions and peppers- sweat for about 30 seconds. Add chopped garlic, chilies and turmeric. Saute for about 5-7 minutes, until the onions and peppers are soft. Add peas and carrots mixture, cumin powder and salt. Saute for about 7-10 minutes- you want all the veggies to be soft and cooked through.\nMeanwhile in a small bowl, add the cubed tofu, a pinch of turmeric, cumin powder, coarse black pepper and some cayenne pepper (totally optional!). Mix and set aside to marinate for a bit.\nOnce the veggies are cooked, add the tofu- saute until slightly brown and soft enough that it crumbles. Add juice form half a lemon and half of the chopped cilantro. Mix and add the diced boiled potato, and toss until everything is coated, soft and taste for salt/spices. Using a masher, mash the mixture until mushy and until the veggies are small. Set aside to cool. Once cooled, add a bit of the breadcrumbs and mix with your hands. Start forming into thick patties (mixture should make 4). If its still giving you a hard time, add more breadcrumbs. Make 4 patties, place on a plate and wrap with plastic wrap until ready to use.\nIn a small skillet sprayed with PAM over medium-high heat, add one patty at a time. Cook for about 2 minutes on each side- until browned and crispy.At the same time, saute the thick slices of onion, until charred and slightly soft. Spread a generous amount of the chutney spread on each side on the bread, place burger, onions tomato and cilantro leaves. Serve with a slice of lemon and reduced-fat chips on the side.",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "In a large skillet over medium-high heat, add spray with a generous amount of PAM and add oil.",
            "ingredients": [
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              },
              {
                "id": 4679,
                "name": "cooking spray",
                "localizedName": "cooking spray",
                "image": "cooking-spray.png"
              }
            ],
            "equipment": [
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ]
          },
          {
            "number": 2,
            "step": "Add mustard seeds and saute for 30 seconds-till you hear popping noises.",
            "ingredients": [
              {
                "id": 2024,
                "name": "mustard seeds",
                "localizedName": "mustard seeds",
                "image": "mustard-seeds.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 3,
            "step": "Add curry leaves- BE CAREFUL, they pop hot oil!",
            "ingredients": [
              {
                "id": 93604,
                "name": "curry leaves",
                "localizedName": "curry leaves",
                "image": "curry-leaves.jpg"
              },
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              },
              {
                "id": 0,
                "name": "pop",
                "localizedName": "soft drink",
                "image": ""
              }
            ],
            "equipment": []
          },
          {
            "number": 4,
            "step": "Add onions and peppers- sweat for about 30 seconds.",
            "ingredients": [
              {
                "id": 10111333,
                "name": "peppers",
                "localizedName": "peppers",
                "image": "green-pepper.jpg"
              },
              {
                "id": 11282,
                "name": "onion",
                "localizedName": "onion",
                "image": "brown-onion.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 5,
            "step": "Add chopped garlic, chilies and turmeric.",
            "ingredients": [
              {
                "id": 2043,
                "name": "turmeric",
                "localizedName": "turmeric",
                "image": "turmeric.jpg"
              },
              {
                "id": 11819,
                "name": "chili pepper",
                "localizedName": "chili pepper",
                "image": "red-chili.jpg"
              },
              {
                "id": 11215,
                "name": "garlic",
                "localizedName": "garlic",
                "image": "garlic.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 6,
            "step": "Saute for about 5-7 minutes, until the onions and peppers are soft.",
            "ingredients": [
              {
                "id": 10111333,
                "name": "peppers",
                "localizedName": "peppers",
                "image": "green-pepper.jpg"
              },
              {
                "id": 11282,
                "name": "onion",
                "localizedName": "onion",
                "image": "brown-onion.png"
              }
            ],
            "equipment": [],
            "length": {
              "number": 7,
              "unit": "minutes"
            }
          },
          {
            "number": 7,
            "step": "Add peas and carrots mixture, cumin powder and salt.",
            "ingredients": [
              {
                "id": 11322,
                "name": "peas and carrots",
                "localizedName": "peas and carrots",
                "image": "peas-and-carrots.jpg"
              },
              {
                "id": 1012014,
                "name": "ground cumin",
                "localizedName": "ground cumin",
                "image": "ground-cumin.jpg"
              },
              {
                "id": 2047,
                "name": "salt",
                "localizedName": "salt",
                "image": "salt.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 8,
            "step": "Saute for about 7-10 minutes- you want all the veggies to be soft and cooked through.",
            "ingredients": [],
            "equipment": [],
            "length": {
              "number": 10,
              "unit": "minutes"
            }
          },
          {
            "number": 9,
            "step": "Meanwhile in a small bowl, add the cubed tofu, a pinch of turmeric, cumin powder, coarse black pepper and some cayenne pepper (totally optional!).",
            "ingredients": [
              {
                "id": 0,
                "name": "coarsely ground black pepper",
                "localizedName": "coarsely ground black pepper",
                "image": "pepper.jpg"
              },
              {
                "id": 2031,
                "name": "cayenne pepper",
                "localizedName": "cayenne pepper",
                "image": "chili-powder.jpg"
              },
              {
                "id": 1012014,
                "name": "ground cumin",
                "localizedName": "ground cumin",
                "image": "ground-cumin.jpg"
              },
              {
                "id": 2043,
                "name": "turmeric",
                "localizedName": "turmeric",
                "image": "turmeric.jpg"
              },
              {
                "id": 16213,
                "name": "tofu",
                "localizedName": "tofu",
                "image": "tofu.png"
              }
            ],
            "equipment": [
              {
                "id": 404783,
                "name": "bowl",
                "localizedName": "bowl",
                "image": "https://spoonacular.com/cdn/equipment_100x100/bowl.jpg"
              }
            ]
          },
          {
            "number": 10,
            "step": "Mix and set aside to marinate for a bit.",
            "ingredients": [],
            "equipment": []
          },
          {
            "number": 11,
            "step": "Once the veggies are cooked, add the tofu- saute until slightly brown and soft enough that it crumbles.",
            "ingredients": [
              {
                "id": 16213,
                "name": "tofu",
                "localizedName": "tofu",
                "image": "tofu.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 12,
            "step": "Add juice form half a lemon and half of the chopped cilantro.",
            "ingredients": [
              {
                "id": 11165,
                "name": "cilantro",
                "localizedName": "cilantro",
                "image": "cilantro.png"
              },
              {
                "id": 1019016,
                "name": "juice",
                "localizedName": "juice",
                "image": "apple-juice.jpg"
              },
              {
                "id": 9150,
                "name": "lemon",
                "localizedName": "lemon",
                "image": "lemon.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 13,
            "step": "Mix and add the diced boiled potato, and toss until everything is coated, soft and taste for salt/spices. Using a masher, mash the mixture until mushy and until the veggies are small. Set aside to cool. Once cooled, add a bit of the breadcrumbs and mix with your hands. Start forming into thick patties (mixture should make 4). If its still giving you a hard time, add more breadcrumbs. Make 4 patties, place on a plate and wrap with plastic wrap until ready to use.",
            "ingredients": [
              {
                "id": 18079,
                "name": "breadcrumbs",
                "localizedName": "breadcrumbs",
                "image": "breadcrumbs.jpg"
              },
              {
                "id": 11352,
                "name": "potato",
                "localizedName": "potato",
                "image": "potatoes-yukon-gold.png"
              },
              {
                "id": 2035,
                "name": "spices",
                "localizedName": "spices",
                "image": "spices.png"
              },
              {
                "id": 2047,
                "name": "salt",
                "localizedName": "salt",
                "image": "salt.jpg"
              },
              {
                "id": 10018364,
                "name": "wrap",
                "localizedName": "wrap",
                "image": "flour-tortilla.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404730,
                "name": "plastic wrap",
                "localizedName": "plastic wrap",
                "image": "https://spoonacular.com/cdn/equipment_100x100/plastic-wrap.jpg"
              }
            ]
          },
          {
            "number": 14,
            "step": "In a small skillet sprayed with PAM over medium-high heat, add one patty at a time. Cook for about 2 minutes on each side- until browned and crispy.At the same time, saute the thick slices of onion, until charred and slightly soft.",
            "ingredients": [
              {
                "id": 11282,
                "name": "onion",
                "localizedName": "onion",
                "image": "brown-onion.png"
              },
              {
                "id": 4679,
                "name": "cooking spray",
                "localizedName": "cooking spray",
                "image": "cooking-spray.png"
              }
            ],
            "equipment": [
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ],
            "length": {
              "number": 2,
              "unit": "minutes"
            }
          },
          {
            "number": 15,
            "step": "Spread a generous amount of the chutney spread on each side on the bread, place burger, onions tomato and cilantro leaves.",
            "ingredients": [
              {
                "id": 11165,
                "name": "fresh cilantro",
                "localizedName": "fresh cilantro",
                "image": "cilantro.png"
              },
              {
                "id": 0,
                "name": "chutney",
                "localizedName": "chutney",
                "image": ""
              },
              {
                "id": 11282,
                "name": "onion",
                "localizedName": "onion",
                "image": "brown-onion.png"
              },
              {
                "id": 0,
                "name": "spread",
                "localizedName": "spread",
                "image": ""
              },
              {
                "id": 11529,
                "name": "tomato",
                "localizedName": "tomato",
                "image": "tomato.png"
              },
              {
                "id": 18064,
                "name": "bread",
                "localizedName": "bread",
                "image": "white-bread.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 16,
            "step": "Serve with a slice of lemon and reduced-fat chips on the side.",
            "ingredients": [
              {
                "id": 11408,
                "name": "french fries",
                "localizedName": "french fries",
                "image": "french-fries-isolated.jpg"
              },
              {
                "id": 9150,
                "name": "lemon",
                "localizedName": "lemon",
                "image": "lemon.png"
              }
            ],
            "equipment": []
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 81.82567596435547,
    "spoonacularSourceUrl": "https://spoonacular.com/masala-tofu-burger-651190"
  },
  {
    "id": 656329,
    "image": "https://img.spoonacular.com/recipes/656329-556x370.jpg",
    "imageType": "jpg",
    "title": "Pizza bites with pumpkin",
    "readyInMinutes": 45,
    "servings": 4,
    "sourceUrl": "https://www.foodista.com/recipe/SHKG55X4/pizza-bites-with-pumpkin",
    "vegetarian": true,
    "vegan": false,
    "glutenFree": true,
    "dairyFree": false,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 9,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 9,
    "healthScore": 17,
    "creditsText": "Foodista.com – The Cooking Encyclopedia Everyone Can Edit",
    "license": "CC BY 3.0",
    "sourceName": "Foodista",
    "pricePerServing": 195.11,
    "extendedIngredients": [
      {
        "id": 11422,
        "aisle": "Produce",
        "image": "pumpkin.png",
        "consistency": "SOLID",
        "name": "pumpkin",
        "nameClean": "sugar pumpkin",
        "original": "600 g pumpkin, cleaned",
        "originalName": "pumpkin, cleaned",
        "amount": 600,
        "unit": "g",
        "meta": [
          "cleaned"
        ],
        "measures": {
          "us": {
            "amount": 1.323,
            "unitShort": "lb",
            "unitLong": "pounds"
          },
          "metric": {
            "amount": 600,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 4053,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "olive-oil.jpg",
        "consistency": "LIQUID",
        "name": "olive oil",
        "nameClean": "olive oil",
        "original": "2 Tbs olive oil",
        "originalName": "olive oil",
        "amount": 2,
        "unit": "Tbs",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbs",
            "unitLong": "Tbs"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbs",
            "unitLong": "Tbs"
          }
        }
      },
      {
        "id": 1019,
        "aisle": "Cheese",
        "image": "feta.png",
        "consistency": "SOLID",
        "name": "feta cheese",
        "nameClean": "feta cheese",
        "original": "120 g feta cheese, crumbled",
        "originalName": "feta cheese, crumbled",
        "amount": 120,
        "unit": "g",
        "meta": [
          "crumbled"
        ],
        "measures": {
          "us": {
            "amount": 4.233,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 120,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 1026,
        "aisle": "Cheese",
        "image": "mozzarella.png",
        "consistency": "SOLID",
        "name": "mozzarella",
        "nameClean": "mozzarella",
        "original": "120 g mozzarella, torn into small pieces",
        "originalName": "mozzarella, torn into small pieces",
        "amount": 120,
        "unit": "g",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4.233,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 120,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 1123,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "egg.png",
        "consistency": "SOLID",
        "name": "eggs",
        "nameClean": "egg",
        "original": "2 eggs",
        "originalName": "eggs",
        "amount": 2,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 2027,
        "aisle": "Spices and Seasonings",
        "image": "oregano.jpg",
        "consistency": "SOLID",
        "name": "oregano",
        "nameClean": "oregano",
        "original": "2 tsp dried oregano",
        "originalName": "dried oregano",
        "amount": 2,
        "unit": "tsp",
        "meta": [
          "dried"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 11297,
        "aisle": "Produce",
        "image": "parsley.jpg",
        "consistency": "SOLID",
        "name": "parsley",
        "nameClean": "parsley",
        "original": "4 Tbs parsley, chopped",
        "originalName": "parsley, chopped",
        "amount": 4,
        "unit": "Tbs",
        "meta": [
          "chopped"
        ],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "Tbs",
            "unitLong": "Tbs"
          },
          "metric": {
            "amount": 4,
            "unitShort": "Tbs",
            "unitLong": "Tbs"
          }
        }
      },
      {
        "id": 11215,
        "aisle": "Produce",
        "image": "garlic.png",
        "consistency": "SOLID",
        "name": "garlic",
        "nameClean": "garlic",
        "original": "4 cloves garlic, minced",
        "originalName": "garlic, minced",
        "amount": 4,
        "unit": "cloves",
        "meta": [
          "minced"
        ],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "cloves",
            "unitLong": "cloves"
          },
          "metric": {
            "amount": 4,
            "unitShort": "cloves",
            "unitLong": "cloves"
          }
        }
      }
    ],
    "summary": "Pizza bites with pumpkin might be just the hor d'oeuvre you are searching for. Watching your figure? This gluten free, lacto ovo vegetarian, and primal recipe has <b>309 calories</b>, <b>16g of protein</b>, and <b>22g of fat</b> per serving. This recipe serves 4 and costs $1.95 per serving. 9 people were glad they tried this recipe. Head to the store and pick up eggs, olive oil, mozzarella, and a few other things to make it today. From preparation to the plate, this recipe takes about <b>45 minutes</b>. It is an <b>affordable</b> recipe for fans of Mediterranean food. It is brought to you by Foodista. Taking all factors into account, this recipe <b>earns a spoonacular score of 67%</b>, which is solid. <a href=\"https://spoonacular.com/recipes/pizza-bites-89274\">Pizza Bites</a>, <a href=\"https://spoonacular.com/recipes/pizza-bites-568070\">Pizza Bites</a>, and <a href=\"https://spoonacular.com/recipes/pizza-bites-1765979\">Pizza Bites</a> are very similar to this recipe.",
    "cuisines": [
      "Mediterranean",
      "Italian",
      "European"
    ],
    "dishTypes": [
      "fingerfood",
      "antipasti",
      "starter",
      "snack",
      "appetizer",
      "antipasto",
      "hor d'oeuvre"
    ],
    "diets": [
      "gluten free",
      "lacto ovo vegetarian",
      "primal"
    ],
    "occasions": [],
    "instructions": "Chop pumpkin using a food processor until rice-like.\nSaut pumpkin in hot olive oil for 3 minutes. Set aside and let cool.\nMix feta and mozzarella; add, one at a time, eggs. Mix and combine.\nAdd pumpkin and spices, mix well until well blended.\nEvenly spoon the mixture into the greased muffin tin molds. Press pizza dough down evenly and firmly (the pressing down firmly is very important to make sure they stick together).\nPlace in the oven and bake for 30 minutes at 200C.\nRemove the pizza bites from the oven and let set until cool (this is also very important  let the pizza bites set in their pan for 5  10 minutes before removing  if you take them out while they are too hot they will break).",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Chop pumpkin using a food processor until rice-like.",
            "ingredients": [
              {
                "id": 11422,
                "name": "pumpkin",
                "localizedName": "pumpkin",
                "image": "pumpkin.png"
              },
              {
                "id": 20444,
                "name": "rice",
                "localizedName": "rice",
                "image": "uncooked-white-rice.png"
              }
            ],
            "equipment": [
              {
                "id": 404771,
                "name": "food processor",
                "localizedName": "food processor",
                "image": "https://spoonacular.com/cdn/equipment_100x100/food-processor.png"
              }
            ]
          },
          {
            "number": 2,
            "step": "Saut pumpkin in hot olive oil for 3 minutes. Set aside and let cool.",
            "ingredients": [
              {
                "id": 4053,
                "name": "olive oil",
                "localizedName": "olive oil",
                "image": "olive-oil.jpg"
              },
              {
                "id": 11422,
                "name": "pumpkin",
                "localizedName": "pumpkin",
                "image": "pumpkin.png"
              }
            ],
            "equipment": [],
            "length": {
              "number": 3,
              "unit": "minutes"
            }
          },
          {
            "number": 3,
            "step": "Mix feta and mozzarella; add, one at a time, eggs.",
            "ingredients": [
              {
                "id": 1026,
                "name": "mozzarella",
                "localizedName": "mozzarella",
                "image": "mozzarella.png"
              },
              {
                "id": 1123,
                "name": "egg",
                "localizedName": "egg",
                "image": "egg.png"
              },
              {
                "id": 1019,
                "name": "feta cheese",
                "localizedName": "feta cheese",
                "image": "feta.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 4,
            "step": "Mix and combine.",
            "ingredients": [],
            "equipment": []
          },
          {
            "number": 5,
            "step": "Add pumpkin and spices, mix well until well blended.",
            "ingredients": [
              {
                "id": 11422,
                "name": "pumpkin",
                "localizedName": "pumpkin",
                "image": "pumpkin.png"
              },
              {
                "id": 2035,
                "name": "spices",
                "localizedName": "spices",
                "image": "spices.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 6,
            "step": "Evenly spoon the mixture into the greased muffin tin molds. Press pizza dough down evenly and firmly (the pressing down firmly is very important to make sure they stick together).",
            "ingredients": [
              {
                "id": 93610,
                "name": "pizza dough",
                "localizedName": "pizza dough",
                "image": "pizza-dough.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404671,
                "name": "muffin tray",
                "localizedName": "muffin tray",
                "image": "https://spoonacular.com/cdn/equipment_100x100/muffin-tray.jpg"
              }
            ]
          },
          {
            "number": 7,
            "step": "Place in the oven and bake for 30 minutes at 200C.",
            "ingredients": [],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg",
                "temperature": {
                  "number": 200,
                  "unit": "Celsius"
                }
              }
            ],
            "length": {
              "number": 30,
              "unit": "minutes"
            }
          },
          {
            "number": 8,
            "step": "Remove the pizza bites from the oven and let set until cool (this is also very important  let the pizza bites set in their pan for 5  10 minutes before removing  if you take them out while they are too hot they will break).",
            "ingredients": [
              {
                "id": 0,
                "name": "pizza rolls",
                "localizedName": "pizza rolls",
                "image": ""
              }
            ],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              },
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ],
            "length": {
              "number": 10,
              "unit": "minutes"
            }
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 71.02586364746094,
    "spoonacularSourceUrl": "https://spoonacular.com/pizza-bites-with-pumpkin-656329"
  },
  {
    "id": 656723,
    "image": "https://img.spoonacular.com/recipes/656723-556x370.jpg",
    "imageType": "jpg",
    "title": "Pork Carnitas Tacos",
    "readyInMinutes": 45,
    "servings": 8,
    "sourceUrl": "https://www.foodista.com/recipe/76ZPMZJN/pork-carnitas-tacos",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": true,
    "dairyFree": false,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 11,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 3,
    "healthScore": 25,
    "creditsText": "foodista.com",
    "license": null,
    "sourceName": "foodista.com",
    "pricePerServing": 141.2,
    "extendedIngredients": [
      {
        "id": 14412,
        "aisle": "Beverages",
        "image": "water.png",
        "consistency": "LIQUID",
        "name": "water",
        "nameClean": "water",
        "original": "7 cups water",
        "originalName": "water",
        "amount": 7,
        "unit": "cups",
        "meta": [],
        "measures": {
          "us": {
            "amount": 7,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 1.656,
            "unitShort": "l",
            "unitLong": "liters"
          }
        }
      },
      {
        "id": 10084,
        "aisle": "Meat",
        "image": "boston-butt-or-pork-butt.png",
        "consistency": "SOLID",
        "name": "pork butt",
        "nameClean": "boston butt",
        "original": "2 pounds Pork butt trimmed, and cut in 2\" cubes",
        "originalName": "Pork butt trimmed, and cut in 2\" cubes",
        "amount": 2,
        "unit": "pounds",
        "meta": [
          "trimmed",
          "cut in 2\" cubes"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "lb",
            "unitLong": "pounds"
          },
          "metric": {
            "amount": 907.185,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 11215,
        "aisle": "Produce",
        "image": "garlic.png",
        "consistency": "SOLID",
        "name": "garlic",
        "nameClean": "garlic",
        "original": "4 cloves garlic, crushed",
        "originalName": "garlic, crushed",
        "amount": 4,
        "unit": "cloves",
        "meta": [
          "crushed"
        ],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "cloves",
            "unitLong": "cloves"
          },
          "metric": {
            "amount": 4,
            "unitShort": "cloves",
            "unitLong": "cloves"
          }
        }
      },
      {
        "id": 1012047,
        "aisle": "Spices and Seasonings",
        "image": "salt.jpg",
        "consistency": "SOLID",
        "name": "sea salt and ground pepper",
        "nameClean": "coarse sea salt",
        "original": "sea salt and ground pepper to taste",
        "originalName": "sea salt and ground pepper to taste",
        "amount": 8,
        "unit": "servings",
        "meta": [
          "to taste"
        ],
        "measures": {
          "us": {
            "amount": 8,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 8,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 4053,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "olive-oil.jpg",
        "consistency": "LIQUID",
        "name": "olive oil",
        "nameClean": "olive oil",
        "original": "1 teaspoon olive oil",
        "originalName": "olive oil",
        "amount": 1,
        "unit": "teaspoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          }
        }
      },
      {
        "id": 9206,
        "aisle": "Beverages",
        "image": "orange-juice.jpg",
        "consistency": "LIQUID",
        "name": "orange juice",
        "nameClean": "orange juice",
        "original": "1/2 cup orange juice",
        "originalName": "orange juice",
        "amount": 0.5,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 124,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 1077,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "milk.png",
        "consistency": "LIQUID",
        "name": "milk",
        "nameClean": "milk",
        "original": "1/2 cup milk",
        "originalName": "milk",
        "amount": 0.5,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 122,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 18363,
        "aisle": "Ethnic Foods",
        "image": "flour-tortilla.jpg",
        "consistency": "SOLID",
        "name": "corn tortillas",
        "nameClean": "white corn tortilla",
        "original": "24 Corn Tortillas",
        "originalName": "Corn Tortillas",
        "amount": 24,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 24,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 24,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 6164,
        "aisle": "Ethnic Foods",
        "image": "salsa.png",
        "consistency": "SOLID",
        "name": "salsa fresca",
        "nameClean": "salsa",
        "original": "Salsa Fresca",
        "originalName": "Salsa Fresca",
        "amount": 8,
        "unit": "servings",
        "meta": [],
        "measures": {
          "us": {
            "amount": 8,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 8,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 9037,
        "aisle": "Produce",
        "image": "avocado.jpg",
        "consistency": "SOLID",
        "name": "avocado",
        "nameClean": "avocado",
        "original": "Avocado slices",
        "originalName": "Avocado",
        "amount": 1,
        "unit": "slices",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "slice",
            "unitLong": "slice"
          },
          "metric": {
            "amount": 1,
            "unitShort": "slice",
            "unitLong": "slice"
          }
        }
      },
      {
        "id": 11165,
        "aisle": "Produce",
        "image": "cilantro.png",
        "consistency": "SOLID",
        "name": "cilantro",
        "nameClean": "cilantro",
        "original": "Chopped cilantro",
        "originalName": "Chopped cilantro",
        "amount": 8,
        "unit": "servings",
        "meta": [
          "chopped"
        ],
        "measures": {
          "us": {
            "amount": 8,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 8,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 11282,
        "aisle": "Produce",
        "image": "brown-onion.png",
        "consistency": "SOLID",
        "name": "onion",
        "nameClean": "onion",
        "original": "Chopped onion",
        "originalName": "Chopped onion",
        "amount": 8,
        "unit": "servings",
        "meta": [
          "chopped"
        ],
        "measures": {
          "us": {
            "amount": 8,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 8,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 9159,
        "aisle": "Produce",
        "image": "lime.jpg",
        "consistency": "SOLID",
        "name": "limes",
        "nameClean": "lime",
        "original": "Limes cut into wedges",
        "originalName": "Limes cut into wedges",
        "amount": 8,
        "unit": "servings",
        "meta": [
          "cut into wedges"
        ],
        "measures": {
          "us": {
            "amount": 8,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 8,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      }
    ],
    "summary": "You can never have too many main course recipes, so give Pork Carnitas Tacos a try. Watching your figure? This gluten free recipe has <b>405 calories</b>, <b>28g of protein</b>, and <b>13g of fat</b> per serving. This recipe serves 8 and costs $1.41 per serving. 3 people found this recipe to be tasty and satisfying. It is a <b>budget friendly</b> recipe for fans of Mexican food. This recipe from Foodista requires water, corn tortillas, onion, and limes. From preparation to the plate, this recipe takes roughly <b>45 minutes</b>. All things considered, we decided this recipe <b>deserves a spoonacular score of 68%</b>. This score is pretty good. Users who liked this recipe also liked <a href=\"https://spoonacular.com/recipes/pork-carnitas-tacos-1304341\">Pork Carnitas Tacos</a>, <a href=\"https://spoonacular.com/recipes/pork-carnitas-tacos-358708\">Pork Carnitas Tacos</a>, and <a href=\"https://spoonacular.com/recipes/pork-carnitas-tacos-1304327\">Pork Carnitas Tacos</a>.",
    "cuisines": [
      "Mexican"
    ],
    "dishTypes": [
      "lunch",
      "main course",
      "main dish",
      "dinner"
    ],
    "diets": [
      "gluten free"
    ],
    "occasions": [],
    "instructions": "In a large Dutch oven add the pork, garlic, salt and pepper, and water. Bring to a boil, then reduce heat, cover and simmer over medium low for 45 minutes to one hour. Drain well.\nWhen cool enough to handle, shred the meat by hand or with the tines of a fork. Remove and discard any remaining fat. Transfer back to Dutch oven and heat the olive oil. Add the orange juice and milk and cook until liquid has evaporated and pork has browned; stirring occasionally. Season with salt and pepper to taste.\n\n \nChop onions and cilantro, and slice avocado and limes. Place each in small individual bowls for serving. \n\nHeat tortillas in a dry frying pan and keep warm.\nFor each taco, stack 2 tortillas and layer with warm carnitas, chopped cilantro, onion and avocado slices and give it a good squeeze of lemon juice.",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "In a large Dutch oven add the pork, garlic, salt and pepper, and water. Bring to a boil, then reduce heat, cover and simmer over medium low for 45 minutes to one hour.",
            "ingredients": [
              {
                "id": 1102047,
                "name": "salt and pepper",
                "localizedName": "salt and pepper",
                "image": "salt-and-pepper.jpg"
              },
              {
                "id": 11215,
                "name": "garlic",
                "localizedName": "garlic",
                "image": "garlic.png"
              },
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              },
              {
                "id": 10010219,
                "name": "pork",
                "localizedName": "pork",
                "image": "pork-tenderloin-raw.png"
              }
            ],
            "equipment": [
              {
                "id": 404667,
                "name": "dutch oven",
                "localizedName": "dutch oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/dutch-oven.jpg"
              }
            ],
            "length": {
              "number": 105,
              "unit": "minutes"
            }
          },
          {
            "number": 2,
            "step": "Drain well.",
            "ingredients": [],
            "equipment": []
          },
          {
            "number": 3,
            "step": "When cool enough to handle, shred the meat by hand or with the tines of a fork.",
            "ingredients": [
              {
                "id": 1065062,
                "name": "meat",
                "localizedName": "meat",
                "image": "whole-chicken.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 4,
            "step": "Remove and discard any remaining fat.",
            "ingredients": [],
            "equipment": []
          },
          {
            "number": 5,
            "step": "Transfer back to Dutch oven and heat the olive oil.",
            "ingredients": [
              {
                "id": 4053,
                "name": "olive oil",
                "localizedName": "olive oil",
                "image": "olive-oil.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404667,
                "name": "dutch oven",
                "localizedName": "dutch oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/dutch-oven.jpg"
              }
            ]
          },
          {
            "number": 6,
            "step": "Add the orange juice and milk and cook until liquid has evaporated and pork has browned; stirring occasionally. Season with salt and pepper to taste.",
            "ingredients": [
              {
                "id": 1102047,
                "name": "salt and pepper",
                "localizedName": "salt and pepper",
                "image": "salt-and-pepper.jpg"
              },
              {
                "id": 9206,
                "name": "orange juice",
                "localizedName": "orange juice",
                "image": "orange-juice.jpg"
              },
              {
                "id": 1077,
                "name": "milk",
                "localizedName": "milk",
                "image": "milk.png"
              },
              {
                "id": 10010219,
                "name": "pork",
                "localizedName": "pork",
                "image": "pork-tenderloin-raw.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 7,
            "step": "Chop onions and cilantro, and slice avocado and limes.",
            "ingredients": [
              {
                "id": 11165,
                "name": "cilantro",
                "localizedName": "cilantro",
                "image": "cilantro.png"
              },
              {
                "id": 9037,
                "name": "avocado",
                "localizedName": "avocado",
                "image": "avocado.jpg"
              },
              {
                "id": 11282,
                "name": "onion",
                "localizedName": "onion",
                "image": "brown-onion.png"
              },
              {
                "id": 9159,
                "name": "lime",
                "localizedName": "lime",
                "image": "lime.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 8,
            "step": "Place each in small individual bowls for serving.",
            "ingredients": [],
            "equipment": [
              {
                "id": 404783,
                "name": "bowl",
                "localizedName": "bowl",
                "image": "https://spoonacular.com/cdn/equipment_100x100/bowl.jpg"
              }
            ]
          },
          {
            "number": 9,
            "step": "Heat tortillas in a dry frying pan and keep warm.",
            "ingredients": [
              {
                "id": 18364,
                "name": "tortilla",
                "localizedName": "tortilla",
                "image": "flour-tortilla.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ]
          },
          {
            "number": 10,
            "step": "For each taco, stack 2 tortillas and layer with warm carnitas, chopped cilantro, onion and avocado slices and give it a good squeeze of lemon juice.",
            "ingredients": [
              {
                "id": 1019037,
                "name": "avocado slices",
                "localizedName": "avocado slices",
                "image": "avocado-slices.jpg"
              },
              {
                "id": 9152,
                "name": "lemon juice",
                "localizedName": "lemon juice",
                "image": "lemon-juice.jpg"
              },
              {
                "id": 18364,
                "name": "tortilla",
                "localizedName": "tortilla",
                "image": "flour-tortilla.jpg"
              },
              {
                "id": 0,
                "name": "carnitas",
                "localizedName": "carnitas",
                "image": "https://spoonacular.com/cdn/ingredients_100x100/pulled-pork.png"
              },
              {
                "id": 11165,
                "name": "cilantro",
                "localizedName": "cilantro",
                "image": "cilantro.png"
              },
              {
                "id": 11282,
                "name": "onion",
                "localizedName": "onion",
                "image": "brown-onion.png"
              }
            ],
            "equipment": []
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 76.20347595214844,
    "spoonacularSourceUrl": "https://spoonacular.com/pork-carnitas-tacos-656723"
  },
  {
    "id": 658300,
    "image": "https://img.spoonacular.com/recipes/658300-556x370.jpg",
    "imageType": "jpg",
    "title": "Rich Jelly Scones",
    "readyInMinutes": 45,
    "servings": 4,
    "sourceUrl": "https://www.foodista.com/recipe/5GK2BSP6/rich-jelly-scones",
    "vegetarian": true,
    "vegan": false,
    "glutenFree": false,
    "dairyFree": false,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 22,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 2,
    "healthScore": 7,
    "creditsText": "Foodista.com – The Cooking Encyclopedia Everyone Can Edit",
    "license": "CC BY 3.0",
    "sourceName": "Foodista",
    "pricePerServing": 179.74,
    "extendedIngredients": [
      {
        "id": 20081,
        "aisle": "Baking",
        "image": "flour.png",
        "consistency": "SOLID",
        "name": "all purpose flour",
        "nameClean": "wheat flour",
        "original": "2 cups all purpose flour",
        "originalName": "all purpose flour",
        "amount": 2,
        "unit": "cups",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 250,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 10719335,
        "aisle": "Baking",
        "image": "sugar-in-bowl.png",
        "consistency": "SOLID",
        "name": "granulated sugar",
        "nameClean": "granulated sugar",
        "original": "1/4 cup granulated white sugar",
        "originalName": "granulated white sugar",
        "amount": 0.25,
        "unit": "cup",
        "meta": [
          "white"
        ],
        "measures": {
          "us": {
            "amount": 0.25,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 50,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 18369,
        "aisle": "Baking",
        "image": "white-powder.jpg",
        "consistency": "SOLID",
        "name": "baking powder",
        "nameClean": "baking powder",
        "original": "2 teaspoons baking powder",
        "originalName": "baking powder",
        "amount": 2,
        "unit": "teaspoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 18372,
        "aisle": "Baking",
        "image": "white-powder.jpg",
        "consistency": "SOLID",
        "name": "baking soda",
        "nameClean": "baking soda",
        "original": "1/4 teaspoon baking soda",
        "originalName": "baking soda",
        "amount": 0.25,
        "unit": "teaspoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.25,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.25,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 2047,
        "aisle": "Spices and Seasonings",
        "image": "salt.jpg",
        "consistency": "SOLID",
        "name": "salt",
        "nameClean": "table salt",
        "original": "1/4 teaspoon salt",
        "originalName": "salt",
        "amount": 0.25,
        "unit": "teaspoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.25,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.25,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 1145,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "butter-sliced.jpg",
        "consistency": "SOLID",
        "name": "butter",
        "nameClean": "unsalted butter",
        "original": "1/2 cup unsalted butter, very cold",
        "originalName": "unsalted butter, very cold",
        "amount": 0.5,
        "unit": "cup",
        "meta": [
          "unsalted",
          "very cold"
        ],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 113.5,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 1123,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "egg.png",
        "consistency": "SOLID",
        "name": "eggs",
        "nameClean": "egg",
        "original": "2 eggs",
        "originalName": "eggs",
        "amount": 2,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 1077,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "milk.png",
        "consistency": "LIQUID",
        "name": "milk",
        "nameClean": "milk",
        "original": "cup milk",
        "originalName": "milk",
        "amount": 1,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "cup",
            "unitLong": "cup"
          },
          "metric": {
            "amount": 244,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 2050,
        "aisle": "Baking",
        "image": "vanilla-extract.jpg",
        "consistency": "LIQUID",
        "name": "vanilla extract",
        "nameClean": "vanilla extract",
        "original": "1 1/2 teaspoons pure vanilla extract",
        "originalName": "pure vanilla extract",
        "amount": 1.5,
        "unit": "teaspoons",
        "meta": [
          "pure"
        ],
        "measures": {
          "us": {
            "amount": 1.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 1.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 9431,
        "aisle": "Produce",
        "image": "mixed-fresh-fruit.jpg",
        "consistency": "SOLID",
        "name": "fruit preserves",
        "nameClean": "mixed fruit",
        "original": "Thick jam or fruit preserves",
        "originalName": "Thick jam or fruit preserves",
        "amount": 4,
        "unit": "servings",
        "meta": [
          "thick"
        ],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 1123,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "egg.png",
        "consistency": "SOLID",
        "name": "egg",
        "nameClean": "egg",
        "original": "1 large egg, beaten well",
        "originalName": "egg, beaten well",
        "amount": 1,
        "unit": "large",
        "meta": [
          "beaten",
          "well"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "large",
            "unitLong": "large"
          },
          "metric": {
            "amount": 1,
            "unitShort": "large",
            "unitLong": "large"
          }
        }
      },
      {
        "id": 1077,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "milk.png",
        "consistency": "LIQUID",
        "name": "milk",
        "nameClean": "milk",
        "original": "1 tablespoon milk",
        "originalName": "milk",
        "amount": 1,
        "unit": "tablespoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      }
    ],
    "summary": "Need a <b>lacto ovo vegetarian breakfast</b>? Rich Jelly Scones could be an amazing recipe to try. This recipe serves 4. For <b>$1.8 per serving</b>, this recipe <b>covers 18%</b> of your daily requirements of vitamins and minerals. One serving contains <b>640 calories</b>, <b>14g of protein</b>, and <b>29g of fat</b>. Not a lot of people really liked this European dish. 2 people found this recipe to be tasty and satisfying. It is brought to you by Foodista. A mixture of salt, butter, baking powder, and a handful of other ingredients are all it takes to make this recipe so delicious. From preparation to the plate, this recipe takes approximately <b>45 minutes</b>. Overall, this recipe earns a <b>rather bad spoonacular score of 40%</b>. If you like this recipe, take a look at these similar recipes: <a href=\"https://spoonacular.com/recipes/rich-sour-cream-scones-from-1928-129655\">Rich Sour Cream Scones, from 1928</a>, <a href=\"https://spoonacular.com/recipes/currant-jelly-scones-414483\">Currant Jelly Scones</a>, and <a href=\"https://spoonacular.com/recipes/peanut-butter-and-jelly-scones-1051437\">Peanut Butter and Jelly Scones</a>.",
    "cuisines": [
      "English",
      "British",
      "Scottish",
      "European"
    ],
    "dishTypes": [
      "morning meal",
      "dessert",
      "brunch",
      "breakfast"
    ],
    "diets": [
      "lacto ovo vegetarian"
    ],
    "occasions": [],
    "instructions": "Pre-heat oven to 400 degrees.\nMix dry ingredients together.\nCut butter into the dry ingredients using a fork or hand-held pastry blender. When well blended, the mixture will have the look of crumbly sand.\nAdd the vanilla, eggs, and milk, mixing only long enough to blend the ingredients. *You do not want to begin to melt the butter into the flour mixture by over-mixing.\nTurn the dough onto a lightly floured counter top or pastry board. Shape it into a round disc 8 inches across, slightly thicker in the center.\nUsing a long knife, cut the dough into eight even pie-shaped portions.\nPlace scones on a lightly greased baking sheet. Using a spoon, press a well into the wide end of each triangle, and fill the well with a spoonful of fruit jam. Brush the exposed surface of each scone with the milk/egg mixture,\nBake for twenty-five minutes, until scones are a beautiful golden brown.",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Pre-heat oven to 400 degrees.",
            "ingredients": [],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              }
            ]
          },
          {
            "number": 2,
            "step": "Mix dry ingredients together.",
            "ingredients": [],
            "equipment": []
          },
          {
            "number": 3,
            "step": "Cut butter into the dry ingredients using a fork or hand-held pastry blender. When well blended, the mixture will have the look of crumbly sand.",
            "ingredients": [
              {
                "id": 1001,
                "name": "butter",
                "localizedName": "butter",
                "image": "butter-sliced.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404726,
                "name": "blender",
                "localizedName": "blender",
                "image": "https://spoonacular.com/cdn/equipment_100x100/blender.png"
              }
            ]
          },
          {
            "number": 4,
            "step": "Add the vanilla, eggs, and milk, mixing only long enough to blend the ingredients. *You do not want to begin to melt the butter into the flour mixture by over-mixing.",
            "ingredients": [
              {
                "id": 1052050,
                "name": "vanilla",
                "localizedName": "vanilla",
                "image": "vanilla.jpg"
              },
              {
                "id": 1001,
                "name": "butter",
                "localizedName": "butter",
                "image": "butter-sliced.jpg"
              },
              {
                "id": 20081,
                "name": "all purpose flour",
                "localizedName": "all purpose flour",
                "image": "flour.png"
              },
              {
                "id": 1123,
                "name": "egg",
                "localizedName": "egg",
                "image": "egg.png"
              },
              {
                "id": 1077,
                "name": "milk",
                "localizedName": "milk",
                "image": "milk.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 5,
            "step": "Turn the dough onto a lightly floured counter top or pastry board. Shape it into a round disc 8 inches across, slightly thicker in the center.",
            "ingredients": [
              {
                "id": 0,
                "name": "dough",
                "localizedName": "dough",
                "image": "pizza-dough"
              }
            ],
            "equipment": []
          },
          {
            "number": 6,
            "step": "Using a long knife, cut the dough into eight even pie-shaped portions.",
            "ingredients": [
              {
                "id": 0,
                "name": "dough",
                "localizedName": "dough",
                "image": "pizza-dough"
              }
            ],
            "equipment": [
              {
                "id": 404745,
                "name": "knife",
                "localizedName": "knife",
                "image": "https://spoonacular.com/cdn/equipment_100x100/chefs-knife.jpg"
              }
            ]
          },
          {
            "number": 7,
            "step": "Place scones on a lightly greased baking sheet. Using a spoon, press a well into the wide end of each triangle, and fill the well with a spoonful of fruit jam.",
            "ingredients": [
              {
                "id": 9431,
                "name": "fruit",
                "localizedName": "fruit",
                "image": "mixed-fresh-fruit.jpg"
              },
              {
                "id": 19297,
                "name": "jam",
                "localizedName": "jam",
                "image": "strawberry-jam.png"
              }
            ],
            "equipment": [
              {
                "id": 404727,
                "name": "baking sheet",
                "localizedName": "baking sheet",
                "image": "https://spoonacular.com/cdn/equipment_100x100/baking-sheet.jpg"
              }
            ]
          },
          {
            "number": 8,
            "step": "Brush the exposed surface of each scone with the milk/egg mixture,",
            "ingredients": [
              {
                "id": 1077,
                "name": "milk",
                "localizedName": "milk",
                "image": "milk.png"
              },
              {
                "id": 1123,
                "name": "egg",
                "localizedName": "egg",
                "image": "egg.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 9,
            "step": "Bake for twenty-five minutes, until scones are a beautiful golden brown.",
            "ingredients": [],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              }
            ]
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 10.116951942443848,
    "spoonacularSourceUrl": "https://spoonacular.com/rich-jelly-scones-658300"
  },
  {
    "id": 658644,
    "image": "https://img.spoonacular.com/recipes/658644-556x370.jpg",
    "imageType": "jpg",
    "title": "Roasted Red Pepper & Tomato Salsa",
    "readyInMinutes": 45,
    "servings": 8,
    "sourceUrl": "https://www.foodista.com/recipe/XRHPPSNB/roasted-red-pepper-tomato-salsa",
    "vegetarian": true,
    "vegan": true,
    "glutenFree": true,
    "dairyFree": true,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 1,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 2,
    "healthScore": 10,
    "creditsText": "Foodista.com – The Cooking Encyclopedia Everyone Can Edit",
    "license": "CC BY 3.0",
    "sourceName": "Foodista",
    "pricePerServing": 41.56,
    "extendedIngredients": [
      {
        "id": 11165,
        "aisle": "Produce",
        "image": "cilantro.png",
        "consistency": "SOLID",
        "name": "cilantro",
        "nameClean": "cilantro",
        "original": "Handful of fresh cilantro",
        "originalName": "fresh cilantro",
        "amount": 1,
        "unit": "Handful",
        "meta": [
          "fresh"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Handful",
            "unitLong": "Handful"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Handful",
            "unitLong": "Handful"
          }
        }
      },
      {
        "id": 1002014,
        "aisle": "Spices and Seasonings",
        "image": "ground-cumin.jpg",
        "consistency": "SOLID",
        "name": "cumin",
        "nameClean": "cumin",
        "original": "1/2 teaspoon cumin",
        "originalName": "cumin",
        "amount": 0.5,
        "unit": "teaspoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 11215,
        "aisle": "Produce",
        "image": "garlic.png",
        "consistency": "SOLID",
        "name": "garlic",
        "nameClean": "garlic",
        "original": "4 cloves garlic, chopped",
        "originalName": "garlic, chopped",
        "amount": 4,
        "unit": "cloves",
        "meta": [
          "chopped"
        ],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "cloves",
            "unitLong": "cloves"
          },
          "metric": {
            "amount": 4,
            "unitShort": "cloves",
            "unitLong": "cloves"
          }
        }
      },
      {
        "id": 11979,
        "aisle": "Ethnic Foods",
        "image": "jalapeno-pepper.png",
        "consistency": "SOLID",
        "name": "jalapeno pepper",
        "nameClean": "jalapeno pepper",
        "original": "1/2 habanero or jalapeno pepper",
        "originalName": "habanero or jalapeno pepper",
        "amount": 0.5,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 9160,
        "aisle": "Produce",
        "image": "lime-juice.png",
        "consistency": "LIQUID",
        "name": "juice of lime",
        "nameClean": "lime juice",
        "original": "1 Juice of lime",
        "originalName": "Juice of lime",
        "amount": 1,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 4053,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "olive-oil.jpg",
        "consistency": "LIQUID",
        "name": "olive oil",
        "nameClean": "olive oil",
        "original": "2 tablespoons olive oil",
        "originalName": "olive oil",
        "amount": 2,
        "unit": "tablespoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 11282,
        "aisle": "Produce",
        "image": "brown-onion.png",
        "consistency": "SOLID",
        "name": "onion",
        "nameClean": "onion",
        "original": "1/2 medium onion",
        "originalName": "onion",
        "amount": 0.5,
        "unit": "medium",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "medium",
            "unitLong": "mediums"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "medium",
            "unitLong": "mediums"
          }
        }
      },
      {
        "id": 11821,
        "aisle": "Produce",
        "image": "red-pepper.jpg",
        "consistency": "SOLID",
        "name": "bell pepper",
        "nameClean": "red pepper",
        "original": "1/2 red pepper",
        "originalName": "red pepper",
        "amount": 0.5,
        "unit": "",
        "meta": [
          "red"
        ],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 1012047,
        "aisle": "Spices and Seasonings",
        "image": "salt.jpg",
        "consistency": "SOLID",
        "name": "salt ** i used sea salt",
        "nameClean": "coarse sea salt",
        "original": "Salt (to taste)** I used smoked sea salt",
        "originalName": "Salt (to taste)** I used smoked sea salt",
        "amount": 8,
        "unit": "servings",
        "meta": [
          "smoked",
          "to taste"
        ],
        "measures": {
          "us": {
            "amount": 8,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 8,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 11529,
        "aisle": "Produce",
        "image": "tomato.png",
        "consistency": "SOLID",
        "name": "tomatoes",
        "nameClean": "tomato",
        "original": "5 medium tomatoes",
        "originalName": "tomatoes",
        "amount": 5,
        "unit": "medium",
        "meta": [],
        "measures": {
          "us": {
            "amount": 5,
            "unitShort": "medium",
            "unitLong": "mediums"
          },
          "metric": {
            "amount": 5,
            "unitShort": "medium",
            "unitLong": "mediums"
          }
        }
      }
    ],
    "summary": "Roasted Red Pepper & Tomato Salsan is a Mexican recipe that serves 8. This hor d'oeuvre has <b>53 calories</b>, <b>1g of protein</b>, and <b>4g of fat</b> per serving. For <b>42 cents per serving</b>, this recipe <b>covers 5%</b> of your daily requirements of vitamins and minerals. This recipe from Foodista has 2 fans. A mixture of cilantro, cumin, jalapeno pepper, and a handful of other ingredients are all it takes to make this recipe so scrumptious. From preparation to the plate, this recipe takes around <b>45 minutes</b>. It is a good option if you're following a <b>gluten free, dairy free, paleolithic, and lacto ovo vegetarian</b> diet. Taking all factors into account, this recipe <b>earns a spoonacular score of 52%</b>, which is pretty good. Similar recipes are <a href=\"https://spoonacular.com/recipes/roasted-red-pepper-tomato-salsa-1485983\">Roasted Red Pepper & Tomato Salsa</a>, <a href=\"https://spoonacular.com/recipes/roasted-red-pepper-salsa-22110\">Roasted Red Pepper Salsa</a>, and <a href=\"https://spoonacular.com/recipes/roasted-red-pepper-tomato-pizza-with-goat-cheese-basil-and-red-chili-oil-288260\">Roasted Red Pepper-Tomato Pizza with Goat Cheese, Basil and Red Chili Oil</a>.",
    "cuisines": [
      "Mexican"
    ],
    "dishTypes": [
      "antipasti",
      "condiment",
      "starter",
      "snack",
      "appetizer",
      "dip",
      "antipasto",
      "hor d'oeuvre",
      "spread"
    ],
    "diets": [
      "gluten free",
      "dairy free",
      "paleolithic",
      "lacto ovo vegetarian",
      "primal",
      "whole 30",
      "vegan"
    ],
    "occasions": [],
    "instructions": "<ol><li>Preheat oven to broil.</li><li>Cut tomatoes in half and onions in quarters and arrange on a tin-foil lined baking sheet.</li><li>Add the red pepper, garlic cloves (whole & with skin) and hot pepper.  Drizzle with a bit of olive oil & salt.</li><li>Broil for 10 min, until skin on tomatoes and pepper begins to char.</li><li>Cool for 5 min.</li><li>Remove tomato, pepper and garlic skins.</li><li>Throw all veggies (except cilantro & lime) into food processor.</li><li>Pulse 2-4 times (you want to leave it a bit chunky).</li><li>Toss in a bowl with cilantro and lime juice.</li><li>Add cumin and salt to taste.</li><li>Serve with corn chips or toasted pita chips.</li></ol>",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Preheat oven to broil.",
            "ingredients": [],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              }
            ]
          },
          {
            "number": 2,
            "step": "Cut tomatoes in half and onions in quarters and arrange on a tin-foil lined baking sheet.",
            "ingredients": [
              {
                "id": 11529,
                "name": "tomato",
                "localizedName": "tomato",
                "image": "tomato.png"
              },
              {
                "id": 11282,
                "name": "onion",
                "localizedName": "onion",
                "image": "brown-onion.png"
              }
            ],
            "equipment": [
              {
                "id": 404727,
                "name": "baking sheet",
                "localizedName": "baking sheet",
                "image": "https://spoonacular.com/cdn/equipment_100x100/baking-sheet.jpg"
              },
              {
                "id": 404765,
                "name": "aluminum foil",
                "localizedName": "aluminum foil",
                "image": "https://spoonacular.com/cdn/equipment_100x100/aluminum-foil.png"
              }
            ]
          },
          {
            "number": 3,
            "step": "Add the red pepper, garlic cloves (whole & with skin) and hot pepper.",
            "ingredients": [
              {
                "id": 10211215,
                "name": "whole garlic cloves",
                "localizedName": "whole garlic cloves",
                "image": "garlic.jpg"
              },
              {
                "id": 11819,
                "name": "chili pepper",
                "localizedName": "chili pepper",
                "image": "red-chili.jpg"
              },
              {
                "id": 11821,
                "name": "red pepper",
                "localizedName": "red pepper",
                "image": "red-pepper.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 4,
            "step": "Drizzle with a bit of olive oil & salt.Broil for 10 min, until skin on tomatoes and pepper begins to char.Cool for 5 min.",
            "ingredients": [
              {
                "id": 4053,
                "name": "olive oil",
                "localizedName": "olive oil",
                "image": "olive-oil.jpg"
              },
              {
                "id": 11529,
                "name": "tomato",
                "localizedName": "tomato",
                "image": "tomato.png"
              },
              {
                "id": 1002030,
                "name": "pepper",
                "localizedName": "pepper",
                "image": "pepper.jpg"
              },
              {
                "id": 2047,
                "name": "salt",
                "localizedName": "salt",
                "image": "salt.jpg"
              }
            ],
            "equipment": [],
            "length": {
              "number": 15,
              "unit": "minutes"
            }
          },
          {
            "number": 5,
            "step": "Remove tomato, pepper and garlic skins.Throw all veggies (except cilantro & lime) into food processor.Pulse 2-4 times (you want to leave it a bit chunky).Toss in a bowl with cilantro and lime juice.",
            "ingredients": [
              {
                "id": 9160,
                "name": "lime juice",
                "localizedName": "lime juice",
                "image": "lime-juice.png"
              },
              {
                "id": 11165,
                "name": "cilantro",
                "localizedName": "cilantro",
                "image": "cilantro.png"
              },
              {
                "id": 11215,
                "name": "garlic",
                "localizedName": "garlic",
                "image": "garlic.png"
              },
              {
                "id": 1002030,
                "name": "pepper",
                "localizedName": "pepper",
                "image": "pepper.jpg"
              },
              {
                "id": 11529,
                "name": "tomato",
                "localizedName": "tomato",
                "image": "tomato.png"
              },
              {
                "id": 9159,
                "name": "lime",
                "localizedName": "lime",
                "image": "lime.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404771,
                "name": "food processor",
                "localizedName": "food processor",
                "image": "https://spoonacular.com/cdn/equipment_100x100/food-processor.png"
              },
              {
                "id": 404783,
                "name": "bowl",
                "localizedName": "bowl",
                "image": "https://spoonacular.com/cdn/equipment_100x100/bowl.jpg"
              }
            ]
          },
          {
            "number": 6,
            "step": "Add cumin and salt to taste.",
            "ingredients": [
              {
                "id": 1002014,
                "name": "cumin",
                "localizedName": "cumin",
                "image": "ground-cumin.jpg"
              },
              {
                "id": 2047,
                "name": "salt",
                "localizedName": "salt",
                "image": "salt.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 7,
            "step": "Serve with corn chips or toasted pita chips.",
            "ingredients": [
              {
                "id": 19003,
                "name": "corn chips",
                "localizedName": "corn chips",
                "image": "fritos-or-corn-chips.jpg"
              },
              {
                "id": 25037,
                "name": "pita chips",
                "localizedName": "pita chips",
                "image": "pita-chips.jpg"
              }
            ],
            "equipment": []
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 56.51476287841797,
    "spoonacularSourceUrl": "https://spoonacular.com/roasted-red-pepper-tomato-salsa-658644"
  },
  {
    "id": 658753,
    "image": "https://img.spoonacular.com/recipes/658753-556x370.jpg",
    "imageType": "jpg",
    "title": "Roma Tomato Bruschetta",
    "readyInMinutes": 45,
    "servings": 4,
    "sourceUrl": "https://www.foodista.com/recipe/M3RH6LBH/roma-tomato-bruschetta",
    "vegetarian": true,
    "vegan": true,
    "glutenFree": false,
    "dairyFree": true,
    "veryHealthy": true,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 12,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 5,
    "healthScore": 61,
    "creditsText": "Foodista.com – The Cooking Encyclopedia Everyone Can Edit",
    "license": "CC BY 3.0",
    "sourceName": "Foodista",
    "pricePerServing": 189.3,
    "extendedIngredients": [
      {
        "id": 2069,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "balsamic-vinegar.jpg",
        "consistency": "LIQUID",
        "name": "balsamic vinegar",
        "nameClean": "balsamic vinegar",
        "original": "2 tablespoons balsamic vinegar",
        "originalName": "balsamic vinegar",
        "amount": 2,
        "unit": "tablespoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 1034053,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "olive-oil.jpg",
        "consistency": "LIQUID",
        "name": "extra virgin olive oil",
        "nameClean": "extra virgin olive oil",
        "original": "4 tablespoons extra virgin olive oil",
        "originalName": "extra virgin olive oil",
        "amount": 4,
        "unit": "tablespoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 4,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 18029,
        "aisle": "Bakery/Bread",
        "image": "crusty-bread.jpg",
        "consistency": "SOLID",
        "name": "bread",
        "nameClean": "french bread",
        "original": "1 loaf french bread",
        "originalName": "french bread",
        "amount": 1,
        "unit": "loaf",
        "meta": [
          "french"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "loaf",
            "unitLong": "loaf"
          },
          "metric": {
            "amount": 1,
            "unitShort": "loaf",
            "unitLong": "loaf"
          }
        }
      },
      {
        "id": 2044,
        "aisle": "Produce",
        "image": "fresh-basil.jpg",
        "consistency": "SOLID",
        "name": "basil",
        "nameClean": "fresh basil",
        "original": "10 leaves fresh basil",
        "originalName": "fresh basil",
        "amount": 10,
        "unit": "leaves",
        "meta": [
          "fresh"
        ],
        "measures": {
          "us": {
            "amount": 10,
            "unitShort": "leaf",
            "unitLong": "leaves"
          },
          "metric": {
            "amount": 10,
            "unitShort": "leaf",
            "unitLong": "leaves"
          }
        }
      },
      {
        "id": 11215,
        "aisle": "Produce",
        "image": "garlic.png",
        "consistency": "SOLID",
        "name": "garlic",
        "nameClean": "garlic",
        "original": "1 clove garlic, minced",
        "originalName": "garlic, minced",
        "amount": 1,
        "unit": "clove",
        "meta": [
          "minced"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "clove",
            "unitLong": "clove"
          },
          "metric": {
            "amount": 1,
            "unitShort": "clove",
            "unitLong": "clove"
          }
        }
      },
      {
        "id": 10211821,
        "aisle": "Produce",
        "image": "bell-pepper-orange.png",
        "consistency": "SOLID",
        "name": "bell pepper",
        "nameClean": "bell pepper",
        "original": "Pepper to taste",
        "originalName": "Pepper to taste",
        "amount": 4,
        "unit": "servings",
        "meta": [
          "to taste"
        ],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 2047,
        "aisle": "Spices and Seasonings",
        "image": "salt.jpg",
        "consistency": "SOLID",
        "name": "salt",
        "nameClean": "table salt",
        "original": "Salt to taste",
        "originalName": "Salt to taste",
        "amount": 4,
        "unit": "servings",
        "meta": [
          "to taste"
        ],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 4,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 11529,
        "aisle": "Produce",
        "image": "tomato.png",
        "consistency": "SOLID",
        "name": "tomatoes",
        "nameClean": "tomato",
        "original": "4 mediums tomatoes, roma",
        "originalName": "s tomatoes, roma",
        "amount": 4,
        "unit": "medium",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "medium",
            "unitLong": "mediums"
          },
          "metric": {
            "amount": 4,
            "unitShort": "medium",
            "unitLong": "mediums"
          }
        }
      }
    ],
    "summary": "Need a <b>dairy free, lacto ovo vegetarian, and vegan hor d'oeuvre</b>? Roma Tomato Bruschetta could be an outstanding recipe to try. One serving contains <b>446 calories</b>, <b>13g of protein</b>, and <b>17g of fat</b>. This recipe serves 4 and costs $1.89 per serving. If you have basil, extra virgin olive oil, bread, and a few other ingredients on hand, you can make it. 5 people have made this recipe and would make it again. It is an <b>affordable</b> recipe for fans of Mediterranean food. It is brought to you by Foodista. From preparation to the plate, this recipe takes about <b>45 minutes</b>. Overall, this recipe earns a <b>tremendous spoonacular score of 91%</b>. Try <a href=\"https://spoonacular.com/recipes/roma-tomato-rings-stuffed-with-cream-cheese-107091\">Roma Tomato Rings Stuffed With Cream Cheese</a>, <a href=\"https://spoonacular.com/recipes/tomato-bruschetta-367864\">Tomato Bruschetta</a>, and <a href=\"https://spoonacular.com/recipes/tomato-bruschetta-543381\">Tomato Bruschetta</a> for similar recipes.",
    "cuisines": [
      "Mediterranean",
      "Italian",
      "European"
    ],
    "dishTypes": [
      "fingerfood",
      "antipasti",
      "starter",
      "snack",
      "appetizer",
      "antipasto",
      "hor d'oeuvre"
    ],
    "diets": [
      "dairy free",
      "lacto ovo vegetarian",
      "vegan"
    ],
    "occasions": [],
    "instructions": "<ol><li>Slice the bread on a bias about 1/2 inch thick. We need about 10-12 slices.</li><li>Take 2 tablespoons of extra virgin olive oil and add salt and pepper (about 1/3 teaspoon each - as per taste).</li><li>Brush this on both sides of the bread.</li><li>Place these slices on a sheet pan and bake for about 3-4 minutes in a 400 degree preheated oven till golden brown. Once one side is done, turn over the crostini to the other side to crisp that as well.</li><li>When the crostini are hot out the oven, rub a garlic clove on them.</li><li>Chop the tomatoes.</li><li>Chiffonade the basil and add to the tomatoes.</li><li>Add salt, pepper, olive oil and balsamic vinegar and let it rest for a few minutes.</li><li>Put a generous amount of tomato on the crostini and serve.</li></ol>",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Slice the bread on a bias about 1/2 inch thick. We need about 10-12 slices.Take 2 tablespoons of extra virgin olive oil and add salt and pepper (about 1/3 teaspoon each - as per taste).",
            "ingredients": [
              {
                "id": 1034053,
                "name": "extra virgin olive oil",
                "localizedName": "extra virgin olive oil",
                "image": "olive-oil.jpg"
              },
              {
                "id": 1102047,
                "name": "salt and pepper",
                "localizedName": "salt and pepper",
                "image": "salt-and-pepper.jpg"
              },
              {
                "id": 18064,
                "name": "bread",
                "localizedName": "bread",
                "image": "white-bread.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 2,
            "step": "Brush this on both sides of the bread.",
            "ingredients": [
              {
                "id": 18064,
                "name": "bread",
                "localizedName": "bread",
                "image": "white-bread.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 3,
            "step": "Place these slices on a sheet pan and bake for about 3-4 minutes in a 400 degree preheated oven till golden brown. Once one side is done, turn over the crostini to the other side to crisp that as well.When the crostini are hot out the oven, rub a garlic clove on them.Chop the tomatoes.Chiffonade the basil and add to the tomatoes.",
            "ingredients": [
              {
                "id": 10211215,
                "name": "whole garlic cloves",
                "localizedName": "whole garlic cloves",
                "image": "garlic.jpg"
              },
              {
                "id": 10018033,
                "name": "crostini",
                "localizedName": "crostini",
                "image": "sliced-baguette-or-crostini.jpg"
              },
              {
                "id": 11529,
                "name": "tomato",
                "localizedName": "tomato",
                "image": "tomato.png"
              },
              {
                "id": 2044,
                "name": "basil",
                "localizedName": "basil",
                "image": "basil.jpg"
              },
              {
                "id": 1012034,
                "name": "dry seasoning rub",
                "localizedName": "dry seasoning rub",
                "image": "seasoning.png"
              }
            ],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              },
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ],
            "length": {
              "number": 4,
              "unit": "minutes"
            }
          },
          {
            "number": 4,
            "step": "Add salt, pepper, olive oil and balsamic vinegar and let it rest for a few minutes.Put a generous amount of tomato on the crostini and serve.",
            "ingredients": [
              {
                "id": 2069,
                "name": "balsamic vinegar",
                "localizedName": "balsamic vinegar",
                "image": "balsamic-vinegar.jpg"
              },
              {
                "id": 4053,
                "name": "olive oil",
                "localizedName": "olive oil",
                "image": "olive-oil.jpg"
              },
              {
                "id": 10018033,
                "name": "crostini",
                "localizedName": "crostini",
                "image": "sliced-baguette-or-crostini.jpg"
              },
              {
                "id": 1002030,
                "name": "pepper",
                "localizedName": "pepper",
                "image": "pepper.jpg"
              },
              {
                "id": 11529,
                "name": "tomato",
                "localizedName": "tomato",
                "image": "tomato.png"
              },
              {
                "id": 2047,
                "name": "salt",
                "localizedName": "salt",
                "image": "salt.jpg"
              }
            ],
            "equipment": []
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 92.56410217285156,
    "spoonacularSourceUrl": "https://spoonacular.com/roma-tomato-bruschetta-658753"
  },
  {
    "id": 658967,
    "image": "https://img.spoonacular.com/recipes/658967-556x370.jpg",
    "imageType": "jpg",
    "title": "Saffron Chicken Tikka",
    "readyInMinutes": 45,
    "servings": 3,
    "sourceUrl": "https://www.foodista.com/recipe/GV8J2V28/saffron-chicken-tikka",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": true,
    "dairyFree": false,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 2,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 34,
    "healthScore": 10,
    "creditsText": "foodista.com",
    "license": null,
    "sourceName": "foodista.com",
    "pricePerServing": 165.35,
    "extendedIngredients": [
      {
        "id": 5062,
        "aisle": "Meat",
        "image": "chicken-breasts.png",
        "consistency": "SOLID",
        "name": "chicken breasts",
        "nameClean": "chicken breast",
        "original": "350 grams Chicken Breasts (cubed approx. in 1 inch pieces)",
        "originalName": "Chicken Breasts (cubed approx. in 1 inch pieces)",
        "amount": 350,
        "unit": "grams",
        "meta": [
          "cubed",
          "( approx. in 1 inch pieces)"
        ],
        "measures": {
          "us": {
            "amount": 12.346,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 350,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 1002010,
        "aisle": "Spices and Seasonings",
        "image": "cinnamon.jpg",
        "consistency": "SOLID",
        "name": "cinnamon stick",
        "nameClean": "cinnamon stick",
        "original": "½ inch cinnamon stick",
        "originalName": "cinnamon stick",
        "amount": 0.5,
        "unit": "inch",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "inch",
            "unitLong": "inches"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "inch",
            "unitLong": "inches"
          }
        }
      },
      {
        "id": 93818,
        "aisle": "Savory Snacks",
        "image": "sunflower-seeds.jpg",
        "consistency": "SOLID",
        "name": "cardamom seeds",
        "nameClean": "seeds",
        "original": "1 black cardamom seeds (I used only half the amount of its seeds)",
        "originalName": "black cardamom seeds (I used only half the amount of its seeds)",
        "amount": 1,
        "unit": "",
        "meta": [
          "black",
          "(I used only half the amount of its seeds)"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 93818,
        "aisle": "Savory Snacks",
        "image": "sunflower-seeds.jpg",
        "consistency": "SOLID",
        "name": "cardamom seeds",
        "nameClean": "seeds",
        "original": "2 green cardamom seeds",
        "originalName": "green cardamom seeds",
        "amount": 2,
        "unit": "",
        "meta": [
          "green"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 1002011,
        "aisle": "Spices and Seasonings",
        "image": "cloves.jpg",
        "consistency": "SOLID",
        "name": "cloves",
        "nameClean": "clove",
        "original": "5 cloves",
        "originalName": "",
        "amount": 5,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 5,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 5,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 31015,
        "aisle": "Produce",
        "image": "chili-peppers-green.jpg",
        "consistency": "SOLID",
        "name": "chillies",
        "nameClean": "green chili pepper",
        "original": "2-3 green chillies",
        "originalName": "green chillies",
        "amount": 2,
        "unit": "",
        "meta": [
          "green"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 10111215,
        "aisle": "Produce",
        "image": "garlic-paste.png",
        "consistency": "SOLID",
        "name": "garlic paste",
        "nameClean": "garlic paste",
        "original": "½ tsp garlic paste",
        "originalName": "garlic paste",
        "amount": 0.5,
        "unit": "tsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 93754,
        "aisle": "Ethnic Foods",
        "image": "ginger-garlic-paste.png",
        "consistency": "SOLID",
        "name": "ginger paste",
        "nameClean": "ginger paste",
        "original": "½ tsp ginger paste",
        "originalName": "ginger paste",
        "amount": 0.5,
        "unit": "tsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 2032,
        "aisle": "Spices and Seasonings",
        "image": "white-pepper.png",
        "consistency": "SOLID",
        "name": "pepper corns",
        "nameClean": "white pepper",
        "original": "8-10 white pepper corns",
        "originalName": "white pepper corns",
        "amount": 8,
        "unit": "",
        "meta": [
          "white"
        ],
        "measures": {
          "us": {
            "amount": 8,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 8,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 2037,
        "aisle": "Spices and Seasonings",
        "image": "saffron.jpg",
        "consistency": "SOLID",
        "name": "saffron",
        "nameClean": "saffron",
        "original": "A pinch of saffron",
        "originalName": "saffron",
        "amount": 1,
        "unit": "pinch",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "pinch",
            "unitLong": "pinch"
          },
          "metric": {
            "amount": 1,
            "unitShort": "pinch",
            "unitLong": "pinch"
          }
        }
      },
      {
        "id": 1077,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "milk.png",
        "consistency": "LIQUID",
        "name": "milk",
        "nameClean": "milk",
        "original": "2 tsp milk",
        "originalName": "milk",
        "amount": 2,
        "unit": "tsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 2047,
        "aisle": "Spices and Seasonings",
        "image": "salt.jpg",
        "consistency": "SOLID",
        "name": "salt",
        "nameClean": "table salt",
        "original": "Salt to taste",
        "originalName": "Salt to taste",
        "amount": 3,
        "unit": "servings",
        "meta": [
          "to taste"
        ],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 3,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": -1,
        "aisle": "?",
        "image": null,
        "consistency": "SOLID",
        "name": "skewers",
        "nameClean": null,
        "original": "9-10 skewers",
        "originalName": "skewers",
        "amount": 9,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 9,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 9,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": -1,
        "aisle": "?",
        "image": null,
        "consistency": "SOLID",
        "name": "skewers",
        "nameClean": null,
        "original": "9-10 skewers",
        "originalName": "skewers",
        "amount": 9,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 9,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 9,
            "unitShort": "",
            "unitLong": ""
          }
        }
      }
    ],
    "summary": "Saffron Chicken Tikka could be just the <b>gluten free</b> recipe you've been looking for. This recipe serves 3. One portion of this dish contains about <b>25g of protein</b>, <b>4g of fat</b>, and a total of <b>160 calories</b>. For <b>$1.65 per serving</b>, this recipe <b>covers 14%</b> of your daily requirements of vitamins and minerals. A few people made this recipe, and 34 would say it hit the spot. It works well as a main course. It is brought to you by Foodista. This recipe is typical of Indian cuisine. A mixture of chicken breasts, salt, chillies, and a handful of other ingredients are all it takes to make this recipe so flavorful. From preparation to the plate, this recipe takes around <b>45 minutes</b>. All things considered, we decided this recipe <b>deserves a spoonacular score of 61%</b>. This score is solid. Users who liked this recipe also liked <a href=\"https://spoonacular.com/recipes/saffron-marinated-chicken-skewers-kesari-malai-tikka-198909\">Saffron-Marinated Chicken Skewers (Kesari Malai Tikka)</a>, <a href=\"https://spoonacular.com/recipes/chicken-tikka-how-to-make-chicken-tikka-in-oven-1200159\">chicken tikka , how to make chicken tikkan in oven</a>, and <a href=\"https://spoonacular.com/recipes/chicken-tikka-how-to-make-chicken-tikka-in-oven-1242313\">chicken tikka , how to make chicken tikkan in oven</a>.",
    "cuisines": [
      "Indian",
      "Asian"
    ],
    "dishTypes": [
      "lunch",
      "main course",
      "main dish",
      "dinner"
    ],
    "diets": [
      "gluten free"
    ],
    "occasions": [],
    "instructions": "Soak saffron in warm milk for 15 to 20 minutes.\nIn the meantime, dry roast the cinnamon stick, black cardamom seeds, green cardamom seeds, pepper corns and cloves. Pound them to a powder (not very fine).\nIn a mortar and pestle grind the green chillies to a paste. (Using a pinch of coarse salt will help)\nMix all the ingredients together and your marinade is ready.\nEnsure that you pat dry the chicken cubes.\nTransfer the chicken in a bowl\nAdd the marinade to the chicken cubes and mix it well so that all pieces are well coated.\nCover the bowl with a cling film and put it in the refrigerator.\nLeave the chicken to marinate over-night. (I marinated for almost 18 hours and the result was moist and tender chicken tikkas)\nFor Grilling:\nI grilled these tikkas in my non-stick grill pan. Using a non-stick pan helped me keep the amount of oil to minimal.\nSoak the skewers in water for at least half an hour before you intend to serve them.\nNow take the skewers and start skewering the chicken pieces on them. I leave a little space in between the chicken pieces; else they stick together and do not get cooked well. (Perhaps the reason could be pan grilling)\nKeep the skewers ready and then heat the pan (medium hot).\nYou can use an oil spray or pour a little oil using a spoon in a linear fashion across the grill pan.\nPlace the skewers over the oiled pan and grill them on medium low heat.\nIt will take approximately 45 seconds to a minute for one side to get cooked.\nThen turn around and cook the other side the same way.\nServe them hot as a starter or as a main course with Bakarkhani!! Bon apptit!!",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Soak saffron in warm milk for 15 to 20 minutes.",
            "ingredients": [
              {
                "id": 2037,
                "name": "saffron",
                "localizedName": "saffron",
                "image": "saffron.jpg"
              },
              {
                "id": 1077,
                "name": "milk",
                "localizedName": "milk",
                "image": "milk.png"
              }
            ],
            "equipment": [],
            "length": {
              "number": 15,
              "unit": "minutes"
            }
          },
          {
            "number": 2,
            "step": "In the meantime, dry roast the cinnamon stick, black cardamom seeds, green cardamom seeds, pepper corns and cloves. Pound them to a powder (not very fine).",
            "ingredients": [
              {
                "id": 0,
                "name": "cardamom seeds",
                "localizedName": "cardamom seeds",
                "image": "cardamom.jpg"
              },
              {
                "id": 1002010,
                "name": "cinnamon stick",
                "localizedName": "cinnamon stick",
                "image": "cinnamon.jpg"
              },
              {
                "id": 1002011,
                "name": "clove",
                "localizedName": "clove",
                "image": "cloves.jpg"
              },
              {
                "id": 1002030,
                "name": "pepper",
                "localizedName": "pepper",
                "image": "pepper.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 3,
            "step": "In a mortar and pestle grind the green chillies to a paste. (Using a pinch of coarse salt will help)",
            "ingredients": [
              {
                "id": 31015,
                "name": "green chili pepper",
                "localizedName": "green chili pepper",
                "image": "chili-peppers-green.jpg"
              },
              {
                "id": 1002047,
                "name": "coarse salt",
                "localizedName": "coarse salt",
                "image": "salt.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404751,
                "name": "mortar and pestle",
                "localizedName": "mortar and pestle",
                "image": "https://spoonacular.com/cdn/equipment_100x100/mortar-and-pestle.jpg"
              }
            ]
          },
          {
            "number": 4,
            "step": "Mix all the ingredients together and your marinade is ready.",
            "ingredients": [
              {
                "id": 0,
                "name": "marinade",
                "localizedName": "marinade",
                "image": "seasoning.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 5,
            "step": "Ensure that you pat dry the chicken cubes.",
            "ingredients": [
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 6,
            "step": "Transfer the chicken in a bowl",
            "ingredients": [
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404783,
                "name": "bowl",
                "localizedName": "bowl",
                "image": "https://spoonacular.com/cdn/equipment_100x100/bowl.jpg"
              }
            ]
          },
          {
            "number": 7,
            "step": "Add the marinade to the chicken cubes and mix it well so that all pieces are well coated.",
            "ingredients": [
              {
                "id": 0,
                "name": "marinade",
                "localizedName": "marinade",
                "image": "seasoning.png"
              },
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 8,
            "step": "Cover the bowl with a cling film and put it in the refrigerator.",
            "ingredients": [],
            "equipment": [
              {
                "id": 404783,
                "name": "bowl",
                "localizedName": "bowl",
                "image": "https://spoonacular.com/cdn/equipment_100x100/bowl.jpg"
              }
            ]
          },
          {
            "number": 9,
            "step": "Leave the chicken to marinate over-night. (I marinated for almost 18 hours and the result was moist and tender chicken tikkas)",
            "ingredients": [
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              }
            ],
            "equipment": [],
            "length": {
              "number": 1080,
              "unit": "minutes"
            }
          }
        ]
      },
      {
        "name": "For Grilling",
        "steps": [
          {
            "number": 1,
            "step": "I grilled these tikkas in my non-stick grill pan. Using a non-stick pan helped me keep the amount of oil to minimal.",
            "ingredients": [
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404648,
                "name": "grill pan",
                "localizedName": "grill pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/grill-pan.jpg"
              },
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ]
          },
          {
            "number": 2,
            "step": "Soak the skewers in water for at least half an hour before you intend to serve them.",
            "ingredients": [
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              }
            ],
            "equipment": [
              {
                "id": 3065,
                "name": "skewers",
                "localizedName": "skewers",
                "image": "https://spoonacular.com/cdn/equipment_100x100/wooden-skewers.jpg"
              }
            ]
          },
          {
            "number": 3,
            "step": "Now take the skewers and start skewering the chicken pieces on them. I leave a little space in between the chicken pieces; else they stick together and do not get cooked well. (Perhaps the reason could be pan grilling)",
            "ingredients": [
              {
                "id": 1005006,
                "name": "chicken pieces",
                "localizedName": "chicken pieces",
                "image": "chicken-parts.jpg"
              }
            ],
            "equipment": [
              {
                "id": 3065,
                "name": "skewers",
                "localizedName": "skewers",
                "image": "https://spoonacular.com/cdn/equipment_100x100/wooden-skewers.jpg"
              },
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ]
          },
          {
            "number": 4,
            "step": "Keep the skewers ready and then heat the pan (medium hot).",
            "ingredients": [],
            "equipment": [
              {
                "id": 3065,
                "name": "skewers",
                "localizedName": "skewers",
                "image": "https://spoonacular.com/cdn/equipment_100x100/wooden-skewers.jpg"
              },
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ]
          },
          {
            "number": 5,
            "step": "You can use an oil spray or pour a little oil using a spoon in a linear fashion across the grill pan.",
            "ingredients": [
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404648,
                "name": "grill pan",
                "localizedName": "grill pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/grill-pan.jpg"
              }
            ]
          },
          {
            "number": 6,
            "step": "Place the skewers over the oiled pan and grill them on medium low heat.",
            "ingredients": [],
            "equipment": [
              {
                "id": 3065,
                "name": "skewers",
                "localizedName": "skewers",
                "image": "https://spoonacular.com/cdn/equipment_100x100/wooden-skewers.jpg"
              },
              {
                "id": 404706,
                "name": "grill",
                "localizedName": "grill",
                "image": "https://spoonacular.com/cdn/equipment_100x100/grill.jpg"
              },
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ]
          },
          {
            "number": 7,
            "step": "It will take approximately 45 seconds to a minute for one side to get cooked.",
            "ingredients": [],
            "equipment": []
          },
          {
            "number": 8,
            "step": "Then turn around and cook the other side the same way.",
            "ingredients": [],
            "equipment": []
          },
          {
            "number": 9,
            "step": "Serve them hot as a starter or as a main course with Bakarkhani!! Bon apptit!!",
            "ingredients": [],
            "equipment": []
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 13.05275821685791,
    "spoonacularSourceUrl": "https://spoonacular.com/saffron-chicken-tikka-658967"
  },
  {
    "id": 659638,
    "image": "https://img.spoonacular.com/recipes/659638-556x370.",
    "imageType": "",
    "title": "Seafood Gumbo",
    "readyInMinutes": 45,
    "servings": 12,
    "sourceUrl": "https://www.foodista.com/recipe/XJJFHR6X/seafood-gumbo",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": false,
    "dairyFree": true,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 7,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 4,
    "healthScore": 30,
    "creditsText": "foodista.com",
    "license": null,
    "sourceName": "foodista.com",
    "pricePerServing": 487.48,
    "extendedIngredients": [
      {
        "id": 2004,
        "aisle": "Produce",
        "image": "bay-leaves.jpg",
        "consistency": "SOLID",
        "name": "bay leaves",
        "nameClean": "bay leaves",
        "original": "2 bay leaves",
        "originalName": "bay leaves",
        "amount": 2,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 11143,
        "aisle": "Produce",
        "image": "celery.jpg",
        "consistency": "SOLID",
        "name": "celery",
        "nameClean": "celery",
        "original": "3 ribs celery, finely diced",
        "originalName": "celery, finely diced",
        "amount": 3,
        "unit": "ribs",
        "meta": [
          "diced",
          "finely"
        ],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "ribs",
            "unitLong": "ribs"
          },
          "metric": {
            "amount": 3,
            "unitShort": "ribs",
            "unitLong": "ribs"
          }
        }
      },
      {
        "id": 10320445,
        "aisle": "Pasta and Rice",
        "image": "rice-white-long-grain-or-basmatii-cooked.jpg",
        "consistency": "SOLID",
        "name": "rice",
        "nameClean": "cooked long grain white rice",
        "original": "8 cups cooked long-grain white rice",
        "originalName": "cooked long-grain white rice",
        "amount": 8,
        "unit": "cups",
        "meta": [
          "long-grain",
          "white",
          "cooked"
        ],
        "measures": {
          "us": {
            "amount": 8,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 1.264,
            "unitShort": "kgs",
            "unitLong": "kgs"
          }
        }
      },
      {
        "id": 11311111,
        "aisle": "Ethnic Foods",
        "image": "hemp-protein-powder.png",
        "consistency": "SOLID",
        "name": "filé powder",
        "nameClean": "file powder",
        "original": "1 tablespoon filé powder",
        "originalName": "filé powder",
        "amount": 1,
        "unit": "tablespoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      },
      {
        "id": 6963,
        "aisle": "Canned and Jarred",
        "image": "chicken-broth.png",
        "consistency": "LIQUID",
        "name": "fish stock",
        "nameClean": "fish stock",
        "original": "4 quarts shrimp stock, crab stock or fish stock",
        "originalName": "shrimp stock, crab stock or fish stock",
        "amount": 4,
        "unit": "quarts",
        "meta": [],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "qts",
            "unitLong": "quarts"
          },
          "metric": {
            "amount": 3.785,
            "unitShort": "l",
            "unitLong": "liters"
          }
        }
      },
      {
        "id": 20081,
        "aisle": "Baking",
        "image": "flour.png",
        "consistency": "SOLID",
        "name": "flour",
        "nameClean": "wheat flour",
        "original": "1/2 cup flour",
        "originalName": "flour",
        "amount": 0.5,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 62.5,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 11215,
        "aisle": "Produce",
        "image": "garlic.png",
        "consistency": "SOLID",
        "name": "garlic",
        "nameClean": "garlic",
        "original": "6 cloves garlic, minced",
        "originalName": "garlic, minced",
        "amount": 6,
        "unit": "cloves",
        "meta": [
          "minced"
        ],
        "measures": {
          "us": {
            "amount": 6,
            "unitShort": "cloves",
            "unitLong": "cloves"
          },
          "metric": {
            "amount": 6,
            "unitShort": "cloves",
            "unitLong": "cloves"
          }
        }
      },
      {
        "id": 11333,
        "aisle": "Produce",
        "image": "green-pepper.jpg",
        "consistency": "SOLID",
        "name": "bell peppers",
        "nameClean": "green pepper",
        "original": "2 green bell peppers, diced",
        "originalName": "green bell peppers, diced",
        "amount": 2,
        "unit": "",
        "meta": [
          "diced",
          "green"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 10115136,
        "aisle": "Seafood",
        "image": "lump-crabmeat.png",
        "consistency": "SOLID",
        "name": "lump crab meat",
        "nameClean": "lump crabmeat",
        "original": "1 pound fresh lump crab meat, picked over for shells and cartilage",
        "originalName": "fresh lump crab meat, picked over for shells and cartilage",
        "amount": 1,
        "unit": "pound",
        "meta": [
          "fresh",
          "picked over",
          "for shells and cartilage"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "lb",
            "unitLong": "pound"
          },
          "metric": {
            "amount": 453.592,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 4582,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "vegetable-oil.jpg",
        "consistency": "LIQUID",
        "name": "oil",
        "nameClean": "cooking oil",
        "original": "1/2 cup oil",
        "originalName": "oil",
        "amount": 0.5,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 112,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 11278,
        "aisle": "Produce",
        "image": "okra.png",
        "consistency": "SOLID",
        "name": "okra",
        "nameClean": "okra",
        "original": "2 pounds okra, chopped",
        "originalName": "okra, chopped",
        "amount": 2,
        "unit": "pounds",
        "meta": [
          "chopped"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "lb",
            "unitLong": "pounds"
          },
          "metric": {
            "amount": 907.185,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 11282,
        "aisle": "Produce",
        "image": "brown-onion.png",
        "consistency": "SOLID",
        "name": "onions",
        "nameClean": "onion",
        "original": "2 medium onions, diced",
        "originalName": "onions, diced",
        "amount": 2,
        "unit": "medium",
        "meta": [
          "diced"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "medium",
            "unitLong": "mediums"
          },
          "metric": {
            "amount": 2,
            "unitShort": "medium",
            "unitLong": "mediums"
          }
        }
      },
      {
        "id": 15167,
        "aisle": "Seafood",
        "image": "oysters.jpg",
        "consistency": "SOLID",
        "name": "dozens oysters",
        "nameClean": "oysters",
        "original": "2 dozens oysters, freshly shucked, liquor reserved",
        "originalName": "dozens oysters, freshly shucked, liquor reserved",
        "amount": 2,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 1002030,
        "aisle": "Spices and Seasonings",
        "image": "pepper.jpg",
        "consistency": "SOLID",
        "name": "salt and pepper",
        "nameClean": "black pepper",
        "original": "Salt and freshly ground black pepper to taste",
        "originalName": "Salt and freshly ground black pepper to taste",
        "amount": 12,
        "unit": "servings",
        "meta": [
          "black",
          "freshly ground",
          "to taste"
        ],
        "measures": {
          "us": {
            "amount": 12,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 12,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 1002031,
        "aisle": "Spices and Seasonings",
        "image": "chili-powder.jpg",
        "consistency": "SOLID",
        "name": "creole seasoning blend",
        "nameClean": "creole seasoning",
        "original": "1 tablespoon Creole seasoning blend",
        "originalName": "Creole seasoning blend",
        "amount": 1,
        "unit": "tablespoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      },
      {
        "id": 15270,
        "aisle": "Seafood",
        "image": "shrimp.png",
        "consistency": "SOLID",
        "name": "shrimp",
        "nameClean": "shrimp",
        "original": "2 pounds medium shrimp, peeled and deveined",
        "originalName": "shrimp, peeled and deveined",
        "amount": 2,
        "unit": "pounds",
        "meta": [
          "deveined",
          "peeled"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "lb",
            "unitLong": "pounds"
          },
          "metric": {
            "amount": 907.185,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 2049,
        "aisle": "Produce",
        "image": "thyme.jpg",
        "consistency": "SOLID",
        "name": "thyme leaves",
        "nameClean": "thyme",
        "original": "1 teaspoon dried thyme leaves",
        "originalName": "dried thyme leaves",
        "amount": 1,
        "unit": "teaspoon",
        "meta": [
          "dried"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          }
        }
      },
      {
        "id": 11547,
        "aisle": "Canned and Jarred",
        "image": "tomato-paste.jpg",
        "consistency": "SOLID",
        "name": "tomato purée",
        "nameClean": "tomato puree",
        "original": "1 cup tomato purée",
        "originalName": "tomato purée",
        "amount": 1,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "cup",
            "unitLong": "cup"
          },
          "metric": {
            "amount": 262,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 11529,
        "aisle": "Produce",
        "image": "tomato.png",
        "consistency": "SOLID",
        "name": "tomatoes",
        "nameClean": "tomato",
        "original": "4 tomatoes, seeded and diced",
        "originalName": "tomatoes, seeded and diced",
        "amount": 4,
        "unit": "",
        "meta": [
          "diced",
          "seeded"
        ],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 4,
            "unitShort": "",
            "unitLong": ""
          }
        }
      }
    ],
    "summary": "Seafood Gumbo could be just the <b>dairy free and pescatarian</b> recipe you've been looking for. This recipe serves 12. This main course has <b>376 calories</b>, <b>35g of protein</b>, and <b>5g of fat</b> per serving. For <b>$4.87 per serving</b>, this recipe <b>covers 30%</b> of your daily requirements of vitamins and minerals. This recipe is liked by 4 foodies and cooks. From preparation to the plate, this recipe takes approximately <b>45 minutes</b>. This recipe is typical of Cajun cuisine. A mixture of salt and pepper, lump crab meat, flour, and a handful of other ingredients are all it takes to make this recipe so yummy. It is brought to you by Foodista. With a spoonacular <b>score of 80%</b>, this dish is solid. <a href=\"https://spoonacular.com/recipes/seafood-gumbo-1202205\">Seafood Gumbo</a>, <a href=\"https://spoonacular.com/recipes/seafood-gumbo-3129\">Seafood Gumbo</a>, and <a href=\"https://spoonacular.com/recipes/seafood-gumbo-1262935\">Seafood Gumbo</a> are very similar to this recipe.",
    "cuisines": [
      "Cajun",
      "Creole"
    ],
    "dishTypes": [
      "lunch",
      "soup",
      "main course",
      "main dish",
      "dinner"
    ],
    "diets": [
      "dairy free",
      "pescatarian"
    ],
    "occasions": [],
    "instructions": "<ol><li>Heat oil in a large heavy stockpot over medium-high heat.</li><li>Add the flour and stir constantly until a light brown roux is formed.</li><li>Add the onions, bell pepper, celery and garlic. Saut until the onions become translucent and the vegetables are tender.</li><li>Add the tomatoes and tomato pure and cook over medium heat for 10 minutes.</li><li>Add the Creole seasoning, thyme, bay leaves and about 1/2 teaspoon each of salt and pepper, and continue to cook another 10 minutes.</li><li>Add the okra, and cook for another 10 minutes, then add the stock. Bring to a boil, then reduce heat to simmer and cook another 30 minutes.</li><li>Reduce heat to low.</li><li>About 10 minutes prior to serving, add the shrimp, oysters and oyster liquor. Just prior to serving, add the crab meat (the crab meat does not need to be cooked, just stir until it is heated through.</li><li>Taste and correct seasonings if necessary.</li><li>Remove from heat and sprinkle the fil powder on the surface of the gumbo; cover and let stand for 15 minutes. Uncover and stir to mix.</li><li>Serve hot with French bread and cold beverages.</li></ol>",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Heat oil in a large heavy stockpot over medium-high heat.",
            "ingredients": [
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404752,
                "name": "pot",
                "localizedName": "pot",
                "image": "https://spoonacular.com/cdn/equipment_100x100/stock-pot.jpg"
              }
            ]
          },
          {
            "number": 2,
            "step": "Add the flour and stir constantly until a light brown roux is formed.",
            "ingredients": [
              {
                "id": 20081,
                "name": "all purpose flour",
                "localizedName": "all purpose flour",
                "image": "flour.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 3,
            "step": "Add the onions, bell pepper, celery and garlic. Saut until the onions become translucent and the vegetables are tender.",
            "ingredients": [
              {
                "id": 10211821,
                "name": "bell pepper",
                "localizedName": "bell pepper",
                "image": "bell-pepper-orange.png"
              },
              {
                "id": 11583,
                "name": "vegetable",
                "localizedName": "vegetable",
                "image": "mixed-vegetables.png"
              },
              {
                "id": 11143,
                "name": "celery",
                "localizedName": "celery",
                "image": "celery.jpg"
              },
              {
                "id": 11215,
                "name": "garlic",
                "localizedName": "garlic",
                "image": "garlic.png"
              },
              {
                "id": 11282,
                "name": "onion",
                "localizedName": "onion",
                "image": "brown-onion.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 4,
            "step": "Add the tomatoes and tomato pure and cook over medium heat for 10 minutes.",
            "ingredients": [
              {
                "id": 11529,
                "name": "tomato",
                "localizedName": "tomato",
                "image": "tomato.png"
              }
            ],
            "equipment": [],
            "length": {
              "number": 10,
              "unit": "minutes"
            }
          },
          {
            "number": 5,
            "step": "Add the Creole seasoning, thyme, bay leaves and about 1/2 teaspoon each of salt and pepper, and continue to cook another 10 minutes.",
            "ingredients": [
              {
                "id": 1002031,
                "name": "creole seasoning",
                "localizedName": "creole seasoning",
                "image": "chili-powder.jpg"
              },
              {
                "id": 1102047,
                "name": "salt and pepper",
                "localizedName": "salt and pepper",
                "image": "salt-and-pepper.jpg"
              },
              {
                "id": 2004,
                "name": "bay leaves",
                "localizedName": "bay leaves",
                "image": "bay-leaves.jpg"
              },
              {
                "id": 2049,
                "name": "thyme",
                "localizedName": "thyme",
                "image": "thyme.jpg"
              }
            ],
            "equipment": [],
            "length": {
              "number": 10,
              "unit": "minutes"
            }
          },
          {
            "number": 6,
            "step": "Add the okra, and cook for another 10 minutes, then add the stock. Bring to a boil, then reduce heat to simmer and cook another 30 minutes.Reduce heat to low.About 10 minutes prior to serving, add the shrimp, oysters and oyster liquor. Just prior to serving, add the crab meat (the crab meat does not need to be cooked, just stir until it is heated through.Taste and correct seasonings if necessary.",
            "ingredients": [
              {
                "id": 1042027,
                "name": "seasoning",
                "localizedName": "seasoning",
                "image": "seasoning.png"
              },
              {
                "id": 10015136,
                "name": "crabmeat",
                "localizedName": "crabmeat",
                "image": "crabmeat.jpg"
              },
              {
                "id": 15167,
                "name": "oysters",
                "localizedName": "oysters",
                "image": "oysters.jpg"
              },
              {
                "id": 10814037,
                "name": "liquor",
                "localizedName": "liquor",
                "image": "rum-dark.jpg"
              },
              {
                "id": 15270,
                "name": "shrimp",
                "localizedName": "shrimp",
                "image": "shrimp.png"
              },
              {
                "id": 1006615,
                "name": "stock",
                "localizedName": "stock",
                "image": "chicken-broth.png"
              },
              {
                "id": 11278,
                "name": "okra",
                "localizedName": "okra",
                "image": "okra.png"
              }
            ],
            "equipment": [],
            "length": {
              "number": 50,
              "unit": "minutes"
            }
          },
          {
            "number": 7,
            "step": "Remove from heat and sprinkle the fil powder on the surface of the gumbo; cover and let stand for 15 minutes. Uncover and stir to mix.",
            "ingredients": [
              {
                "id": 0,
                "name": "gumbo",
                "localizedName": "gumbo",
                "image": ""
              }
            ],
            "equipment": [],
            "length": {
              "number": 15,
              "unit": "minutes"
            }
          },
          {
            "number": 8,
            "step": "Serve hot with French bread and cold beverages.",
            "ingredients": [
              {
                "id": 18029,
                "name": "french bread",
                "localizedName": "french bread",
                "image": "crusty-bread.jpg"
              }
            ],
            "equipment": []
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 80.26966857910156,
    "spoonacularSourceUrl": "https://spoonacular.com/seafood-gumbo-659638"
  },
  {
    "id": 661602,
    "image": "https://img.spoonacular.com/recipes/661602-556x370.jpg",
    "imageType": "jpg",
    "title": "Sterling Cooper Blini with Caviar",
    "readyInMinutes": 45,
    "servings": 16,
    "sourceUrl": "https://www.foodista.com/recipe/FR7746PB/sterling-cooper-blini-with-caviar",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": false,
    "dairyFree": false,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 3,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 22,
    "healthScore": 0,
    "creditsText": "foodista.com",
    "license": null,
    "sourceName": "foodista.com",
    "pricePerServing": 25.02,
    "extendedIngredients": [
      {
        "id": 18369,
        "aisle": "Baking",
        "image": "white-powder.jpg",
        "consistency": "SOLID",
        "name": "baking powder",
        "nameClean": "baking powder",
        "original": "1/2 teaspoon baking powder",
        "originalName": "baking powder",
        "amount": 0.5,
        "unit": "teaspoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 1001,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "butter-sliced.jpg",
        "consistency": "SOLID",
        "name": "butter",
        "nameClean": "butter",
        "original": "1/2 cup butter",
        "originalName": "butter",
        "amount": 0.5,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 113.5,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 15012,
        "aisle": "Gourmet",
        "image": "caviar.png",
        "consistency": "SOLID",
        "name": "caviar",
        "nameClean": "caviar",
        "original": "Caviar, for topping",
        "originalName": "Caviar, for topping",
        "amount": 16,
        "unit": "servings",
        "meta": [
          "for topping"
        ],
        "measures": {
          "us": {
            "amount": 16,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 16,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 1123,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "egg.png",
        "consistency": "SOLID",
        "name": "egg",
        "nameClean": "egg",
        "original": "1 egg",
        "originalName": "egg",
        "amount": 1,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 20081,
        "aisle": "Baking",
        "image": "flour.png",
        "consistency": "SOLID",
        "name": "flour",
        "nameClean": "wheat flour",
        "original": "1/2 cup sifted all-purpose flour",
        "originalName": "sifted all-purpose flour",
        "amount": 0.5,
        "unit": "cup",
        "meta": [
          "all-purpose",
          "sifted"
        ],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 62.5,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 1077,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "milk.png",
        "consistency": "LIQUID",
        "name": "milk",
        "nameClean": "milk",
        "original": "¾ cup milk",
        "originalName": "milk",
        "amount": 0.75,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.75,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 183,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 1056,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "sour-cream.jpg",
        "consistency": "SOLID",
        "name": "cream",
        "nameClean": "sour cream",
        "original": "3 tablespoons sour cream, plus additional for topping blini",
        "originalName": "sour cream, plus additional for topping blini",
        "amount": 3,
        "unit": "tablespoons",
        "meta": [
          "sour",
          "for topping blini"
        ],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 3,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 19335,
        "aisle": "Baking",
        "image": "sugar-in-bowl.png",
        "consistency": "SOLID",
        "name": "sugar",
        "nameClean": "sugar",
        "original": "1/2 teaspoon sugar",
        "originalName": "sugar",
        "amount": 0.5,
        "unit": "teaspoon",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      }
    ],
    "summary": "Sterling Cooper Blini with Caviar could be just the <b>pescatarian</b> recipe you've been looking for. For <b>25 cents per serving</b>, you get a breakfast that serves 16. One serving contains <b>84 calories</b>, <b>1g of protein</b>, and <b>7g of fat</b>. It is brought to you by Foodista. If you have baking powder, milk, flour, and a few other ingredients on hand, you can make it. 22 people have made this recipe and would make it again. A few people really liked this Eastern European dish. From preparation to the plate, this recipe takes about <b>45 minutes</b>. Overall, this recipe earns a <b>not so great spoonacular score of 11%</b>. Similar recipes include <a href=\"https://spoonacular.com/recipes/sterling-cooper-sling-cocktail-493439\">Sterling Cooper Sling Cocktail</a>, <a href=\"https://spoonacular.com/recipes/vichyssoise-of-kumumoto-oysters-and-royal-sterling-caviar-354648\">Vichyssoise of Kumumoto Oysters and Royal Sterling Caviar</a>, and <a href=\"https://spoonacular.com/recipes/potato-blini-with-caviar-307024\">Potato Blini with Caviar</a>.",
    "cuisines": [
      "Eastern European",
      "European"
    ],
    "dishTypes": [
      "morning meal",
      "brunch",
      "breakfast"
    ],
    "diets": [
      "pescatarian"
    ],
    "occasions": [],
    "instructions": "<ol><li>In a large bowl, sift the flour and baking powder together. Add the milk, sugar and 2 tablespoons sour cream. Beat the egg until frothy, add to batter and stir well. Let batter stand for 20 minutes.</li><li>Melt butter on a griddle or large skillet.  Fry small (2-3 inch) pancakes in very hot butter. Drain on paper towels. Top each blini with sour cream and caviar before serving.</li></ol>",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "In a large bowl, sift the flour and baking powder together.",
            "ingredients": [
              {
                "id": 18369,
                "name": "baking powder",
                "localizedName": "baking powder",
                "image": "white-powder.jpg"
              },
              {
                "id": 20081,
                "name": "all purpose flour",
                "localizedName": "all purpose flour",
                "image": "flour.png"
              }
            ],
            "equipment": [
              {
                "id": 404783,
                "name": "bowl",
                "localizedName": "bowl",
                "image": "https://spoonacular.com/cdn/equipment_100x100/bowl.jpg"
              }
            ]
          },
          {
            "number": 2,
            "step": "Add the milk, sugar and 2 tablespoons sour cream. Beat the egg until frothy, add to batter and stir well.",
            "ingredients": [
              {
                "id": 1056,
                "name": "sour cream",
                "localizedName": "sour cream",
                "image": "sour-cream.jpg"
              },
              {
                "id": 19335,
                "name": "sugar",
                "localizedName": "sugar",
                "image": "sugar-in-bowl.png"
              },
              {
                "id": 1077,
                "name": "milk",
                "localizedName": "milk",
                "image": "milk.png"
              },
              {
                "id": 1123,
                "name": "egg",
                "localizedName": "egg",
                "image": "egg.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 3,
            "step": "Let batter stand for 20 minutes.Melt butter on a griddle or large skillet.  Fry small (2-3 inch) pancakes in very hot butter.",
            "ingredients": [
              {
                "id": 1001,
                "name": "butter",
                "localizedName": "butter",
                "image": "butter-sliced.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ],
            "length": {
              "number": 20,
              "unit": "minutes"
            }
          },
          {
            "number": 4,
            "step": "Drain on paper towels. Top each blini with sour cream and caviar before serving.",
            "ingredients": [
              {
                "id": 1056,
                "name": "sour cream",
                "localizedName": "sour cream",
                "image": "sour-cream.jpg"
              },
              {
                "id": 15012,
                "name": "caviar",
                "localizedName": "caviar",
                "image": "caviar.png"
              }
            ],
            "equipment": [
              {
                "id": 405895,
                "name": "paper towels",
                "localizedName": "paper towels",
                "image": "https://spoonacular.com/cdn/equipment_100x100/paper-towels.jpg"
              }
            ]
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 4.430635452270508,
    "spoonacularSourceUrl": "https://spoonacular.com/sterling-cooper-blini-with-caviar-661602"
  },
  {
    "id": 663824,
    "image": "https://img.spoonacular.com/recipes/663824-556x370.jpg",
    "imageType": "jpg",
    "title": "Trinidadian Chicken Potato Curry",
    "readyInMinutes": 150,
    "servings": 4,
    "sourceUrl": "https://www.foodista.com/recipe/DLRB38NQ/trinidadian-chicken-potato-curry",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": true,
    "dairyFree": true,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 17,
    "gaps": "no",
    "preparationMinutes": 120,
    "cookingMinutes": 30,
    "aggregateLikes": 11,
    "healthScore": 15,
    "creditsText": "foodista.com",
    "license": null,
    "sourceName": "foodista.com",
    "pricePerServing": 119.22,
    "extendedIngredients": [
      {
        "id": 1005091,
        "aisle": "Meat",
        "image": "chicken-thighs.png",
        "consistency": "SOLID",
        "name": "chicken thighs",
        "nameClean": "bone in skin on chicken thighs",
        "original": "2 lbs chicken thighs, bone in and skin on",
        "originalName": "chicken thighs, bone in and skin on",
        "amount": 2,
        "unit": "lbs",
        "meta": [
          "bone in"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "lb",
            "unitLong": "pounds"
          },
          "metric": {
            "amount": 771.107,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 10511282,
        "aisle": "Produce",
        "image": "brown-onion.png",
        "consistency": "SOLID",
        "name": "onion",
        "nameClean": "yellow onion",
        "original": "½ yellow onion, diced",
        "originalName": "yellow onion, diced",
        "amount": 0.5,
        "unit": "",
        "meta": [
          "diced",
          "yellow"
        ],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 10211215,
        "aisle": "Produce",
        "image": "garlic.jpg",
        "consistency": "SOLID",
        "name": "garlic cloves",
        "nameClean": "whole garlic cloves",
        "original": "3 garlic cloves, roughly chopped",
        "originalName": "garlic cloves, roughly chopped",
        "amount": 3,
        "unit": "",
        "meta": [
          "roughly chopped"
        ],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 3,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 1012049,
        "aisle": "Produce",
        "image": "thyme.jpg",
        "consistency": "SOLID",
        "name": "thyme",
        "nameClean": "fresh thyme",
        "original": "1 Tsp. fresh thyme",
        "originalName": "fresh thyme",
        "amount": 1,
        "unit": "Tsp",
        "meta": [
          "fresh"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          }
        }
      },
      {
        "id": 6168,
        "aisle": "Condiments",
        "image": "hot-sauce-or-tabasco.png",
        "consistency": "LIQUID",
        "name": "hot sauce",
        "nameClean": "hot sauce",
        "original": "1 Tsp. hot sauce",
        "originalName": "hot sauce",
        "amount": 1,
        "unit": "Tsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          }
        }
      },
      {
        "id": 2021,
        "aisle": "Spices and Seasonings",
        "image": "ginger.png",
        "consistency": "SOLID",
        "name": "powdered ginger",
        "nameClean": "ginger powder",
        "original": "¼ Tsp. powdered ginger",
        "originalName": "powdered ginger",
        "amount": 0.25,
        "unit": "Tsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.25,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.25,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 2015,
        "aisle": "Spices and Seasonings",
        "image": "curry-powder.jpg",
        "consistency": "SOLID",
        "name": "curry powder",
        "nameClean": "curry powder",
        "original": "¼ tsp. curry powder",
        "originalName": "curry powder",
        "amount": 0.25,
        "unit": "tsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.25,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.25,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 4047,
        "aisle": "Health Foods",
        "image": "oil-coconut.jpg",
        "consistency": "LIQUID",
        "name": "coconut oil",
        "nameClean": "coconut oil",
        "original": "1 Tsp. coconut oil",
        "originalName": "coconut oil",
        "amount": 1,
        "unit": "Tsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          }
        }
      },
      {
        "id": 11165,
        "aisle": "Produce",
        "image": "cilantro.png",
        "consistency": "SOLID",
        "name": "cilantro",
        "nameClean": "cilantro",
        "original": "1 Tsp. cilantro, finely chopped",
        "originalName": "cilantro, finely chopped",
        "amount": 1,
        "unit": "Tsp",
        "meta": [
          "finely chopped"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          }
        }
      },
      {
        "id": 11291,
        "aisle": "Produce",
        "image": "spring-onions.jpg",
        "consistency": "SOLID",
        "name": "scallion",
        "nameClean": "spring onions",
        "original": "1 scallion",
        "originalName": "scallion",
        "amount": 1,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 4669,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "vegetable-oil.jpg",
        "consistency": "LIQUID",
        "name": "vegetable oil",
        "nameClean": "vegetable oil",
        "original": "1 Tbsp. vegetable oil",
        "originalName": "vegetable oil",
        "amount": 1,
        "unit": "Tbsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      },
      {
        "id": 10511282,
        "aisle": "Produce",
        "image": "brown-onion.png",
        "consistency": "SOLID",
        "name": "onion",
        "nameClean": "yellow onion",
        "original": "½ yellow onion, sliced",
        "originalName": "yellow onion, sliced",
        "amount": 0.5,
        "unit": "",
        "meta": [
          "yellow",
          "sliced"
        ],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 10211215,
        "aisle": "Produce",
        "image": "garlic.jpg",
        "consistency": "SOLID",
        "name": "garlic cloves",
        "nameClean": "whole garlic cloves",
        "original": "3 garlic cloves, minced",
        "originalName": "garlic cloves, minced",
        "amount": 3,
        "unit": "",
        "meta": [
          "minced"
        ],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 3,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 2015,
        "aisle": "Spices and Seasonings",
        "image": "curry-powder.jpg",
        "consistency": "SOLID",
        "name": "curry powder",
        "nameClean": "curry powder",
        "original": "1 ½ Tbsp. curry powder",
        "originalName": "curry powder",
        "amount": 1.5,
        "unit": "Tbsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1.5,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 1.5,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 10293663,
        "aisle": "Spices and Seasonings",
        "image": "ground-cumin.jpg",
        "consistency": "SOLID",
        "name": "amchar masala",
        "nameClean": "amchar masala",
        "original": "1 Tsp. amchar masala",
        "originalName": "amchar masala",
        "amount": 1,
        "unit": "Tsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          }
        }
      },
      {
        "id": 1002014,
        "aisle": "Spices and Seasonings",
        "image": "ground-cumin.jpg",
        "consistency": "SOLID",
        "name": "cumin",
        "nameClean": "cumin",
        "original": "½ Tsp. cumin",
        "originalName": "cumin",
        "amount": 0.5,
        "unit": "Tsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 2047,
        "aisle": "Spices and Seasonings",
        "image": "salt.jpg",
        "consistency": "SOLID",
        "name": "salt",
        "nameClean": "table salt",
        "original": "½ Tsp. salt",
        "originalName": "salt",
        "amount": 0.5,
        "unit": "Tsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 14412,
        "aisle": "Beverages",
        "image": "water.png",
        "consistency": "LIQUID",
        "name": "water",
        "nameClean": "water",
        "original": "1 cup of water",
        "originalName": "water",
        "amount": 1,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "cup",
            "unitLong": "cup"
          },
          "metric": {
            "amount": 236.588,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 11352,
        "aisle": "Produce",
        "image": "potatoes-yukon-gold.png",
        "consistency": "SOLID",
        "name": "potatoes",
        "nameClean": "potato",
        "original": "2 potatoes, cut into large cubes",
        "originalName": "potatoes, cut into large cubes",
        "amount": 2,
        "unit": "",
        "meta": [
          "cut into large cubes"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          }
        }
      }
    ],
    "summary": "You can never have too many Indian recipes, so give Trinidadian Chicken Potato Curry a try. This gluten free, dairy free, and whole 30 recipe serves 4 and costs <b>$1.19 per serving</b>. This main course has <b>574 calories</b>, <b>35g of protein</b>, and <b>37g of fat</b> per serving. This recipe from Foodista requires salt, amchar masala, thyme, and vegetable oil. 11 person found this recipe to be scrumptious and satisfying. From preparation to the plate, this recipe takes around <b>2 hours and 30 minutes</b>. Taking all factors into account, this recipe <b>earns a spoonacular score of 71%</b>, which is pretty good. Users who liked this recipe also liked <a href=\"https://spoonacular.com/recipes/kofat-curry-meat-ball-curry-649000\">Kofat Curry/meat Ball Curry</a>, <a href=\"https://spoonacular.com/recipes/meatball-curry-kofta-curry-651337\">Meatball Curry (Kofta Curry)</a>, and <a href=\"https://spoonacular.com/recipes/channa-chickpea-potato-cauliflower-curry-637426\">Channa-Chickpea, Potato & Cauliflower Curry</a>.",
    "cuisines": [
      "Indian",
      "Asian"
    ],
    "dishTypes": [
      "lunch",
      "main course",
      "main dish",
      "dinner"
    ],
    "diets": [
      "gluten free",
      "dairy free",
      "whole 30"
    ],
    "occasions": [],
    "instructions": "<p>Wash and pat dry chicken thighs. In a sealable container, combine all marinade ingredients. Toss chicken in marinade, cover and refrigerate for at least 2 hours.</p><p>In a Dutch oven, heat vegetable oil over medium high heat. Add onions and saut until tender. Add garlic and continue to saut until fragrant.</p><p>Sprinkle onions and garlic with curry powder and stir to evenly coat. Add 1 tablespoon of water and cook for one minute, stirring constantly.</p><p>Add chicken and marinade. Saut until lightly browned, about 5 minutes.</p><p>If you want a thick curry add potatoes now, otherwise set aside.</p><p>Sprinkle chicken with amchar masala, cumin and salt. Toss to coat. Pour in one cup of water and bring to a boil.</p><p>Reduce heat, cover pot and simmer for 20 minutes. If you reserved the potatoes for a thinner curry, add them to the pot after twenty minutes.</p><p>Continue to simmer for an additional twenty minutes until chicken reaches an internal temperature of 165 F and potatoes are cooked through.</p><p>Serve warm with roti or rice.</p>",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Wash and pat dry chicken thighs. In a sealable container, combine all marinade ingredients. Toss chicken in marinade, cover and refrigerate for at least 2 hours.In a Dutch oven, heat vegetable oil over medium high heat.",
            "ingredients": [
              {
                "id": 5091,
                "name": "chicken thighs",
                "localizedName": "chicken thighs",
                "image": "chicken-thigh.jpg"
              },
              {
                "id": 4669,
                "name": "vegetable oil",
                "localizedName": "vegetable oil",
                "image": "vegetable-oil.jpg"
              },
              {
                "id": 0,
                "name": "marinade",
                "localizedName": "marinade",
                "image": "seasoning.png"
              },
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404667,
                "name": "dutch oven",
                "localizedName": "dutch oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/dutch-oven.jpg"
              }
            ],
            "length": {
              "number": 120,
              "unit": "minutes"
            }
          },
          {
            "number": 2,
            "step": "Add onions and saut until tender.",
            "ingredients": [
              {
                "id": 11282,
                "name": "onion",
                "localizedName": "onion",
                "image": "brown-onion.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 3,
            "step": "Add garlic and continue to saut until fragrant.",
            "ingredients": [
              {
                "id": 11215,
                "name": "garlic",
                "localizedName": "garlic",
                "image": "garlic.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 4,
            "step": "Sprinkle onions and garlic with curry powder and stir to evenly coat.",
            "ingredients": [
              {
                "id": 2015,
                "name": "curry powder",
                "localizedName": "curry powder",
                "image": "curry-powder.jpg"
              },
              {
                "id": 11215,
                "name": "garlic",
                "localizedName": "garlic",
                "image": "garlic.png"
              },
              {
                "id": 11282,
                "name": "onion",
                "localizedName": "onion",
                "image": "brown-onion.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 5,
            "step": "Add 1 tablespoon of water and cook for one minute, stirring constantly.",
            "ingredients": [
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              }
            ],
            "equipment": [],
            "length": {
              "number": 1,
              "unit": "minutes"
            }
          },
          {
            "number": 6,
            "step": "Add chicken and marinade. Saut until lightly browned, about 5 minutes.If you want a thick curry add potatoes now, otherwise set aside.",
            "ingredients": [
              {
                "id": 0,
                "name": "marinade",
                "localizedName": "marinade",
                "image": "seasoning.png"
              },
              {
                "id": 11352,
                "name": "potato",
                "localizedName": "potato",
                "image": "potatoes-yukon-gold.png"
              },
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              }
            ],
            "equipment": [],
            "length": {
              "number": 5,
              "unit": "minutes"
            }
          },
          {
            "number": 7,
            "step": "Sprinkle chicken with amchar masala, cumin and salt. Toss to coat.",
            "ingredients": [
              {
                "id": 10293663,
                "name": "amchar masala",
                "localizedName": "amchar masala",
                "image": "ground-cumin.jpg"
              },
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              },
              {
                "id": 1002014,
                "name": "cumin",
                "localizedName": "cumin",
                "image": "ground-cumin.jpg"
              },
              {
                "id": 2047,
                "name": "salt",
                "localizedName": "salt",
                "image": "salt.jpg"
              }
            ],
            "equipment": []
          },
          {
            "number": 8,
            "step": "Pour in one cup of water and bring to a boil.Reduce heat, cover pot and simmer for 20 minutes. If you reserved the potatoes for a thinner curry, add them to the pot after twenty minutes.Continue to simmer for an additional twenty minutes until chicken reaches an internal temperature of 165 F and potatoes are cooked through.",
            "ingredients": [
              {
                "id": 11352,
                "name": "potato",
                "localizedName": "potato",
                "image": "potatoes-yukon-gold.png"
              },
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              },
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              }
            ],
            "equipment": [
              {
                "id": 404752,
                "name": "pot",
                "localizedName": "pot",
                "image": "https://spoonacular.com/cdn/equipment_100x100/stock-pot.jpg"
              }
            ],
            "length": {
              "number": 60,
              "unit": "minutes"
            }
          },
          {
            "number": 9,
            "step": "Serve warm with roti or rice.",
            "ingredients": [
              {
                "id": 20444,
                "name": "rice",
                "localizedName": "rice",
                "image": "uncooked-white-rice.png"
              },
              {
                "id": 0,
                "name": "roti",
                "localizedName": "roti",
                "image": "pita-bread.jpg"
              }
            ],
            "equipment": []
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 10.115632057189941,
    "spoonacularSourceUrl": "https://spoonacular.com/trinidadian-chicken-potato-curry-663824"
  },
  {
    "id": 664284,
    "image": "https://img.spoonacular.com/recipes/664284-556x370.jpg",
    "imageType": "jpg",
    "title": "Vanilla and Lime Flan By Esperanza Platas Alvarez (Planet Food Mexico)",
    "readyInMinutes": 45,
    "servings": 8,
    "sourceUrl": "https://www.foodista.com/recipe/TMWCNMVR/vanilla-and-lime-flan-recipe-by-esperanza-platas-alvarez-planet-food-mexico",
    "vegetarian": true,
    "vegan": false,
    "glutenFree": true,
    "dairyFree": false,
    "veryHealthy": false,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 20,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 2,
    "healthScore": 3,
    "creditsText": "Foodista.com – The Cooking Encyclopedia Everyone Can Edit",
    "license": "CC BY 3.0",
    "sourceName": "Foodista",
    "pricePerServing": 143.38,
    "extendedIngredients": [
      {
        "id": 1095,
        "aisle": "Baking",
        "image": "evaporated-milk.png",
        "consistency": "SOLID",
        "name": "condensed milk",
        "nameClean": "sweetened condensed milk",
        "original": "2 cups of condensed milk",
        "originalName": "condensed milk",
        "amount": 2,
        "unit": "cups",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 612,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      },
      {
        "id": 1123,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "egg.png",
        "consistency": "SOLID",
        "name": "eggs",
        "nameClean": "egg",
        "original": "6 eggs",
        "originalName": "eggs",
        "amount": 6,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 6,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 6,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 9159,
        "aisle": "Produce",
        "image": "lime.jpg",
        "consistency": "SOLID",
        "name": "limes",
        "nameClean": "lime",
        "original": "3 limes",
        "originalName": "limes",
        "amount": 3,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 3,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 19335,
        "aisle": "Baking",
        "image": "sugar-in-bowl.png",
        "consistency": "SOLID",
        "name": "sugar",
        "nameClean": "sugar",
        "original": "3/4 cup sugar",
        "originalName": "sugar",
        "amount": 0.75,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.75,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 150,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 93622,
        "aisle": "Baking",
        "image": "vanilla.jpg",
        "consistency": "SOLID",
        "name": "vanilla pod",
        "nameClean": "vanilla bean",
        "original": "1 vanilla pod, sliced in half lengthwise",
        "originalName": "vanilla pod, sliced in half lengthwise",
        "amount": 1,
        "unit": "",
        "meta": [
          "sliced in half lengthwise"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 14412,
        "aisle": "Beverages",
        "image": "water.png",
        "consistency": "LIQUID",
        "name": "water",
        "nameClean": "water",
        "original": "3 tablespoons water",
        "originalName": "water",
        "amount": 3,
        "unit": "tablespoons",
        "meta": [],
        "measures": {
          "us": {
            "amount": 3,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 3,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      },
      {
        "id": 1011077,
        "aisle": "Milk, Eggs, Other Dairy",
        "image": "milk.png",
        "consistency": "LIQUID",
        "name": "milk",
        "nameClean": "whole milk",
        "original": "2 cups whole milk",
        "originalName": "whole milk",
        "amount": 2,
        "unit": "cups",
        "meta": [
          "whole"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 488,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      }
    ],
    "summary": "The recipe Vanillan and Lime Flan By Esperanza Platas Alvarez (Planet Food Mexico) is ready <b>in about 45 minutes</b> and is definitely a tremendous <b>gluten free and lacto ovo vegetarian</b> option for lovers of European food. This recipe serves 8 and costs $1.43 per serving. This dessert has <b>411 calories</b>, <b>12g of protein</b>, and <b>12g of fat</b> per serving. 2 people have tried and liked this recipe. If you have condensed milk, eggs, milk, and a few other ingredients on hand, you can make it. It is brought to you by Foodista. Overall, this recipe earns a <b>rather bad spoonacular score of 31%</b>. If you like this recipe, you might also like recipes such as <a href=\"https://spoonacular.com/recipes/flan-de-limn-lime-flan-226389\">Flan de Limón (Lime Flan)</a>, <a href=\"https://spoonacular.com/recipes/tomatillo-salsa-and-food-wine-festival-ixtapa-zihua-mexico-589825\">Tomatillo Salsan and Food & Wine Festival Ixtapa/Zihua, Mexico</a>, and <a href=\"https://spoonacular.com/recipes/mellow-mushroom-esperanza-dressing-114464\">Mellow Mushroom Esperanza Dressing</a>.",
    "cuisines": [
      "Spanish",
      "European"
    ],
    "dishTypes": [
      "dessert"
    ],
    "diets": [
      "gluten free",
      "lacto ovo vegetarian"
    ],
    "occasions": [],
    "instructions": "<ol><li>Preheat the oven to 360 degrees Fahrenheit.</li><li>To make the caramel, heat together the water and sugar gently over a medium flame for about 10 minutes, ensuring the mixture does not burn.</li><li>Meanwhile, pour the condensed milk and whole milk into a pan. Add the zest of the limes. Slice the vanilla pod in half and carefully scrape out the vanilla seeds and add these to your milk mixture.</li><li>Simmer the milk slowly for fifteen minutes to let the flavours infuse.</li><li>Once the caramel is ready, pour into a cake pan and swirl it around to evenly coat the bottom of the pan. Set aside.</li><li>In a bowl, crack the eggs and beat together. Slowly pour a little of the warm milk , vanilla and lime mixture into the eggs. This will temper the eggs and prevent them from scrambling from the heat. Once the temperature of the eggs has been raised by the warm milk, pour in the rest of the milk. Pour all of the mixture into the cake pan over the caramel.</li><li>Cook the cake pan in a water bath by placing the pan inside a larger pan which is filled half way with water. Place in the oven and cook for 45 minutes to an hour.</li><li>Once ready, allow to cool and place inside a fridge overnight. The flan is then ready to be flipped over gently and served.</li></ol>",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Preheat the oven to 360 degrees Fahrenheit.To make the caramel, heat together the water and sugar gently over a medium flame for about 10 minutes, ensuring the mixture does not burn.Meanwhile, pour the condensed milk and whole milk into a pan.",
            "ingredients": [
              {
                "id": 1095,
                "name": "sweetened condensed milk",
                "localizedName": "sweetened condensed milk",
                "image": "evaporated-milk.png"
              },
              {
                "id": 1011077,
                "name": "whole milk",
                "localizedName": "whole milk",
                "image": "milk.png"
              },
              {
                "id": 19074,
                "name": "caramel",
                "localizedName": "caramel",
                "image": "soft-caramels.jpg"
              },
              {
                "id": 19335,
                "name": "sugar",
                "localizedName": "sugar",
                "image": "sugar-in-bowl.png"
              },
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              }
            ],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg",
                "temperature": {
                  "number": 360,
                  "unit": "Fahrenheit"
                }
              },
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ],
            "length": {
              "number": 10,
              "unit": "minutes"
            }
          },
          {
            "number": 2,
            "step": "Add the zest of the limes. Slice the vanilla pod in half and carefully scrape out the vanilla seeds and add these to your milk mixture.Simmer the milk slowly for fifteen minutes to let the flavours infuse.Once the caramel is ready, pour into a cake pan and swirl it around to evenly coat the bottom of the pan. Set aside.In a bowl, crack the eggs and beat together. Slowly pour a little of the warm milk , vanilla and lime mixture into the eggs. This will temper the eggs and prevent them from scrambling from the heat. Once the temperature of the eggs has been raised by the warm milk, pour in the rest of the milk.",
            "ingredients": [
              {
                "id": 93622,
                "name": "vanilla bean",
                "localizedName": "vanilla bean",
                "image": "vanilla.jpg"
              },
              {
                "id": 19074,
                "name": "caramel",
                "localizedName": "caramel",
                "image": "soft-caramels.jpg"
              },
              {
                "id": 1052050,
                "name": "vanilla",
                "localizedName": "vanilla",
                "image": "vanilla.jpg"
              },
              {
                "id": 9159,
                "name": "lime",
                "localizedName": "lime",
                "image": "lime.jpg"
              },
              {
                "id": 93818,
                "name": "seeds",
                "localizedName": "seeds",
                "image": "sunflower-seeds.jpg"
              },
              {
                "id": 1123,
                "name": "egg",
                "localizedName": "egg",
                "image": "egg.png"
              },
              {
                "id": 1077,
                "name": "milk",
                "localizedName": "milk",
                "image": "milk.png"
              }
            ],
            "equipment": [
              {
                "id": 404747,
                "name": "cake form",
                "localizedName": "cake form",
                "image": "https://spoonacular.com/cdn/equipment_100x100/cake-pan.png"
              },
              {
                "id": 404783,
                "name": "bowl",
                "localizedName": "bowl",
                "image": "https://spoonacular.com/cdn/equipment_100x100/bowl.jpg"
              }
            ]
          },
          {
            "number": 3,
            "step": "Pour all of the mixture into the cake pan over the caramel.Cook the cake pan in a water bath by placing the pan inside a larger pan which is filled half way with water.",
            "ingredients": [
              {
                "id": 19074,
                "name": "caramel",
                "localizedName": "caramel",
                "image": "soft-caramels.jpg"
              },
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              }
            ],
            "equipment": [
              {
                "id": 404747,
                "name": "cake form",
                "localizedName": "cake form",
                "image": "https://spoonacular.com/cdn/equipment_100x100/cake-pan.png"
              }
            ]
          },
          {
            "number": 4,
            "step": "Place in the oven and cook for 45 minutes to an hour.Once ready, allow to cool and place inside a fridge overnight. The flan is then ready to be flipped over gently and served.",
            "ingredients": [],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              }
            ],
            "length": {
              "number": 45,
              "unit": "minutes"
            }
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 37.777008056640625,
    "spoonacularSourceUrl": "https://spoonacular.com/vanilla-and-lime-flan-by-esperanza-platas-alvarez-planet-food-mexico-664284"
  },
  {
    "id": 664680,
    "image": "https://img.spoonacular.com/recipes/664680-556x370.jpg",
    "imageType": "jpg",
    "title": "Vegetarian Mushroom Shepherd's Pie",
    "readyInMinutes": 45,
    "servings": 12,
    "sourceUrl": "https://www.foodista.com/recipe/Q8LZSX4D/vegetarian-mushroom-shepherd-s-pie-with-vegan-version",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": true,
    "dairyFree": true,
    "veryHealthy": true,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 3,
    "gaps": "no",
    "preparationMinutes": null,
    "cookingMinutes": null,
    "aggregateLikes": 11,
    "healthScore": 66,
    "creditsText": "Foodista.com – The Cooking Encyclopedia Everyone Can Edit",
    "license": "CC BY 3.0",
    "sourceName": "Foodista",
    "pricePerServing": 116.49,
    "extendedIngredients": [
      {
        "id": 10011355,
        "aisle": "Produce",
        "image": "red-potatoes.jpg",
        "consistency": "SOLID",
        "name": "skin potatoes",
        "nameClean": "red potato",
        "original": "1 kg red skin potatoes",
        "originalName": "red skin potatoes",
        "amount": 1,
        "unit": "kg",
        "meta": [
          "red"
        ],
        "measures": {
          "us": {
            "amount": 2.205,
            "unitShort": "lb",
            "unitLong": "pounds"
          },
          "metric": {
            "amount": 1,
            "unitShort": "kg",
            "unitLong": "kg"
          }
        }
      },
      {
        "id": 98965,
        "aisle": "Health Foods",
        "image": "soy-lecithin.png",
        "consistency": "SOLID",
        "name": "soy granules",
        "nameClean": "soy lecithin granules",
        "original": "100g soy granules",
        "originalName": "soy granules",
        "amount": 100,
        "unit": "g",
        "meta": [],
        "measures": {
          "us": {
            "amount": 3.527,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 100,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 11260,
        "aisle": "Produce",
        "image": "mushrooms.png",
        "consistency": "SOLID",
        "name": "mushrooms",
        "nameClean": "fresh mushrooms",
        "original": "1 kg mushrooms",
        "originalName": "mushrooms",
        "amount": 1,
        "unit": "kg",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2.205,
            "unitShort": "lb",
            "unitLong": "pounds"
          },
          "metric": {
            "amount": 1,
            "unitShort": "kg",
            "unitLong": "kg"
          }
        }
      },
      {
        "id": 11124,
        "aisle": "Produce",
        "image": "sliced-carrot.png",
        "consistency": "SOLID",
        "name": "carrot",
        "nameClean": "carrot",
        "original": "1 carrot",
        "originalName": "carrot",
        "amount": 1,
        "unit": "",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 11821,
        "aisle": "Produce",
        "image": "red-pepper.jpg",
        "consistency": "SOLID",
        "name": "bell pepper",
        "nameClean": "red pepper",
        "original": "1 red bell pepper",
        "originalName": "red bell pepper",
        "amount": 1,
        "unit": "",
        "meta": [
          "red"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 11282,
        "aisle": "Produce",
        "image": "brown-onion.png",
        "consistency": "SOLID",
        "name": "onions",
        "nameClean": "onion",
        "original": "2 onions, diced",
        "originalName": "onions, diced",
        "amount": 2,
        "unit": "",
        "meta": [
          "diced"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 2045,
        "aisle": "Produce",
        "image": "dill.jpg",
        "consistency": "SOLID",
        "name": "dill",
        "nameClean": "dill",
        "original": "1 bunch of dill, chopped",
        "originalName": "dill, chopped",
        "amount": 1,
        "unit": "bunch",
        "meta": [
          "chopped"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "bunch",
            "unitLong": "bunch"
          },
          "metric": {
            "amount": 1,
            "unitShort": "bunch",
            "unitLong": "bunch"
          }
        }
      },
      {
        "id": 11297,
        "aisle": "Produce",
        "image": "parsley.jpg",
        "consistency": "SOLID",
        "name": "parsley",
        "nameClean": "parsley",
        "original": "1 bunch of parsley, chopped",
        "originalName": "parsley, chopped",
        "amount": 1,
        "unit": "bunch",
        "meta": [
          "chopped"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "bunch",
            "unitLong": "bunch"
          },
          "metric": {
            "amount": 1,
            "unitShort": "bunch",
            "unitLong": "bunch"
          }
        }
      },
      {
        "id": 18375,
        "aisle": "Baking",
        "image": "yeast-granules.jpg",
        "consistency": "SOLID",
        "name": "eggs",
        "nameClean": "dry yeast",
        "original": "2 eggs ( or egg substitutes for vegans, you can also add 3-4 tbsp dry yeast flakes)",
        "originalName": "eggs ( or egg substitutes for vegans, you can also add 3-4 tbsp dry yeast flakes)",
        "amount": 2,
        "unit": "",
        "meta": [
          "dry",
          "for vegans, you can also add 3-4 tbsp  yeast flakes",
          "( or egg substitutes )"
        ],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 2,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 1012047,
        "aisle": "Spices and Seasonings",
        "image": "salt.jpg",
        "consistency": "SOLID",
        "name": "sea salt",
        "nameClean": "coarse sea salt",
        "original": "sea salt, to taste",
        "originalName": "sea salt, to taste",
        "amount": 12,
        "unit": "servings",
        "meta": [
          "to taste"
        ],
        "measures": {
          "us": {
            "amount": 12,
            "unitShort": "servings",
            "unitLong": "servings"
          },
          "metric": {
            "amount": 12,
            "unitShort": "servings",
            "unitLong": "servings"
          }
        }
      },
      {
        "id": 1002030,
        "aisle": "Spices and Seasonings",
        "image": "pepper.jpg",
        "consistency": "SOLID",
        "name": "ground pepper",
        "nameClean": "black pepper",
        "original": "1/2 tsp ground pepper",
        "originalName": "ground pepper",
        "amount": 0.5,
        "unit": "tsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 0.5,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 1002028,
        "aisle": "Spices and Seasonings",
        "image": "paprika.jpg",
        "consistency": "SOLID",
        "name": "paprika",
        "nameClean": "sweet paprika",
        "original": "1 tsp sweet paprika",
        "originalName": "sweet paprika",
        "amount": 1,
        "unit": "tsp",
        "meta": [
          "sweet"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          },
          "metric": {
            "amount": 1,
            "unitShort": "tsp",
            "unitLong": "teaspoon"
          }
        }
      },
      {
        "id": 2049,
        "aisle": "Produce",
        "image": "thyme.jpg",
        "consistency": "SOLID",
        "name": "thyme",
        "nameClean": "thyme",
        "original": "1 tbsp dry thyme",
        "originalName": "dry thyme",
        "amount": 1,
        "unit": "tbsp",
        "meta": [
          "dry"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      },
      {
        "id": 4584,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "vegetable-oil.jpg",
        "consistency": "LIQUID",
        "name": "unrefined sunflower oil",
        "nameClean": "sunflower oil",
        "original": "2 tbsp unrefined sunflower oil",
        "originalName": "unrefined sunflower oil",
        "amount": 2,
        "unit": "tbsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          },
          "metric": {
            "amount": 2,
            "unitShort": "Tbsps",
            "unitLong": "Tbsps"
          }
        }
      }
    ],
    "summary": "The recipe Vegetarian Mushroom Shepherd's Pie is ready <b>in around 45 minutes</b> and is definitely an awesome <b>gluten free and dairy free</b> option for lovers of European food. For <b>$1.16 per serving</b>, you get a hor d'oeuvre that serves 12. One serving contains <b>113 calories</b>, <b>5g of protein</b>, and <b>5g of fat</b>. 11 person were glad they tried this recipe. This recipe from Foodista requires ground pepper, thyme, unrefined sunflower oil, and paprika. All things considered, we decided this recipe <b>deserves a spoonacular score of 83%</b>. This score is spectacular. Similar recipes are <a href=\"https://spoonacular.com/recipes/vegetarian-mushroom-shepherds-pie-1404517\">Vegetarian Mushroom Shepherd's Pie</a>, <a href=\"https://spoonacular.com/recipes/vegetarian-mushroom-shepherds-pie-1374865\">Vegetarian Mushroom Shepherd's Pie</a>, and <a href=\"https://spoonacular.com/recipes/vegetarian-mushroom-shepherds-pie-with-vegan-version-122196\">Vegetarian Mushroom Shepherd's Pie - With Vegan Version</a>.",
    "cuisines": [
      "English",
      "British",
      "Scottish",
      "European"
    ],
    "dishTypes": [
      "antipasti",
      "starter",
      "snack",
      "appetizer",
      "antipasto",
      "hor d'oeuvre"
    ],
    "diets": [
      "gluten free",
      "dairy free"
    ],
    "occasions": [],
    "instructions": "Peel potatoes and put them in a large pot filled with water. Boil them until they're tender. Mash them and let them cool for a while.\nChop the mushrooms, carrot and red bell pepper. Add them into your food processor and pulse until all ingredients are well mixed together.\nHeat oil in a large skillet. Add the mixture above, diced onions, chopped dill and parsley, soy granules, eggs (or egg substitute) and spices. Saut for 10 minutes.\n* I added the soy granules without boiling them because the mushrooms contain a lot of water and these soy granules will absorb all excess water.\nPut some parchment paper on the bottom of a casserole. Divide the mashed potatoes in two. Place the first half in the casserole and spread it with a spatula. Add the filling. Place over the other half of mashed potatoes.\nHeat your oven at 392. Put the casserole in the oven. Cook for 40 minutes.\nDon't serve immediately. Let it cool for at least half an hour.",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Peel potatoes and put them in a large pot filled with water. Boil them until they're tender. Mash them and let them cool for a while.",
            "ingredients": [
              {
                "id": 11352,
                "name": "potato",
                "localizedName": "potato",
                "image": "potatoes-yukon-gold.png"
              },
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              }
            ],
            "equipment": [
              {
                "id": 404752,
                "name": "pot",
                "localizedName": "pot",
                "image": "https://spoonacular.com/cdn/equipment_100x100/stock-pot.jpg"
              }
            ]
          },
          {
            "number": 2,
            "step": "Chop the mushrooms, carrot and red bell pepper.",
            "ingredients": [
              {
                "id": 11821,
                "name": "red pepper",
                "localizedName": "red pepper",
                "image": "red-pepper.jpg"
              },
              {
                "id": 11260,
                "name": "mushrooms",
                "localizedName": "mushrooms",
                "image": "https://spoonacular.com/cdn/ingredients_100x100/mushrooms.png"
              },
              {
                "id": 11124,
                "name": "carrot",
                "localizedName": "carrot",
                "image": "sliced-carrot.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 3,
            "step": "Add them into your food processor and pulse until all ingredients are well mixed together.",
            "ingredients": [],
            "equipment": [
              {
                "id": 404771,
                "name": "food processor",
                "localizedName": "food processor",
                "image": "https://spoonacular.com/cdn/equipment_100x100/food-processor.png"
              }
            ]
          },
          {
            "number": 4,
            "step": "Heat oil in a large skillet.",
            "ingredients": [
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              }
            ],
            "equipment": [
              {
                "id": 404645,
                "name": "frying pan",
                "localizedName": "frying pan",
                "image": "https://spoonacular.com/cdn/equipment_100x100/pan.png"
              }
            ]
          },
          {
            "number": 5,
            "step": "Add the mixture above, diced onions, chopped dill and parsley, soy granules, eggs (or egg substitute) and spices. Saut for 10 minutes.",
            "ingredients": [
              {
                "id": 1226,
                "name": "egg substitute",
                "localizedName": "egg substitute",
                "image": "liquid-egg-substitute.jpg"
              },
              {
                "id": 11297,
                "name": "parsley",
                "localizedName": "parsley",
                "image": "parsley.jpg"
              },
              {
                "id": 11282,
                "name": "onion",
                "localizedName": "onion",
                "image": "brown-onion.png"
              },
              {
                "id": 2035,
                "name": "spices",
                "localizedName": "spices",
                "image": "spices.png"
              },
              {
                "id": 2045,
                "name": "dill",
                "localizedName": "dill",
                "image": "dill.jpg"
              },
              {
                "id": 1123,
                "name": "egg",
                "localizedName": "egg",
                "image": "egg.png"
              }
            ],
            "equipment": [],
            "length": {
              "number": 10,
              "unit": "minutes"
            }
          },
          {
            "number": 6,
            "step": "* I added the soy granules without boiling them because the mushrooms contain a lot of water and these soy granules will absorb all excess water.",
            "ingredients": [
              {
                "id": 11260,
                "name": "mushrooms",
                "localizedName": "mushrooms",
                "image": "https://spoonacular.com/cdn/ingredients_100x100/mushrooms.png"
              },
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 7,
            "step": "Put some parchment paper on the bottom of a casserole. Divide the mashed potatoes in two.",
            "ingredients": [
              {
                "id": 11352,
                "name": "potato",
                "localizedName": "potato",
                "image": "potatoes-yukon-gold.png"
              }
            ],
            "equipment": [
              {
                "id": 404770,
                "name": "baking paper",
                "localizedName": "baking paper",
                "image": "https://spoonacular.com/cdn/equipment_100x100/baking-paper.jpg"
              }
            ]
          },
          {
            "number": 8,
            "step": "Place the first half in the casserole and spread it with a spatula.",
            "ingredients": [
              {
                "id": 0,
                "name": "spread",
                "localizedName": "spread",
                "image": ""
              }
            ],
            "equipment": [
              {
                "id": 404642,
                "name": "spatula",
                "localizedName": "spatula",
                "image": "https://spoonacular.com/cdn/equipment_100x100/spatula-or-turner.jpg"
              }
            ]
          },
          {
            "number": 9,
            "step": "Add the filling.",
            "ingredients": [],
            "equipment": []
          },
          {
            "number": 10,
            "step": "Place over the other half of mashed potatoes.",
            "ingredients": [
              {
                "id": 11352,
                "name": "potato",
                "localizedName": "potato",
                "image": "potatoes-yukon-gold.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 11,
            "step": "Heat your oven at 39",
            "ingredients": [],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              }
            ]
          },
          {
            "number": 12,
            "step": "Put the casserole in the oven. Cook for 40 minutes.",
            "ingredients": [],
            "equipment": [
              {
                "id": 404784,
                "name": "oven",
                "localizedName": "oven",
                "image": "https://spoonacular.com/cdn/equipment_100x100/oven.jpg"
              }
            ],
            "length": {
              "number": 40,
              "unit": "minutes"
            }
          },
          {
            "number": 13,
            "step": "Don't serve immediately.",
            "ingredients": [],
            "equipment": []
          },
          {
            "number": 14,
            "step": "Let it cool for at least half an hour.",
            "ingredients": [],
            "equipment": []
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 95.53280639648438,
    "spoonacularSourceUrl": "https://spoonacular.com/vegetarian-mushroom-shepherds-pie-664680"
  },
  {
    "id": 982382,
    "image": "https://img.spoonacular.com/recipes/982382-556x370.jpg",
    "imageType": "jpg",
    "title": "Instant Pot Chicken Taco Soup",
    "readyInMinutes": 25,
    "servings": 4,
    "sourceUrl": "https://www.pinkwhen.com/instant-pot-chicken-taco-soup/",
    "vegetarian": false,
    "vegan": false,
    "glutenFree": true,
    "dairyFree": true,
    "veryHealthy": true,
    "cheap": false,
    "veryPopular": false,
    "sustainable": false,
    "lowFodmap": false,
    "weightWatcherSmartPoints": 6,
    "gaps": "no",
    "preparationMinutes": 5,
    "cookingMinutes": 20,
    "aggregateLikes": 3,
    "healthScore": 83,
    "creditsText": "pinkwhen.com",
    "license": null,
    "sourceName": "pinkwhen.com",
    "pricePerServing": 271.9,
    "extendedIngredients": [
      {
        "id": 1055062,
        "aisle": "Meat",
        "image": "chicken-breasts.png",
        "consistency": "SOLID",
        "name": "boneless/skinless chicken breasts",
        "nameClean": "boneless skinless chicken breast",
        "original": "½ pound boneless/skinless chicken breasts",
        "originalName": "boneless/skinless chicken breasts",
        "amount": 0.5,
        "unit": "pound",
        "meta": [],
        "measures": {
          "us": {
            "amount": 0.5,
            "unitShort": "lb",
            "unitLong": "pounds"
          },
          "metric": {
            "amount": 226.796,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 16018,
        "aisle": "Canned and Jarred",
        "image": "black-beans.jpg",
        "consistency": "SOLID",
        "name": "black beans",
        "nameClean": "canned black beans",
        "original": "1 10 oz can of black beans",
        "originalName": "black beans",
        "amount": 10,
        "unit": "oz",
        "meta": [
          "canned"
        ],
        "measures": {
          "us": {
            "amount": 10,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 283.495,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 11177,
        "aisle": "Produce",
        "image": "corn.png",
        "consistency": "SOLID",
        "name": "corn",
        "nameClean": "whole kernel corn",
        "original": "1 10 oz can of corn",
        "originalName": "corn",
        "amount": 10,
        "unit": "oz",
        "meta": [
          "canned"
        ],
        "measures": {
          "us": {
            "amount": 10,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 283.495,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 11980,
        "aisle": "Canned and Jarred",
        "image": "pickled-jalapenos.png",
        "consistency": "SOLID",
        "name": "chilis",
        "nameClean": "canned green chiles",
        "original": "1 4oz can chopped green chilis",
        "originalName": "chopped green chilis",
        "amount": 4,
        "unit": "oz",
        "meta": [
          "green",
          "chopped",
          "canned"
        ],
        "measures": {
          "us": {
            "amount": 4,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 113.398,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 10011693,
        "aisle": "Canned and Jarred",
        "image": "tomatoes-canned.png",
        "consistency": "SOLID",
        "name": "canned tomatoes",
        "nameClean": "canned tomatoes",
        "original": "1 28oz can diced tomatoes",
        "originalName": "diced tomatoes",
        "amount": 28,
        "unit": "oz",
        "meta": [
          "diced",
          "canned"
        ],
        "measures": {
          "us": {
            "amount": 28,
            "unitShort": "oz",
            "unitLong": "ounces"
          },
          "metric": {
            "amount": 793.787,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 2009,
        "aisle": "Spices and Seasonings",
        "image": "chili-powder.jpg",
        "consistency": "SOLID",
        "name": "chili powder",
        "nameClean": "chili powder",
        "original": "2 tsp chili powder",
        "originalName": "chili powder",
        "amount": 2,
        "unit": "tsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          },
          "metric": {
            "amount": 2,
            "unitShort": "tsps",
            "unitLong": "teaspoons"
          }
        }
      },
      {
        "id": 2012,
        "aisle": "Spices and Seasonings",
        "image": "ground-coriander.jpg",
        "consistency": "SOLID",
        "name": "cilantro",
        "nameClean": "dried cilantro",
        "original": "¼ cup dried cilantro",
        "originalName": "dried cilantro",
        "amount": 0.25,
        "unit": "cup",
        "meta": [
          "dried"
        ],
        "measures": {
          "us": {
            "amount": 0.25,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 59.147,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 11333,
        "aisle": "Produce",
        "image": "green-pepper.jpg",
        "consistency": "SOLID",
        "name": "bell pepper",
        "nameClean": "green pepper",
        "original": "1 medium green bell pepper finely chopped",
        "originalName": "green bell pepper finely chopped",
        "amount": 1,
        "unit": "medium",
        "meta": [
          "green",
          "finely chopped"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "medium",
            "unitLong": "medium"
          },
          "metric": {
            "amount": 1,
            "unitShort": "medium",
            "unitLong": "medium"
          }
        }
      },
      {
        "id": 11291,
        "aisle": "Produce",
        "image": "spring-onions.jpg",
        "consistency": "SOLID",
        "name": "green onion",
        "nameClean": "spring onions",
        "original": "¼ cup chopped green onion",
        "originalName": "chopped green onion",
        "amount": 0.25,
        "unit": "cup",
        "meta": [
          "chopped"
        ],
        "measures": {
          "us": {
            "amount": 0.25,
            "unitShort": "cups",
            "unitLong": "cups"
          },
          "metric": {
            "amount": 25,
            "unitShort": "g",
            "unitLong": "grams"
          }
        }
      },
      {
        "id": 4053,
        "aisle": "Oil, Vinegar, Salad Dressing",
        "image": "olive-oil.jpg",
        "consistency": "LIQUID",
        "name": "olive oil",
        "nameClean": "olive oil",
        "original": "1 tbsp olive oil",
        "originalName": "olive oil",
        "amount": 1,
        "unit": "tbsp",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          },
          "metric": {
            "amount": 1,
            "unitShort": "Tbsp",
            "unitLong": "Tbsp"
          }
        }
      },
      {
        "id": 11282,
        "aisle": "Produce",
        "image": "brown-onion.png",
        "consistency": "SOLID",
        "name": "onion",
        "nameClean": "onion",
        "original": "1 onion finely chopped",
        "originalName": "onion finely chopped",
        "amount": 1,
        "unit": "",
        "meta": [
          "finely chopped"
        ],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          },
          "metric": {
            "amount": 1,
            "unitShort": "",
            "unitLong": ""
          }
        }
      },
      {
        "id": 14412,
        "aisle": "Beverages",
        "image": "water.png",
        "consistency": "LIQUID",
        "name": "water",
        "nameClean": "water",
        "original": "1 cup water",
        "originalName": "water",
        "amount": 1,
        "unit": "cup",
        "meta": [],
        "measures": {
          "us": {
            "amount": 1,
            "unitShort": "cup",
            "unitLong": "cup"
          },
          "metric": {
            "amount": 236.588,
            "unitShort": "ml",
            "unitLong": "milliliters"
          }
        }
      }
    ],
    "summary": "Need a <b>gluten free and dairy free main course</b>? Instant Pot Chicken Taco Soup could be an excellent recipe to try. One portion of this dish contains approximately <b>25g of protein</b>, <b>8g of fat</b>, and a total of <b>346 calories</b>. This recipe serves 4 and costs $2.72 per serving. Head to the store and pick up chili powder, black beans, green onion, and a few other things to make it today. It is brought to you by Pink When. 3 people were impressed by this recipe. It will be a hit at your <b>Autumn</b> event. Only a few people really liked this Mexican dish. From preparation to the plate, this recipe takes approximately <b>25 minutes</b>. With a spoonacular <b>score of 92%</b>, this dish is great. Users who liked this recipe also liked <a href=\"https://spoonacular.com/recipes/instant-pot-chicken-taco-soup-975070\">Instant Pot Chicken Taco Soup</a>, <a href=\"https://spoonacular.com/recipes/instant-pot-chicken-taco-soup-1351299\">Instant Pot Chicken Taco Soup</a>, and <a href=\"https://spoonacular.com/recipes/instant-pot-chicken-taco-soup-1032489\">Instant Pot Chicken Taco Soup</a>.",
    "cuisines": [
      "Mexican"
    ],
    "dishTypes": [
      "lunch",
      "soup",
      "main course",
      "main dish",
      "dinner"
    ],
    "diets": [
      "gluten free",
      "dairy free"
    ],
    "occasions": [
      "fall",
      "winter"
    ],
    "instructions": "Instructions:\nPress the Saute button on the Instant Pot and heat oil. Add onion and bell pepper and saute until translucent. Add tomatoes including juice and add water. Make sure to scrape all of the bits from the sides and bottom of the Instant Pot as you are stirring.\nAdd chicken, chili powder, corn, black beans, green onions, green chilis, and  cup of cilantro. Lock lid. Press the manual or pressure cook button and set time for 15 minutes. When time is up, do a quick release until the valve drops and then unlock the lid. Shred the chicken using two forks and then let the soup simmer for 5 minutes.\nServe the soup into bowls and then top with your favorite toppings such as sour cream, cheese, avocado, etc.",
    "analyzedInstructions": [
      {
        "name": "",
        "steps": [
          {
            "number": 1,
            "step": "Press the",
            "ingredients": [],
            "equipment": []
          },
          {
            "number": 2,
            "step": "Saute button on the Instant Pot and heat oil.",
            "ingredients": [
              {
                "id": 4582,
                "name": "cooking oil",
                "localizedName": "cooking oil",
                "image": "vegetable-oil.jpg"
              }
            ],
            "equipment": [
              {
                "id": 414093,
                "name": "instant pot",
                "localizedName": "instant pot",
                "image": ""
              }
            ]
          },
          {
            "number": 3,
            "step": "Add onion and bell pepper and saute until translucent.",
            "ingredients": [
              {
                "id": 10211821,
                "name": "bell pepper",
                "localizedName": "bell pepper",
                "image": "bell-pepper-orange.png"
              },
              {
                "id": 11282,
                "name": "onion",
                "localizedName": "onion",
                "image": "brown-onion.png"
              }
            ],
            "equipment": []
          },
          {
            "number": 4,
            "step": "Add tomatoes including juice and add water. Make sure to scrape all of the bits from the sides and bottom of the Instant Pot as you are stirring.",
            "ingredients": [
              {
                "id": 11529,
                "name": "tomato",
                "localizedName": "tomato",
                "image": "tomato.png"
              },
              {
                "id": 1019016,
                "name": "juice",
                "localizedName": "juice",
                "image": "apple-juice.jpg"
              },
              {
                "id": 14412,
                "name": "water",
                "localizedName": "water",
                "image": "water.png"
              }
            ],
            "equipment": [
              {
                "id": 414093,
                "name": "instant pot",
                "localizedName": "instant pot",
                "image": ""
              }
            ]
          },
          {
            "number": 5,
            "step": "Add chicken, chili powder, corn, black beans, green onions, green chilis, and  cup of cilantro. Lock lid. Press the manual or pressure cook button and set time for 15 minutes. When time is up, do a quick release until the valve drops and then unlock the lid. Shred the chicken using two forks and then let the soup simmer for 5 minutes.",
            "ingredients": [
              {
                "id": 2009,
                "name": "chili powder",
                "localizedName": "chili powder",
                "image": "chili-powder.jpg"
              },
              {
                "id": 31015,
                "name": "green chili pepper",
                "localizedName": "green chili pepper",
                "image": "chili-peppers-green.jpg"
              },
              {
                "id": 11291,
                "name": "green onions",
                "localizedName": "green onions",
                "image": "spring-onions.jpg"
              },
              {
                "id": 16015,
                "name": "black beans",
                "localizedName": "black beans",
                "image": "black-beans.jpg"
              },
              {
                "id": 11165,
                "name": "cilantro",
                "localizedName": "cilantro",
                "image": "cilantro.png"
              },
              {
                "id": 0,
                "name": "chicken",
                "localizedName": "chicken",
                "image": "whole-chicken.jpg"
              },
              {
                "id": 11168,
                "name": "corn",
                "localizedName": "corn",
                "image": "corn.png"
              },
              {
                "id": 0,
                "name": "soup",
                "localizedName": "soup",
                "image": ""
              }
            ],
            "equipment": [],
            "length": {
              "number": 20,
              "unit": "minutes"
            }
          },
          {
            "number": 6,
            "step": "Serve the soup into bowls and then top with your favorite toppings such as sour cream, cheese, avocado, etc.",
            "ingredients": [
              {
                "id": 1056,
                "name": "sour cream",
                "localizedName": "sour cream",
                "image": "sour-cream.jpg"
              },
              {
                "id": 9037,
                "name": "avocado",
                "localizedName": "avocado",
                "image": "avocado.jpg"
              },
              {
                "id": 1041009,
                "name": "cheese",
                "localizedName": "cheese",
                "image": "https://spoonacular.com/cdn/ingredients_100x100/cheddar-cheese.png"
              },
              {
                "id": 0,
                "name": "soup",
                "localizedName": "soup",
                "image": ""
              }
            ],
            "equipment": [
              {
                "id": 404783,
                "name": "bowl",
                "localizedName": "bowl",
                "image": "https://spoonacular.com/cdn/equipment_100x100/bowl.jpg"
              }
            ]
          }
        ]
      }
    ],
    "originalId": null,
    "spoonacularScore": 93.88455200195312,
    "spoonacularSourceUrl": "https://spoonacular.com/instant-pot-chicken-taco-soup-982382"
  }
]