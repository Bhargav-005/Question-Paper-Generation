import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCheck, Loader2, FileText } from "lucide-react";
import { courseService } from "@/services/courseService";

import { getGeneratedQuestions } from "@/lib/questionTemplateEngine";
import { getBlueprint } from "@/lib/blueprintEngine";
import { assemblePaper } from "@/lib/paperAssemblyEngine";
import { paperService } from "@/services/paperService";

export default function Preview({ params }) {
  const [, setLocation] = useLocation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paper, setPaper] = useState(null);

  const urlPaperId = params?.paperId;
  const paperId = urlPaperId || sessionStorage.getItem('active_paper_id') || "";

  useEffect(() => {
    const loadAndAssemble = async () => {
      if (!paperId) {
        setLoading(false);
        return;
      }

      // If we have a URL paper ID, sync it to session
      if (urlPaperId) {
        sessionStorage.setItem('active_paper_id', urlPaperId);
        localStorage.setItem('qgen_active_paper', urlPaperId);
      }

      try {
        // Fetch full paper metadata from DB
        const paperData = await paperService.getPaperById(paperId);
        
        // If course info is available in paperData, use it
        if (paperData) {
          setCourse({
            subject_code: paperData.subject_code,
            subject_name: paperData.subject_name,
            department: paperData.department_id || "IT",
            semester: paperData.semester,
            academic_year: paperData.academic_year,
            regulation: paperData.regulation
          });

          // Check for stored paper content
          if (paperData.paper_content) {
            if (process.env.NODE_ENV === "development") {
              console.log("[Preview] Loading stored paper content from database");
            }
            setPaper(paperData.paper_content.questions);
            setLoading(false);
            return;
          }
        }

        // Fallback: Original local assembly logic if no stored content
        const blueprint = getBlueprint(paperId);
        const questions = getGeneratedQuestions(paperId);

        if (blueprint && questions.length > 0) {
          const assembled = assemblePaper(blueprint, questions);
          setPaper(assembled);
        } else {
          // If no local data, try to generate via backend
          const storedMappings = localStorage.getItem(`qgen_co_mappings_${paperId}`);
          const storedSyllabus = localStorage.getItem(`qgen_syllabus_${paperId}`);
          const storedBlueprint = getBlueprint(paperId);

          if (storedMappings && storedSyllabus && storedBlueprint) {
             try {
                const response = await fetch('/api/questions/generate-paper', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({
                    paperId,
                    blueprint: storedBlueprint,
                    coMappings: JSON.parse(storedMappings),
                    syllabusTopics: JSON.parse(storedSyllabus)
                  })
                });
                const result = await response.json();
                if (result.success) {
                  setPaper(result.data.questions);
                }
             } catch (genErr) {
               console.error("Auto-generation failed:", genErr);
             }
          }
        }
      } catch (err) {
        console.error("Failed to load paper or course:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAndAssemble();
  }, [paperId, urlPaperId]);

  if (loading) {
    return (
      <AppLayout title="Final Review">
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground font-medium">Assembling your structured question paper...</p>
                </div>
            </AppLayout>);
  }

  const handleFinalize = async () => {
    if (paper && paperId) {
      try {
        const storedMappings = localStorage.getItem(`qgen_co_mappings_${paperId}`);
        const storedSyllabus = localStorage.getItem(`qgen_syllabus_${paperId}`);
        const storedBlueprint = getBlueprint(paperId);

        if (storedMappings && storedSyllabus && storedBlueprint) {
          await fetch('/api/questions/generate-paper', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              paperId,
              blueprint: storedBlueprint,
              coMappings: JSON.parse(storedMappings),
              syllabusTopics: JSON.parse(storedSyllabus)
            })
          });
        }
      } catch (err) {
        console.error("Failed to save final paper structure:", err);
      }
    }
    setLocation("/export");
  };

  return (
    <AppLayout title="Ready for Output">
            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            Step 7: Final Paper Preview
                        </h2>
                        <p className="text-muted-foreground">Verification of the 70-mark institutional model.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="bg-white" onClick={() => setLocation("/blueprint")}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blueprint
                        </Button>
                        <Button onClick={handleFinalize} className="shadow-lg shadow-primary/20 px-6">
                            <CheckCheck className="w-4 h-4 mr-2" /> Approve & Export
                        </Button>
                    </div>
                </div>

                {/* Paper Container */}
                <Card className="bg-white border shadow-2xl p-0 overflow-hidden mx-auto max-w-[210mm]">
                    <div className="p-8 print:p-0 min-h-[1000px] text-black font-serif">
                        {/* Paper Header with Table structure */}
                        <div className="mb-6">
                            <div className="flex justify-center mb-4">
                                <img src="/gmr-logo.png" alt="GMR Logo" className="h-16 object-contain" />
                            </div>
                            
                            <div className="text-center font-bold mb-4">
                                <h1 className="text-sm underline uppercase">SEMESTER END REGULAR EXAMINATIONS (AR23)</h1>
                            </div>

                            <table className="w-full border-collapse border border-black text-[12px]">
                                <tbody>
                                    <tr className="h-8">
                                        <td className="border border-black p-1 font-bold w-1/4">U.G.</td>
                                        <td className="border border-black p-1 w-1/4 text-center">{course?.department || "IT"}</td>
                                        <td className="border border-black p-1 font-bold w-1/6">Degree</td>
                                        <td className="border border-black p-1 w-1/3 text-center">Bachelor of Technology</td>
                                    </tr>
                                    <tr className="h-8">
                                        <td className="border border-black p-1 font-bold">Academic Year</td>
                                        <td className="border border-black p-1 text-center">{course?.academic_year || "2024-25"}</td>
                                        <td className="border border-black p-1 font-bold">Sem.</td>
                                        <td className="border border-black p-1 text-center">{course?.semester || "N/A"}</td>
                                    </tr>
                                    <tr className="h-8">
                                        <td className="border border-black p-1 font-bold">Course Code</td>
                                        <td className="border border-black p-1 font-mono text-center">{course?.subject_code || "N/A"}</td>
                                        <td colSpan={2} className="border border-black p-0">
                                            <div className="flex h-full items-center">
                                                <div className="border-r border-black p-1 font-bold w-1/3 text-center h-full flex items-center justify-center">Course Title</div>
                                                <div className="p-1 flex-1 text-center">{course?.subject_name || "N/A"}</div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="h-8 text-center">
                                        <td className="border border-black p-1 font-bold">Duration</td>
                                        <td className="border border-black p-1">3 Hours</td>
                                        <td className="border border-black p-1 font-bold">Maximum Marks</td>
                                        <td className="border border-black p-1">70 (Seventy)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {paper ? (
                            <div className="space-y-4">
                                {/* SECTION-I */}
                                <div className="text-center">
                                    <h3 className="font-bold uppercase tracking-tight text-sm">SECTION-I</h3>
                                    <p className="text-[12px] font-bold">7 × 2 = 14 Marks</p>
                                </div>

                                <table className="w-full border-collapse border border-black text-[13px]">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="border border-black p-1 w-12 text-center">No.</th>
                                            <th className="border border-black p-1 text-left">Questions (a–g)</th>
                                            <th className="border border-black p-1 w-16 text-center">COs</th>
                                            <th className="border border-black p-1 w-16 text-center">Marks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paper.sectionA.map((qa, idx) => (
                                            <tr key={qa.slot.questionNumber} className="min-h-8">
                                                <td className="border border-black p-2 text-center">{idx + 1}</td>
                                                <td className="border border-black p-2 leading-relaxed">{qa.question.questionText}</td>
                                                <td className="border border-black p-2 text-center font-medium">{qa.slot.co}</td>
                                                <td className="border border-black p-2 text-center font-bold">{qa.slot.marks || 2}M</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* SECTION-II */}
                                <div className="text-center mt-6">
                                    <h3 className="font-bold uppercase tracking-tight text-sm">SECTION-II</h3>
                                    <p className="text-[12px] font-bold">4 × 14 = 56 Marks</p>
                                </div>

                                <table className="w-full border-collapse border border-black text-[12px]">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="border border-black p-1 w-12 text-center">No.</th>
                                            <th className="border border-black p-1 text-left">Questions (2nd to 15th)</th>
                                            <th className="border border-black p-1 w-12 text-center">COs</th>
                                            <th className="border border-black p-1 w-16 text-center">Marks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paper.sectionB.map((group, gIdx) => (
                                            <React.Fragment key={group.groupNumber}>
                                                {/* Option 1 */}
                                                {group.option1.map((qa, qIdx) => (
                                                    <tr key={qa.slot.questionNumber}>
                                                        {qIdx === 0 && (
                                                            <td rowSpan={group.option1.length} className="border border-black p-2 text-center font-bold">
                                                                {group.option1[0].slot.questionNumber}
                                                            </td>
                                                        )}
                                                        <td className="border border-black p-2 leading-relaxed">
                                                            ({String.fromCharCode(97 + qIdx)}) {qa.question.questionText}
                                                        </td>
                                                        <td className="border border-black p-2 text-center font-medium">{qa.slot.co}</td>
                                                        <td className="border border-black p-2 text-center font-bold">{qa.slot.marks}M</td>
                                                    </tr>
                                                ))}
                                                
                                                {/* OR Row */}
                                                <tr>
                                                    <td colSpan={4} className="border border-black p-0.5 text-center font-bold bg-slate-50 text-[11px] uppercase tracking-widest">OR</td>
                                                </tr>

                                                {/* Option 2 */}
                                                {group.option2.map((qa, qIdx) => (
                                                    <tr key={qa.slot.questionNumber}>
                                                        {qIdx === 0 && (
                                                            <td rowSpan={group.option2.length} className="border border-black p-2 text-center font-bold">
                                                                {group.option2[0].slot.questionNumber}
                                                            </td>
                                                        )}
                                                        <td className="border border-black p-2 leading-relaxed">
                                                            ({String.fromCharCode(97 + qIdx)}) {qa.question.questionText}
                                                        </td>
                                                        <td className="border border-black p-2 text-center font-medium">{qa.slot.co}</td>
                                                        <td className="border border-black p-2 text-center font-bold">{qa.slot.marks}M</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="text-center pt-8">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] underline">— End of Paper —</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-slate-50 rounded-lg border-2 border-dashed">
                                <p className="text-slate-400">No blueprint configuration found. Please return to Step 6.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </AppLayout>);
}

function Card({ children, className }) {
  return (
    <div className={`bg-white rounded-xl ${className}`}>
            {children}
        </div>);
}