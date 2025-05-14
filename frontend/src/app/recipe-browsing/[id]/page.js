"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function RecipeDetail() {
  const AI_URL = "http://localhost:5002";
  const BACKEND_URL = "http://localhost:5001"
  const router = useRouter();
  const path = usePathname(); // e.g. "/recipe-browsing/52772"
  const id = path.split("/").pop();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const res = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        );
        if (!res.ok) throw new Error("Recipe not found");
        const data = await res.json();
        setRecipe(data.meals[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipe();
  }, [id]);

  function getIngredients(r) {
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const ingr = r[`strIngredient${i}`];
      const measure = r[`strMeasure${i}`];
      if (ingr && ingr.trim()) list.push(`${measure?.trim() || ""} ${ingr.trim()}`);
    }
    return list;
  }

  async function handleGenerate() {
    console.log("🔍 handleGenerate() invoked, AI_URL =", AI_URL);
    setGenerating(true);
    try {
      console.log("📤 Sending POST to", `${AI_URL}/generate-meal-plan`);
      // 1) load user's saved ingredients
      /*
      const favRes = await fetch(
        `${BACKEND_URL}/api/favorites/ingredients`,
        {
          method: "GET",
          mode: "cors",
          credentials: "include"
        }
      );
      if (!favRes.ok) {
        const body = await favRes.text();
        console.error("⚠️ favorites fetch error", favRes.status, body);
        throw new Error("Could not load favorites");
      }
      console.log("👍 Favorites fetched:", favRes.status);
      const { favorites } = await favRes.json();
      const ingredientsOnHand = favorites.map((f) => f.ingredient);
      */
      const ingredientsOnHand = getIngredients(recipe);
      // 2) call your Flask microservice
      console.log("Generating from AI at:", AI_URL + "/generate-meal-plan");
      const genRes = await fetch(`${AI_URL}/generate-meal-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        credentials: "include",
        body: JSON.stringify({
          preferences: {
            favorite_cuisines: [recipe.strArea],
            liked_dishes: [recipe.strMeal],
            disliked_dishes: [],
            dietary_restrictions: [],
          },
          query: ingredientsOnHand.join(", "),
        }),
      });
      console.log("📥 AI response status:", genRes.status);
      const data = await genRes.json();
      setSuggestion(data[0]);
    } catch (err) {
      console.error(err);
      setError("Failed to generate suggestion");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <p className="p-8">Loading…</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 p-8">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-700 hover:underline"
      >
        ← Back
      </button>

      <div className="max-w-3xl mx-auto bg-white bg-opacity-70 backdrop-blur p-6 rounded-lg shadow-lg">
        <img
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          className="w-full h-64 object-cover rounded-md"
        />
        <h1 className="mt-4 text-3xl font-bold text-blue-700">
          {recipe.strMeal}
        </h1>
        <p className="mt-2 text-gray-600">
          <strong>Cuisine:</strong> {recipe.strArea} &nbsp; | &nbsp;
          <strong>Category:</strong> {recipe.strCategory}
        </p>

        <section className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Ingredients
          </h2>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            {getIngredients(recipe).map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Instructions
          </h2>
          <p className="mt-2 text-gray-700 whitespace-pre-line">
            {recipe.strInstructions}
          </p>
        </section>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? "Generating…" : "Generate a Similar Dish"}
        </button>

        {suggestion && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-xl font-bold">{suggestion.name}</h3>
            <p className="italic">{suggestion.cuisine}</p>
            <ul className="mt-2 list-disc list-inside">
              {suggestion.ingredients.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
            <p className="mt-2">{suggestion.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
