import { useState, useCallback } from 'react';
import { Recipe } from './types';

export const useRecipe = () => {
  const [ingredients, setIngredients] = useState('');
  const [diet, setDiet] = useState('');
  const [time, setTime] = useState('');
  const [style, setStyle] = useState('');
  const [category, setCategory] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRandom, setLastRandom] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchRecipe = useCallback(async (isRandom = false) => {
    if (!ingredients.trim() && !isRandom) {
      setError('Please enter ingredients or select Random Recipe!');
      setRecipe({
        title: 'Error',
        steps: ['Please enter ingredients or select Random Recipe!'],
        ingredients: [],
        cooking_time: 0,
        difficulty: 'N/A',
        servings: 0,
        nutrition: { calories: 0, protein: 0, fat: 0, chaos_factor: 0 },
        equipment: [],
        tips: [],
        chaos_gear: '',
        shareText: ''
      });
      setIsLoading(false);
      setLastRandom(isRandom);
      return;
    }

    setIsLoading(true);
    setRecipe(null);
    setError(null);
    setLastRandom(isRandom);

    const ingredientList = ingredients
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 7);

    if (ingredientList.length > 7) {
      setError('Max 7 ingredients, ya hog! 🐷');
      setIsLoading(false);
      return;
    }

    const requestBody = {
      ingredients: ingredientList,
      preferences: { diet, time, style, category, isRandom },
    };

    const apiUrl = process.env.REACT_APP_API_URL || 'https://chuckle-chow-backend.onrender.com';
    const url = `${apiUrl}/generate_recipe`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data: Recipe = await response.json();
      console.log('Fetched recipe (useRecipe):', JSON.stringify(data, null, 2));
      if (!data || !data.title || data.title === 'Error Recipe') {
        throw new Error('Invalid recipe received from server');
      }
      setRecipe(data);
    } catch (err: any) {
      const message = err.message || 'Recipe generation flopped!';
      setError(message);
      setRecipe({
        title: 'Error',
        steps: [message],
        ingredients: [],
        cooking_time: 0,
        difficulty: 'N/A',
        servings: 0,
        nutrition: { calories: 0, protein: 0, fat: 0, chaos_factor: 0 },
        equipment: [],
        tips: [],
        chaos_gear: '',
        shareText: ''
      });
    } finally {
      setIsLoading(false);
    }
  }, [ingredients, diet, time, style, category]);

  const clearInput = () => {
    setIngredients('');
    setDiet('');
    setTime('');
    setStyle('');
    setCategory('');
    setRecipe(null);
    setLastRandom(false);
    setSuggestion('');
    setError(null);
  };

  return {
    ingredients,
    setIngredients,
    diet,
    setDiet,
    time,
    setTime,
    style,
    setStyle,
    category,
    setCategory,
    recipe,
    setRecipe,
    isLoading,
    setIsLoading,
    lastRandom,
    setLastRandom,
    suggestion,
    setSuggestion,
    error,
    setError,
    fetchRecipe,
    clearInput,
  };
};