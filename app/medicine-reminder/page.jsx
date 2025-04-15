"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { format, addDays, isToday } from "date-fns"; // Date handling

const dummyMedicines = [
  { name: "Insulin", dose: "10 units", time: "08:00 AM", taken: [] },
  { name: "Metformin", dose: "500 mg", time: "09:00 AM", taken: [] },
  { name: "Aspirin", dose: "81 mg", time: "12:00 PM", taken: [] },
  { name: "Vitamin D", dose: "1000 IU", time: "02:00 PM", taken: [] },
];

const MedicineReminderPage = () => {
  const [medicines, setMedicines] = useState(dummyMedicines);
  const [showModal, setShowModal] = useState(false);
  const [customMedicine, setCustomMedicine] = useState({
    name: "",
    dose: "",
    time: "",
  });

  // Helper function to generate a calendar for 30 days
  const generateCalendar = (medicineIndex) => {
    const today = new Date();
    const calendarDays = Array.from({ length: 30 }, (_, i) => {
      const currentDay = addDays(today, i);
      const formattedDate = format(currentDay, "yyyy-MM-dd");

      // Check if this day is taken for the medicine
      const isTaken = medicines[medicineIndex]?.taken.includes(formattedDate);

      return { date: formattedDate, isTaken };
    });

    return calendarDays;
  };

  const addMedicine = (medicine) => {
    setMedicines((prev) => [...prev, medicine]);
  };

  const removeMedicine = (index) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomMedicine = () => {
    if (!customMedicine.name || !customMedicine.dose || !customMedicine.time)
      return;
    addMedicine({
      name: customMedicine.name,
      dose: customMedicine.dose,
      time: customMedicine.time,
      taken: [],
    });
    setCustomMedicine({ name: "", dose: "", time: "" });
    setShowModal(false);
  };

  // Mark the medicine as taken
  const markAsTaken = (medicineIndex, date) => {
    const updatedMedicines = [...medicines];
    const medicine = updatedMedicines[medicineIndex];
    if (!medicine.taken.includes(date)) {
      medicine.taken.push(date);
    }
    setMedicines(updatedMedicines);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-800 mb-10">
        Medicine Reminder
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {medicines.map((medicine, index) => (
          <div
            key={index}
            className="bg-white border border-blue-100 shadow-lg rounded-xl p-5 hover:shadow-xl transition"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-blue-700">
                {medicine.name}
              </h2>
              <button
                onClick={() => removeMedicine(index)}
                className="text-red-400 hover:text-red-600"
                title="Remove"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-sm text-gray-700">
              <p>
                <strong>Dose:</strong> {medicine.dose}
              </p>
              <p>
                <strong>Time:</strong> {medicine.time}
              </p>
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                Daily Report
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {generateCalendar(index).map(({ date, isTaken }) => (
                  <div
                    key={date}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                      isTaken ? "bg-green-500" : "bg-red-500"
                    }`}
                    title={isTaken ? "Taken" : "Missed"}
                    onClick={() => markAsTaken(index, date)}
                  >
                    {format(new Date(date), "d")}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          + Add Medicine
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-blue-700">
              Add Custom Medicine
            </h3>

            <label className="block mb-3 text-sm">
              Medicine Name
              <input
                type="text"
                value={customMedicine.name}
                onChange={(e) =>
                  setCustomMedicine({ ...customMedicine, name: e.target.value })
                }
                className="w-full mt-1 p-2 border rounded"
              />
            </label>

            <label className="block mb-3 text-sm">
              Dose
              <input
                type="text"
                value={customMedicine.dose}
                onChange={(e) =>
                  setCustomMedicine({ ...customMedicine, dose: e.target.value })
                }
                className="w-full mt-1 p-2 border rounded"
              />
            </label>

            <label className="block mb-3 text-sm">
              Time
              <input
                type="text"
                value={customMedicine.time}
                onChange={(e) =>
                  setCustomMedicine({ ...customMedicine, time: e.target.value })
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
                onClick={handleAddCustomMedicine}
              >
                Add Medicine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineReminderPage;
