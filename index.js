const recipes = [
  {
    id: 1,
    title: "Vegan Lentil Soup",
    image: "./Assets/focaccia.png",
    readyInMinutes: 30,
    servings: 4,
    sourceUrl: "https://example.com/vegan-lentil-soup",
    diets: ["vegan"],
    cuisine: "Mediterranean",
    ingredients: [
      "red lentils",
      "carrots",
      "onion",
      "garlic",
      "tomato paste",
      "cumin",
      "paprika",
      "vegetable broth",
      "olive oil",
      "salt"
    ],
    pricePerServing: 2.5,
    popularity: 85
  },
  {
    id: 2,
    title: "Vegetarian Pesto Pasta",
    image: "./Assets/focaccia.png",
    readyInMinutes: 25,
    servings: 2,
    sourceUrl: "https://example.com/vegetarian-pesto-pasta",
    diets: ["vegetarian"],
    cuisine: "Italian",
    ingredients: [
      "pasta",
      "basil",
      "parmesan cheese",
      "garlic",
      "pine nuts",
      "olive oil",
      "salt",
      "black pepper"
    ],
    pricePerServing: 3.0,
    popularity: 92
  },
  {
    id: 3,
    title: "Gluten-Free Chicken Stir-Fry",
    image: "./Assets/focaccia.png",
    readyInMinutes: 67,
    servings: 3,
    sourceUrl: "https://example.com/gluten-free-chicken-stir-fry",
    diets: ["gluten-free"],
    cuisine: "Asian",
    ingredients: [
      "chicken breast",
      "broccoli",
      "bell pepper",
      "carrot",
      "soy sauce (gluten-free)",
      "ginger",
      "garlic",
      "sesame oil",
      "cornstarch",
      "green onion",
      "sesame seeds",
      "rice"
    ],
    pricePerServing: 4.0,
    popularity: 78
  },
  {
    id: 4,
    title: "Dairy-Free Tacos",
    image: "./Assets/focaccia.png",
    readyInMinutes: 15,
    servings: 2,
    sourceUrl: "https://example.com/dairy-free-tacos",
    diets: ["dairy-free"],
    cuisine: "Mexican",
    ingredients: [
      "corn tortillas",
      "ground beef",
      "taco seasoning",
      "lettuce",
      "tomato",
      "avocado"
    ],
    pricePerServing: 2.8,
    popularity: 88
  },
  {
    id: 5,
    title: "Middle Eastern Hummus",
    image: "./Assets/focaccia.png",
    readyInMinutes: 47,
    servings: 4,
    sourceUrl: "https://example.com/middle-eastern-hummus",
    diets: ["vegan", "gluten-free"],
    cuisine: "Italian",
    ingredients: [
      "chickpeas",
      "tahini",
      "garlic",
      "lemon juice",
      "olive oil"
    ],
    pricePerServing: 1.5,
    popularity: 95
  },
  {
    id: 6,
    title: "Quick Avocado Toast",
    image: "./Assets/focaccia.png",
    readyInMinutes: 5,
    servings: 1,
    sourceUrl: "https://example.com/quick-avocado-toast",
    diets: ["vegan"],
    cuisine: "Mediterranean",
    ingredients: [
      "bread",
      "avocado",
      "lemon juice",
      "salt"
    ],
    pricePerServing: 2.0,
    popularity: 90
  },
  {
    id: 7,
    title: "Beef Stew",
    image: "./Assets/focaccia.png",
    readyInMinutes: 90,
    servings: 5,
    sourceUrl: "https://example.com/beef-stew",
    diets: [],
    cuisine: "European",
    ingredients: [
      "beef chunks",
      "potatoes",
      "carrots",
      "onion",
      "garlic",
      "tomato paste",
      "beef broth",
      "red wine",
      "bay leaves",
      "thyme",
      "salt",
      "black pepper",
      "butter",
      "flour",
      "celery",
      "mushrooms"
    ],
    pricePerServing: 5.5,
    popularity: 80
  }
]

//Variables
const cardsContainer = document.querySelector(".cards-container");

const btnAsian = document.getElementById("asianCuisine");
const btnFrench = document.getElementById("frenchCuisine");
const btnMexican = document.getElementById("mexicanCuisine");
const btnItalian = document.getElementById("italianCuisine");
const btnAll = document.getElementById("btnAll");

const btnRandom = document.getElementById("btnRandom");

const timeFilterButtons = document.querySelectorAll(".btn-filter-min");

const sortShortestBtn = document.getElementById("sortShortest");
const sortLongestBtn = document.getElementById("sortLongest");
//const messageCard = document.querySelector(".cards-container .card h2");

//const firstMessage = "Welcome to the Recipe Library! 🍽️";
//messageCard.textContent = firstMessage;

const cuisineButtons = [btnAsian, btnFrench, btnMexican, btnItalian, btnAll];

