import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BarChart3 } from
"lucide-react";
import { Link, useLocation } from "wouter";


import { paperService } from "@/services/paperService";
import { useToast } from "@/hooks/use-toast";
import { storageService } from "@/lib/storageService";

export default function Dashboard() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userName = localStorage.getItem('user_name') || 'Academic Faculty';

  useEffect(() => {
    async function loadData() {
      try {
        const data = await paperService.getUserPapers();
        setPapers(data);
        if (process.env.NODE_ENV === 'development') {
          console.log("Fetched papers:", data);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        if (error.message !== 'Session expired. Please login again.') {
          toast({
            title: "Fetch Error",
            description: error.message || "Could not retrieve your question papers.",
            variant: "destructive"
          });
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast]);

  const stats = {
    totalPapers: papers.length,
    pendingReview: papers.filter((p) => p.status === 'DRAFT').length, // Assuming DRAFT is 'pending' for now
    avgCoverage: papers.length > 0 ? "95%" : "0%",
    difficulty: papers.length > 0 ? "Balanced" : "N/A"
  };

  return (
    <AppLayout title="Faculty Dashboard">
      {/* Welcome Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-foreground">Welcome, {userName}</h2>
          <p className="text-muted-foreground mt-1">Manage your question papers and course outcomes.</p>
        </div>
        <Button
          size="lg"
          className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          onClick={() => {
            const newPaperId = crypto.randomUUID();
            sessionStorage.setItem('active_paper_id', newPaperId);
            localStorage.setItem('qgen_active_paper', newPaperId);
            storageService.resetWorkflow(newPaperId);
            setLocation("/course-setup");
          }}>
          
          <Plus className="mr-2 h-5 w-5" />
          Create New Question Paper
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Papers"
          value={stats.totalPapers.toString()}
          description="Active in system"
          icon={FileText}
          trend={stats.totalPapers > 0 ? "+1 newly added" : ""}
          trendUp={true} />
        
        <StatCard
          title="Pending Review"
          value={stats.pendingReview.toString()}
          description="Awaiting approval"
          icon={Clock}
          color="text-orange-500" />
        
        <StatCard
          title="CO Coverage"
          value={stats.avgCoverage}
          description="Average alignment"
          icon={CheckCircle2}
          color="text-green-600"
          trend={stats.totalPapers > 0 ? "+2% this week" : ""}
          trendUp={true} />
        
        <StatCard
          title="Avg. Difficulty"
          value={stats.difficulty}
          description="Bloom's distribution"
          icon={BarChart3}
          color="text-blue-500" />
        
      </div>

      {/* Main Content Area: Recent Papers & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-heading">Recent Question Papers</CardTitle>
                <CardDescription>
                  {papers.length > 0 ?
                  `Showing ${Math.min(papers.length, 5)} most recent papers` :
                  "No papers generated yet"}
                </CardDescription>
              </div>
              {papers.length > 0 && <Button variant="outline" size="sm" className="text-xs">View All</Button>}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ?
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div> :
                papers.length > 0 ?
                papers.slice(0, 5).map((paper, i) =>
                <div
                  key={paper.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => {
                    sessionStorage.setItem('active_paper_id', paper.id);
                    localStorage.setItem('qgen_active_paper', paper.id);
                    setLocation(`/preview-paper/${paper.id}`);
                  }}>
                  
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs group-hover:bg-primary group-hover:text-white transition-colors">
                          {paper.title.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{paper.title}</h4>
                          <p className="text-xs text-muted-foreground">ID: {paper.id.substring(0, 8)} • Created {new Date(paper.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${paper.status === 'FINALIZED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'}`
                    }>
                          {paper.status === 'FINALIZED' ? 'Finalized' : 'Draft'}
                        </div>
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                ) :

                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50/50">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No question papers found</p>
                    <p className="text-xs text-muted-foreground mt-1">Start by creating your first question paper.</p>
                    <Link href="/course-setup">
                      <Button variant="outline" size="sm" className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Paper
                      </Button>
                    </Link>
                  </div>
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health / Quick Actions */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-md font-heading">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                <div className="bg-primary/10 p-2 rounded mr-3 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Review Syllabus</div>
                  <div className="text-xs text-muted-foreground">Check unit coverage</div>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                <div className="bg-orange-100 p-2 rounded mr-3 text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Flagged Questions</div>
                  <div className="text-xs text-muted-foreground">No active issues found</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="text-md font-heading flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Database Status</span>
                    <span className="font-bold text-green-600">Local Secure Storage</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Persistence enabled</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">AI Mapping Engine</span>
                    <span className="font-bold text-green-600">Online</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Deterministic Structural Engine Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>);

}

function StatCard({ title, value, description, icon: Icon, trend, trendUp, color }) {
  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && <Icon className={`h-4 w-4 ${color || "text-primary"}`} />}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold">{value}</span>
          <div className="flex items-center text-xs text-muted-foreground">
            {trend &&
            <span className={trendUp ? "text-green-600 mr-1" : "text-red-600 mr-1"}>
                {trend}
              </span>
            }
            <span>{description}</span>
          </div>
        </div>
      </CardContent>
    </Card>);

}