import sqlite3
import logging
import os
import json
from datetime import datetime

# Configure logging
logging.basicConfig(
    filename='recipe_generator.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s - %(pathname)s:%(lineno)d'
)

DB_PATH = 'recipes.db'

def get_db_connection():
    """Create and return a database connection."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logging.error(f"Database connection error: {str(e)}")
        raise

def init_db():
    """Initialize the database with recipes and flavor_pairs tables."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Create recipes table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS recipes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title_en TEXT NOT NULL,
                    title_es TEXT,
                    ingredients TEXT NOT NULL,
                    steps TEXT NOT NULL,
                    nutrition TEXT,
                    cooking_time INTEGER,
                    difficulty TEXT,
                    equipment TEXT,
                    servings INTEGER,
                    tips TEXT,
                    rating REAL DEFAULT 0.0,
                    rating_count INTEGER DEFAULT 0
                )
            ''')

            # Create recipe_comments table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS recipe_comments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    recipe_id INTEGER NOT NULL,
                    comment TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
                )
            ''')

            # Create flavor_pairs table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS flavor_pairs (
                    ingredient TEXT PRIMARY KEY,
                    pairs TEXT NOT NULL
                )
            ''')

            # Check if recipes table is empty
            cursor.execute('SELECT COUNT(*) FROM recipes')
            if cursor.fetchone()[0] == 0:
                predefined_recipes = [
                    {
                        'title_en': 'Ginger-Soy Tofu Stir-Fry',
                        'title_es': 'Tofu Salteado con Jengibre y Soja',
                        'ingredients': json.dumps([
                            {"name": "tofu", "amount": "1 lb, cubed"},
                            {"name": "soy sauce", "amount": "1/4 cup"},
                            {"name": "ginger", "amount": "2 tbsp, grated"},
                            {"name": "garlic", "amount": "2 cloves, minced"},
                            {"name": "bell pepper", "amount": "1, sliced"},
                            {"name": "broccoli", "amount": "1 cup, florets"}
                        ]),
                        'steps': json.dumps([
                            "Heat 2 tbsp olive oil in a wok over medium-high heat.",
                            "Add tofu cubes and stir-fry for 5-7 minutes until golden.",
                            "Add ginger, garlic, and soy sauce; stir for 1 minute.",
                            "Toss in bell pepper and broccoli; cook for 5 minutes until crisp-tender.",
                            "Serve over rice with a sprinkle of sesame seeds."
                        ]),
                        'nutrition': json.dumps({"calories": 300, "protein": 20, "fat": 15, "chaos_factor": 5}),
                        'cooking_time': 15,
                        'difficulty': 'easy',
                        'equipment': json.dumps(["wok", "spatula"]),
                        'servings': 4,
                        'tips': 'Press tofu for 20 minutes before cooking to remove excess water.'
                    },
                    {
                        'title_en': 'Moonshine Chicken Skillet',
                        'title_es': 'Pollo a la Sartén con Moonshine',
                        'ingredients': json.dumps([
                            {"name": "chicken", "amount": "1 lb, cut into strips"},
                            {"name": "moonshine", "amount": "1/4 cup"},
                            {"name": "onion", "amount": "1 medium, diced"},
                            {"name": "paprika", "amount": "1 tsp"}
                        ]),
                        'steps': json.dumps([
                            "Heat olive oil in a skillet over medium-high heat.",
                            "Add chicken strips and sear for 8 minutes until golden.",
                            "Splash in moonshine and let it sizzle for 1 minute.",
                            "Add diced onion and paprika; cook for 5 minutes until soft.",
                            "Serve with cornbread for a hearty meal."
                        ]),
                        'nutrition': json.dumps({"calories": 450, "protein": 35, "fat": 20, "chaos_factor": 7}),
                        'cooking_time': 15,
                        'difficulty': 'medium',
                        'equipment': json.dumps(["skillet"]),
                        'servings': 2,
                        'tips': 'Use high-proof moonshine for a bold flavor, but don’t light it on fire!'
                    },
                    {
                        'title_en': 'Shrimp and Grits Hoedown',
                        'title_es': 'Camarones y Sémola al Estilo Sureño',
                        'ingredients': json.dumps([
                            {"name": "shrimp", "amount": "1 lb, peeled"},
                            {"name": "grits", "amount": "1 cup"},
                            {"name": "cheddar cheese", "amount": "1/2 cup, shredded"},
                            {"name": "bacon", "amount": "4 strips, chopped"},
                            {"name": "green onion", "amount": "2, sliced"}
                        ]),
                        'steps': json.dumps([
                            "Cook grits according to package, then stir in cheddar cheese.",
                            "In a skillet, cook bacon until crispy; remove and set aside.",
                            "Sauté shrimp in bacon fat for 3-4 minutes until pink.",
                            "Add green onion and bacon back; stir for 1 minute.",
                            "Serve shrimp over cheesy grits."
                        ]),
                        'nutrition': json.dumps({"calories": 600, "protein": 40, "fat": 30, "chaos_factor": 8}),
                        'cooking_time': 20,
                        'difficulty': 'medium',
                        'equipment': json.dumps(["skillet", "pot"]),
                        'servings': 4,
                        'tips': 'Use stone-ground grits for authentic texture.'
                    },
                    {
                        'title_en': 'Pork and Apple Moonshine Roast',
                        'title_es': 'Asado de Cerdo y Manzana con Moonshine',
                        'ingredients': json.dumps([
                            {"name": "pork loin", "amount": "2 lbs"},
                            {"name": "apple", "amount": "2, sliced"},
                            {"name": "moonshine", "amount": "1/2 cup"},
                            {"name": "rosemary", "amount": "1 tbsp"},
                            {"name": "garlic", "amount": "3 cloves, minced"}
                        ]),
                        'steps': json.dumps([
                            "Preheat oven to 375°F.",
                            "Rub pork loin with garlic, rosemary, salt, and pepper.",
                            "Place apples in a roasting pan, top with pork, and pour moonshine over.",
                            "Roast for 60-75 minutes until internal temp is 145°F.",
                            "Slice and serve with roasted apples."
                        ]),
                        'nutrition': json.dumps({"calories": 500, "protein": 45, "fat": 25, "chaos_factor": 6}),
                        'cooking_time': 75,
                        'difficulty': 'hard',
                        'equipment': json.dumps(["roasting pan"]),
                        'servings': 6,
                        'tips': 'Let pork rest 10 minutes before slicing.'
                    },
                    {
                        'title_en': 'Ground Beef Tequila Tacos',
                        'title_es': 'Tacos de Carne Molida con Tequila',
                        'ingredients': json.dumps([
                            {"name": "ground beef", "amount": "1 lb"},
                            {"name": "tequila", "amount": "1/4 cup"},
                            {"name": "tortilla", "amount": "8, corn"},
                            {"name": "chili powder", "amount": "1 tbsp"},
                            {"name": "avocado", "amount": "1, diced"}
                        ]),
                        'steps': json.dumps([
                            "Brown ground beef in a skillet over medium heat, 7-10 minutes.",
                            "Add chili powder and tequila; cook 2 minutes until evaporated.",
                            "Warm tortillas in a dry skillet.",
                            "Fill tortillas with beef and top with avocado.",
                            "Serve with lime wedges."
                        ]),
                        'nutrition': json.dumps({"calories": 400, "protein": 25, "fat": 20, "chaos_factor": 7}),
                        'cooking_time': 15,
                        'difficulty': 'easy',
                        'equipment': json.dumps(["skillet"]),
                        'servings': 4,
                        'tips': 'Use reposado tequila for a smoother flavor.'
                    },
                    {
                        'title_en': 'Cajun Catfish Po’Boy',
                        'title_es': 'Sándwich Po’Boy de Bagre Cajún',
                        'ingredients': json.dumps([
                            {"name": "catfish fillets", "amount": "1 lb"},
                            {"name": "cajun seasoning", "amount": "2 tbsp"},
                            {"name": "baguette", "amount": "1, cut into 4 pieces"},
                            {"name": "lettuce", "amount": "1 cup, shredded"},
                            {"name": "remoulade sauce", "amount": "1/4 cup"}
                        ]),
                        'steps': json.dumps([
                            "Coat catfish with cajun seasoning.",
                            "Fry catfish in 2 tbsp oil over medium heat, 3-4 minutes per side.",
                            "Toast baguette pieces lightly.",
                            "Spread remoulade on baguette, add lettuce and catfish.",
                            "Serve with pickles on the side."
                        ]),
                        'nutrition': json.dumps({"calories": 550, "protein": 30, "fat": 25, "chaos_factor": 6}),
                        'cooking_time': 20,
                        'difficulty': 'medium',
                        'equipment': json.dumps(["skillet", "toaster"]),
                        'servings': 4,
                        'tips': 'Make your own remoulade with mayo, mustard, and hot sauce.'
                    },
                    {
                        'title_en': 'Spicy Mango Salmon Bowl',
                        'title_es': 'Tazón de Salmón con Mango Picante',
                        'ingredients': json.dumps([
                            {"name": "salmon fillets", "amount": "1 lb"},
                            {"name": "mango", "amount": "1, diced"},
                            {"name": "rice", "amount": "1 cup, cooked"},
                            {"name": "sriracha", "amount": "1 tbsp"},
                            {"name": "lime", "amount": "1, juiced"}
                        ]),
                        'steps': json.dumps([
                            "Bake salmon at 400°F for 12-15 minutes.",
                            "Mix mango, sriracha, and lime juice for a salsa.",
                            "Flake salmon over cooked rice.",
                            "Top with mango salsa.",
                            "Garnish with cilantro."
                        ]),
                        'nutrition': json.dumps({"calories": 450, "protein": 35, "fat": 15, "chaos_factor": 5}),
                        'cooking_time': 25,
                        'difficulty': 'easy',
                        'equipment': json.dumps(["baking sheet", "bowl"]),
                        'servings': 4,
                        'tips': 'Use fresh mango for the best flavor.'
                    },
                    {
                        'title_en': 'BBQ Pork Ribs',
                        'title_es': 'Costillas de Cerdo a la Barbacoa',
                        'ingredients': json.dumps([
                            {"name": "pork ribs", "amount": "2 lbs"},
                            {"name": "bbq sauce", "amount": "1 cup"},
                            {"name": "brown sugar", "amount": "2 tbsp"},
                            {"name": "garlic powder", "amount": "1 tsp"},
                            {"name": "onion powder", "amount": "1 tsp"}
                        ]),
                        'steps': json.dumps([
                            "Preheat oven to 300°F.",
                            "Rub ribs with brown sugar, garlic powder, and onion powder.",
                            "Wrap ribs in foil and bake for 2.5 hours.",
                            "Unwrap, brush with BBQ sauce, and broil for 5 minutes.",
                            "Serve with coleslaw."
                        ]),
                        'nutrition': json.dumps({"calories": 700, "protein": 40, "fat": 45, "chaos_factor": 8}),
                        'cooking_time': 160,
                        'difficulty': 'hard',
                        'equipment': json.dumps(["baking sheet", "foil"]),
                        'servings': 4,
                        'tips': 'Low and slow cooking makes ribs tender.'
                    },
                    {
                        'title_en': 'Lemon Garlic Butter Shrimp Pasta',
                        'title_es': 'Pasta con Camarones al Limón y Ajo',
                        'ingredients': json.dumps([
                            {"name": "shrimp", "amount": "1 lb, peeled"},
                            {"name": "pasta", "amount": "8 oz"},
                            {"name": "butter", "amount": "4 tbsp"},
                            {"name": "garlic", "amount": "3 cloves, minced"},
                            {"name": "lemon", "amount": "1, juiced and zested"}
                        ]),
                        'steps': json.dumps([
                            "Cook pasta according to package; drain and set aside.",
                            "Melt butter in a skillet over medium heat.",
                            "Add garlic and sauté for 1 minute.",
                            "Add shrimp and cook for 3-4 minutes until pink.",
                            "Toss in pasta, lemon juice, and zest; stir to combine.",
                            "Serve with parsley."
                        ]),
                        'nutrition': json.dumps({"calories": 500, "protein": 30, "fat": 20, "chaos_factor": 6}),
                        'cooking_time': 20,
                        'difficulty': 'easy',
                        'equipment': json.dumps(["skillet", "pot"]),
                        'servings': 4,
                        'tips': 'Use fresh lemon for a bright flavor.'
                    },
                    {
                        'title_en': 'Vegetarian Chili',
                        'title_es': 'Chili Vegetariano',
                        'ingredients': json.dumps([
                            {"name": "black beans", "amount": "1 can, drained"},
                            {"name": "kidney beans", "amount": "1 can, drained"},
                            {"name": "tomato", "amount": "1 can, diced"},
                            {"name": "onion", "amount": "1, diced"},
                            {"name": "chili powder", "amount": "2 tbsp"}
                        ]),
                        'steps': json.dumps([
                            "Sauté onion in 1 tbsp oil over medium heat for 5 minutes.",
                            "Add chili powder and stir for 1 minute.",
                            "Add beans and tomatoes; bring to a simmer.",
                            "Cook for 20 minutes, stirring occasionally.",
                            "Serve with cornbread or rice."
                        ]),
                        'nutrition': json.dumps({"calories": 350, "protein": 15, "fat": 5, "chaos_factor": 5}),
                        'cooking_time': 30,
                        'difficulty': 'easy',
                        'equipment': json.dumps(["pot"]),
                        'servings': 4,
                        'tips': 'Add a dash of cumin for extra depth.'
                    },
                    {
                        'title_en': 'Chicken Fajita Bowl',
                        'title_es': 'Tazón de Fajitas de Pollo',
                        'ingredients': json.dumps([
                            {"name": "chicken", "amount": "1 lb, sliced"},
                            {"name": "bell pepper", "amount": "2, sliced"},
                            {"name": "onion", "amount": "1, sliced"},
                            {"name": "fajita seasoning", "amount": "2 tbsp"},
                            {"name": "rice", "amount": "1 cup, cooked"}
                        ]),
                        'steps': json.dumps([
                            "Heat 2 tbsp oil in a skillet over medium-high heat.",
                            "Add chicken and fajita seasoning; cook for 6-8 minutes.",
                            "Add peppers and onion; cook for 5 minutes until tender.",
                            "Serve over rice with salsa and avocado."
                        ]),
                        'nutrition': json.dumps({"calories": 450, "protein": 35, "fat": 15, "chaos_factor": 6}),
                        'cooking_time': 20,
                        'difficulty': 'medium',
                        'equipment': json.dumps(["skillet"]),
                        'servings': 4,
                        'tips': 'Marinate chicken in lime juice for 30 minutes for extra flavor.'
                    }
                ]

                for recipe in predefined_recipes:
                    cursor.execute('''
                        INSERT INTO recipes (title_en, title_es, ingredients, steps, nutrition, cooking_time, difficulty, equipment, servings, tips)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        recipe['title_en'],
                        recipe['title_es'],
                        recipe['ingredients'],
                        recipe['steps'],
                        recipe['nutrition'],
                        recipe['cooking_time'],
                        recipe['difficulty'],
                        recipe['equipment'],
                        recipe['servings'],
                        recipe['tips']
                    ))

                # Insert flavor pairs
                flavor_pairs = [
                    ('tofu', '["soy sauce","ginger","garlic"]'),
                    ('chicken', '["paprika","onion","moonshine","fajita seasoning"]'),
                    ('shrimp', '["bacon","cheddar cheese","green onion","lemon"]'),
                    ('pork', '["apple","rosemary","moonshine","bbq sauce"]'),
                    ('ground beef', '["tequila","chili powder","avocado"]'),
                    ('catfish', '["cajun seasoning","lettuce","remoulade sauce"]'),
                    ('salmon', '["mango","sriracha","lime"]'),
                    ('pork ribs', '["bbq sauce","brown sugar","garlic powder"]'),
                    ('black beans', '["chili powder","tomato","onion"]')
                ]

                cursor.executemany('INSERT INTO flavor_pairs (ingredient, pairs) VALUES (?, ?)', flavor_pairs)

                conn.commit()
                logging.info(f"Inserted {len(predefined_recipes)} recipes into the database")

        logging.info("Database initialized successfully")
    except sqlite3.Error as e:
        logging.error(f"Database initialization error: {str(e)}")
        raise

