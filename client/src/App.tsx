import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CourseSetup from "@/pages/CourseSetup";
import Syllabus from "@/pages/Syllabus";
import CourseOutcomes from "@/pages/CourseOutcomes";
import SampleQuestions from "@/pages/SampleQuestions";
import Blueprint from "@/pages/Blueprint";
import Generate from "@/pages/Generate";
import Preview from "@/pages/Preview";
import Export from "@/pages/Export";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/course-setup" component={CourseSetup} />
      <Route path="/syllabus" component={Syllabus} />
      <Route path="/outcomes" component={CourseOutcomes} />
      <Route path="/samples" component={SampleQuestions} />
      <Route path="/blueprint" component={Blueprint} />
      <Route path="/generate" component={Generate} />
      <Route path="/preview" component={Preview} />
      <Route path="/export" component={Export} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
