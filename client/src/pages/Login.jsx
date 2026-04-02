import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Mail, ArrowRight, Shield, ShieldCheck, GraduationCap, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";


export default function Login() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("faculty");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.title = "Login | Q-Gen System";
    setMounted(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = document.getElementById(activeTab === 'faculty' ? 'email' : 'admin-email').value;
    const password = document.getElementById(activeTab === 'faculty' ? 'password' : 'admin-password').value;

    try {
      const { login } = await import("../services/auth");
      await new Promise((resolve) => setTimeout(resolve, 800));

      const result = await login(email, password);

      if (result.success && result.user) {
        if (result.user.role === 'ADMIN') {
          setLocation("/admin/dashboard");
        } else {
          setLocation("/dashboard");
        }
      } else {
        alert(result.message || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("An error occurred during login. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50/50 overflow-hidden font-sans selection:bg-blue-500/10 selection:text-blue-900">

      {/* Left Side - Brand & Infrastructure */}
      <div className="hidden lg:flex w-[48%] relative bg-[#0B1121] text-white flex-col justify-between p-16 overflow-hidden border-r border-slate-900/50">

        {/* 1. ULTRA-SUBTLE ANIMATED GRADIENT DRIFT */}
        <motion.div
          className="absolute inset-0 z-0 bg-gradient-to-br from-[#0f172a] via-[#0B1121] to-[#1e293b]"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "mirror", ease: "linear" }} />
        

        {/* 2. RADIAL SPOTLIGHT BEHIND HEADLINE */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

        {/* Content Layer */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-4">
            
            <div className="w-12 h-12 bg-white/[0.08] backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
              <img src="/logo.png" alt="Q-Gen Logo" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white/90">Q-Gen Institutional</h3>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-blue-400/80 font-semibold mt-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                Operational
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
            className="max-w-lg">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/[0.08] border border-blue-400/20 text-blue-200 text-[11px] font-medium mb-8 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="tracking-wide">ENTERPRISE GRADE SECURITY</span>
            </div>
            <h1 className="text-5xl md:text-[3.5rem] font-bold mb-6 leading-[1.05] tracking-[-0.02em] text-white">
              The Infrastructure for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-200">Academic Integrity</span>
            </h1>
            <p className="text-lg text-slate-400/80 leading-relaxed max-w-md font-light tracking-wide">
              Secure, automated examination protocol for high-stakes institutional assessments. Powered by calibrated AI.
            </p>
          </motion.div>

          {/* 7. TRUST SIGNAL REFINEMENT */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex items-center justify-between text-xs font-medium text-slate-500 border-t border-white/[0.06] pt-8">
            
            <div className="flex gap-8 tracking-wide">
              <span className="hover:text-slate-400 transition-colors cursor-default">© 2026 Academic Systems Inc.</span>
              <span className="hover:text-slate-400 transition-colors cursor-default">v3.0.1 Stable</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 bg-white/[0.03] px-3 py-1.5 rounded-md border border-white/[0.05]">
              <Lock className="w-3 h-3" />
              <span className="font-mono text-[10px] tracking-wider">256-BIT E2E ENCRYPTION</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Interface */}
      <div className={`w-full lg:w-[52%] flex items-center justify-center p-6 lg:p-24 relative transition-colors duration-1000 ${activeTab === 'admin' ? 'bg-[#F8FAFC]' : 'bg-[#F8FAFC]'}`
      }>

        {/* Soft Background Blur - subtle depth */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50 mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-40 mix-blend-multiply" />

        <div className="w-full max-w-[420px] relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={mounted ? "visible" : "hidden"}
            // 8. MICRO DEPTH ENHANCEMENT
            className={`backdrop-blur-xl rounded-[24px] p-8 md:p-10 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_30px_rgba(0,0,0,0.06)] border transition-all duration-500 ease-out ${activeTab === 'admin' ?
            'bg-white/80 border-slate-300 ring-1 ring-slate-900/5' :
            'bg-white/80 border-white/60 ring-1 ring-slate-900/5'} hover:-translate-y-[3px]`
            }>
            
            <motion.div variants={itemVariants} className="relative text-center mb-10">
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute left-0 top-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 -mt-2 -ml-2 rounded-lg"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Home</span>
              </Button>
              <img src="/logo.png" alt="Q-Gen Logo" className="h-14 w-auto mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-slate-500 text-[13px] font-medium tracking-wide">Authenticate to access your workspace</p>
            </motion.div>

            {/* 4. SEGMENTED TOGGLE - PREMIUM CONTROL */}
            <Tabs defaultValue="faculty" onValueChange={setActiveTab} className="w-full mb-8">
              <motion.div variants={itemVariants}>
                <TabsList className="relative w-full grid grid-cols-2 p-1 bg-slate-100/80 rounded-xl h-12 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] border border-black/[0.02]">
                  <TabsTrigger
                    value="faculty"
                    className="z-10 rounded-lg font-semibold text-[13px] transition-all duration-300 ease-out data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] data-[state=active]:scale-[1.02] focus-visible:ring-2 focus-visible:ring-blue-500/40">
                    
                    <GraduationCap className="w-4 h-4 mr-2 opacity-70" />
                    Faculty
                  </TabsTrigger>
                  <TabsTrigger
                    value="admin"
                    className="z-10 rounded-lg font-semibold text-[13px] transition-all duration-300 ease-out data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] data-[state=active]:scale-[1.02] focus-visible:ring-2 focus-visible:ring-blue-500/40">
                    
                    <Shield className="w-4 h-4 mr-2 opacity-70" />
                    Admin
                  </TabsTrigger>
                </TabsList>
              </motion.div>

              <form onSubmit={handleLogin} className="space-y-6 mt-8">
                <TabsContent value="faculty" className="space-y-5">
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="email" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Academic ID</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                      {/* 7. ACCESSIBILITY POLISH */}
                      <Input
                        id="email"
                        placeholder="faculty@university.edu"
                        type="email"
                        className="pl-11 h-11 text-[15px] rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:border-blue-500/50 focus:ring-[3px] focus:ring-blue-500/10 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus:scale-[1.01] transition-all duration-300 ease-out font-medium text-slate-800 placeholder:text-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                        required />
                      
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="password" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Secure Passkey</Label>
                      <a href="#" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded">Forgot?</a>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-11 h-11 text-[15px] rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:border-blue-500/50 focus:ring-[3px] focus:ring-blue-500/10 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus:scale-[1.01] transition-all duration-300 ease-out font-medium text-slate-800 placeholder:text-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                        required />
                      
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="admin" className="space-y-5">
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="admin-email" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Administrator ID</Label>
                    <div className="relative group">
                      <Shield className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300" />
                      <Input
                        id="admin-email"
                        placeholder="admin@sys.edu"
                        type="email"
                        className="pl-11 h-11 text-[15px] rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:border-indigo-500/50 focus:ring-[3px] focus:ring-indigo-500/10 focus-visible:ring-4 focus-visible:ring-indigo-500/20 focus:scale-[1.01] transition-all duration-300 ease-out font-medium text-slate-800 placeholder:text-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                        required />
                      
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="admin-password" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Master Key</Label>
                      <div className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[9px] font-bold border border-amber-100 uppercase tracking-wider">Privileged</div>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300" />
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-11 h-11 text-[15px] rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:border-indigo-500/50 focus:ring-[3px] focus:ring-indigo-500/10 focus-visible:ring-4 focus-visible:ring-indigo-500/20 focus:scale-[1.01] transition-all duration-300 ease-out font-medium text-slate-800 placeholder:text-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                        required />
                      
                    </div>
                  </motion.div>
                </TabsContent>

                <motion.div variants={itemVariants}>
                  <div className="flex items-center space-x-3 mb-6 ml-1">
                    <Checkbox id="remember" className="rounded-[4px] w-4 h-4 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/40" />
                    <label
                      htmlFor="remember"
                      className="text-xs font-medium text-slate-500 cursor-pointer select-none">
                      
                      Trust this device for 30 days
                    </label>
                  </div>

                  {/* 3. REFINE BUTTON ELEVATION - MORE ENTERPRISE */}
                  <Button
                    type="submit"
                    className={`w-full h-12 rounded-xl text-[15px] font-bold shadow-md shadow-blue-600/5 hover:shadow-blue-600/10 hover:-translate-y-[1px] active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group relative overflow-hidden focus-visible:ring-4 focus-visible:ring-blue-500/20 ${activeTab === 'admin' ?
                    'bg-slate-900 hover:bg-slate-800 text-white' :
                    'bg-gradient-to-tr from-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-600 text-white'}`
                    }
                    disabled={loading}>
                    
                    {loading ?
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </div> :

                    <span className="flex items-center justify-center gap-2">
                        {activeTab === 'faculty' ? 'Access Workspace' : 'Initialize Console'}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    }
                  </Button>
                </motion.div>
              </form>
            </Tabs>

            <motion.div variants={itemVariants} className="pt-8 border-t border-slate-100 relative">
              <div className="text-center flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
                <Lock className="w-3 h-3 text-slate-300" />
                <span>Protected by Q-Gen Identity Services</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>);

}