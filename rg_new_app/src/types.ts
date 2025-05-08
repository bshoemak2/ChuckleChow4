export interface Favorite {
  text?: string;
  id: number;
  rating?: number;
  title?: string;
  ingredients?: Array<string | [string, string] | { name: string; amount: string }>;
  steps?: Array<string | { step: string }>;
  cooking_time?: number;
  difficulty?: string;
  servings?: number;
  nutrition?: { calories: number; protein: number; fat: number; chaos_factor: number };
  equipment?: string[];
  chaos_gear?: string;
  tips?: string[];
  shareText?: string;
}

export interface Recipe {
  title: string;
  ingredients: Array<string | [string, string] | { name: string; amount: string }>;
  steps: Array<string | { step: string }>;
  cooking_time: number;
  difficulty: string;
  servings: number;
  nutrition: { calories: number; protein: number; fat: number; chaos_factor: number };
  equipment: string[];
  tips: string[];
  chaos_gear: string;
  shareText: string;
}
export interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  chaos_factor: number;
}

export interface Recipe {
  title: string;
  ingredients: (string | [string, string] | { name: string; amount: string })[];
  steps: (string | { step: string })[];
  nutrition: Nutrition;
  equipment: string[];
  cooking_time: number;
  difficulty: string;
  servings: number;
  tips: string[];
  chaos_gear: string;
  shareText: string;
  text?: string; // Optional text field for markdown content
}