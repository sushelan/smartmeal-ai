from flask import Flask, request, jsonify
from flask_cors import CORS

from meal_gen import generate_meal  # Importing the meal generation logic

app = Flask(__name__)
# allow cookies/sessions too
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000"],
    resources={r"/*": {"origins": "http://localhost:3000"}}
)

@app.route('/generate-meal-plan', methods=['POST'])
def generate_meal_plan():
    data = request.get_json()
    preferences = data.get('preferences', {})
    query = data.get('query', '')
    dishes = generate_meal(preferences, query)
    if dishes is None:
        return jsonify({"error": "Failed to generate meal"}), 500
    return jsonify(dishes)

if __name__ == '__main__':
    app.run(debug=True, port=5002)