def get_all_recipes():
    """Fetch all recipes from the database."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM recipes')
            recipes = [dict(row) for row in cursor.fetchall()]
            valid_recipes = []
            for recipe in recipes:
                try:
                    # Validate JSON fields
                    recipe['ingredients'] = json.loads(recipe['ingredients']) if isinstance(recipe['ingredients'], str) else recipe['ingredients']
                    recipe['steps'] = json.loads(recipe['steps']) if isinstance(recipe['steps'], str) else recipe['steps']
                    recipe['nutrition'] = json.loads(recipe['nutrition']) if isinstance(recipe['nutrition'], str) else recipe['nutrition']
                    recipe['equipment'] = json.loads(recipe['equipment']) if isinstance(recipe['equipment'], str) else recipe['equipment']
                    valid_recipes.append(recipe)
                except json.JSONDecodeError as e:
                    logging.warning(f"Skipping invalid recipe data for id {recipe['id']}: {str(e)}")
                    continue
            logging.debug(f"Fetched {len(valid_recipes)} valid recipes from database")
            return valid_recipes
    except sqlite3.Error as e:
        logging.error(f"Error fetching recipes: {str(e)}")
        return []

def get_flavor_pairs():
    """Fetch all flavor pairs from the database."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT ingredient, pairs FROM flavor_pairs')
            pairs = {row['ingredient']: json.loads(row['pairs']) for row in cursor.fetchall()}
            logging.debug(f"Fetched {len(pairs)} flavor pairs from database")
            return pairs
    except sqlite3.Error as e:
        logging.error(f"Error fetching flavor pairs: {str(e)}")
        return {}

