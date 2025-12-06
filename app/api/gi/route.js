import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

    if (!API_KEY) {
      console.error("GOOGLE_GEMINI_API_KEY is not set.");
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error: API key missing.",
        },
        { status: 500 }
      );
    }

    const { food, prompt } = await request.json();

    if (!food || !prompt) {
      return NextResponse.json(
        { success: false, error: "Food name and prompt are required." },
        { status: 400 }
      );
    }

    console.log("GI Prompt sent to Gemini:", prompt);

    // ✅✅✅ VERIFIED WORKING MODEL FROM YOUR ACCOUNT
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
        API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API raw error:", data);
      return NextResponse.json(
        { success: false, error: "Gemini API failed.", details: data },
        { status: 500 }
      );
    }

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("Raw Gemini response text:", text);

    if (!text.trim()) {
      return NextResponse.json(
        { success: false, error: "Gemini returned an empty response." },
        { status: 500 }
      );
    }

    // ✅✅✅ CLEAN & PARSE JSON
    let parsedResult;
    try {
      text = text.replace(/```json|```/g, "").trim();
      parsedResult = JSON.parse(text);
    } catch (jsonParseError) {
      console.error("Failed to parse AI response as JSON:", text);
      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to interpret AI response as JSON. Raw response: " +
            text.substring(0, 200),
        },
        { status: 500 }
      );
    }

    // ✅✅✅ STRUCTURE VALIDATION
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
      console.error("Invalid JSON structure from AI:", parsedResult);
      return NextResponse.json(
        {
          success: false,
          error: "AI response format incorrect or missing required fields.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Fatal Gemini API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error processing your request with Gemini. Please try again.",
      },
      { status: 500 }
    );
  }
}
