"use client";

import { useState } from "react";
import Link from "next/link";

const dummyPosts = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: `Blog Post #${i + 1}`,
  slug: `blog-post-${i + 1}`,
  summary: `Summary for blog post #${i + 1}`,
  image: `https://source.unsplash.com/600x400/?health,${i}`,
  content: "Full content of blog post goes here...",
}));

export const blogPosts = dummyPosts;

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(dummyPosts.length / POSTS_PER_PAGE);
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = dummyPosts.slice(start, start + POSTS_PER_PAGE);

  const paginationRange = Array.from({ length: 5 }, (_, i) => {
    const page =
      currentPage <= 3 ? i + 1 : Math.min(totalPages - 4 + i, totalPages);
    return page;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-10">
        GlucoGuideHub Blog
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {currentPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {post.title}
              </h2>
              <p className="text-sm text-gray-600 mt-2 mb-4">{post.summary}</p>
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

      {/* Bottom Blog Links */}
      <div>
        <h2 className="text-xl font-bold text-gray-700 mb-4">Recent Posts</h2>
        <ul className="space-y-2 list-disc list-inside">
          {dummyPosts.slice(0, 6).map((post) => (
            <li key={post.id}>
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
