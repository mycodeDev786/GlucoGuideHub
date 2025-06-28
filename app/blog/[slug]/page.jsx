// app/blog/[slug]/page.js
// This is a Server Component by default in Next.js App Router.
// No "use client" needed unless you add client-side interactivity.

import { notFound } from "next/navigation"; // For showing 404
import { getBlogPostBySlug } from "../../lib/firebaseUtils"; // Adjust the path as needed

// --- Metadata for SEO (Optional but Recommended) ---
export async function generateMetadata({ params }) {
  const slug = params.slug;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.summary,
    // Add other meta tags for social media, etc.
    // openGraph: {
    //   images: [post.image],
    // },
    // twitter: {
    //   card: 'summary_large_image',
    //   title: post.title,
    //   description: post.summary,
    //   images: [post.image],
    // },
  };
}

// --- Main Blog Post Detail Component ---
export default async function BlogPostPage({ params }) {
  const slug = params.slug; // Get the slug directly from params

  const post = await getBlogPostBySlug(slug); // Fetch the specific post from Firebase

  // If no post is found, show the Next.js 404 page
  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">{post.title}</h1>
      <img
        src={post.image || "https://via.placeholder.com/800x600?text=No+Image"} // Fallback image
        alt={post.title}
        className="w-full h-96 object-cover rounded-lg mb-6"
      />
      {/*
        Using a div with 'prose' class from @tailwindcss/typography plugin
        to style the raw content. If content contains HTML/Markdown,
        you might need a library like 'react-markdown' or 'dangerouslySetInnerHTML'.
      */}
      <div className="prose max-w-none text-lg text-gray-700 leading-relaxed">
        {post.content}
      </div>

      {post.createdAt &&
        post.createdAt.toDate && ( // Check if createdAt and toDate() exist
          <p className="text-sm text-gray-500 mt-6">
            Published on:{" "}
            {new Date(post.createdAt.toDate()).toLocaleDateString()}
          </p>
        )}
      {/* You can add a "Go Back" button or other navigation here */}
    </div>
  );
}
