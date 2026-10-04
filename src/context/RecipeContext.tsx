import React, { createContext, useContext, useState, ReactNode } from 'react';
import initialData from '../../data/recipes.json';
import { Recipe, Ingredient, ShoppingListItem } from '../types/recipe';

interface RecipeContextType {
  recipes: Recipe[];
  myKitchenIds: string[];
  toggleMyKitchen: (id: string) => void;
  shoppingList: ShoppingListItem[];
  addToShoppingList: (recipeTitle: string, ingredients: Ingredient[], scale: number) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  clearShoppingList: () => void;
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  removeKitchenRecipe: (id: string) => { recipe: Recipe; index: number } | null;
  restoreKitchenRecipe: (recipe: Recipe, index: number) => void;
  
  // Filters & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterVegetarian: boolean;
  setFilterVegetarian: (val: boolean) => void;
  filterUnder30: boolean;
  setFilterUnder30: (val: boolean) => void;
  filterDifficulty: string | null;
  setFilterDifficulty: (diff: string | null) => void;
  resetFilters: () => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialData.recipes as Recipe[]);
  const [myKitchenIds, setMyKitchenIds] = useState<string[]>(['shakshuka', 'pierogi-ruskie']);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVegetarian, setFilterVegetarian] = useState(false);
  const [filterUnder30, setFilterUnder30] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);

  const toggleMyKitchen = (id: string) => {
    setMyKitchenIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const removeKitchenRecipe = (id: string) => {
    const index = myKitchenIds.indexOf(id);
    if (index === -1) return null;
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return null;

    setMyKitchenIds(prev => prev.filter(item => item !== id));
    return { recipe, index };
  };

  const restoreKitchenRecipe = (recipe: Recipe, index: number) => {
    setMyKitchenIds(prev => {
      if (prev.includes(recipe.id)) return prev;
      const copy = [...prev];
      copy.splice(index, 0, recipe.id);
      return copy;
    });
  };

  const addToShoppingList = (recipeTitle: string, ingredients: Ingredient[], scale: number) => {
    const newItems: ShoppingListItem[] = ingredients.map((ing, idx) => ({
      id: `${recipeTitle}-${ing.name}-${Date.now()}-${idx}`,
      name: ing.name,
      quantity: ing.quantity !== null ? Number((ing.quantity * scale).toFixed(2)) : null,
      unit: ing.unit,
      recipeTitle,
      checked: false,
    }));
    setShoppingList(prev => [...prev, ...newItems]);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const clearShoppingList = () => {
    setShoppingList([]);
  };

  const addRecipe = (recipeData: Omit<Recipe, 'id'>) => {
    const id = recipeData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const newRecipe: Recipe = { ...recipeData, id };
    setRecipes(prev => [newRecipe, ...prev]);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterVegetarian(false);
    setFilterUnder30(false);
    setFilterDifficulty(null);
  };

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        myKitchenIds,
        toggleMyKitchen,
        shoppingList,
        addToShoppingList,
        toggleShoppingItem,
        removeShoppingItem,
        clearShoppingList,
        addRecipe,
        removeKitchenRecipe,
        restoreKitchenRecipe,
        searchQuery,
        setSearchQuery,
        filterVegetarian,
        setFilterVegetarian,
        filterUnder30,
        setFilterUnder30,
        filterDifficulty,
        setFilterDifficulty,
        resetFilters,
      }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
}
