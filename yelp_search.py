import requests
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("YELP_API_KEY")

url = "https://api.yelp.com/v3/businesses/search"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

def search_restaurants(food, location):

    params = {
        "term": food,
        "location": location,
        "categories": "restaurants,food",
        "limit": 10
    }

    response = requests.get(url, headers=headers, params=params)

    data = response.json()

    restaurants = []

    for r in data.get("businesses", []):
        categories = [c.get("alias", "") for c in r.get("categories", [])]
        if any(cat in ['hotels', 'hotel', 'resorts', 'hostels'] for cat in categories):
            continue

        restaurant = {
            "name": r["name"],
            "rating": r["rating"],
            "address": " ".join(r["location"]["display_address"]),
            "latitude": r["coordinates"]["latitude"],
            "longitude": r["coordinates"]["longitude"]
        }

        restaurants.append(restaurant)

    return restaurants


if __name__ == "__main__":

    results = search_restaurants("ramen", "Toronto")

    for r in results:
        print(r)