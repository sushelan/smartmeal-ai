"use client";

import { useState } from "react";
import "../globals.css"; 
import { useRouter } from "next/navigation";

export default function LogFood() {
  const [ingredient, setIngredient] = useState("");
  const [ingredientsList, setIngredientsList] = useState([]);
  const router = useRouter();

  const addIngredient = (e) => {
    e.preventDefault();
    if (ingredient.trim()) {
      setIngredientsList([...ingredientsList, ingredient]);
      setIngredient(""); // Clear input after adding
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 bg-[url('/texture.svg')] opacity-20 pointer-events-none"></div>

      {/* Navigation Bar */}
      <nav className="relative z-10 bg-white bg-opacity-70 backdrop-blur-md shadow py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-md shadow-md flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-700">SmartMeal</h1>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-blue-600 hover:underline font-semibold"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="relative flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white bg-opacity-70 backdrop-blur-lg rounded-xl shadow-xl border border-white max-w-sm w-full p-8">
          <h2 className="text-3xl font-semibold text-blue-700 text-center mb-6">
            Log Your Ingredients
          </h2>

          <form onSubmit={addIngredient} className="flex flex-col gap-4">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              className="border border-blue-200 bg-opacity-90 bg-white shadow-inner p-3 rounded-lg focus:ring-2 focus:ring-blue-400 placeholder-gray-500 text-gray-900"
              placeholder="Enter an ingredient..."
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md text-white p-3 rounded-lg font-semibold transition duration-300"
            >
              Add Ingredient
            </button>
          </form>

          {/* Ingredients List */}
          <ul className="mt-6 space-y-2">
            {ingredientsList.map((item, index) => (
              <li
                key={index}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white shadow-sm border border-gray-300"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
