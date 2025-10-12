/* ===========================================================
   Recipe Finder App
   Code is split up into small, named functions that describe what they do(purpose). 
   Each section is clearly marked with a header.

   Sections:
   -1 API config & fetch
   -2 Cache handling
   -3 DOM helpers
   -4 String helpers
   -5 Normalization helpers
   -6 Cache functions
   -7 Fetch with quota handling
   -8 Filtering & sorting
   -9 Rendering
   -10 Event handling & init + random recipe
   =========================================================== */

// Import backup data
import { backupData } from './backupData.js';

/* ===========================================================
   1) API CONFIG
   =========================================================== */
const API_KEY = '42a3e506a5a6493080872a8509f9c7d5';
const CUISINES = ['Italian', 'American', 'Chinese', 'Asian', 'Mediterranean', 'Middle Eastern'];
const API_URL = (n = 24) =>
  `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&number=${n}&cuisine=${encodeURIComponent(
    CUISINES.join(',')
  )}&addRecipeInformation=true&instructionsRequired=true&fillIngredients=true&sort=random`;

/* ===========================================================
   2) CACHE + UI CONSTANTS
  PURPOSE:These constants + the global array are shared settings/memory:
  - CACHE_KEY → name used to save/load recipes in localStorage
  - CACHE_TTL_MS → how long cached data is valid (6h). After that we try to fetch fresh data.
  - MAX_INGREDIENTS → keep recipe cards short by limiting the number of shown ingredients
  - RECIPES → global array holding all normalized recipes (so filter/sort/render share the same data)

  We keep a separate cache for /recipes/{id}/information responses.
  - DETAIL_TTL_MS can be longer than list cache (24h is fine).
  - Data structure in localStorage: { ts, data: { [id]: fullRecipeObj } }
  ===========================================================*/
const CACHE_KEY = 'spoon_recipes_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const MAX_INGREDIENTS = 4;
let RECIPES = [];
const DETAIL_CACHE_KEY = 'spoon_recipe_detail_cache_v1';
const DETAIL_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

/* ===========================================================
   3) DOM HELPERS
  =========================================================== */
// $() → shortcut for document.getElementById()
// grid → reference to <section id="grid"> where recipe cards go
const $ = (id) => document.getElementById(id);
const grid = $('grid');
const setBusy = (on) => grid.toggleAttribute('aria-busy', !!on);

// overlay refs for the view recipe popup
const overlayEl = document.getElementById('popup-recipe');
const overlayBodyEl = document.getElementById('popup-recipe-content');

/* ===========================================================
   4) STRING HELPERS
   Purpose: Avoid duplicating string transforms in multiple places.
   - toKebabCase: "Middle Eastern" → "middle-eastern" (stable codes for filters)
   - toTitleCase: "middle-eastern" → "Middle Eastern" (friendly UI labels)
  ===========================================================*/
