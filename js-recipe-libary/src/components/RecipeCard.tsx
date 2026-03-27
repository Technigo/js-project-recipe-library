import React from 'react';

interface Recipe {
  id: number;
  title: string;
  image: string;
  summary: string;
}

interface Props {
  recipe: Recipe;
}

const RecipeCard: React.FC<Props> = ({ recipe }) => {
  return (
    <div className="recipe-card">
      <img src={recipe.image} alt={recipe.title} />
      <h2>{recipe.title}</h2>
      <p dangerouslySetInnerHTML={{ __html: recipe.summary }} />
    </div>
  );
};

export default RecipeCard;
