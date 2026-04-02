import React, { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion, useInView } from "framer-motion";
import { useLocation } from "wouter";
import {
  Shield,
  CheckCircle2,
  Zap,
  Users,
  ArrowRight,
  Lock,
  Menu,
  X,

  Activity,
  Search,
  LayoutDashboard,
  FileText,
  PieChart,
  Settings,
  Bell,
  MoreHorizontal,
  Filter,


  Upload,
  Database } from
"lucide-react";

// --- Types ---





// --- 3D Scroll Animation Component ---
const ContainerScroll = ({ titleComponent, children }) => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef
  });

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}>
      
            <div
        className="py-10 w-full relative"
        style={{
          perspective: "1000px"
        }}>
        
                <Header translate={translate} titleComponent={titleComponent} />
                <Card rotate={rotate} translate={translate} scale={scale}>
                    {children}
                </Card>
            </div>
        </div>);

};

const Header = ({ translate, titleComponent }) => {
  return (
    <motion.div
      style={{
        translateY: translate
      }}
      className="max-w-5xl mx-auto text-center">
      
            {titleComponent}
        </motion.div>);

};

const Card = ({
  rotate,
  scale,
  translate,
  children





}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
        "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003"
      }}
      className="max-w-6xl -mt-12 mx-auto h-[30rem] md:h-[45rem] w-full border-4 border-[#6C6C6C] p-2 md:p-4 bg-[#222222] rounded-[30px] shadow-2xl">
      
            <div className="h-full w-full overflow-hidden rounded-2xl bg-slate-50 md:rounded-2xl">
                {children}
            </div>
        </motion.div>);

};

