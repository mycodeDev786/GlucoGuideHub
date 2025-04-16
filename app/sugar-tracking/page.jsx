"use client";

import { useState } from "react";
import { format, isToday, subDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const sugarTypes = ["Fasting", "Before Meal", "After Meal", "Bedtime"];

const generateDummyData = () => {
  const days = [];
  for (let i = 0; i < 30; i++) {
    const date = subDays(new Date(), i);
    days.unshift({
      date: format(date, "yyyy-MM-dd"),
      Fasting: 80 + Math.floor(Math.random() * 40),
      "Before Meal": 90 + Math.floor(Math.random() * 30),
      "After Meal": 120 + Math.floor(Math.random() * 50),
      Bedtime: 100 + Math.floor(Math.random() * 30),
    });
  }
  return days;
};

export default function SugarTrackingPage() {
  const [readings, setReadings] = useState(generateDummyData());

  const today = format(new Date(), "yyyy-MM-dd");
  const todayReading = readings.find((r) => r.date === today);

  const [newReading, setNewReading] = useState({
    Fasting: "",
    "Before Meal": "",
    "After Meal": "",
    Bedtime: "",
  });

  const handleAddReading = () => {
    const updated = readings.map((r) =>
      r.date === today ? { date: today, ...newReading } : r
    );

    const notExists = !readings.some((r) => r.date === today);

    if (notExists) {
      updated.push({ date: today, ...newReading });
    }

    setReadings(updated);
    setNewReading({
      Fasting: "",
      "Before Meal": "",
      "After Meal": "",
      Bedtime: "",
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">
        Sugar Level Tracking
      </h1>

      {/* Add new reading for today */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Today's Reading
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
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleAddReading}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save Reading
        </button>
      </div>

      {/* Daily Report */}
      <div className="bg-white rounded-xl shadow p-6 mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Daily Report
        </h2>
        {todayReading ? (
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Type</th>
                <th className="p-2">Reading (mg/dL)</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {sugarTypes.map((type) => {
                const val = todayReading[type];
                const isNormal = val < 130;
                return (
                  <tr key={type} className="border-t">
                    <td className="p-2">{type}</td>
                    <td className="p-2">{val}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          isNormal
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isNormal ? "Normal" : "High"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No reading for today.</p>
        )}
      </div>

      {/* Monthly Report */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Monthly Report
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={readings.slice(-30)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Fasting" fill="#4ade80" />
            <Bar dataKey="Before Meal" fill="#60a5fa" />
            <Bar dataKey="After Meal" fill="#fbbf24" />
            <Bar dataKey="Bedtime" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
