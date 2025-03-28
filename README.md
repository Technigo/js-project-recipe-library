# js-project-recipe-library

## Live Demo
[https://talorecipes.netlify.app/](https://talorecipes.netlify.app/)

**Recipe Library**

Recipe Library is a dynamic web app that fetches real recipe data from Spoonacular’s `/recipes/random` endpoint and displays recipe cards when the page loads. It lets users filter by **dietary preferences**, **cuisine**, **cooking time**, and **ingredient count**, and sort recipes by various criteria. Users can also click a **"Surprise me!"** button to display a random recipe.

**Requirements Implemented:**
- **Real API data:** Fetches recipes from Spoonacular.
- **Dynamic rendering:** Recipe cards are created dynamically from the API data.
- **Filtering & sorting:** Users can select filters and sorting options; the DOM updates accordingly.
- **Modular code:** Functions are clearly split (fetching, rendering, filtering, sorting, etc.).
- **Random recipe:** A “Surprise me!” button displays a single random recipe.
- **Empty state & error messages:** The app shows a meaningful message when no recipes match or when the API quota is exceeded.
- **Responsive design:** The layout adapts from 320px up to at least 1600px.

**Stretch Goals:**
- **Combined filtering & sorting:** Multiple filters work together (e.g., Vegetarian, Mexican).
- **Local storage caching:** Recipes are cached for one hour using a timestamp, reducing API requests by using localStorage together with an API configuration object.
- **Loading state:** A loading message is shown while data is being fetched.
- **Infinite scrolling:** More recipes are fetched as the user scrolls down.
