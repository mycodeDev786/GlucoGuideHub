"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { format, addDays, isToday } from "date-fns";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  // For user-specific queries, you'll need:
  where,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  // If you want to offer email/password or Google sign-in later:
  // createUserWithEmailAndPassword,
  // signInWithEmailAndPassword,
  // GoogleAuthProvider,
  // signInWithPopup,
} from "firebase/auth";

import { db, auth } from "../lib/firebaseConfig"; // Adjust this path and import auth

const MedicineReminderPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [customMedicine, setCustomMedicine] = useState({
    name: "",
    dose: "",
    time: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // State to hold the authenticated user

  // --- Firebase Authentication Handling ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // If user is authenticated, start fetching their medicines
        // (The medicine fetching useEffect will react to `user` change)
      } else {
        // No user logged in, try anonymous login
        try {
          const anonymousUserCredential = await signInAnonymously(auth);
          setUser(anonymousUserCredential.user);
          console.log(
            "Signed in anonymously. User ID:",
            anonymousUserCredential.user.uid
          );
        } catch (authError) {
          console.error("Error signing in anonymously:", authError);
          setError("Failed to sign in. Please try refreshing the page.");
          setLoading(false); // Stop loading if anonymous sign-in fails
        }
      }
      // If user is resolved (either existing or anonymous), stop global loading
      if (user || currentUser) setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [user]); // Re-run if user object changes (e.g., from null to a user)

  // --- Firebase Firestore Data Handling (User-Specific) ---
  useEffect(() => {
    if (!user) return; // Don't fetch medicines if no user is available yet

    // Query medicines where `userId` matches the current user's UID
    const q = query(
      collection(db, "medicines"),
      where("userId", "==", user.uid)
    );

    const unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        const medicinesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMedicines(medicinesData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching medicines:", err);
        setError("Failed to load medicines. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribeFirestore(); // Clean up the listener
  }, [user]); // Depend on the user object, so it re-fetches when user changes

  const addMedicine = async (medicine) => {
    if (!user) {
      setError("Please sign in to add medicines.");
      return;
    }
    try {
      await addDoc(collection(db, "medicines"), {
        ...medicine,
        userId: user.uid, // Store the user's ID with the medicine
        taken: [],
      });
    } catch (e) {
      console.error("Error adding medicine: ", e);
      setError("Failed to add medicine.");
    }
  };

  const removeMedicine = async (id) => {
    if (!user) {
      setError("Please sign in to remove medicines.");
      return;
    }
    try {
      await deleteDoc(doc(db, "medicines", id));
    } catch (e) {
      console.error("Error removing medicine: ", e);
      setError("Failed to remove medicine.");
    }
  };

  const markAsTaken = async (id, date) => {
    if (!user) {
      setError("Please sign in to record medicine intake.");
      return;
    }
    try {
      const medicineRef = doc(db, "medicines", id);
      const medicineToUpdate = medicines.find((med) => med.id === id);

      if (medicineToUpdate && !medicineToUpdate.taken.includes(date)) {
        await updateDoc(medicineRef, {
          taken: [...medicineToUpdate.taken, date],
        });
      }
    } catch (e) {
      console.error("Error marking medicine as taken: ", e);
      setError("Failed to update medicine status.");
    }
  };

  // --- Helper function to generate a calendar for 30 days ---
  const generateCalendar = (medicine) => {
    const today = new Date();
    const calendarDays = Array.from({ length: 30 }, (_, i) => {
      const currentDay = addDays(today, i);
      const formattedDate = format(currentDay, "yyyy-MM-dd");
      const isTaken = medicine?.taken?.includes(formattedDate);
      return { date: formattedDate, isTaken };
    });
    return calendarDays;
  };

  const handleAddCustomMedicine = () => {
    if (!customMedicine.name || !customMedicine.dose || !customMedicine.time) {
      alert("Please fill in all medicine details.");
      return;
    }
    addMedicine({
      name: customMedicine.name,
      dose: customMedicine.dose,
      time: customMedicine.time,
    });
    setCustomMedicine({ name: "", dose: "", time: "" });
    setShowModal(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMedicines([]); // Clear medicines on logout
      setUser(null);
      setError(null);
      setLoading(true); // Re-enable loading state
    } catch (error) {
      console.error("Error logging out:", error);
      setError("Failed to log out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-blue-700 text-xl">
        Loading your session...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-600 text-xl text-center p-4">
        <p>{error}</p>
        <p className="text-gray-500 text-base mt-2">
          Please check your internet connection or Firebase setup.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className=" w-full  justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-800">
          Medicine Reminder
        </h1>
      </div>
      <hr className="mb-8 border-t-2 border-blue-100" />

      {medicines.length === 0 && (
        <p className="text-center text-gray-600 text-lg mb-6">
          No medicines added yet. Click "+ Add Medicine" to get started!
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {medicines.map((medicine) => (
          <div
            key={medicine.id}
            className="bg-white border border-blue-100 shadow-lg rounded-xl p-5 hover:shadow-xl transition"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-blue-700">
                {medicine.name}
              </h2>
              <button
                onClick={() => removeMedicine(medicine.id)}
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
                {generateCalendar(medicine).map(({ date, isTaken }) => (
                  <div
                    key={date}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm text-white cursor-pointer ${
                      isTaken ? "bg-green-500" : "bg-red-500"
                    } ${
                      isToday(new Date(date)) ? "border-2 border-blue-400" : ""
                    }`}
                    title={
                      isTaken
                        ? `Taken on ${format(new Date(date), "MMM d, yyyy")}`
                        : `Missed on ${format(new Date(date), "MMM d, yyyy")}`
                    }
                    onClick={() => markAsTaken(medicine.id, date)}
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
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          + Add Medicine
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>
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
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Ibuprofen"
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
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 200 mg"
              />
            </label>

            <label className="block mb-3 text-sm">
              Time
              <input
                type="time"
                value={customMedicine.time}
                onChange={(e) =>
                  setCustomMedicine({ ...customMedicine, time: e.target.value })
                }
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500"
              />
            </label>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
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
