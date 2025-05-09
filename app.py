import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
from dotenv import load_dotenv
try:
    from recipe_generator import generate_dynamic_recipe, generate_random_recipe
    from database import get_all_recipes, get_flavor_pairs, update_recipe_rating, get_recipe_comments
except ImportError as e:
    logging.error(f"Missing dependency during import: {str(e)}")
    raise

# Configure logging to console for Render
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s - %(pathname)s:%(lineno)d'
)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__, static_folder='rg_new_app/dist', static_url_path='/')
CORS(app, resources={
    r"/generate_recipe": {
        "origins": ["http://localhost:5000", "https://chuckle-chow-backend.onrender.com", "https://chuckle-chow-frontend.onrender.com"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Origin"]
    },
    r"/elucidate_recipe": {
        "origins": ["http://localhost:5000", "https://chuckle-chow-backend.onrender.com", "https://chuckle-chow-frontend.onrender.com"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Origin"]
    },
    r"/ingredients": {
        "origins": ["http://localhost:5000", "https://chuckle-chow-backend.onrender.com", "https://chuckle-chow-frontend.onrender.com"],
        "methods": ["GET", "OPTIONS"],
        "allow_headers": ["Content-Type", "Origin"]
    },
    r"/api": {
        "origins": ["http://localhost:5000", "https://chuckle-chow-backend.onrender.com", "https://chuckle-chow-frontend.onrender.com"],
        "methods": ["GET"],
        "allow_headers": ["Content-Type", "Origin"]
    },
    r"/rate_recipe": {
        "origins": ["http://localhost:5000", "https://chuckle-chow-backend.onrender.com", "https://chuckle-chow-frontend.onrender.com"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Origin"]
    },
    r"/recipe_comments": {
        "origins": ["http://localhost:5000", "https://chuckle-chow-backend.onrender.com", "https://chuckle-chow-frontend.onrender.com"],
        "methods": ["GET", "OPTIONS"],
        "allow_headers": ["Content-Type", "Origin"]
    }
}, supports_credentials=True)
logger.info("CORS initialized successfully")

# Configure rate limiting
try:
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://"
    )
    logger.info("Rate limiter initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize rate limiter: {str(e)}")
    raise

# Serve static files
@app.route('/assets/<path:path>')
def serve_static(path):
    logger.debug(f"Serving static file: assets/{path}")
    try:
        return send_from_directory(app.static_folder + '/assets', path)
    except Exception as e:
        logger.error(f"Error serving static file assets/{path}: {str(e)}")
        return jsonify({"error": "File not found"}), 404

# Serve favicon.ico
@app.route('/favicon.ico')
def serve_favicon():
    logger.debug("Serving favicon.ico")
    try:
        return send_from_directory(app.static_folder, 'favicon.ico')
    except Exception as e:
        logger.error(f"Error serving favicon.ico: {str(e)}")
        return jsonify({"error": "Favicon not found"}), 404

# Serve index.html for all non-API routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    logger.debug(f"Serving frontend for path: {path}")
    try:
        if path.startswith(('generate_recipe', 'ingredients', 'elucidate_recipe', 'rate_recipe', 'recipe_comments', 'api', 'assets', 'favicon.ico')):
            logger.debug(f"Path {path} is an API or static route, passing to Flask")
            return app.handle_http_exception(404)
        return send_from_directory(app.static_folder, 'index.html')
    except Exception as e:
        logger.error(f"Error serving frontend for path {path}: {str(e)}")
        return jsonify({"error": "Failed to serve frontend"}), 500

@app.route('/api', methods=['GET'])
def api():
    logger.debug("Serving /api endpoint")
    return jsonify({"message": "Welcome to the Chuckle & Chow API"})

@app.route('/ingredients', methods=['GET'])
@limiter.limit("100 per minute")
def ingredients():
    logger.debug("Serving /ingredients endpoint")
    try:
        flavor_pairs = get_flavor_pairs()
        logger.debug(f"Returning flavor pairs: {flavor_pairs}")
        return jsonify(flavor_pairs)
    except Exception as e:
        logger.error(f"Error in ingredients endpoint: {str(e)}", exc_info=True)
        return jsonify({"error": f"Failed to fetch ingredients: {str(e)}"}), 500

@app.route('/generate_recipe', methods=['POST'])
@limiter.limit("100 per minute")
def generate_recipe():
    logger.debug("Serving /generate_recipe endpoint")
    try:
        raw_data = request.get_data(as_text=True)
        logger.debug(f"Raw request data: {raw_data}")

        try:
            data = request.get_json(force=True)
        except Exception as e:
            logger.error(f"Failed to parse JSON: {str(e)}, raw data: {raw_data}")
            return jsonify({"text": f"Server error: Invalid JSON format - {str(e)}"}), 400

        if not data:
            logger.error("No JSON data provided")
            return jsonify({"text": "Server error: No JSON data provided in request body"}), 400

        ingredients = data.get('ingredients', [])
        is_random = data.get('isRandom', False)
        request_id = data.get('requestId', '')

        logger.debug(f"Received generate_recipe request: ingredients={ingredients}, isRandom={is_random}, requestId={request_id}")

        if not isinstance(ingredients, list):
            logger.error(f"Invalid ingredients format: {ingredients}")
            return jsonify({"text": "Server error: Ingredients must be a list of strings"}), 400

        recipe = generate_random_recipe() if is_random else generate_dynamic_recipe(ingredients)
        
        if not recipe or 'text' not in recipe:
            logger.error(f"Failed to generate recipe: {recipe}")
            return jsonify({"text": f"Server error: Failed to generate recipe - {recipe}"}), 500

        logger.info(f"Generated recipe: {recipe['text'][:50]}...")
        response = jsonify(recipe)
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        return response
    except Exception as e:
        logger.error(f"Error in generate_recipe: {str(e)}", exc_info=True)
        return jsonify({"text": f"Server error: {str(e)}"}), 500

@app.route('/elucidate_recipe', methods=['POST'])
@limiter.limit("100 per minute")
def elucidate_recipe():
    logger.debug("Serving /elucidate_recipe endpoint")
    try:
        raw_data = request.get_data(as_text=True)
        logger.debug(f"Raw request data: {raw_data}")

        try:
            data = request.get_json(force=True)
        except Exception as e:
            logger.error(f"Failed to parse JSON: {str(e)}, raw data: {raw_data}")
            return jsonify({"text": f"Server error: Invalid JSON format - {str(e)}"}), 400

        if not data or 'recipeText' not in data:
            logger.error("Missing recipeText in elucidate_recipe request")
            return jsonify({"text": "Server error: Missing recipeText in request body"}), 400

        recipe_text = data['recipeText']
        logger.debug(f"Elucidating recipe: {recipe_text[:100]}...")

        recipe = generate_dynamic_recipe([], {'recipe_text': recipe_text})
        if not recipe or 'text' not in recipe:
            logger.error(f"Failed to elucidate recipe: {recipe}")
            return jsonify({"text": "Server error: Failed to elucidate recipe"}), 500

        logger.info(f"Elucidated recipe: {recipe['text'][:50]}...")
        response = jsonify(recipe)
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        return response
    except Exception as e:
        logger.error(f"Error in elucidate_recipe: {str(e)}", exc_info=True)
        return jsonify({"text": f"Server error: {str(e)}"}), 500

@app.route('/rate_recipe', methods=['POST'])
@limiter.limit("50 per minute")
def rate_recipe():
    logger.debug("Serving /rate_recipe endpoint")
    try:
        raw_data = request.get_data(as_text=True)
        logger.debug(f"Raw request data: {raw_data}")

        try:
            data = request.get_json(force=True)
        except Exception as e:
            logger.error(f"Failed to parse JSON: {str(e)}, raw data: {raw_data}")
            return jsonify({"text": f"Server error: Invalid JSON format - {str(e)}"}), 400

        if not data or 'recipe_id' not in data or 'rating' not in data:
            logger.error("Missing required fields in rate_recipe request")
            return jsonify({"text": "Server error: Missing recipe_id or rating in request body"}), 400

        recipe_id = data['recipe_id']
        rating = data['rating']
        comment = data.get('comment', '')

        if not isinstance(rating, int) or rating < 1 or rating > 5:
            logger.error(f"Invalid rating value: {rating}")
            return jsonify({"text": "Server error: Rating must be an integer between 1 and 5"}), 400

        update_recipe_rating(recipe_id, rating, comment)
        logger.info(f"Recipe rated: recipe_id={recipe_id}, rating={rating}")
        response = jsonify({"message": "Rating submitted successfully"})
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        return response
    except Exception as e:
        logger.error(f"Error in rate_recipe: {str(e)}", exc_info=True)
        return jsonify({"text": f"Server error: {str(e)}"}), 500

@app.route('/recipe_comments', methods=['GET'])
@limiter.limit("100 per minute")
def recipe_comments():
    logger.debug("Serving /recipe_comments endpoint")
    try:
        recipe_id = request.args.get('recipe_id')
        if not recipe_id:
            logger.error("Missing recipe_id in recipe_comments request")
            return jsonify({"text": "Server error: Missing recipe_id query parameter"}), 400

        comments = get_recipe_comments(recipe_id)
        logger.debug(f"Returning comments for recipe_id {recipe_id}: {comments}")
        response = jsonify(comments)
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        return response
    except Exception as e:
        logger.error(f"Error in recipe_comments: {str(e)}", exc_info=True)
        return jsonify({"text": f"Server error: {str(e)}"}), 500

if __name__ == '__main__':
    try:
        port = int(os.environ.get('PORT', 5000))
        logger.info(f"Starting Flask server on port {port}")
        app.run(host='0.0.0.0', port=port, debug=True)
    except Exception as e:
        logger.error(f"Failed to start Flask server: {str(e)}")
        raise