def update_recipe_rating(recipe_id, rating, comment):
    """Update the rating and add a comment for a recipe."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get current rating and count
            cursor.execute('SELECT rating, rating_count FROM recipes WHERE id = ?', (recipe_id,))
            result = cursor.fetchone()
            if not result:
                raise ValueError(f"Recipe with id {recipe_id} not found")
            
            current_rating, rating_count = result['rating'], result['rating_count']
            
            # Calculate new rating
            new_count = rating_count + 1
            new_rating = ((current_rating * rating_count) + rating) / new_count
            
            # Update recipe rating
            cursor.execute('''
                UPDATE recipes
                SET rating = ?, rating_count = ?
                WHERE id = ?
            ''', (new_rating, new_count, recipe_id))
            
            # Insert comment if provided
            if comment:
                cursor.execute('''
                    INSERT INTO recipe_comments (recipe_id, comment)
                    VALUES (?, ?)
                ''', (recipe_id, comment))
            
            conn.commit()
            logging.info(f"Updated rating for recipe {recipe_id}: new_average={new_rating}, new_count={new_count}, comment={comment}")
    except sqlite3.Error as e:
        logging.error(f"Error updating recipe rating: {str(e)}")
        raise
    except ValueError as e:
        logging.error(f"Invalid recipe ID: {str(e)}")
        raise

def get_recipe_comments(recipe_id):
    """Fetch all comments for a specific recipe."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT comment, created_at FROM recipe_comments WHERE recipe_id = ?', (recipe_id,))
            comments = [{'comment': row['comment'], 'created_at': row['created_at']} for row in cursor.fetchall()]
            logging.debug(f"Fetched {len(comments)} comments for recipe_id {recipe_id}")
            return comments
    except sqlite3.Error as e:
        logging.error(f"Error fetching recipe comments: {str(e)}")
        return []