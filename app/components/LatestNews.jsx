"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function LatestNewsClient() {
  const [newsItems, setNewsItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/rss")
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setNewsItems(data.items);
        } else {
          throw new Error("Invalid RSS response");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load latest news.");
      });
  }, []);

  return (
    <section className="bg-gradient-to-br from-white via-blue-100 to-cyan-100 py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
          Latest Diabetes News
        </h2>

        {error && <p className="text-center text-red-600 mb-4">{error}</p>}
        {newsItems.length === 0 && !error ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {newsItems.map((item, i) => (
              <div
                onClick={() => console.log(item.image)}
                key={item.link || i}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-xl transition duration-300"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{item.summary}</p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm mt-3 inline-block hover:underline"
                >
                  Read more →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
