// app/api/gi/route.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!geminiApiKey) {
  console.error("GOOGLE_GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(geminiApiKey || "");

// --- Debugging function to list available models ---

// Call this function once when the API route initializes

// --- End of debugging function ---

export async function POST(request) {
  const { food, prompt } = await request.json();

  if (!food || !prompt) {
    return NextResponse.json(
      { success: false, error: "Food name and prompt are required." },
      { status: 400 }
    );
  }

  if (!geminiApiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "Server configuration error: Gemini API key not set.",
      },
      { status: 500 }
    );
  }

  try {
    // IMPORTANT: Check your console output from `listAndLogAvailableModels`
    // and use a model listed that supports 'generateContent'.
    // 'gemini-pro' is a commonly available model for text generation.
    // If 'gemini-pro' gives 404, try 'gemini-1.5-flash-latest' or 'gemini-1.5-pro-latest' if available.
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    // Changed from gemini-1.0-pro

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("Raw Gemini response text:", text);

    if (!text.trim()) {
      return NextResponse.json(
        { success: false, error: "Gemini returned an empty response." },
        { status: 500 }
      );
    }

    let parsedResult;
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      let jsonString = text;

      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
        console.log("Extracted JSON string from code block:", jsonString);
      } else if (text.includes("{") && text.includes("}")) {
        const firstBrace = text.indexOf("{");
        const lastBrace = text.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonString = text.substring(firstBrace, lastBrace + 1);
          console.log("Extracted potential JSON string:", jsonString);
        }
      }

      parsedResult = JSON.parse(jsonString);
    } catch (jsonParseError) {
      console.error(
        "Failed to parse AI response as JSON:",
        text,
        jsonParseError
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to interpret AI response. It might not be valid JSON. Raw response snippet: " +
            text.substring(0, 200) +
            "...",
        },
        { status: 500 }
      );
    }

    if (
      parsedResult &&
      typeof parsedResult === "object" &&
      parsedResult.food !== undefined &&
      parsedResult.gi !== undefined &&
      parsedResult.calories !== undefined &&
      parsedResult.suitability !== undefined
    ) {
      return NextResponse.json({ success: true, result: parsedResult });
    } else {
      console.error(
        "AI returned unexpected JSON structure or missing keys:",
        parsedResult
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "AI response format was incorrect or missing data. Please try again.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Error processing your request with Gemini. Please try again. (Details in server logs)",
      },
      { status: 500 }
    );
  }
}