//Default
function displayRecipes(list) {
  cardsContainer.innerHTML = "";

  //Nothing found
  if (list.length === 0) {
    return cardsContainer.innerHTML = `
      <div class="card">
        <h2>I looked everywhere, but couldn't find anything</h2>
        <p>Try resetting your search by pressing "All" or get lucky with a random recipe!</p>
        <img src="./Assets/404error.jpg">
      </div>
    `;
  }

  list.forEach(recipe => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img class="card-img" src="${recipe.image}" alt="${recipe.title}" />
      <h2 class="card-big-heading">${recipe.title}</h2>
      <hr class="card-line" />
      <dl class="details-card">
        <div class="card-detail"><dt>Cuisine:</dt><dd>${recipe.cuisine}</dd></div>
        <div class="card-detail"><dt>Time:</dt><dd>${recipe.readyInMinutes} min</dd></div>
      </dl>
      <hr class="card-line" />
      <h3>Ingredients</h3>
      <ul class="ingredient-list">
        ${recipe.ingredients.map(ing => `<li class="ingredient">${ing}</li>`).join("")}
      </ul>
    `;
    cardsContainer.appendChild(card);
  });
}

function getSelectedCuisines() {
  return cuisineButtons
    .filter(btn => btn.classList.contains("active") && btn !== btnAll)
    .map(btn => btn.textContent.trim());
}

function getSelectedTimeLimit() {
  const activeBtn = [...timeFilterButtons].find(b => b.classList.contains("active"));
  if (!activeBtn) return null;
  if (activeBtn.textContent.includes("30")) return 30;
  if (activeBtn.textContent.includes("45")) return 45;
  if (activeBtn.textContent.includes("1,5")) return 90;
  if (activeBtn.textContent.includes("3")) return 180;
  return null;
}

/* function getSelectedSort() {
  const selected = [...sortButtons].find(b => b.classList.contains("active"));
  return selected ? selected.textContent.trim() : null;
} */

//Filter and Sorting

function addFiltersAndSorting() {
  btnRandom.classList.remove("active");

  let filtered = recipes;
  const cuisines = getSelectedCuisines();
  const timeLimit = getSelectedTimeLimit();

  //Cuisine filter logic
  if (!btnAll.classList.contains("active") && cuisines.length > 0) {
    filtered = filtered.filter(r => cuisines.includes(r.cuisine)); // show all if “All” or none selected
  } /* else {
    filtered = recipes.filter(r => cuisines.includes(r.cuisine));
  }; */
  //Time filter logic
  if (timeLimit) {
    filtered = filtered.filter(r => r.readyInMinutes <= timeLimit);
  }

  //Sorting logic
  if (sortShortestBtn.classList.contains("active")) {
    filtered.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
  } else if (sortLongestBtn.classList.contains("active")) {
    filtered.sort((a, b) => b.readyInMinutes - a.readyInMinutes);
  }

  displayRecipes(filtered);
}


//Filter by cuisine
cuisineButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    btnRandom.classList.remove("active");

    if (btn.id === "btnAll") {
      // "All" resets everything
      cuisineButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    } else {
      // Toggle selected cuisine
      btn.classList.toggle("active");
      btnAll.classList.remove("active");

      //By dafault All is applied
      const anyActive = cuisineButtons.some(b => b.classList.contains("active") && b !== btnAll);
      if (!anyActive) btnAll.classList.add("active");
    }
     //cuisineMessageUpdate();
    addFiltersAndSorting();
  });
});

//Filter by time
timeFilterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    btnRandom.classList.remove("active");

    const isActive = btn.classList.contains("active");

    // Deactivate all time filter buttons
    timeFilterButtons.forEach(b => b.classList.remove("active"));

    // Toggle clicked one
    if (!isActive) {
      btn.classList.add("active");
    }

    //Reapply filters and sorting
    addFiltersAndSorting();
  });
});



//Sort buttons
const sortButtons = [sortShortestBtn, sortLongestBtn];
sortButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const isActive = btn.classList.contains("active");

    //Deactivate both
    sortButtons.forEach(b => b.classList.remove("active"));

    //Toggle clicked one
    if (!isActive) {
      btn.classList.add("active");
    }

    //Reapply filters and sorting
    applyFiltersAndSorting();
  });
});

//Random Button
btnRandom.addEventListener("click", () => {
  //Clear all filters and sorts
  cuisineButtons.forEach(b => b.classList.remove("active"));
  timeFilterButtons.forEach(b => b.classList.remove("active"));
  sortButtons.forEach(b => b.classList.remove("active"));

  btnRandom.classList.add("active");

  //Pick and show random recipe
  const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];

  displayRecipes([randomRecipe]);
});

//First loading
displayRecipes(recipes);


////////////////
//for week 1
/* function cuisineMessageUpdate() {
  const active = cuisineButtons.filter(btn => btn.classList.contains("active") && btn !== btnAll);

  //Filter "All"
  if (btnAll.classList.contains("active")) {
    return messageCard.textContent = "Showing all cuisines 🍽️";
  }

  //Default(no filter)
  if (active.length === 0) {
    return messageCard.textContent = firstMessage;
  }

  // >1 filter
  if (active.length === 2) {
    return messageCard.textContent = "Double the flavor combo! 🍲🍜";
  }

   if (active.length === 3) {
    return messageCard.textContent = "Wow, ho many guests do you have today?! 🍲🍜";
  }

   if (active.length === 4) {
   return messageCard.textContent = "Oh, just press All now, honey, won't you?";     
  }

  // 1 filter
  const btn = active[0];
  if (btn === btnAsian) messageCard.textContent = "Wow, fellow spicy cuisine lover! 🌶️";
  else if (btn === btnItalian) messageCard.textContent = "Mamma mia! Time for pasta and focaccia! 🍝";
  else if (btn === btnMexican) messageCard.textContent = "¡Olé! Let’s add some tacos to the mix! 🌮";
  else if (btn === btnFrench) messageCard.textContent = "Bon appétit! 🥐 Time for something elegant.";
} */


//Sorting by time

/* function clearActive(group) {
  group.forEach(btn => btn.classList.remove("active"));
}
  
sortButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const isActive = btn.classList.contains("active");
    clearActive(sortButtons);

    if (!isActive) {
      btn.classList.add("active");
      messageCard.textContent = `Sorting by: ${btn.textContent}`;
    } else {
      messageCard.textContent = firstMessage;
    }
  });
});
 */