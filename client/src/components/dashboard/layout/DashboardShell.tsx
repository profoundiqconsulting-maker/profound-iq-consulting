import type { ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
  title?: string;
  role: "user" | "staff" | "admin";
}

export function DashboardShell({
  children,
  title,
  role,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f3e8] via-[#f7f3e8] to-[#ead9ae] dark:from-[#0d1a2f] dark:via-[#101d35] dark:to-[#16243d]">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col lg:flex-row">
          <aside className="hidden lg:block w-64 shrink-0 border-r border-[#16243d]/10 dark:border-[#657084]/15 bg-white/60 dark:bg-[#16243d]/60 backdrop-blur-sm">
            <nav aria-label="Dashboard navigation" className="p-4">
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e] dark:text-[#7d5e1e] mb-4">
                {role === "admin" ? "Admin" : role === "staff" ? "Staff" : "Workspace"}
              </p>
               <div className="space-y-1">
                 {role === "user" && (
                   <>
                     <a href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-[#c9a34e]/10 text-[#7d5e1e] dark:text-[#7d5e1e]">Overview</a>
                     <a href="/assessment" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Self Assessment</a>
                     <a href="/careerpath" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">CareerPath</a>
                     <a href="/psychometrics" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Psychometrics</a>
                     <a href="/courses" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Courses</a>
                     <a href="/dashboard/certificates" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Certificates</a>
                     <a href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Settings</a>
                   </>
                 )}
                  {role === "staff" && (
                    <>
                      <a href="/staff" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-[#c9a34e]/10 text-[#7d5e1e] dark:text-[#7d5e1e]">Overview</a>
                      <a href="/staff/inquiries" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Assigned Inquiries</a>
                      <a href="/staff/reviews" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Lesson Reviews</a>
                    </>
                  )}
                  {role === "admin" && (
                    <>
                      <a href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-[#c9a34e]/10 text-[#7d5e1e] dark:text-[#7d5e1e]">Overview</a>
                      <a href="/admin/overview" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Assessments</a>
                      <a href="/admin/psychometrics" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Psychometrics</a>
                      <a href="/admin/inquiries" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Inquiries</a>
                      <a href="/admin/revenue" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Revenue</a>
                      <a href="/admin/staff" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Staff & Catalog</a>
                      <a href="/admin/cohorts" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Learning</a>
                      <a href="/admin/security" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Security</a>
                      <a href="/admin/organization" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#16243d] hover:bg-[#16243d]/5 dark:hover:bg-[#657084]/10">Organizations</a>
                    </>
                  )}
               </div>
            </nav>
          </aside>
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
            {title && (
              <div className="mb-8">
                <h1 className="display text-4xl sm:text-5xl text-[#16243d] dark:text-[#f7f3e8]">
                  {title}
                </h1>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

