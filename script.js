//API VARIABLES
const apiKey = "bd0cc269e37b44dc9363d356be6f251a";
const url2 = `https://api.spoonacular.com/recipes/complexSearch?number=5&sort=random&addRecipeInformation=true&apiKey=${apiKey}&cuisine=Asian,Italian,Mexican,Mediterranean,Middle Eastern,European`;



//DOM ELEMENTS
const recipesContainer = document.getElementById('recipesContainer');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortBtns = document.querySelectorAll('.sort-btn');
const randomBtn = document.getElementById('randomBtn');

const showMessage = (message) => {
  recipesContainer.innerHTML = `
    <div class="message">
      <p>${message}</p>
    </div>
  `;
};

let recipesData = [];
let currentRecipes = [];

// NORMALIZE THE CUISINES
const normalizeCuisine = (cuisine) => {
  if (!cuisine) return "Unknown";

  const asianCuisines = ["Chinese", "Japanese", "Thai", "Korean", "Vietnamese", "Indian"];
  const middleEasternCuisines = ["Turkish", "Lebanese", "Persian", "Israeli", "Egyptian"];
  const europeanCuisines = ["French", "Spanish", "German", "Greek", "British"];

  if (asianCuisines.includes(cuisine)) return "Asian";
  if (middleEasternCuisines.includes(cuisine)) return "Middle Eastern";
  if (europeanCuisines.includes(cuisine)) return "European";

  return cuisine;
};

// FETCHING API
const fetchData = () => {
  fetch(url2)
    .then(res => res.json())
    .then(data => {
      if (!data.results) {
        showMessage("Daily API quota reached or an error occurred. Please try again later.");
        return;
      }

      recipesData = data.results.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        cuisine: normalizeCuisine(recipe.cuisines?.[0]),
        summary: recipe.summary
      }));

      currentRecipes = recipesData;

      if (recipesData.length === 0) {
        showMessage("No recipes found.");
      } else {
        showRecipes(recipesData);
      }
    })
    .catch(() => {
      showMessage("Unable to load recipes. Please check your connection or try again later.");
    });
};


fetchData();



// FUNCTION TO SHOW RECIPES
const showRecipes = (recipesToShow = recipesData) => {

  currentRecipes = recipesToShow;
  recipesContainer.innerHTML = '';

  recipesToShow.forEach(recipe => {
    recipesContainer.innerHTML += `
    <div class="recipe-card-wrapper">
      <div class="recipe-card"> 
        <p class="recipe-title">${recipe.title}</p>
        <hr class="divider">
        <p><b>Cuisine:</b> ${recipe.cuisine}</p>
        <hr class="divider">
        <img src="${recipe.image}" alt="${recipe.title}">
        <hr class="divider">
        <p><b>Cooking time:</b> ${recipe.readyInMinutes} minutes!</p>
        <p> ${recipe.summary} </p>
      </div>
</div>

    `;
  });
};

// FUNCTION FOR BUTTONS

//FILTER BUTTONS
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const selectedCuisine = btn.id.toLowerCase();

    const filtered =
      selectedCuisine === "all"
        ? recipesData
        : recipesData.filter(r => r.cuisine.toLowerCase() === selectedCuisine);

    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (filtered.length === 0) {
      showMessage(`No ${selectedCuisine} recipes found.`);
    } else {
      showRecipes(filtered);
    }
  });
});



// SORT BUTTONS
sortBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const order = btn.id; // "ascending" or "descending"

    const sorted = [...currentRecipes].sort((a, b) =>
      order === "ascending"
        ? a.readyInMinutes - b.readyInMinutes
        : b.readyInMinutes - a.readyInMinutes
    );

    sortBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    showRecipes(sorted);
  });
});



// RANDOMBUTTON
randomBtn.addEventListener('click', () => {
  //RANDOMNUMBER
  const randomIndex = Math.floor(Math.random() * recipesData.length);

  const randomRecipe = recipesData[randomIndex];

  showRecipes([randomRecipe]);
});
