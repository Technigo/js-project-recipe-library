const BASE_URL = "https://api.spoonacular.com/recipes";
const API_KEY = "e6dc8a39f6e14b3cac66bfcca7d84130"
const URL = `${BASE_URL}/?apiKey=${API_KEY}&number=150`
// GET https://api.spoonacular.com/food/search
// GET https://api.spoonacular.com/recipes/complexSearch
// GET https://api.spoonacular.com/recipes/complexSearch?query=pasta&maxFat=25&number=2
// GET https://api.spoonacular.com/recipes/findByNutrients
// GET https://api.spoonacular.com/recipes/findByNutrients?minCarbs=10&maxCarbs=50&number=2
// GET https://api.spoonacular.com/recipes/findByIngredients
// GET https://api.spoonacular.com/recipes/{716429}/information
// GET https://api.spoonacular.com/recipes/{644861}/information
// GET https://api.spoonacular.com/recipes/716429/information?includeNutrition=false
// GET https://api.spoonacular.com/recipes/644861/information?includeNutrition=false
// GET https://api.spoonacular.com/recipes/informationBulk
// GET https://api.spoonacular.com/recipes/informationBulk?ids=716429
// GET https://api.spoonacular.com/recipes/informationBulk?ids=644861
// GET https://api.spoonacular.com/recipes/{716429}/similar
// GET https://api.spoonacular.com/recipes/644861/similar
// GET https://api.spoonacular.com/recipes/random
// GET https://api.spoonacular.com/recipes/random?number=1&include-tags=vegetarian,dessert&exclude-tags=quinoa
// GET https://api.spoonacular.com/recipes/autocomplete
// GET https://api.spoonacular.com/recipes/autocomplete?number=150&query=chick
// GET https://api.spoonacular.com/recipes/{716429}/tasteWidget.json
// GET https://api.spoonacular.com/recipes/644861/tasteWidget.json
// GET https://api.spoonacular.com/recipes/{716429}/equipmentWidget.json
// GET https://api.spoonacular.com/recipes/644861/equipmentWidget.json
// GET https://api.spoonacular.com/recipes/{716429}/priceBreakdownWidget.json
// GET https://api.spoonacular.com/recipes/644861/priceBreakdownWidget.json
// GET https://api.spoonacular.com/recipes/{716429}/ingredientWidget.json
// GET https://api.spoonacular.com/recipes/644861/ingredientWidget.json
// GET https://api.spoonacular.com/recipes/{716429}/nutritionWidget.json
// GET https://api.spoonacular.com/recipes/644861/nutritionWidget.json
// GET https://api.spoonacular.com/recipes/{716429}/analyzedInstructions
// GET https://api.spoonacular.com/recipes/644861/analyzedInstructions
// GET https://api.spoonacular.com/recipes/extract
// GET https://api.spoonacular.com/recipes/extract?url=https://foodista.com/recipe/4BMVR7W2/Gluten-Free-Yellow-Cake-And-Cupcakes
// GET https://api.spoonacular.com/food/ingredients/search
// GET https://api.spoonacular.com/food/ingredients/{716429}/information
// GET https://api.spoonacular.com/food/ingredients/{644861}/information
// GET https://api.spoonacular.com/food/ingredients/716429/information?amount=1
// GET https://api.spoonacular.com/food/ingredients/644861/information?amount=1
// GET https://api.spoonacular.com/food/ingredients/{716429}/amount
// GET https://api.spoonacular.com/food/ingredients/{644861}/amount
// GET https://api.spoonacular.com/food/menuItems/search
// GET https://api.spoonacular.com/food/menuItems/{716429}
// GET https://api.spoonacular.com/food/menuItems/{644861}
// GET https://api.spoonacular.com/recipes/{716429}/card
// GET https://api.spoonacular.com/recipes/{644861}/card
// POST https://api.spoonacular.com/recipes/visualizeRecipe
// fetch a lot of recipes

