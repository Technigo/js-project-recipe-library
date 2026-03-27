
document.addEventListener('DOMContentLoaded', () => {
    // Sample recipe data
    const recipes = [
        {
            name: "Baked Chicken",
            cuisineType: ["American"],
            ingredients: [
                "6 bone-in chicken breast halves, or 6 chicken thighs and wings, skin-on",
                "1/2 teaspoon coarse salt",
                "1/2 teaspoon Mrs. Dash seasoning",
                "1/4 teaspoon freshly ground black pepper",
            ],
            source: "Martha Stewart",
            totalTime: 90,
            url: "http://www.marthastewart.com/318981/baked-chicken",
        },
        {
            name: "Spaghetti Carbonara",
            cuisineType: ["Italian"],
            ingredients: [
                "1 pound spaghetti",
                "2 large eggs",
                "1/2 cup grated Parmesan cheese",
                "4 slices bacon, diced",
                "4 cloves garlic, minced",
                "Salt and black pepper to taste",
            ],
            source: "Allrecipes",
            totalTime: 30,
            url: "https://www.allrecipes.com/recipe/11973/spaghetti-carbonara/",
        },
        {
            name: "Chicken Stir-Fry",
            cuisineType: ["Chinese"],
            ingredients: [
                "1 pound boneless, skinless chicken breasts, cut into bite-sized pieces",
                "1 tablespoon soy sauce",
                "1 tablespoon cornstarch",
                "1 tablespoon vegetable oil",
                "1 cup broccoli florets",
                "1 cup sliced carrots",
                "1/2 cup sliced onion",
            ],
            source: "The Woks of Life",
            totalTime: 25,
            url: "https://thewoksoflife.com/chicken-stir-fry/",
        }
    ];

    const searchForm = document.querySelector('form[role="search"]');
    const searchInput = document.getElementById('searchInput');
    const recipeContainer = document.getElementById('recipeDescription');
    const sortOrder = document.getElementById('sortOrder');

    let filteredRecipes = [...recipes];

    const renderRecipes = (recipesToRender) => {
        recipeContainer.innerHTML = '';
        if (recipesToRender.length === 0) {
            recipeContainer.innerHTML = '<p>No recipes found.</p>';
            return;
        }

        const recipeList = document.createElement('ul');
        recipeList.setAttribute('aria-label', 'Recipe search results');
        
        recipesToRender.forEach(recipe => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <h3><a href="${recipe.url}" target="_blank" rel="noopener noreferrer">${recipe.name} <span class="visually-hidden">(opens in a new tab)</span></a></h3>
                <p>Cuisine: ${recipe.cuisineType.join(', ')}</p>
                <p>Time: ${recipe.totalTime} minutes</p>
                <p>Source: ${recipe.source}</p>
            `;
            recipeList.appendChild(listItem);
        });
        recipeContainer.appendChild(recipeList);
    };

    const sortAndRender = () => {
        const sortBy = sortOrder.value;
        const sorted = [...filteredRecipes].sort((a, b) => {
            if (sortBy === 'asc') {
                return a.totalTime - b.totalTime;
            } else {
                return b.totalTime - a.totalTime;
            }
        });
        renderRecipes(sorted);
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const searchTerm = searchInput.value.toLowerCase();
        
        if (searchTerm) {
            filteredRecipes = recipes.filter(recipe => recipe.name.toLowerCase().includes(searchTerm));
        } else {
            filteredRecipes = [...recipes];
        }
        sortAndRender();
    };

    searchForm.addEventListener('submit', handleSearch);
    sortOrder.addEventListener('change', sortAndRender);
    
    // Initial render on page load
    sortAndRender();
});
