import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,

  LogOut,
  Shield,
  ShieldCheck } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";

const adminNavItems = [
{ name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
{ name: "Faculty Management", icon: Users, href: "/admin/faculty" },
{ name: "Create Faculty", icon: Users, href: "/admin/create-faculty" },
{ name: "Departments", icon: Building2, href: "/admin/departments" },
{ name: "Roles & Permissions", icon: ShieldCheck, href: "/admin/roles" },
{ name: "Audit Logs", icon: FileText, href: "/admin/audit" }];








export function AdminLayout({ children, title }) {
  const [location] = useLocation();

  React.useEffect(() => {
    if (title) {
      document.title = `${title} | Q-Gen Admin`;
    } else {
      document.title = "Q-Gen System Admin";
    }
  }, [title]);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background flex">
            {/* Admin Sidebar */}
            <div className="h-screen w-64 bg-slate-900 text-white border-r border-slate-800 flex flex-col fixed left-0 top-0 z-20">
                <div className="p-6 border-b border-slate-800">
                    <Link href="/">
                        <div className="flex items-center gap-2 font-heading font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                                <img src="/logo.png" alt="Q-Gen Logo" className="w-full h-full object-contain" />
                            </div>
                            <span>Admin Panel</span>
                        </div>
                    </Link>
                    <p className="text-xs text-slate-400 mt-1">Q-Gen System</p>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {adminNavItems.map((item) => {
            const isActive = location === item.href || item.href !== "/admin/dashboard" && location.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                isActive ?
                "bg-red-600 text-white shadow-lg" :
                "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}>
                                <Icon className="w-4 h-4" />
                                <span>{item.name}</span>
                            </Link>);

          })}
                </div>

                <div className="p-4 border-t border-slate-800 space-y-2">
                    <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={handleLogout}>
            
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64">
                <div className="p-8">
                    {title &&
          <div className="mb-6">
                            <h1 className="text-3xl font-bold font-heading text-foreground">{title}</h1>
                        </div>
          }
                    {children}
                </div>
            </div>
        </div>);

}