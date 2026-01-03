"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Upload, CheckCircle, AlertTriangle, Lightbulb, 
  TrendingUp, History, Trash2, Wand2, Briefcase, 
  DollarSign, MessageSquare 
} from "lucide-react"; 
import confetti from "canvas-confetti";
import type { AnalysisResult, InterviewQuestion } from "@/types";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const [rewriting, setRewriting] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("resumeHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPdfPreviewUrl(url);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 9999,
      colors: ['#22c55e', '#3b82f6', '#f59e0b']
    });
  };

  const handleAnalyze = async () => {
    if (!file || !jd) return;
    
    setLoading(true);
    setResult(null);
    setInterviewQuestions([]); 

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jd", jd);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (response.status === 429) {
        alert("You have reached the free limit. Please try again in 60 seconds.");
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error("Failed to analyze");

      const data: AnalysisResult = await response.json();
      setResult(data);

      if (data.score >= 80) {
        triggerConfetti();
      }

      const newHistory = [data, ...history].slice(0, 3);
      setHistory(newHistory);
      localStorage.setItem("resumeHistory", JSON.stringify(newHistory));

    } catch (error) {
      console.error("Analysis Error:", error);
      alert("Something went wrong analyzing the resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {

    const sampleJd = `We are looking for a Senior React Developer with experience in Next.js, Tailwind CSS, and TypeScript. 
    The candidate should have strong knowledge of state management, API integration, and performance optimization. 
    Bonus points for AWS and CI/CD experience.`;
    
    setJd(sampleJd);
    setLoading(true);

    try {
     
      const response = await fetch("/sample-resume.pdf");
      if (!response.ok) throw new Error("Sample resume not found in public folder");
      
      const blob = await response.blob();
      const demoFile = new File([blob], "sample-resume.pdf", { type: "application/pdf" });

      setFile(demoFile);
      setPdfPreviewUrl(URL.createObjectURL(demoFile));

      const formData = new FormData();
      formData.append("resume", demoFile);
      formData.append("jd", sampleJd);

      const apiRes = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (apiRes.status === 429) {
        alert("Rate limit reached. Please wait.");
        setLoading(false);
        return;
      }

      if (!apiRes.ok) throw new Error("Demo analysis failed");

      const data = await apiRes.json();
      setResult(data);

      if (data.score >= 80) {
        triggerConfetti();
      }
      
      const newHistory = [data, ...history].slice(0, 3);
      setHistory(newHistory);
      localStorage.setItem("resumeHistory", JSON.stringify(newHistory));

    } catch (error) {
      console.error("Demo Error:", error);
      alert("Failed to load demo. Make sure sample-resume.pdf is in public folder.");
    } finally {
      setLoading(false);
    }
  };

  const handleRewriteSummary = async () => {
    if (!result) return;
    setRewriting(true);
    try {
        const res = await fetch("/api/generate", {
            method: "POST",
            body: JSON.stringify({
                type: "rewrite",
                context: { jd: jd, currentText: result.summaryProfile }
            })
        });
        const data = await res.json();
        setResult({ ...result, summaryProfile: data.result });
    } catch (error) {
        console.error("Rewrite Error:", error);
        alert("Failed to rewrite summary.");
    } finally {
        setRewriting(false);
    }
  };

  const handleGenerateInterview = async () => {
    if (!result) return;
    setInterviewLoading(true);
    try {
        const res = await fetch("/api/generate", {
            method: "POST",
            body: JSON.stringify({
                type: "interview",
                context: { jd: jd, missingKeywords: result.missingKeywords.hardSkills }
            })
        });
        const data = await res.json();
        setInterviewQuestions(data);
    } catch (error) {
        console.error("Interview Gen Error:", error);
        alert("Failed to generate questions.");
    } finally {
        setInterviewLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("resumeHistory");
  };

  const loadFromHistory = (item: AnalysisResult) => {
    setResult(item);
    setPdfPreviewUrl(null); 
    setInterviewQuestions([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 flex flex-col">
      <div className="max-w-7xl mx-auto space-y-8 grow w-full">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ATS Radar
          </h1>
          <p className="text-slate-500 font-medium">
            AI-Powered Resume Optimization & Analytics
          </p>
        </div>

        {/* --- MAIN LAYOUT (GRID) --- */}
        <div className={`grid gap-8 ${result ? 'lg:grid-cols-2' : 'max-w-3xl mx-auto'}`}>

          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* Upload Card */}
            <Card className={result ? "h-fit" : ""}>
              <CardHeader>
                <CardTitle>{result ? "New Analysis" : "Upload Details"}</CardTitle>
                <CardDescription>Target Job & Resume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jd">Job Description</Label>
                  <Textarea 
                    id="jd" 
                    placeholder="Paste the job description here..." 
                    className="h-32 resize-none"
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume (PDF)</Label>
                  <Input 
                    id="resume" 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer file:text-blue-600 file:font-semibold"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  className="w-full bg-slate-900 hover:bg-slate-800" 
                  onClick={handleAnalyze} 
                  disabled={!file || !jd || loading}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Upload className="mr-2 h-4 w-4" /> Analyze Resume</>
                  )}
                </Button>

                {/* DEMO BUTTON */}
                {!result && !loading && (
                    <Button 
                        variant="ghost" 
                        className="w-full text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        onClick={handleDemo}
                    >
                        No resume? Try Sample Analysis
                    </Button>
                )}
              </CardFooter>
            </Card>

            {/* PDF PREVIEWER */}
            {result && pdfPreviewUrl && (
              <Card className="hidden lg:block overflow-hidden border-slate-300 shadow-md h-150">
                 <div className="bg-slate-100 p-2 border-b flex justify-between items-center px-4">
                    <span className="text-sm font-semibold text-slate-600">Document Preview</span>
                 </div>
                 <iframe 
                    src={pdfPreviewUrl} 
                    className="w-full h-full" 
                    title="Resume Preview"
                 />
              </Card>
            )}

            {/* HISTORY SECTION */}
            {history.length > 0 && (
              <Card className="bg-white/50 border-slate-200">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-500" /> Recent Scans
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearHistory} className="text-red-400 hover:text-red-600 h-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {history.map((item, i) => (
                      <div 
                        key={i} 
                        onClick={() => loadFromHistory(item)}
                        className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex flex-col">
                           <span className="font-medium text-sm truncate max-w-50">{item.summaryProfile.substring(0, 40)}...</span>
                           <span className="text-xs text-slate-400">Score: {item.score}/100</span>
                        </div>
                        <Badge variant={item.matchLevel === "High" ? "default" : "secondary"}>
                          {item.matchLevel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN: Results Dashboard */}
          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* CANDIDATE LEVEL & SALARY */}
              <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-indigo-50 border-indigo-100 flex items-center p-4 gap-4">
                      <div className="p-3 bg-indigo-100 rounded-full"><Briefcase className="w-6 h-6 text-indigo-600" /></div>
                      <div>
                          <p className="text-xs text-indigo-600 font-bold uppercase">Candidate Level</p>
                          <p className="font-bold text-slate-800 text-sm md:text-base">{result.candidateLevel || "N/A"}</p>
                      </div>
                  </Card>
                  <Card className="bg-emerald-50 border-emerald-100 flex items-center p-4 gap-4">
                      <div className="p-3 bg-emerald-100 rounded-full"><DollarSign className="w-6 h-6 text-emerald-600" /></div>
                      <div>
                          <p className="text-xs text-emerald-600 font-bold uppercase">Est. Salary</p>
                          <p className="font-bold text-slate-800 text-sm md:text-base">{result.estimatedSalaryRange || "N/A"}</p>
                      </div>
                  </Card>
              </div>

              {/* TABS SECTION */}
              <Tabs defaultValue="analysis" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="analysis">Analysis & Fixes</TabsTrigger>
                      <TabsTrigger value="interview">Interview Prep</TabsTrigger>
                  </TabsList>

                  {/* TAB 1: MAIN ANALYSIS */}
                  <TabsContent value="analysis" className="space-y-6 mt-4">
                      
                      {/* Summary */}
                      <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                            <Lightbulb className="w-5 h-5" /> Executive Summary
                          </CardTitle>
                          <Button size="sm" variant="outline" className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 h-8 text-xs" onClick={handleRewriteSummary} disabled={rewriting}>
                              {rewriting ? <Loader2 className="w-3 h-3 animate-spin mr-2"/> : <Wand2 className="w-3 h-3 mr-2" />}
                              Rewrite with AI
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                            {result.summaryProfile}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Score & Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="flex flex-col items-center justify-center p-6 text-center border-slate-200 shadow-sm">
                              <div className="relative flex items-center justify-center">
                                  <span className={`text-6xl font-bold ${result.score >= 80 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {result.score}
                                  </span>
                              </div>
                              <p className="text-sm text-slate-500 mt-2 font-medium uppercase tracking-wide">ATS Score</p>
                          </Card>

                          <Card className="col-span-1 md:col-span-2 p-6 flex flex-col justify-center gap-5 shadow-sm">
                              <div className="space-y-1">
                                  <div className="flex justify-between text-xs uppercase font-bold text-slate-500">
                                      <span>Skills Match</span>
                                      <span>{result.breakdown.skillsMatch}%</span>
                                  </div>
                                  <Progress value={result.breakdown.skillsMatch} className="h-2" />
                              </div>
                              <div className="space-y-1">
                                  <div className="flex justify-between text-xs uppercase font-bold text-slate-500">
                                      <span>Experience Match</span>
                                      <span>{result.breakdown.experienceMatch}%</span>
                                  </div>
                                  <Progress value={result.breakdown.experienceMatch} className="h-2" />
                              </div>
                              <div className="space-y-1">
                                  <div className="flex justify-between text-xs uppercase font-bold text-slate-500">
                                      <span>Formatting</span>
                                      <span>{result.breakdown.formatting}%</span>
                                  </div>
                                  <Progress value={result.breakdown.formatting} className="h-2" />
                              </div>
                          </Card>
                      </div>

                      {/* Action Plan */}
                      <Card className="border-green-200 bg-green-50/30 shadow-sm">
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-green-800">
                                  <TrendingUp className="w-5 h-5" /> Priority Fixes
                              </CardTitle>
                          </CardHeader>
                          <CardContent>
                              <div className="grid gap-3">
                                  {result.actionPlan.map((action, i) => (
                                      <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100 shadow-sm">
                                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                          <span className="text-sm text-slate-700 font-medium">{action}</span>
                                      </div>
                                  ))}
                              </div>
                          </CardContent>
                      </Card>

                      {/* Missing Keywords */}
                      <Card>
                          <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center gap-2">
                                 <AlertTriangle className="w-4 h-4 text-amber-500" /> Missing Keywords
                              </CardTitle>
                          </CardHeader>
                          <CardContent>
                              <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Technical / Hard Skills</span>
                                    <div className="flex flex-wrap gap-2">
                                        {result.missingKeywords.hardSkills.length > 0 ? (
                                            result.missingKeywords.hardSkills.map((k, i) => (
                                                <Badge key={i} variant="outline" className="border-red-200 text-red-700 bg-red-50">
                                                    {k}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">No missing hard skills detected.</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Soft Skills</span>
                                    <div className="flex flex-wrap gap-2">
                                        {result.missingKeywords.softSkills.length > 0 ? (
                                            result.missingKeywords.softSkills.map((k, i) => (
                                                <Badge key={i} variant="secondary">
                                                    {k}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">No missing soft skills.</span>
                                        )}
                                    </div>
                                </div>
                              </div>
                          </CardContent>
                      </Card>
                  </TabsContent>

                  {/* TAB 2: INTERVIEW PREP */}
                  <TabsContent value="interview" className="mt-4">
                      <Card>
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                  <MessageSquare className="w-5 h-5 text-purple-600" /> 
                                  Tailored Interview Questions
                              </CardTitle>
                              <CardDescription>
                                  Based on your resume gaps and the JD, be ready for these.
                              </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              {interviewQuestions.length === 0 ? (
                                  <div className="text-center py-8">
                                      <p className="text-slate-500 mb-4">Want to know what they&apos;ll ask you?</p>
                                      <Button onClick={handleGenerateInterview} disabled={interviewLoading} className="bg-purple-600 hover:bg-purple-700">
                                          {interviewLoading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                          Generate Questions
                                      </Button>
                                  </div>
                              ) : (
                                  <div className="space-y-4">
                                      {interviewQuestions.map((q, i) => (
                                          <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                              <p className="font-semibold text-slate-800 mb-2">Q: {q.question}</p>
                                              <div className="text-sm text-slate-600 flex gap-2">
                                                  <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                                  <span className="italic">Tip: {q.tip}</span>
                                              </div>
                                          </div>
                                      ))}
                                      <Button variant="outline" onClick={handleGenerateInterview} className="w-full mt-4">
                                        <History className="mr-2 w-4 h-4" /> Regenerate Questions
                                      </Button>
                                  </div>
                              )}
                          </CardContent>
                      </Card>
                  </TabsContent>
              </Tabs>

            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 text-center text-slate-400 text-sm py-6 border-t border-slate-100">
        <p>
          Built with Next.js, Gemini AI & Shadcn UI by{" "}
          <a 
            href="https://carlos-miguel-sandrino-portfolio.vercel.app/"
            target="_blank" 
            className="font-medium text-blue-600 hover:underline"
          >
            Carlos Sandrino
          </a>
        </p>
      </footer>

    </div>
  );
}