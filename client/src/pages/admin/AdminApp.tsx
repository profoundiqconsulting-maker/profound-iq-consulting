import { lazy, Suspense } from "react";
import { Route, Switch, useLocation } from "wouter";
import { AdminRouteGuard } from "@/components/AdminRouteGuard";

const AdminOverview = lazy(() => import("./AdminOverview"));
const AdminOperations = lazy(() => import("./AdminOperations"));
const AdminRevenue = lazy(() => import("./AdminRevenue"));
const AdminIntelligence = lazy(() => import("./AdminIntelligence"));
const AdminPsychometrics = lazy(() => import("./AdminPsychometrics"));
const AdminInbox = lazy(() => import("./AdminInbox"));
const AdminSystem = lazy(() => import("./AdminSystem"));
const AdminStaff = lazy(() => import("./AdminStaff"));
const AdminCommunications = lazy(() => import("./AdminCommunications"));
const AdminSurveys = lazy(() => import("./AdminSurveys"));
const AdminSecurity = lazy(() => import("./AdminSecurity"));
const AdminOrganization = lazy(() => import("./AdminOrganization"));
const AdminResources = lazy(() => import("./AdminResources"));
const AdminReports = lazy(() => import("./AdminReports"));
const AdminUsers = lazy(() => import("../AdminUsers"));
const AdminInquiries = lazy(() => import("../AdminInquiries"));
const AdminCertificates = lazy(() => import("../AdminCertificates"));
const CohortManagement = lazy(() => import("../CohortManagement"));

function AdminRouteLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#f7f3e8]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#16243d] border-t-[#c9a34e]" />
    </div>
  );
}

function AdminApp() {
  return (
    <Suspense fallback={<AdminRouteLoading />}>
      <Switch>
        <Route path="/admin" component={() => {
          const [, navigate] = useLocation();
          navigate("/admin/overview", { replace: true });
          return null;
        }} />
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
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/inquiries" component={AdminInquiries} />
        <Route path="/admin/certificates" component={AdminCertificates} />
        <Route path="/admin/cohorts" component={() => (
          <AdminRouteGuard>
            <CohortManagement />
          </AdminRouteGuard>
        )} />
        <Route component={() => {
          const [, navigate] = useLocation();
          navigate("/admin/overview", { replace: true });
          return null;
        }} />
      </Switch>
    </Suspense>
  );
}

export default AdminApp;
