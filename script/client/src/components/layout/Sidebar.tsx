import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  FileText,
  List,
  FileSpreadsheet,
  Settings,
  Cpu,
  Eye,
  Download,
  LayoutDashboard,
  GraduationCap
} from "lucide-react";

const steps = [
  { name: "Course Context", icon: BookOpen, href: "/course-setup", step: 1 },
  { name: "Syllabus Input", icon: List, href: "/syllabus", step: 2 },
  { name: "Course Outcomes", icon: GraduationCap, href: "/outcomes", step: 3 },
  { name: "Sample Questions", icon: FileText, href: "/samples", step: 4 },
  { name: "Blueprint Setup", icon: Settings, href: "/blueprint", step: 5 },
  { name: "Generate Paper", icon: Cpu, href: "/generate", step: 6 },
  { name: "Preview Paper", icon: Eye, href: "/preview", step: 7 },
  { name: "Export & Finalize", icon: Download, href: "/export", step: 8 },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 font-heading font-bold text-xl text-primary">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            Q
          </div>
          <span>Q-Gen System</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Main
        </div>
        
        <Link href="/dashboard">
          <a className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            location === "/dashboard" 
              ? "bg-primary/10 text-primary" 
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </a>
        </Link>

        <div className="mt-6 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span>Workflow</span>
          <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded">Active</span>
        </div>

        <div className="space-y-0.5">
          {steps.map((step, index) => {
            const isActive = location === step.href;
            const isPast = false; // Mock logic for now
            
            return (
              <Link key={step.href} href={step.href}>
                <a className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all relative",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}>
                  {/* Connector Line Mockup */}
                  {index !== steps.length - 1 && (
                    <div className={cn(
                      "absolute left-[1.15rem] top-8 bottom-[-8px] w-px z-[-1]",
                      isActive ? "bg-primary/30" : "bg-border"
                    )} />
                  )}

                  <div className={cn(
                    "w-6 h-6 rounded-full border flex items-center justify-center text-[10px] shrink-0 transition-colors z-10 bg-sidebar",
                    isActive 
                      ? "border-primary-foreground text-primary bg-white" 
                      : "border-border text-muted-foreground group-hover:border-primary group-hover:text-primary"
                  )}>
                    {step.step}
                  </div>
                  
                  <span className="truncate">{step.name}</span>
                  
                  {isActive && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </a>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Prof. John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Department of CS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