// --- Mock Dashboard Component ---
const MockDashboard = () => {
  return (
    <div className="w-full h-full bg-slate-50 flex flex-col font-sans select-none pointer-events-none">
            {/* Top Navigation Bar */}
            <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="h-4 w-px bg-slate-300 mx-2" />
                    <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Dashboard / Overview
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <div className="w-64 h-8 bg-slate-100 rounded-lg border border-slate-200" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        JD
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><LayoutDashboard className="w-5 h-5" /></div>
                    <div className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><FileText className="w-5 h-5" /></div>
                    <div className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><PieChart className="w-5 h-5" /></div>
                    <div className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><Users className="w-5 h-5" /></div>
                    <div className="mt-auto p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><Settings className="w-5 h-5" /></div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 overflow-hidden bg-slate-50/50">
                    <div className="max-w-6xl mx-auto space-y-6">

                        {/* Header Stats */}
                        <div className="grid grid-cols-4 gap-4">
                            {[
              { label: "Active Papers", val: "24", sub: "+2 this week", icon: FileText, className: "bg-blue-50 text-blue-600" },
              { label: "CO Mapping", val: "99.8%", sub: "Above threshold", icon: Activity, className: "bg-emerald-50 text-emerald-600" },
              { label: "Pending Review", val: "03", sub: "Requires action", icon: Bell, className: "bg-amber-50 text-amber-600" },
              { label: "OBE Compliance", val: "98%", sub: "Verified", icon: Shield, className: "bg-indigo-50 text-indigo-600" }].
              map((stat, i) =>
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`p-2 rounded-lg ${stat.className}`}>
                                            <stat.icon className="w-4 h-4" />
                                        </div>
                                        <MoreHorizontal className="w-4 h-4 text-slate-300" />
                                    </div>
                                    <div className="text-2xl font-bold text-slate-800 mb-1">{stat.val}</div>
                                    <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                                    <div className="text-[10px] text-slate-400 mt-1">{stat.sub}</div>
                                </div>
              )}
                        </div>

                        <div className="grid grid-cols-3 gap-6 h-[400px]">
                            {/* Question Bank Table */}
                            <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-semibold text-slate-800">Recent Generated Questions</h3>
                                    <button className="text-xs font-medium text-slate-500 flex items-center gap-1 border rounded px-2 py-1"><Filter className="w-3 h-3" /> Filter</button>
                                </div>
                                <div className="flex-1 overflow-hidden p-2">
                                    <div className="w-full text-left text-sm">
                                        <div className="flex text-xs font-semibold text-slate-400 bg-slate-50 rounded-lg p-2 mb-2">
                                            <div className="w-20">QID</div>
                                            <div className="flex-1">Question Preview</div>
                                            <div className="w-24">Bloom's</div>
                                            <div className="w-20">CO Ref</div>
                                            <div className="w-20">Status</div>
                                        </div>
                                        <div className="space-y-1">
                                            {[
                      { id: "QB-1024", q: "Explain the architectural differences...", bloom: "L2 - Understand", co: "CO-2", status: "Approved" },
                      { id: "QB-1025", q: "Design a relational schema for...", bloom: "L6 - Create", co: "CO-4", status: "Pending" },
                      { id: "QB-1026", q: "Analyze the complexity of...", bloom: "L4 - Analyze", co: "CO-3", status: "Approved" },
                      { id: "QB-1027", q: "Calculate the throughput of...", bloom: "L3 - Apply", co: "CO-2", status: "Review" },
                      { id: "QB-1028", q: "Define the ACID properties...", bloom: "L1 - Remember", co: "CO-1", status: "Approved" },
                      { id: "QB-1029", q: "Compare TCP and UDP protocols...", bloom: "L4 - Analyze", co: "CO-3", status: "Approved" }].
                      map((row, i) =>
                      <div key={i} className="flex items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                    <div className="w-20 font-mono text-xs text-slate-500">{row.id}</div>
                                                    <div className="flex-1 text-slate-700 truncate pr-4">{row.q}</div>
                                                    <div className="w-24 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full text-center inline-block">{row.bloom.split(' - ')[0]}</div>
                                                    <div className="w-20 text-xs text-slate-500">{row.co}</div>
                                                    <div className="w-20">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                          row.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`
                          }>
                                                            {row.status}
                                                        </span>
                                                    </div>
                                                </div>
                      )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Analytics Col */}
                            <div className="col-span-1 space-y-6">
                                {/* Bloom's Distribution */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-[240px]">
                                    <h3 className="font-semibold text-slate-800 mb-4 text-sm">Bloom's Taxonomy</h3>
                                    <div className="flex items-center justify-center h-32 relative">
                                        {/* CSS Pie Chart Mock */}
                                        <div className="w-32 h-32 rounded-full border-[12px] border-indigo-500 relative flex items-center justify-center" style={{ borderRightColor: '#f59e0b', borderBottomColor: '#10b981', borderLeftColor: '#3b82f6' }}>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-slate-800">100%</div>
                                                <div className="text-[10px] text-slate-500">Aligned</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-center gap-2 mt-4">
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Remember</div>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Apply</div>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500"><div className="w-2 h-2 rounded-full bg-amber-500" /> Create</div>
                                    </div>
                                </div>

                                {/* Compliance Badge */}
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-600">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-emerald-900">Compliance Verified</div>
                                        <div className="text-xs text-emerald-700">OBE & NBA Standards Met</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>);

};

// --- Workflow Animated Timeline Component ---
// --- Workflow Animated Timeline Component ---
const WorkflowTimeline = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 50%"]
  });

  const scaleLine = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const steps = [
  {
    title: "Admin Setup",
    desc: "Configure question banks, templates, and faculty accounts",
    icon: Settings,
    colorClasses: "border-blue-600 bg-blue-600",
    delay: 0
  },
  {
    title: "Faculty Upload",
    desc: "Faculty upload course outcomes and exam specifications",
    icon: Upload,
    colorClasses: "border-emerald-600 bg-emerald-600",
    delay: 0.2
  },
  {
    title: "System Generate",
    desc: "AI generates CO-aligned papers with Bloom's balance",
    icon: Zap,
    colorClasses: "border-sky-600 bg-sky-600",
    delay: 0.4
  },
  {
    title: "Review & Export",
    desc: "Faculty review, customize, and export professional PDFs",
    icon: CheckCircle2,
    colorClasses: "border-indigo-600 bg-indigo-600",
    delay: 0.6
  }];


  return (
    <div ref={ref} className="relative max-w-6xl mx-auto px-4">
            {/* Connecting Line */}
            <div className="absolute top-12 left-0 w-full h-1 bg-slate-200 hidden md:block -z-10" />
            <motion.div
        className="absolute top-12 left-0 h-1 bg-blue-600 hidden md:block -z-10 origin-left"
        style={{ scaleX: scaleLine }} />
      

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {steps.map((step, i) =>
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: step.delay }}
          className="flex flex-col items-center text-center group">
          
                        <div className={`w-24 h-24 rounded-full bg-white border-4 ${step.colorClasses.split(' ')[0]} flex items-center justify-center mb-6 shadow-lg z-10 transition-transform duration-300 group-hover:scale-110`}>
                            <div className={`w-20 h-20 rounded-full ${step.colorClasses.split(' ')[1]} flex items-center justify-center text-white`}>
                                <step.icon className="w-10 h-10" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-[200px]">{step.desc}</p>
                    </motion.div>
        )}
            </div>
        </div>);

};

// --- Main Page Component ---
export default function Home() {
  const [, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Assessment Intelligence | Q-Gen System";
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">

            {/* --- Navigation --- */}
            <nav
        className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300 ${isScrolled ?
        "bg-white/90 backdrop-blur-md border-b border-slate-200" :
        "bg-transparent"}`
        }>
        
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/logo.png" alt="Q-Gen Logo" className="h-8 w-8 object-contain" />
                        <span className="font-bold text-lg tracking-tight">Q-GEN Systems</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200">Features</button>
                        <button onClick={() => scrollToSection('workflow')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200">Workflow</button>
                        <button onClick={() => scrollToSection('security')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200">Security</button>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <button onClick={() => setLocation("/login")} className="text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-4 py-2 rounded-lg transition-all duration-200 active:scale-95">Faculty Login</button>
                    </div>

                    <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {mobileMenuOpen &&
        <div className="md:hidden bg-white border-b border-slate-100 absolute w-full px-6 py-4 space-y-4 shadow-lg">
                        <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 font-medium">Features</button>
                        <button onClick={() => scrollToSection('workflow')} className="block w-full text-left py-2 font-medium">Workflow</button>
                        <button onClick={() => setLocation("/login")} className="block w-full py-3 bg-slate-100 rounded text-center font-semibold mt-4">Login</button>
                    </div>
        }
            </nav>

            {/* --- Hero Section with 3D Scroll --- */}
            <section className="bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white to-transparent pointer-events-none" />

                <ContainerScroll
          titleComponent={
          <div className="flex flex-col items-center">
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-700 leading-tight mb-8">
                                Assessment Intelligence for <br />
                                <span className="text-blue-600">Higher Education.</span>
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                                className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                                Deploy the enterprise standard for Bloom's Taxonomy compliant question paper generation. Secure, automated, and architected for institutional scale.
                            </motion.p>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                                className="flex flex-row gap-4 justify-center mb-20">
                                <button
                                    onClick={() => setLocation("/login")}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-gradient-to-tr hover:from-blue-600 hover:to-indigo-600 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out shadow-lg hover:shadow-blue-500/25 flex items-center gap-2">
                                    Start Platform <ArrowRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => scrollToSection('architecture')}
                                    className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 hover:scale-105 active:scale-95 hover:shadow-lg transition-all duration-300 ease-in-out">
                                    View Architecture
                                </button>
                            </motion.div>
                        </div>
          }>
          
                    <MockDashboard />
                </ContainerScroll>
            </section>

            {/* --- Trust Indicators --- */}
            <section className="py-12 border-y border-slate-100 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by Leading Institutions</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {["Technical University", "Institute of Technology", "State Engineering College", "Academic Research Labs"].map((name, i) =>
                            <div key={i} className="text-lg font-bold text-slate-800 flex items-center gap-3 hover:scale-110 transition-transform duration-300 cursor-default">
                                <div className="w-6 h-6 bg-slate-300 rounded shadow-inner" />
                                {name}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* --- Features --- */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Engineered for Academic Roles</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Tailored workflows for both content creators and administrative oversight.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Faculty Card */}
                        <div className="bg-white rounded-[30px] p-10 border border-slate-200 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-500 relative overflow-hidden group cursor-default">
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-colors duration-300">
                                    <FileText className="w-8 h-8 text-teal-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">For Faculty</h3>
                                <p className="text-slate-500 font-medium">Intelligent question paper generation</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {[
                                    "Generate CO-aligned question papers instantly",
                                    "Balance questions across Bloom's Taxonomy levels",
                                    "Maintain university-specific formatting patterns",
                                    "Export professional PDFs with one click",
                                    "Access complete generation history and templates"
                                ].map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 text-left">
                                        <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                                        <span className="text-slate-600 font-medium leading-tight">{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => setLocation("/login")}
                                className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-teal-600/20">
                                Access Module <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Admin Card */}
                        <div className="bg-white rounded-[30px] p-10 border border-slate-200 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-500 relative overflow-hidden group cursor-default">
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors duration-300">
                                    <Shield className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">For Administrators</h3>
                                <p className="text-slate-500 font-medium">Complete institutional oversight</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {[
                                    "Create and manage faculty user accounts",
                                    "Monitor all generated papers and analytics",
                                    "Configure question bank templates and patterns",
                                    "Track institutional compliance metrics",
                                    "Ensure consistency across departments"
                                ].map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 text-left">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <span className="text-slate-600 font-medium leading-tight">{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => setLocation("/admin")}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-600/20">
                                Access Module <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- WORKFLOW SECTION (ANIMATED) --- */}
            <section id="workflow" className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">How It Works</h2>
                        <p className="text-slate-500 text-lg leading-relaxed">
                            A streamlined workflow designed for academic institutions
                        </p>
                    </div>

                    <WorkflowTimeline />
                </div>
            </section>

            {/* --- Security --- */}
            <section id="security" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Enterprise-Grade Security</h2>
                        <p className="text-slate-500 text-lg">Built with institutional data protection and access control at its core</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column: Visual Hierarchy */}
                        <div className="bg-white rounded-3xl shadow-2xl p-12 relative flex flex-col items-center justify-center border border-slate-100 min-h-[500px]">
                            {/* Admin Node */}
                            <div className="relative z-10 flex flex-col items-center mb-12">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg flex items-center justify-center mb-4 text-white">
                                    <Shield className="w-12 h-12" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-blue-900">Administrator</h3>
                                    <p className="text-xs text-blue-500 font-medium">Full System Control</p>
                                </div>
                            </div>

                            {/* Connecting Lines (SVG) */}
                            <div className="absolute left-12 right-12 top-0 bottom-0 flex items-center justify-center pointer-events-none">
                                <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
                                    {/* Vertical Main Stem */}
                                    <line x1="200" y1="120" x2="200" y2="225" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
                                    {/* Horizontal Branch */}
                                    <line x1="50" y1="225" x2="350" y2="225" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
                                    {/* Vertical Drops */}
                                    <line x1="50" y1="225" x2="50" y2="265" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
                                    <line x1="150" y1="225" x2="150" y2="265" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
                                    <line x1="250" y1="225" x2="250" y2="265" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
                                    <line x1="350" y1="225" x2="350" y2="265" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
                                    {/* Connection Dots */}
                                    <circle cx="200" cy="225" r="4" fill="#3b82f6" />
                                    <circle cx="50" cy="225" r="3" fill="#3b82f6" />
                                    <circle cx="150" cy="225" r="3" fill="#3b82f6" />
                                    <circle cx="250" cy="225" r="3" fill="#3b82f6" />
                                    <circle cx="350" cy="225" r="3" fill="#3b82f6" />
                                </svg>
                            </div>

                            {/* Faculty Nodes */}
                            <div className="grid grid-cols-4 gap-4 w-full relative z-10 mt-8">
                                {[1, 2, 3, 4].map((i) =>
                                    <div key={i} className="flex flex-col items-center">
                                        <div className="w-14 h-14 bg-teal-600 rounded-2xl shadow-md flex items-center justify-center mb-3 text-white">
                                            <Users className="w-7 h-7" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Faculty {i}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Features List */}
                        <div className="space-y-4">
                            { [
                                {
                                    title: "Role-Based Access Control",
                                    desc: "Granular permissions ensure faculty only access their data",
                                    icon: Lock
                                },
                                {
                                    title: "JWT Authentication",
                                    desc: "Secure token-based authentication for all user sessions",
                                    icon: Lock
                                },
                                {
                                    title: "Isolated Data Architecture",
                                    desc: "Complete data separation between institutional entities",
                                    icon: Database
                                },
                                {
                                    title: "End-to-End Encryption",
                                    desc: "All data encrypted in transit and at rest",
                                    icon: Shield
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-6 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-default">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-blue-50 transition-colors duration-300">
                                        <item.icon className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                                        <p className="text-slate-500 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA Section --- */}
            <section className="py-24 bg-blue-600 text-white text-center">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to modernize your assessment infrastructure?</h2>
                    <div className="flex flex-row justify-center gap-4">
                        <button
                            onClick={() => setLocation("/login")}
                            className="px-10 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl">
                            Deploy for Faculty
                        </button>
                        <button
                            onClick={() => setLocation("/admin")}
                            className="px-10 py-4 bg-transparent border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300">
                            Contact Institutional Sales
                        </button>
                    </div>
                    <p className="mt-8 text-blue-200 font-medium opacity-80">Enterprise-grade, trusted by leading technical institutions.</p>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="py-12 bg-[#111827] text-slate-400 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-white">
                        <img src="/logo.png" alt="Q-Gen Logo" className="h-6 w-6 object-contain" />
                        <span className="font-bold">Q-GEN Systems Inc.</span>
                    </div>
                    <div className="text-sm">
                        © 2026 Q-Gen Systems Inc. All Rights Reserved.
                    </div>
                    <div className="flex gap-8 text-sm font-medium">
                        <a href="#" className="hover:text-blue-400 transition-colors duration-200">Privacy</a>
                        <a href="#" className="hover:text-blue-400 transition-colors duration-200">Terms</a>
                        <a href="#" className="hover:text-blue-400 transition-colors duration-200">Status</a>
                    </div>
                </div>
            </footer>
        </div>);

}