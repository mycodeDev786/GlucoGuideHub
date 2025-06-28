"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react"; // For the error message close button
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  serverTimestamp,
  arrayUnion, // To add elements to an array field (replies)
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../lib/firebaseConfig"; // Import 'db' and 'auth'

export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [activePost, setActivePost] = useState(null); // ID of the post being replied to
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // State to store the authenticated user

  // --- Authentication Listener and Data Fetching ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(true); // Reset loading state when auth state changes
      setError(null); // Clear any previous errors

      // Fetch forum posts (visible to all, but only authenticated can post/reply)
      // Ordering by 'createdAt' in descending order to show newest posts first
      const q = query(
        collection(db, "forumPosts"),
        orderBy("createdAt", "desc")
      );

      const unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const postsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPosts(postsData);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching forum posts:", err);
          setError("Failed to load forum posts. Please try again.");
          setLoading(false);
        }
      );
      return () => unsubscribeFirestore(); // Cleanup Firestore listener
    });

    return () => unsubscribeAuth(); // Cleanup Auth listener
  }, []);

  // --- Firebase Data Operations ---

  const handlePostQuestion = async () => {
    if (!user) {
      setError("You must be logged in to post a question.");
      return;
    }
    if (!newQuestion.trim()) {
      setError("Question cannot be empty.");
      return;
    }

    try {
      await addDoc(collection(db, "forumPosts"), {
        author: user.isAnonymous ? "Guest User" : user.email || "Unknown User", // Get user's name
        question: newQuestion,
        replies: [], // Initialize replies as an empty array
        createdAt: serverTimestamp(), // Add timestamp for ordering
        userId: user.uid, // Store user ID for potential moderation/ownership
      });
      setNewQuestion("");
      setError(null);
    } catch (e) {
      console.error("Error posting question: ", e);
      setError("Failed to post question. Please try again.");
    }
  };

  const handleAddReply = async (postId) => {
    if (!user) {
      setError("You must be logged in to reply.");
      return;
    }
    if (!replyText.trim()) {
      setError("Reply cannot be empty.");
      return;
    }

    try {
      const postRef = doc(db, "forumPosts", postId);
      await updateDoc(postRef, {
        replies: arrayUnion({
          author: user.isAnonymous
            ? "Guest User"
            : user.email || "Unknown User",
          content: replyText,
          createdAt: serverTimestamp(), // Timestamp for individual reply
          userId: user.uid,
        }),
      });
      setReplyText("");
      setActivePost(null); // Close the reply box
      setError(null);
    } catch (e) {
      console.error("Error adding reply: ", e);
      setError("Failed to add reply. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-blue-700 text-xl">
        Loading forum...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-800 text-center">
        Community Forum
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
            Please log in to participate in the forum (post questions and
            replies).
          </p>
          {/* You might add a link/button to your login page here */}
        </div>
      ) : (
        <>
          {/* Ask a Question */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Write your question here..."
              className="w-full border rounded p-3 mb-4 focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
            <button
              onClick={handlePostQuestion}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Post Question
            </button>
          </div>

          {/* Forum Posts */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <p className="text-center text-gray-600 text-lg">
                No forum posts yet. Be the first to ask a question!
              </p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow p-5 border"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {post.question}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Posted by {post.author} on{" "}
                    {post.createdAt?.toDate().toLocaleString() || "N/A"}
                  </p>

                  {/* Replies */}
                  {post.replies && post.replies.length > 0 && (
                    <div className="ml-4 border-l pl-4 mt-3 space-y-2">
                      {post.replies
                        .sort(
                          (a, b) =>
                            a.createdAt?.toMillis() - b.createdAt?.toMillis()
                        ) // Sort replies by time
                        .map((reply, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded">
                            {" "}
                            {/* Using index as key might be okay for replies as they are static once fetched */}
                            <p className="text-sm">
                              <span className="font-medium text-gray-700">
                                {reply.author}:
                              </span>{" "}
                              {reply.content}
                            </p>
                            <p className="text-xs text-gray-400">
                              {reply.createdAt?.toDate().toLocaleString() ||
                                "N/A"}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Reply Box */}
                  {activePost === post.id ? (
                    <div className="mt-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full border rounded p-2 focus:border-blue-500 focus:ring-blue-500"
                        rows={2}
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleAddReply(post.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => {
                            setActivePost(null);
                            setReplyText(""); // Clear reply text on cancel
                          }}
                          className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActivePost(post.id)}
                      className="mt-3 text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    >
                      Reply
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
