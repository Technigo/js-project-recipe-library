# Project: Recipe Library

A Week 6 project from Technigo’s **Advanced JavaScript & TypeScript** course.  
Goal: work with **arrays, objects, loops**, and dynamic **DOM rendering** by creating a recipe app where users can **filter**, **sort**, and **randomize** recipes from real data.

---

## What’s this about?

This week is all about **moving from hardcoded UI to data-driven components**:
- Display recipes from a real `recipes` array
- Use `.map()` to render HTML dynamically
- Use `.filter()` to narrow results by user input
- Use `.sort()` to reorder results by time or ingredients
- Update the DOM based on what the user selects
- Keep everything modular and clean using **functions**

---

## Tech / What I built with

- **HTML/CSS** for structure and layout
  - CSS Grid for responsive recipe layout
  - CSS Animations for loader and transitions
  - Modern CSS with custom properties (CSS variables)
- **Vanilla JavaScript**
  - `map()`, `filter()`, `sort()` for array logic
  - `async/await` for API calls and asynchronous operations
  - `fetch()` API for retrieving recipes from Spoonacular
  - `localStorage` for caching API responses
  - `addEventListener()` for interactivity
  - `innerHTML` and `classList` for DOM updates
  - Modular **render + logic functions**
  - `Math.random()` for picking a random recipe
- **Spoonacular API** for real recipe data
- **Lucide Icons** for UI icons

---

## Project requirements (from the brief)

- Display all recipes from a `recipes` array when the page loads :white_check_mark:
- Enable filtering by at least one property (e.g. cuisine, diet, time)
- Enable sorting by at least one property (e.g. time or ingredients count)
- Include a "random recipe" button :white_check_mark:
- Show an empty state when no recipes match the filter
- Responsive design (320px → 1600px+ screens)

---

## How it works

### Data Fetching
- On page load, the app fetches 15 random recipes from the **Spoonacular API**
- API responses are **cached in localStorage** to avoid unnecessary requests and respect API quotas
- A **loading spinner** is displayed for minimum 1.5 seconds for better UX
- If the API fails or quota is exceeded, the app falls back to local recipe data

### Recipe Display & Filtering
- All recipes are rendered using `.map().join("")` into the DOM
- **Enhanced search** with icon allows filtering by recipe title or ingredients
- **Quick cuisine filters** (5 most common) are visible in the main toolbar
- **"All Filters" button** opens a sliding sidebar with all 12 cuisine options
- When a user selects a **filter** or **sort option**:
  1. A function updates the active class
  2. Filtering and sorting functions return a new array
  3. `renderRecipes()` displays the updated list
- A random button uses `Math.random()` to pick one recipe
- **Favorites system** allows users to like/unlike recipes (saved in localStorage)
- If no recipes match, a friendly "no results" message is shown

---

## If you want to run it

1. Clone or download this repo
2. Open `index.html` in your browser
3. That’s it — no build tools or npm needed

---

## What I learned

### This Week (API Integration & Advanced Features)
- How to work with **async/await** for cleaner asynchronous code
- Fetching data from a **real API** and handling responses
- Implementing **error handling** and fallback strategies
- Using **localStorage** for caching and persistent data
- Creating a **loading state** with proper timing to ensure visibility
- Building a **sliding sidebar** with CSS transforms
- Managing multiple filter states and keeping UI in sync

### Previous Weeks
- How to loop and transform arrays with `.map()`
- How to build **reusable rendering functions**
- How to structure filtering and sorting logic in clean ways
- How to update the DOM based on data changes
- Importance of `.join("")` to avoid comma issues in HTML
- How to pick a random item from an array

---

## Accessibility notes

- Real `<button>` elements used for better accessibility
- Focus state is styled for keyboard navigation
- Semantic structure (headings, lists, image alt text)

---

## Features Implemented

✅ **API Integration**
- Fetches recipes from Spoonacular API
- Caches responses in localStorage
- Graceful fallback to local data

✅ **Loading State**
- Animated spinner with "Loading delicious recipes..." text
- Minimum display time for better UX

✅ **Enhanced Search**
- Modern search input with icon
- Searches recipe titles and ingredients
- Real-time filtering as you type

✅ **Smart Filter System**
- Quick access to 5 most common cuisines
- "All Filters" button reveals sidebar with all 12 options
- Sidebar slides in smoothly from left
- Closes on selection or clicking outside

✅ **Favorites System**
- Like/unlike recipes with heart icon
- Filter to show only favorites
- Persists across page refreshes

✅ **Sorting & Filtering**
- Filter by cuisine type
- Filter by popularity
- Sort by cooking time (ascending/descending)
- Random recipe button

✅ **Responsive Design**
- Mobile-first approach
- Works from 320px to 1600px+ screens
- Grid layout adapts to screen size

## Next steps

- Add recipe detail modal/page
- Implement dietary restriction filters
- Add recipe rating system
- Enable recipe sharing

---

## Changelog

- **Sep 2025 – Week 5**: Basic UI with placeholder data and conditionals
- **Oct 2025 – Week 6**: Switched to real data with arrays, objects, `.map()`, `.filter()`, and dynamic rendering
- **Oct 2025 – Week 7**: 
  - Integrated Spoonacular API for real recipe data
  - Implemented loading state with spinner animation
  - Added localStorage caching for API responses
  - Created sliding sidebar for extended filter options
  - Enhanced search functionality with real-time filtering
  - Built favorites system with localStorage persistence
  - Improved UI with modern search input and icons

---

Built in Lund with lots of coffee ☕ and way too many console.logs 📟