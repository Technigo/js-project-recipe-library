import React, { useEffect, useState } from 'react';
import { getRandomRecipes } from './api';
import { useStore } from './store';
import RecipeCard from './components/RecipeCard';
import Filters from './components/Filters';
import Sort from './components/Sort';
import './App.css';

const App: React.FC = () => {
  const { recipes, filteredRecipes, error, setRecipes, setError, filterAndSort } = useStore();
  const [filters, setFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
  });
  const [sortBy, setSortBy] = useState('none');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const randomRecipes = await getRandomRecipes(20);
        setRecipes(randomRecipes);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchRecipes();
  }, [setRecipes, setError]);

  useEffect(() => {
    filterAndSort(filters, sortBy as any);
  }, [filters, sortBy, filterAndSort]);

  const handleRandomRecipe = () => {
    const randomIndex = Math.floor(Math.random() * recipes.length);
    const randomRecipe = recipes[randomIndex];
    alert(`Random recipe: ${randomRecipe.title}`);
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="App">
      <h1>Recipe Finder</h1>
      <div className="controls">
        <Filters onFilterChange={setFilters} />
        <Sort onSortChange={setSortBy} />
        <button onClick={handleRandomRecipe}>Random Recipe</button>
      </div>
      {filteredRecipes.length > 0 ? (
        <div className="recipe-grid">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="empty-state">No recipes found.</div>
      )}
    </div>
  );
};

export default App;
