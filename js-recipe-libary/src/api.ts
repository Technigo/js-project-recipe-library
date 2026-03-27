const API_KEY = "277541fda7ef466586d5372d36030070";
const BASE_URL = "https://api.spoonacular.com";

export const getRandomRecipes = async (count = 10) => {
  try {
    const response = await fetch(
      `${BASE_URL}/recipes/random?number=${count}&apiKey=${API_KEY}`
    );

    if (response.status === 402) {
      throw new Error("API quota reached for today.");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch recipes.");
    }

    const data = await response.json();
    return data.recipes;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