function toKebabCase(str = '') {
  return String(str).trim().toLowerCase().replace(/\s+/g, '-');
}
function toTitleCase(str = '') {
  return String(str).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Helpers to transform numbers/codes to user-friendly labels.
function minutesToLabel(mins) {
  if (mins < 15) return 'Under 15 min';
  if (mins <= 30) return '15–30 min';
  if (mins <= 60) return '30–60 min';
  return 'Over 60 min';
}
function starsFromPopularity(p) {
  const n = Math.max(0, Math.min(5, Math.round(p / 20)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

// Converts text to safe HTML (used when injecting API text)
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ---------- Instructions HTML builder ----------
   Reason: Spoonacular sometimes returns:
   • structured analyzedInstructions[].steps
   • AND/OR a big free-text “instructions” string that already contains numbers.
   We normalize to a clean <ol><li>…</li></ol> with our own numbering,
   and we strip any leading “1. ” / “2) ” etc. to avoid double numbers.
--------------------------------------------------*/
function buildInstructionsHTML(recipe) {
  const steps = recipe?.analyzedInstructions?.[0]?.steps;
  if (Array.isArray(steps) && steps.length) {
    const items = steps
      .map(s => `<li>${escapeHTML(s.step || '').trim()}</li>`)
      .join('');
    return `<ol>${items}</ol>`;
  }

  const raw = (recipe?.instructions || '').trim();
  if (!raw) return '<p>No instructions provided.</p>';

  const text = raw.replace(/<[^>]+>/g, ' '); // strip any embedded HTML
  const chunks = text
    .split(/\n+|(?<=\.)\s+(?=[A-Z0-9])/)
    .map(s => s.trim())
    .filter(Boolean);

  const cleaned = chunks.map(s => s.replace(/^\s*\d+[\.\)]\s*/, '')); // remove "1. " / "2) " etc.
  const items = cleaned.map(s => `<li>${escapeHTML(s)}</li>`).join('');
  return `<ol>${items}</ol>`;
}


/* ===========================================================
   5) NORMALIZATION HELPERS
   PURPOSE: The API returns big objects with many fields and inconsistent shapes.
   normalizeRecipe() cleans and reformats data into a consistent structure
   that our UI can easily use.
  ===========================================================*/
function normalizeRecipe(recipe) {
  if (!recipe) throw new Error('Recipe input is null or undefined');

  // Read first cuisine safely (optional chaining) or default to 'unknown'.
  // Then convert to kebab-case so filters are simple and consistent.
  const cuisineCode = toKebabCase(recipe.cuisines?.[0] || 'unknown');
  const dietCode = resolveDietCode(recipe);
  const pop = resolvePopularity(recipe);

  return mapToNormalizedRecipe(recipe, cuisineCode, dietCode, pop);
}

// Order of priority: vegan > vegetarian > gluten-free > dairy-free > none.
function resolveDietCode(recipe) {
  if (recipe.vegan || recipe.diets?.includes?.('vegan')) return 'vegan';
  if (recipe.vegetarian || recipe.diets?.includes?.('vegetarian')) return 'vegetarian';
  if (recipe.glutenFree || recipe.diets?.includes?.('gluten free')) return 'gluten-free';
  if (recipe.dairyFree || recipe.diets?.includes?.('dairy free')) return 'dairy-free';
  return 'none';
}

// Prefer spoonacularScore (0–100), fallback to aggregateLikes capped at 100
function resolvePopularity(recipe) {
  if (typeof recipe.spoonacularScore === 'number') return recipe.spoonacularScore;
  return Math.min(100, recipe.aggregateLikes || 0);
}

function mapToNormalizedRecipe(recipe, cuisineCode, dietCode, popularity) {
  return {
    id: recipe.id,
    title: recipe.title || 'Untitled recipe',
    cuisine: cuisineCode,
    cuisines: (recipe.cuisines || []).map(toKebabCase),
    diet: dietCode,
    timeMin: recipe.readyInMinutes || 0,
    popularity,
    imageUrl:
      recipe.image ||
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
    ingredients: (recipe.extendedIngredients || [])
      .map((i) => i?.name)
      .filter(Boolean)
      .slice(0, 24),
  };
}

/* ===========================================================
   6) CACHE FUNCTIONS (localStorage)
   PURPOSE: Reduce API calls (quota), speed up UI, work better with flaky networks.
   We save normalized recipes + timestamp, then read them if still within TTL.
   =========================================================== */

// One reader for both “fresh” (honor TTL) and “stale” (ignore TTL) reads
function readCache(ignoreTTL = false) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || !Array.isArray(obj.data)) return null;
    if (!ignoreTTL && (!obj.ts || Date.now() - obj.ts > CACHE_TTL_MS)) return null; // expired
    return obj.data;
  } catch {
    return null;
  }
}
function writeCache(recipes) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: recipes }));
  } catch {
    // storage full/blocked – fail silently
  }
}

/* detail cache helpers (for /recipes/{id}/information)
   These prevent repeated API calls when the user opens the same recipe
   multiple times or navigates back and forth. */
