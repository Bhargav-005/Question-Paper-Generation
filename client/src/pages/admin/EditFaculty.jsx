import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../services/adminService";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Shield,
  Key,
  Save,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Mail } from
"lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter } from
"@/components/ui/dialog";

export default function EditFaculty() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Password Reset State
  const [showResetModal, setShowResetModal] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [copied, setCopied] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    department: "",
    role: "",
    isActive: true
  });

  // Fetch Departments
  const { data: departments = [] } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: () => adminService.getDepartments(),
  });

  // Fetch User
  const { data: userData, isLoading } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => adminService.getUserById(id),
    onSuccess: (data) => {
      setFormData({
        fullName: data.full_name || "",
        department: data.department_id?.toString() || "",
        role: data.role?.toUpperCase() || "",
        isActive: data.status === "ACTIVE"
      });
    }
  });

  // Effect to sync form data when userData is fetched (React Query v4 onwards)
  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.full_name || "",
        department: userData.department_id?.toString() || "",
        role: userData.role?.toUpperCase() || "",
        isActive: userData.status === "ACTIVE"
      });
    }
  }, [userData]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data) => adminService.updateUser(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Faculty details updated successfully."
      });
      queryClient.invalidateQueries(["admin-user", id]);
      queryClient.invalidateQueries(["admin-faculty"]);
      setLocation('/admin/faculty');
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Reset Password Mutation
  const resetMutation = useMutation({
    mutationFn: () => adminService.resetPassword(id),
    onSuccess: (data) => {
      setTempPassword(data.tempPassword);
      setShowResetModal(true);
    },
    onError: (error) => {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      fullName: formData.fullName,
      department: formData.department,
      role: formData.role,
      status: formData.isActive ? 'ACTIVE' : 'INACTIVE'
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Faculty">
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Retrieving faculty profile...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Faculty">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>Admin</span> / <span>Faculty Management</span> / <span className="text-primary font-medium">Edit Faculty</span>
            </div>
            <h2 className="text-2xl font-bold font-heading">Edit Faculty</h2>
            <p className="text-muted-foreground">Update faculty account details and access level.</p>
          </div>
        </div>

        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription>
              Manage basic profile and system access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <form id="edit-faculty-form" onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email" className="text-muted-foreground">Institutional Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={userData?.email || ""}
                      disabled
                      className="bg-slate-50 pl-10 border-slate-200 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Email address cannot be modified after account creation.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(val) => setFormData({ ...formData, department: val })} 
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role / Access Level</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(val) => setFormData({ ...formData, role: val })} 
                    required
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
                  <p className="text-[10px] text-muted-foreground">Role determines access permissions within the system.</p>
                </div>

                <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">Account Status</Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.isActive ? "This faculty can log in and access the system." : "This faculty account is disabled."}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${formData.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
                    />
                  </div>
                </div>
              </div>
            </form>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-900">Security</h3>
              </div>
              <div className="bg-red-50/50 border border-red-100 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-red-900">Reset Password</p>
                  <p className="text-xs text-red-700">Generate a new temporary password for this user.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => resetMutation.mutate()}
                  disabled={resetMutation.isLoading}
                >
                  <Key className="w-4 h-4 mr-2" /> 
                  {resetMutation.isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6">
            <Button variant="ghost" type="button" onClick={() => setLocation('/admin/faculty')}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-faculty-form"
              disabled={updateMutation.isLoading}
              className="bg-primary hover:bg-primary/90 min-w-[140px]"
            >
              {updateMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Password Reset Successful
            </DialogTitle>
            <DialogDescription>
              A new temporary password has been generated for <strong>{formData.fullName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center gap-4 my-4">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Temporary Password</p>
            <div className="font-mono text-3xl font-bold tracking-wider text-primary">
              {tempPassword}
            </div>
            <Button variant="outline" size="sm" className="mt-2" onClick={copyToClipboard}>
              {copied ? <><Check className="w-4 h-4 mr-2 text-green-600" /> Copied</> : <><Copy className="w-4 h-4 mr-2" /> Copy Password</>}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowResetModal(false)}>Close & Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}