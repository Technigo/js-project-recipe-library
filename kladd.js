// Filtrera på Cooking Time
const matchesCookingTime = SELECTED_FILTERS.some((time) => {
  if (time === 'under 15 min') return recipe.readyInMinutes < 15;
  if (time === '15-30 min')
    return recipe.readyInMinutes >= 15 && recipe.readyInMinutes <= 30;
  if (time === '30-60 min')
    return recipe.readyInMinutes > 30 && recipe.readyInMinutes <= 60;
  if (time === 'over 60 min') return recipe.readyInMinutes > 60;
  return false;
});

// Filtrera på antalet ingredienser
const matchesIngredients = SELECTED_FILTERS.some((amount) => {
  const numIngredients = recipe.ingredients.length;
  if (amount === 'under 5 ingredients') return numIngredients < 5;
  if (amount === '6-10 ingredients')
    return numIngredients >= 6 && numIngredients <= 10;
  if (amount === '11-15 ingredients')
    return numIngredients >= 11 && numIngredients <= 15;
  if (amount === 'over 15 ingredients') return numIngredients > 15;
  return false;
});
