import React, { useState, useEffect } from 'react';
import { generateRecipe, getIngredients } from './api';
import { Recipe } from './types';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<Record<string, { name: string; emoji: string }[]>>({});
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [comments, setComments] = useState<{ comment: string; created_at: string }[]>([]);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';

  const linearGradient = 'linear-gradient(to right, pink, yellow)';

  const styles = {
    container: {
      fontFamily: '"Comic Sans MS", "Chalkboard", sans-serif',
      backgroundColor: theme === 'light' ? '#FFF8DC' : '#2C2C2C',
      color: theme === 'light' ? '#333' : '#E0E0E0',
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
    },
    header: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: theme === 'light' ? '#FF4500' : '#FF6347',
      textAlign: 'center' as const,
      marginBottom: '20px',
    },
    error: {
      color: theme === 'light' ? '#FF4500' : '#FF6347',
      fontSize: '18px',
      textAlign: 'center' as const,
      margin: '10px 0',
    },
    spinner: {
      border: '4px solid #FF6B6B',
      borderTop: '4px solid transparent',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      margin: '0 auto',
      animation: 'spin 1s linear infinite',
    },
    spinnerText: {
      color: '#FF1493',
      fontWeight: 'bold',
      marginTop: '10px',
      textAlign: 'center' as const,
    },
    sectionHeader: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: theme === 'light' ? '#FFD700' : '#FFD700',
      margin: '20px 0 10px',
    },
    categoryHeader: {
      fontSize: '20px',
      color: theme === 'light' ? '#FF69B4' : '#FF69B4',
      margin: '10px 0',
    },
    button: {
      background: linearGradient,
      border: '2px solid #00ff00',
      padding: '10px 20px',
      borderRadius: '5px',
      margin: '0 10px',
      cursor: 'pointer',
      color: theme === 'light' ? '#333' : '#E0E0E0',
      fontFamily: '"Comic Sans MS", "Chalkboard", sans-serif',
      transition: 'transform 0.2s',
    },
    disabledButton: {
      background: '#ccc',
      border: '2px solid #666',
      padding: '10px 20px',
      borderRadius: '5px',
      margin: '0 10px',
      cursor: 'not-allowed',
      color: '#333',
      fontFamily: '"Comic Sans MS", "Chalkboard", sans-serif',
    },
    textarea: {
      width: '100%',
      minHeight: '80px',
      margin: '10px 0',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      backgroundColor: theme === 'light' ? '#FFF' : '#333',
      color: theme === 'light' ? '#333' : '#E0E0E0',
      fontFamily: '"Comic Sans MS", "Chalkboard", sans-serif',
    },
    comment: {
      fontSize: '16px',
      color: theme === 'light' ? '#333' : '#E0E0E0',
      margin: '10px 0',
    },
    commentDate: {
      fontSize: '14px',
      color: theme === 'light' ? '#666' : '#999',
    },
  };

  useEffect(() => {
    getIngredients()
      .then((data: Record<string, { name: string; emoji: string }[]>) => setIngredients(data))
      .catch(() => setError('Failed to load ingredients'));
  }, []);

  const handleGenerateRecipe = async (isRandom = false) => {
    if (!isRandom && selectedIngredients.length === 0) {
      setError("Pick somethin’, ya lazy bum! 😛");
      return;
    }
    if (selectedIngredients.length > 7) {
      setError('Max 7 ingredients, ya hog! 🐷');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    try {
      const data = await generateRecipe(isRandom ? [] : selectedIngredients, isRandom);
      setRecipe(data);
      setRating(0);
      setComment('');
      if (data.title) fetchComments(data.title);
    } catch {
      setError('Recipe generation flopped—blame the chef!');
      setRecipe({
        title: 'Error 🤦‍♂️',
        ingredients: [],
        steps: ['Recipe generation flopped—blame the chef!'],
        cooking_time: 0,
        difficulty: 'N/A',
        servings: 0,
        nutrition: { calories: 0, protein: 0, fat: 0, chaos_factor: 0 },
        equipment: [],
        tips: [],
        shareText: '',
        chaos_gear: '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (recipeTitle: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/recipe_comments?recipe_title=${encodeURIComponent(recipeTitle)}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
    } catch {
      setRatingError('Couldn’t load comments—blame the saloon fight!');
    }
  };

  const handleRateRecipe = async () => {
    if (!recipe || !recipe.title || rating < 1 || rating > 5) {
      setRatingError('Pick a rating between 1 and 5 stars, ya varmint!');
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:5000/rate_recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe_title: recipe.title,
          rating,
          comment: comment.trim() || undefined,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit rating');
      setRatingError(null);
      setRating(0);
      setComment('');
      if (recipe.title) fetchComments(recipe.title);
    } catch {
      setRatingError('Rating submission flopped—try again, partner!');
    }
  };

  const StarRating: React.FC = () => (
    <div style={{ margin: '10px 0' }} role="radiogroup" aria-label="Rate this recipe">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          style={{
            cursor: 'pointer',
            fontSize: '24px',
            color: star <= rating ? '#FFD700' : theme === 'light' ? '#ccc' : '#666',
          }}
          onClick={() => setRating(star)}
          onKeyDown={(e) => e.key === 'Enter' && setRating(star)}
          tabIndex={0}
          role="radio"
          aria-checked={star === rating}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🤪 Chuckle & Chow: Recipe Rumble 🍔💥</h1>
      {error && <p style={styles.error}>{error}</p>}
      {isLoading && (
        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          <div style={styles.spinner} />
          <p style={styles.spinnerText}>
            🔥 Whippin’ up somethin’ nuttier than a squirrel’s stash... 🐿️
          </p>
        </div>
      )}
      <div>
        <h2 style={styles.sectionHeader}>Select Ingredients</h2>
        {Object.keys(ingredients).map(category => (
          <div key={category} style={{ margin: '10px 0' }}>
            <h3 style={styles.categoryHeader}>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {ingredients[category].map((item) => (
                <label key={item.name} style={{ margin: '0 10px', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    value={item.name}
                    checked={selectedIngredients.includes(item.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIngredients([...selectedIngredients, item.name]);
                      } else {
                        setSelectedIngredients(selectedIngredients.filter(i => i !== item.name));
                      }
                    }}
                    style={{ marginRight: '5px' }}
                  />
                  <span style={{ color: theme === 'light' ? '#333' : '#E0E0E0' }}>{item.name} {item.emoji}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <button
          onClick={() => handleGenerateRecipe(false)}
          disabled={isLoading}
          style={isLoading ? styles.disabledButton : { ...styles.button, backgroundColor: '#FF69B4' }}
        >
          🍳 Cook Me a Hoot! 🎉
        </button>
        <button
          onClick={() => handleGenerateRecipe(true)}
          disabled={isLoading}
          style={isLoading ? styles.disabledButton : { ...styles.button, backgroundColor: '#FF00A0' }}
        >
          🎲 Random Ruckus Recipe 🌩️
        </button>
      </div>
      {recipe && (
        <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={styles.sectionHeader}>{recipe.title || 'No Title'}</h2>
          <p><strong>Ingredients:</strong></p>
          <ul>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ing: string | [string, string] | { name: string; amount: string }, i: number) => (
                <li key={i}>
                  {typeof ing === 'string' ? ing : Array.isArray(ing) ? `${ing[0]} (${ing[1]})` : `${ing.name} (${ing.amount})`}
                </li>
              ))
            ) : (
              <li>No ingredients available, y'all!</li>
            )}
          </ul>
          <p><strong>Steps:</strong></p>
          <ul>
            {recipe.steps && recipe.steps.length > 0 ? (
              recipe.steps.map((step: string | { step: string }, index: number) => (
                <li key={index}>{typeof step === 'string' ? step : step.step}</li>
              ))
            ) : (
              <li>No steps available, y'all!</li>
            )}
          </ul>
          <p><strong>Chaos Gear:</strong> {recipe.chaos_gear || 'None'}</p>
          <p>
            <strong>Nutrition:</strong> Calories: {recipe.nutrition?.calories ?? 0} | Protein: {recipe.nutrition?.protein ?? 0}g | Fat: {recipe.nutrition?.fat ?? 0}g (Chaos: {recipe.nutrition?.chaos_factor ?? 0}/10)
          </p>
          <div>
            <h3 style={styles.categoryHeader}>Rate This Recipe</h3>
            <StarRating />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)"
              style={styles.textarea}
            />
            {ratingError && <p style={styles.error}>{ratingError}</p>}
            <button
              onClick={handleRateRecipe}
              style={{ ...styles.button, backgroundColor: '#4ECDC4' }}
            >
              Submit Rating
            </button>
          </div>
          <div>
            <h3 style={styles.categoryHeader}>Comments</h3>
            {comments.length === 0 ? (
              <p style={styles.comment}>No comments yet—be the first to holler!</p>
            ) : (
              <ul>
                {comments.map((c, index) => (
                  <li key={index} style={{ margin: '10px 0' }}>
                    <p style={styles.comment}>{c.comment}</p>
                    <small style={styles.commentDate}>{new Date(c.created_at).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default App;