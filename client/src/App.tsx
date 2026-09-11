/* Profound IQ Consulting — Executive Observatory app shell. Keep the public landing page as the primary route and preserve the light theme provider so semantic tokens stay aligned with the custom global CSS. */
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CookieConsent } from "./components/CookieConsent";
import { WhatsAppSupportWidget } from "./components/WhatsAppSupportWidget";
import { SeoHead } from "./components/SeoHead";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const SchoolSolutions = lazy(() => import("./pages/SchoolSolutions"));
const Resources = lazy(() => import("./pages/Resources"));
const Blog = lazy(() => import("./pages/Blog"));
const InsightArticle = lazy(() => import("./pages/InsightArticle"));
const Contact = lazy(() => import("./pages/Contact"));
const Assessment = lazy(() => import("./pages/Assessment"));
const CareerPath = lazy(() => import("./pages/CareerPath"));
const Psychometrics = lazy(() => import("./pages/Psychometrics"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseComparison = lazy(() => import("./pages/CourseComparison"));
const CoursePaymentSuccess = lazy(() => import("./pages/CoursePaymentSuccess"));
const CourseWorkspace = lazy(() => import("./pages/CourseWorkspace"));
const CohortManagement = lazy(() => import("./pages/CohortManagement"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
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
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SharedReport = lazy(() => import("./pages/SharedReport"));
const CertificateVerification = lazy(
  () => import("./pages/CertificateVerification")
);
const AssessmentVerification = lazy(
  () => import("./pages/AssessmentVerification")
);
const PsychometricVerification = lazy(
  () => import("./pages/PsychometricVerification")
);
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NewsletterAction = lazy(() => import("./pages/NewsletterAction"));

function MySpace() {
  const [, navigate] = useLocation();
  navigate("/dashboard", { replace: true });
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
    <Suspense fallback={<RouteLoading />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/services" component={Services} />
        <Route path="/school-solutions" component={SchoolSolutions} />
        <Route path="/resources" component={Resources} />
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
        <Route path="/courses" component={Courses} />
        <Route path="/courses/compare" component={CourseComparison} />
        <Route
          path="/courses/payment-success"
          component={CoursePaymentSuccess}
        />
        <Route path="/courses/:slug" component={CourseWorkspace} />
        <Route path="/admin/cohorts" component={CohortManagement} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/staff" component={StaffDashboard} />
        <Route
          path="/dashboard/print-pathways"
          component={SavedPathwaysPrint}
        />
        <Route path="/dashboard" component={UserDashboard} />
        <Route path="/dashboard/assessment" component={DashboardAssessment} />
        <Route path="/dashboard/careerpath" component={DashboardCareerPath} />
        <Route path="/dashboard/psychometrics" component={DashboardPsychometrics} />
        <Route path="/dashboard/certificates" component={MyCertificates} />
        <Route path="/dashboard/settings" component={Settings} />
        <Route path="/dashboard/enrolled-courses" component={DashboardEnrolledCourses} />
        <Route path="/dashboard/my-workspaces" component={DashboardMyWorkspaces} />
        <Route path="/myspace" component={MySpace} />
        <Route path="/my-illustrations" component={MyIllustrations} />
        <Route path="/settings" component={Settings} />
        <Route path="/auth" component={Auth} />
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
    </Suspense>
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
