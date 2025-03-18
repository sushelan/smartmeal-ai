"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, startGoogleOAuth } from "../../services/authApi"; // Check this relative path

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      console.log("Login successful:", response);
      // Redirect to food logging page after successful login
      router.push("/food-logging");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your credentials and try again.");
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google Sign-In Clicked");
    startGoogleOAuth();
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 bg-[url('/texture.svg')] opacity-20 pointer-events-none"></div>

      {/* Navigation Bar */}
      <nav className="relative z-10 bg-white bg-opacity-70 backdrop-blur-md shadow py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-md shadow-md flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-700">SmartMeal</h1>
        </div>
        <p className="hidden md:block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-lg drop-shadow">
          Smarter, Healthier Meals. Effortlessly.
        </p>
      </nav>

      {/* Main Login Area */}
      <div className="relative flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white bg-opacity-70 backdrop-blur-lg rounded-xl shadow-xl border border-white max-w-sm w-full p-8">
          <h2 className="text-3xl font-semibold text-blue-700 text-center mb-6">
            Welcome Back!
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-blue-200 bg-opacity-90 bg-white shadow-inner p-3 rounded-lg focus:ring-2 focus:ring-blue-400 placeholder-gray-500 text-gray-900"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-blue-200 bg-opacity-90 bg-white shadow-inner p-3 rounded-lg focus:ring-2 focus:ring-blue-400 placeholder-gray-500 text-gray-900"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md text-white p-3 rounded-lg font-semibold transition duration-300"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-blue-200" />
            <span className="px-2 text-blue-500 text-sm">or</span>
            <hr className="flex-grow border-blue-200" />
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center bg-white bg-opacity-70 shadow hover:shadow-md p-3 rounded-lg text-gray-700 transition duration-300 border border-blue-200 w-full"
          >
            <img src="/google-icon.svg" alt="Google Logo" className="w-5 h-5 mr-2" />
            Sign in with Google
          </button>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-600 hover:underline font-semibold">
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* Footer with Links */}
      <footer className="relative z-10 bg-white bg-opacity-50 backdrop-blur py-4 shadow-inner">
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
