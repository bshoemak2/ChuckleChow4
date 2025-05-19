import logging
import random
import httpx
import os
from database import get_all_recipes, get_flavor_pairs

# Configure logging
logging.basicConfig(
    filename='recipe_generator.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s - %(pathname)s:%(lineno)d'
)

# xAI API configuration
XAI_API_URL = "https://api.x.ai/v1/chat/completions"
XAI_API_KEY = os.getenv("XAI_API_KEY")

def match_predefined_recipe(ingredients, language='english'):
    try:
        recipes = get_all_recipes()
        if not recipes:
            logging.debug("No recipes found in database")
            return None

        # Score recipes based on exact ingredient matches
        scored_recipes = []
        for recipe in recipes:
            recipe_ingredients = [ing['name'] if isinstance(ing, dict) else ing[0] for ing in recipe['ingredients']]
            matches = len(set(ingredients).intersection(set(recipe_ingredients)))
            scored_recipes.append((recipe, matches))

        if not scored_recipes:
            return None

        best_recipe, best_score = max(scored_recipes, key=lambda x: x[1])
        if best_score < len(ingredients):
            logging.debug(f"No exact predefined recipe match, score {best_score}/{len(ingredients)}")
            return None

        title = best_recipe['title_es'] if language == 'spanish' else best_recipe['title_en']
        # Add emojis to predefined recipe output
        recipe_text = (
            f"### **{title}** 🎉\n\n"
            f"**Ingredients:** 🥗\n" +
            "\n".join(f"- {ing['name']} ({ing['amount']}) {get_ingredient_emoji(ing['name'])}" for ing in best_recipe['ingredients']) + "\n\n"
            f"**Steps:** 🔢\n" +
            "\n".join(f"{i+1}. {step} ✅" for i, step in enumerate(best_recipe['steps'])) + "\n\n"
            f"**Nutrition:** 📊\n- 🔥 Calories: {best_recipe['nutrition']['calories']}\n"
            f"- 💪 Protein: {best_recipe['nutrition']['protein']}g\n"
            f"- 🧈 Fat: {best_recipe['nutrition']['fat']}g\n"
            f"- 😜 Chaos Factor: {best_recipe['nutrition']['chaos_factor']}/10\n\n"
            f"**Equipment Needed:** 🍳\n" + ", ".join(f"{eq} {get_equipment_emoji(eq)}" for eq in best_recipe['equipment']) + "\n\n"
            f"**Cooking Time:** ⏰ {best_recipe['cooking_time']} minutes\n\n"
            f"**Difficulty:** 🎯 {best_recipe['difficulty']}\n\n"
            f"**Servings:** 🍽️ {best_recipe['servings']}\n\n"
            f"**Tips:** 💡\n- {best_recipe['tips']}"
        )
        logging.info(f"Matched predefined recipe: {title}")
        return {"text": recipe_text}
    except Exception as e:
        logging.error(f"Error matching predefined recipe: {str(e)}", exc_info=True)
        return None

def get_ingredient_emoji(ingredient):
    """Return an emoji based on the ingredient type."""
    ingredient = ingredient.lower()
    emoji_map = {
        'tofu': '🥗', 'chicken': '🍗', 'shrimp': '🦐', 'pork': '🥓', 'ground beef': '🍔', 'catfish': '🐟', 'salmon': '🐟',
        'pork ribs': '�' : '🍖', 'black beans': '🥫', 'kidney beans': '🥫', 'bell pepper': '🫑', 'broccoli': '🥦', 'onion': '🧅',
        'garlic': '🧄', 'ginger': '🌱', 'apple': '🍎', 'mango': '🥭', 'lemon': '🍋', 'lime': '🍈', 'avocado': '🥑',
        'tomato': '🍅', 'lettuce': '🥬', 'green onion': '🧅', 'soy sauce': '🥢', 'moonshine': '🥃', 'tequila': '🍹',
        'bbq sauce': '🥄', 'remoulade sauce': '🥄', 'sriracha': '🌶️', 'chili powder': '🌶️', 'paprika': '🌶️',
        'cajun seasoning': '🌶️', 'fajita seasoning': '🌮', 'rosemary': '🌿', 'grits': '🥣', 'rice': '🍚',
        'pasta': '🍝', 'tortilla': '🌮', 'baguette': '🥖', 'cheddar cheese': '🧀', 'butter': '🧈', 'bacon': '🥓'
    }
    return emoji_map.get(ingredient, '🥄')

