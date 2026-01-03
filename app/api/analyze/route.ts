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
  limiter: Ratelimit.slidingWindow(2, "60 s"), 
  analytics: true,
});

export async function POST(req: NextRequest) {
  try {
    
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File;
    const jd = formData.get("jd") as string;

    if (!file || !jd) {
      return NextResponse.json({ error: "Missing file or JD" }, { status: 400 });
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a Senior Technical Recruiter and ATS Expert.
      
      JOB DESCRIPTION:
      ${jd}

      TASK:
      Perform a deep-dive analysis of the attached PDF resume against the job description.
      
      CRITICAL INSTRUCTION: 
      Respond ONLY with a valid JSON object. No markdown. No intro text.
      
      ANALYSIS GUIDELINES:
      1. Be strict but constructive.
      2. Distinguish between missing hard skills (tech) and soft skills.
      3. Check formatting (is it readable? professional?).
      4. Look for "Impact" - does the candidate use numbers/metrics or just generic descriptions?
      
      JSON SCHEMA:
      {
        "score": number (0-100),
        "matchLevel": "Low" | "Medium" | "High",
        "candidateLevel": "Junior" | "Mid-Level" | "Senior" | "Lead",
        "estimatedSalaryRange": "string (e.g., 'PHP 30k - 50k' or '$60k - $80k' based on location/context)",
        "breakdown": {
            "skillsMatch": number (0-100),
            "experienceMatch": number (0-100),
            "formatting": number (0-100)
        },
        "missingKeywords": {
            "hardSkills": ["tool1", "language1"],
            "softSkills": ["communication", "leadership"]
        },
        "redFlags": ["typo in header", "employment gap without explanation", "generic summary"],
        "actionPlan": [
            "Specific advice 1",
            "Specific advice 2"
        ],
        "summaryProfile": "A 1-sentence summary of who this candidate seems to be."
      }
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Data
        }
      },
      { text: prompt }
    ]);

    const response = await result.response;
    const text = response.text();

    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", e);
      return NextResponse.json({ error: "AI response error" }, { status: 500 });
    }

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error("Error processing resume:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}