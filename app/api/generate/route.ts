import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "60 s"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = await req.json();
    const { type, context } = body; 

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    let prompt = "";

    if (type === "rewrite") {
      prompt = `
        Act as a Professional Resume Writer.
        Rewrite the following resume summary to be more professional, impactful, and ATS-friendly.
        Target Job Description: ${context.jd}
        Current Summary: "${context.currentText}"
        
        Output: Just the rewritten paragraph. No intro text.
      `;
    } else if (type === "interview") {
      prompt = `
        Act as a Senior Technical Interviewer.
        Based on the Job Description and the Candidate's gaps, generate 3 specific technical interview questions and brief tips on how to answer them.
        
        Job Description: ${context.jd}
        Missing Skills: ${JSON.stringify(context.missingKeywords)}
        
        Output format (JSON Array):
        [
          { "question": "...", "tip": "..." },
          { "question": "...", "tip": "..." },
          { "question": "...", "tip": "..." }
        ]
        Return ONLY valid JSON.
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (type === "interview") {
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return NextResponse.json(JSON.parse(cleanText));
    }

    return NextResponse.json({ result: text });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}