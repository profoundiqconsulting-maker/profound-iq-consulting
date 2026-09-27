/* Profound IQ Consulting — Executive Observatory app shell. Keep the public landing page as the primary route and preserve the light theme provider so semantic tokens stay aligned with the custom global CSS. */
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CookieConsent } from "./components/CookieConsent";
import { WhatsAppSupportWidget } from "./components/WhatsAppSupportWidget";
import { SeoHead } from "./components/SeoHead";
import { RoleBasedRedirect } from "./components/RoleBasedRedirect";
import { AdminRouteGuard } from "./components/AdminRouteGuard";
import { useAuth } from "@/_core/hooks/useAuth";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import SchoolSolutions from "./pages/SchoolSolutions";
import Resources from "./pages/Resources";
import Surveys from "./pages/Surveys";
import Blog from "./pages/Blog";
import InsightArticle from "./pages/InsightArticle";
import Contact from "./pages/Contact";
import Assessment from "./pages/Assessment";
import CareerPath from "./pages/CareerPath";
import Psychometrics from "./pages/Psychometrics";
import CourseComparison from "./pages/CourseComparison";
import CoursePaymentSuccess from "./pages/CoursePaymentSuccess";
import CohortManagement from "./pages/CohortManagement";
import AdminUsers from "./pages/AdminUsers";
import AdminInquiries from "./pages/AdminInquiries";
import AdminCertificates from "./pages/AdminCertificates";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminOperations from "./pages/admin/AdminOperations";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminIntelligence from "./pages/admin/AdminIntelligence";
import AdminPsychometrics from "./pages/admin/AdminPsychometrics";
import AdminInbox from "./pages/admin/AdminInbox";
import AdminSystem from "./pages/admin/AdminSystem";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminCommunications from "./pages/admin/AdminCommunications";
import AdminSurveys from "./pages/admin/AdminSurveys";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminOrganization from "./pages/admin/AdminOrganization";
import AdminResources from "./pages/admin/AdminResources";
import AdminReports from "./pages/admin/AdminReports";
import StaffDashboard from "./pages/StaffDashboard";
import SavedPathwaysPrint from "./pages/SavedPathwaysPrint";
import UserDashboard from "./pages/UserDashboard";
import DashboardAssessment from "./pages/DashboardAssessment";
import DashboardCareerPath from "./pages/DashboardCareerPath";
import DashboardPsychometrics from "./pages/DashboardPsychometrics";
import DashboardEnrolledCourses from "./pages/DashboardEnrolledCourses";
import DashboardMyWorkspaces from "./pages/DashboardMyWorkspaces";
import MyCertificates from "./pages/MyCertificates";
import MyIllustrations from "./pages/MyIllustrations";
import Settings from "./pages/Settings";
import CommunicationInbox from "./pages/CommunicationInbox";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import SharedReport from "./pages/SharedReport";
import CertificateVerification from "./pages/CertificateVerification";
import AssessmentVerification from "./pages/AssessmentVerification";
import PsychometricVerification from "./pages/PsychometricVerification";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import NewsletterAction from "./pages/NewsletterAction";

import CourseWorkspace from "./pages/CourseWorkspace";
const Courses = lazy(() => import("./pages/Courses"));

function MySpace() {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.role) {
      navigate("/auth?mode=login", { replace: true });
      return;
    }
    const role = user.role.toLowerCase();
    if (role === "admin") {
      navigate("/admin/overview", { replace: true });
    } else if (role === "staff") {
      navigate("/staff", { replace: true });
    } else {
      navigate("/dashboard/overview", { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate]);

  return null;
}

