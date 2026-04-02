import { AdminLayout } from "../../components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Copy, Check, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../services/adminService";
import { useLocation } from "wouter";

export default function CreateFaculty() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dept: "",
    role: "FACULTY",
    password: ""
  });

  // Fetch Departments
  const { data: departments = [] } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: () => adminService.getDepartments(),
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data) => adminService.createUser(data),
    onSuccess: () => {
      toast({
        title: "Faculty Created Successfully",
        description: `Account for ${formData.name} has been created.`
      });
      queryClient.invalidateQueries(["admin-faculty"]);
      setLocation("/admin/faculty");
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      department_id: formData.dept
    });
  };

  const copyPass = () => {
    navigator.clipboard.writeText(formData.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminLayout title="Create Faculty">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-heading">Register New Faculty</h2>
          <p className="text-muted-foreground">Onboard new academic staff members to the Q-Gen system.</p>
        </div>

        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Account Details
            </CardTitle>
            <CardDescription>
              A system invitation will be sent to the email provided below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="create-faculty-form" onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Dr. Jane Smith"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Institutional Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="faculty@university.edu"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dept">Department</Label>
                    <Select
                      required
                      value={formData.dept}
                      onValueChange={(val) => setFormData({ ...formData, dept: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Dept" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.length > 0 ? (
                          departments.map((d) => (
                            <SelectItem key={d.id} value={d.id.toString()}>
                              {d.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">No departments found</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role / Access Level</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(val) => setFormData({ ...formData, role: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FACULTY">Faculty Member</SelectItem>
                        <SelectItem value="HOD">Head of Department (HOD)</SelectItem>
                        <SelectItem value="COE">Controller of Examinations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter initial password"
                      className="font-mono"
                      required 
                    />
                    <Button type="button" variant="outline" size="icon" onClick={copyPass}>
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Share this password with the faculty member for their initial login.</p>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6">
            <Button variant="outline" type="button" onClick={() => setLocation("/admin/faculty")}>Cancel</Button>
            <Button type="submit" form="create-faculty-form" disabled={createMutation.isLoading} className="min-w-[140px]">
              {createMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}