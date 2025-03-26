"use client";
import { useState, useEffect } from "react";
import api from "../../../services/authApi";

export default function FoodLoggingPage() {
  const [foodItem, setFoodItem] = useState("");
  const [foodLogs, setFoodLogs] = useState([]);

  // Fetch food logs from the backend when the component mounts
  useEffect(() => {
    const fetchFoodLogs = async () => {
      try {
        const res = await api.get("foodlogs"); 
        setFoodLogs(res.data.logs);
      } catch (error) {
        console.error("Error fetching food logs:", error);
      }
    };

    fetchFoodLogs();
  }, []);

  // Add a new food log
  const handleAddFood = async (e) => {
    e.preventDefault();
    if (!foodItem.trim()) return;
    try {
      const res = await api.post("/foodlogs", { item: foodItem }); 
      setFoodLogs((prev) => [...prev, res.data.log]);
      setFoodItem("");
    } catch (error) {
      console.error("Error adding food log:", error);
    }
  };

  // Delete a food log by ID
  const handleDeleteFood = async (id) => {
    try {
      await api.delete(`foodlogs/${id}`);
      setFoodLogs((prev) => prev.filter((log) => log.id !== id));
    } catch (error) {
      console.error("Error deleting food log:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-50 p-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-3xl font-bold mb-4 text-green-800">Food Logging</h1>
        <form onSubmit={handleAddFood} className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter food item..."
            value={foodItem}
            onChange={(e) => setFoodItem(e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add
          </button>
        </form>
        {foodLogs.length > 0 ? (
          <ul>
            {foodLogs.map((log) => (
              <li key={log.id} className="flex justify-between items-center p-2 border-b">
                <span>
                  {log.item}{" "}
                  <em className="text-sm text-gray-500">
                    ({new Date(log.timestamp).toLocaleString()})
                  </em>
                </span>
                <button onClick={() => handleDeleteFood(log.id)} className="text-red-500 hover:text-red-700">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No food logged yet.</p>
        )}
      </div>
    </div>
  );
}