function RouteLoading() {
  return (
    <main
      className="min-h-[70vh] bg-[#f7f3e8] px-4 py-8 text-[#16243d] sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="mx-auto max-w-7xl animate-pulse space-y-8 motion-reduce:animate-none">
        <div className="flex items-center justify-between border-b border-[#16243d]/10 pb-5">
          <div className="h-7 w-40 rounded-sm bg-[#16243d]/10" />
          <div className="hidden gap-3 sm:flex">
            <div className="h-3 w-16 rounded bg-[#16243d]/10" />
            <div className="h-3 w-20 rounded bg-[#16243d]/10" />
            <div className="h-3 w-14 rounded bg-[#16243d]/10" />
          </div>
          <div className="h-9 w-9 rounded-full bg-[#c9a34e]/25 sm:hidden" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div className="space-y-5">
            <div className="h-3 w-28 rounded bg-[#c9a34e]/35" />
            <div className="h-12 w-full max-w-xl rounded bg-[#16243d]/12 sm:h-16" />
            <div className="h-4 w-full max-w-lg rounded bg-[#16243d]/8" />
            <div className="h-4 w-4/5 max-w-md rounded bg-[#16243d]/8" />
            <div className="flex gap-3 pt-2">
              <div className="h-11 w-32 rounded bg-[#16243d]/12" />
              <div className="h-11 w-28 rounded border border-[#16243d]/10 bg-white/50" />
            </div>
          </div>
          <div className="min-h-56 rounded-sm border border-[#c9a34e]/25 bg-white/55 p-5">
            <div className="h-full min-h-48 rounded-sm bg-[#16243d]/6" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-28 rounded-sm border border-[#16243d]/10 bg-white/55" />
          <div className="h-28 rounded-sm border border-[#16243d]/10 bg-white/55" />
          <div className="h-28 rounded-sm border border-[#16243d]/10 bg-white/55" />
        </div>
        <span className="sr-only">Loading workspace</span>
      </div>
    </main>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/school-solutions" component={SchoolSolutions} />
      <Route path="/resources" component={Resources} />
      <Route path="/surveys" component={Surveys} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={InsightArticle} />
      <Route path="/contact" component={Contact} />
      <Route
        path="/newsletter/confirm"
        component={() => <NewsletterAction action="confirm" />}
      />
      <Route
        path="/newsletter/unsubscribe"
        component={() => <NewsletterAction action="unsubscribe" />}
      />
      <Route path="/assessment" component={Assessment} />
      <Route path="/careerpath" component={CareerPath} />
      <Route path="/careerpath/assessment" component={CareerPath} />
      <Route path="/careerpath/checkout" component={CareerPath} />
      <Route path="/careerpath/reports" component={CareerPath} />
      <Route path="/psychometrics" component={Psychometrics} />
      <Route path="/psychometrics/:slug" component={Psychometrics} />
      <Route
        path="/courses"
        component={() => (
          <Suspense fallback={<RouteLoading />}>
            <Courses />
          </Suspense>
        )}
      />
      <Route path="/courses/compare" component={CourseComparison} />
      <Route
        path="/courses/payment-success"
        component={CoursePaymentSuccess}
      />
      <Route
        path="/courses/:slug"
        component={() => (
          <Suspense fallback={<RouteLoading />}>
            <CourseWorkspace />
          </Suspense>
        )}
      />
      <Route path="/admin/cohorts" component={() => (
        <AdminRouteGuard>
          <CohortManagement />
        </AdminRouteGuard>
      )} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/inquiries" component={AdminInquiries} />
      <Route path="/admin/certificates" component={AdminCertificates} />
      <Route path="/admin/overview" component={AdminOverview} />
      <Route path="/admin/operations" component={AdminOperations} />
      <Route path="/admin/revenue" component={AdminRevenue} />
      <Route path="/admin/intelligence" component={AdminIntelligence} />
      <Route path="/admin/psychometrics" component={AdminPsychometrics} />
      <Route path="/admin/inbox" component={AdminInbox} />
      <Route path="/admin/system" component={AdminSystem} />
      <Route path="/admin/staff" component={AdminStaff} />
      <Route path="/admin/communications" component={AdminCommunications} />
      <Route path="/admin/surveys" component={AdminSurveys} />
      <Route path="/admin/security" component={AdminSecurity} />
      <Route path="/admin/organization" component={AdminOrganization} />
      <Route path="/admin/resources" component={AdminResources} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route
        path="/admin"
        component={() => {
          useLocation()[1]("/admin/overview", { replace: true });
          return null;
        }}
      />
      <Route path="/staff" component={() => <StaffDashboard />} />
      <Route path="/staff/inquiries" component={() => <StaffDashboard defaultTab="inquiries" />} />
      <Route path="/staff/reviews" component={() => <StaffDashboard defaultTab="review" />} />
      <Route
        path="/dashboard/print-pathways"
        component={SavedPathwaysPrint}
      />
      <Route path="/dashboard" component={RoleBasedRedirect} />
      <Route path="/dashboard/overview" component={UserDashboard} />
      <Route path="/dashboard/assessment" component={DashboardAssessment} />
      <Route path="/dashboard/careerpath" component={DashboardCareerPath} />
      <Route path="/dashboard/psychometrics" component={DashboardPsychometrics} />
      <Route path="/dashboard/certificates" component={MyCertificates} />
      <Route path="/dashboard/settings" component={Settings} />
      <Route path="/dashboard/communication" component={CommunicationInbox} />
      <Route path="/dashboard/enrolled-courses" component={DashboardEnrolledCourses} />
      <Route path="/dashboard/my-workspaces" component={DashboardMyWorkspaces} />
      <Route path="/myspace" component={MySpace} />
      <Route path="/my-illustrations" component={MyIllustrations} />
      <Route
        path="/settings"
        component={() => {
          useLocation()[1]("/dashboard/settings", { replace: true });
          return null;
        }}
      />
      <Route path="/auth" component={Auth} />
      <Route
        path="/login"
        component={() => {
          const params = new URLSearchParams(window.location.search);
          const returnTo = params.get("returnTo");
          const invite = params.get("invite");
          const query = new URLSearchParams();
          query.set("mode", "login");
          if (returnTo) query.set("returnTo", returnTo);
          if (invite) query.set("invite", invite);
          useLocation()[1](`/auth?${query.toString()}`, { replace: true });
          return null;
        }}
      />
      <Route
        path="/signup"
        component={() => {
          const params = new URLSearchParams(window.location.search);
          const returnTo = params.get("returnTo");
          const invite = params.get("invite");
          const query = new URLSearchParams();
          query.set("mode", "register");
          if (returnTo) query.set("returnTo", returnTo);
          if (invite) query.set("invite", invite);
          useLocation()[1](`/auth?${query.toString()}`, { replace: true });
          return null;
        }}
      />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/shared-report" component={SharedReport} />
      <Route path="/verify/assessment" component={AssessmentVerification} />
      <Route path="/verify/certificate" component={CertificateVerification} />
      <Route
        path="/verify/psychometric"
        component={PsychometricVerification}
      />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <SeoHead />
          <Router />
          <WhatsAppSupportWidget />
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