const fetchRecipies = async () => {
  try {
    const response = await fetch(URL)

    if (!response.ok) {
      throw new Error(`Error! Status: ${response.status}`)
    }

    const data = await response.json()
    console.log('data', data)

    // ensure that we have at least one cuisine AND an image AND a title 
    const validRecipes = data.recipes.filter(recipe => {
    return recipe.cuisines.length > 0 && recipe.image && recipe.title
    })

    console.log(validRecipes)
  } catch (error) {
    console.error('error:', error.message)
  }
  await fetch("https://example.org/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: "example" }),
    // ...
  });
  //render valid recipes in the DOM
  // renderRecipes(validRecipes)
  // render valid recipes in the DOM
  // render valid recipes in the DOM
  // render valid recipes in the DOM
  // renderRecipes(validRecipes)
}; // return validRecipes
fetchRecipies();
// const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";
const recipes = [
    {
        id: 1,
        title: "Vegan Lentil Soup",
        image: "./chicken.webp",
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
        image: "./chicken.webp",
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
        image: "./chicken.webp",
        readyInMinutes: 20,
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
        image: "./chicken.webp",
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
        image: "./chicken.webp",
        readyInMinutes: 10,
        servings: 4,
        sourceUrl: "https://example.com/middle-eastern-hummus",
        diets: ["vegan", "gluten-free"],
        cuisine: "Middle Eastern",
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
        image: "./chicken.webp",
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
        image: "./chicken.webp",
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
];
    // render recipes in the DOM
    // Removed duplicate declaration of exampleResponse
    // Removed duplicate declaration of exampleResponse



// const aRecipe = "Recipelibary";
const exampleResponse = {
    "recipes": [
        {
            "id": 716429,
            "title": "Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs",
            "image": "https://img.spoonacular.com/recipes/716429-312x231.jpg",
            "imageType": "jpg"
        }
    ],
    "totalResults": 1
};
const Response = {
    "recipes": [
      {
        "id": 644861,
        "image": "https://img.spoonacular.com/recipes/644861-556x370.jpg",
        "imageType": "jpg",
        "title": "Gluten Free Yellow Cake And Cupcakes",
        "readyInMinutes": 45,
        "servings": 24,
        "sourceUrl": "https://www.foodista.com/recipe/4BMVR7W2/gluten-free-yellow-cake-and-cupcakes",
        "vegetarian": true,
        "italian": true,
        "glutenFree": true,
        "dairyFree": false,
        "veryHealthy": true,
        "cheap": false,
        "veryPopular": false,
        "sustainable": true,
        "lowFodmap": true,
        "weightWatcherSmartPoints": 12,
        "gaps": "no",
        "preparationMinutes": null,
        "cookingMinutes": null,
        "aggregateLikes": 7,
        "healthScore": 0,
        "creditsText": "Foodista.com – The Cooking Encyclopedia Everyone Can Edit",
        "license": "CC BY 3.0",
        "sourceName": "Foodista",
        "pricePerServing": 54.16,
        "extendedIngredients": [
          { "name": "coconut flour" },
          { "name": "tapioca flour" },
          { "name": "salt" }
        ],
        "summary": "Gluten Free Yellow Cake And Cupcakes might be just the <b>American</b> recipe you are searching for. This gluten free and fodmap friendly recipe serves 24 and costs <b>54 cents per serving</b>. This dessert has <b>265 calories</b>, <b>2g of protein</b>, and <b>18g of fat</b> per serving. 7 people were glad they tried this recipe. This recipe from Foodista requires veganaise, baking powder, milk alternative, and baking soda. From preparation to the plate, this recipe takes approximately <b>45 minutes</b>. Overall, this recipe earns an <b>improvable spoonacular score of 10%</b>. Similar recipes include <a href=\"https://spoonacular.com/recipes/gluten-free-yellow-cupcakes-357200\">Gluten-Free Yellow Cupcakes</a>, <a href=\"https://spoonacular.com/recipes/gluten-free-yellow-cake-562660\">Gluten Free Yellow Cake</a>, and <a href=\"https://spoonacular.com/recipes/gluten-free-yellow-banana-cake-728994\">Gluten Free Yellow Banana Cake</a>.",
        "cuisines": [
          "American"
        ],
        "dishTypes": [
          "dessert"
        ],
        "diets": [
          "gluten free",
          "fodmap friendly"
        ],
        "occasions": [],
        "instructions": "Preheat oven to 350 degrees. Grease two 8 or 9 inch round cake pans and sprinkle with tapioca flour if youre making a layer cake. Otherwise, line a muffin tin with baking cups.\nMix together the coconut flour, tapioca flour, salt, xanthan gum, baking soda, and baking powder. Set aside.\nBeat the eggs, sugar, and mayonnaise until fluffy.\nThen slowly add the vanilla, flour mixture, and milk. Alternating between the flour and milk to make a nice fluffy cake. Note- I usually use just barely under 3/4 C of the milk alternative.\nPour the batter into the greased cake pans or fill the baking cups 3/4 full (makes 24 cupcakes).\nBake for 20-25 minutes for the cakes or 12-15 minutes for the cupcakes. Cakes are done when they are nicely browned and spring back when lightly touched or when a toothpick inserted in center comes out clean. Let cool completely before icing.\nFor The Icing:\nBring a small saucepan of water to a boil. Place a heatproof bowl over the saucepan (make sure the water isnt touching the bottom) and add the chocolate and butter.\nStir until melted. Then, add the remaining ingredients.\nPlace uncovered in freezer for 15 minutes.\nBeat with hand mixer until light and fluffy. If its too runny, place back in freezer a few minutes and repeat process until the icing is a good consistency.",
        "analyzedInstructions": [
          {
            "name": "",
            "steps": [
              {
                "number": 1,
                "step": "Preheat oven to 350 degrees. Grease two 8 or 9 inch round cake pans and sprinkle with tapioca flour if youre making a layer cake. Otherwise, line a muffin tin with baking cups."
              },
              {
                "number": 2,
                "step": "Mix together the coconut flour, tapioca flour, salt, xanthan gum, baking soda, and baking powder. Set aside."
              },
              {
                "number": 3,
                "step": "Beat the eggs, sugar, and mayonnaise until fluffy."
            }
            ]
          }
        ],
        "originalId": null,
        "spoonacularScore": 11.655736923217773,
        "spoonacularSourceUrl": "https://spoonacular.com/gluten-free-yellow-cake-and-cupcakes-644861"
      }
    ]
  }
// render valid Recipies(validRecipies)
localStorage.setItem("recipes", JSON.stringify(recipes));
const storedRecipes = localStorage.getItem("recipes");
const getDinnerMenu = () => {};
const randomButton = document.getElementById("heart-button");
const answer = document.getElementById("View-favorite-recipe-button");
randomButton.addEventListener('click', getFavoriteRecipeFirst);
heartButton.addEventListener("click", getDinnerMenu);
getDinnerMenu();

const time = [
  "Under 15 min",
  "15-30 min",
  "30-60 min",
  "Over 60 min"
];
const ingredients = [
  "Under 5 ingredients",
  "6-10 ingredients",
  "11-15 ingredients",
  "Over 16 ingredients"
];



// Removed duplicate declaration of recipes


