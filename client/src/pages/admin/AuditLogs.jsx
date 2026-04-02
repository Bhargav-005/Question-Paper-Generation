import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/adminService";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Shield, Download, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["audit-logs", searchTerm, startDate, endDate],
    queryFn: () => adminService.getAuditLogs({
      search: searchTerm,
      start_date: startDate ? `${startDate}T00:00:00` : "",
      end_date: endDate ? `${endDate}T23:59:59` : ""
    }),
    refetchInterval: 30000, // Real-time refresh every 30s
  });

  const handleExport = async () => {
    try {
      await adminService.exportAuditLogs();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <AdminLayout title="Audit Logs">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-heading">Security Audit Logs</h2>
            <p className="text-muted-foreground">Immutable trail of all administrative actions in the system.</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by action or user..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("gap-2", (startDate || endDate) && "border-primary text-primary bg-primary/5")}>
                <Calendar className="w-4 h-4" /> 
                {startDate || endDate ? (
                  <span>{startDate || '...'} to {endDate || '...'}</span>
                ) : (
                  "Filter Dates"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 space-y-4" align="end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              {(startDate || endDate) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-xs h-8">
                  Reset Filters
                </Button>
              )}
            </PopoverContent>
          </Popover>
          {(searchTerm || startDate || endDate) && (
            <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear all filters">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead>Action Type</TableHead>
                <TableHead>Admin User</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="h-12 animate-pulse bg-slate-50/50" />
                  </TableRow>
                ))
              ) : logs && logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-semibold">{log.action_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{log.admin_user}</TableCell>
                    <TableCell className="font-mono text-xs">{log.target_entity || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {log.timestamp ? format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss") : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        log.status === 'Success' ? "border-green-200 text-green-700 bg-green-50" :
                        log.status === 'Failure' ? "border-red-200 text-red-700 bg-red-50" :
                        "border-orange-200 text-orange-700 bg-orange-50"
                      )}>
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No matching audit logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}