import random
import logging
from constants import INGREDIENT_CATEGORIES

# Configure logging
logging.basicConfig(
    filename='recipe_generator.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s - %(pathname)s:%(lineno)d'
)

def validate_input(ingredients):
    """Validate input ingredients against known categories."""
    valid_ingredients = []
    all_valid_ingredients = {item['name'] for items in INGREDIENT_CATEGORIES.values() for item in items}
    for ing in ingredients:
        if ing in all_valid_ingredients:
            valid_ingredients.append(ing)
    return valid_ingredients

def calculate_nutrition(ingredients):
    """Calculate approximate nutrition based on ingredients."""
    nutrition = {"calories": 0, "protein": 0, "fat": 0, "chaos_factor": len(ingredients)}
    nutrition_data = {
        "meat": {"calories": 250, "protein": 25, "fat": 15},
        "vegetables": {"calories": 50, "protein": 2, "fat": 0},
        "fruits": {"calories": 60, "protein": 1, "fat": 0},
        "seafood": {"calories": 200, "protein": 20, "fat": 10},
        "dairy": {"calories": 100, "protein": 5, "fat": 8},
        "bread_carbs": {"calories": 150, "protein": 5, "fat": 2},
        "devil_water": {"calories": 80, "protein": 0, "fat": 0}
    }
    for ing in ingredients:
        for cat, items in INGREDIENT_CATEGORIES.items():
            if ing in [item['name'] for item in items]:
                data = nutrition_data.get(cat, {"calories": 100, "protein": 5, "fat": 5})
                nutrition["calories"] += data["calories"]
                nutrition["protein"] += data["protein"]
                nutrition["fat"] += data["fat"]
                break
    nutrition["calories"] = max(100, nutrition["calories"])
    return nutrition

def generate_share_text(title, ingredients, steps, nutrition):
    """Generate a shareable text string for the recipe."""
    try:
        ingredients_text = ", ".join([ing if isinstance(ing, str) else f"{ing[0]} ({ing[1]})" for ing in ingredients])
        steps_text = "; ".join([f"Step {i+1}: {step}" for i, step in enumerate(steps)])
        nutrition_text = f"Calories: {nutrition.get('calories', 0)}, Protein: {nutrition.get('protein', 0)}g, Fat: {nutrition.get('fat', 0)}g, Chaos Factor: {nutrition.get('chaos_factor', 0)}/10"
        share_text = f"Check out my *Chuckle & Chow* recipe: {title}!\n\nIngredients: {ingredients_text}\n\nInstructions: {steps_text}\n\nNutrition: {nutrition_text}\n\nTry it at https://chuckle-chow-backend.onrender.com!"
        logging.debug(f"Generated share text: {share_text[:100]}...")
        return share_text
    except Exception as e:
        logging.error(f"Error generating share text: {str(e)}")
        return "Failed to generate share text. Try again!"