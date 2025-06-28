"use client";

import { useState, useEffect } from "react";
import { format, isToday, subDays } from "date-fns";
import { X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  where,
  serverTimestamp, // To record when the reading was added/updated
  orderBy, // To order readings by date
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // Import auth listener
import { db, auth } from "../lib/firebaseConfig"; // Import 'db' and 'auth'

const sugarTypes = ["Fasting", "Before Meal", "After Meal", "Bedtime"];

export default function SugarTrackingPage() {
  const [readings, setReadings] = useState([]);
  const [newReading, setNewReading] = useState({
    Fasting: "",
    "Before Meal": "",
    "After Meal": "",
    Bedtime: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // State to store the authenticated user

  // --- Authentication and Data Fetching ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(true); // Reset loading state when auth state changes

      if (currentUser) {
        // Fetch sugar readings specific to this user, ordered by date
        const q = query(
          collection(db, "sugarReadings"),
          where("userId", "==", currentUser.uid),
          orderBy("date", "asc") // Order readings for the chart
        );

        const unsubscribeFirestore = onSnapshot(
          q,
          (snapshot) => {
            const readingsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setReadings(readingsData);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching sugar readings:", err);
            setError("Failed to load sugar readings. Please try again.");
            setLoading(false);
          }
        );
        return () => unsubscribeFirestore(); // Cleanup Firestore listener
      } else {
        // User not logged in, clear readings
        setReadings([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Cleanup Auth listener
  }, []);

  // Get today's reading from the fetched data
  const todayFormattedDate = format(new Date(), "yyyy-MM-dd");
  const todayReadingFromDb = readings.find(
    (r) => r.date === todayFormattedDate
  );

  // Effect to populate newReading form if today's reading already exists
  useEffect(() => {
    if (todayReadingFromDb) {
      setNewReading({
        Fasting: todayReadingFromDb.Fasting || "",
        "Before Meal": todayReadingFromDb["Before Meal"] || "",
        "After Meal": todayReadingFromDb["After Meal"] || "",
        Bedtime: todayReadingFromDb.Bedtime || "",
      });
    } else {
      setNewReading({
        Fasting: "",
        "Before Meal": "",
        "After Meal": "",
        Bedtime: "",
      });
    }
  }, [todayReadingFromDb]);

  // --- Firebase Data Operations ---
  const handleSaveReading = async () => {
    if (!user) {
      setError("Please log in to save your sugar readings.");
      return;
    }

    // Convert string numbers to actual numbers
    const readingToSave = {
      ...newReading,
      Fasting: newReading.Fasting ? Number(newReading.Fasting) : "",
      "Before Meal": newReading["Before Meal"]
        ? Number(newReading["Before Meal"])
        : "",
      "After Meal": newReading["After Meal"]
        ? Number(newReading["After Meal"])
        : "",
      Bedtime: newReading.Bedtime ? Number(newReading.Bedtime) : "",
    };

    try {
      if (todayReadingFromDb) {
        // Update existing reading
        const docRef = doc(db, "sugarReadings", todayReadingFromDb.id);
        await updateDoc(docRef, {
          ...readingToSave,
          updatedAt: serverTimestamp(), // Update timestamp
        });
      } else {
        // Add new reading
        await addDoc(collection(db, "sugarReadings"), {
          ...readingToSave,
          date: todayFormattedDate,
          userId: user.uid,
          createdAt: serverTimestamp(), // Add timestamp
        });
      }
      setError(null); // Clear any previous errors
    } catch (e) {
      console.error("Error saving reading: ", e);
      setError("Failed to save reading. Please try again.");
    }
  };

  // Prepare data for the chart, including dummy data for missing days
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(new Date(), 29 - i), "yyyy-MM-dd"); // Go back 29 days from today
    const existingReading = readings.find((r) => r.date === date);

    return {
      date: format(new Date(date), "MMM dd"), // Format for chart XAxis
      Fasting: existingReading?.Fasting || null,
      "Before Meal": existingReading?.["Before Meal"] || null,
      "After Meal": existingReading?.["After Meal"] || null,
      Bedtime: existingReading?.Bedtime || null,
    };
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-blue-700 text-xl">
        Loading sugar readings...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">
        Sugar Level Tracking
      </h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <X className="h-6 w-6 text-red-500" />
          </button>
        </div>
      )}

      {!user ? (
        <div className="text-center bg-gray-50 p-6 rounded-lg shadow-md mb-8">
          <p className="text-lg text-gray-700">
            Please log in to track your sugar levels and view your history.
          </p>
          {/* You might add a link/button to your login page here */}
        </div>
      ) : (
        <>
          {/* Add/Edit new reading for today */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {todayReadingFromDb
                ? "Edit Today's Reading"
                : "Add Today's Reading"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sugarTypes.map((type) => (
                <div key={type}>
                  <label className="block text-sm font-medium text-gray-700">
                    {type} (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={newReading[type]}
                    onChange={(e) =>
                      setNewReading((prev) => ({
                        ...prev,
                        [type]: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full border rounded px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., 100"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveReading}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              {todayReadingFromDb ? "Update Reading" : "Save Reading"}
            </button>
          </div>

          {/* Daily Report */}
          <div className="bg-white rounded-xl shadow p-6 mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Daily Report ({todayFormattedDate})
            </h2>
            {todayReadingFromDb &&
            Object.values(todayReadingFromDb).some(
              (value) => typeof value === "number"
            ) ? (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border-b">Type</th>
                    <th className="p-3 border-b">Reading (mg/dL)</th>
                    <th className="p-3 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sugarTypes.map((type) => {
                    const val = todayReadingFromDb[type];
                    const isNormal = val >= 70 && val < 130; // More refined normal range
                    const isHigh = val >= 130;
                    const isLow = val < 70 && val !== ""; // Consider 0 or empty as not a low reading yet

                    if (val === "" || val === null || val === undefined)
                      return null; // Don't show empty fields

                    return (
                      <tr
                        key={type}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="p-3">{type}</td>
                        <td className="p-3">{val}</td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isNormal
                                ? "bg-green-100 text-green-700"
                                : isHigh
                                ? "bg-red-100 text-red-700"
                                : isLow
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {isNormal
                              ? "Normal"
                              : isHigh
                              ? "High"
                              : isLow
                              ? "Low"
                              : "N/A"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">
                No complete reading entered for today. Please fill out the form
                above.
              </p>
            )}
          </div>

          {/* Monthly Report */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Monthly Report (Last 30 Days)
            </h2>
            {readings.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#6B7280" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    label={{
                      value: "Blood Sugar (mg/dL)",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#6B7280",
                    }}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="Fasting" fill="#4ade80" name="Fasting" />
                  <Bar
                    dataKey="Before Meal"
                    fill="#60a5fa"
                    name="Before Meal"
                  />
                  <Bar dataKey="After Meal" fill="#fbbf24" name="After Meal" />
                  <Bar dataKey="Bedtime" fill="#f87171" name="Bedtime" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">
                No historical data available. Add readings to see the chart.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