def get_equipment_emoji(equipment):
    """Return an emoji based on the equipment type."""
    equipment = equipment.lower()
    emoji_map = {
        'wok': '🥘', 'skillet': '🍳', 'roasting pan': '🍲', 'baking sheet': '🥧', 'pot': '🍲', 'spatula': '🥄',
        'toaster': '🍞', 'bowl': '🥣', 'foil': '📜'
    }
    return emoji_map.get(equipment, '🔧')

def generate_dynamic_recipe(ingredients, preferences=None):
    try:
        logging.debug(f"Generating dynamic recipe with ingredients: {ingredients}")
        if not preferences:
            preferences = {'language': 'english'}

        # Try predefined recipe first unless random
        if ingredients and not preferences.get('force_random', False):
            predefined_recipe = match_predefined_recipe(ingredients, preferences.get('language', 'english'))
            if predefined_recipe:
                return predefined_recipe

        # Get flavor pairs for one extra ingredient
        flavor_pairs = get_flavor_pairs()
        extra_ingredient = None
        for ing in ingredients:
            if ing in flavor_pairs and flavor_pairs[ing]:
                extra_ingredient = random.choice(flavor_pairs[ing])
                break

        # Build prompt with emoji instructions
        ingredient_list = ", ".join(ingredients + ([extra_ingredient] if extra_ingredient else [])) if ingredients else "random Southern ingredients"
        prompt = (
            f"Create a Southern-style recipe with a hilarious redneck vibe, using {ingredient_list} as key ingredients. "
            "Include a funny title, ingredients with measurements, detailed steps with Southern swagger, equipment needed, "
            "a quirky 'chaos gear' (e.g., a busted spatula), cooking time, difficulty (easy/medium/hard), servings, "
            "nutrition info (calories, protein, fat, chaos factor 1-10), and a tip that’s useful but ridiculous. "
            "Write it in Markdown, like you’re tellin’ a buddy over a beer. Keep it cookable and fun! "
            "Add emojis to enhance readability: 🥗 for ingredients section, 🥄 or specific emojis (e.g., 🍗 for meats, 🥕 for veggies) after each ingredient, "
            "🔢 for steps section with ✅ after each step, 🍳 for equipment section with specific emojis (e.g., 🍲 for pans, 🔪 for knives), "
            "📊 for nutrition with 🔥 for calories, 💪 for protein, 🧈 for fat, 😜 for chaos factor, ⏰ for cooking time, "
            "🎯 for difficulty, 🍽️ for servings, and 💡 for tips."
        )

        # Call xAI API
        if not XAI_API_KEY:
            logging.error("XAI_API_KEY environment variable not set")
            return {"text": "Failed to generate recipe: API key not configured"}

        headers = {
            "Authorization": f"Bearer {XAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "grok-beta",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 6000,
            "stream": False
        }

        logging.debug(f"Sending xAI API request: {payload}")
        with httpx.Client() as client:
            response = client.post(XAI_API_URL, headers=headers, json=payload, timeout=30.0)
        
        response.raise_for_status()
        api_response = response.json()
        logging.debug(f"xAI API response content: {api_response.get('choices', [{}])[0].get('message', {}).get('content', '')[:100]}...")

        recipe_text = api_response.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not recipe_text:
            logging.error("Empty recipe text from xAI API")
            return {"text": "Failed to generate recipe: Empty response from API"}

        logging.info(f"Generated recipe: {recipe_text[:50]}...")
        return {"text": recipe_text}
    except Exception as e:
        logging.error(f"Error generating dynamic recipe: {str(e)}", exc_info=True)
        return {"text": f"Failed to generate recipe: {str(e)}"}

def generate_random_recipe(language='english'):
    try:
        logging.debug("Generating random recipe")
        # Define Southern-themed ingredients for randomization
        southern_ingredients = [
            'churrasco', 'ground beef', 'chicken', 'pork', 'shrimp', 'catfish', 'green beans', 'okra', 'collards',
            'potato', 'lemon', 'cheese', 'butter', 'grits', 'rice', 'whiskey', 'moonshine', 'beer'
        ]
        num_ingredients = random.randint(3, 6)
        ingredients = random.sample(southern_ingredients, num_ingredients)
        logging.debug(f"Selected random Southern ingredients: {ingredients}")
        return generate_dynamic_recipe(ingredients, {'language': language, 'force_random': True})
    except Exception as e:
        logging.error(f"Error generating random recipe: {str(e)}", exc_info=True)
        return {"text": f"Failed to generate recipe: {str(e)}"}