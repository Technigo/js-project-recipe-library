import { create } from 'zustand';

interface Recipe {
  id: number;
  title: string;
  image: string;
  summary: string;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
}

interface StoreState {
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  error: string | null;
  setRecipes: (recipes: Recipe[]) => void;
  setError: (error: string | null) => void;
  filterAndSort: (filters: Partial<FilterOptions>, sortBy: SortBy) => void;
}

interface FilterOptions {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
}

type SortBy = 'title' | 'none';

export const useStore = create<StoreState>((set, get) => ({
  recipes: [],
  filteredRecipes: [],
  error: null,
  setRecipes: (recipes) => {
    set({ recipes, filteredRecipes: recipes });
  },
  setError: (error) => {
    set({ error });
  },
  filterAndSort: (filters, sortBy) => {
    let filtered = get().recipes.filter(recipe => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return recipe[key as keyof FilterOptions] === value;
      });
    });

    if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } 

    set({ filteredRecipes: filtered });
  },
}));
