/* Profound IQ Consulting — Executive Observatory app shell. Keep the public landing page as the primary route and preserve the light theme provider so semantic tokens stay aligned with the custom global CSS. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Assessment from "./pages/Assessment";
import CareerPath from "./pages/CareerPath";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import CourseWorkspace from "@/pages/CourseWorkspace";
import SharedReport from "./pages/SharedReport";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return <Switch><Route path="/" component={Home} /><Route path="/assessment" component={Assessment} /><Route path="/careerpath/assessment" component={CareerPath} /><Route path="/careerpath/results" component={CareerPath} /><Route path="/careerpath" component={CareerPath} /><Route path="/courses/:slug" component={CourseWorkspace} /><Route path="/admin" component={AdminDashboard} /><Route path="/dashboard" component={UserDashboard} /><Route path="/settings" component={Settings} /><Route path="/auth" component={Auth} /><Route path="/reset-password" component={ResetPassword} /><Route path="/shared-report" component={SharedReport} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light" switchable><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
