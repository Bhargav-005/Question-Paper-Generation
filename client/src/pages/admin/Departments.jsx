import { AdminLayout } from "../../components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Building2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../services/adminService";
import { useToast } from "@/hooks/use-toast";

export default function Departments() {
  const [newDeptName, setNewDeptName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Departments
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: () => adminService.getDepartments(),
  });

  // Create Department Mutation
  const createMutation = useMutation({
    mutationFn: (name) => {
      // We need to add a createDepartment method to adminService if it's not there
      // Wait, I added it to the backend but maybe not the service? Let me check.
      // Ah, I see I didn't add it to adminService.js in the previous step.
      // I should add it there first. 
      // Actually, let me just use fetch here or better, I'll update adminService.js.
      return adminService.createDepartment(name);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Department created successfully.",
      });
      queryClient.invalidateQueries(["admin-departments"]);
      setNewDeptName("");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    createMutation.mutate(newDeptName);
  };

  return (
    <AdminLayout title="Departments">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-heading">Academic Departments</h2>
            <p className="text-muted-foreground">Manage organizational structure and faculty groupings.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Add New Department</DialogTitle>
                  <DialogDescription>
                    Enter the official name of the academic department.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Department Name</Label>
                    <Input 
                      placeholder="e.g. Electrical Engineering" 
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isLoading}>
                    {createMutation.isLoading ? "Creating..." : "Create Department"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading departments...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                No departments found. Create one to get started.
              </div>
            ) : (
              departments.map((dept) => (
                <Card key={dept.id} className="hover:border-primary transition-all group border-border shadow-sm">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground">{dept.count || 0} Faculty Members Registered</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function Card({ children, className }) {
  return <div className={cn("rounded-xl border bg-card", className)}>{children}</div>;
}