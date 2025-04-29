"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function RecipeBrowsingPage() {
  const [mode, setMode] = useState("suggestions");
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    } catch {
      setError("Failed to load search results.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchByIngredients() {
    setLoading(true);
    setError(null);
    try {
      const saved = localStorage.getItem("ingredients");
      const ingredients = saved ? JSON.parse(saved) : [];
      if (!ingredients.length) {
        setError("No ingredients logged. Please add some first.");
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
            .then((r) => r.json())
            .then((d) => d.meals || [])
        )
      );
      let intersection = lists[0];
      for (let i = 1; i < lists.length; i++) {
        const ids = new Set(lists[i].map((m) => m.idMeal));
        intersection = intersection.filter((m) => ids.has(m.idMeal));
      }
      if (!intersection.length) {
        setError("No recipes match your ingredients.");
        setRecipes([]);
      } else {
        setRecipes(intersection);
      }
    } catch {
      setError("Failed to load suggestions.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mode === "suggestions") {
      fetchByIngredients();
    } else {
      setRecipes([]);
      setError(null);
      setLoading(false);
    }
  }, [mode]);

  function handleSearch(e) {
    e.preventDefault();
    fetchRecipes(searchTerm);
  }

  // cover whole screen now
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
      <h2 className="text-3xl font-bold text-blue-700 text-center mb-6">
        Browse Recipes
      </h2>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setMode("suggestions")}
          className={`px-4 py-2 rounded ${
            mode === "suggestions"
              ? "bg-blue-600 text-white"
              : "bg-white"
          }`}
        >
          Suggestions
        </button>
        <button
          onClick={() => setMode("search")}
          className={`px-4 py-2 rounded ${
            mode === "search" ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          Search
        </button>
      </div>

      {mode === "search" && (
        <form onSubmit={handleSearch} className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 rounded-l-md border border-blue-300 w-64 bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-blue-500 text-white rounded-r-md"
          >
            Search
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-center">Loading…</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recipes.length > 0 ? (
            recipes.map((r) => (
              <Link key={r.idMeal} href={`/recipe/${r.idMeal}`}>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <img
                    src={r.strMealThumb}
                    alt={r.strMeal}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800">
                      {r.strMeal}
                    </h3>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-600">
              No recipes found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
