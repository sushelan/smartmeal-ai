# ai-service/app.py
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/generate-meal-plan', methods=['POST'])
def generate_meal_plan():
    data = request.get_json()
    # Here you would add your AI logic to generate a meal plan
    # For now, we return a sample response.
    meal_plan = {
        "message": "Sample meal plan generated",
        "input": data
    }
    return jsonify(meal_plan)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
