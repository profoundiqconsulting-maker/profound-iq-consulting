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

const Courses = lazy(() => import("./pages/Courses"));
const CourseWorkspace = lazy(() => import("./pages/CourseWorkspace"));
const CohortManagement = lazy(() => import("./pages/CohortManagement"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminInquiries = lazy(() => import("./pages/AdminInquiries"));
const AdminCertificates = lazy(() => import("./pages/AdminCertificates"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminOperations = lazy(() => import("./pages/admin/AdminOperations"));
const AdminRevenue = lazy(() => import("./pages/admin/AdminRevenue"));
const AdminIntelligence = lazy(() => import("./pages/admin/AdminIntelligence"));
const AdminPsychometrics = lazy(() => import("./pages/admin/AdminPsychometrics"));
const AdminInbox = lazy(() => import("./pages/admin/AdminInbox"));
const AdminSystem = lazy(() => import("./pages/admin/AdminSystem"));
const AdminStaff = lazy(() => import("./pages/admin/AdminStaff"));
const AdminCommunications = lazy(() => import("./pages/admin/AdminCommunications"));
const AdminSurveys = lazy(() => import("./pages/admin/AdminSurveys"));
const AdminSecurity = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminOrganization = lazy(() => import("./pages/admin/AdminOrganization"));
const AdminResources = lazy(() => import("./pages/admin/AdminResources"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const StaffDashboard = lazy(() => import("./pages/StaffDashboard"));
const SavedPathwaysPrint = lazy(() => import("./pages/SavedPathwaysPrint"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const DashboardAssessment = lazy(() => import("./pages/DashboardAssessment"));
const DashboardCareerPath = lazy(() => import("./pages/DashboardCareerPath"));
const DashboardPsychometrics = lazy(() => import("./pages/DashboardPsychometrics"));
const DashboardEnrolledCourses = lazy(() => import("./pages/DashboardEnrolledCourses"));
const DashboardMyWorkspaces = lazy(() => import("./pages/DashboardMyWorkspaces"));
const MyCertificates = lazy(() => import("./pages/MyCertificates"));
const MyIllustrations = lazy(() => import("./pages/MyIllustrations"));
const Settings = lazy(() => import("./pages/Settings"));
const CommunicationInbox = lazy(() => import("./pages/CommunicationInbox"));

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
        <Suspense fallback={<RouteLoading />}>
          <AdminRouteGuard>
            <CohortManagement />
          </AdminRouteGuard>
        </Suspense>
      )} />
      <Route path="/admin/users" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminUsers />
        </Suspense>
      )} />
      <Route path="/admin/inquiries" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminInquiries />
        </Suspense>
      )} />
      <Route path="/admin/certificates" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminCertificates />
        </Suspense>
      )} />
      <Route path="/admin/overview" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminOverview />
        </Suspense>
      )} />
      <Route path="/admin/operations" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminOperations />
        </Suspense>
      )} />
      <Route path="/admin/revenue" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminRevenue />
        </Suspense>
      )} />
      <Route path="/admin/intelligence" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminIntelligence />
        </Suspense>
      )} />
      <Route path="/admin/psychometrics" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminPsychometrics />
        </Suspense>
      )} />
      <Route path="/admin/inbox" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminInbox />
        </Suspense>
      )} />
      <Route path="/admin/system" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminSystem />
        </Suspense>
      )} />
      <Route path="/admin/staff" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminStaff />
        </Suspense>
      )} />
      <Route path="/admin/communications" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminCommunications />
        </Suspense>
      )} />
      <Route path="/admin/surveys" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminSurveys />
        </Suspense>
      )} />
      <Route path="/admin/security" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminSecurity />
        </Suspense>
      )} />
      <Route path="/admin/organization" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminOrganization />
        </Suspense>
      )} />
      <Route path="/admin/resources" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminResources />
        </Suspense>
      )} />
      <Route path="/admin/reports" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <AdminReports />
        </Suspense>
      )} />
      <Route
        path="/admin"
        component={() => {
          useLocation()[1]("/admin/overview", { replace: true });
          return null;
        }}
      />
      <Route path="/staff" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <StaffDashboard />
        </Suspense>
      )} />
      <Route path="/staff/inquiries" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <StaffDashboard defaultTab="inquiries" />
        </Suspense>
      )} />
      <Route path="/staff/reviews" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <StaffDashboard defaultTab="review" />
        </Suspense>
      )} />
      <Route
        path="/dashboard/print-pathways"
        component={() => (
          <Suspense fallback={<RouteLoading />}>
            <SavedPathwaysPrint />
          </Suspense>
        )}
      />
      <Route path="/dashboard" component={RoleBasedRedirect} />
      <Route path="/dashboard/overview" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <UserDashboard />
        </Suspense>
      )} />
      <Route path="/dashboard/assessment" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <DashboardAssessment />
        </Suspense>
      )} />
      <Route path="/dashboard/careerpath" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <DashboardCareerPath />
        </Suspense>
      )} />
      <Route path="/dashboard/psychometrics" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <DashboardPsychometrics />
        </Suspense>
      )} />
      <Route path="/dashboard/certificates" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <MyCertificates />
        </Suspense>
      )} />
      <Route path="/dashboard/settings" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <Settings />
        </Suspense>
      )} />
      <Route path="/dashboard/communication" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <CommunicationInbox />
        </Suspense>
      )} />
      <Route path="/dashboard/enrolled-courses" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <DashboardEnrolledCourses />
        </Suspense>
      )} />
      <Route path="/dashboard/my-workspaces" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <DashboardMyWorkspaces />
        </Suspense>
      )} />
      <Route path="/myspace" component={MySpace} />
      <Route path="/my-illustrations" component={() => (
        <Suspense fallback={<RouteLoading />}>
          <MyIllustrations />
        </Suspense>
      )} />
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
