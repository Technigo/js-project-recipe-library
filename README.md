# js-project-recipe-library
Technigo project: recipe library.
This is a web app that displays recipes from the Spoonacular API. It allows users to search, filter and sort the recipes. Check it out at:

https://nicolina-recipe-library.netlify.app/

## Features
### ✅ Dynamic Recipe Display
* Fetches live recipe data from the Spoonacular API
* Displays recipes as responsive cards with images, ingredients, cuisine type, prep time, and health score.

### ✅ Filtering Options
* Users can filter recipes by diet (e.g., vegetarian, vegan) or dish type (e.g., side dish, dessert).

* Selecting a filter dynamically updates the recipes shown on the page.

### ✅ Sorting Options
* Sort recipes by cooking time or health score.
* Updates the DOM immediately when a sorting option is selected.

### ✅ Search Functionality
* Search bar filters recipes in real-time by title.

### ✅ Random Recipe Button
* Clicking the “Random Recipe” button displays one random recipe.
* Clicking again returns to the full recipe list.

### ✅ Empty State
* If no recipes match the selected filters or search, a message is displayed to let the user know to try something different.

### ✅ API Fallback
* If the Spoonacular API daily request limit is reached, the app automatically loads locally stored backup data and notifies the user with an alert message.

### ✅ Responsive Design
* Layout adjusts smoothly from mobile (320px) to large desktop screens (1600px).
* Uses CSS Grid and Flexbox for adaptive and clean alignment.

## 🛠️ Technologies Used

* HTML, Structure and semantic content

* CSS, Responsive design and styling

* JavaScript, Dynamic content rendering, API calls, filtering & sorting

* Spoonacular API – Recipe data source
