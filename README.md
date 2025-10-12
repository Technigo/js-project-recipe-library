# js-project-recipe-library

### Netlify link:

https://juls-recipe-library.netlify.app/

### Description:

- Recipe Library app
- Fetches random recepies from Spoonacular API (https://spoonacular.com/food-api)
- Users can filter their choices by:
  - Cuisine
  - Dietary options
- Users can sort their choices by:
- ** Filters can be used together (e.g. Vegetarian&Italian will fetch all italian dishes with vegetarian ingredients only) **
- ** Users can to save/like recipes and store them in local storage **
- ** Users can search for a specific recipe **
- ** Local storage caching to reduce API requests is implemented **
- Includes loading stage while the system awaits for response
-

## Requirements:

### Stage 1:

- Users should be able to select at least one filter
- Users should be able to select at least one sorting option
- Use functions to:
  - Get the selected filter
  - Check conditions (e.g. if the user selects "vegetarian", return "falafel")
- Should be responsive and look good on devices from 320px width up to at least 1600px.

### Stage 2:

- Display all of the recipes (and their information) in the array when the website is loaded (using JavaScript)
- Be able to filter the recipes based on at least one of the following filters: cuisine, diets, cooking time and amount of ingredients and update the results in the DOM. Please push yourself to do more though 💪
- Be able to sort on one property, and update the results in the DOM, e.g.
  - from most to least ingredients and vice versa
  - from longest to shortest cooking time and vice versa
- Feature a button that selects a random recipe, and your page should display the selected item
- Have an empty state, e.g. if there are no recipes matching the filter - show a meaningful message to the user
- Should be responsive and look good on devices from 320px width up to at least 1600px.

### Stage 3:

Apart from the requirements from previous weeks, you should:

- Fetch real recipe data from Spoonacular's recipes/random endpoint
- Display dynamic recipe cards based on the API data
- Adapt filtering & sorting to match the API response format
- Show a useful message to the user in case the daily quota has been reached

### Stretch goals:

- Make your filters and sorting options work together so that the user, for example, can filter on vegetarian & popular recipes or Italian vegan recipes
- Implement local storage caching to reduce API requests
- Show a loading state while fetching data
- Allow users to search for specific recipe names or ingredients
- Allow users to save/like recipes and store them in local storage. This includes adding a heart button to the recipe card and adding a "View favourites" button that only shows favourite recipes.
