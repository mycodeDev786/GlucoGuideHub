"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { assets } from "../assets/assets";
import Image from "next/image";

const slides = [
  {
    image: assets.c1,
    alt: "Healthy Meal",
    title: "Eat Smart, Live Well",
    description: "Discover diabetic-friendly meals that are tasty and healthy.",
  },
  {
    image: assets.c2,
    alt: "Exercise Tips",
    title: "Stay Active Daily",
    description: "Gentle exercises can help manage your blood sugar levels.",
  },
  {
    image: assets.c3,
    alt: "Doctor Advice",
    title: "Expert Guidance",
    description:
      "Stay informed with tips and advice from healthcare professionals.",
  },
];

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
      {/* HERO SECTION with Gradient */}
      <section className="relative overflow-hidden text-center py-24 px-6 bg-gradient-to-br from-[#0f172a] via-blue-600 to-cyan-500 text-white shadow-2xl rounded-b-3xl">
        {/* Decorative blur background */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-cyan-400 opacity-20 rounded-full blur-3xl z-0"></div>

        {/* Hero Image */}
        <div className="absolute top-6 right-6 w-32 md:w-60 opacity-40 pointer-events-none z-0">
          <Image
            src={assets.hero} // Make sure it's correctly imported
            alt="Diabetes Care"
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6 drop-shadow-2xl">
            Empowering Your Diabetes Journey
          </h1>
          <p className="text-lg md:text-xl mb-8 font-light">
            Smart tools for sugar tracking, personalized meal planning & timely
            medicine reminders.
          </p>

          <a
            href="/meal-planner"
            className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-full shadow-lg hover:bg-yellow-400 hover:text-black transform hover:scale-105 transition duration-300"
          >
            Get Started
          </a>
        </div>
      </section>

      {/* CAROUSEL SECTION */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">
          Inspiration & Wellness
        </h2>
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          loop
          className="rounded-2xl overflow-hidden shadow-xl"
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={idx}>
              <div className="relative w-full h-72 md:h-[400px]">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  className="object-cover"
                  fill
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-6 md:p-12 text-white">
                  <h2 className="text-2xl md:text-4xl font-bold">
                    {slide.title}
                  </h2>
                  <p className="mt-2 text-sm md:text-lg">{slide.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* FEATURE SECTION */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-8">
            Our Core Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl shadow hover:shadow-xl transition">
              <h3 className="font-semibold text-lg mb-2">
                Personalized Meal Plans
              </h3>
              <p className="text-sm text-gray-700">
                Tailor your diet with healthy, diabetes-friendly recipes based
                on your needs.
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl shadow hover:shadow-xl transition">
              <h3 className="font-semibold text-lg mb-2">
                Smart Medicine Reminders
              </h3>
              <p className="text-sm text-gray-700">
                Never miss a dose—get timely alerts and track your medications
                easily.
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl shadow hover:shadow-xl transition">
              <h3 className="font-semibold text-lg mb-2">
                Real-Time Sugar Tracking
              </h3>
              <p className="text-sm text-gray-700">
                Log and monitor your blood sugar levels to stay on top of your
                health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
      <section className="bg-gradient-to-br from-cyan-100 to-blue-100 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-10">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <p className="text-sm text-gray-600 italic">
                “GlucoGuideHub helped me take control of my diet and medication.
                It's a life saver!”
              </p>
              <h4 className="font-semibold text-blue-700 mt-4">
                — Fatima A., Oman
              </h4>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <p className="text-sm text-gray-600 italic">
                “Tracking my sugar levels has never been easier. I love the
                reminders!”
              </p>
              <h4 className="font-semibold text-blue-700 mt-4">
                — Ali M., Muscat
              </h4>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST NEWS with Gradient Background */}
      <section className="bg-gradient-to-br from-white via-blue-100 to-cyan-100 py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
            Latest Diabetes News
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-xl transition duration-300"
              >
                <h3 className="text-lg font-semibold mb-2">
                  News Title #{i + 1}
                </h3>
                <p className="text-sm text-gray-600">
                  Short summary of the article. This section will auto-update
                  from RSS feed.
                </p>
                <a
                  href="#"
                  className="text-blue-600 text-sm mt-3 inline-block hover:underline"
                >
                  Read more →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
