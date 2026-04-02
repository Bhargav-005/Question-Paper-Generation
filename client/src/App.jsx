import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CourseSetup from "@/pages/CourseSetup";
import Syllabus from "@/pages/Syllabus";
import CourseOutcomes from "@/pages/CourseOutcomes";
import COSyllabusMapping from "@/pages/COSyllabusMapping";
import SampleQuestions from "@/pages/SampleQuestions";
import Blueprint from "@/pages/Blueprint";
import GenerateQuestions from "@/pages/GenerateQuestions";
import Preview from "@/pages/Preview";
import Export from "@/pages/Export";
import ProfilePage from "@/pages/ProfilePage";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import FacultyManagement from "@/pages/admin/FacultyManagement";
import CreateFaculty from "@/pages/admin/CreateFaculty";
import AuditLogs from "@/pages/admin/AuditLogs";
import EditFaculty from "@/pages/admin/EditFaculty";
import RolesPermissions from "@/pages/admin/RolesPermissions";
import Departments from "@/pages/admin/Departments";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function Router() {
  return (
    <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />

            {/* Protected Faculty Routes */}
            <Route path="/dashboard"><ProtectedRoute component={Dashboard} requiredRole="FACULTY" /></Route>
            <Route path="/course-setup"><ProtectedRoute component={CourseSetup} requiredRole="FACULTY" /></Route>
            <Route path="/syllabus"><ProtectedRoute component={Syllabus} requiredRole="FACULTY" /></Route>
            <Route path="/outcomes"><ProtectedRoute component={CourseOutcomes} requiredRole="FACULTY" /></Route>
            <Route path="/co-syllabus-mapping"><ProtectedRoute component={COSyllabusMapping} requiredRole="FACULTY" /></Route>
            <Route path="/samples"><ProtectedRoute component={SampleQuestions} requiredRole="FACULTY" /></Route>
            <Route path="/blueprint"><ProtectedRoute component={Blueprint} requiredRole="FACULTY" /></Route>
            <Route path="/generate"><ProtectedRoute component={GenerateQuestions} requiredRole="FACULTY" /></Route>
            <Route path="/preview"><ProtectedRoute component={Preview} requiredRole="FACULTY" /></Route>
            <Route path="/preview-paper/:paperId">{(params) => <ProtectedRoute component={() => <Preview {...params} />} requiredRole="FACULTY" />}</Route>
            <Route path="/export"><ProtectedRoute component={Export} requiredRole="FACULTY" /></Route>
            <Route path="/faculty/profile"><ProtectedRoute component={ProfilePage} requiredRole="FACULTY" /></Route>

            {/* Admin Routes */}
            <Route path="/admin"><ProtectedRoute component={AdminDashboard} requiredRole="ADMIN" /></Route>
            <Route path="/admin/dashboard"><ProtectedRoute component={AdminDashboard} requiredRole="ADMIN" /></Route>
            <Route path="/admin/faculty"><ProtectedRoute component={FacultyManagement} requiredRole="ADMIN" /></Route>
            <Route path="/admin/create-faculty"><ProtectedRoute component={CreateFaculty} requiredRole="ADMIN" /></Route>
            <Route path="/admin/faculty/:id/edit">{(params) => <ProtectedRoute component={() => <EditFaculty {...params} />} requiredRole="ADMIN" />}</Route>
            <Route path="/admin/roles"><ProtectedRoute component={RolesPermissions} requiredRole="ADMIN" /></Route>
            <Route path="/admin/audit"><ProtectedRoute component={AuditLogs} requiredRole="ADMIN" /></Route>
            <Route path="/admin/departments"><ProtectedRoute component={Departments} requiredRole="ADMIN" /></Route>

            <Route component={NotFound} />
        </Switch>);

}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Router />
            </TooltipProvider>
        </QueryClientProvider>);

}

export default App;