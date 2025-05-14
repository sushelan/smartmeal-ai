import os
import json
import logging
from dotenv import load_dotenv
from openai import OpenAI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

def generate_meal(preferences, query):
    prompt = f"""
You are a creative chef and food recommendation assistant.
Given the following user preferences:
- Favorite Cuisines: {', '.join(preferences.get("favorite_cuisines", []))}
- Liked Dishes: {', '.join(preferences.get("liked_dishes", []))} 
- Disliked Dishes: {', '.join(preferences.get("disliked_dishes", []))}
- Dietary Restrictions: {', '.join(preferences.get("dietary_restrictions", []))}

Please generate exactly a JSON array (no additional text) of 1 candidate dish that the user might enjoy.
Each dish should be a JSON object with the following keys:
    "name" (string),
    "cuisine" (string),
    "ingredients" (array of strings),
    "description" (string).

For example:
[
  {{
    "name": "Chicken Quesadillas",
    "cuisine": "Mexican",
    "ingredients": ["tortillas", "chicken", "cheese", "salsa"],
    "description": "A classic Mexican dish with a spicy kick."
  }}
]

Now, based on the query: "{query}", generate the JSON array.
Make sure the dish shares the same style but uses at least two ingredients not listed in the query, and does not repeat every single ingredient exactly.
"""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # or use another available model like "gpt-4o"
            messages=[
                {
                    "role": "system",
                    "content": "You are a creative chef who outputs recommendations in JSON format. Do not include any extra explanation."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.9,
            max_tokens=500
        )
        output = response.choices[0].message.content.strip()
        logger.info("Raw LLM output: " + output)
        try:
            dishes_data = json.loads(output)
            return dishes_data
        except Exception as parse_error:
            logger.error("JSON parsing error: " + str(parse_error))
            return None
    except Exception as e:
        logger.error("Error generating dishes: " + str(e))
        return None