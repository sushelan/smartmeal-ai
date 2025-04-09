"use client";

import { useState, useEffect } from "react";
import api from "../../../services/authApi";
import { useRouter } from "next/navigation";

export default function LogFood() {
  const [ingredient, setIngredient] = useState("");
  const [amount, setAmount] = useState("");
  const [ingredientsList, setIngredientsList] = useState([]);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const fetchFoodLogs = async () => {
      try {
        const res = await api.get("/foodlogs");
        setIngredientsList(res.data.logs);
      } catch (error) {
        console.error("Error fetching food logs:", error);
      }
    };

    fetchFoodLogs();
  }, []);

  const addIngredient = async (e) => {
    e.preventDefault();
    if (!ingredient.trim()) return;
    try {
      const res = await api.post("/foodlogs", {
        
        item: amount.trim() ? `${ingredient} - ${amount}` : ingredient,
      });
      setIngredientsList((prev) => [...prev, res.data.log]);
      setIngredient("");
      setAmount("");
    } catch (error) {
      console.error("Error adding ingredient:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/foodlogs/${id}`);
      setIngredientsList((prev) => prev.filter((log) => log.id !== id));
    } catch (error) {
      console.error("Error deleting ingredient:", error);
    }
  };

  
  const goToRecipes = () => {
    const ingredientNames = ingredientsList.map((log) => {
      // Assume the format is "ingredient - amount"; split and take first part.
      return log.item.split(" - ")[0].trim();
    });
    localStorage.setItem("ingredients", JSON.stringify(ingredientNames));
    router.push("/recipe-browsing");
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
      <div className="absolute inset-0 bg-[url('/texture.svg')] opacity-20 pointer-events-none"></div>

      <nav className="relative z-10 bg-white bg-opacity-70 backdrop-blur-md shadow py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-md shadow-md flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-700">SmartMeal</h1>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-blue-600 hover:underline font-semibold cursor-pointer"
        >
          Logout
        </button>
      </nav>

      <div className="relative flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white bg-opacity-70 backdrop-blur-lg rounded-xl shadow-xl border border-white w-full max-w-3xl p-8">
          <h2 className="text-3xl font-semibold text-blue-700 text-center mb-6">
            Log Your Ingredients
          </h2>

          <form onSubmit={addIngredient} className="flex flex-col gap-4 mb-6">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              className="flex-grow border border-blue-200 bg-opacity-90 bg-white shadow-inner p-3 rounded-lg focus:ring-2 focus:ring-blue-400 placeholder-gray-500 text-gray-900"
              placeholder="Ingredient name"
              required
            />
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-grow border border-blue-200 bg-opacity-90 bg-white shadow-inner p-3 rounded-lg focus:ring-2 focus:ring-blue-400 placeholder-gray-500 text-gray-900"
              placeholder="Amount (e.g. 2 cups)"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md text-white p-3 rounded-lg font-semibold transition duration-300 cursor-pointer"
            >
              Add Ingredient
            </button>
          </form>

          <ul className="space-y-3 mb-6">
            {ingredientsList.map((log) => (
              <li
                key={log.id}
                className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 shadow-sm border border-gray-300"
              >
                <span className="text-gray-900 dark:text-white">
                  {log.item}
                  {hasMounted && (
                    <em className="text-sm text-gray-500 ml-2">
                      ({new Date(log.timestamp).toLocaleString()})
                    </em>
                  )}
                </span>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          {ingredientsList.length >= 2 && (
            <div className="text-center">
              <button
                onClick={goToRecipes}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow transition duration-300 cursor-pointer"
              >
                See Recipe Suggestions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
