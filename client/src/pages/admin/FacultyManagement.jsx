import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../services/adminService";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, MoreVertical, Key, UserX, Edit2, Loader2, UserCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function FacultyManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch Departments
  const { data: departments = [] } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: () => adminService.getDepartments(),
  });

  // Fetch Faculty
  const { data: faculty = [], isLoading } = useQuery({
    queryKey: ["admin-faculty", selectedDept],
    queryFn: () => adminService.getUsers({ role: "FACULTY", department_id: selectedDept }),
  });

  // Status Toggle Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.updateStatus(id, status),
    onSuccess: (data, variables) => {
      toast({
        title: "Status Updated",
        description: `Faculty account is now ${variables.status}.`,
      });
      queryClient.invalidateQueries(["admin-faculty"]);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    statusMutation.mutate({ id, status: newStatus });
  };

  const filteredFaculty = faculty.filter((f) =>
    (f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout title="Faculty Management">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-heading">Faculty Members</h2>
            <p className="text-muted-foreground">Manage accounts and permissions for faculty staff.</p>
          </div>
          <Button onClick={() => setLocation('/admin/create-faculty')}>
            Add New Faculty
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or department..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="border rounded-md px-3 py-2 bg-background text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading institutional records...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Faculty Name</TableHead>
                  <TableHead>Email (ID)</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaculty.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                      No faculty records found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFaculty.map((member) => (
                    <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${member.status === 'INACTIVE' ? 'bg-slate-200 text-slate-500' : 'bg-primary/10 text-primary'} flex items-center justify-center font-bold text-xs uppercase`}>
                            {member.full_name?.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div className="flex flex-col">
                            <span>{member.full_name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{member.role}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{member.email}</TableCell>
                      <TableCell className="capitalize">{member.department || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={member.status === "ACTIVE" ? "default" : "secondary"}
                          className={member.status === "ACTIVE" ?
                            "bg-green-100 text-green-700 hover:bg-green-100 border-green-200 capitalize" :
                            "bg-red-50 text-red-600 hover:bg-red-50 border-red-100 capitalize"}>
                          {member.status || 'ACTIVE'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => setLocation(`/admin/faculty/${member.id}/edit`)}
                            title="Edit Account">
                            <Edit2 className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            onClick={() => setLocation(`/admin/faculty/${member.id}/edit`)}
                            title="Security Details">
                            <Key className="w-4 h-4" />
                          </Button>

                          <div className="w-px h-4 bg-slate-200 mx-1" />

                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${member.status === 'ACTIVE' ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                            onClick={() => toggleStatus(member.id, member.status)}
                            disabled={statusMutation.isLoading}
                            title={member.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}>
                            {member.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setLocation(`/admin/faculty/${member.id}/edit`)}>
                                <Edit2 className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}