/* Profound IQ Consulting — Executive Observatory app shell. Keep the public landing page as the primary route and preserve the light theme provider so semantic tokens stay aligned with the custom global CSS. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import Home from "./pages/Home";
import Assessment from "./pages/Assessment";
import CareerPath from "./pages/CareerPath";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import UserDashboard from "./pages/UserDashboard";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import CourseWorkspace from "./pages/CourseWorkspace";
import Courses from "./pages/Courses";
import CoursePaymentSuccess from "./pages/CoursePaymentSuccess";
import SharedReport from "./pages/SharedReport";
import CertificateVerification from "./pages/CertificateVerification";
import Psychometrics from "./pages/Psychometrics";
import PsychometricVerification from "./pages/PsychometricVerification";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { CookieConsent } from "./components/CookieConsent";
import { WhatsAppSupportWidget } from "./components/WhatsAppSupportWidget";
import { TranslationFeedback } from "./components/TranslationFeedback";
import { SeoHead } from "./components/SeoHead";
import About from "./pages/About";
import Services from "./pages/Services";
import SchoolSolutions from "./pages/SchoolSolutions";
import Resources from "./pages/Resources";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return <Switch><Route path="/" component={Home} /><Route path="/about" component={About} /><Route path="/services" component={Services} /><Route path="/school-solutions" component={SchoolSolutions} /><Route path="/resources" component={Resources} /><Route path="/blog" component={Blog} /><Route path="/contact" component={Contact} /><Route path="/assessment" component={Assessment} /><Route path="/careerpath/assessment" component={CareerPath} /><Route path="/careerpath/results" component={CareerPath} /><Route path="/careerpath" component={CareerPath} /><Route path="/psychometrics" component={Psychometrics} /><Route path="/psychometrics/:slug" component={Psychometrics} /><Route path="/courses" component={Courses} /><Route path="/courses/payment-success" component={CoursePaymentSuccess} /><Route path="/courses/:slug" component={CourseWorkspace} /><Route path="/admin" component={AdminDashboard} /><Route path="/staff" component={StaffDashboard} /><Route path="/dashboard" component={UserDashboard} /><Route path="/settings" component={Settings} /><Route path="/auth" component={Auth} /><Route path="/reset-password" component={ResetPassword} /><Route path="/shared-report" component={SharedReport} /><Route path="/verify/certificate" component={CertificateVerification} /><Route path="/verify/psychometric" component={PsychometricVerification} /><Route path="/privacy-policy" component={PrivacyPolicy} /><Route path="/terms-of-service" component={TermsOfService} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light" switchable><LocaleProvider><TooltipProvider><Toaster /><SeoHead /><Router /><WhatsAppSupportWidget /><TranslationFeedback /><CookieConsent /></TooltipProvider></LocaleProvider></ThemeProvider></ErrorBoundary>;
}
