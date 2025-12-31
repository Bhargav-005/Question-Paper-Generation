import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Lock, Mail, ArrowRight } from "lucide-react";
import generatedBg from "@assets/generated_images/clean_minimal_abstract_geometric_blue_and_white_background_pattern.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setLoading(false);
      setLocation("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Hero / Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-primary text-primary-foreground flex-col justify-between p-12 overflow-hidden">
        <div 
            className="absolute inset-0 opacity-10 mix-blend-overlay z-0" 
            style={{ 
                backgroundImage: `url(${generatedBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }} 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-blue-900/90 z-1" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 font-heading font-bold text-2xl">
            <div className="w-10 h-10 bg-white text-primary rounded-lg flex items-center justify-center">
              Q
            </div>
            <span>Q-Gen System</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-heading font-bold mb-6 leading-tight">
            Academic Excellence through Intelligent Automation
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed">
            Generate balanced, outcome-driven question papers aligned with Bloom's Taxonomy. 
            Streamline your academic workflow with precision and trust.
          </p>
        </div>

        <div className="relative z-10 text-sm text-blue-200">
          © 2025 Academic Systems Inc. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-heading font-bold text-foreground">Welcome back</h2>
            <p className="mt-2 text-muted-foreground">
              Please enter your academic credentials to access the system.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Institutional Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  placeholder="faculty@university.edu" 
                  type="email" 
                  className="pl-10 h-11"
                  required 
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-11"
                  required 
                  data-testid="input-password"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember this device for 30 days
              </label>
            </div>

            <Button 
                type="submit" 
                className="w-full h-11 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40" 
                disabled={loading}
                data-testid="button-login"
            >
              {loading ? "Verifying Credentials..." : (
                <span className="flex items-center gap-2">
                  Sign In to Dashboard <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Protected System
              </span>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            Restricted access. All activities are logged for audit purposes.
          </div>
        </div>
      </div>
    </div>
  );
}
