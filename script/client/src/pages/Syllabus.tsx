import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ArrowLeft, BrainCircuit, Wand2 } from "lucide-react";

export default function Syllabus() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("unit1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLocation("/outcomes");
    }, 600);
  };

  return (
    <AppLayout title="Syllabus Entry">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-heading">Step 2: Syllabus Input</h2>
            <p className="text-muted-foreground">Provide unit-wise topics for the system to understand coverage.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">
            <BrainCircuit className="w-4 h-4" />
            <span>AI Topic Extraction Active</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="unit1">Unit I</TabsTrigger>
            <TabsTrigger value="unit2">Unit II</TabsTrigger>
            <TabsTrigger value="unit3">Unit III</TabsTrigger>
            <TabsTrigger value="unit4">Unit IV</TabsTrigger>
            <TabsTrigger value="unit5">Unit V</TabsTrigger>
          </TabsList>

          {["unit1", "unit2", "unit3", "unit4", "unit5"].map((unit, index) => (
            <TabsContent key={unit} value={unit}>
              <Card className="shadow-sm border-t-4 border-t-primary">
                <CardHeader>
                  <CardTitle>Unit {index + 1} Syllabus</CardTitle>
                  <CardDescription>
                    Paste the topics for this unit. The AI will automatically identify keywords and concepts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${unit}-title`}>Unit Title</Label>
                    <input 
                      id={`${unit}-title`} 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="e.g. Lexical Analysis"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${unit}-topics`}>Topics</Label>
                    <div className="relative">
                        <Textarea 
                        id={`${unit}-topics`} 
                        placeholder="Paste topics here..." 
                        className="min-h-[200px] font-normal leading-relaxed resize-none p-4"
                        defaultValue={index === 0 ? "Introduction to Compilers - Structure of a compiler - Lexical Analysis - Role of Lexical Analyzer - Input Buffering - Specification of Tokens - Recognition of Tokens - Lex - Finite Automata - Regular Expressions to Automata - Minimizing DFA." : ""}
                        />
                        <Button 
                            size="sm" 
                            variant="secondary" 
                            className="absolute bottom-4 right-4 text-xs h-7 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                        >
                            <Wand2 className="w-3 h-3 mr-1.5" /> Auto-Format
                        </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-slate-50/50 p-6 border-t">
                  <Button variant="ghost" onClick={() => {
                     // Logic to go to previous tab or previous page
                     if (index > 0) setActiveTab(`unit${index}`);
                     else setLocation("/course-setup");
                  }}>
                    <ArrowLeft className="mr-2 w-4 h-4" /> Previous
                  </Button>
                  
                  {index < 4 ? (
                    <Button onClick={() => setActiveTab(`unit${index + 2}`)}>
                      Next Unit <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={loading}>
                      {loading ? "Processing..." : (
                        <>Save & Continue <ArrowRight className="ml-2 w-4 h-4" /></>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
