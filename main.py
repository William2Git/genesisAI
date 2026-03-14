from parser import parse_user_input
from yelp_search import search_restaurants

user_input = input("What food are you looking for? ")

parsed_result = parse_user_input(user_input)

print("Parsed result:")
print(parsed_result)

food = parsed_result["food"]
location = parsed_result["location"] or "Toronto"

restaurants = search_restaurants(food, location)

print("\nTop Restaurant Recommendations:\n")
for r in restaurants:
    print(f"{r['name']} | {r['rating']}⭐")
    print(r["address"])
    print()