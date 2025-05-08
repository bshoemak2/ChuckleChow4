import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Recipe } from './types';
import './styles.css?v=3.9';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

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
    console.error('ERROR_BOUNDARY_2025_05_04', error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <p className="error">Chaos broke loose! 🐷 ${this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const decodeMarkdown = (text: string): string => {
  return text
    .replace(/###\s/g, '🍴 ') // Convert ### to fork emoji
    .replace(/\*\*(.*?)\*\*/g, '🔥 $1 🔥') // Convert **text** to fire emojis
    .replace(/^- /gm, '➡️ ') // Convert - to arrow emoji
    .replace(/^\d+\.\s/gm, '➡️ ') // Convert numbered lists to arrow emoji
    .replace(/\n\n/g, '\n'); // Reduce double newlines
};

export default function HomeScreen() {
  console.log('INDEX_TXS_HOMESCREEN_2025_05_04', new Date().toISOString());
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
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );
  const [showWelcome, setShowWelcome] = useState(!localStorage.getItem('welcomeDismissed'));

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  const LOADING_MESSAGES = [
    "Rustlin’ up a recipe faster than a jackrabbit on a date! 🐰",
    "Whippin’ up chaos like a hog in a mud pit! 🐷",
    "Cookin’ somethin’ crazier than a squirrel’s stash! 🐿️",
    "Hold yer horses, we’re grillin’ a masterpiece! 🐴",
    "Stirrin’ the pot with more spice than a jalapeño’s armpit! 🌶️",
  ];

  const PROMO_QUOTES = [
    "🥃 Smoother than moonshine on a summer night",
    "🔥 Spicier than a firecracker in a skillet",
    "🌽 Sweeter than corn on the cob at a hoedown",
    "🍺 Best with a cold one, yeehaw!",
    "🐷 Crazier than a hog on a hot tin roof",
    "🍖 Tastier than a possum pie at a picnic",
    "🐔 Fresher than a rooster’s crow at dawn",
    "🍞 Warmer than biscuits fresh outta the oven",
    "💥 Bolder than a bull in a china shop",
    "🌶️ Hotter than a jalapeño’s armpit",
  ];

  // Randomly select 3 quotes, strip any leading "??"
  const getRandomQuotes = () => {
    const shuffled = [...PROMO_QUOTES].sort(() => Math.random() - 0.5);
    const selectedQuotes = shuffled.slice(0, 3).map(quote => quote.replace(/^\?+\s*/, '') || '🍺 Best with a cold one, yeehaw!');
    console.log('Selected promo quotes:', JSON.stringify(selectedQuotes, null, 2)); // Explicit string logging
    return selectedQuotes.map(quote => quote.replace(/^\?+\s*/, '')); // Third sanitization layer
  };
  const promoQuotes = getRandomQuotes();

  useEffect(() => {
    console.log('HomeScreen rendered with theme:', theme);
    console.log('Footer links and sponsorship text should appear in footerContainer with red debug border');
    if (scrollContainerRef.current) {
      const computedStyles = window.getComputedStyle(scrollContainerRef.current);
      console.log('scrollContainerRef is mounted, computed styles:', {
        display: computedStyles.display,
        visibility: computedStyles.visibility,
        height: computedStyles.height,
        minHeight: computedStyles.minHeight,
        overflow: computedStyles.overflow,
        zIndex: computedStyles.zIndex,
      });
    }
    if (footerRef.current) {
      const computedStyles = window.getComputedStyle(footerRef.current);
      console.log('footerRef is mounted, computed styles:', {
        display: computedStyles.display,
        visibility: computedStyles.visibility,
        height: computedStyles.height,
        minHeight: computedStyles.minHeight,
        overflow: computedStyles.overflow,
        zIndex: computedStyles.zIndex,
        backgroundColor: computedStyles.backgroundColor,
        backgroundImage: computedStyles.backgroundImage,
      });
      console.log('Footer children:', footerRef.current.innerHTML);
    }
    if (document.body) {
      const bodyStyles = window.getComputedStyle(document.body);
      console.log('Body computed styles:', {
        backgroundColor: bodyStyles.backgroundColor,
        backgroundImage: bodyStyles.backgroundImage,
        fontFamily: bodyStyles.fontFamily,
      });
    }
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
    // Log rendered promo quotes
    console.log('Rendered promo quotes:', JSON.stringify(promoQuotes, null, 2));
  }, [theme, promoQuotes]);

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
      { name: 'pork ribs', emoji: '🍖' },
      { name: 'beef ribs', emoji: '🍖' },
      { name: 'crow', emoji: '🐦' },
      { name: 'goat', emoji: '🐐' },
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
      { name: 'chef salad', emoji: '🥗' },
      { name: 'sugar cane', emoji: '🌾' },
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
      { name: 'biscuits', emoji: '🥐' },
      { name: 'cachapas', emoji: '🌽' },
      { name: 'cornbread', emoji: '🍞' },
    ],
    devilWater: [
      { name: 'beer', emoji: '🍺' },
      { name: 'moonshine', emoji: '🥃' },
      { name: 'whiskey', emoji: '🥃' },
      { name: 'vodka', emoji: '🍸' },
      { name: 'tequila', emoji: '🌵' },
      { name: 'rum', emoji: '🏴‍☠️' },
      { name: 'scotch', emoji: '🥃' },
      { name: 'malt liquor', emoji: '🍺' },
    ],
  };

  const AFFILIATE_LINKS = [
    {
      title: '🍔 Bubba’s Burger Smasher 🍔',
      url: 'https://amzn.to/4jwsA8w',
      image: 'https://m.media-amazon.com/images/I/61msHBPisBL._AC_SX425_.jpg',
      description: 'Y’all, this ain’t just a burger smasher, it’s a patty-poundin’ legend! The best burger smasher tool for Southern grilling flattens ground beef faster than a possum dodgin’ a pickup on a backroad. Built tough for redneck cookouts, this heavy-duty smasher makes juicy, diner-style burgers that’ll have your kin hollerin’ for seconds. Perfect for BBQ pitmasters and tailgate chefs, it’s like wieldin’ a sledgehammer for your grill. Snag this must-have kitchen gadget and smash your way to burger glory—your taste buds’ll thank ya, partner!'
    },
    {
      title: '🥃 Hillbilly Moonshine Maker 🥃',
      url: 'https://amzn.to/4lwVxmw',
      image: 'https://m.media-amazon.com/images/I/418WMdO5DQS._AC_US100_.jpg',
      description: 'Listen up, moonshiners! This top-rated moonshine distilling kit is your ticket to brewin’ rocket fuel that’d make your grandpappy proud. Crafted for backwoods rebels, this home distillery setup lets you whip up high-proof hooch smoother than a coonhound’s nap in the shade. Ideal for Southern liquor enthusiasts, it’s got everything ya need to distill like a pro—minus the revenuers sniffin’ around. Whether you’re sippin’ or cookin’ with it, this kit’s a game-changer for hillbilly mixologists. Grab it now and start shinin’ under the stars!'
    },
    {
      title: '🔪 Granny’s Hog-Slicin’ Knife 🔪',
      url: 'https://amzn.to/4lp4j5M',
      image: 'https://m.media-amazon.com/images/I/61p28HGfcGL._AC_SY450_.jpg',
      description: 'This ain’t no ordinary kitchen knife—it’s Granny’s hog-slicin’ beast, the best chef’s knife for Southern butchering! Sharp enough to carve a hog quicker than a banjo pickin’ at a hoedown, this blade slices through ribs, roasts, and taters like a hot knife through lard. Built for redneck cooks who mean business, it’s perfect for BBQ prep or whittlin’ down your catch. With a grip tougher than a gator’s hide, this knife’s a must for every country kitchen. Snag it and chop your way to culinary fame!'
    },
    {
      title: '🍺 Redneck Beer Pong Kit 🍺',
      url: 'https://amzn.to/42re7n7',
      image: 'https://m.media-amazon.com/images/I/81ZrDViTBTL._AC_SY355_.jpg',
      description: 'Yeehaw, it’s party time! This ultimate beer pong kit is the best tailgate game for Southern hootenannies, turnin’ any backyard into a redneck rager. Packed with sturdy cups and balls tougher than a mule’s hindquarters, it’s built for epic battles at fish fries or huntin’ camp. Perfect for country party enthusiasts, this kit guarantees more laughs than a barrel of possums. Whether you’re aimin’ for glory or just spillin’ brew, it’s a must-have for good ol’ boys and gals. Grab it and pong your way to legend status!'
    },
    {
      title: '🐔 Cletus’s Chicken Tickler Whisk 🐔',
      url: 'https://amzn.to/4j9uqMG',
      image: 'https://m.media-amazon.com/images/I/41ccOMyTYLL._AC_SX425_.jpg',
      description: 'Get ready to whip up a storm with Cletus’s Chicken Tickler, the best kitchen whisk for Southern baking! This bad boy mixes batter faster than a coon dog chasin’ a squirrel, perfect for cornbread, gravy, or moonshine-infused sauces. Built for redneck chefs who love a good ol’ mess, it’s sturdy enough to handle biscuit dough thicker than a fog on the bayou. A top pick for country cooking, this whisk’ll have you stirrin’ up chaos like nobody’s business. Snag it now and tickle your recipes into submission!'
    },
    {
      title: '🥚 Possum’s Egg-Splodin’ Separator 🥚',
      url: 'https://amzn.to/3EiOrkG',
      image: 'https://m.media-amazon.com/images/I/61DHEfEI1TL._AC_SX425_.jpg',
      description: 'Y’all need this egg separator more than a possum needs a hideout! The best egg yolk separator for Southern baking splits eggs cleaner than a preacher’s sermon on Sunday. Perfect for redneck bakers makin’ cakes, custards, or moonshine meringues, this gadget pops yolks like a firecracker at a hog roast. Easy to use and tougher than a barnyard rooster, it’s a must-have for country kitchens. Get this top-rated kitchen tool and separate eggs like a pro—your biscuits’ll rise higher than a kite in a twister!'
    },
    {
      title: '🥓 Hog Holler Bacon Gripper Tongs 🥓',
      url: 'https://amzn.to/4jhJ8kA',
      image: 'https://m.media-amazon.com/images/I/71jIBCjXMPL._AC_SX425_.jpg',
      description: 'These ain’t just tongs—they’re the best bacon tongs for Southern frying, grippin’ strips tighter than a gator snappin’ a catfish! Perfect for flippin’ bacon, ribs, or taters in a skillet hotter than a Georgia summer, these bad boys are built for redneck grillmasters. With a grip steadier than your cousin’s aim at a skeet shoot, they’re essential for BBQ pit cookouts and fish fries. Snag these heavy-duty kitchen tongs and wrestle your grub like a pro—your breakfast plate’ll be hollerin’ for more!'
    },
    {
      title: '🌽 Moonshine Mason Jar Measuring Cups 🌽',
      url: 'https://amzn.to/44tvYwi',
      image: 'https://m.media-amazon.com/images/I/51QJ8JIQCaL._AC_SY606_.jpg',
      description: 'Measure your fixins with swagger usin’ these Moonshine Mason Jar Measuring Cups, the best measuring cups for Southern cooking! Shaped like mini mason jars, they’re perfect for scoopin’ flour, sugar, or moonshine for your cornbread or BBQ sauce. Built for redneck bakers and pitmasters, these durable cups are tougher than a junkyard dog and add hillbilly charm to any kitchen. Ideal for country recipes and tailgate prep, they’ll have you measurin’ like a pro. Grab these must-have kitchen tools and cook with some serious Southern style!'
    },
    {
      title: '🔥 Gator’s Grill Scorchin’ Mitt 🔥',
      url: 'https://amzn.to/4lsnUCh',
      image: 'https://m.media-amazon.com/images/I/81Q8RGATIHL._AC_SX425_.jpg',
      description: 'Don’t let no hot grill scare ya—this Gator’s Grill Scorchin’ Mitt is the best oven mitt for Southern BBQ! Built to handle blazin’ skillets and smokin’ pits hotter than a jalapeño’s temper, this mitt’s perfect for redneck grillmasters flippin’ ribs or haulin’ cornbread outta the oven. Heat-resistant and tougher than a gator’s hide, it’s a must for fish fries and tailgates. Protect your paws and wrestle them hot pans like a pro with this top-rated BBQ glove. Snag it and grill like you’re wrestlin’ a twister!'
    },
    {
      title: '🍔 Squirrel’s Nutty Pancake Flipper 🍔',
      url: 'https://amzn.to/3RJ4U4K',
      image: 'https://m.media-amazon.com/images/I/71AicV-umtL._AC_SX425_.jpg',
      description: 'Flip flapjacks like a pro with Squirrel’s Nutty Pancake Flipper, the best spatula for Southern breakfast cooking! This sturdy flipper slides under pancakes, burgers, or catfish quicker than a squirrel dodgin’ buckshot in a pecan grove. Perfect for redneck cooks whippin’ up griddle feasts, it’s built to handle cast iron skillets and greasy spoon grills. A top pick for country kitchens, this spatula’s non-stick friendly and tough as nails. Grab this essential kitchen tool and flip your way to a breakfast spread that’ll make the neighbors jealous!'
    },
    {
      title: '🐷 Caja China Pig Roasting Box 🐷',
      url: 'https://amzn.to/4cz2GP4',
      image: 'https://m.media-amazon.com/images/I/61eD3oq2XXL._AC_SX425_.jpg',
      description: 'Ready for a hog-roastin’ hoedown? The Caja China Pig Roasting Box is the best pig roaster for Southern BBQ, turnin’ whole hogs into melt-in-your-mouth masterpieces faster than a banjo duel. Perfect for redneck pitmasters hostin’ epic cookouts, this bad boy’s built to roast juicy pork with that crispy skin everybody fights over. Ideal for tailgates, weddings, or just showin’ off, it’s a game-changer for country feasts. Snag this top-rated BBQ roaster and become the legend of the pig pickin’—your kin’ll be singin’ your praises!'
    },
    {
      title: '🍳 Hillbilly Cast Iron Skillet 🍳',
      url: 'https://amzn.to/42H0vp9',
      image: 'https://m.media-amazon.com/images/I/81lU5G0EU-L._AC_SX425_.jpg',
      description: 'This Hillbilly Cast Iron Skillet is the best cast iron skillet for Southern cooking, tougher than a mule’s hide and seasoned better than Granny’s gossip! Fry up catfish, cornbread, or bacon crispier than a June bug on a hot sidewalk. Perfect for redneck chefs who live for that sizzle, this skillet’s built to last through fish fries, campfires, and tailgate brawls. A must-have for country kitchens, it’s pre-seasoned and ready to churn out soul food that’ll make your kinfolk weep. Grab this skillet and cook like a Southern legend!'
    },
  ];

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const fetchRecipe = async (isRandom = false) => {
    const selectedIngredients = [meat, vegetable, fruit, seafood, dairy, carb, devilWater]
      .filter(Boolean)
      .map(ing => ing.toLowerCase());

    if (!isRandom && selectedIngredients.length === 0) {
      setError("Pick at least one ingredient, ya lazy bum! 😛");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setRecipe(null);
    setError(null);
    setLastRandom(isRandom);
    const requestId = generateUUID();
    console.log('Fetching recipe:', { isRandom, ingredients: selectedIngredients, requestId });

    const apiUrl = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:5000' : 'https://chuckle-chow-backend.onrender.com';
    const url = `${apiUrl}/generate_recipe?cb=${Date.now()}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          isRandom,
          requestId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.text || errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched recipe:', JSON.stringify(data, null, 2));
      setRecipe(data);
    } catch (error: any) {
      console.error('Fetch recipe error:', error.message, error.stack);
      setError(`Cookin’ crashed: ${error.message} 🤡`);
      setRecipe({
        title: `Cookin’ crashed: ${error.message} 🤡`,
        ingredients: [],
        steps: [],
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
  };

  const debouncedFetchRecipe = useCallback(debounce(fetchRecipe, 500), [
    meat, vegetable, fruit, seafood, dairy, carb, devilWater
  ]);

  const surpriseMe = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setMeat('');
    setVegetable('');
    setFruit('');
    setSeafood('');
    setDairy('');
    setCarb('');
    setDevilWater('');
    const categories = Object.keys(INGREDIENT_CATEGORIES) as (keyof typeof INGREDIENT_CATEGORIES)[];
    const randomIngredients = categories.map(category => {
      const items = INGREDIENT_CATEGORIES[category];
      return items[Math.floor(Math.random() * items.length)].name;
    });
    setMeat(randomIngredients[0]);
    setVegetable(randomIngredients[1]);
    setFruit(randomIngredients[2]);
    setSeafood(randomIngredients[3]);
    setDairy(randomIngredients[4]);
    setCarb(randomIngredients[5]);
    setDevilWater(randomIngredients[6]);
    const requestId = generateUUID();
    console.log('Surprise Me! selected ingredients:', randomIngredients, 'requestId:', requestId);
    debouncedFetchRecipe(true);
  };

  const shareRecipe = (platform: 'facebook' | 'twitter' | 'default' = 'default') => {
    const currentRecipe = recipe;
    if (!currentRecipe) return;
    const shareText = decodeMarkdown(currentRecipe.shareText || JSON.stringify(currentRecipe));
    const url = 'https://chuckle-chow-backend.onrender.com/';
    const fullMessage = `Get a load of this hogwash: ${shareText}\nCheck out my app: ${url} 🤠`;
    try {
      if (platform === 'facebook') {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&e=${encodeURIComponent(shareText)}`;
        window.open(fbUrl, '_blank');
      } else if (platform === 'twitter') {
        const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(fullMessage)}`;
        window.open(xUrl, '_blank');
      } else if (navigator.share) {
        navigator.share({
          title: 'Chuckle & Chow Recipe',
          text: shareText,
          url,
        });
      } else {
        window.alert('Sharing not supported. Copy this: ' + fullMessage);
      }
    } catch {
      setError('Failed to share');
    }
  };

  const copyToClipboard = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const currentRecipe = recipe;
    if (!currentRecipe) return;
    const textToCopy = decodeMarkdown(currentRecipe.shareText || JSON.stringify(currentRecipe));
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Clipboard failed');
    }
  };

  const clearInput = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
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
  };

  const getRandomLoadingMessage = () => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('welcomeDismissed', 'true');
  };

  interface PickerSectionProps {
    label: string;
    category: keyof typeof INGREDIENT_CATEGORIES;
    value: string;
    onValueChange: (value: string) => void;
    className: string;
    labelStyle?: React.CSSProperties;
  }

  const PickerSection = React.memo(({ label, category, value, onValueChange, className, labelStyle }: PickerSectionProps) => {
    const handleFocus = () => {
      scrollPositionRef.current = window.scrollY;
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      e.preventDefault();
      onValueChange(e.target.value);
      setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current);
      }, 0);
    };

    return (
      <div className={`input-section ${className}`}>
        <p className="input-label" style={labelStyle}>{label}</p>
        <select
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          aria-label={label}
          className="picker"
        >
          <option value="">None</option>
          {INGREDIENT_CATEGORIES[category]?.map((item) => (
            <option key={item.name} value={item.name}>
              ${item.name} ${item.emoji}
            </option>
          ))}
        </select>
      </div>
    );
  });

  const AffiliateSection: React.FC = React.memo(() => (
    <div className="affiliate-section">
      <p className="affiliate-header">💰 Git Yer Loot Here, Y’all! 💸</p>
      <p className="affiliate-disclaimer">
        As an Amazon Associate, I earn from qualifyin’ purchases, yeehaw!
      </p>
      {AFFILIATE_LINKS.map((link) => (
        <a
          key={link.title}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit affiliate link: ${link.title}`}
          className="affiliate-button"
          title="Snag this gear for your kitchen chaos!"
        >
          <img
            src={link.image}
            alt={link.title}
            onError={(e) => (e.currentTarget.src = '/assets/fallback.png')}
            className="affiliate-image"
          />
          <div className="affiliate-content">
            <span className="affiliate-text">{link.title}</span>
            <span className="affiliate-description">{link.description}</span>
          </div>
        </a>
      ))}
    </div>
  ));

  interface RecipeCardProps {
    recipe: Recipe;
    onShare: (platform?: 'facebook' | 'twitter' | 'default') => void;
  }

  const RecipeCard: React.FC<RecipeCardProps> = React.memo(({ recipe, onShare }) => {
    console.log('RecipeCard rendering with recipe:', JSON.stringify(recipe).slice(0, 100) + '...');

    if (recipe.text) {
      const lines = recipe.text.split('\n').filter((line: string) => line.trim());
      const parsedLines = lines.map((line: string) => {
        const stepMatch = line.match(/^\d+\.\s+(.+)/);
        if (stepMatch) {
          return `${stepMatch[1]}`;
        }
        return line;
      });

      return (
        <div className="recipe-card animate-slide-in">
          {parsedLines.map((line: string, i: number) => {
            if (line.startsWith('### **') || line.startsWith('# ') || line.startsWith('## ')) {
              return <h2 key={i} className="recipe-title">{line.replace(/### \*\*|## |# |(\*\*)/g, '')}</h2>;
            } else if (line.startsWith('**') && line.endsWith('**')) {
              return <p key={i} className="recipe-section">{line.replace(/\*\*/g, '')}</p>;
            } else if (line.startsWith('*') && line.endsWith('*')) {
              return <p key={i} className="recipe-item" style={{ fontStyle: 'italic' }}>{line.replace(/\*/g, '')}</p>;
            } else if (line.startsWith('- ') || line.match(/^\d+\.\s/)) {
              return <p key={i} className="recipe-item">{line}</p>;
            } else {
              return <p key={i} className="recipe-item">{line}</p>;
            }
          })}
          {recipe.nutrition && (
            <div className="chaos-meter">
              <p>Chaos Factor: ${recipe.nutrition.chaos_factor}/10</p>
              <div className="chaos-bar" style={{ width: `${recipe.nutrition.chaos_factor * 10}%` }}></div>
            </div>
          )}
          <div className="recipe-actions">
            <button
              className={`action-button ${copied ? 'copied' : ''}`}
              onClick={copyToClipboard}
              aria-label="Copy recipe to clipboard"
              title="Snag this recipe for yer cookbook!"
            >
              <span className="action-button-text">{copied ? 'Snagged It! 🎯' : 'Copy to Clipboard 📋'}</span>
            </button>
            <button
              className="action-button twitter-share"
              onClick={() => onShare('twitter')}
              aria-label="Share to X"
              title="Holler about this dish on X!"
            >
              <span className="action-button-text">🐦 Share to X</span>
            </button>
            <button
              className="action-button facebook-share"
              onClick={() => onShare('facebook')}
              aria-label="Share to Facebook"
              title="Show off yer cookin’ to yer pals!"
            >
              <span className="action-button-text">📘 Share to Facebook</span>
            </button>
            <button
              className="action-button share-default"
              onClick={() => onShare('default')}
              aria-label="Share to other platforms"
              title="Spread the chaos far and wide!"
            >
              <span className="action-button-text">📣 Share to Pals</span>
            </button>
          </div>
        </div>
      );
    }

    const {
      title = 'Unknown Recipe',
      ingredients = [],
      steps = [],
      nutrition = { calories: 0, protein: 0, fat: 0, chaos_factor: 0 },
      equipment = [],
      cooking_time = 0,
      difficulty = 'Unknown',
      servings = 0,
      tips = [],
      chaos_gear = ''
    } = recipe;

    return (
      <div className="recipe-card animate-slide-in">
        <h2 className="recipe-title">{title}</h2>
        <p className="recipe-section">Ingredients:</p>
        {ingredients.map((ing, i) => {
          if (typeof ing === 'string') {
            return <p key={i} className="recipe-item">{`- ${ing}`}</p>;
          } else if (Array.isArray(ing)) {
            return <p key={i} className="recipe-item">{`- ${ing[0]} (${ing[1]})`}</p>;
          } else {
            return <p key={i} className="recipe-item">{`- ${ing.name} (${ing.amount})`}</p>;
          }
        })}
        <p className="recipe-section">Steps:</p>
        {steps.map((step, i) => (
          <p key={i} className="recipe-item">{`${i + 1}. ${typeof step === 'string' ? step : step.step}`}</p>
        ))}
        <p className="recipe-section">Nutrition:</p>
        <p className="recipe-item">{`- Calories: ${nutrition.calories}`}</p>
        <p className="recipe-item">{`- Protein: ${nutrition.protein}g`}</p>
        <p className="recipe-item">{`- Fat: ${nutrition.fat}g`}</p>
        <p className="recipe-item">{`- Chaos Factor: ${nutrition.chaos_factor}/10`}</p>
        {nutrition.chaos_factor > 0 && (
          <div className="chaos-meter">
            <p>Chaos Factor: ${nutrition.chaos_factor}/10</p>
            <div className="chaos-bar" style={{ width: `${nutrition.chaos_factor * 10}%` }}></div>
          </div>
        )}
        <p className="recipe-section">Equipment Needed:</p>
        <p className="recipe-item">{equipment.join(', ') || 'None'}</p>
        <p className="recipe-section">Cooking Time: ${cooking_time} minutes</p>
        <p className="recipe-section">Difficulty: ${difficulty}</p>
        <p className="recipe-section">Servings: ${servings}</p>
        {tips.length > 0 && (
          <>
            <p className="recipe-section">Tips:</p>
            {tips.map((tip, i) => (
              <p key={i} className="recipe-item">{`- ${tip}`}</p>
            ))}
          </>
        )}
        <p className="recipe-section">Chaos Gear: ${chaos_gear || 'None'}</p>
        <div className="recipe-actions">
          <button
            className={`action-button ${copied ? 'copied' : ''}`}
            onClick={copyToClipboard}
            aria-label="Copy recipe to clipboard"
            title="Snag this recipe for yer cookbook!"
          >
            <span className="action-button-text">{copied ? 'Snagged It! 🎯' : 'Copy to Clipboard 📋'}</span>
          </button>
          <button
            className="action-button twitter-share"
            onClick={() => onShare('twitter')}
            aria-label="Share to X"
            title="Holler about this dish on X!"
          >
            <span className="action-button-text">🐦 Share to X</span>
          </button>
          <button
            className="action-button facebook-share"
            onClick={() => onShare('facebook')}
            aria-label="Share to Facebook"
            title="Show off yer cookin’ to yer pals!"
          >
            <span className="action-button-text">📘 Share to Facebook</span>
          </button>
          <button
            className="action-button share-default"
            onClick={() => onShare('default')}
            aria-label="Share to other platforms"
            title="Spread the chaos far and wide!"
          >
            <span className="action-button-text">📣 Share to Pals</span>
          </button>
        </div>
      </div>
    );
  });

  const hasIngredients = [meat, vegetable, fruit, seafood, dairy, carb, devilWater].some(Boolean);

  return (
    <ErrorBoundary>
      <div className="main-container" ref={scrollContainerRef}>
        {showWelcome && (
          <div className="welcome-modal">
            <div className="welcome-content">
              <h2>Howdy, Y’all! 🤠</h2>
              <p>Yeehaw, welcome to *Chuckle & Chow*! 🤠🔥 Grab them dropdowns, slam 'Surprise Me!' for a hog-wild dish, or hit 'Cook Me a Hoot!' to stir up some Southern mayhem! 🌪️🍖 Got a bone to pick? Holler at <a href="mailto:bshoemak@mac.com">bshoemak@mac.com</a>! 📧</p>
              <button className="welcome-button" onClick={dismissWelcome}>
                Got It!
              </button>
            </div>
          </div>
        )}
        <div className="content-container">
          <div className="header-container">
            <h1 className="header">🤪 Chuckle & Chow: Recipe Rumble 🍔💥</h1>
            <p className="subheader">Cookin’ Up Chaos for Rednecks, Rebels, and Rascals! 🎸🔥</p>
          </div>
          <button
            className="action-button theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Get moonshine-drunk dark!' : 'Sober up with daylight!'}
          >
            <span className="action-button-text">{theme === 'light' ? '🌙 Moonshine Mode' : '🌞 Daylight Chaos'}</span>
          </button>
          <div className="promo-container">
            {promoQuotes.map((quote, index) => (
              <p key={`promo-${index}-${quote}`} className="promo-text">{quote.replace(/^\?+\s*/, '')}</p> // Unique key and sanitization
            ))}
          </div>
          <PickerSection
            label="🥩 Meaty Madness 🍖"
            category="meat"
            value={meat}
            onValueChange={setMeat}
            className="meat"
          />
          <PickerSection
            label="🥕 Veggie Voodoo 🥔"
            category="vegetables"
            value={vegetable}
            onValueChange={setVegetable}
            className="vegetables"
          />
          <PickerSection
            label="🍎 Fruity Frenzy 🍋"
            category="fruits"
            value={fruit}
            onValueChange={setFruit}
            className="fruits"
          />
          <PickerSection
            label="🦐 Sea Critter Chaos 🐟"
            category="seafood"
            value={seafood}
            onValueChange={setSeafood}
            className="seafood"
          />
          <PickerSection
            label="🧀 Dairy Delirium 🧀"
            category="dairy"
            value={dairy}
            onValueChange={setDairy}
            className="dairy"
            labelStyle={{ color: '#000000' }}
          />
          <PickerSection
            label="🍞 Carb Craze 🍝"
            category="carbs"
            value={carb}
            onValueChange={setCarb}
            className="carbs"
            labelStyle={{ color: '#FFFFFF' }}
          />
          <PickerSection
            label="🥃 Devil Water Disaster 🍺"
            category="devilWater"
            value={devilWater}
            onValueChange={setDevilWater}
            className="devilWater"
            labelStyle={{ color: '#FFFFFF' }}
          />
          {isLoading && (
            <div className="spinner-container">
              <div className="spinner" />
              <p className="spinner-text">${getRandomLoadingMessage()}</p>
              <div className="recipe-card">
                <div className="skeleton-box" style={{ height: '30px', width: '80%', marginBottom: '10px' }} />
                <div className="skeleton-box" style={{ height: '20px', width: '60%', marginBottom: '5px' }} />
                <div className="skeleton-box" style={{ height: '20px', width: '70%', marginBottom: '5px' }} />
                <div className="skeleton-box" style={{ height: '20px', width: '50%', marginBottom: '5px' }} />
              </div>
            </div>
          )}
          {error && (
            <div className="error-container">
              <p className="error">💥 Dang it! ${error} 🤦‍♂️</p>
              <button
                className="action-button clear-error"
                onClick={(e) => { e.preventDefault(); setError(null); }}
                aria-label="Clear error message"
                title="Sweep this mess under the rug!"
              >
                <span className="action-button-text">🧹 Clear the Mess</span>
              </button>
              <button
                className="action-button retry-recipe"
                onClick={(e) => { e.preventDefault(); debouncedFetchRecipe(lastRandom); }}
                aria-label="Retry recipe generation"
                title="Get back on the horse, ya mule!"
              >
                <span className="action-button-text">🐴 Retry, Ya Mule!</span>
              </button>
            </div>
          )}
          <div className="button-row">
            <button
              className={`action-button generate-recipe ${!hasIngredients || isLoading ? 'disabled' : ''}`}
              onClick={(e) => { e.preventDefault(); debouncedFetchRecipe(false); }}
              disabled={isLoading || !hasIngredients}
              aria-label="Generate recipe"
              title="Yeehaw, let’s make a mess!"
            >
              <span className="action-button-text">🍳 Cook Me a Hoot! 🎉</span>
            </button>
            <button
              className={`action-button random-recipe ${isLoading ? 'disabled' : ''}`}
              onClick={(e) => { e.preventDefault(); debouncedFetchRecipe(true); }}
              disabled={isLoading}
              aria-label="Generate random recipe"
              title="Stir up some wild chaos!"
            >
              <span className="action-button-text">🎲 Random Ruckus Recipe 🌩️</span>
            </button>
            <button
              className={`action-button surprise-me ${isLoading ? 'disabled' : ''}`}
              onClick={surpriseMe}
              disabled={isLoading}
              aria-label="Randomize all ingredients"
              title="Throw caution to the wind, partner!"
            >
              <span className="action-button-text">🎉 Surprise Me! 🤪</span>
            </button>
            <button
              className="action-button clear-inputs"
              onClick={clearInput}
              aria-label="Clear inputs"
              title="Wipe the slate cleaner than a hog’s hide!"
            >
              <span className="action-button-text">🧹 Wipe the Slate, Bubba 🐴</span>
            </button>
          </div>
          {recipe && (
            <RecipeCard recipe={recipe} onShare={shareRecipe} />
          )}
          <div className="donation-section">
            <p className="donation-message">
              xAi ain't free! To help pay for recipes donate bucks or sweet gold nuggets to <a href="mailto:bshoemak@mac.com" className="donation-email">bshoemak@mac.com</a> via Zelle, Apple Pay, or CashApp ( $barlitorobusto ). We'll even take bitcoin at bc1qs28qfmxmm6vcv6xt2rw5w973tp23wpaxwd988l or pumped and dumped crypto bags you're tired of looking...just ask via email.
            </p>
          </div>
          <AffiliateSection />
          <div className="footer" ref={footerRef}>
            <div className="footer-container">
              <img
                src="/assets/gt.png"
                alt="Game Theory Logo"
                className="footer-logo"
                onError={(e) => (e.currentTarget.src = '/assets/fallback.png')}
              />
              <div className="footer-text-container">
                <p className="footer-contact-text">
                  Got issues or want to sponsor? Holler at{' '}
                  <a href="mailto:bshoemak@mac.com" aria-label="Email support" className="footer-email-link">
                    bshoemak@mac.com 📧
                  </a>
                </p>
                <p className="footer-copyright">© 2025 Chuckle & Chow 🌟</p>
                <p className="footer-contact-text game-theory-text">
                  Check out other funny and useful apps by Game Theory 🎮
                </p>
                <ul className="footer-links">
                  <li>
                    <Link to="/privacy-policy" aria-label="Privacy Policy" className="footer-privacy-text">
                      Privacy Policy 🕵️‍♂️
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://shopping-assistant-5m0q.onrender.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visit Barlito's Bazaar"
                      className="footer-privacy-text"
                    >
                      Barlito's Bazaar 🛒
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://miami-pickup-basketball.onrender.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visit Miami Pickup Basketball"
                      className="footer-privacy-text"
                    >
                      Miami Pickup Basketball 🏀
                    </a>
                  </li>
                </ul>
              </div>
              <img
                src="/assets/fallback.png"
                alt="Fallback"
                className="footer-logo"
                onError={(e) => (e.currentTarget.src = '/assets/fallback.png')}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}