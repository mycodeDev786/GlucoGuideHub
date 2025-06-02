// your_component_path/GICalculatorFrontend.js
"use client";

import { useState } from "react";

export default function GICalculatorFrontend() {
  const [food, setFood] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateGI = async () => {
    if (!food.trim()) {
      setResult({ error: "Please enter a food name." });
      return;
    }

    setLoading(true);
    setResult(null);

    // Ensure the prompt explicitly asks for JSON, which is crucial for Gemini
    const prompt = `Estimate the glycemic index (GI), approximate calorie content per serving, and whether the following food is suitable for diabetic patients based on its GI: "${food}".
    
    Respond STRICTLY in JSON format with the following keys:
    {
      "food": "Food Name",
      "gi": "Glycemic Index Value (e.g., 50 or 'Not available')",
      "calories": "Approximate Calories per Serving (e.g., 150 kcal or 'Not available')",
      "suitability": "Suitable/Moderately Suitable/Not Suitable for diabetics with a brief reason based on GI"
    }`;

    try {
      const res = await fetch("/api/gi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ food, prompt }), // Send food and the structured prompt
      });

      const data = await res.json();

      if (data.success) {
        // AI response is already parsed as JSON by the API route
        setResult(data.result);
      } else {
        // Handle errors from the backend API route
        setResult({ error: data.error || "Unexpected error occurred." });
      }
    } catch (err) {
      console.error("Frontend fetch error:", err);
      setResult({ error: "Error fetching GI data. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold text-center mb-6 text-purple-700">
        GI Calculator (Powered by Gemini)
      </h1>
      <input
        type="text"
        value={food}
        onChange={(e) => setFood(e.target.value)}
        placeholder="Enter food name (e.g., Apple, White Bread)"
        className="w-full p-3 border rounded mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
      />
      <button
        onClick={calculateGI}
        disabled={loading}
        className={`w-full px-6 py-2 rounded transition ${
          loading
            ? "bg-purple-400 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700"
        } text-white`}
      >
        {loading ? "Calculating..." : "Calculate GI"}
      </button>

      {result && (
        <div className="mt-6 bg-white p-6 shadow rounded-lg border border-gray-200">
          {result.error ? (
            <p className="text-red-500 font-semibold">{result.error}</p>
          ) : (
            <>
              <p className="mb-2">
                <strong>Food:</strong>{" "}
                <span className="font-medium">{result.food}</span>
              </p>
              <p className="mb-2">
                <strong>GI:</strong>{" "}
                <span className="font-medium">{result.gi}</span>
              </p>
              <p className="mb-2">
                <strong>Calories:</strong>{" "}
                <span className="font-medium">{result.calories}</span>
              </p>
              <p>
                <strong>Suitability:</strong>{" "}
                <span className="font-medium">{result.suitability}</span>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
