import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  BarChart3 
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  return (
    <AppLayout title="Faculty Dashboard">
      {/* Welcome Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-foreground">Welcome, Prof. Doe</h2>
          <p className="text-muted-foreground mt-1">Manage your question papers and course outcomes.</p>
        </div>
        <Link href="/course-setup">
            <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <Plus className="mr-2 h-5 w-5" />
            Create New Question Paper
            </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
            title="Total Papers" 
            value="12" 
            description="Generated this semester"
            icon={FileText}
            trend="+2 from last month"
            trendUp={true}
        />
        <StatCard 
            title="Pending Review" 
            value="3" 
            description="Awaiting approval"
            icon={Clock}
            color="text-orange-500"
        />
        <StatCard 
            title="CO Coverage" 
            value="94%" 
            description="Average alignment"
            icon={CheckCircle2}
            color="text-green-600"
            trend="+5% improvement"
            trendUp={true}
        />
        <StatCard 
            title="Avg. Difficulty" 
            value="Balanced" 
            description="Bloom's distribution"
            icon={BarChart3}
            color="text-blue-500"
        />
      </div>

      {/* Main Content Area: Recent Papers & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-heading">Recent Question Papers</CardTitle>
                <CardDescription>Papers generated in the last 30 days</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="text-xs">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                    { code: "CS401", title: "Advanced Algorithms", date: "2 hours ago", status: "Draft", progress: 40 },
                    { code: "CS305", title: "Database Management", date: "Yesterday", status: "Generated", progress: 100 },
                    { code: "CS202", title: "Data Structures", date: "3 days ago", status: "Pending Review", progress: 90 },
                    { code: "MA101", title: "Engineering Math I", date: "1 week ago", status: "Approved", progress: 100 },
                ].map((paper, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs group-hover:bg-primary group-hover:text-white transition-colors">
                        {paper.code.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{paper.title}</h4>
                        <p className="text-xs text-muted-foreground">{paper.code} • Edited {paper.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="hidden md:block w-32">
                             <div className="flex justify-between text-[10px] mb-1 text-muted-foreground">
                                <span>Progress</span>
                                <span>{paper.progress}%</span>
                             </div>
                             <Progress value={paper.progress} className="h-1.5" />
                        </div>
                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            paper.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            paper.status === 'Generated' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            paper.status === 'Draft' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                            'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                            {paper.status}
                        </div>
                        <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                  </div>
                ))}
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
                        <div className="text-xs text-muted-foreground">3 items need attention</div>
                    </div>
                </Button>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
                <CardTitle className="text-md font-heading flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Semester Analytics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Bloom's L1-L2 Usage</span>
                            <span className="font-bold">35%</span>
                        </div>
                        <Progress value={35} className="h-2" />
                        <p className="text-[10px] text-muted-foreground">Target: 40% (Slightly under)</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Bloom's L3-L6 Usage</span>
                            <span className="font-bold">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                        <p className="text-[10px] text-muted-foreground">Target: 60% (On track)</p>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, description, icon: Icon, trend, trendUp, color }: any) {
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
                        {trend && (
                            <span className={trendUp ? "text-green-600 mr-1" : "text-red-600 mr-1"}>
                                {trend}
                            </span>
                        )}
                        <span>{description}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
