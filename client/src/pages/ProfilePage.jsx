import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar, 
  GraduationCap, 
  Award, 
  Clock, 
  BookOpen,
  Edit2,
  Lock,
  FileText,
  CheckCircle2,
  BarChart3,
  Sparkles
} from "lucide-react";

export default function ProfilePage() {
  // Mock data as requested
  const facultyData = {
    name: localStorage.getItem('user_name') || "Guest Faculty",
    facultyId: "FAC001",
    email: localStorage.getItem('user_email') || "faculty@qgen.edu",
    phone: "+91 98765 43210",
    department: "Computer Science",
    designation: "Assistant Professor",
    joiningDate: "12 Aug 2021",
    qualification: "Ph.D. in Computer Science",
    specialization: "Artificial Intelligence & ML",
    experience: "8 Years",
    researchAreas: "Deep Learning, Natural Language Processing, Ethical AI",
    assignedCourses: [
      { code: "CS8601", name: "Artificial Intelligence", semester: "6th", year: "2023-24" },
      { code: "CS8491", name: "Computer Architecture", semester: "4th", year: "2023-24" },
      { code: "CS8075", name: "Data Warehousing", semester: "7th", year: "2024-25" }
    ],
    metrics: {
      totalPapers: 12,
      pendingReviews: 2,
      questionsGenerated: 450,
      avgCoverage: "98%"
    }
  };

  return (
    <AppLayout title="Faculty Profile">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-heading font-bold text-foreground">Faculty Profile</h2>
          <p className="text-muted-foreground">Manage your personal and academic information</p>
        </div>

        {/* SECTION 1 — Profile Header Card */}
        <Card className="border-border shadow-md overflow-hidden bg-gradient-to-r from-primary/5 to-background">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="w-32 h-32 rounded-2xl bg-primary/10 border-4 border-white flex items-center justify-center text-primary text-4xl font-bold shadow-sm">
                {facultyData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-foreground">{facultyData.name}</h3>
                  <p className="text-primary font-medium flex items-center justify-center md:justify-start gap-2">
                    <Briefcase className="w-4 h-4" /> {facultyData.designation}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground justify-center md:justify-start">
                    <Building2 className="w-4 h-4" /> {facultyData.department}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground justify-center md:justify-start">
                    <Mail className="w-4 h-4" /> {facultyData.email}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                  <Button size="sm" className="gap-2">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                    <Lock className="w-4 h-4" /> Change Password
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block text-right">
                <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Faculty ID</p>
                <p className="text-lg font-mono text-foreground font-bold">{facultyData.facultyId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 5 — System Activity Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Papers Generated"
            value={facultyData.metrics.totalPapers}
            icon={FileText}
            description="Lifetime generated"
          />
          <MetricCard
            title="Pending Reviews"
            value={facultyData.metrics.pendingReviews}
            icon={Clock}
            description="Awaiting action"
            color="text-orange-500"
          />
          <MetricCard
            title="Questions Generated"
            value={facultyData.metrics.questionsGenerated}
            icon={Sparkles}
            description="AI-assisted bank"
            color="text-blue-500"
          />
          <MetricCard
            title="Avg. CO Coverage"
            value={facultyData.metrics.avgCoverage}
            icon={CheckCircle2}
            description="Alignment score"
            color="text-green-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SECTION 2 — Basic Information */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProfileItem label="Full Name" value={facultyData.name} icon={User} />
              <ProfileItem label="Faculty ID" value={facultyData.facultyId} icon={Award} />
              <ProfileItem label="Official Email" value={facultyData.email} icon={Mail} />
              <ProfileItem label="Phone Number" value={facultyData.phone} icon={Phone} />
              <ProfileItem label="Department" value={facultyData.department} icon={Building2} />
              <ProfileItem label="Designation" value={facultyData.designation} icon={Briefcase} />
              <ProfileItem label="Date of Joining" value={facultyData.joiningDate} icon={Calendar} />
            </CardContent>
          </Card>

          {/* SECTION 3 — Academic Information */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> Academic Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProfileItem label="Qualification" value={facultyData.qualification} vertical />
              <ProfileItem label="Area of Specialization" value={facultyData.specialization} vertical />
              <ProfileItem label="Teaching Experience" value={facultyData.experience} vertical />
              <ProfileItem label="Research Areas" value={facultyData.researchAreas} vertical />
              
              <div className="pt-2">
                <Button variant="outline" className="w-full gap-2 border-dashed">
                  View Full Academic CV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 4 — Courses Assigned Card */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 border-b border-sidebar-border/50">
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Courses Assigned
            </CardTitle>
            <CardDescription>Academic year 2023 - 2025</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-8">Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead className="pr-8 text-right">Academic Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facultyData.assignedCourses.map((course, i) => (
                  <TableRow key={i} className="hover:bg-slate-50/30 transition-colors">
                    <TableCell className="pl-8 font-mono text-xs font-bold text-primary">{course.code}</TableCell>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell className="pr-8 text-right text-muted-foreground">{course.year}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function MetricCard({ title, value, description, icon: Icon, color }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
          {Icon && <Icon className={`h-4 w-4 ${color || "text-primary/70"}`} />}
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-foreground tracking-tight">{value}</span>
          <span className="text-[10px] text-muted-foreground mt-1 font-medium">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileItem({ label, value, icon: Icon, vertical = false }) {
  if (vertical) {
    return (
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between pb-3 border-b border-sidebar-border last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground/60" />}
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}
