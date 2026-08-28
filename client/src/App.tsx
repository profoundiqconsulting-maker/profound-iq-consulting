/* Profound IQ Consulting — Executive Observatory app shell. Keep the public landing page as the primary route and preserve the light theme provider so semantic tokens stay aligned with the custom global CSS. */
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import { CookieConsent } from "./components/CookieConsent";
import { WhatsAppSupportWidget } from "./components/WhatsAppSupportWidget";
import { TranslationFeedback } from "./components/TranslationFeedback";
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
const MyIllustrations = lazy(() => import("./pages/MyIllustrations"));
const Settings = lazy(() => import("./pages/Settings"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SharedReport = lazy(() => import("./pages/SharedReport"));
const CertificateVerification = lazy(() => import("./pages/CertificateVerification"));
const PsychometricVerification = lazy(() => import("./pages/PsychometricVerification"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NewsletterAction = lazy(() => import("./pages/NewsletterAction"));

function RouteLoading() {
  return <div className="grid min-h-[45vh] place-items-center bg-[#f7f3e8] text-[#16243d]" role="status" aria-live="polite"><span className="border-b-2 border-[#c9a34e] px-4 py-3 text-[10px] font-black uppercase tracking-[.16em]">Loading workspace</span></div>;
}

function Router() {
  return <Suspense fallback={<RouteLoading />}><Switch><Route path="/" component={Home} /><Route path="/about" component={About} /><Route path="/services" component={Services} /><Route path="/school-solutions" component={SchoolSolutions} /><Route path="/resources" component={Resources} /><Route path="/blog" component={Blog} /><Route path="/blog/:slug" component={InsightArticle} /><Route path="/contact" component={Contact} /><Route path="/newsletter/confirm" component={() => <NewsletterAction action="confirm" />} /><Route path="/newsletter/unsubscribe" component={() => <NewsletterAction action="unsubscribe" />} /><Route path="/assessment" component={Assessment} /><Route path="/careerpath/assessment" component={CareerPath} /><Route path="/careerpath/results" component={CareerPath} /><Route path="/careerpath" component={CareerPath} /><Route path="/psychometrics" component={Psychometrics} /><Route path="/psychometrics/:slug" component={Psychometrics} /><Route path="/courses" component={Courses} /><Route path="/courses/compare" component={CourseComparison} /><Route path="/courses/payment-success" component={CoursePaymentSuccess} /><Route path="/courses/:slug" component={CourseWorkspace} /><Route path="/admin/cohorts" component={CohortManagement} /><Route path="/admin" component={AdminDashboard} /><Route path="/staff" component={StaffDashboard} /><Route path="/dashboard/print-pathways" component={SavedPathwaysPrint} /><Route path="/dashboard" component={UserDashboard} /><Route path="/my-illustrations" component={MyIllustrations} /><Route path="/settings" component={Settings} /><Route path="/auth" component={Auth} /><Route path="/reset-password" component={ResetPassword} /><Route path="/shared-report" component={SharedReport} /><Route path="/verify/certificate" component={CertificateVerification} /><Route path="/verify/psychometric" component={PsychometricVerification} /><Route path="/privacy-policy" component={PrivacyPolicy} /><Route path="/terms-of-service" component={TermsOfService} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></Suspense>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light" switchable><LocaleProvider><TooltipProvider><Toaster /><SeoHead /><Router /><WhatsAppSupportWidget /><TranslationFeedback /><CookieConsent /></TooltipProvider></LocaleProvider></ThemeProvider></ErrorBoundary>;
}
