"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    alert("Login button clicked!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">SmartMeal</h1>
        <p className="text-gray-600 hidden sm:block">Smarter, healthier meal planning made easy.</p>
      </nav>

      {/* Login Form Container */}
      <div className="flex flex-grow items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Sign In
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-600 text-gray-900"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-600 text-gray-900"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg font-semibold transition-all duration-200"
            >
              Login
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-500 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
