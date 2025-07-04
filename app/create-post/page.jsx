"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebaseConfig";
import { useRouter } from "next/navigation";

export default function AddBlogPostPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // AI Generation States
  const [aiTopic, setAiTopic] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  const router = useRouter();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    } else {
      setSelectedImage(null);
    }
  };

  const handleGenerateAIContent = async () => {
    setGeneratingAI(true);
    setAiMessage("");

    if (!aiTopic) {
      setAiMessage("Please enter a topic for AI generation.");
      setGeneratingAI(false);
      return;
    }

    try {
      const response = await fetch("/api/generate-blog-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: aiTopic, keywords: aiKeywords }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate AI content.");
      }

      // Populate the form fields with AI-generated content
      setTitle(data.title || "");
      setSummary(data.summary || "");
      setContent(data.content || "");
      // Optionally, you can set the slug or display the generated SEO keywords
      // setSlug(data.slug || ""); // If your AI generates a slug
      setAiMessage(
        "Content generated successfully! Please review and make any necessary edits."
      );
    } catch (error) {
      console.error("Error generating AI content:", error);
      setAiMessage(`Error generating content: ${error.message}`);
    } finally {
      setGeneratingAI(false);
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
      );
      const uploadTask = uploadBytesResumable(storageRef, selectedImage);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Error uploading image:", error);
          setMessage("Error uploading image: " + error.message);
          setLoading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);

          // 2. Save post data (including image URL) to Firestore
          try {
            await addDoc(collection(db, "blogPosts"), {
              title,
              slug: generatedSlug,
              summary,
              image: downloadURL,
              content,
              createdAt: serverTimestamp(),
            });
            setMessage("Blog post added successfully!");
            setTitle("");
            setSlug("");
            setSummary("");
            setSelectedImage(null);
            setContent("");
            setUploadProgress(0);
            setAiTopic(""); // Clear AI fields after successful submission
            setAiKeywords("");
            setAiMessage("");
            router.push("/blog");
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
        {/* AI Content Generation Section */}
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            Generate Content with AI
          </h2>
          <div className="mb-4">
            <label
              htmlFor="aiTopic"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Topic for AI Generation:
            </label>
            <input
              type="text"
              id="aiTopic"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., Benefits of Cloud Computing for Small Businesses"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="aiKeywords"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Optional SEO Keywords (comma-separated):
            </label>
            <input
              type="text"
              id="aiKeywords"
              value={aiKeywords}
              onChange={(e) => setAiKeywords(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., cloud security, cost savings, scalability"
            />
          </div>
          <button
            type="button"
            onClick={handleGenerateAIContent}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={generatingAI}
          >
            {generatingAI ? "Generating..." : "Generate AI Content"}
          </button>
          {aiMessage && (
            <p
              className={`mt-4 text-center ${
                aiMessage.includes("Error") ? "text-red-500" : "text-green-500"
              }`}
            >
              {aiMessage}
            </p>
          )}
        </div>

        {/* Existing Blog Post Form Fields */}
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
            accept="image/*"
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
