import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";

export default function CourseSetup() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate save
    setTimeout(() => {
      setLoading(false);
      setLocation("/syllabus");
    }, 600);
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
                  <Input id="code" placeholder="e.g. CS8602" required className="font-mono" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Subject Name</Label>
                  <Input id="name" placeholder="e.g. Compiler Design" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Department / Branch</Label>
                  <Select>
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
                  <Select>
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
                  <Input id="regulation" placeholder="e.g. R-2017" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  <Select>
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
                  <div className="flex items-center space-x-2 border p-3 rounded-md flex-1 cursor-pointer hover:bg-slate-50 transition-colors bg-blue-50/50 border-primary">
                    <input type="radio" name="type" id="internal" className="accent-primary" defaultChecked />
                    <Label htmlFor="internal" className="cursor-pointer font-medium">Internal Assessment</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-md flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="radio" name="type" id="semester" className="accent-primary" />
                    <Label htmlFor="semester" className="cursor-pointer font-medium">Semester End Exam</Label>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6">
            <Button variant="outline" type="button">Cancel</Button>
            <Button type="submit" form="course-form" disabled={loading} className="min-w-[140px]">
              {loading ? "Saving..." : (
                <>
                  Next Step <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
