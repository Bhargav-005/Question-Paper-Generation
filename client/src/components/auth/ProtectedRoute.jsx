import React, { useEffect, useState } from "react";
import { Redirect, useLocation } from "wouter";
import { authService } from "@/services/auth";

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and specific roles.
 * Validates session on every render to prevent back-button access after logout.
 */
export const ProtectedRoute = ({ component: Component, requiredRole }) => {
  const [location, setLocation] = useLocation();
  const [isValidated, setIsValidated] = useState(false);

  // Read auth status
  const authenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();

  useEffect(() => {
    // Re-verify auth whenever location changes (handles back button after logout)
    const verifyAuth = () => {
      const isStillAuth = authService.isAuthenticated();
      const currentRole = (authService.getUserRole() || "").toUpperCase();
      const targetRole = (requiredRole || "").toUpperCase();

      if (!isStillAuth) {
        window.location.href = '/login'; 
        return;
      }

      if (targetRole) {
        if (targetRole === 'ADMIN' && currentRole !== 'ADMIN') {
          setLocation("/dashboard");
          return;
        }
        if (targetRole === 'FACULTY' && currentRole === 'ADMIN') {
          setLocation("/admin/dashboard");
          return;
        }
      }

      setIsValidated(true);
    };

    verifyAuth();
  }, [location, requiredRole, setLocation]);

  // Initial render check (sync) to avoid flicker
  if (!authenticated) {
    return <Redirect to="/login" />;
  }

  const currentRole = (userRole || "").toUpperCase();
  const targetRole = (requiredRole || "").toUpperCase();

  if (targetRole === 'ADMIN' && currentRole !== 'ADMIN') {
    return <Redirect to="/dashboard" />;
  }

  if (targetRole === 'FACULTY' && currentRole === 'ADMIN') {
    return <Redirect to="/admin/dashboard" />;
  }

  // Not yet validated (waiting for useEffect to be safe)
  if (!isValidated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse text-sm">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return <Component />;
};
