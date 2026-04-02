import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { localDraftManager } from "@/lib/localDraftManager";
import { useToast } from "@/hooks/use-toast";
import { syllabusParser } from "@/lib/syllabusParser";

export default function Syllabus() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("unit1");
  const { toast } = useToast();

  const [unitsData, setUnitsData] = useState({
    unit1: { title: "", topics: "" },
    unit2: { title: "", topics: "" },
    unit3: { title: "", topics: "" },
    unit4: { title: "", topics: "" }
  });

  useEffect(() => {
    const paperId = sessionStorage.getItem('active_paper_id');
    if (paperId) {
      const draft = localDraftManager.getSyllabus(paperId);
      if (draft && draft.length > 0) {
        const newUnitsData = {};
        [1, 2, 3, 4].forEach((u) => {
          const uKey = `unit${u}`;
          const s1 = draft.find((b) => b.unit === u && b.section === 1);
          const s2 = draft.find((b) => b.unit === u && b.section === 2);

          if (s1 || s2) {
            newUnitsData[uKey] = {
              title: s1?.title || s2?.title || "",
              topics: syllabusParser.formatForUI({
                s1: s1?.topics || [],
                s2: s2?.topics || []
              })
            };
          } else {
            newUnitsData[uKey] = { title: "", topics: "" };
          }
        });
        setUnitsData(newUnitsData);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const paperId = sessionStorage.getItem('active_paper_id');
    if (!paperId) return;

    const timeoutId = setTimeout(() => {
      const blocks = [];
      [1, 2, 3, 4].forEach((unitNum) => {
        const data = unitsData[`unit${unitNum}`];
        const parsed = syllabusParser.parseUnit(data.topics);
        const { s1, s2 } = syllabusParser.splitIntoSections(parsed);

        blocks.push({
          unit: unitNum,
          section: 1,
          title: data.title,
          topics: s1
        });
        blocks.push({
          unit: unitNum,
          section: 2,
          title: "",
          topics: s2
        });
      });

      localDraftManager.saveSyllabus(paperId, blocks);
      console.log("[Syllabus] Intelligent structural storage enforced (8 blocks)");
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [unitsData]);



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
      // In development mode, we just navigate. Auto-save has already updated localStorage.
      toast({
        title: "Success",
        description: "Syllabus draft saved locally."
      });

      setLocation("/outcomes");
    } catch (error) {
      console.error("Save Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save syllabus.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUnit = (unit, field, value) => {
    setUnitsData({
      ...unitsData,
      [unit]: {
        ...unitsData[unit],
        [field]: value
      }
    });
  };

  return (
    <AppLayout title="Syllabus Entry">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-heading">Step 2: Syllabus Input</h2>
            <p className="text-muted-foreground">Provide unit-wise topics for the system to understand coverage.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="unit1">Unit I</TabsTrigger>
            <TabsTrigger value="unit2">Unit II</TabsTrigger>
            <TabsTrigger value="unit3">Unit III</TabsTrigger>
            <TabsTrigger value="unit4">Unit IV</TabsTrigger>
          </TabsList>

          {["unit1", "unit2", "unit3", "unit4"].map((unit, index) =>
          <TabsContent key={unit} value={unit}>
              <Card className="shadow-sm border-t-4 border-t-primary">
                <CardHeader>
                  <CardTitle>Unit {index + 1} Syllabus</CardTitle>
                  <CardDescription>
                    Paste the topics for this unit. The AI will automatically identify keywords and concepts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${unit}-title`}>Unit {index + 1} Title</Label>
                      <Input
                      id={`${unit}-title`}
                      placeholder="e.g. Introduction & Basics"
                      value={unitsData[unit].title}
                      onChange={(e) => updateUnit(unit, 'title', e.target.value)} />
                    
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${unit}-topics`}>Topics (New line for each topic)</Label>
                      <Textarea
                      id={`${unit}-topics`}
                      placeholder="Paste unit topics here..."
                      className="min-h-[250px] font-normal leading-relaxed resize-none p-4"
                      value={unitsData[unit].topics}
                      onChange={(e) => updateUnit(unit, 'topics', e.target.value)} />
                    
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-slate-50/50 p-6 border-t">
                  <Button variant="ghost" onClick={() => {
                  if (index > 0) setActiveTab(`unit${index}`);else
                  setLocation("/course-setup");
                }}>
                    <ArrowLeft className="mr-2 w-4 h-4" /> Previous
                  </Button>

                  {index < 3 ?
                <Button onClick={() => setActiveTab(`unit${index + 2}`)}>
                      Next Unit <ArrowRight className="ml-2 w-4 h-4" />
                    </Button> :

                <Button onClick={handleSubmit} disabled={loading}>
                      {loading ? "Processing..." :
                  <>Save & Continue <ArrowRight className="ml-2 w-4 h-4" /></>
                  }
                    </Button>
                }
                </CardFooter>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>);

}