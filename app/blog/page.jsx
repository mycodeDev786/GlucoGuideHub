// BlogPage.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; // Make sure Link is imported
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebaseConfig"; // Adjust the path as needed

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, "blogPosts"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBlogPosts(postsData);
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        setError("Failed to load blog posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const totalPages = Math.ceil(blogPosts.length / POSTS_PER_PAGE);
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = blogPosts.slice(start, start + POSTS_PER_PAGE);

  const paginationRange = Array.from({ length: 5 }, (_, i) => {
    const page =
      currentPage <= 3
        ? i + 1
        : Math.min(totalPages - 4 + i, totalPages) > 0
        ? Math.min(totalPages - 4 + i, totalPages)
        : 1;
    return page;
  }).filter((page) => page <= totalPages);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center text-xl text-blue-700">
        Loading blog posts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center text-xl text-red-600">
        {error}
      </div>
    );
  }

  if (blogPosts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center text-xl text-gray-600">
        No blog posts available.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-10">
        All Posts
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {currentPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <img
              src={
                post.image ||
                "https://via.placeholder.com/600x400?text=No+Image"
              }
              alt={post.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {post.title}
              </h2>
              <p className="text-sm text-gray-600 mt-2 mb-4">{post.summary}</p>
              {/* THIS IS THE CRUCIAL PART FOR NAVIGATION */}
              <Link href={`/blog/${post.slug}`}>
                <span className="text-blue-600 hover:underline font-medium text-sm">
                  Read More →
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-16">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            Previous
          </button>

          {paginationRange.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Bottom Blog Links (Recent Posts) */}
      <div>
        <h2 className="text-xl font-bold text-gray-700 mb-4">Recent Posts</h2>
        <ul className="space-y-2 list-disc list-inside">
          {blogPosts.slice(0, 6).map((post) => (
            <li key={post.id}>
              {/* THIS IS ALSO IMPORTANT FOR NAVIGATION */}
              <Link
                href={`/blog/${post.slug}`}
                className="text-blue-600 hover:underline"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
