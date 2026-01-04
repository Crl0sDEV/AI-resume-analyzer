# 🎯 ATS Radar

![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**ATS Radar** is a resume optimization tool I built to help job seekers get past the bots. Instead of guessing keywords, this app uses **Google Gemini 2.5 Flash** to "read" PDF resumes just like a human recruiter would, comparing them against specific job descriptions to provide a match score and actionable feedback.

🔗 **Live Demo:** [https://ats-radar.vercel.app](https://ats-radar.vercel.app)  
👨‍💻 **Portfolio:** [Carlos Miguel Sandrino](https://carlos-miguel-sandrino-portfolio.vercel.app/)

---

## 📸 Snapshot

![App Screenshot](/public/screenshot.png)
*(Note: Project screenshot)*

---

## 💡 Why I Built This & Features

Most resume parsers are brittle—they break on complex layouts. I wanted to build something smarter.

- **Multimodal Analysis:** I'm not using standard text parsers (like `pdf-parse`) that mess up formatting. I'm sending the **PDF binary directly to Gemini 2.5 Flash**. This means the AI "sees" the layout, columns, and design.
- **Real-time Scoring:** Gives a harsh but fair 0-100 score based on hard skills, soft skills, and impact (metrics).
- **Interactive Fixes:**
  - **Magic Rewrite:** Uses GenAI to rewrite weak summaries into professional ones.
  - **Interview Prep:** Automatically generates technical interview questions based on the gaps found in the resume.
- **Developer Experience:** Added **Dark Mode**, Confetti effects for high scores, and local history so you don't lose your previous scans.

---

## 🛠️ Tech Stack

I chose this stack to focus on performance and modern React patterns.

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict typing)
- **Styling:** Tailwind CSS + Shadcn UI (Radix Primitives)
- **AI Engine:** Google Gemini API (gemini-2.5-flash)
- **Rate Limiting:** Upstash Redis (Serverless)
- **Deployment:** Vercel

---

## 🚀 How to Run Locally

If you want to clone and tweak this project, here's how:

### 1. Clone the repo
```bash
git clone [https://github.com/Crl0sDEV/AI-resume-analyzer.git](https://github.com/Crl0sDEV/AI-resume-analyzer.git)
cd AI-resume-analyzer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env.local` file in the root. You'll need free API keys from Google and Upstash.

```env
# Get this from Google AI Studio (Free Tier)
GEMINI_API_KEY=your_gemini_key_here

# Get this from Upstash Console (For Rate Limiting)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see it in action.

---

## 📂 Project Structure

A quick look at how I organized the code:

```bash
├── app/
│   ├── api/            # Serverless functions (Analyze PDF, Generate Content)
│   ├── page.tsx        # The main UI logic and state management
│   └── layout.tsx      # Theme provider setup
├── components/         # Shadcn UI components (Buttons, Cards, Tabs)
├── lib/                # Utils and helpers
├── types/              # TS Interfaces (AnalysisResult, InterviewQuestion)
└── public/             # Assets and sample PDF for demo mode
```

---

## 🛡️ Rate Limiting

Since this uses a powerful LLM, I implemented a sliding window rate limit to protect the API key.
- **Provider:** Upstash Redis
- **Limit:** 3 requests per 60 seconds (per IP)

---

## 👤 Author

Built by **Carlos Miguel Sandrino**.

- **Portfolio:** [carlos-miguel-sandrino-portfolio.vercel.app](https://carlos-miguel-sandrino-portfolio.vercel.app/)
- **GitHub:** [@Crl0sDEV](https://github.com/Crl0sDEV)

---

*This project is for educational and portfolio purposes.*
