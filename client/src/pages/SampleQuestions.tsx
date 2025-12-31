import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Upload, FileType } from "lucide-react";

export default function SampleQuestions() {
  const [, setLocation] = useLocation();

  return (
    <AppLayout title="Sample Questions">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
            <h2 className="text-2xl font-bold font-heading">Step 4: Sample Questions</h2>
            <p className="text-muted-foreground">Upload or paste sample questions to train the generation model.</p>
        </div>

        <Card className="border-t-4 border-t-primary">
            <CardHeader>
                <CardTitle>Input Previous Year Questions</CardTitle>
                <CardDescription>
                    The system analyzes these to understand the typical sentence structure and vocabulary.
                    These specific questions will NOT be reused.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-muted rounded-lg p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        <Upload className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-1">Upload Question Paper PDF/Word</h3>
                    <p className="text-sm text-muted-foreground mb-4">Drag and drop or click to browse</p>
                    <Button variant="outline" size="sm">Select Files</Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or paste text manually</span>
                    </div>
                </div>

                <Textarea 
                    placeholder="Paste questions here (one per line)..." 
                    className="min-h-[200px] font-mono text-sm"
                />
            </CardContent>
            <CardFooter className="flex justify-between bg-slate-50/50 p-6 border-t">
                <Button variant="ghost" onClick={() => setLocation("/outcomes")}>
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button onClick={() => setLocation("/blueprint")}>
                    Next: Blueprint <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
