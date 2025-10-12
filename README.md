# Recipe Library

**Live:** https://library-recipe.netlify.app/

A recipe browser built with **HTML/CSS/JavaScript** that fetches data from the Spoonacular API.

---

## Features

- Fetches recipes from Spoonacular `/recipes/complexSearch` with:
  - `addRecipeInformation=true` (get images, ingredients, etc.)
  - `instructionsRequired=true` (avoid empty/how-to)
  - `fillIngredients=true` (include ingredient list)
  - `sort=random` (or `popularity` if you prefer more complete metadata)
- **Local cache** with TTL (6 hours) via `localStorage` → faster reloads, fewer API calls.
- **Normalization layer**: turns messy API objects into a small, predictable shape for the UI.
- **Filters & sorting** (cuisine, diet, time, popularity) + free‑text **search** (title/ingredients).
- **Accessible rendering**: live status messages + `aria-busy` while grid updates (and cleared after render).
- **Quota/Offline fallback**: shows cached data or a friendly message when the API is unavailable.
- **Random recipe** button (renders one card from the current dataset).
- **View recipe** button (popup with recipe details and a close “X” button).

---

## Tech Stack

- **HTML** (semantic structure + `<template>` for cards)
- **CSS** (responsive grid, clean tokens/variables)
- **JavaScript** (fetch, normalize, cache, render)

---

## Project Structure

```
.
├── README.md
├── backupData.js
├── index.html
├── script.js
└── style.css
```

---

## HTML (overview)

- **Semantic layout**: header → filter controls → main grid
- **Card template**: a `<template id="cardTpl">` contains the markup for a recipe card; JavaScript clones it per recipe.
- **Filter panels**: each control sits in a `.panel` with a `<label>` and a `<select>` / `<input>`
- **Grid**: `<section id="grid" class="grid">` is where the cards render
- **Recipe details popup**: hidden overlay `#popup-recipe` toggled by the “View recipe” button
- **ARIA**:
- `role="status"` + `aria-live="polite"` on the status line announces updates like “Showing 24 recipes…”.  
- `aria-busy` on `#grid` while rendering tells assistive tech the region is updating.  
- The popup uses `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` so screen readers get a proper dialog with a title.

---

## CSS (overview)

- **Design tokens in `:root`** – all colors, shadows, and sizes as variables (DRY).
- **Filter layout** – `.filter-container` is `flex` with `flex-wrap`; each `.panel` has a fixed width `--control-w` for stable wrapping.
- **Controls** – shared base in `.select`; variants `.select--green` and `.select--pink`. Selected values are marked with `.is-selected`. Chevrons are drawn via `background-image` (no extra markup).
- **Grid for cards** – `.grid` uses CSS Grid:
  ```css
  .grid {
    display: grid;
    gap: var(--card-gap);
    grid-template-columns: repeat(auto-fill, minmax(var(--card-min), 1fr));
  }
  ```

---

## JavaScript (overview)

1) **Get an API key** from Spoonacular (free/student).  
2) In `script.js`, set:
```js
const API_KEY = "YOUR_API_KEY_HERE";
```
3) Optional: change how many recipes to load on startup:
```js
fetchRecipes(24); // try 12, 24, 36 ...
```

### Configure cuisines
This project fetches a defined set of cuisines via a constant array and builds the query string safely:

```js
/* -----------------------
   1) API CONFIG
   ----------------------- */
const API_KEY = "YOUR_API_KEY_HERE";
const CUISINES = ["Italian", "American", "Chinese", "Asian", "Mediterranean", "Middle Eastern"];

const API_URL = (n = 24) =>
  `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&number=${n}&cuisine=${encodeURIComponent(
    CUISINES.join(',')
  )}&addRecipeInformation=true&instructionsRequired=true&fillIngredients=true&sort=random`;
```

- `CUISINES` is a readable list you can edit in one place.  
- `encodeURIComponent(CUISINES.join(','))` ensures the full comma-separated value is URL-safe (e.g., `"Middle Eastern"`).  
- Safe flags used: `addRecipeInformation`, `instructionsRequired`, `fillIngredients`, and `sort`.

---

## How It Works (10 parts)

> The code is intentionally organized into small, named functions with clear headers.

### 1) API config
Builds the full request URL using your API key, number of recipes, a **CUISINES** array, and safe parameters.

