// components/PhotoUploadComponent.js
"use client";

import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { storage, auth, db } from "../lib/firebaseConfig"; // Ensure paths are correct
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore"; // Import updateDoc for Firestore if needed
import { setUser } from "../store/authSlice";
import Loader from "./Loader"; // Assuming you have a Loader component as per your login page

const PhotoUploadComponent = ({ userId }) => {
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!userId) {
      setError("User ID is missing. Cannot upload photo.");
      return;
    }

    setUploading(true);
    setError(null);

    const storageRef = ref(storage, `profile_pictures/${userId}/${file.name}`);

    try {
      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(snapshot.ref);

      // Update Firebase Auth profile photoURL
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === userId) {
        await updateProfile(currentUser, { photoURL });
        // Update Redux auth state
        dispatch(setUser({ ...currentUser, photoURL }));
      } else {
        // This case might occur if the user somehow gets unauthenticated during upload
        console.warn(
          "User not authenticated or UID mismatch during photo update."
        );
        setError("Authentication error. Please log in again.");
      }

      // Optionally, if you also store photoURL in Firestore profile data, update it here
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { photoURL }); // Update Firestore profile data as well

      console.log("Profile photo updated successfully!");
    } catch (err) {
      console.error("Error uploading photo:", err);
      setError(`Failed to upload photo: ${err.message}`);
    } finally {
      setUploading(false);
      // Clear the file input after upload attempt
      e.target.value = null;
    }
  };

  return (
    <div className="absolute inset-0 flex items-end justify-center pb-2 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        id="profile-photo-upload"
      />
      <label
        htmlFor="profile-photo-upload"
        className="cursor-pointer bg-white text-gray-800 p-2 rounded-full shadow-md hover:bg-gray-200 transition-colors flex items-center space-x-2"
        title="Upload new profile photo"
      >
        {uploading ? (
          <Loader isLoading={true} size={4} /> // Small loader for the button
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.625A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.625A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
        <span className="text-sm">
          {uploading ? "Uploading..." : "Change Photo"}
        </span>
      </label>
      {error && (
        <p className="absolute -bottom-8 text-red-400 text-sm bg-black bg-opacity-70 px-2 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
};

export default PhotoUploadComponent;
