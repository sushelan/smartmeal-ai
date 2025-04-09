"use client";

import { useState, useEffect } from "react";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        // Retrieve ingredients from localStorage.
        const saved = localStorage.getItem("ingredients");
        const ingredients = saved ? JSON.parse(saved) : [];

        if (ingredients.length === 0) {
          setError("No ingredients found. Please log your ingredients.");
          setLoading(false);
          return;
        }

        // Build a query string for the filter endpoint.
        const query = ingredients.join(",");
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${query}`);
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await res.json();

        // Fix: Check if meals were found.
        if (!data.meals) {
          setError("No recipes found for the given ingredients.");
          setRecipes([]);
        } else {
          setRecipes(data.meals);
        }
      } catch (err) {
        console.error("Failed to fetch recipes", err);
        setError("Failed to load recipes. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
        <h1 className="text-2xl font-bold text-blue-700">Loading recipes...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
        <h1 className="text-2xl font-bold text-red-500">{error}</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 p-8">
      {/* Navigation Bar */}
      <nav className="relative z-10 bg-white bg-opacity-70 backdrop-blur-md shadow py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-md shadow-md flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-700">SmartMeal</h1>
        </div>
      </nav>

      {/* Page Title */}
      <h2 className="text-3xl font-bold text-blue-700 text-center mt-8 mb-4">Browse Recipes</h2>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div
            key={recipe.idMeal}
            className="bg-white bg-opacity-70 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden"
          >
            <img
              src={recipe.strMealThumb}
              alt={recipe.strMeal}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-blue-700">{recipe.strMeal}</h3>
              {/* For the filter endpoint, limited details are returned.
                  Consider a secondary lookup using recipe.idMeal if needed. */}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-white bg-opacity-50 backdrop-blur py-4 shadow-inner mt-12">
        <div className="flex justify-center gap-6 text-sm">
          <a href="#" className="text-gray-600 hover:text-blue-500">
            Terms of Service
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-500">
            Privacy Policy
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-500">
            Contact Us
          </a>
        </div>
      </footer>
    </div>
  );
}
