import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Info, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { localDraftManager } from "@/lib/localDraftManager";
import { useToast } from "@/hooks/use-toast";
import { BLOOM_LEVELS } from "@/lib/constants";

export default function CourseOutcomes() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [outcomes, setOutcomes] = useState([]);

  useEffect(() => {
    const paperId = sessionStorage.getItem('active_paper_id');
    if (paperId) {
      const draft = localDraftManager.getCOs(paperId);
      if (draft && draft.length > 0) {
        setOutcomes(draft.map((co, index) => ({
          id: co.id || `co-${index}`,
          co_number: co.co,
          description: co.description,
          bloom_level: co.bloom || "L1"
        })));
      } else {
        // Default outcomes if none found
        setOutcomes([
        { id: '1', co_number: "CO1", description: "", bloom_level: "L2" },
        { id: '2', co_number: "CO2", description: "", bloom_level: "L3" },
        { id: '3', co_number: "CO3", description: "", bloom_level: "L2" }]
        );
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const paperId = sessionStorage.getItem('active_paper_id');
    if (!paperId) return;

    const timeoutId = setTimeout(() => {
      const formattedCOs = outcomes.map((co) => ({
        id: co.id,
        co: co.co_number,
        description: co.description,
        bloom: co.bloom_level
      }));
      localDraftManager.saveCOs(paperId, formattedCOs);
      console.log("[Outcomes] Draft auto-saved to localStorage");
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [outcomes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const paperId = sessionStorage.getItem('active_paper_id');
    if (!paperId) {
      toast({
        title: "Error",
        description: "No active course found. Please start from Step 1.",
        variant: "destructive"
      });
      setLocation("/course-setup");
      return;
    }

    try {
      // Local persistence already handled by useEffect
      toast({
        title: "Success",
        description: "Course outcomes draft saved locally."
      });

      setLocation("/co-syllabus-mapping");
    } catch (error) {
      console.error("Save Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save outcomes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addOutcome = () => {
    const nextNum = outcomes.length + 1;
    setOutcomes([...outcomes, {
      id: Date.now().toString(),
      co_number: `CO${nextNum}`,
      description: "",
      bloom_level: "L1"
    }]);
  };

  const removeOutcome = (id) => {
    setOutcomes(outcomes.filter((o) => o.id !== id));
  };

  const updateOutcome = (id, field, value) => {
    setOutcomes(outcomes.map((o) => o.id === id ? { ...o, [field]: value } : o));
  };

  return (
    <AppLayout title="Course Outcomes (COs)">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold font-heading">Step 3: Define Outcomes</h2>
                    <p className="text-muted-foreground">Map course objectives to Bloom's Taxonomy levels.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm border-t-4 border-t-primary">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Course Outcomes List</CardTitle>
                                    <CardDescription>Define 5-6 outcomes for this course.</CardDescription>
                                </div>
                                <Button size="sm" variant="outline" onClick={addOutcome}>
                                    <Plus className="w-4 h-4 mr-2" /> Add CO
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {outcomes.map((co, index) =>
                <div key={co.id} className="flex gap-4 items-start p-4 rounded-lg border bg-card hover:bg-slate-50 transition-colors group">
                                        <div className="pt-3">
                                            <span className="font-mono font-bold text-sm text-muted-foreground bg-slate-100 px-2 py-1 rounded">
                                                {co.co_number}
                                            </span>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <textarea
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="Describe the outcome..."
                      value={co.description}
                      onChange={(e) => updateOutcome(co.id, 'description', e.target.value)} />
                    
                                            <div className="flex items-center gap-4">
                                                <Select
                        value={co.bloom_level}
                        onValueChange={(v) => updateOutcome(co.id, 'bloom_level', v)}>
                        
                                                    <SelectTrigger className="w-[180px] h-8 text-xs">
                                                        <SelectValue placeholder="Bloom's Level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {BLOOM_LEVELS.map((level) =>
                          <SelectItem key={level.value} value={level.value}>
                                                                {level.label}
                                                            </SelectItem>
                          )}
                                                    </SelectContent>
                                                </Select>

                                                {co.bloom_level === "L1" && <Badge variant="secondary" className="bg-slate-100 text-slate-600">Low Order</Badge>}
                                                {["L2", "L3"].includes(co.bloom_level) && <Badge variant="secondary" className="bg-blue-50 text-blue-600">Mid Order</Badge>}
                                                {["L4", "L5", "L6"].includes(co.bloom_level) && <Badge variant="secondary" className="bg-purple-50 text-purple-600">High Order</Badge>}
                                            </div>
                                        </div>
                                        <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeOutcome(co.id)}>
                    
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                )}
                            </CardContent>
                            <CardFooter className="flex justify-between bg-slate-50/50 p-6 border-t">
                                <Button variant="ghost" onClick={() => setLocation("/syllabus")}>
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                                <Button onClick={handleSubmit} disabled={loading}>
                                    {loading ? "Saving..." :
                  <>Confirm & Next <ArrowRight className="ml-2 w-4 h-4" /></>
                  }
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Bloom's Taxonomy Guide
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="space-y-1">
                                    <strong className="text-purple-700 block text-xs uppercase tracking-wider">High Order Thinking</strong>
                                    <p className="text-muted-foreground"><strong>Create (L6):</strong> Design, Assemble, Construct</p>
                                    <p className="text-muted-foreground"><strong>Evaluate (L5):</strong> Appraise, Argue, Judge</p>
                                    <p className="text-muted-foreground"><strong>Analyze (L4):</strong> Differentiate, Organize, Compare</p>
                                </div>
                                <div className="w-full h-px bg-blue-200" />
                                <div className="space-y-1">
                                    <strong className="text-blue-700 block text-xs uppercase tracking-wider">Mid Order Thinking</strong>
                                    <p className="text-muted-foreground"><strong>Apply (L3):</strong> Execute, Implement, Solve</p>
                                    <p className="text-muted-foreground"><strong>Understand (L2):</strong> Classify, Describe, Explain</p>
                                </div>
                                <div className="w-full h-px bg-blue-200" />
                                <div className="space-y-1">
                                    <strong className="text-slate-700 block text-xs uppercase tracking-wider">Low Order Thinking</strong>
                                    <p className="text-muted-foreground"><strong>Remember (L1):</strong> Define, Duplicate, List</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>);

}