import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";
import { courseService, getCourseSetup } from "@/services/courseService";
import { useToast } from "@/hooks/use-toast";


export default function CourseSetup() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    subject_code: "",
    subject_name: "",
    department: "",
    semester: "",
    regulation: "R-2021",
    academic_year: "2024-25",
    exam_type: "internal"
  });

  useEffect(() => {
    const paperId = sessionStorage.getItem('active_paper_id');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const initialEmptyState = {
      subject_code: "",
      subject_name: "",
      department: "",
      semester: "",
      regulation: "",
      academic_year: "",
      exam_type: "internal"
    };

    if (paperId && uuidRegex.test(paperId)) {
      console.log("[CourseSetup] Fetching data for paper:", paperId);
      getCourseSetup(paperId).then((res) => {
        if (res.success && res.data) {
          setFormData({
            subject_code: res.data.subject_code || "",
            subject_name: res.data.subject_name || "",
            department: res.data.department || "",
            semester: res.data.semester || "",
            regulation: res.data.regulation || "R-2021",
            academic_year: res.data.academic_year || "2024-25",
            exam_type: res.data.exam_type || "internal"
          });
        } else {
          setFormData(initialEmptyState);
        }
      }).catch((err) => {
        console.error("[CourseSetup] Load error:", err);
        setFormData(initialEmptyState);
      });
    } else {
      setFormData(initialEmptyState);
    }
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const existingPaperId = sessionStorage.getItem('active_paper_id');

      let paperId = existingPaperId;

      if (existingPaperId) {
        // If we already have a paper ID, just update its context (Step 1)
        await courseService.updateCourse(existingPaperId, {
          subject_code: formData.subject_code,
          subject_name: formData.subject_name,
          department: formData.department,
          semester: formData.semester,
          regulation: formData.regulation,
          academic_year: formData.academic_year,
          exam_type: formData.exam_type
        });
        console.log("[CourseSetup] Updated existing course context:", existingPaperId);
      } else {
        // Create new paper and get its ID
        const course = await courseService.createCourse({
          subject_code: formData.subject_code,
          subject_name: formData.subject_name,
          department: formData.department,
          semester: formData.semester,
          regulation: formData.regulation,
          academic_year: formData.academic_year,
          exam_type: formData.exam_type,
          duration_minutes: 180,
          total_marks: 100
        });
        paperId = course.id;
        sessionStorage.setItem('active_paper_id', paperId);
        console.log("[CourseSetup] Created new course:", paperId);
      }

      // Ensure both keys are set for backward compatibility if needed, 
      // but 'active_paper_id' is our primary standard now
      sessionStorage.setItem('active_course_id', paperId);

      toast({
        title: "Success",
        description: "Course details saved successfully."
      });

      setLocation("/syllabus");
    } catch (error) {
      console.error("Save Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save course details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <AppLayout title="Course Context Setup">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-heading">Step 1: Course Details</h2>
          <p className="text-muted-foreground">Define the academic context for this question paper.</p>
        </div>

        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>
              These details will appear on the header of the final question paper.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="course-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="code">Subject Code</Label>
                  <Input
                    id="code"
                    placeholder="e.g. CS8602"
                    required
                    className="font-mono"
                    value={formData.subject_code}
                    onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })} />
                  
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Subject Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Compiler Design"
                    required
                    value={formData.subject_name}
                    onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })} />
                  
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Department / Branch</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(v) => setFormData({ ...formData, department: v })}>
                    
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cse">Computer Science & Engg.</SelectItem>
                      <SelectItem value="ece">Electronics & Comm. Engg.</SelectItem>
                      <SelectItem value="me">Mechanical Engg.</SelectItem>
                      <SelectItem value="it">Information Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(v) => setFormData({ ...formData, semester: v })}>
                    
                    <SelectTrigger>
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester I</SelectItem>
                      <SelectItem value="2">Semester II</SelectItem>
                      <SelectItem value="3">Semester III</SelectItem>
                      <SelectItem value="4">Semester IV</SelectItem>
                      <SelectItem value="5">Semester V</SelectItem>
                      <SelectItem value="6">Semester VI</SelectItem>
                      <SelectItem value="7">Semester VII</SelectItem>
                      <SelectItem value="8">Semester VIII</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regulation">Regulation</Label>
                  <Input
                    id="regulation"
                    placeholder="e.g. R-2017"
                    value={formData.regulation}
                    onChange={(e) => setFormData({ ...formData, regulation: e.target.value })} />
                  
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  <Select
                    value={formData.academic_year}
                    onValueChange={(v) => setFormData({ ...formData, academic_year: v })}>
                    
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-24">2023-2024</SelectItem>
                      <SelectItem value="2024-25">2024-2025</SelectItem>
                      <SelectItem value="2025-26">2025-2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label>Exam Type</Label>
                <div className="flex gap-4">
                  <div
                    className={`flex items-center space-x-2 border p-3 rounded-md flex-1 cursor-pointer hover:bg-slate-50 transition-colors ${formData.exam_type === 'internal' ? 'bg-blue-50/50 border-primary' : ''}`}
                    onClick={() => setFormData({ ...formData, exam_type: 'internal' })}>
                    
                    <input
                      type="radio"
                      name="type"
                      id="internal"
                      className="accent-primary"
                      checked={formData.exam_type === 'internal'}
                      readOnly />
                    
                    <Label htmlFor="internal" className="cursor-pointer font-medium">Internal Assessment</Label>
                  </div>
                  <div
                    className={`flex items-center space-x-2 border p-3 rounded-md flex-1 cursor-pointer hover:bg-slate-50 transition-colors ${formData.exam_type === 'semester' ? 'bg-blue-50/50 border-primary' : ''}`}
                    onClick={() => setFormData({ ...formData, exam_type: 'semester' })}>
                    
                    <input
                      type="radio"
                      name="type"
                      id="semester"
                      className="accent-primary"
                      checked={formData.exam_type === 'semester'}
                      readOnly />
                    
                    <Label htmlFor="semester" className="cursor-pointer font-medium">Semester End Exam</Label>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6">
            <Button variant="outline" type="button" onClick={() => setLocation("/dashboard")}>Cancel</Button>
            <Button type="submit" form="course-form" disabled={loading} className="min-w-[140px]">
              {loading ? "Saving..." :
              <>
                  Next Step <ArrowRight className="ml-2 w-4 h-4" />
                </>
              }
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>);

}