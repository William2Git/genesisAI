import requests
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("YELP_API_KEY")

url = "https://api.yelp.com/v3/businesses/search"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

def convert_price_to_level(price):
    if not price:
        return None

    mapping = {
        "$": 0,
        "$$": 1,
        "$$$": 2,
        "$$$$": 3
    }

    return mapping.get(price)

def search_restaurants(food, location):

    params = {
        "term": food,
        "location": location,
        "categories": "restaurants,food",
        "limit": 10,
        "sort_by": "distance"
    }

    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    restaurants = []

    for r in data.get("businesses", []):
        categories = [c.get("alias", "") for c in r.get("categories", [])]
        print(r["name"], r.get("price"), r.get("distance"))

        if any(cat in ['hotels', 'hotel', 'resorts', 'hostels'] for cat in categories):
            continue

        # Get "open now" status if available
        open_now = None
        if r.get("hours") and len(r["hours"]) > 0:
            open_now = r["hours"][0].get("is_open_now")

        restaurant = {
            "name": r["name"],
            "rating": r.get("rating"),
            "review_count": r.get("review_count"),
            "address": " ".join(r["location"]["display_address"]),
            "latitude": r["coordinates"]["latitude"],
            "longitude": r["coordinates"]["longitude"],
            "image_url": r.get("image_url"),
            "price_level": convert_price_to_level(r.get("price")),
            "is_closed": r.get("is_closed"),
            "open_now": open_now,  # <-- Added this
            "distance": r.get("distance"),
            "categories": [c["title"] for c in r.get("categories", [])]
        }

        restaurants.append(restaurant)

    return restaurants


if __name__ == "__main__":

    results = search_restaurants("ramen", "Toronto")

    for r in results:
        print(r)