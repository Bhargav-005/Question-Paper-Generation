import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, GraduationCap, CheckCircle2, ListChecks, HelpCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { UNIVERSITY_70_MARK_BLUEPRINT, saveBlueprint } from "@/lib/blueprintEngine";

export default function Blueprint() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const paperId = sessionStorage.getItem('active_paper_id') || "";

  const blueprint = UNIVERSITY_70_MARK_BLUEPRINT;

  useEffect(() => {
    if (!paperId) {
      setLocation("/course-setup");
      return;
    }
  }, [paperId]);

  const handleConfirm = () => {
    setLoading(true);
    saveBlueprint(paperId, blueprint);

    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Blueprint Confirmed",
        description: "Institutional 70-mark structure applied successfully."
      });
      setLocation("/preview");
    }, 600);
  };

  return (
    <AppLayout title="Blueprint Setup">
            <div className="max-w-5xl mx-auto space-y-6 pb-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            Step 6: Institutional Blueprint
                        </h2>
                        <p className="text-muted-foreground">Standard 70-mark CO-based choice model.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-slate-50 text-slate-700">70 Total Marks</Badge>
                        <Badge className="bg-primary">R-2021 Compliant</Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Section A */}
                    <Card className="border-t-4 border-t-slate-900 shadow-sm">
                        <CardHeader className="bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Section A (Compulsory)</CardTitle>
                                    <CardDescription>Knowledge & Recall based short questions.</CardDescription>
                                </div>
                                <Badge variant="secondary">14 Marks</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Q.No</TableHead>
                                        <TableHead>Course Outcome (CO)</TableHead>
                                        <TableHead className="text-right">Marks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {blueprint.sectionA.map((slot) =>
                  <TableRow key={slot.questionNumber}>
                                            <TableCell className="font-mono font-bold text-primary">{slot.questionNumber}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{slot.co}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">{slot.marks}M</TableCell>
                                        </TableRow>
                  )}
                                    <TableRow className="bg-slate-50/50 font-bold">
                                        <TableCell colSpan={2}>Total Section A</TableCell>
                                        <TableCell className="text-right">14 Marks</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Section B */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <ListChecks className="h-5 w-5 text-primary" />
                                Section B (Descriptive Analysis - Choice Based)
                            </h3>
                            <Badge variant="outline">56 Marks (4 x 14M)</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blueprint.sectionB.map((group) =>
              <Card key={group.groupNumber} className="border-top rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="bg-slate-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest flex justify-between items-center">
                                        Group {group.groupNumber}
                                        <span className="text-slate-400">14 Marks</span>
                                    </div>
                                    <CardContent className="p-0">
                                        <div className="divide-y">
                                            {/* Option 1 */}
                                            <div className="p-4 bg-white">
                                                <div className="text-[10px] font-bold text-primary mb-3 uppercase">Option 1</div>
                                                <div className="space-y-3">
                                                    {group.option1.map((slot) =>
                        <div key={slot.questionNumber} className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-bold w-6">{slot.questionNumber}</span>
                                                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-bold">{slot.co}</span>
                                                            </div>
                                                            <span className="font-medium text-slate-500">{slot.marks}M</span>
                                                        </div>
                        )}
                                                </div>
                                            </div>

                                            <div className="relative py-2 bg-slate-50 flex items-center justify-center">
                                                <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" />
                                                <span className="relative z-10 bg-slate-100 text-[10px] font-black px-3 py-1 rounded-full border shadow-sm">OR</span>
                                            </div>

                                            {/* Option 2 */}
                                            <div className="p-4 bg-white">
                                                <div className="text-[10px] font-bold text-primary mb-3 uppercase">Option 2</div>
                                                <div className="space-y-3">
                                                    {group.option2.map((slot) =>
                        <div key={slot.questionNumber} className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-bold w-6">{slot.questionNumber}</span>
                                                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-bold">{slot.co}</span>
                                                            </div>
                                                            <span className="font-medium text-slate-500">{slot.marks}M</span>
                                                        </div>
                        )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
              )}
                        </div>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4">
                    <HelpCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-amber-900">How Choice Generation Works</p>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                            The system will select **ONE** option from each group for the final printed paper while ensuring full CO coverage.
                            Questions are selected from your **Approved List** based on the marks required for each slot.
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t">
                    <Button variant="ghost" onClick={() => setLocation("/generate")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Questions
                    </Button>

                    <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-green-600 flex items-center justify-end gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Valid Structure
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-tight">University Compliance Verified</p>
                        </div>
                        <Button size="lg" onClick={handleConfirm} disabled={loading} className="px-10 shadow-xl shadow-primary/20">
                            {loading ? "Applying..." : "Confirm Blueprint & Generate Paper"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>);

}