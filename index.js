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
  return map[v] ?? 'all';
}

/* Bygg URL enligt state */
function buildUrl({ cuisine = 'all', sortDir = 'asc', number = 14 } = {}) {
  const params = new URLSearchParams({
  apiKey: API_KEY,
  number: String(number),
  addRecipeInformation: "true",
  instructionsRequired: "true",
  sort: "readyInMinutes",
  sortDirection: sortDir, 
  });
  const c = mapCuisine(cuisine);
  if (c !== 'all') params.set('cuisine', c);
  return `${BASE}?${params.toString()}`;
}

/* 
  STATE 
  Variabler som berättar vad användaren har valt (kök och sortering) och vilka recept som senast hämtats.
  När du klickar på knapparna uppdateras dessa värden – och vi hämtar nya recept.
*/
let currentCuisine = 'all';
let currentSortDir = 'asc';
let currentRecipes = [];

/* 
  DOM 
  grid: containern där korten ska skrivas ut
  filterBtns: alla knappar som filtrerar på kök
  sortBtns: knappar som sätter upp/ner på tid
  randomBtn: knappen som visar ett slumpat recept
*/
const grid = document.querySelector('.recipe-grid');
const filterBtns = document.querySelectorAll('.btn[data-cuisine]');
const sortBtns   = document.querySelectorAll('.btn-time[data-sort]');
const randomBtn  = document.querySelector('.btn-random');

/* 
  HÄMTA & RENDERA 
    Bygger en URL baserat på nuvarande state (kök + sortering).
    fetch(url) anropar API:et och väntar på ett svar.
    Om det går bra: data.results läggs i currentRecipes och skickas till renderRecipes.
    Om det går dåligt: vi visar ett enkelt felmeddelande i grid.
*/
async function fetchRecipes() {
  try {
    const url = buildUrl({ cuisine: currentCuisine, sortDir: currentSortDir, number: 14 });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    currentRecipes = data.results || [];
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
    Om listan är tom -> visa “Inga recept hittades”.
    Annars: skapa HTML för varje recept med recipeCardHTML() och stoppa in i grid.
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
    Väljer “säkra” fallback-värden om något saknas (t.ex. titel/bild/tid).
    summary rensas från HTML och kortas till 160 tecken.
    Bilden har onerror="this.style.display='none'" → om bilden är trasig försvinner <img> så layouten ser bra ut.
    Länk till receptets sida på Spoonacular byggs via titel-slug + id
*/
function recipeCardHTML(r) {
  const title = r.title ?? 'Untitled';
  const img = r.image ?? '';
  const time = r.time
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
    stripHtml: tar bort HTML-taggar från en text (för att undvika konstigt innehåll i summary).
    esc: “escapar” text så att specialtecken inte bryter HTML.
    slug: gör “fina” URL-vänliga strängar (för länken).
    cap: stor bokstav i början (för att visa “Asian” i stället för “asian”).
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
    Filterknappar: uppdaterar currentCuisine och hämtar nya recept utifrån det valet.
    Sortknappar: ändrar currentSortDir (asc/desc) och hämtar igen.
    Random: tar ett slumpat recept från senaste hämtningen och renderar bara det kortet.
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
    Sätter visuellt “All” + “Ascending” som startval.
    Kör fetchRecipes() direkt så sidan fylls med recept när den laddas.
*/
(function init(){
  document.querySelector('.btn[data-cuisine="all"]')?.classList.add('active');
  document.querySelector('.btn-time[data-sort="asc"]')?.classList.add('active');
  fetchRecipes();
})();
