// components/EditProfileModal.js
"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebaseConfig"; // Ensure paths are correct
import { updateProfile } from "firebase/auth";
import { setProfileData } from "../store/profileSlice";
import { setUser } from "../store/authSlice";

const EditProfileModal = ({ isOpen, onClose, initialData }) => {
  const dispatch = useDispatch();
  const currentUser = auth.currentUser;
  const [formData, setFormData] = useState({
    displayName: initialData?.displayName || "",
    bio: initialData?.bio || "",
    occupation: initialData?.occupation || "",
    location: initialData?.location || "",
    socialLinks: initialData?.socialLinks || [], // Array of strings
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update form data when initialData changes (e.g., user logs in)
  useEffect(() => {
    setFormData({
      displayName: initialData?.displayName || "",
      bio: initialData?.bio || "",
      occupation: initialData?.occupation || "",
      location: initialData?.location || "",
      socialLinks: initialData?.socialLinks || [],
    });
    setError(null); // Clear any previous errors when modal opens
  }, [initialData, isOpen]); // Also depend on isOpen to reset on close/open

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSocialLinkChange = (e, index) => {
    const { value } = e.target;
    const newSocialLinks = [...formData.socialLinks];
    newSocialLinks[index] = value;
    setFormData({ ...formData, socialLinks: newSocialLinks });
  };

  const addSocialLink = () => {
    setFormData({ ...formData, socialLinks: [...formData.socialLinks, ""] });
  };

  const removeSocialLink = (index) => {
    const newSocialLinks = [...formData.socialLinks];
    newSocialLinks.splice(index, 1);
    setFormData({ ...formData, socialLinks: newSocialLinks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!currentUser) {
      setError("No authenticated user found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // 1. Update Firebase Auth display name (if changed)
      if (formData.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: formData.displayName });
        // Update Redux auth state with new display name
        dispatch(
          setUser({ ...currentUser, displayName: formData.displayName })
        );
      }

      // 2. Update Firestore custom profile data
      const userDocRef = doc(db, "users", currentUser.uid);
      // Filter out empty social links before saving
      const cleanedSocialLinks = formData.socialLinks.filter(
        (link) => link.trim() !== ""
      );

      await setDoc(
        userDocRef,
        {
          bio: formData.bio,
          occupation: formData.occupation,
          location: formData.location,
          socialLinks: cleanedSocialLinks,
          // Add other custom fields here
        },
        { merge: true }
      ); // Use merge to update existing fields without overwriting the whole document

      // 3. Dispatch action to update Redux profile state
      dispatch(
        setProfileData({ ...formData, socialLinks: cleanedSocialLinks })
      );

      onClose(); // Close the modal on success
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-xl relative animate-fade-in-down">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Display Name:
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your Full Name"
            />
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Bio:
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="occupation"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Occupation:
            </label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Software Engineer, Designer"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Location:
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., New York, USA"
            />
          </div>

          {/* Social Links Section */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Social Links:
            </label>
            {formData.socialLinks.map((link, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => handleSocialLinkChange(e, index)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  aria-label="Remove social link"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSocialLink}
              className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
            >
              Add Social Link
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
