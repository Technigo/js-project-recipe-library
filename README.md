# Recipe Library

This is my Recipe Library project for the "Advanced JavaScript Technologies and TypeScript" course.

## Live Demo

👉 [View the live site here](https://cathirecipesite.netlify.app/)

## Features

- Fetches 100 real recipes using Spoonacular's `recipes/random` API
- Recipes are stored in localStorage to reduce API usage
- Displays recipe cards with:
  - Title, image (with fallback if image is broken)
  - Cooking time
  - Diet & cuisine type
  - Link to full recipe
- Filter recipes by:
  - Diet (e.g. vegan, vegetarian, gluten-free)
  - Cuisine (e.g. Italian, Mediterranean)
  - Cooking time ranges
- Sort recipes by:
  - Cooking time
  - Popularity
- Combine multiple filters & sorting
- Live search for ingredients, cuisines, or recipe names
- Random recipe button
- Pagination (5 recipes per page on mobile, 10 on desktop)
- Clear filters resets everything (filters, pagination, search)
- Responsive design: optimized from mobile (320px) to large screens (1600px+)
- Displays:
  - Loading state while fetching
  - Friendly empty state if no recipes match
  - Error message if API quota is exceeded

## Built With

- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- Responsive design (media queries)
- Spoonacular API

## How to Use

1. Clone or download the repo
2. Open `index.html` in your browser
3. Or visit the [live site](https://cathirecipesite.netlify.app/)!

---

Created by Cathi with ❤️ during the JavaScript course at Technigo.
