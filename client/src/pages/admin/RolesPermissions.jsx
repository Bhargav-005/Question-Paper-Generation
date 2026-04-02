import { AdminLayout } from "../../components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ShieldCheck,
  ArrowDown,
  Check,
  Minus,
  Info,
  User,
  Users,
  ShieldAlert,
  Building2 } from
"lucide-react";
import React, { useEffect } from "react";
import { useLocation } from "wouter";

export default function RolesPermissions() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Security logic: Protect route, only Admin role can access
    const userRole = localStorage.getItem('user_role');
    if (userRole !== 'ADMIN') {
      setLocation('/dashboard');
    }
  }, [setLocation]);

  const roles = [
  {
    name: "Admin",
    level: "System",
    description: "Full administrative control over system configuration and user management.",
    icon: ShieldAlert,
    color: "border-red-200"
  },
  {
    name: "Controller of Examinations (COE)",
    level: "Final Authority",
    description: "Final approval and locking authority for examination papers.",
    icon: Building2,
    color: "border-orange-200"
  },
  {
    name: "Head of Department (HOD)",
    level: "Department Oversight",
    description: "Reviews and approves papers within assigned department.",
    icon: Users,
    color: "border-blue-200"
  },
  {
    name: "Faculty Member",
    level: "Individual",
    description: "Creates and manages own question papers.",
    icon: User,
    color: "border-green-200"
  }];


  const permissions = [
  { name: "Create Question Paper", admin: false, coe: false, hod: false, faculty: true },
  { name: "Edit Own Papers", admin: false, coe: false, hod: false, faculty: true },
  { name: "View Department Papers", admin: false, coe: true, hod: true, faculty: false },
  { name: "Approve Papers", admin: false, coe: true, hod: true, faculty: false },
  { name: "Final Lock Papers", admin: false, coe: true, hod: false, faculty: false },
  { name: "Manage Faculty Accounts", admin: true, coe: false, hod: false, faculty: false },
  { name: "Manage Departments", admin: true, coe: false, hod: false, faculty: false },
  { name: "View Audit Logs", admin: true, coe: true, hod: false, faculty: false },
  { name: "Modify System Settings", admin: true, coe: false, hod: false, faculty: false }];


  const CheckIcon = () => <Check className="w-4 h-4 text-green-600 mx-auto" />;
  const DashIcon = () => <Minus className="w-4 h-4 text-slate-300 mx-auto" />;

  return (
    <AdminLayout title="Roles & Permissions">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold font-heading">Roles & Permissions</h2>
                        <p className="text-muted-foreground">Define access levels and responsibilities within the Q-Gen system.</p>
                    </div>
                    <div>
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 px-3 py-1">
                            Role-Based Access Control (RBAC)
                        </Badge>
                    </div>
                </div>

                {/* Role Hierarchy Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold">Role Hierarchy</h3>
                    </div>
                    <div className="flex flex-col items-center gap-2 max-w-2xl mx-auto">
                        {roles.map((role, index) =>
            <div key={role.name} className="flex flex-col items-center w-full">
                                <Card className={`w-full ${role.color} shadow-sm border-l-4`}>
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="bg-slate-50 p-2 rounded-lg">
                                            <role.icon className="w-6 h-6 text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-slate-900">{role.name}</h4>
                                                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-bold h-5">
                                                    {role.level}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                {index < roles.length - 1 &&
              <div className="py-2">
                                        <ArrowDown className="w-4 h-4 text-slate-300" />
                                    </div>
              }
                            </div>
            )}
                    </div>
                </section>

                {/* Permissions Matrix Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold">Permission Matrix</h3>
                    </div>
                    <Card className="shadow-sm border-0 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="w-[300px]">Permission</TableHead>
                                    <TableHead className="text-center font-bold">Admin</TableHead>
                                    <TableHead className="text-center font-bold">COE</TableHead>
                                    <TableHead className="text-center font-bold">HOD</TableHead>
                                    <TableHead className="text-center font-bold">Faculty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.map((p) =>
                <TableRow key={p.name} className="hover:bg-slate-50/30 transition-colors">
                                        <TableCell className="font-medium text-slate-700">{p.name}</TableCell>
                                        <TableCell>{p.admin ? <CheckIcon /> : <DashIcon />}</TableCell>
                                        <TableCell>{p.coe ? <CheckIcon /> : <DashIcon />}</TableCell>
                                        <TableCell>{p.hod ? <CheckIcon /> : <DashIcon />}</TableCell>
                                        <TableCell>{p.faculty ? <CheckIcon /> : <DashIcon />}</TableCell>
                                    </TableRow>
                )}
                            </TableBody>
                        </Table>
                    </Card>
                </section>

                {/* Access Scope Explanation Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold">Access Scope Model</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="shadow-sm border-t-2 border-t-green-500 bg-white">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-bold text-slate-900">Faculty Access</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    "Restricted to own created papers only."
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-t-2 border-t-blue-500 bg-white">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-bold text-slate-900">HOD Access</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    "Can review papers within assigned department."
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-t-2 border-t-orange-500 bg-white">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-bold text-slate-900">COE Access</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    "Can approve and lock papers across departments."
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-t-2 border-t-red-500 bg-white">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-bold text-slate-900">Admin Access</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    "Manages system structure and user governance only. Does not generate or edit papers."
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </AdminLayout>);

}