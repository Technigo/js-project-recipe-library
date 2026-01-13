const API_KEY = "c4791e847ed74bd093c0b702927d5d37";
const url = `https://api.spoonacular.com/recipes/complexSearch?number=10&addRecipeInformation=true&apiKey="c4791e847ed74bd093c0b702927d5d37"&cuisine=Asian,Italian,Mexican,Mediterranean,Middle Eastern,European`;
const container = document.getElementById("container");

// switch between local and api
let useAPI = false;

let currentRecipes = [];

const localRecipes = [
  {
    title: "Test Carbonara",
    image: "https://via.placeholder.com/300x200?text=Carbonara",
    cuisines: ["Italian"],
    readyInMinutes: 25,
    summary: "A simple test version of the Italian classic pasta dish."
  },
  {
    title: "Fake Fried Chicken",
    image: "https://via.placeholder.com/300x200?text=Chicken",
    cuisines: ["American"],
    readyInMinutes: 45,
    summary: "Crispy and juicy fried chicken – test edition."
  },
  {
    title: "Quick Sushi",
    image: "https://via.placeholder.com/300x200?text=Sushi",
    cuisines: ["Chinese"],
    readyInMinutes: 15,
    summary: "Super fast sushi for testing sorting and filtering."
  }
];

const fetchRecipes = async (cuisine = "") => {
 container.innerHTML = "<p>Loading...</p>";

 let url = `https://api.spoonacular.com/recipes/complexSearch?number=4&addRecipeInformation=true&apiKey=c4791e847ed74bd093c0b702927d5d37`;
 
 if (cuisine && cuisine !== "All") {
    url += `&cuisine=${cuisine}`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();

        currentRecipes = data.results;
        renderRecipes(data.results);
            } catch (error) {
            container.innerHTML = "<p>Failed to fetch recipes.</p>";
            console.error(error);
        }
    };



const renderRecipes = (recipes) => {
    container.innerHTML = "";

recipes.forEach(recipe => {
    container.innerHTML += `
        <div class="card">
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}" alt="${recipe.title}" />
        <hr>
        <h4>${recipe.cuisines.join(", ")}</h4>
        <h4>${recipe.readyInMinutes} min</h4>
        </div>
        `;
    });
};

// Anropa direkt för att visa "alla"
// fetchRecipes();
const loadLocalRecipes = () => {
  currentRecipes = localRecipes;
  renderRecipes(currentRecipes);
};

loadLocalRecipes();

// Koppla till cuisine-knappar
const cuisineButtons = document.querySelectorAll("#originalCuisineSorter .button");

cuisineButtons.forEach(button => {
  button.addEventListener("click", () => {
    const cuisine = button.dataset.cuisine;

    if (useAPI) {
      fetchRecipes(cuisine); // hämta från API
    } else {
      if (cuisine === "All") {
        currentRecipes = localRecipes;
      } else {
        currentRecipes = localRecipes.filter(recipe =>
          recipe.cuisines.includes(cuisine)
        );
      }
      renderRecipes(currentRecipes);
    }
  });
});


// Time
const ascBtn = document.getElementById("ascBtn");
ascBtn.addEventListener("click", () => {
    const sorted = [...currentRecipes].sort((a, b) => a.readyInMinutes - b.readyInMinutes);
    renderRecipes(sorted);
});

const dscBtn = document.getElementById("dscBtn");

dscBtn.addEventListener("click", () => {
    const sorted = [...currentRecipes].sort((a, b) => b.readyInMinutes - a.readyInMinutes);

    renderRecipes(sorted);
});


// Switch betwween api and local
const toggleBtn = document.getElementById("toggleBtn");

toggleBtn.addEventListener("click", () => {
  useAPI = !useAPI;

  toggleBtn.textContent = useAPI ? "Use Local" : "Use API";

  if (useAPI) {
    fetchRecipes(); // Hämta från API
  } else {
    currentRecipes = localRecipes; // Använd lokala
    renderRecipes(currentRecipes);
  }
});


// Search input
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", async (e) => {
  const searchTerm = e.target.value.trim().toLowerCase();

  if (searchTerm === "") {
    if (useAPI) {
      await fetchRecipes(); // hämta alla från API igen
    } else {
      renderRecipes(localRecipes);
    }
    return;
  }

  if (useAPI) {
    try {
      const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
        searchTerm
      )}&number=10&addRecipeInformation=true&apiKey=${API_KEY}`;

      container.innerHTML = "<p>Searching...</p>";
      const res = await fetch(url);
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        container.innerHTML = `<p>No API results for "${searchTerm}".</p>`;
        return;
      }

      // Filtrera resultaten manuellt på titel och ingredienser
      const filtered = data.results.filter(recipe => {
        const titleMatch = recipe.title.toLowerCase().includes(searchTerm);
        const ingredientMatch = recipe.extendedIngredients?.some(ing =>
          ing.name.toLowerCase().includes(searchTerm)
        );
        return titleMatch || ingredientMatch;
      });

      currentRecipes = filtered;
      if (filtered.length > 0) {
        renderRecipes(filtered);
      } else {
        container.innerHTML = `<p>No results found for "${searchTerm}".</p>`;
      }
    } catch (error) {
      console.error("API Search error:", error);
      container.innerHTML = "<p>Failed to fetch from API.</p>";
    }
  } else {
    // Lokal sökning
    const filtered = localRecipes.filter(recipe => {
      const titleMatch = recipe.title.toLowerCase().includes(searchTerm);
      const ingredientMatch = recipe.ingredients?.some(ing =>
        ing.toLowerCase().includes(searchTerm)
      );
      return titleMatch || ingredientMatch;
    });

    currentRecipes = filtered;

    if (filtered.length > 0) {
      renderRecipes(filtered);
    } else {
      container.innerHTML = `<p>No local results found for "${searchTerm}".</p>`;
    }
  }
});