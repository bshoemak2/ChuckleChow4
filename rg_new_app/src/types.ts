export interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  chaos_factor: number;
}

export interface IngredientLink {
  name: string;
  url: string;
}

export interface Recipe {
  title: string;
  ingredients?: (string | [string, string] | { name: string; amount: string })[];
  steps?: (string | { step: string })[];
  nutrition?: Nutrition;
  equipment?: string[];
  cooking_time?: number;
  difficulty?: string;
  servings?: number;
  tips?: string[];
  chaos_gear?: string;
  shareText?: string;
  ingredients_with_links?: IngredientLink[];
  add_all_to_cart?: string;
  text?: string;
}

export interface Favorite extends Recipe {
  id: number;
  rating: number;
}