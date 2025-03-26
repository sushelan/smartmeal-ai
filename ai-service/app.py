from flask import Flask, request, jsonify
from meal_gen import generate_meal  # Importing the meal generation logic

app = Flask(__name__)

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
    app.run(debug=True, port=5001)
