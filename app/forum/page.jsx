"use client";

import { useState } from "react";

const initialPosts = [
  {
    id: 1,
    author: "Sarah",
    question: "What is a good sugar level after meals?",
    replies: [
      {
        id: 1,
        author: "Dr. Ahmed",
        content: "It should generally be under 180 mg/dL.",
      },
    ],
  },
  {
    id: 2,
    author: "John",
    question: "Is walking effective to control sugar levels?",
    replies: [
      {
        id: 1,
        author: "Nurse Lily",
        content: "Absolutely! 30 min walk helps regulate sugar.",
      },
      { id: 2, author: "Ali", content: "I walk daily and it helps me a lot!" },
    ],
  },
];

export default function ForumPage() {
  const [posts, setPosts] = useState(initialPosts);
  const [newQuestion, setNewQuestion] = useState("");
  const [activePost, setActivePost] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handlePostQuestion = () => {
    if (!newQuestion.trim()) return;

    const newPost = {
      id: posts.length + 1,
      author: "You",
      question: newQuestion,
      replies: [],
    };

    setPosts([newPost, ...posts]);
    setNewQuestion("");
  };

  const handleAddReply = (postId) => {
    if (!replyText.trim()) return;

    const updated = posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            replies: [
              ...post.replies,
              {
                id: post.replies.length + 1,
                author: "You",
                content: replyText,
              },
            ],
          }
        : post
    );

    setPosts(updated);
    setReplyText("");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-800 text-center">
        Community Forum
      </h1>

      {/* Ask a Question */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Write your question here..."
          className="w-full border rounded p-3 mb-4"
          rows={3}
        />
        <button
          onClick={handlePostQuestion}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Post Question
        </button>
      </div>

      {/* Forum Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow p-5 border">
            <h3 className="text-lg font-semibold text-gray-800">
              {post.question}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Posted by {post.author}
            </p>

            {/* Replies */}
            {post.replies.length > 0 && (
              <div className="ml-4 border-l pl-4 mt-3 space-y-2">
                {post.replies.map((reply) => (
                  <div key={reply.id} className="bg-gray-50 p-2 rounded">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">
                        {reply.author}:
                      </span>{" "}
                      {reply.content}
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
                  className="w-full border rounded p-2"
                  rows={2}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleAddReply(post.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => setActivePost(null)}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActivePost(post.id)}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                Reply
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
