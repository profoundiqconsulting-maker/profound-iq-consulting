import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Users } from "lucide-react";

export default function AdminUsers() {
  const users = trpc.admin.listAllUsers.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });

  return (
    <DashboardLayout role="admin" title="User Management">
      <div className="admin-observatory w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="exec-eyebrow">User Management</p>
            <h1 className="display mt-2 text-3xl">All Users</h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Manage user accounts, roles, and access across the platform.
            </p>
          </div>
          <div className="exec-badge">
            <Users size={16} />
            <span>{users.data?.length ?? 0} total users</span>
          </div>
        </div>

        <div className="exec-card overflow-hidden">
          {users.isLoading ? (
            <div className="p-6 text-center text-sm text-[#64748b]">
              Loading users…
            </div>
          ) : users.isError ? (
            <div className="p-6 text-center text-sm text-red-600">
              Failed to load users.
            </div>
          ) : (users.data ?? []).length === 0 ? (
            <div className="p-6 text-center text-sm text-[#64748b]">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="exec-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {(users.data ?? []).map(user => (
                    <tr key={user.openId}>
                      <td className="font-medium text-[#0f172a]">
                        {user.name ?? "—"}
                      </td>
                      <td className="text-[#475569]">{user.email}</td>
                      <td>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            user.role === "admin"
                              ? "bg-[#c9a34e]/15 text-[#7d5e1e]"
                              : user.role === "staff"
                                ? "bg-[#dbeafe] text-[#1e40af]"
                                : "bg-[#f1f5f9] text-[#475569]"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="text-[#64748b]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
