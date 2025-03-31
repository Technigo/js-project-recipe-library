let recipes = []
const container = document.querySelector('.container')
const URL = "https://api.spoonacular.com/recipes/random?number=20&apiKey=9140586d9ad349ee88356eff9045445c"
let currentDiet = "all"
let isLoading = false // Add this line

// Load recipes to the page. 
const loadRecipes = (arg1) => {
	container.innerHTML = ''
	arg1.forEach(recipe => {
		container.innerHTML += `
		<div class="cards">
		<p><img src="${recipe.image}" alt="${recipe.title}"></p>
		<h2>${recipe.title}</h2>
		<p>Time to cook: ${recipe.readyInMinutes} minutes.<br>
		Health score: ${recipe.healthScore}.<br>
		Diets: ${recipe.diets.join(", ")}<br>
		Servings: ${recipe.servings}</p>
		<a href="${recipe.sourceUrl}" target="_blank" class="view-recipe"><h3>View recipe</h3></a>
		</div>
		`
	})
}

// Define the loadMoreRecipes function
const loadMoreRecipes = async () => {
	const loader = document.getElementById('loader')
	if(loader){
		loader.style.display = 'flex'
	}
	try {
		const response = await fetch(URL)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const data = await response.json()
		const validRecipes = data.recipes.filter(recipe => recipe.diets.length > 0)
		recipes = [...recipes, ...validRecipes]
		localStorage.setItem('recipes', JSON.stringify(recipes))
		applyFilters()
	} catch (error) {
		console.error('Error loading more recipes:', error)
	} finally {
		loader.style.display = 'none'
		isLoading = false
	}
}

// Filter by time to cook.
const filterByTime = (time) => { 
	const filteredRecipes = getCurrentDietFiltered()
	if (time === "ascending") {
		filteredRecipes.sort((a, b) => a.readyInMinutes - b.readyInMinutes) //Ascending
	} else {
		filteredRecipes.sort((a, b) => b.readyInMinutes - a.readyInMinutes) //Descending
	}
	loadRecipes(filteredRecipes)
}

// Filter by diet.
const filterByDiet = (diet) => {
	currentDiet = diet
	applyFilters()
}

// Get current diet filtered. 
const getCurrentDietFiltered = () => {
	if (currentDiet === "all") {
		return recipes
	}

const dietMap = {
	"vegan": "vegan",
	"vegetarian": "vegetarian",
	"gluten free": "glutenFree",
	"dairy free": "dairyFree",
	"ketogenic": "ketogenic",
	"pescetarian": "pescetarian",
	"lacto ovo vegetarian": "lactoOvoVegetarian",
	"whole 30": "whole30",
	"paleolithic": "paleo",
	"primal": "primal",
	"fodmap friendly": "lowFodmap"
}

return recipes.filter(recipe => {
	const dietKey = dietMap[currentDiet]
		if (dietKey) {
			return recipe[dietKey] === true || recipe.diets.includes(currentDiet)
			}
			return recipe.diets.includes(currentDiet) // For other diets
	})
}

// Apply filters. 
const applyFilters = () => {
	const filteredRecipes = getCurrentDietFiltered()
	loadRecipes(filteredRecipes)
}

// Filter by search value.
const filterBySearch = (searchValue) => {
	const filteredRecipes = recipes.filter(recipe => {
	return recipe.title.toLowerCase().includes(searchValue.toLowerCase())
	})
	loadRecipes(filteredRecipes)
}

// Show loader. Hide after 2 seconds.
const showLoader = () => {
	const loader = document.querySelector('.loader')
	loader.style.display = 'flex'
	setTimeout(() => {
	loader.style.display = 'none'
	}, 2000)
}

// Check local storage for recipes and load them if they exist. Otherwise, fetch from API.
const loadData = () => {
	const loader = document.getElementById('loader')
	loader.style.display = 'flex'

	const storedRecipes = localStorage.getItem('recipes')
	if (storedRecipes) {
		try {
			recipes = JSON.parse(storedRecipes)
			applyFilters()
		} catch (error) {
			console.error('Error parsing stored recipes:', error)
		}
		loader.style.display = 'none'
	} else {
		// API call
		fetch(URL)
		.then(response => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			return response.json()
		})
		.then(data => {
			const validRecipes = data.recipes.filter(recipe => recipe.diets.length > 0)
			recipes = validRecipes
			localStorage.setItem('recipes', JSON.stringify(recipes))
			applyFilters()
			loader.style.display = 'none' // Moved here
		})
		.catch(error => {
			loader.style.display = 'none'
			container.innerHTML += `
				<div class="errorMessages">
					<img src="img/error.png" alt="Error icon">
					<h2>Oops! Something went wrong.</h2>
					<p>There was an error loading your recipes: ${error.message}</p>
					<button class="errorButton">Dismiss</button>
				</div>`
			document.querySelector('.errorButton').addEventListener('click', () => {
				document.querySelector('.errorMessages').classList.add('hidden')
			})
		})
	}
}

// Event listeners.
const buttonDiet = document.querySelectorAll(".buttonDiet")
const buttonTime = document.querySelectorAll(".buttonTime")

buttonDiet.forEach(button => { 
	button.addEventListener("change", (event) => {
		const diet = event.target.getAttribute("data-diet").toLowerCase()
		filterByDiet(diet)
	})
})

buttonTime.forEach(button => { 
	button.addEventListener("change", (event) => {
		const time = event.target.value
		filterByTime(time)
	})
})

document.querySelector('.buttonRandom').addEventListener('click', () => { 
	const filteredRecipes = getCurrentDietFiltered()
	const randomNumber = Math.floor(Math.random() * filteredRecipes.length)
	loadRecipes([filteredRecipes[randomNumber]])
})

document.querySelector("button").addEventListener("click", function() {
	let searchValue = document.getElementById("search").value
	filterBySearch(searchValue)
})

window.addEventListener("scroll", async () => {
	if (isLoading) return

	if (
		window.innerHeight + window.scrollY >=
		document.body.offsetHeight - 50
	) {
		isLoading = true
		await loadMoreRecipes()
		isLoading = false
	}
})

loadData()