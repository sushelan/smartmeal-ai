"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Search by keyword
  async function fetchRecipes(query = "") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
          query
        )}`
      );
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setRecipes(data.meals || []);
    } catch (err) {
      console.error("Failed to fetch recipes", err);
      setError("Failed to load recipes. Please try again later.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }

  // Suggestions based on logged ingredients
  async function fetchByIngredients() {
    setLoading(true);
    setError(null);
    try {
      const saved = localStorage.getItem("ingredients");
      const ingredients = saved ? JSON.parse(saved) : [];

      if (!ingredients.length) {
        setError("No ingredients found. Please log your ingredients.");
        setRecipes([]);
        return;
      }

      const lists = await Promise.all(
        ingredients.map((ing) =>
          fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
              ing.trim()
            )}`
          )
            .then((r) => {
              if (!r.ok) throw new Error(`Failed fetch for ${ing}`);
              return r.json();
            })
            .then((data) => data.meals || [])
        )
      );

      let intersection = lists[0];
      for (let i = 1; i < lists.length; i++) {
        const ids = new Set(lists[i].map((m) => m.idMeal));
        intersection = intersection.filter((m) => ids.has(m.idMeal));
      }

      if (!intersection.length) {
        setError("No recipes found for the given ingredients.");
        setRecipes([]);
      } else {
        setRecipes(intersection);
      }
    } catch (err) {
      console.error("Failed to fetch recipes", err);
      setError("Failed to load recipes. Please try again later.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }

  // On mount, load suggestions
  useEffect(() => {
    fetchByIngredients();
  }, []);

  // Handle search submissions
  function handleSearch(e) {
    e.preventDefault();
    fetchRecipes(searchTerm);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
        <h1 className="text-2xl font-bold text-blue-700">
          Loading recipes...
        </h1>
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
      <h2 className="text-3xl font-bold text-blue-700 text-center mt-8 mb-4">
        Browse Recipes
      </h2>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search for a recipe..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 rounded-l-md w-64 border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-3 bg-blue-500 text-white font-semibold rounded-r-md hover:bg-blue-600 transition"
        >
          Search
        </button>
      </form>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <Link
              key={recipe.idMeal}
              href={`/recipe/${recipe.idMeal}`}
              className="block hover:scale-105 transition-transform"
            >
              <div className="bg-white bg-opacity-70 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
                <img
                  src={recipe.strMealThumb}
                  alt={recipe.strMeal}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-blue-700">
                    {recipe.strMeal}
                  </h3>
                  {recipe.strArea && recipe.strCategory && (
                    <p className="text-gray-600">
                      {recipe.strArea} - {recipe.strCategory}
                    </p>
                  )}
                  {recipe.strInstructions && (
                    <p className="text-gray-500 mt-2 line-clamp-3">
                      {recipe.strInstructions}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full">
            No recipes found.
          </p>
        )}
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
