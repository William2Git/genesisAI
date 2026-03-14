from openai import OpenAI
import os
import json
import re
import time

# Connect to GPT-OSS
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY", "test"),
    base_url="https://vjioo4r1vyvcozuj.us-east-2.aws.endpoints.huggingface.cloud/v1",
)

def parse_user_input(user_input, max_retries=3, retry_delay=1):
    """
    Flexible AI parser that converts natural language into structured JSON.
    """

    attempt = 0

    while attempt < max_retries:
        attempt += 1

        try:

            response = client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Extract structured information from food related requests. "
                            "Return JSON with keys: food, quantity, budget, location, extra_info. "
                            "If missing, set to null. "
                            "extra_info should contain any additional details like vibe, dietary restrictions, time, delivery, etc. "
                            "Return ONLY valid JSON."
                        ),
                    },
                    {
                        "role": "user",
                        "content": user_input,
                    },
                ],
                max_tokens=300,
            )

            if not response.choices:
                print(f"Attempt {attempt}: No response, retrying...")
                time.sleep(retry_delay)
                continue

            ai_text = response.choices[0].message.content

            if not ai_text:
                print(f"Attempt {attempt}: Empty response, retrying...")
                time.sleep(retry_delay)
                continue

            # Extract JSON
            match = re.search(r"\{.*\}", ai_text, re.DOTALL)

            if not match:
                print(f"Attempt {attempt}: No JSON found, retrying...")
                time.sleep(retry_delay)
                continue

            raw_json = match.group()

            parsed = json.loads(raw_json)

            # Normalize keys
            food = parsed.get("food") or parsed.get("cuisine")
            quantity = parsed.get("quantity") or parsed.get("people")
            budget = parsed.get("budget") or parsed.get("priceRange")
            location = parsed.get("location")

            # Handle extra_info properly
            extra_info = parsed.get("extra_info", {})

            if isinstance(extra_info, dict) and "extra_info" in extra_info:
                extra_info = extra_info["extra_info"]

            return {
                "food": food,
                "quantity": quantity,
                "budget": budget,
                "location": location,
                "extra_info": extra_info,
            }

        except Exception as e:
            print(f"Attempt {attempt}: Error {e}")
            time.sleep(retry_delay)

    print("Failed to parse request")
    return None


# Only run test cases when running parser.py directly
if __name__ == "__main__":
    test_inputs = [
        "I want cheap tacos for 3 people near downtown.",
        "Looking for a fancy sushi dinner for 2 in midtown with moderate price.",
        "Group of 5 wants vegan pizza under $50 in the suburbs.",
        "Affordable burgers for 1 person near the university.",
        "Need gluten-free pasta for 4 friends downtown, budget-friendly.",
        "Any good ramen spots with delivery tonight around 8 PM?",
        "Surprise my friend with a dessert place, maybe something fun or unique.",
    ]

    for text in test_inputs:
        print("\nUser input:", text)
        parsed = parse_user_input(text)
        print("Parsed result:")
        print(json.dumps(parsed, indent=2))