import { Recipe } from './types';

export async function generateRecipe(ingredients: string[], isRandom = false): Promise<Recipe> {
  const apiUrl = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:5000' : 'https://chuckle-chow-backend.onrender.com';
  const response = await fetch(`${apiUrl}/generate_recipe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ingredients,
      isRandom,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate recipe');
  }

  return response.json();
}

export async function getIngredients(): Promise<Record<string, { name: string; emoji: string }[]>> {
  const apiUrl = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:5000' : 'https://chuckle-chow-backend.onrender.com';
  const response = await fetch(`${apiUrl}/ingredients`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch ingredients');
  }

  return response.json();
}