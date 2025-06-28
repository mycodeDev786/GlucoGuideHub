"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Import Storage functions
import { db, storage } from "../lib/firebaseConfig"; // Import db and storage
import { useRouter } from "next/navigation"; // Use next/navigation for App Router

export default function AddBlogPostPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // State for the selected file
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0); // For upload progress
  const router = useRouter();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    } else {
      setSelectedImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setUploadProgress(0);

    if (!title || !summary || !content || !selectedImage) {
      setMessage("Please fill in all required fields and select an image.");
      setLoading(false);
      return;
    }

    // Generate a slug from the title if not provided
    const generatedSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    try {
      // 1. Upload image to Firebase Storage
      const storageRef = ref(
        storage,
        `blog_images/${selectedImage.name}_${Date.now()}`
      ); // Unique filename
      const uploadTask = uploadBytesResumable(storageRef, selectedImage);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error("Error uploading image:", error);
          setMessage("Error uploading image: " + error.message);
          setLoading(false);
        },
        async () => {
          // Handle successful uploads on complete
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);

          // 2. Save post data (including image URL) to Firestore
          try {
            await addDoc(collection(db, "blogPosts"), {
              title,
              slug: generatedSlug,
              summary,
              image: downloadURL, // Save the Storage URL here
              content,
              createdAt: serverTimestamp(),
            });
            setMessage("Blog post added successfully!");
            setTitle("");
            setSlug("");
            setSummary("");
            setSelectedImage(null); // Clear selected image
            setContent("");
            setUploadProgress(0);
            router.push("/blog"); // Redirect to blog page
          } catch (firestoreError) {
            console.error(
              "Error adding document to Firestore: ",
              firestoreError
            );
            setMessage(
              "Error adding blog post to Firestore: " + firestoreError.message
            );
          } finally {
            setLoading(false);
          }
        }
      );
    } catch (overallError) {
      console.error("Overall submission error:", overallError);
      setMessage("An unexpected error occurred: " + overallError.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-10">
        Add New Blog Post
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md"
      >
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Title:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="slug"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Slug (URL path - auto-generated if empty):
          </label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) =>
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")
              )
            }
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Will be auto-generated from title if left empty"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="summary"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Summary:
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows="3"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label
            htmlFor="imageUpload"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Upload Image:
          </label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*" // Restrict to image files
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            required
          />
          {selectedImage && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {selectedImage.name}
            </p>
          )}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-xs text-center mt-1">
                {uploadProgress.toFixed(0)}% uploaded
              </p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="content"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Content:
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="10"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          ></textarea>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading
              ? uploadProgress > 0 && uploadProgress < 100
                ? `Uploading Image (${uploadProgress.toFixed(0)}%)...`
                : "Adding Post..."
              : "Add Post"}
          </button>
        </div>

        {message && (
          <p
            className={`mt-4 text-center ${
              message.includes("Error") ? "text-red-500" : "text-green-500"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
