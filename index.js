 /*Global variables
  URLEN 
*/
const API_KEY = "f07978112d8d44b597e5e071796142fb";
const BASE = "https://api.spoonacular.com/recipes/complexSearch";

/* Mappning av egna knappvärden -> Spoonacular */
function mapCuisine(value){
  const v = String(value).toLowerCase().trim();
  const map = {
    all: 'all',
    italian: 'italian',
    american: 'american',
    asia: 'asian',
    belgia: 'belgian'
  };
  return map[v] ?? 'all'; //Fallback
}

/* 
Bygg URL enligt state 
In short: the function builds a ready-made URL (web address) 
to Spoonacular's search API based on what you want – 
cuisine, sort direction, and how many recipes – and returns it as a string.
*/
function buildUrl({ cuisine = 'all', sortDir = 'asc', number = 14 } = {}) {
  const params = new URLSearchParams({
  apiKey: API_KEY,
  number: String(number),
  addRecipeInformation: "true",
  instructionsRequired: "true",
  sort: "time",
  sortDirection: sortDir, 
  });
  const c = mapCuisine(cuisine);
  if (c !== 'all') params.set('cuisine', c);
  return `${BASE}?${params.toString()}`;
}

/* 
  STATE 
  Variables that tell us what the user has selected 
  (kitchen and sorting) and which recipes were most recently retrieved.
  When you click the buttons, these values ​​are updated – and we retrieve new recipes.
*/
let currentCuisine = 'all';
let currentSortDir = 'asc';
let currentRecipes = [];

/* 
  DOM 
  grid: the container where the cards will be printed
  filterBtns: all buttons that filter by cuisine
  sortBtns: buttons that set up/down by time
  randomBtn: the button that shows a random recipe
*/
const grid = document.querySelector('.recipe-grid');
const filterBtns = document.querySelectorAll('.btn[data-cuisine]');
const sortBtns   = document.querySelectorAll('.btn-time[data-sort]');
const randomBtn  = document.querySelector('.btn-random');

/* 
  HÄMTA & RENDERA 
  Builds a URL based on the current state (kitchen + sorting).
  fetch(url) calls the API and waits for a response.
  If successful: data.results is added to currentRecipes and sent to renderRecipes.
  If unsuccessful: we display a simple error message in the grid.
*/
async function fetchRecipes() {
  try {
    const url = buildUrl({ cuisine: currentCuisine, sortDir: currentSortDir, number: 14 });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    currentRecipes = data.results || [];

      
    //function for sorting ascending and descending
    currentRecipes.sort(function (a, b) {
      const am = Number.isFinite(a.readyInMinutes) ? a.readyInMinutes : Infinity;
      const bm = Number.isFinite(b.readyInMinutes) ? b.readyInMinutes : Infinity;
      return currentSortDir === 'asc' ? (am - bm) : (bm - am);
    });

    renderRecipes(currentRecipes);
  } catch (e) {
    console.error(e);
    grid.innerHTML = `
      <article class="recipe-card" style="grid-column:1/-1">
        <h3>Oh, something went wrong.</h3>
        <p>Kunde inte hämta recept just nu.</p>
      </article>`;
  }
}

/* 
  Rendera listan
  If the list is empty -> show “No recipes found”.
  Otherwise: create HTML for each recipe with recipeCardHTML() and insert into grid.
*/
function renderRecipes(list) {
  if (!grid) return;
  if (!list || list.length === 0) {
    grid.innerHTML = `<p class="empty" style="grid-column:1/-1">Inga recept hittades.</p>`;
    return;
  }
  grid.innerHTML = list.map(r => recipeCardHTML(r)).join('');
}

/* 
  SKAPAR ETT RECEPTKORT
  Chooses “safe” fallback values ​​if something is missing (e.g. title/image/time).
  summary is cleaned from HTML and shortened to 160 characters.
  Image has onerror="this.style.display='none'" → if the image is broken, <img> disappears so the layout looks good.
  Link to the recipe page on Spoonacular is built via title-slug + id
*/
function recipeCardHTML(r) {
  const title = r.title ?? 'Untitled';
  const img = r.image ?? '';
  const minutes = Number.isFinite(r.readyInMinutes) ? r.readyInMinutes : null;
  const cuisines = (Array.isArray(r.cuisines) && r.cuisines.length) ? r.cuisines.join(', ') :
                   (currentCuisine === 'all' ? '—' : cap(mapCuisine(currentCuisine)));
  // const ingredients = 
  const summary = stripHtml(r.summary || '').slice(0, 160) + (r.summary && r.summary.length > 160 ? '…' : ''); 

  return `
    <article class="recipe-card" tabindex="0">
      <img src="${img}" alt="${esc(title)}" loading="lazy" onerror="this.style.display='none'">
      <h3 class="recipe-card-title">${esc(title)}</h3>
      <p class="recipe-card-cuisine">${esc(cuisines)}</p>
      <p class="recipe-card-time">${minutes ? `Time | ${minutes} mins` : 'Time | —'}</p>
      ${summary ? `<p class="recipe-card-desc">${esc(summary)}</p>` : ''}
      <a class="btn-more" href="https://spoonacular.com/recipes/${slug(title)}-${r.id}" target="_blank" rel="noopener">Open recipe</a>
    </article>
  `;
}

/* 
  HJÄLPARE 
  stripHtml: removes HTML tags from a text (to avoid strange content in summary).
  esc: “escaps” text so that special characters do not break HTML.
  slug: makes “nice” URL-friendly strings (for the link).
  cap: capitalizes the first letter (to display “Asian” instead of “asian”).
*/
function stripHtml(html){
  const el = document.createElement('div');
  el.innerHTML = html || '';
  return el.textContent || el.innerText || '';
}
function esc(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function cap(s){ return String(s).charAt(0).toUpperCase() + String(s).slice(1); }

/* 
  INTERAKTION 
  Filter buttons: updates currentCuisine and fetches new recipes based on that selection.
  Sort buttons: changes currentSortDir (asc/desc) and fetches again.
  Random: takes a random recipe from the last fetch and renders only that card.
*/
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentCuisine = btn.dataset.cuisine || 'all';
    setActive(filterBtns, btn);
    fetchRecipes();
  });
});

sortBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentSortDir = (btn.dataset.sort === 'desc') ? 'desc' : 'asc';
        console.log('[SORT CLICK]', { dataset: btn.dataset.sort, currentSortDir });
    const testUrl = buildUrl({ cuisine: currentCuisine, sortDir: currentSortDir, number: 14 });
    console.log('[URL]', testUrl);
    setActive(sortBtns, btn);
    fetchRecipes();
  });
});

randomBtn?.addEventListener('click', () => {
  if (!currentRecipes.length) return;
  const rand = currentRecipes[Math.floor(Math.random() * currentRecipes.length)];
  renderRecipes([rand]);
});

/* visuellt aktiv */
function setActive(nodeList, activeEl){
  nodeList.forEach(b => b.classList.remove('active'));
  activeEl.classList.add('active');
}

/* 
  INIT 
  Visually sets “All” + “Ascending” as the starting selection.
  Run fetchRecipes() immediately so the page is populated with recipes when it loads.
*/
(function init(){
  document.querySelector('.btn[data-cuisine="all"]')?.classList.add('active');
  document.querySelector('.btn-time[data-sort="asc"]')?.classList.add('active');
  fetchRecipes();
})();
