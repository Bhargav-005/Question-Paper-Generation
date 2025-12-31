import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, Cpu, BrainCircuit } from "lucide-react";

export default function Generate() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Initializing model...");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLocation("/preview"), 800);
          return 100;
        }
        
        // Update stage based on progress
        if (prev === 10) setStage("Analyzing syllabus keywords...");
        if (prev === 30) setStage("Mapping Course Outcomes to topics...");
        if (prev === 50) setStage("Generating candidate questions...");
        if (prev === 70) setStage("Validating Bloom's Taxonomy levels...");
        if (prev === 90) setStage("Finalizing blueprint distribution...");
        
        return prev + 1;
      });
    }, 50); // Speed of simulation
    
    return () => clearInterval(timer);
  }, [setLocation]);

  return (
    <AppLayout title="Generating Paper">
      <div className="min-h-[60vh] flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8">
        
        <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center relative z-10 animate-bounce">
                <Cpu className="w-12 h-12 text-primary" />
            </div>
        </div>

        <div className="space-y-4 w-full">
            <h2 className="text-2xl font-bold font-heading">{stage}</h2>
            <Progress value={progress} className="h-3 w-full" />
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
                <span>START</span>
                <span>{progress}%</span>
                <span>COMPLETE</span>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full pt-8">
             <StepItem label="Context" active={progress > 10} />
             <StepItem label="Generation" active={progress > 50} />
             <StepItem label="Validation" active={progress > 80} />
        </div>
      </div>
    </AppLayout>
  );
}

function StepItem({ label, active }: { label: string, active: boolean }) {
    return (
        <div className={`flex flex-col items-center gap-2 transition-opacity ${active ? "opacity-100" : "opacity-30"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">{label}</span>
        </div>
    )
}
