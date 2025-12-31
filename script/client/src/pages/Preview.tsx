import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, RefreshCw, CheckCheck, Printer } from "lucide-react";

export default function Preview() {
  const [, setLocation] = useLocation();

  return (
    <AppLayout title="Paper Preview">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold font-heading">Final Preview</h2>
                <p className="text-muted-foreground">Review the generated paper before finalizing.</p>
            </div>
            <div className="flex gap-3">
                <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                </Button>
                <Button onClick={() => setLocation("/export")}>
                    <CheckCheck className="w-4 h-4 mr-2" /> Approve & Finalize
                </Button>
            </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm min-h-[800px] p-12 relative print:shadow-none print:border-0 mx-auto max-w-[210mm]">
            {/* Paper Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-8">
                <h1 className="text-xl font-bold uppercase tracking-wide">University of Technology</h1>
                <h2 className="text-lg font-semibold mt-1">Department of Computer Science</h2>
                <div className="flex justify-between mt-6 text-sm font-medium">
                    <span>Sub. Code: CS8602</span>
                    <span>Sub. Name: Compiler Design</span>
                    <span>Max. Marks: 100</span>
                </div>
                <div className="flex justify-between mt-1 text-sm font-medium">
                    <span>Year/Sem: III/VI</span>
                    <span>Duration: 3 Hours</span>
                    <span>Date: 12/05/2025</span>
                </div>
            </div>

            {/* Part A */}
            <div className="mb-8">
                <h3 className="text-center font-bold underline mb-4">PART - A (10 x 2 = 20 Marks)</h3>
                <div className="space-y-4 text-sm">
                    {[
                        "Define a token.",
                        "What is the role of the lexical analyzer?",
                        "Differentiate between NFA and DFA.",
                        "What is a handle in bottom-up parsing?",
                        "Define ambiguous grammar with an example."
                    ].map((q, i) => (
                        <div key={i} className="flex gap-4">
                            <span className="font-semibold w-6">{i+1}.</span>
                            <p className="flex-1">{q}</p>
                            <span className="font-mono text-xs text-muted-foreground w-12 text-right">(CO{i%3+1})</span>
                        </div>
                    ))}
                    <div className="text-center text-muted-foreground italic my-2">... (Questions 6-10) ...</div>
                </div>
            </div>

             {/* Part B */}
             <div className="mb-8">
                <h3 className="text-center font-bold underline mb-4">PART - B (5 x 13 = 65 Marks)</h3>
                <div className="space-y-6 text-sm">
                    {[
                        "Explain the phases of a compiler with a neat diagram.",
                        "Construct a DFA for the regular expression (a|b)*abb.",
                        "Explain the working of an operator precedence parser."
                    ].map((q, i) => (
                        <div key={i} className="flex gap-4">
                            <span className="font-semibold w-6">{11+i}. (a)</span>
                            <div className="flex-1">
                                <p>{q}</p>
                                <p className="text-center font-bold text-xs my-1">OR</p>
                                <p className="text-muted-foreground"> [Alternative Question Placeholder]</p>
                            </div>
                            <span className="font-mono text-xs text-muted-foreground w-12 text-right">(CO{i%2+1})</span>
                        </div>
                    ))}
                     <div className="text-center text-muted-foreground italic my-2">... (Questions 14-15) ...</div>
                </div>
            </div>
        </div>
      </div>
    </AppLayout>
  );
}
