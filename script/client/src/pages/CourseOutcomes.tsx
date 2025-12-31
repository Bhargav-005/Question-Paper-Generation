import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Info, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function CourseOutcomes() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  
  const [outcomes, setOutcomes] = useState([
    { id: 1, text: "Understand the fundamental concepts of compiler design", level: "L2" },
    { id: 2, text: "Apply finite automata techniques for lexical analysis", level: "L3" },
    { id: 3, text: "Design top-down and bottom-up parsers", level: "L6" },
    { id: 4, text: "Analyze syntax-directed translation schemes", level: "L4" },
    { id: 5, text: "Evaluate code optimization techniques", level: "L5" },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLocation("/samples"); // Assuming next step
    }, 600);
  };

  const addOutcome = () => {
    setOutcomes([...outcomes, { id: Date.now(), text: "", level: "L1" }]);
  };

  const removeOutcome = (id: number) => {
    setOutcomes(outcomes.filter(o => o.id !== id));
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
                    {outcomes.map((co, index) => (
                    <div key={co.id} className="flex gap-4 items-start p-4 rounded-lg border bg-card hover:bg-slate-50 transition-colors group">
                        <div className="pt-3">
                            <span className="font-mono font-bold text-sm text-muted-foreground bg-slate-100 px-2 py-1 rounded">
                                CO{index + 1}
                            </span>
                        </div>
                        <div className="flex-1 space-y-3">
                            <textarea 
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                placeholder="Describe the outcome..."
                                defaultValue={co.text}
                            />
                            <div className="flex items-center gap-4">
                                <Select defaultValue={co.level}>
                                    <SelectTrigger className="w-[180px] h-8 text-xs">
                                        <SelectValue placeholder="Bloom's Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="L1">L1 - Remember</SelectItem>
                                        <SelectItem value="L2">L2 - Understand</SelectItem>
                                        <SelectItem value="L3">L3 - Apply</SelectItem>
                                        <SelectItem value="L4">L4 - Analyze</SelectItem>
                                        <SelectItem value="L5">L5 - Evaluate</SelectItem>
                                        <SelectItem value="L6">L6 - Create</SelectItem>
                                    </SelectContent>
                                </Select>
                                
                                {co.level === "L1" && <Badge variant="secondary" className="bg-slate-100 text-slate-600">Low Order</Badge>}
                                {["L2", "L3"].includes(co.level) && <Badge variant="secondary" className="bg-blue-50 text-blue-600">Mid Order</Badge>}
                                {["L4", "L5", "L6"].includes(co.level) && <Badge variant="secondary" className="bg-purple-50 text-purple-600">High Order</Badge>}
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeOutcome(co.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                    ))}
                </CardContent>
                <CardFooter className="flex justify-between bg-slate-50/50 p-6 border-t">
                    <Button variant="ghost" onClick={() => setLocation("/syllabus")}>
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Validating..." : (
                            <>Confirm & Next <ArrowRight className="ml-2 w-4 h-4" /></>
                        )}
                    </Button>
                </CardFooter>
                </Card>
            </div>

            {/* Helper Sidebar */}
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
    </AppLayout>
  );
}
