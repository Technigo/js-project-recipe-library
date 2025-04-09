[x] message if no filters match
[x] correct active state sort btns
[x] FIX filter/sort logic/params!!
[x] random btn
[x] random api
[x] local storage cache _(stretch goal 2)_
[x] clean up functions, prob if/else
[x] message if daily quota met
[x] add multi recipes api
[x] load ingredients properly

// Holding these codes here for study reference.
// Just didn't want to misplace it

/_ // // Function to get a random recipe from Manual Rceipes
// const getRandomRecipe = (recipesArray) => {
// const randomIndex = Math.floor(Math.random() _ recipesArray.length)
// const randomRecipe = recipesArray[randomIndex]

          //   displayRandomRecipe(randomRecipe)
          // }

          // const displayRandomRecipe = (item) => {
          //   const randomRecipeCard = document.createElement('article')
          //   randomRecipeCard.classList.add('recipe-cards')

          //   container.innerHTML = ''

          //   const recipeHTML = `
          //       <img src="./assets/image.png" alt="${item.title}">
          //       <div class="recipe-title">
          //         <h3>${item.title}</h3>
          //       </div>
          //       <div class="recipe-details">
          //         <p class="cuisine"><b>Cuisine:</b> ${item.cuisine}</p>
          //         <p class="time"><b>Time:</b> ${item.readyInMinutes} minutes</p>
          //         <p class="servings"><b>Serves:</b> ${item.servings}</p>
          //       </div>
          //       <div class="ingredients">
          //         <h4>Ingredients:</h4>
          //         <ul>
          //         ${item.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
          //         </ul>
          //       </div>
          //         <a href="${item.sourceUrl}" target="_blank">Full recipe</a>
          //     `

          //   // Insert the HTML content into the random recipe section
          //   randomRecipeCard.innerHTML = recipeHTML
          //   container.appendChild(randomRecipeCard)
          // }
          */

/_ // // Technigo Recipe block
// const manualRecipes = [
// {
// id: 1,
// title: "Vegan Lentil Soup",
// image: "./chicken.webp",
// readyInMinutes: 30,
// servings: 4,
// sourceUrl: "https://example.com/vegan-lentil-soup",
// diets: ["vegan"],
// cuisine: "Mediterranean",
// ingredients: [
// "red lentils",
// "carrots",
// "onion",
// "garlic",
// "tomato paste",
// "cumin",
// "paprika",
// "vegetable broth",
// "olive oil",
// "salt"
// ],
// pricePerServing: 2.5,
// popularity: 85
// },
// {
// id: 2,
// title: "Vegetarian Pesto Pasta",
// image: "./chicken.webp",
// readyInMinutes: 25,
// servings: 2,
// sourceUrl: "https://example.com/vegetarian-pesto-pasta",
// diets: ["vegetarian"],
// cuisine: "Italian",
// ingredients: [
// "pasta",
// "basil",
// "parmesan cheese",
// "garlic",
// "pine nuts",
// "olive oil",
// "salt",
// "black pepper"
// ],
// pricePerServing: 3.0,
// popularity: 92
// },
// {
// id: 3,
// title: "Gluten-Free Chicken Stir-Fry",
// image: "./chicken.webp",
// readyInMinutes: 20,
// servings: 3,
// sourceUrl: "https://example.com/gluten-free-chicken-stir-fry",
// diets: ["gluten-free"],
// cuisine: "Asian",
// ingredients: [
// "chicken breast",
// "broccoli",
// "bell pepper",
// "carrot",
// "soy sauce (gluten-free)",
// "ginger",
// "garlic",
// "sesame oil",
// "cornstarch",
// "green onion",
// "sesame seeds",
// "rice"
// ],
// pricePerServing: 4.0,
// popularity: 78
// },
// {
// id: 4,
// title: "Dairy-Free Tacos",
// image: "./chicken.webp",
// readyInMinutes: 15,
// servings: 2,
// sourceUrl: "https://example.com/dairy-free-tacos",
// diets: ["dairy-free"],
// cuisine: "Mexican",
// ingredients: [
// "corn tortillas",
// "ground beef",
// "taco seasoning",
// "lettuce",
// "tomato",
// "avocado"
// ],
// pricePerServing: 2.8,
// popularity: 88
// },
// {
// id: 5,
// title: "Middle Eastern Hummus",
// image: "./chicken.webp",
// readyInMinutes: 10,
// servings: 4,
// sourceUrl: "https://example.com/middle-eastern-hummus",
// diets: ["vegan", "gluten-free"],
// cuisine: "Middle Eastern",
// ingredients: [
// "chickpeas",
// "tahini",
// "garlic",
// "lemon juice",
// "olive oil"
// ],
// pricePerServing: 1.5,
// popularity: 95
// },
// {
// id: 6,
// title: "Quick Avocado Toast",
// image: "./chicken.webp",
// readyInMinutes: 5,
// servings: 1,
// sourceUrl: "https://example.com/quick-avocado-toast",
// diets: ["vegan"],
// cuisine: "Mediterranean",
// ingredients: [
// "bread",
// "avocado",
// "lemon juice",
// "salt"
// ],
// pricePerServing: 2.0,
// popularity: 90
// },
// {
// id: 7,
// title: "Beef Stew",
// image: "./chicken.webp",
// readyInMinutes: 90,
// servings: 5,
// sourceUrl: "https://example.com/beef-stew",
// diets: [],
// cuisine: "European",
// ingredients: [
// "beef chunks",
// "potatoes",
// "carrots",
// "onion",
// "garlic",
// "tomato paste",
// "beef broth",
// "red wine",
// "bay leaves",
// "thyme",
// "salt",
// "black pepper",
// "butter",
// "flour",
// "celery",
// "mushrooms"
// ],
// pricePerServing: 5.5,
// popularity: 80
// }
// ]
_/
/_ // // const recipesURL = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&number=20&addRecipeInformation=true&cuisine=African,Asian,American,British,Cajun,Caribbean,Chinese,Eastern,European,European,French,German,Greek,Indian,Irish,Italian,Japanese,Jewish,Korean,Latin,American,Mediterranean,Mexican,Middle,Eastern,Nordic,Southern,Spanish,Thai,Vietnamese&fillIngredients=true&addRecipeInstructions=true` _/
