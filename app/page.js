"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { assets } from "../assets/assets";
import Image from "next/image";
import HeroSection from "./components/HeroSection";
import LatestNews from "./components/LatestNews";

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
    <div className="bg-gradient-to-br from-[#CE9FFC] via-white to-[#7367F0] min-h-screen">
      {/* HERO SECTION with Gradient */}
      <HeroSection />

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
                It&apos;s a life saver!”
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

      <LatestNews />
    </div>
  );
}
