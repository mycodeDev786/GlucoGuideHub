import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY; // Make sure to set this in your .env.local

if (!API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is not set in environment variables.");
  // You might want to return an immediate error response here instead of throwing
  // return NextResponse.json({ error: "Server configuration error: AI API key missing." }, { status: 500 });
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export async function POST(req) {
  console.log("API route /api/generate-blog-content received a request.");
  try {
    const { topic, keywords } = await req.json();
    console.log("Request body:", { topic, keywords });

    if (!topic) {
      console.warn("Topic is missing in the request.");
      return NextResponse.json(
        { error: "Topic is required." },
        { status: 400 }
      );
    }

    let prompt = `Generate a highly SEO-friendly blog post based on the following topic: "${topic}".`;
    if (keywords) {
      prompt += ` Include the following keywords for SEO: ${keywords}.`;
    }
    prompt += `
      The response should be structured as a JSON object with the following properties:
      {
        "title": "A compelling and SEO-optimized title (around 10-15 words)",
        "summary": "A concise and engaging summary for SEO (around 20-30 words)",
        "content": "A detailed and well-structured blog post content (at least 500 words, using Markdown for formatting like headings, paragraphs, bold, italics, lists, etc. Use appropriate headings (##, ###) and paragraphs for readability. The content should be informative, engaging, and naturally incorporate the keywords for SEO.",
        "seoKeywords": ["keyword1", "keyword2", "keyword3"]
      }
      `;
    console.log("Prompt sent to Gemini:", prompt);

    const result = await model.generateContent(prompt);
    console.log("Received response from Gemini.");
    const response = await result.response;
    const text = response.text();
    console.log("Raw AI response text:", text); // Log the raw text from AI

    let generatedContent;
    try {
      const cleanText = text.replace(/```json\n?|```/g, "").trim();
      generatedContent = JSON.parse(cleanText);
      console.log("Parsed AI generated content:", generatedContent);
    } catch (jsonError) {
      console.error("Failed to parse AI response as JSON:", jsonError);
      console.error("Raw AI response (failed parse):", text);
      return NextResponse.json(
        {
          error:
            "AI generated invalid JSON. Please try again or refine your prompt.",
          rawResponse: text,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(generatedContent, { status: 200 });
  } catch (error) {
    console.error("CRITICAL ERROR in /api/generate-blog-content:", error);
    // Log the full error object for more details
    if (error.response && error.response.status) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);
    }
    return NextResponse.json(
      {
        error: "Failed to generate blog content.",
        details: error.message,
        debugInfo: error.stack,
      }, // Include stack for local debugging
      { status: 500 }
    );
  }
}
