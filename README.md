# 🍽️ Recipe Finder — API-driven recipe list

## Live: https://quiet-chebakia-ed7a91.netlify.app/

### A responsive web app that fetches recipes from an external recipe API and allows the user to filter by cuisine, sort by cooking time, and randomly generate a recipe. Built with HTML, CSS, and Vanilla JavaScript (DOM + fetch).

🎯 Purpose

- Practice fetch and async/await against an open API.
- Practice state management in the frontend (active filter, sort direction, last loaded recipes).
- Implement mobile-first and accessible UI logic (buttons, aria labels).

✨ Features

- API retrieval of recipes (title, image, time, possibly cuisine).
- Filtering by cuisine (e.g. Italian, American, Asian, Belgian).
- Sorting by time (ascending/descending).
- "Not sure?" - shows a random recipe from the current list.
- Responsive layout with clear recipe cards.
- Error handling & loading state.

🧩 Technical overview

- bJavaScript (ES6): fetch, async/await, event listeners, DOM update.
- State in memory: currentCuisine, currentSortDir, currentRecipes.
- Data structure: renders cards from the API response (title, image, readyInMinutes, cuisine).
- Accessibility: semantic buttons, aria on the filter section.

🚀 Deployment (Netlify)

- Connect repo → Netlify
- Add env var: SPOONACULAR_API_KEY
- Build command: (empty if pure static page)
- Publish directory: project root (or dist if you are building)
- Deploy → Live: https://quiet-chebakia-ed7a91.netlify.app/