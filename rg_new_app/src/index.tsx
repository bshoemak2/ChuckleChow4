import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { generateRecipe } from './api';
import { Recipe, Favorite, IngredientLink } from './types';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    console.error('ERROR_BOUNDARY_2025_04_25', error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <p className="error">
            Chaos broke loose! 🐷 ${this.state.error?.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function HomeScreen() {
  console.log('INDEX_TXS_HOMESCREEN_2025_04_25', new Date().toISOString());
  const [meat, setMeat] = useState('');
  const [vegetable, setVegetable] = useState('');
  const [fruit, setFruit] = useState('');
  const [seafood, setSeafood] = useState('');
  const [dairy, setDairy] = useState('');
  const [carb, setCarb] = useState('');
  const [devilWater, setDevilWater] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRandom, setLastRandom] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(null);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );
  const [rating, setRating] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    meat: true,
    vegetables: true,
    fruits: true,
    seafood: true,
    dairy: true,
    carbs: true,
    devilWater: true,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const INGREDIENT_CATEGORIES = {
    meat: [
      { name: 'ground beef', emoji: '🍔' },
      { name: 'chicken', emoji: '🍗' },
      { name: 'pork', emoji: '🥓' },
      { name: 'lamb', emoji: '🐑' },
      { name: 'pichana', emoji: '🥩' },
      { name: 'churrasco', emoji: '🍖' },
      { name: 'ribeye steaks', emoji: '🍽️' },
      { name: 'rabbit', emoji: '🐰' },
      { name: 'quail', emoji: '🐦' },
      { name: 'gator', emoji: '🐊' },
      { name: 'iguana', emoji: '🦎' },
      { name: 'sausage', emoji: '🌭' },
      { name: 'turkey', emoji: '🦃' },
    ],
    vegetables: [
      { name: 'cauliflower', emoji: '🥦' },
      { name: 'carrot', emoji: '🥕' },
      { name: 'broccoli', emoji: '🥦' },
      { name: 'onion', emoji: '🧅' },
      { name: 'potato', emoji: '🥔' },
      { name: 'tomato', emoji: '🍅' },
      { name: 'green beans', emoji: '🌱' },
      { name: 'okra', emoji: '🌿' },
      { name: 'collards', emoji: '🥬' },
      { name: 'shrooms', emoji: '🍄' },
      { name: 'swamp cabbage', emoji: '🌾' },
      { name: 'palm hearts', emoji: '🌴' },
    ],
    fruits: [
      { name: 'apple', emoji: '🍎' },
      { name: 'banana', emoji: '🍌' },
      { name: 'lemon', emoji: '🍋' },
      { name: 'orange', emoji: '🍊' },
      { name: 'mango', emoji: '🥭' },
      { name: 'avocado', emoji: '🥑' },
      { name: 'starfruit', emoji: '✨' },
      { name: 'dragon fruit', emoji: '🐉' },
      { name: 'carambola', emoji: '🌟' },
      { name: 'coconuts', emoji: '🥥' },
      { name: 'lychee', emoji: '🍒' },
    ],
    seafood: [
      { name: 'salmon', emoji: '🐟' },
      { name: 'shrimp', emoji: '🦐' },
      { name: 'tuna', emoji: '🐡' },
      { name: 'yellowtail snapper', emoji: '🎣' },
      { name: 'grouper', emoji: '🪸' },
      { name: 'red snapper', emoji: '🌊' },
      { name: 'oysters', emoji: '🦪' },
      { name: 'lobster', emoji: '🦞' },
      { name: 'conch', emoji: '🐚' },
      { name: 'lionfish', emoji: '🦈' },
      { name: 'catfish', emoji: '🐺' },
      { name: 'bass', emoji: '🎸' },
      { name: 'crappie', emoji: '🐳' },
      { name: 'shark', emoji: '🦈' },
      { name: 'speckled trout', emoji: '🐠' },
      { name: 'redfish', emoji: '🐡' },
    ],
    dairy: [
      { name: 'cheese', emoji: '🧀' },
      { name: 'milk', emoji: '🥛' },
      { name: 'butter', emoji: '🧈' },
      { name: 'yogurt', emoji: '🍶' },
      { name: 'eggs', emoji: '🥚' },
    ],
    carbs: [
      { name: 'bread', emoji: '🍞' },
      { name: 'pasta', emoji: '🍝' },
      { name: 'rice', emoji: '🍚' },
      { name: 'tortilla', emoji: '🌮' },
      { name: 'pancakes', emoji: '🥞' },
      { name: 'waffles', emoji: '🧇' },
    ],
    devilWater: [
      { name: 'beer', emoji: '🍺' },
      { name: 'moonshine', emoji: '🥃' },
      { name: 'whiskey', emoji: '🥃' },
      { name: 'vodka', emoji: '🍸' },
      { name: 'tequila', emoji: '🌵' },
    ],
  };

  const AFFILIATE_LINKS = [
    {
      title: '🍔 Bubba’s Burger Smasher 🍔',
      url: 'https://amzn.to/4jwsA8w',
      image: 'https://m.media-amazon.com/images/I/61msHBPisBL._AC_SX425_.jpg',
    },
    {
      title: '🥃 Hillbilly Moonshine Maker 🥃',
      url: 'https://amzn.to/4lwVxmw',
      image: 'https://m.media-amazon.com/images/I/418WMdO5DQS._AC_US100_.jpg',
    },
    {
      title: '🔪 Granny’s Hog-Slicin’ Knife 🔪',
      url: 'https://amzn.to/4lp4j5M',
      image: 'https://m.media-amazon.com/images/I/61p28HGfcGL._AC_SY450_.jpg',
    },
    {
      title: '🍺 Redneck Beer Pong Kit 🍺',
      url: 'https://amzn.to/42re transposed7n7',
      image: 'https://m.media-amazon.com/images/I/81ZrDViTBTL._AC_SY355_.jpg',
    },
    {
      title: '🐔 Cletus’s Chicken Tickler Whisk 🐔',
      url: 'https://amzn.to/4j9uqMG',
      image: 'https://m.media-amazon.com/images/I/41ccOMyTYLL._AC_SX425_.jpg',
    },
    {
      title: '🥚 Possum’s Egg-Splodin’ Separator 🥚',
      url: 'https://amzn.to/3EiOrkG',
      image: 'https://m.media-amazon.com/images/I/61DHEfEI1TL._AC_SX425_.jpg',
    },
    {
      title: '🥓 Hog Holler Bacon Gripper Tongs 🥓',
      url: 'https://amzn.to/4jhJ8kA',
      image: 'https://m.media-amazon.com/images/I/71jIBCjXMPL._AC_SX425_.jpg',
    },
    {
      title: '🌽 Moonshine Mason Jar Measuring Cups 🌽',
      url: 'https://amzn.to/44tvYwi',
      image: 'https://m.media-amazon.com/images/I/51QJ8JIQCaL._AC_SY606_.jpg',
    },
    {
      title: '🔥 Gator’s Grill Scorchin’ Mitt 🔥',
      url: 'https://amzn.to/4lsnUCh',
      image: 'https://m.media-amazon.com/images/I/81Q8RGATIHL._AC_SX425_.jpg',
    },
    {
      title: '🍔 Squirrel’s Nutty Pancake Flipper 🍔',
      url: 'https://amzn.to/3RJ4U4K',
      image: 'https://m.media-amazon.com/images/I/71AicV-umtL._AC_SX425_.jpg',
    },
    {
      title: '🐷 Caja China Pig Roasting Box 🐷',
      url: 'https://amzn.to/4cz2GP4',
      image: 'https://m.media-amazon.com/images/I/61eD3oq2XXL._AC_SX425_.jpg',
    },
    {
      title: '🍳 Hillbilly Cast Iron Skillet 🍳',
      url: 'https://amzn.to/42H0vp9',
      image: 'https://m.media-amazon.com/images/I/81lU5G0EU-L._AC_SX425_.jpg',
    },
  ];

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const saved = localStorage.getItem('favorites');
        if (saved) {
          const parsedFavorites: Partial<Favorite>[] = JSON.parse(saved);
          const cleanedFavorites: Favorite[] = parsedFavorites.map(fav => ({
            title: fav.title || 'Unknown Recipe',
            ingredients: fav.ingredients || [],
            steps: fav.steps || [],
            nutrition: fav.nutrition || { calories: 0, protein: 0, fat: 0, chaos_factor: 0 },
            equipment: fav.equipment || [],
            shareText: fav.shareText || '',
            ingredients_with_links: fav.ingredients_with_links || [],
            add_all_to_cart: fav.add_all_to_cart || '',
            chaos_gear: fav.chaos_gear || '',
            tips: fav.tips || [],
            cooking_time: fav.cooking_time || 0,
            difficulty: fav.difficulty || 'Easy',
            servings: fav.servings || 1,
            id: fav.id || Date.now(),
            rating: fav.rating || 0,
            text: fav.text || undefined,
          }));
          setFavorites(cleanedFavorites);
          localStorage.setItem('favorites', JSON.stringify(cleanedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
    document.body.className = theme === 'light' ? '' : 'dark-theme';
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const fetchRecipe = async (isRandom = false) => {
    const selectedIngredients = [meat, vegetable, fruit, seafood, dairy, carb, devilWater].filter(Boolean);
    if (!selectedIngredients.length && !isRandom) {
      setRecipe({
        title: 'Error 🤦‍♂️',
        ingredients: [],
        steps: ["Pick somethin’, ya lazy bum! 😛"],
        nutrition: { calories: 0, protein: 0, fat: 0, chaos_factor: 0 },
        equipment: [],
        shareText: '',
        tips: [],
        cooking_time: 0,
        difficulty: 'Easy',
        servings: 1,
        chaos_gear: ''
      });
      setError(null);
      setIsLoading(false);
      setLastRandom(isRandom);
      return;
    }
    setIsLoading(true);
    setRecipe(null);
    setError(null);
    setLastRandom(isRandom);
    try {
      const data = await generateRecipe(selectedIngredients, isRandom);
      console.log('Fetched recipe:', JSON.stringify(data, null, 2));
      if (!data || !data.title || data.title === 'Error Recipe') {
        throw new Error('Invalid recipe received from server');
      }
      setRecipe(data);
    } catch (error: any) {
      console.error('Fetch error:', error.message, error.stack);
      setError(`Cookin’ crashed: ${error.message} 🤡`);
      setRecipe({
        title: 'Error 🤦‍♂️',
        ingredients: [],
        steps: [`Cookin’ crashed: ${error.message} 🤡`],
        nutrition: { calories: 0, protein: 0, fat: 0, chaos_factor: 0 },
        equipment: [],
        shareText: '',
        tips: [],
        cooking_time: 0,
        difficulty: 'Easy',
        servings: 1,
        chaos_gear: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorite = () => {
    if (recipe && !favorites.some((fav) => fav.title === recipe.title)) {
      const recipeWithId: Favorite = {
        ...recipe,
        id: Date.now(),
        rating: rating || 0,
      };
      const newFavorites = [...favorites, recipeWithId];
      setFavorites(newFavorites);
      try {
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        window.alert('Recipe saved to favorites!');
      } catch (error) {
        console.error('Error saving favorite:', error);
        window.alert('Failed to save favorite.');
      }
    } else {
      window.alert('Recipe already in favorites!');
    }
  };

  const removeFavorite = (recipeId: number) => {
    if (!recipeId) {
      window.alert('Cannot remove recipe: Invalid ID');
      return;
    }
    const confirmRemoval = window.confirm('Are you sure you want to remove this recipe?');
    if (confirmRemoval) {
      try {
        const idToRemove = Number(recipeId);
        const newFavorites = favorites.filter((fav) => fav.id !== idToRemove);
        setFavorites(newFavorites);
        if (selectedFavorite && selectedFavorite.id === idToRemove) {
          setSelectedFavorite(null);
        }
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        window.alert('Recipe removed from favorites');
      } catch (error) {
        console.error('Error removing favorite:', error);
        window.alert('Failed to remove favorite.');
      }
    }
  };

  const shareRecipe = (platform: 'facebook' | 'twitter' | 'default' = 'default') => {
    const currentRecipe = selectedFavorite || recipe;
    if (!currentRecipe) return;
    const shareText = currentRecipe.shareText || 
      `# ${currentRecipe.title} 🍽️\n\n` +
      `## Ingredients 🥕\n${(currentRecipe.ingredients || []).map(ing => {
        if (typeof ing === 'string') return `- ${ing} 🛒`;
        if (Array.isArray(ing)) return `- ${ing[0]} (${ing[1]}) 🛒`;
        return `- ${ing.name} (${ing.amount}) 🛒`;
      }).join('\n')}\n\n` +
      `## Steps 🍳\n${(currentRecipe.steps || []).map((step, i) => {
        if (typeof step === 'string') return `${i + 1}. ${step} 🔥`;
        return `${i + 1}. ${step.step} 🔥`;
      }).join('\n')}\n\n` +
      `## Nutrition 🍎\n- Calories: ${currentRecipe.nutrition?.calories || 0} kcal\n- Protein: ${currentRecipe.nutrition?.protein || 0}g\n- Fat: ${currentRecipe.nutrition?.fat || 0}g\n- Chaos Factor: ${currentRecipe.nutrition?.chaos_factor || 0}/10 😜\n\n` +
      `## Gear ⚙️\n${(currentRecipe.equipment || []).join(', ') || 'None'}${currentRecipe.chaos_gear ? `, Chaos Gear: ${currentRecipe.chaos_gear} 🪓` : ''}\n\n` +
      `Try this wild recipe y’all! 🤠`;
    const url = 'https://chuckle-chow-backend.onrender.com/';
    const fullMessage = `${shareText}\nCheck out Chuckle & Chow: ${url} 🌟`;
    try {
      if (platform === 'facebook') {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(fullMessage)}`;
        window.open(fbUrl, '_blank');
      } else if (platform === 'twitter') {
        const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(fullMessage)}`;
        window.open(xUrl, '_blank');
      } else if (navigator.share) {
        navigator.share({
          title: currentRecipe.title,
          text: shareText,
          url,
        });
      } else {
        window.alert(`Copy this to share: \n\n${fullMessage}`);
      }
    } catch {
      setError('Failed to share');
    }
  };

  const copyToClipboard = async () => {
    const currentRecipe = selectedFavorite || recipe;
    if (!currentRecipe) return;
    const textToCopy = 
      `# ${currentRecipe.title} 🍽️\n\n` +
      `## Ingredients 🥕\n${(currentRecipe.ingredients || []).map(ing => {
        if (typeof ing === 'string') return `- ${ing} 🛒`;
        if (Array.isArray(ing)) return `- ${ing[0]} (${ing[1]}) 🛒`;
        return `- ${ing.name} (${ing.amount}) 🛒`;
      }).join('\n')}\n\n` +
      `## Steps 🍳\n${(currentRecipe.steps || []).map((step, i) => {
        if (typeof step === 'string') return `${i + 1}. ${step} 🔥`;
        return `${i + 1}. ${step.step} 🔥`;
      }).join('\n')}\n\n` +
      `## Nutrition 🍎\n- Calories: ${currentRecipe.nutrition?.calories || 0} kcal\n- Protein: ${currentRecipe.nutrition?.protein || 0}g\n- Fat: ${currentRecipe.nutrition?.fat || 0}g\n- Chaos Factor: ${currentRecipe.nutrition?.chaos_factor || 0}/10 😜\n\n` +
      `## Gear ⚙️\n${(currentRecipe.equipment || []).join(', ') || 'None'}${currentRecipe.chaos_gear ? `, Chaos Gear: ${currentRecipe.chaos_gear} 🪓` : ''}\n\n` +
      `Cooked up by Chuckle & Chow! 🤠 Check it out: https://chuckle-chow-backend.onrender.com/ 🌟`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Clipboard failed');
    }
  };

  const clearInput = () => {
    setMeat('');
    setVegetable('');
    setFruit('');
    setSeafood('');
    setDairy('');
    setCarb('');
    setDevilWater('');
    setRecipe(null);
    setError(null);
    setLastRandom(false);
    setSelectedFavorite(null);
    setSearch('');
    setRating(0);
  };

  const toggleFavorites = () => {
    setShowFavorites(!showFavorites);
    setSelectedFavorite(null);
    setSearch('');
  };

  const handleAddAllToCart = () => {
    setShowCartModal(true);
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollOffset(e.currentTarget.scrollTop);
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  interface PickerSectionProps {
    label: string;
    category: keyof typeof INGREDIENT_CATEGORIES;
    value: string;
    onValueChange: (value: string) => void;
    bgColor: string;
  }

  const PickerSection = React.memo(({ label, category, value, onValueChange, bgColor }: PickerSectionProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onValueChange(e.target.value);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollOffset;
      }
    };

    return (
      <div className={`input-section ${category}`}>
        <div
          className="input-label"
          style={{ backgroundColor: bgColor, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => toggleCategory(category)}
          aria-label={`Toggle ${label} category`}
        >
          <span>${label}</span>
          <svg
            className="toggle-arrow"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFD700"
            strokeWidth="2"
          >
            <path d={expandedCategories[category] ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
          </svg>
        </div>
        {expandedCategories[category] && (
          <select
            value={value}
            onChange={handleChange}
            className="picker"
            style={{ backgroundColor: bgColor }}
            aria-label={label}
          >
            <option value="">None</option>
            {INGREDIENT_CATEGORIES[category].map((item) => (
              <option key={item.name} value={item.name}>
                ${item.name} ${item.emoji}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  });

  const FavoritesList: React.FC = () => {
    const filteredFavorites = favorites.filter((fav) =>
      (fav.title || '').toLowerCase().includes(search.toLowerCase())
    );
    const clearSearch = () => setSearch('');
    return (
      <div className="favorites">
        <h2 className="subtitle">⭐ Favorites 💖</h2>
        <div className="search-row">
          <input
            className="input"
            placeholder="Search Favorites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search favorites"
          />
          <motion.button
            className="clear-button"
            onClick={clearSearch}
            whileHover={{ scale: 1.1, rotate: 3 }}
            aria-label="Clear search"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && clearSearch()}
          >
            <span className="clear-button-text">✖</span>
          </motion.button>
        </div>
        {filteredFavorites.length ? (
          filteredFavorites.map((item) => (
            <div key={item.id} className="fav-item-container">
              <div
                style={{ flex: 1, cursor: 'pointer' }}
                onClick={() => setSelectedFavorite(item)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedFavorite(item)}
                aria-label={`View ${item.title || 'recipe'}`}
              >
                <p className="fav-item">🌟 ${item.title || 'Unknown Recipe'} ${item.rating ? `(${item.rating} ★)` : ''}</p>
              </div>
              <motion.button
                className="remove-button"
                onClick={() => removeFavorite(item.id)}
                whileHover={{ scale: 1.1, rotate: 3 }}
                aria-label={`Remove ${item.title || 'recipe'} from favorites`}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && removeFavorite(item.id)}
              >
                <span className="remove-button-text">Remove ❌</span>
              </motion.button>
            </div>
          ))
        ) : (
          <p className="no-favorites">No favorites found</p>
        )}
      </div>
    );
  };

  const AffiliateSection: React.FC = () => (
    <div className="affiliate-section">
      <p className="affiliate-header">💰 Git Yer Loot Here, Y’all! 💸</p>
      {AFFILIATE_LINKS.map((link, index) => (
        <motion.a
          key={link.title}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`affiliate-button affiliate-button-${index + 1}`}
          whileHover={{ scale: 1.05, rotate: 2 }}
          aria-label={`Visit affiliate link: ${link.title}`}
        >
          <img
            src={link.image}
            alt={link.title}
            className="affiliate-image"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = '/assets/fallback.png';
            }}
          />
          <span className="affiliate-text">${link.title}</span>
        </motion.a>
      ))}
      <p className="affiliate-disclaimer">
        As an Amazon Associate, I earn from qualifyin’ purchases, yeehaw!
      </p>
    </div>
  );

  interface StarRatingProps {
    rating: number;
    setRating: (rating: number) => void;
  }

  const StarRating: React.FC<StarRatingProps> = ({ rating, setRating }) => (
    <div style={{ margin: '10px 0' }} role="radiogroup" aria-label="Rate this recipe">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            cursor: 'pointer',
            color: star <= rating ? '#FFD700' : theme === 'light' ? '#ccc' : '#666',
            fontSize: '20px'
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

  interface RecipeCardProps {
    recipe: Recipe | Favorite;
    onShare: (platform?: 'facebook' | 'twitter' | 'default') => void;
    onSave?: () => void;
    onBack?: () => void;
  }

  const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onShare, onSave, onBack }) => (
    <motion.div
      className="recipe-card"
      initial={{ opacity: 0, rotate: -5 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      whileHover={{ scale: 1.05, rotate: 2 }}
    >
      {recipe.title && (
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="recipe-title"
        >
          ${recipe.title || 'No Title'}
        </motion.h2>
      )}
      {recipe.ingredients && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="recipe-section">Ingredients:</p>
          {recipe.ingredients.map((ing, i) => {
            let displayText = '';
            if (typeof ing === 'string') displayText = ing;
            else if (Array.isArray(ing)) displayText = `${ing[0]} (${ing[1]})`;
            else displayText = `${ing.name} (${ing.amount})`;
            const link = recipe.ingredients_with_links?.find((link: IngredientLink) => link.name === (typeof ing === 'string' ? ing : Array.isArray(ing) ? ing[0] : ing.name));
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <p className="recipe-item">- ${displayText}</p>
                {link && (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="recipe-item"
                    style={{ color: '#FF9900', marginLeft: 10 }}
                    aria-label={`Buy ${displayText}`}
                  >
                    🛒 Buy
                  </a>
                )}
              </div>
            );
          })}
        </motion.div>
      )}
      {recipe.steps && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="recipe-section">Steps:</p>
          {recipe.steps.map((step, i) => {
            const displayStep = typeof step === 'string' ? step : step.step;
            return (
              <p key={i} className="recipe-item">
                ${i + 1}. ${displayStep}
              </p>
            );
          })}
        </motion.div>
      )}
      {(recipe.nutrition || recipe.cooking_time || recipe.difficulty || recipe.servings) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="recipe-section">Details:</p>
          {recipe.nutrition && (
            <p className="recipe-item">
              Calories: ${recipe.nutrition.calories || 0} | Protein: ${recipe.nutrition.protein || 0}g | Fat: ${recipe.nutrition.fat || 0}g | Chaos: ${recipe.nutrition.chaos_factor || 0}/10
            </p>
          )}
          {recipe.cooking_time && (
            <p className="recipe-item">Cooking Time: ${recipe.cooking_time} minutes</p>
          )}
          {recipe.difficulty && (
            <p className="recipe-item">Difficulty: ${recipe.difficulty}</p>
          )}
          {recipe.servings && (
            <p className="recipe-item">Servings: ${recipe.servings}</p>
          )}
        </motion.div>
      )}
      {(recipe.equipment || recipe.chaos_gear) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="recipe-section">Gear:</p>
          <p className="recipe-item">
            ${(recipe.equipment || []).join(', ') || 'None'}${recipe.chaos_gear ? `, Chaos Gear: ${recipe.chaos_gear} 🪓` : ''}
          </p>
        </motion.div>
      )}
      {'rating' in recipe && (
        <StarRating rating={recipe.rating || 0} setRating={setRating} />
      )}
      <div className="recipe-actions">
        <motion.button
          className={`action-button ${copied ? 'copied' : ''}`}
          onClick={copyToClipboard}
          whileHover={{ scale: 1.1, rotate: 3 }}
          aria-label="Copy recipe to clipboard"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && copyToClipboard()}
        >
          <span className="copy-button-text">${copied ? 'Snagged It! 🎯' : 'Copy to Clipboard 📋'}</span>
        </motion.button>
        <motion.button
          className="action-button twitter-share"
          onClick={() => onShare('twitter')}
          whileHover={{ scale: 1.1, rotate: 3 }}
          aria-label="Share to X"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onShare('twitter')}
        >
          <span className="copy-button-text">🐦 Share to X</span>
        </motion.button>
        <motion.button
          className="action-button facebook-share"
          onClick={() => onShare('facebook')}
          whileHover={{ scale: 1.1, rotate: 3 }}
          aria-label="Share to Facebook"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onShare('facebook')}
        >
          <span className="copy-button-text">📘 Share to Facebook</span>
        </motion.button>
        <motion.button
          className="action-button share-default"
          onClick={() => onShare('default')}
          whileHover={{ scale: 1.1, rotate: 3 }}
          aria-label="Share to other platforms"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onShare('default')}
        >
          <span className="copy-button-text">📣 Share to Pals</span>
        </motion.button>
        <motion.button
          className="action-button"
          style={{ backgroundColor: '#FF9900', borderColor: '#FFD700' }}
          onClick={handleAddAllToCart}
          whileHover={{ scale: 1.1, rotate: 3 }}
          aria-label="Add all ingredients to Amazon cart"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleAddAllToCart()}
        >
          <span className="copy-button-text">🛒 Add All to Amazon Cart</span>
        </motion.button>
        {onSave && (
          <motion.button
            className="action-button"
            style={{ backgroundColor: '#4ECDC4' }}
            onClick={onSave}
            whileHover={{ scale: 1.1, rotate: 3 }}
            aria-label="Save to favorites"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
          >
            <span className="copy-button-text">💾 Hoard This Gem</span>
          </motion.button>
        )}
        {onBack && (
          <motion.button
            className="action-button"
            style={{ backgroundColor: '#FFD93D' }}
            onClick={onBack}
            whileHover={{ scale: 1.1, rotate: 3 }}
            aria-label="Back to favorites list"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onBack()}
          >
            <span className="copy-button-text">⬅️ Back to the Heap</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  return (
    <ErrorBoundary>
      <div
        className="main-container"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="content-container"
        >
          <div className="header-container">
            <h1 className="header">🤪 Chuckle & Chow: Recipe Rumble 🍔💥</h1>
            <p className="subheader">
              Cookin’ Up Chaos for Rednecks, Rebels, and Rascals! 🎸🔥
            </p>
          </div>
          <motion.button
            className="action-button theme-toggle"
            onClick={toggleTheme}
            whileHover={{ scale: 1.1, rotate: 3 }}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleTheme()}
          >
            <span className="copy-button-text">${theme === 'light' ? '🌙 Moonshine Mode' : '🌞 Daylight Chaos'}</span>
          </motion.button>
          <div className="promo-container">
            <p className="promo-text">🍳 Pick ingredients from the categories below to create a recipe!</p>
            <p className="promo-text">🎲 Hit 'Cook Me a Hoot' or 'Random Ruckus Recipe' for a wild dish!</p>
            <p className="promo-text">💾 Save, share, or shop your recipes, y’all!</p>
          </div>
          <PickerSection
            label="🥩 Meaty Madness 🍖"
            category="meat"
            value={meat}
            onValueChange={setMeat}
            bgColor="#FF6347"
          />
          <PickerSection
            label="🥕 Veggie Voodoo 🥔"
            category="vegetables"
            value={vegetable}
            onValueChange={setVegetable}
            bgColor="#228B22"
          />
          <PickerSection
            label="🍎 Fruity Frenzy 🍋"
            category="fruits"
            value={fruit}
            onValueChange={setFruit}
            bgColor="#FF1493"
          />
          <PickerSection
            label="🦐 Sea Critter Chaos 🐟"
            category="seafood"
            value={seafood}
            onValueChange={setSeafood}
            bgColor="#20B2AA"
          />
          <PickerSection
            label="🧀 Dairy Delirium 🧀"
            category="dairy"
            value={dairy}
            onValueChange={setDairy}
            bgColor="#FFA500"
          />
          <PickerSection
            label="🍞 Carb Craze 🍝"
            category="carbs"
            value={carb}
            onValueChange={setCarb}
            bgColor="#8B4513"
          />
          <PickerSection
            label="🥃 Devil Water Disaster 🍺"
            category="devilWater"
            value={devilWater}
            onValueChange={setDevilWater}
            bgColor="#800080"
          />
          {isLoading && (
            <div className="spinner-container">
              <div className="spinner" />
              <p className="spinner-text">
                🔥 Whippin’ up somethin’ nuttier than a squirrel’s stash... 🐿️
              </p>
              <div className="recipe-card">
                <div className="skeleton-box" style={{ height: '30px', width: '80%', marginBottom: '10px' }} />
                <div className="skeleton-box" style={{ height: '20px', width: '60%', marginBottom: '5px' }} />
                <div className="skeleton-box" style={{ height: '20px', width: '70%', marginBottom: '5px' }} />
                <div className="skeleton-box" style={{ height: '20px', width: '50%', marginBottom: '5px' }} />
              </div>
            </div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="error-container"
            >
              <p className="error">💥 Dang it! ${error} 🤦‍♂️</p>
              <motion.button
                className="action-button clear-error"
                onClick={() => setError(null)}
                whileHover={{ scale: 1.1, rotate: 3 }}
                aria-label="Clear error message"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setError(null)}
              >
                <span className="copy-button-text">🧹 Clear the Mess</span>
              </motion.button>
              <motion.button
                className="action-button retry-recipe"
                onClick={() => fetchRecipe(lastRandom)}
                whileHover={{ scale: 1.1, rotate: 3 }}
                aria-label="Retry recipe generation"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fetchRecipe(lastRandom)}
              >
                <span className="copy-button-text">🐴 Retry, Ya Mule!</span>
              </motion.button>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="button-row"
          >
            <motion.button
              className="action-button"
              onClick={() => fetchRecipe(false)}
              disabled={isLoading}
              whileHover={{ scale: 1.1, rotate: 3 }}
              aria-label="Generate recipe"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fetchRecipe(false)}
            >
              <span className="copy-button-text">🍳 Cook Me a Hoot! 🎉</span>
            </motion.button>
            <motion.button
              className="action-button random-recipe"
              onClick={() => fetchRecipe(true)}
              disabled={isLoading}
              whileHover={{ scale: 1.1, rotate: 3 }}
              aria-label="Generate random recipe"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fetchRecipe(true)}
            >
              <span className="copy-button-text">🎲 Random Ruckus Recipe 🌩️</span>
            </motion.button>
            <motion.button
              className="action-button clear-inputs"
              onClick={clearInput}
              whileHover={{ scale: 1.1, rotate: 3 }}
              aria-label="Clear inputs"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && clearInput()}
            >
              <span className="copy-button-text">🧹 Wipe the Slate, Bubba 🐴</span>
            </motion.button>
            <motion.button
              className="action-button"
              onClick={toggleFavorites}
              whileHover={{ scale: 1.1, rotate: 3 }}
              aria-label={showFavorites ? 'Hide favorites' : 'Show favorites'}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleFavorites()}
            >
              <span className="copy-button-text">${showFavorites ? '🙈 Hide My Stash' : '💰 Show My Stash'}</span>
            </motion.button>
          </motion.div>
          {recipe && recipe.title !== 'Error' && !selectedFavorite && (
            <RecipeCard recipe={recipe} onShare={shareRecipe} onSave={saveFavorite} onBack={undefined} />
          )}
          {recipe && recipe.title === 'Error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="error-container"
            >
              <p className="error">💥 Dang it! ${(recipe.steps && recipe.steps[0] ? (typeof recipe.steps[0] === 'string' ? recipe.steps[0] : recipe.steps[0].step) : 'Unknown error')} 🤦‍♂️</p>
              <motion.button
                className="action-button retry-recipe"
                onClick={() => fetchRecipe(lastRandom)}
                whileHover={{ scale: 1.1, rotate: 3 }}
                aria-label="Retry recipe generation"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fetchRecipe(lastRandom)}
              >
                <span className="copy-button-text">🐴 Retry, Ya Mule!</span>
              </motion.button>
              <motion.button
                className="action-button clear-error"
                onClick={() => setRecipe(null)}
                whileHover={{ scale: 1.1, rotate: 3 }}
                aria-label="Clear error"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setRecipe(null)}
              >
                <span className="copy-button-text">🧹 Clear the Mess</span>
              </motion.button>
            </motion.div>
          )}
          {showFavorites && favorites.length > 0 && <FavoritesList />}
          {selectedFavorite && (
            <RecipeCard recipe={selectedFavorite} onShare={shareRecipe} onSave={undefined} onBack={() => setSelectedFavorite(null)} />
          )}
          {showCartModal && (
            <div className="welcome-modal">
              <div className="welcome-content">
                <img src="/assets/fallback.png" alt="Fallback" className="modal-image" />
                <p className="modal-text">Coming Soon</p>
                <p className="modal-sub-text">This feature is cookin’ and ain’t ready yet!</p>
                <motion.button
                  className="welcome-button"
                  onClick={() => setShowCartModal(false)}
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  aria-label="Close modal"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setShowCartModal(false)}
                >
                  <span className="modal-button-text">OK</span>
                </motion.button>
              </div>
            </div>
          )}
          <AffiliateSection />
          <div className="footer">
            <div className="footer-container">
              <img src="/assets/gt.png" alt="Logo" className="footer-logo" />
              <div className="footer-text-container">
                <Link to="/privacy-policy" className="footer-privacy-text" aria-label="Privacy Policy">
                  Privacy Policy 🕵️‍♂️
                </Link>
                <p className="footer-contact-text">
                  Got issues? Holler at{' '}
                  <a href="mailto:bshoemak@mac.com" className="footer-email-link" aria-label="Email support">
                    bshoemak@mac.com 📧
                  </a>
                </p>
                <p className="footer-contact-text">
                  To help pay for xAi recipes donate bucks or sweet gold nuggets to bshoemak@mac.com via Zelle, Apple Pay, or CashApp ($barlitorobusto). We'll even take bitcoin at bc1qs28qfmxmm6vcv6xt2rw5w973tp23wpaxwd988l or pumped and dumped crypto bags you're tired of looking at...just ask via email.
                </p>
                <p className="footer-copyright">© 2025 Chuckle & Chow 🌟</p>
              </div>
              <img src="/assets/fallback.png" alt="Fallback" className="footer-fallback" />
            </div>
          </div>
        </motion.div>
      </div>
    </ErrorBoundary>
  );
}