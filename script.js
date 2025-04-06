const filterButtons = document.querySelectorAll(".filter-checkbox")
const sortButtons = document.querySelectorAll(".sort-radio")
const lazyButton = document.getElementById("lazy")
const allButton = document.getElementById("all");
// const arrowButtons = document.querySelectorAll(".arrow-btn")
//Arrays to use in the Filter function 
let activeFilters = []
let allRecipes = []
let workingArray = []
const BASE_URL = "https://api.spoonacular.com/recipes/random"
const API_KEY = "f0139a3417dd49cb861c8c92b5ee8a47"
const URL = `${BASE_URL}/?apiKey=${API_KEY}&number=100`


const fetchData = async () => {
  try {
    const storedRecipes = localStorage.getItem("recipes")

    if (storedRecipes) {

      allRecipes = JSON.parse(storedRecipes)
    } else {

      const response = await fetch(URL)

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error("The API quota is reached. Please try again tomorrow")
        } else {
          throw new Error(`Error! Status: ${response.status}`)
        }
      }

      const data = await response.json()

      allRecipes = data.recipes.filter(recipe => {
        return recipe.cuisines.length > 0 && recipe.image && recipe.title
      })

      localStorage.setItem("recipes", JSON.stringify(allRecipes))
    }

    workingArray = [...allRecipes]
    //render valid recipes in the DOM 
    loadRecipes(workingArray)

  } catch (error) {
    console.error("error: ", error.message)
    recipeContainer.innerHTML = `<p>${error.message}</p>`
  }
}

// Function that renders through the ingredients array and creates a list-element for every ingredient for better readability

const renderIngredients = (array) => {
  return `<ul>
    ${array
      .map(ingredient => {
        const amount = ingredient.measures?.metric?.amount ? Math.ceil(ingredient.measures.metric.amount) : "?";
        const unit = ingredient.measures?.metric?.unitShort || "";
        return `<li>${amount} ${unit} ${ingredient.name}</li>`;
      })
      .join("")}
  </ul>`;
};

const renderDiets = (recipe) => {
  const dietLabels = [
    { key: "vegetarian", label: "Vegetarian" },
    { key: "vegan", label: "Vegan" },
    { key: "glutenFree", label: "Gluten-Free" },
    { key: "dairyFree", label: "Dairy-Free" },
  ];

  const stringArray = dietLabels
    .filter(({ key }) => recipe[key])  // Keep only the ones that are true
    .map(({ label }) => label);        // Extract their labels

  return stringArray.length ? stringArray.join(", ") : "No special diet";
};

const renderInstructions = (array) => {
  if (!array || array.length === 0) {
    return "No instructions available.";
  }
  const steps = array[0].steps;
  return `<ol>${steps.map(step => `<li>${step.step}</li>`).join("")}</ol>`;
};


const recipeContainer = document.getElementById("recipe-container")

const loadRecipes = (array) => {
  recipeContainer.innerHTML = ''
  if (array.length === 0) {
    recipeContainer.innerHTML = '<p class="empty-state">No recipes found. Try adjusting your filters. </p>'
    return
  }

  array.forEach((recipe) => {
    recipeContainer.innerHTML += `
    <article class="recipe-card">
      
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <div class="border-top-bottom">
        <p><strong>Diet: </strong> ${renderDiets(recipe)}</p>
        <p><strong>Ready in:</strong> ${recipe.readyInMinutes} minutes</p>
      </div>
      <div class="lower-container">
        <p><strong>Ingredients: </strong>${renderIngredients(recipe.extendedIngredients)}</p>
        <div class="arrow-btn-container">
          <button class="arrow-btn">
            <p><strong>Instructions</strong></p>
            <img src="./images/arrow.svg" alt="arrow">
          </button>
        </div>
        <div class="instructions" style="display: none;"><strong>Instructions:</strong> ${renderInstructions(recipe.analyzedInstructions)}</div>
      </div>
    </article>`;

  })

}

//Fetch data from the API when the page loads
fetchData()

// Handles the button logic, which one should be checked depending on what else is checked
const updateButtons = (id) => {
  if (id === "all" || id === "lazy") {
    // If "All" is clicked, uncheck all other checkboxes
    filterButtons.forEach(btn => {
      if (btn.id !== "all") {
        btn.checked = false
      }
    })
  } else {// any other button was clicked
    // Check if any (non-all) boxes are checked
    const anyFiltersActive = Array.from(filterButtons).some(btn => btn.checked && btn.id !== "all")
    allButton.checked = !anyFiltersActive
  }
}

const updateFilters = (button) => {
  if (button.id === "all") {
    // Reset everything when "all" is clicked
    activeFilters = [];
    workingArray = [...allRecipes];
  } else {
    if (button.checked) {
      if (!activeFilters.includes(button.id)) {
        activeFilters.push(button.id);
      }
    } else {
      activeFilters = activeFilters.filter(filter => filter !== button.id);
    }

    // If there are active filters, apply filtering; otherwise, reset workingArray
    workingArray = activeFilters.length > 0
      ? workingArray.filter(recipe => activeFilters.every(filter => recipe[filter] === true))
      : [...allRecipes];
  }

  loadRecipes(workingArray);
};

const sortAscending = (array) => {
  array.sort((a, b) => (
    a.readyInMinutes > b.readyInMinutes ? 1 : b.readyInMinutes > a.readyInMinutes ? -1 : 0
  ))
  loadRecipes(array)
}

const sortDescending = (array) => {
  array.sort((a, b) => (
    b.readyInMinutes > a.readyInMinutes ? 1 : a.readyInMinutes > b.readyInMinutes ? -1 : 0
  ))
  loadRecipes(array)
}

const randomRecipe = () => {
  const randomIndex = Math.floor(Math.random() * workingArray.length)
  workingArray = [workingArray[randomIndex]]
  loadRecipes(workingArray)
  workingArray = [...allRecipes]
}


filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    updateButtons(button.id)
    updateFilters(button)
  })
})

sortButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (button.id === "ascending") {
      sortAscending(workingArray)
    } else {
      sortDescending(workingArray)
    }
  })
})

lazyButton.addEventListener("click", () => {
  updateButtons(lazyButton.id)
  randomRecipe()
})


document.addEventListener("click", (event) => {
  if (event.target.closest(".arrow-btn")) {
    const btn = event.target.closest(".arrow-btn");
    const card = btn.closest(".recipe-card");
    const instructionContainer = card.querySelector(".instructions");
    const isVisible = instructionContainer.style.display === "block";
    instructionContainer.style.display = isVisible ? "none" : "block";
  }
});






