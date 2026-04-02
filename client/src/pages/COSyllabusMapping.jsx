import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Brain, ThumbsUp, ThumbsDown, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { localDraftManager } from "@/lib/localDraftManager";
import { autoMapCOs } from "@/lib/hybridMappingEngine";
import { Checkbox } from "@/components/ui/checkbox";
import { syllabusParser } from "@/lib/syllabusParser";










export default function COSyllabusMapping() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mappings, setMappings] = useState([]);
  const [coverage, setCoverage] = useState({ mapped: 0, total: 0, percentage: 0 });
  const paperId = sessionStorage.getItem('active_paper_id') || "";

  useEffect(() => {
    if (!paperId) {
      toast({ title: "Error", description: "No active paper ID found.", variant: "destructive" });
      setLocation("/course-setup");
      return;
    }

    // 1. Load basic data
    const draftSyllabus = localDraftManager.getSyllabus(paperId);
    const draftCOs = localDraftManager.getCOs(paperId);

    // 2. Load statuses and selections
    const savedStatus = JSON.parse(localStorage.getItem(`qgen_mapping_status_${paperId}`) || "{}");
    const savedSelections = JSON.parse(localStorage.getItem(`qgen_mapping_selections_${paperId}`) || "{}");

    // 3. Generate auto mapping based on structural rules
    // Note: autoMapCOs now returns flattened unique strings for each CO
    const autoResults = autoMapCOs(draftSyllabus);

    // 4. Calculate total syllabus topics for coverage validation
    const allSyllabusTopics = new Set(draftSyllabus.flatMap((b) => syllabusParser.flattenTopics(b.topics)));
    const totalCount = allSyllabusTopics.size;

    // 5. Build Mapping state with structure preservation
    const coCodes = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6"];
    const initialMappings = coCodes.map((code) => {
      const coInfo = draftCOs.find((c) => c.co === code) || { description: "Outcome not defined", bloom: "L1" };
      const autoFlattened = autoResults[code] || [];

      // Filter draftSyllabus to get relevant ParsedTopic objects for this CO
      // Mapping rule: CO1 -> Unit 1 Sec 1, etc.
      let relevantBlocks = [];
      if (code === "CO1") relevantBlocks = draftSyllabus.filter((b) => b.unit === 1 && b.section === 1);else
      if (code === "CO2") relevantBlocks = draftSyllabus.filter((b) => b.unit === 1 && b.section === 2 || b.unit === 2 && b.section === 1);else
      if (code === "CO3") relevantBlocks = draftSyllabus.filter((b) => b.unit === 2 && b.section === 2);else
      if (code === "CO4") relevantBlocks = draftSyllabus.filter((b) => b.unit === 3 && b.section === 1);else
      if (code === "CO5") relevantBlocks = draftSyllabus.filter((b) => b.unit === 3 && b.section === 2 || b.unit === 4 && b.section === 1);else
      if (code === "CO6") relevantBlocks = draftSyllabus.filter((b) => b.unit === 4 && b.section === 2);

      const structuredTopics = relevantBlocks.flatMap((b) => b.topics);

      return {
        co: code,
        description: coInfo.description,
        bloom: coInfo.bloom,
        structuredTopics,
        status: savedStatus[code] || "pending",
        selectedTopics: savedSelections[code] || autoFlattened
      };
    });

    setMappings(initialMappings);
    updateCoverage(initialMappings, totalCount);
  }, [paperId]);

  const updateCoverage = (currentMappings, total) => {
    const allSelected = new Set(currentMappings.flatMap((m) => m.selectedTopics));
    const mapped = allSelected.size;
    const percentage = total > 0 ? mapped / total * 100 : 0;
    setCoverage({ mapped, total, percentage });

    if (percentage < 90 && total > 0) {
      console.warn(`[Coverage Warning] Only ${percentage.toFixed(1)}% of syllabus topics are mapped to Outcomes.`);
    }
  };

  const saveToLocal = (newMappings) => {
    const statusMap = {};
    const selectionMap = {};

    newMappings.forEach((m) => {
      statusMap[m.co] = m.status;
      selectionMap[m.co] = m.selectedTopics;
    });

    localStorage.setItem(`qgen_mapping_status_${paperId}`, JSON.stringify(statusMap));
    localStorage.setItem(`qgen_mapping_selections_${paperId}`, JSON.stringify(selectionMap));

    updateCoverage(newMappings, coverage.total);
  };

  const handleStatusChange = (co, status) => {
    const newMappings = mappings.map((m) => m.co === co ? { ...m, status } : m);
    setMappings(newMappings);
    saveToLocal(newMappings);

    toast({
      title: status === 'approved' ? "Mapping Approved" : "Mapping Rejected",
      description: `Status updated for ${co}.`
    });
  };

  const handleToggleTopic = (co, topicText, checked) => {
    const newMappings = mappings.map((m) => {
      if (m.co === co) {
        const newSelected = checked ?
        [...m.selectedTopics, topicText] :
        m.selectedTopics.filter((t) => t !== topicText);
        return { ...m, selectedTopics: newSelected };
      }
      return m;
    });
    setMappings(newMappings);
    saveToLocal(newMappings);
  };

  const handleReset = (co) => {
    // Structural default = all unique topics in its assigned blocks
    const mapping = mappings.find((m) => m.co === co);
    if (!mapping) return;

    const defaultSelected = syllabusParser.flattenTopics(mapping.structuredTopics);

    const newMappings = mappings.map((m) => {
      if (m.co === co) {
        return { ...m, status: "pending", selectedTopics: defaultSelected };
      }
      return m;
    });
    setMappings(newMappings);
    saveToLocal(newMappings);
    toast({ title: "Reset", description: `Mappings for ${co} reset to structural defaults.` });
  };

  const handleSubmit = () => {
    if (coverage.percentage < 80) {
      toast({
        title: "Low Coverage Warning",
        description: "Less than 80% of your syllabus is mapped. Please ensure key topics are included.",
        variant: "destructive"
      });
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLocation("/generate");
    }, 800);
  };

  return (
    <AppLayout title="Structural CO-Syllabus Mapping">
      <div className="max-w-6xl mx-auto py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Structural Alignment Review
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Outcome-Unit alignment is determined by curriculum structure. Please review and approve.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={coverage.percentage < 90 ? "outline" : "secondary"} className={coverage.percentage < 90 ? "border-orange-200 text-orange-700 bg-orange-50" : "bg-primary/5"}>
              {coverage.percentage < 90 && <AlertTriangle className="w-3 h-3 mr-1" />}
              Syllabus Coverage: {coverage.percentage.toFixed(0)}%
            </Badge>
            <div className="text-[10px] text-muted-foreground font-medium">
              {coverage.mapped} of {coverage.total} unique topics mapped
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {mappings.map((m) =>
          <Card key={m.co} className={`border-l-4 transition-all ${m.status === 'approved' ? 'border-l-green-500 bg-green-50/10' : m.status === 'rejected' ? 'border-l-red-500' : 'border-l-primary'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-xs font-mono font-bold">
                        {m.co}
                      </span>
                      <Badge variant="secondary" className="text-[10px] h-4">{m.bloom}</Badge>
                      {m.status === 'approved' && <Badge className="bg-green-600 text-[10px] h-4">Approved</Badge>}
                      {m.status === 'rejected' && <Badge variant="destructive" className="text-[10px] h-4">Rejected</Badge>}
                    </div>
                    <CardTitle className="text-base font-medium leading-relaxed">
                      {m.description}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleReset(m.co)} className="h-8 w-8 p-0">
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4">
                    {m.structuredTopics.map((topic, pIdx) =>
                  <div key={pIdx} className="contents">
                        {/* Parent Topic */}
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-white group hover:border-primary/30 transition-colors">
                          <Checkbox
                        id={`${m.co}-p-${pIdx}`}
                        checked={m.selectedTopics.includes(topic.title)}
                        onCheckedChange={(checked) => handleToggleTopic(m.co, topic.title, !!checked)} />
                      
                          <label htmlFor={`${m.co}-p-${pIdx}`} className="text-sm font-bold leading-tight cursor-pointer flex-1 text-slate-900">
                            {topic.title}
                          </label>
                        </div>

                        {/* Subtopics */}
                        {topic.subtopics.map((sub, sIdx) =>
                    <div key={sIdx} className="flex items-center gap-3 p-2.5 ml-6 rounded-lg border border-dashed bg-slate-50/30 group hover:border-primary/20 transition-colors">
                            <Checkbox
                        id={`${m.co}-p-${pIdx}-s-${sIdx}`}
                        checked={m.selectedTopics.includes(sub)}
                        onCheckedChange={(checked) => handleToggleTopic(m.co, sub, !!checked)} />
                      
                            <label htmlFor={`${m.co}-p-${pIdx}-s-${sIdx}`} className="text-xs font-medium leading-tight cursor-pointer flex-1 text-slate-600">
                              <span className="text-slate-400 mr-1.5">•</span> {sub}
                            </label>
                          </div>
                    )}
                      </div>
                  )}
                    {m.structuredTopics.length === 0 &&
                  <div className="col-span-full py-4 text-center text-muted-foreground text-sm italic border-2 border-dashed rounded-lg">
                        No topics structurally aligned to this outcome for the provided syllabus.
                      </div>
                  }
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 flex justify-between py-3 border-t">
                <div className="text-[11px] text-muted-foreground">
                  {m.selectedTopics.length} total elements selected for {m.co}
                </div>
                <div className="flex gap-2">
                  <Button
                  size="sm"
                  variant={m.status === 'rejected' ? 'destructive' : 'outline'}
                  className="h-8 text-xs bg-white"
                  onClick={() => handleStatusChange(m.co, 'rejected')}>
                  
                    <ThumbsDown className="h-3 w-3 mr-1.5" /> Reject
                  </Button>
                  <Button
                  size="sm"
                  className={`h-8 text-xs ${m.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={() => handleStatusChange(m.co, 'approved')}>
                  
                    <ThumbsUp className="h-3 w-3 mr-1.5" /> Approve
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="mt-8 flex justify-between items-center py-6 border-t">
          <Button variant="ghost" onClick={() => setLocation("/outcomes")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Outcomes
          </Button>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Structural Integrity Verified
              </span>
              <Badge variant="outline" className="text-[10px] mt-1">
                {mappings.filter((m) => m.status === 'approved').length} / 6 Approved
              </Badge>
            </div>
            <Button size="lg" onClick={handleSubmit} disabled={loading} className="px-8 shadow-lg shadow-primary/20">
              {loading ? "Processing..." : "Finish Mapping & Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>);

}