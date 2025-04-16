"use client";

import { use } from "react";
import { blogPosts } from "../page";
import { notFound } from "next/navigation";

export default function BlogPostPage({ params }) {
  const resolvedParams = use(params); // ⬅️ unwrap the params Promise
  const post = blogPosts.find((p) => p.slug === resolvedParams.slug);

  if (!post) return notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">{post.title}</h1>
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-64 object-cover rounded-lg mb-6"
      />
      <p className="text-gray-700 text-lg leading-relaxed">{post.content}</p>
    </div>
  );
}
