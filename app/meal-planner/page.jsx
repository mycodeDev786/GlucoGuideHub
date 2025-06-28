"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Redux imports
import { useSelector, useDispatch } from "react-redux";
import {
  addFood,
  removeFood,
  fetchMealPlan,
  saveMealPlan,
  setMealPlanDate,
} from "../store/mealPlannerSlice"; // Adjust path as needed

// Firebase Auth (for current user ID)
import { auth } from "../lib/firebaseConfig"; // Adjust path as needed
import { onAuthStateChanged } from "firebase/auth";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const dummyFoods = [
  { name: "Oatmeal", gi: 55, calories: 150 },
  { name: "Boiled Egg", gi: 0, calories: 78 },
  { name: "Apple", gi: 38, calories: 95 },
  { name: "Grilled Chicken", gi: 0, calories: 165 },
  { name: "Brown Rice", gi: 50, calories: 215 },
];

const mealTypes = [
  "Breakfast",
  "Morning Snack",
  "Lunch",
  "Afternoon Snack",
  "Dinner",
];

const calorieTarget = 2000;
const giTarget = 100;

export default function MealPlannerPage() {
  const dispatch = useDispatch();
  const { meals, status, error, currentDate } = useSelector(
    (state) => state.mealPlanner
  );
  const [userId, setUserId] = useState(null); // State to hold current user ID

  const [showModal, setShowModal] = useState(false);
  const [selectedMealForCustom, setSelectedMealForCustom] = useState(""); // Renamed to avoid conflict
  const [customFood, setCustomFood] = useState({
    name: "",
    gi: "",
    calories: "",
  });

  // Listen for Firebase auth state changes to get the user ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null); // User logged out
        dispatch(resetMealPlan()); // Clear meal plan on logout
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  // Fetch meal plan when userId or currentDate changes
  useEffect(() => {
    if (userId) {
      dispatch(fetchMealPlan({ userId, date: currentDate }));
    }
  }, [userId, currentDate, dispatch]);

  // Save meal plan to Firebase whenever 'meals' state changes (with a debounce)
  useEffect(() => {
    if (userId && status === "succeeded") {
      // Only save if the last operation was successful to avoid infinite loops
      const handler = setTimeout(() => {
        dispatch(saveMealPlan({ userId, date: currentDate, meals }));
      }, 500); // Debounce save to avoid too many writes

      return () => clearTimeout(handler);
    }
  }, [meals, userId, currentDate, dispatch, status]); // Added status as dependency

  const handleAddFoodToMeal = (mealType, food) => {
    dispatch(addFood({ mealType, food }));
  };

  const handleRemoveFoodFromMeal = (mealType, index) => {
    dispatch(removeFood({ mealType, index }));
  };

  const getTotal = (meal) => {
    const gi = meals[meal].reduce((sum, item) => sum + item.gi, 0);
    const calories = meals[meal].reduce((sum, item) => sum + item.calories, 0);
    return { gi, calories };
  };

  const getGrandTotals = () => {
    let totalGI = 0;
    let totalCalories = 0;
    mealTypes.forEach((meal) => {
      totalGI += getTotal(meal).gi;
      totalCalories += getTotal(meal).calories;
    });
    return { totalGI, totalCalories };
  };

  const handleAddCustomFood = () => {
    if (!customFood.name || !customFood.gi || !customFood.calories) return;
    handleAddFoodToMeal(selectedMealForCustom, {
      name: customFood.name,
      gi: parseInt(customFood.gi),
      calories: parseInt(customFood.calories),
    });
    setCustomFood({ name: "", gi: "", calories: "" });
    setShowModal(false);
  };

  const handleDateChange = (e) => {
    dispatch(setMealPlanDate(e.target.value));
  };

  const { totalGI, totalCalories } = getGrandTotals();

  // Chart Data
  const chartData = {
    labels: ["Calories Consumed", "GI Consumed"],
    datasets: [
      {
        label: "Daily Intake",
        data: [totalCalories, totalGI],
        backgroundColor: ["#4CAF50", "#FFEB3B"],
        borderColor: ["#388E3C", "#FBC02D"],
        borderWidth: 1,
      },
    ],
  };

  if (!userId) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 text-center text-gray-600">
        Please log in to use the Meal Planner.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-800 mb-10">
        Meal Planner
      </h1>

      <div className="mb-6 flex items-center justify-center">
        <label htmlFor="meal-date" className="mr-2 text-gray-700">
          Select Date:
        </label>
        <input
          type="date"
          id="meal-date"
          value={currentDate}
          onChange={handleDateChange}
          className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* {status === "loading" && (
        <p className="text-center text-blue-600 mb-4">Loading meal plan...</p>
      )} */}
      {status === "failed" && (
        <p className="text-center text-red-600 mb-4">
          Error: {error}. Please try again.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {mealTypes.map((meal) => (
          <div
            key={meal}
            className="bg-white border border-blue-100 shadow-lg rounded-xl p-5 hover:shadow-xl transition"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-blue-700">{meal}</h2>
              <button
                onClick={() => {
                  setSelectedMealForCustom(meal);
                  setShowModal(true);
                }}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
              >
                + Add Food
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {dummyFoods.map((food, index) => (
                <button
                  key={index}
                  className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-xs hover:bg-cyan-200 transition"
                  onClick={() => handleAddFoodToMeal(meal, food)}
                >
                  + {food.name}
                </button>
              ))}
            </div>

            <ul className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {meals[meal] &&
                meals[meal].map((food, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center border-b py-1"
                  >
                    <div>
                      <p className="text-sm font-medium">{food.name}</p>
                      <p className="text-xs text-gray-500">
                        GI: {food.gi} | Calories: {food.calories}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFoodFromMeal(meal, index)}
                      className="text-red-400 hover:text-red-600"
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
            </ul>

            <div className="mt-4 text-sm text-gray-700 border-t pt-2">
              <strong>Total GI:</strong> {getTotal(meal).gi} |{" "}
              <strong>Calories:</strong> {getTotal(meal).calories}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Report */}
      <div className="bg-white mt-10 border border-green-200 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          Daily Summary
        </h2>
        <p className="text-gray-700 text-sm sm:text-base mb-2">
          <strong>Total Calories Consumed:</strong> {totalCalories} /{" "}
          <span className="text-gray-500">{calorieTarget}</span>
        </p>
        <p className="text-gray-700 text-sm sm:text-base mb-4">
          <strong>Total GI Consumed:</strong> {totalGI} /{" "}
          <span className="text-gray-500">{giTarget}</span>
        </p>

        {/* Chart */}
        <div className="max-w-md mx-auto">
          <Bar data={chartData} options={{ responsive: true }} />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-blue-700">
              Add Custom Food
            </h3>

            <label className="block mb-3 text-sm">
              Select Meal
              <select
                value={selectedMealForCustom}
                onChange={(e) => setSelectedMealForCustom(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              >
                {mealTypes.map((meal) => (
                  <option key={meal}>{meal}</option>
                ))}
              </select>
            </label>

            <label className="block mb-3 text-sm">
              Food Name
              <input
                type="text"
                value={customFood.name}
                onChange={(e) =>
                  setCustomFood({ ...customFood, name: e.target.value })
                }
                className="w-full mt-1 p-2 border rounded"
              />
            </label>

            <label className="block mb-3 text-sm">
              Glycemic Index (GI)
              <input
                type="number"
                value={customFood.gi}
                onChange={(e) =>
                  setCustomFood({ ...customFood, gi: e.target.value })
                }
                className="w-full mt-1 p-2 border rounded"
              />
            </label>

            <label className="block mb-3 text-sm">
              Calories
              <input
                type="number"
                value={customFood.calories}
                onChange={(e) =>
                  setCustomFood({ ...customFood, calories: e.target.value })
                }
                className="w-full mt-1 p-2 border rounded"
              />
            </label>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleAddCustomFood}
              >
                Add Food
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
