from flask import Flask, request, jsonify
from flask_cors import CORS
from parser import parse_user_input
from yelp_search import search_restaurants

import traceback

app = Flask(__name__)
CORS(app)

DEFAULT_LOCATION = "Toronto"


@app.route("/api/search", methods=["POST"])
def search():
    """Accept food/craving text from the frontend; parse it and return Yelp restaurant results."""
    data = request.get_json() or {}
    user_input = (data.get("query") or "").strip()

    if not user_input:
        return jsonify({"error": "Query is required", "restaurants": []}), 400

    parsed = parse_user_input(user_input)
    if not parsed:
        return jsonify({"error": "Could not parse your request", "restaurants": []}), 422

    food = parsed.get("food")
    location = parsed.get("location") or DEFAULT_LOCATION

    if not food:
        return jsonify({"error": "Could not determine what food you want", "restaurants": []}), 422

    try:
        restaurants = search_restaurants(food, location)
        return jsonify({"restaurants": restaurants, "location": location})
        #delete below


    except Exception as e:
        #delete below
        traceback.print_exc()
        return jsonify({"error": str(e), "restaurants": []}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