### 2) Cache & UI constants
Defines constants like `CACHE_KEY`, `CACHE_TTL_MS` (6 hours), `MAX_INGREDIENTS`, and a global `RECIPES` array (the app’s in‑memory “working data”).

### 3) DOM helpers
A tiny `$()` helper for `getElementById`. Stores a reference to `#grid` (the card container) and exposes `setBusy(on)` which toggles `aria-busy` while rendering.

### 4) String helpers/formatters
Reusable utilities to avoid repeating formatting logic:
- `toKebabCase("Middle Eastern") → "middle-eastern"` (stable codes for filters)
- `toTitleCase("middle-eastern") → "Middle Eastern"` (nice UI labels)
- `minutesToLabel(… )` → human time buckets (e.g., “15–30 min”)
- `starsFromPopularity(p)` → 0–5 star string from spoonacular 0–100 popularity score:

| Popularity | Stars |
|-----------:|:-----:|
| 0          | ☆☆☆☆☆ |
| 10         | ★☆☆☆☆ |
| 35         | ★★☆☆☆ |
| 65         | ★★★☆☆ |
| 85         | ★★★★☆ |
| 100        | ★★★★★ |

### 5) Normalization
`normalizeRecipe(raw)` maps raw API items into a compact, predictable shape the UI trusts:
```js
{ id, title, cuisine, cuisines[], diet, timeMin, popularity, imageUrl, ingredients[] }
```
- Diet is reduced to **one** tag (`vegan / vegetarian / gluten-free / dairy-free / none`).
- Popularity prefers `spoonacularScore`; falls back to `aggregateLikes` (capped at 100).

### 6) Cache functions
- `writeCache(recipes)` → writes `{ ts, data }` to `localStorage`.
- `readCache(ignoreTTL = false)` →
  - `ignoreTTL=false`: return only if fresh (<= TTL).
  - `ignoreTTL=true`: allow stale cache for offline/quota fallback.

### 7) Fetch with quota handling
The flow is: show loading → try **fresh cache** → try **API** → normalize → cache → render.
On errors (e.g., HTTP **402/429** for quota):
- Try **stale cache** (`readCache(true)`).
- If available, use bundled **`backupData`** (static fallback).
- Otherwise show a friendly **empty state** in the grid and a clear status message.

cache → API → normalize → cache → render; graceful fallback on 402/429/offline

### 8) Filtering & sorting
Applies the current UI selections:
- Filter by **cuisine**, **diet**, and **search** (title + ingredients).
- Sort by **popularity** and/or **time**.

### 9) Rendering
Clones a hidden `<template>` for each recipe, fills in fields (image, title, meta, ingredients), and updates an ARIA live status. Renders an empty state if no results.
Each card includes a small **“View recipe”** button (`.btn-view`).

### 10) Events & init
- Wires dropdowns and search to re‑render on change; search is **debounced** so typing doesn’t reflow every keystroke.
- Keeps visual state in sync by toggling `.is-selected` when a control has a value.
- **Random** button picks one from `RECIPES` and renders it.
- **View recipe** opens a popup overlay (`#popup-recipe`) and fills it with image/meta/ingredients; close via **X**, clicking backdrop, or **Escape**.
- Entry point calls `fetchRecipes(24)` to populate on load.

---

## Full Data Flow (with arrows)

```
[PAGE LOAD]
   │
   ▼
(10) init → fetchRecipes(n)
   │
   ▼
(7) fetch
  ├─ try (6) loadCache → YES → (9) render "cache"
  └─ NO → API → JSON → (5) normalize → (6) saveCache → (9) render "api"
     └─ on error/quota → in-memory or stale cache → render "stale" → else empty state
   │
   ▼
(8) filter/sort/search → (9) render "filters"
   │
   ▼
Random → pick 1 from RECIPES → render
```

---

## Error Handling & Quota

- **402 / 429** → “Daily API quota reached” message.  
- Falls back to fresh cache → stale cache → bundled `backupData` → empty state.  
- Always fails **gracefully** with helpful messages instead of crashing.

---

## Accessibility

- `aria-busy` while rendering the grid
- Live status region (`role="status"`) that announces what’s shown
- Popup dialog with `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Clear empty/error states

---

Happy cooking & coding! 🍝
