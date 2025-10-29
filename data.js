async function getRecipes() {
  const url = "https://api.spoonacular.com/recipes/random?apiKey=24c0ad763b794214b472e5a5e70fac09&number=20&includeNutrition=false";
  try {
    const response = await fetch(url);
    if (!response.ok) {
     if (response.status === 402) {
        return { recipes: [], error: "Daily quota reached. Please try again tomorrow." };
    }
      return { recipes: [], error: "Something went wrong. Please try again later." };
    }
    const data = await response.json();
    return { recipes: data.recipes, error: null };
  } catch (error) {
    return { recipes: [], error: "Something went wrong. Please try again later." };
  }
}