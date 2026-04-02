import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  FileText,
  ShieldCheck,
  Share2,
  LayoutDashboard,
  Download,
  Loader2 } from
"lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { getGeneratedQuestions } from "@/lib/questionTemplateEngine";
import { getBlueprint } from "@/lib/blueprintEngine";
import { assemblePaper } from "@/lib/paperAssemblyEngine";
import { exportPaperAsPDF } from "@/lib/pdfExporter";
import { exportPaperAsWord } from "@/lib/wordExporter";
import { courseService } from "@/services/courseService";

import { storageService } from "@/lib/storageService";

export default function Export() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [finalPaper, setFinalPaper] = useState(null);
  const [exporting, setExporting] = useState(false);

  const paperId = sessionStorage.getItem('active_paper_id') || "QP-DEFAULT";

  useEffect(() => {
    const prepareData = async () => {
      const courseId = sessionStorage.getItem('active_course_id');
      const paperId = sessionStorage.getItem('active_paper_id');

      if (!paperId || !courseId) return;

      try {
        const course = await courseService.getCourseById(courseId);
        const blueprint = getBlueprint(paperId);
        const questions = getGeneratedQuestions(paperId);

        if (course && blueprint && questions.length > 0) {
          const assembled = assemblePaper(blueprint, questions);

          // STRICT SANITIZATION LAYER: Frontend Export Cleanup
          const sanitizeQuestionText = (qText) => {
            if (!qText) return qText;
            let cleaned = String(qText);
            cleaned = cleaned.replace(/\[.*?\]/g, '');
            cleaned = cleaned.replace(/\([0-9]+\s*(marks?|M)\)/gi, '');
            const prefixes = ['Question:', 'Q:', 'Auto-generated:', 'Fallback:'];
            for (const prefix of prefixes) {
              const regex = new RegExp(`^\\s*${prefix}\\s*`, 'i');
              cleaned = cleaned.replace(regex, '');
            }
            cleaned = cleaned.replace(/\s+/g, ' ').trim();
            if (cleaned.length > 0) {
              cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
              if (!/[.!?]$/.test(cleaned)) cleaned += '.';
            }
            return cleaned;
          };

          // Transform AssembledPaper to FinalPaper
          const paper = {
            paperId: paperId,
            subjectCode: course.subject_code || "N/A",
            subjectName: course.subject_name || "N/A",
            regulation: course.regulation || "R-2021",
            duration: "3 Hours",
            department: course.department || "Engineering",
            academicYear: course.academic_year || "2024-25",
            semester: course.semester || "N/A",
            maxMarks: 70,
            sectionA: assembled.sectionA.map((a) => ({
              questionNumber: a.slot.questionNumber,
              questionText: sanitizeQuestionText(a.question.questionText),
              co: a.slot.co,
              marks: a.slot.marks
            })),
            sectionB: assembled.sectionB.map((g) => ({
              groupNumber: g.groupNumber,
              option1: g.option1.map((o) => ({
                questionNumber: o.slot.questionNumber,
                questionText: sanitizeQuestionText(o.question.questionText),
                co: o.slot.co,
                marks: o.slot.marks
              })),
              option2: g.option2.map((o) => ({
                questionNumber: o.slot.questionNumber,
                questionText: sanitizeQuestionText(o.question.questionText),
                co: o.slot.co,
                marks: o.slot.marks
              }))
            }))
          };
          setFinalPaper(paper);
        }
      } catch (err) {
        console.error("Export preparation failed:", err);
      }
    };

    prepareData();
  }, []);

  const handleExport = async (type) => {
    if (!finalPaper) {
      toast({
        title: "Error",
        description: "Paper data not ready for export.",
        variant: "destructive"
      });
      return;
    }

    setExporting(true);
    try {
      if (type === 'pdf') {
        const token = localStorage.getItem('token');
        const response = await fetch("/api/export/pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ paperId, finalPaper })
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("[Export] Server returned error:", text);
          throw new Error("Failed to generate PDF. Server error.");
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/pdf")) {
          const errText = await response.text();
          console.error("[Export] Invalid content type:", contentType, "Body:", errText);
          throw new Error("Server returned an invalid file format (expected PDF).");
        }

        const blob = await response.blob();
        if (blob.size < 100) {
          console.error("[Export] Blob size too small:", blob.size);
          throw new Error("The generated PDF is empty or corrupted.");
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `QP-${paperId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        await exportPaperAsWord(finalPaper);
      }
      toast({
        title: "Export Success",
        description: `${type.toUpperCase()} file has been generated.`
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "An error occurred during file generation.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const exportActions = [
  {
    title: "Download PDF",
    description: "Standard exam format",
    icon: FileText,
    color: "text-red-500",
    bg: "bg-red-50",
    action: () => handleExport('pdf')
  },
  {
    title: "Download Word",
    description: "Editable .docx format",
    icon: Download,
    color: "text-blue-500",
    bg: "bg-blue-50",
    action: () => handleExport('word')
  },
  {
    title: "Audit Log",
    description: "View generation report",
    icon: ShieldCheck,
    color: "text-purple-500",
    bg: "bg-purple-50",
    action: () => toast({ title: "Coming Soon", description: "Audit logging is being finalized." })
  },
  {
    title: "Share Securely",
    description: "Send to Controller of Exams",
    icon: Share2,
    color: "text-slate-500",
    bg: "bg-slate-50",
    action: () => toast({ title: "Coming Soon", description: "Secure sharing is being finalized." })
  }];


  return (
    <AppLayout title="Export & Finalize">
            <div className="max-w-4xl mx-auto py-12">
                <div className="text-center space-y-6 mb-12">
                    <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex justify-center">
            
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </div>
                    </motion.div>

                    <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2">
            
                        <h2 className="text-4xl font-bold font-heading text-slate-900">Paper Generated Successfully!</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                            Your institutional question paper is ready for distribution.
                        </p>
                        <div className="inline-block mt-4 px-4 py-1.5 bg-slate-100 rounded-md">
                            <span className="text-sm font-mono text-slate-600 font-semibold uppercase tracking-tight">PAPER ID: {paperId}</span>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {exportActions.map((action, index) =>
          <motion.div
            key={action.title}
            initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}>
            
                            <Card
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={action.action}>
              
                                <CardContent className="p-6 flex items-center gap-5">
                                    <div className={`w-14 h-14 ${action.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                        {exporting && action.title.includes("Download") ?
                  <Loader2 className={`w-7 h-7 ${action.color} animate-spin`} /> :

                  <action.icon className={`w-7 h-7 ${action.color}`} />
                  }
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">{action.title}</h3>
                                        <p className="text-sm text-slate-500">{action.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
          )}
                </div>

                <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center">
          
                    <Button
            variant="outline"
            size="lg"
            className="bg-white border-slate-200 hover:bg-slate-50"
            onClick={() => {
              const activePaperId = sessionStorage.getItem('active_paper_id') || localStorage.getItem('qgen_active_paper');
              storageService.resetWorkflow(activePaperId);
              setLocation("/dashboard");
            }}>
            
                        <LayoutDashboard className="w-4 h-4 mr-2" /> Return to Dashboard
                    </Button>
                </motion.div>
            </div>
        </AppLayout>);

}