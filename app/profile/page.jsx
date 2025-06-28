// pages/profile.js
"use client"; // This is important for using hooks

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation"; // Use next/navigation for app directory
import { useEffect, useState } from "react";
import Image from "next/image";
import EditProfileModal from "../components/EditProfileModal";
import PhotoUploadComponent from "../components/PhotoUploadComponent"; // Create this component

const ProfilePage = () => {
  const {
    user,
    loading: authLoading,
    isAuthenticated,
  } = useSelector((state) => state.auth);
  const { profileData, loading: profileLoading } = useSelector(
    (state) => state.profile
  );
  const router = useRouter();
  const dispatch = useDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login"); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Your Professional Profile
        </h1>

        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-500 shadow-md">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt="Profile Picture"
                layout="fill"
                objectFit="cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-6xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A9.957 9.957 0 0112 15c2.44 0 4.707.962 6.357 2.534m-3.418-3.418c.036-.073.065-.15.09-.232a9.956 9.956 0 00-6.196 0c.025.082.054.159.09.232l-.004-.004zM12 12a4 4 0 100-8 4 4 0 000 8z"
                  />
                </svg>
              </div>
            )}
            <PhotoUploadComponent userId={user.uid} />
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-900">
              {user.displayName || "Set your Display Name"}
            </h2>
            <p className="text-gray-600">{user.email}</p>
            {user.emailVerified ? (
              <span className="text-green-500 text-sm flex items-center justify-center md:justify-start mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Email Verified
              </span>
            ) : (
              <span className="text-red-500 text-sm flex items-center justify-center md:justify-start mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.542 2.545-1.542 3.31 0l3.099 6.273a2 2 0 01-1.745 2.871h-6.196a2 2 0 01-1.745-2.871l3.099-6.273zM12 15a1 1 0 11-2 0 1 1 0 012 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Email Not Verified (
                <button
                  className="underline"
                  onClick={() => {
                    /* send verification email */
                  }}
                >
                  Send Again
                </button>
                )
              </span>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
            Personal Information
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="ml-4 px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
            >
              Edit
            </button>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-md shadow-sm">
              <p className="text-gray-700 font-medium">Bio:</p>
              <p className="text-gray-600">
                {profileData?.bio || "Add your professional bio."}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md shadow-sm">
              <p className="text-gray-700 font-medium">Occupation:</p>
              <p className="text-gray-600">
                {profileData?.occupation || "Specify your occupation."}
              </p>
            </div>
            {/* Add more profile fields as needed */}
            <div className="bg-gray-50 p-4 rounded-md shadow-sm">
              <p className="text-gray-700 font-medium">Location:</p>
              <p className="text-gray-600">
                {profileData?.location || "Where are you based?"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md shadow-sm">
              <p className="text-gray-700 font-medium">Social Links:</p>
              {profileData?.socialLinks?.length > 0 ? (
                <ul className="list-disc list-inside text-gray-600">
                  {profileData.socialLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">Add your social media links.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{ ...user, ...profileData }} // Combine user and profile data
      />
    </div>
  );
};

export default ProfilePage;