function readDetailCache() {
  try {
    const raw = localStorage.getItem(DETAIL_CACHE_KEY);
    return raw ? JSON.parse(raw) : { ts: 0, data: {} };
  } catch {
    return { ts: 0, data: {} };
  }
}
function writeDetailCache(store) {
  try {
    localStorage.setItem(DETAIL_CACHE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota errors
  }
}
// Unified accessor that returns cached detail (if fresh) or fetches/saves one
async function getRecipeInfo(id) {
  const store = readDetailCache();
  const fresh = Date.now() - (store.ts || 0) < DETAIL_TTL_MS;
  if (fresh && store.data && store.data[id]) return store.data[id];

  const res = await fetch(
    `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  const next = { ts: Date.now(), data: { ...(store.data || {}), [id]: json } };
  writeDetailCache(next);
  return json;
}

/* ===========================================================
   7) FETCH (API + fallback) with QUOTA messaging
   PURPOSE: Show loading → try cache → try network → normalize/save/render → handle errors.
   Includes a stale-cache + backupData fallback to keep UI useful when offline/quota.
   =========================================================== */
async function fetchRecipes(count = 24) {
  // clear any previous UI note so status doesn't keep old messages
  delete $('status').dataset.note;

  grid.innerHTML = '<div class="loading">Loading recipes…</div>';
  $('status').textContent = 'Loading recipes…';
  setBusy(true);

  // 1) Try fresh cache first
  const fresh = readCache(false);
  if (fresh) {
    RECIPES = fresh;
    return render(getVisibleRecipes(), 'cache');
  }

  // 2) Try API
  try {
    const res = await fetch(API_URL(count));
    if (!res.ok) {
      if (res.status === 402 || res.status === 429) throw new Error('QUOTA');
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const normalized = (data.results || data.recipes || []).map(normalizeRecipe);
    if (!normalized.length) throw new Error('Empty');

    RECIPES = normalized;
    writeCache(RECIPES);
    return render(getVisibleRecipes(), 'api');
  } catch (err) {
    const isQuota = err?.message === 'QUOTA';
    $('status').textContent = isQuota
      ? 'Daily API quota reached — attempting cached recipes.'
      : 'Network error — attempting cached recipes.';

    // mark status element with a machine-readable note (used by updateStatus)
    $('status').dataset.note = isQuota ? 'quota' : 'offline';

    // 3a) Stale cache (ignore TTL)
    const stale = readCache(true);
    if (stale?.length) {
      RECIPES = stale;
      return render(getVisibleRecipes(), 'cache (stale)');
    }

    // 3b) BackupData fallback (bundled static data)
    if (Array.isArray(backupData) && backupData.length) {
      RECIPES = backupData.map(normalizeRecipe);
      $('status').textContent = isQuota
        ? 'Quota reached — showing bundled backup data.'
        : 'Offline — showing bundled backup data.';
      return render(getVisibleRecipes(), 'backup');
    }

    // 3c) Empty state
    RECIPES = [];
    grid.innerHTML =
      '<div class="empty">Couldn’t fetch recipes (quota/offline). Try again later.</div>';
    setBusy(false);
  }
}

/* ===========================================================
   8) FILTERING + SORTING
   PURPOSE: Take the full set of RECIPES and produce a new array
   that matches the current dropdown values (cuisine/diet + sorting).
   Non-mutating patterns are used (returns new arrays).
   =========================================================== */

// Get current UI selections from the dropdowns. Empty string "" means “no filter/sort”
function getSelectedCuisine() {
  return $('cuisine').value || '';
}
function getSelectedDiet() {
  return $('diet').value || '';
}
function getSelectedSortTime() {
  return $('sortTime').value || '';
}
function getSelectedSortPop() {
  return $('sortPop').value || '';
}
function getQuery() {
  return ($('q')?.value || '').trim().toLowerCase();
}

// FILTERING — applies current dropdown selections (cuisine, diet) + free-text search
function filterRecipes(list) {
  const cuisine = getSelectedCuisine();
  const diet = getSelectedDiet();
  const q = getQuery();

  return list.filter((r) => {
    const passCuisine = cuisine ? r.cuisine === cuisine || r.cuisines?.includes(cuisine) : true;
    const passDiet = diet ? r.diet === diet : true;
    const passQuery = q
      ? r.title.toLowerCase().includes(q) ||
      r.ingredients.some((i) => i.toLowerCase().includes(q))
      : true;
    return passCuisine && passDiet && passQuery;
  });
}

// SORTING — popularity (most/least) + time (asc/desc)
function sortRecipes(list) {
  const sTime = getSelectedSortTime();
  const sPop = getSelectedSortPop();
  const arr = [...list]; // copy first

  arr.sort((a, b) => {
    // Primary: popularity (if selected)
    if (sPop === 'most' && a.popularity !== b.popularity) return b.popularity - a.popularity;
    if (sPop === 'least' && a.popularity !== b.popularity) return a.popularity - b.popularity;

    // Secondary (or primary if no popularity sort): time
    if (sTime === 'asc') return a.timeMin - b.timeMin;
    if (sTime === 'desc') return b.timeMin - a.timeMin;

    return 0;
  });

  return arr;
}

// Compose the two steps: FILTER first, then SORT
const getVisibleRecipes = () => sortRecipes(filterRecipes(RECIPES));

/* ===========================================================
   9) RENDER
   PURPOSE: Turn the (filtered + sorted) array into real DOM cards.
   We clone a <template> per recipe and fill its fields.
   We also update a live status line for accessibility/debugging.
   =========================================================== */

// build one card DOM node from a normalized recipe
function buildCard(r) {
  const tpl = $('cardTpl');
  const node = tpl.content.cloneNode(true);

  // Fill img + title
  node.querySelector('.card-img').src = r.imageUrl;
  node.querySelector('.card-img').alt = r.title;
  node.querySelector('.card-title').textContent = r.title;

  // Fill meta info
  node.querySelector('.meta-cuisine').textContent = toTitleCase(r.cuisine);
  node.querySelector('.meta-diet').textContent = toTitleCase(r.diet);
  node.querySelector('.meta-pop').textContent = starsFromPopularity(r.popularity);
  node.querySelector('.meta-time').textContent = minutesToLabel(r.timeMin);

  // Ingredients list
  const ul = node.querySelector('.ing-list');
  const list =
    r.ingredients.length > MAX_INGREDIENTS
      ? [...r.ingredients.slice(0, MAX_INGREDIENTS), '…']
      : r.ingredients;
  list.forEach((i) => {
    const li = document.createElement('li');
    li.textContent = i;
    ul.appendChild(li);
  });

  // compact “View recipe” button on each card
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-view';
  btn.textContent = 'View recipe';
  btn.addEventListener('click', () => showRecipeDetails(r.id));
  node.querySelector('.card').appendChild(btn);

  return node;
}

// shows the given list of recipes in the grid and updates status line
function render(list, sourceLabel = 'filters') {
  grid.innerHTML = '';
  if (!list.length) {
    grid.innerHTML =
      '<div class="empty">No recipes match your filters, please try another option.</div>';
    updateStatus(0, sourceLabel);
    setBusy(false);
    return;
  }

  const frag = document.createDocumentFragment();
  list.forEach((r) => frag.appendChild(buildCard(r)));
  grid.appendChild(frag);

  updateStatus(list.length, sourceLabel);
  setBusy(false);
}

// Simplified user-friendly status messages
// appends a clear user-facing note when quota/offline fallback is active
function updateStatus(count, source) {
  if (count === 0) {
    $('status').textContent = ''; // hide status when grid is empty
    return;
  }
  const q = getQuery();
  const base = q
    ? `Found ${count} recipe(s) matching "${q}".`
    : `Showing ${count} recipe(s).`;

  // Note set in fetchRecipes() catch: 'quota' | 'offline' | undefined
  const noteType = $('status').dataset.note;
  const note =
    noteType === 'quota'
      ? ' (daily API quota reached — showing cached/backup data)'
      : noteType === 'offline'
        ? ' (offline/unavailable — showing cached/backup data)'
        : '';

  $('status').textContent = base + note;
}

// View recipe popup (open/close + fetch details)
function openOverlay() {
  overlayEl?.classList.add('is-open');
  overlayEl?.setAttribute('aria-hidden', 'false');
}
function closeOverlay() {
  overlayEl?.classList.remove('is-open');
  overlayEl?.setAttribute('aria-hidden', 'true');
  if (overlayBodyEl) overlayBodyEl.innerHTML = '';
}

// fetch + render recipe details into popup
async function showRecipeDetails(recipeId) {
  if (!overlayEl || !overlayBodyEl) return;
  openOverlay();
  overlayBodyEl.innerHTML = '<p>Loading…</p>';

  try {
    // use cached detail accessor instead of raw fetch 
    const r = await getRecipeInfo(recipeId);

    const ingredients = Array.isArray(r.extendedIngredients)
      ? r.extendedIngredients.map((i) => i.original).filter(Boolean)
      : [];

    // Build instructions HTML (normalized numbering)
    const instructionsHTML = buildInstructionsHTML(r);

    overlayBodyEl.innerHTML = `
      <img src="${r.image}" alt="${escapeHTML(r.title)}">
      <h2>${escapeHTML(r.title)}</h2>
      <p><strong>Cuisine:</strong> ${escapeHTML(r.cuisines?.join(', ') || 'N/A')}</p>
      <p><strong>Ready in:</strong> ${r.readyInMinutes || '—'} min</p>

      <p><strong>Ingredients:</strong></p>
      <ul class="ing">
        ${ingredients.map((i) => `<li>${escapeHTML(i)}</li>`).join('')}
      </ul>

      <h3>Instructions:</h3>
      <div class="inst">
        ${instructionsHTML}
      </div>
    `;
  } catch (_) {
    overlayBodyEl.innerHTML = '<p>Couldn’t load recipe details.</p>';
  }
}

// close popup on backdrop click / X button / ESC
overlayEl?.addEventListener('click', (e) => {
  if (e.target === overlayEl || e.target.closest('[data-dismiss]')) closeOverlay();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeOverlay(); });

/* ===========================================================
   10) EVENTS + INIT (+ Random)
   PURPOSE: Wire up the dropdowns (change → re-render), and then kick off the first fetch.
   Keep the visual "is-selected" pill style in sync with whether a value is chosen.
   =========================================================== */

// Tiny event helper + debounce
const on = (el, evts, fn) => evts.split(' ').forEach((e) => el.addEventListener(e, fn));
const debounce = (fn, ms = 250) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

// Wire selects (cuisine, diet, sorters)
['cuisine', 'diet', 'sortTime', 'sortPop'].forEach((id) => {
  const sel = $(id);
  if (!sel) return;

  const rerender = () => render(getVisibleRecipes(), 'filters');

  on(sel, 'change input', () => {
    sel.classList.toggle('is-selected', !!sel.value);
    rerender();
  });

  // Initialize selected state on load
  sel.classList.toggle('is-selected', !!sel.value);
});

// Search (debounced to avoid re-render on every keystroke)
const qEl = $('q');
if (qEl) on(qEl, 'input', debounce(() => render(getVisibleRecipes(), 'filters'), 250));

// Random recipe button
$('btnRandom')?.addEventListener('click', (e) => {
  e.preventDefault();
  if (!RECIPES.length) {
    $('status').textContent = 'No recipes loaded yet — try fetching first.';
    return;
  }
  setBusy(true);
  const pick = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  render([pick], 'random');
});

// ENTRY POINT – Start by fetching recipes (cache → API → stale/backup fallback)
fetchRecipes(24);
