// conecting Js with my HTML file,

const recipesEl = document.getElementById("recipes"); // points to the <main id="recipes"> element where recipe cards will be shown.
const msgEl = document.getElementById("msg"); // element used for messages (like “Loading…”
const pills = document.querySelectorAll(".pill"); // selects all filter and sort buttons with the class pill.
const randomBtn = document.getElementById("random-btn"); // button for random recipe

// Setting up the API, spoonacular API
const API_KEY = "2065aff4499d4fe29bdfbad342732432"
const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch"; // the main address for the API where tofetch recipes from.

// Setting up stprage and filter 
let DATA = []; //an empty array where stores the recipes data when fetched.
let state = {
  kitchen: "all",
  diet: "all",
  time: "all",
  ingredients: "all",
  sort: "time",
  order: "asc"
};

// Fetching data from the API, Spoonacular //Function 1
const fetchData = () => {
  recipesEl.innerHTML = `<p>Loading recipes...</p>`; // shows a loading message while fetching data/streching the goal.

  // Build dynamic query string based on selected filters
  const params = new URLSearchParams({ //this is to help to build the query string (everything after the ? in a URL).
    number: 10, // number of recipes to fetch
    addRecipeInformation: true, // include detailed recipe details
    apiKey: API_KEY, //required to use API 
  });

  if (state.kitchen !== "all") params.append("cuisine", state.kitchen);
  if (state.diet !== "all") params.append("diet", state.diet);

  const url = `${BASE_URL}?${params.toString()}`;

  // Here I am using the fetch function to make a request to the API endpoint.
  // This is where calls the API and waits for a response.If the status is 402, 
  // Spoonacular is showing that the daily quota is all used.
  // Otherwise, it converts the response to JSON so you can use the data.
   fetch(url)
    .then(res => {
      if (res.status === 402) {
        recipesEl.innerHTML = `<p>Daily API quota exceeded. Please try again tomorrow.</p>`;
        msgEl.textContent = "API limit reached"; 
        throw new Error("Quota reached");
      }
      return res.json();
    })

    // If the fetch is successful, it processes the data.
    // It normalizes the data to a consistent format and stores it in the DATA array.
    // Finally, it calls showRecipes to display the recipes on the page.
    .then(data => {
      console.log("Fetched data:", data);

      if (!data.results || data.results.length === 0) {
        recipesEl.innerHTML = `<p>No recipes found for your selected filters.</p>`;
        msgEl.textContent = "No results found.";
        return;
      }

      DATA = data.results.map(recipe => ({  //this is the array of recipes Spoonacular gives.  
        title: recipe.title,                // map function to transform to a simpler format so it fits the app.
        image: recipe.image,
        kitchen: recipe.cuisines[0] || "Unknown",
        diet: recipe.diets[0] || "General",
        time: recipe.readyInMinutes || 0,
        ingredients: recipe.extendedIngredients
          ? recipe.extendedIngredients.length
          : 0,
        popularity: recipe.aggregateLikes || 0
      }));

      showRecipes(DATA);
      msgEl.textContent = `Fetched ${DATA.length} recipes (${state.kitchen}, ${state.diet})`;
    })
    
    //Catches problems (like no internet, bad key, or quota) and shows a friendly error.
    .catch(err => {
      console.error("Fetch error:", err);
      recipesEl.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
      msgEl.textContent = "Failed to load recipes.";
    });
};

    // Filter function  (time + ingredients) (locally), Filters the list by the user’s selected time and ingredient count.
    // Returns only recipes that match.
    const filterRecipes = list =>  // Function 2
    list.filter(r => {
    // Cooking time
      if (state.time === "under15" && !(r.time < 15)) return false;
      if (state.time === "15to30" && !(r.time >= 15 && r.time <= 30)) return false;
      if (state.time === "30to60" && !(r.time >= 30 && r.time <= 60)) return false;
      if (state.time === "over60" && !(r.time > 60)) return false;

    // Ingredient amount
      if (state.ingredients === "under5" && !(r.ingredients < 5)) return false;
      if (state.ingredients === "6to10" && !(r.ingredients >= 6 && r.ingredients <= 10)) return false;
      if (state.ingredients === "11to15" && !(r.ingredients >= 11 && r.ingredients <= 15)) return false;
      if (state.ingredients === "over16" && !(r.ingredients > 16)) return false;

    return true;
  });

//Sort recispes
const sortRecipes = list => {  // Function 3 Sort recipes (by time, ingredients, or popularity)
  const key = state.sort;
  const sorted = [...list];
  sorted.sort((a, b) =>
    state.order === "asc" ? a[key] - b[key] : b[key] - a[key] // sorting logic based on selected key and order
  );
  return sorted;
};

// Show recipes in the HTML
// First filters and sorts the recipe list. then builds HTML <div> cards for each recipe.
// Displays them inside <main id="recipes"> and updates the message line at the top with  current filters.
const showRecipes = list => { // Function 4 
  const filtered = filterRecipes(list); //streching the goal, combine filter and sorting 
  const sorted = sortRecipes(filtered);

  recipesEl.innerHTML = sorted.length
    ? sorted
        .map(
          r => `
      <div class="card">
        <img src="${r.image}" alt="${r.title}" class="card-img">
        <div class="card-body">
          <h3>${r.title}</h3>
          <p><strong>Cuisine:</strong> ${r.kitchen}</p>
          <p><strong>Diet:</strong> ${r.diet}</p>
          <p><strong>Time:</strong> ${r.time} min</p>
          <p><strong>Ingredients:</strong> ${r.ingredients}</p>
          <p><strong>Popularity:</strong> ${r.popularity}</p>
        </div>
      </div>`
        )
        .join("")
    : `<p>No recipes match your filters.</p>`;

  msgEl.textContent = `Results: ${sorted.length} | Kitchen: ${state.kitchen} | Diet: ${state.diet} | Sort: ${state.sort} (${state.order})`;
};

// The event listeners for the filter and sort buttons (pills).
// When a button is clicked, it updates the state, highlights the active button,
// and either fetches new data (for kitchen or diet changes) or updates the displayed recipes (for other filters).
pills.forEach(btn => {
  btn.addEventListener("click", () => {
    const group = btn.parentElement.querySelectorAll(".pill");
    group.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (btn.dataset.kitchen) state.kitchen = btn.dataset.kitchen;
    if (btn.dataset.diet) state.diet = btn.dataset.diet;
    if (btn.dataset.time) state.time = btn.dataset.time;
    if (btn.dataset.ingredients) state.ingredients = btn.dataset.ingredients;
    if (btn.dataset.sort) state.sort = btn.dataset.sort;
    if (btn.dataset.order) state.order = btn.dataset.order;

    // If user changes kitchen or diet → refetch from API
    if (btn.dataset.kitchen || btn.dataset.diet) {
      fetchData();
    } else {
      // Other filters (time, ingredients, sorting) work locally
      showRecipes(DATA);
    }
  });
});
randomBtn.addEventListener("click", () => { // 👈 added here
  const random = DATA[Math.floor(Math.random() * DATA.length)];
  showRecipes([random]);
});

// Runs automatically once when the page loads — it fetches the first batch of recipe
fetchData();
