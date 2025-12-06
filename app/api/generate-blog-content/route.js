import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: API key missing." },
        { status: 500 }
      );
    }

    const { topic, keywords } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required." },
        { status: 400 }
      );
    }

    let prompt = `Generate a highly SEO-friendly blog post based on the topic: "${topic}".`;

    if (keywords) {
      prompt += ` Include these SEO keywords: ${keywords}.`;
    }

    prompt += `
Return the response strictly as valid JSON in this format:
{
  "title": "",
  "summary": "",
  "content": "",
  "seoKeywords": []
}
`;

    console.log("Prompt sent to Gemini:", prompt);

    // ✅✅✅ EXACT WORKING MODEL FROM YOUR PROJECT
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
        {
          error: "Gemini API failed",
          details: data,
        },
        { status: 500 }
      );
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("Raw AI response:", text);

    const cleanText = text.replace(/```json|```/g, "").trim();
    const generatedContent = JSON.parse(cleanText);

    return NextResponse.json(generatedContent, { status: 200 });
  } catch (error) {
    console.error("Gemini API Fatal Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate blog content.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
