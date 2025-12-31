import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, FileText, Share2, ShieldCheck, Home } from "lucide-react";

export default function Export() {
  const [, setLocation] = useLocation();

  return (
    <AppLayout title="Export & Finalize">
      <div className="max-w-2xl mx-auto text-center space-y-8 pt-10">
        
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
            <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <div className="space-y-2">
            <h2 className="text-3xl font-heading font-bold text-foreground">Paper Generated Successfully!</h2>
            <p className="text-muted-foreground">
                Your question paper has been finalized, locked, and stored in the secure archive.
                <br />
                ID: <span className="font-mono text-foreground font-semibold">QP-2025-CS8602-A</span>
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Download PDF</h3>
                        <p className="text-xs text-muted-foreground">Standard exam format</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Download className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Download Word</h3>
                        <p className="text-xs text-muted-foreground">Editable .docx format</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Audit Log</h3>
                        <p className="text-xs text-muted-foreground">View generation report</p>
                    </div>
                </CardContent>
            </Card>

             <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-slate-600 group-hover:text-white transition-colors">
                        <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Share Securely</h3>
                        <p className="text-xs text-muted-foreground">Send to Controller of Exams</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="pt-8">
            <Button variant="outline" onClick={() => setLocation("/dashboard")}>
                <Home className="w-4 h-4 mr-2" /> Return to Dashboard
            </Button>
        </div>

      </div>
    </AppLayout>
  );
}
