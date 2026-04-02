import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/adminService";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserMinus, FileText, ArrowUpRight, ArrowDownRight, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { data: dashboardData, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminService.getDashboardData(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Fallback data
  const data = dashboardData || {
    totalFaculty: 0,
    activeNow: 0,
    inactive: 0,
    totalPapers: 0,
    recentActivity: [],
    systemHealth: { serverUptime: 0, storageUsage: 0 }
  };

  return (
    <AdminLayout title="Admin Overview">
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-heading font-bold text-foreground">Dashboard</h2>
            <p className="text-muted-foreground mt-1">System-wide monitoring and faculty statistics.</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Faculty" value={data.totalFaculty} icon={Users} trend="+0%" trendUp={true} />
          <StatCard title="Active Now" value={data.activeNow} icon={UserCheck} trend="+0%" trendUp={true} color="text-green-600" />
          <StatCard title="Inactive" value={data.inactive} icon={UserMinus} trend="+0%" trendUp={false} color="text-orange-500" />
          <StatCard title="Total Papers" value={data.totalPapers.toLocaleString()} icon={FileText} trend="+0%" trendUp={true} color="text-blue-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-heading">Recent System Activity</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivity.length > 0 ? (
                  data.recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item.event}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{item.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity recorded.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats / Logs */}
          <Card className="border-border shadow-sm self-start">
            <CardHeader>
              <CardTitle className="text-lg font-heading">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Server Uptime</span>
                  <span className="font-bold text-green-600">{data.systemHealth.serverUptime}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500" 
                    style={{ width: `${data.systemHealth.serverUptime}%` }} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Storage Usage</span>
                  <span className="font-bold text-blue-600">{data.systemHealth.storageUsage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500" 
                    style={{ width: `${data.systemHealth.storageUsage}%` }} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>);

}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }) {
  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-lg bg-slate-100", color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className={cn("flex items-center text-xs font-medium", trendUp ? "text-green-600" : "text-red-600")}>
            {trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {trend}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-3xl font-bold font-heading">{value}</p>
        </div>
      </CardContent>
    </Card>);

}