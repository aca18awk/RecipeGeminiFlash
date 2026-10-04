export interface Ingredient {
  name: string;
  quantity: number | null;
  unit: string | null;
}

export interface Step {
  text: string;
  timerSeconds: number | null;
}

export interface VideoInfo {
  file: string;
  title: string;
  captions?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  altText: string | null;
  cookingTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  vegetarian: boolean;
  featured: boolean;
  servings: number;
  video: VideoInfo | null;
  ingredients: Ingredient[];
  steps: Step[];
  sourceUrl?: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  recipeTitle: string;
  checked: boolean;
}
