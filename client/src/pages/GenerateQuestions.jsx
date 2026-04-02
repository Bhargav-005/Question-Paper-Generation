import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Sparkles, RefreshCw, ThumbsUp, ThumbsDown, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateQuestionsForPaper, getGeneratedQuestions, saveGeneratedQuestions } from "@/lib/questionTemplateEngine";







export default function GenerateQuestions() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionsByCO, setQuestionsByCO] = useState({});
  const [error, setError] = useState(null);

  const paperId = sessionStorage.getItem('active_paper_id') || "";

  useEffect(() => {
    if (!paperId) {
      setLocation("/course-setup");
      return;
    }

    const existing = getGeneratedQuestions(paperId);
    if (existing.length > 0) {
      setQuestions(existing);
      organizeQuestions(existing);
    } else {
      handleGenerate();
    }
  }, [paperId]);

  const handleGenerate = () => {
    setLoading(true);
    setError(null);

    try {
      const results = generateQuestionsForPaper(paperId);
      if (results.length === 0) {
        // If no questions generated, check if it's because no COs are approved
        const statusData = localStorage.getItem(`qgen_mapping_status_${paperId}`);
        if (!statusData || !statusData.includes("approved")) {
          throw new Error("No approved Course Outcomes found. Please approve mapping in Step 4 first.");
        }
        throw new Error("Failed to generate questions. Ensure syllabus topics are selected.");
      }

      setQuestions(results);
      organizeQuestions(results);

      toast({
        title: "Questions Generated",
        description: `Successfully generated ${results.length} questions using structural templates.`
      });
    } catch (err) {
      setError(err.message || "Failed to generate questions");
      toast({
        title: "Generation Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const organizeQuestions = (qs) => {
    const organized = {};

    qs.forEach((q) => {
      if (!organized[q.co]) {
        organized[q.co] = {};
      }
      if (!organized[q.co][q.marks]) {
        organized[q.co][q.marks] = [];
      }
      organized[q.co][q.marks].push(q);
    });

    setQuestionsByCO(organized);
  };

  const handleUpdateStatus = (questionId, status) => {
    const updatedQuestions = questions.map((q) =>
    q.id === questionId ? { ...q, status } : q
    );
    setQuestions(updatedQuestions);
    organizeQuestions(updatedQuestions);
    saveGeneratedQuestions(paperId, updatedQuestions);
  };

  const handleProceed = () => {
    const approvedCount = questions.filter((q) => q.status === "approved").length;
    if (approvedCount === 0) {
      toast({
        title: "No Approved Questions",
        description: "Please approve at least a few questions before proceeding.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Questions Finalized",
      description: `${approvedCount} questions approved. Proceeding to blueprint...`
    });

    setLocation("/blueprint");
  };

  if (loading && questions.length === 0) {
    return (
      <AppLayout title="Generate Questions">
                <div className="max-w-5xl mx-auto py-12 flex flex-col items-center justify-center h-[60vh]">
                    <Sparkles className="h-16 w-16 text-primary animate-pulse mb-4" />
                    <h3 className="text-xl font-bold font-heading">Deterministic Question Generation</h3>
                    <p className="text-muted-foreground mt-2">Applying academic templates to approved topics...</p>
                    <Loader2 className="h-8 w-8 text-primary animate-spin mt-6" />
                </div>
            </AppLayout>);

  }

  return (
    <AppLayout title="Review Generated Questions">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-primary" />
                            Step 5: Review Questions
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Deterministic questions generated for approved Course Outcomes.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={loading}
              className="bg-white">
              
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Regenerate All
                        </Button>
                    </div>
                </div>

                {error &&
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-800">Generation Unavailable</p>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/co-syllabus-mapping")}
              className="mt-3">
              
                                Go Back to Step 4
                            </Button>
                        </div>
                    </div>
        }

                {questions.length > 0 &&
        <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="pt-6">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Generated</p>
                                    <p className="text-2xl font-black">{questions.length}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="pt-6">
                                    <p className="text-xs text-green-700 uppercase font-bold tracking-wider mb-1">Approved</p>
                                    <p className="text-2xl font-black text-green-700">
                                        {questions.filter((q) => q.status === 'approved').length}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="bg-amber-50 border-amber-200">
                                <CardContent className="pt-6">
                                    <p className="text-xs text-amber-700 uppercase font-bold tracking-wider mb-1">Pending Review</p>
                                    <p className="text-2xl font-black text-amber-700">
                                        {questions.filter((q) => q.status === 'generated').length}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-8">
                            {Object.entries(questionsByCO).
            sort(([a], [b]) => a.localeCompare(b)).
            map(([co, markGroups]) =>
            <div key={co} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Badge className="px-3 py-1 text-sm bg-slate-900 font-mono">{co}</Badge>
                                            <div className="h-px bg-slate-200 flex-1" />
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            {Object.entries(markGroups).
                sort(([a], [b]) => parseInt(a) - parseInt(b)).
                map(([marks, questions]) =>
                <div key={marks} className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                                                {marks}
                                                            </div>
                                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-tight">{marks} Mark Questions</h4>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {questions.map((q) =>
                    <Card key={q.id} className={`transition-all ${q.status === 'approved' ? 'border-green-300 ring-1 ring-green-100 bg-green-50/20' : q.status === 'rejected' ? 'opacity-60 grayscale bg-slate-50' : 'hover:border-primary/30'}`}>
                                                                    <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0 bg-slate-50/50">
                                                                        <Badge variant="outline" className="text-[10px] font-mono bg-white">
                                                                            {q.id}
                                                                        </Badge>
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge className={`text-[9px] uppercase ${q.difficulty === 'high' ? 'bg-red-500' : q.difficulty === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`}>
                                                                                {q.difficulty}
                                                                            </Badge>
                                                                        </div>
                                                                    </CardHeader>
                                                                    <CardContent className="p-4 pt-3">
                                                                        <p className="text-sm font-medium leading-relaxed mb-3">
                                                                            {q.questionText}
                                                                        </p>
                                                                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                            <span className="font-bold">Topic:</span> {q.topic}
                                                                        </div>
                                                                    </CardContent>
                                                                    <CardFooter className="py-2 px-4 border-t bg-slate-50/30 flex justify-end gap-2">
                                                                        <Button
                          size="sm"
                          variant={q.status === 'rejected' ? 'destructive' : 'ghost'}
                          className="h-7 px-2 text-[10px]"
                          onClick={() => handleUpdateStatus(q.id, 'rejected')}>
                          
                                                                            <ThumbsDown className="h-3 w-3 mr-1" /> Reject
                                                                        </Button>
                                                                        <Button
                          size="sm"
                          variant={q.status === 'approved' ? 'default' : 'outline'}
                          className={`h-7 px-2 text-[10px] ${q.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-white'}`}
                          onClick={() => handleUpdateStatus(q.id, 'approved')}>
                          
                                                                            <ThumbsUp className="h-3 w-3 mr-1" /> Approve
                                                                        </Button>
                                                                    </CardFooter>
                                                                </Card>
                    )}
                                                        </div>
                                                    </div>
                )}
                                        </div>
                                    </div>
            )}
                        </div>

                        <div className="flex justify-between items-center pt-8 border-t">
                            <Button variant="ghost" onClick={() => setLocation("/co-syllabus-mapping")}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Mapping
                            </Button>

                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Templates Verified
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">Ready for Blueprint selection</span>
                                </div>
                                <Button size="lg" onClick={handleProceed} className="px-10 shadow-xl shadow-primary/20">
                                    Proceed to Blueprint
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
        }

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-blue-900">Deterministic Generation Mode</p>
                            <p className="text-xs text-blue-800 leading-relaxed">
                                These questions were generated using institutional templates mapped to your **approved topics**.
                                Blueprinting (the next step) will only pull from the questions you **Approve** here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>);

}