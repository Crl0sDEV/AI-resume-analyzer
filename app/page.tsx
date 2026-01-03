"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileText, CheckCircle, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react"; 
import type { AnalysisResult } from "@/types";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!file || !jd) return;
    
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jd", jd);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze");
      }

      const data = await response.json();
      setResult(data);

    } catch (error) {
      console.error(error);
      alert("Something went wrong analyzing the resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900">
            AI Resume Analyzer
          </h1>
          <p className="text-slate-500">
            Get a Senior Recruiter-level breakdown of your resume in seconds.
          </p>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>
              Upload your resume (PDF) and paste the job description below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jd">Job Description</Label>
              <Textarea 
                id="jd" 
                placeholder="Paste the full job description here..." 
                className="h-32"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Resume (PDF)
              </Label>
              <Input 
                id="resume" 
                type="file" 
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleAnalyze} 
              disabled={!file || !jd || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Analyze Now
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* --- RESULTS SECTION --- */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. Summary Card */}
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                  <Lightbulb className="w-5 h-5" /> Candidate Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {result.summaryProfile}
                </p>
              </CardContent>
            </Card>

            {/* 2. Main Score & Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Overall Score */}
                <Card className="flex flex-col items-center justify-center p-6 text-center border-slate-200">
                    <div className="relative flex items-center justify-center">
                        <span className="text-5xl font-bold text-slate-900">{result.score}</span>
                        <span className="text-sm text-slate-400 absolute -top-2 -right-4">/100</span>
                    </div>
                    <Badge variant={result.matchLevel === "High" ? "default" : result.matchLevel === "Medium" ? "secondary" : "destructive"} className="mt-2 px-4">
                        {result.matchLevel} Match
                    </Badge>
                </Card>

                {/* Detailed Breakdown Bars */}
                <Card className="col-span-1 md:col-span-2 p-6 flex flex-col justify-center gap-4">
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">Skills Match</span>
                            <span className="font-bold">{result.breakdown.skillsMatch}%</span>
                        </div>
                        <Progress value={result.breakdown.skillsMatch} className="h-2" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">Experience Relevance</span>
                            <span className="font-bold">{result.breakdown.experienceMatch}%</span>
                        </div>
                        <Progress value={result.breakdown.experienceMatch} className="h-2" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">Formatting & Clarity</span>
                            <span className="font-bold">{result.breakdown.formatting}%</span>
                        </div>
                        <Progress value={result.breakdown.formatting} className="h-2" />
                    </div>
                </Card>
            </div>

            {/* 3. Action Plan (Checklist) */}
            <Card className="border-green-200 bg-green-50/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                        <TrendingUp className="w-5 h-5" /> Action Plan
                    </CardTitle>
                    <CardDescription>Follow these steps to improve your resume.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {result.actionPlan.map((action, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100 shadow-sm">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                <span className="text-sm text-slate-700">{action}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 4. Missing Keywords (Split) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Missing Hard Skills</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {result.missingKeywords.hardSkills.length > 0 ? (
                            result.missingKeywords.hardSkills.map((k, i) => (
                                <Badge key={i} variant="outline" className="border-red-200 text-red-700 bg-red-50">
                                    {k}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-sm text-slate-400 italic">No missing hard skills detected. Good job!</span>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Missing Soft Skills</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {result.missingKeywords.softSkills.length > 0 ? (
                            result.missingKeywords.softSkills.map((k, i) => (
                                <Badge key={i} variant="secondary">
                                    {k}
                                </Badge>
                            ))
                        ) : (
                             <span className="text-sm text-slate-400 italic">No missing soft skills.</span>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* 5. Red Flags (If any) */}
            {result.redFlags.length > 0 && (
                <Card className="border-red-200 bg-red-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700 text-base">
                            <AlertTriangle className="w-5 h-5" /> Critical Issues to Fix
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                            {result.redFlags.map((flag, i) => (
                                <li key={i}>{flag}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

          </div>
        )}
      </div>
    </div>
  );
}