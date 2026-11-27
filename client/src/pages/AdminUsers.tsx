import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Users } from "lucide-react";
import { Link } from "wouter";

const ROLE_FILTERS = [
  { value: "all", label: "All levels" },
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
  { value: "user", label: "Learner" },
] as const;

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const users = trpc.admin.listAllUsers.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });

  const filteredUsers = useMemo(() => {
    const data = users.data ?? [];
    if (roleFilter === "all") return data;
    return data.filter(user => user.role === roleFilter);
  }, [users.data, roleFilter]);

  return (
    <DashboardLayout role="admin" title="User Management">
      <div className="admin-observatory w-full">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">User Management</p>
            <h1 className="display mt-2 text-3xl">All Users</h1>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Manage user accounts, roles, and access across the platform.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--fg-muted)]">
              User level
              <select
                id="user-level-filter"
                name="role-filter"
                value={roleFilter}
                onChange={event => setRoleFilter(event.target.value)}
                className="mt-1 block border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--fg)]"
              >
                {ROLE_FILTERS.filter(
                  option => option.value !== "all" || roleFilter === "all"
                ).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="exec-badge">
              <Users size={16} />
              <span>
                {filteredUsers.length} user
                {filteredUsers.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        <div className="exec-card overflow-hidden">
          {users.isLoading ? (
            <div className="p-6 text-center text-sm text-[var(--fg-muted)]">
              Loading users…
            </div>
          ) : users.isError ? (
            <div className="p-6 text-center text-sm text-red-600">
              Failed to load users.
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-sm text-[var(--fg-muted)]">
              {roleFilter === "all"
                ? "No users found."
                : `No ${ROLE_FILTERS.find(option => option.value === roleFilter)?.label.toLowerCase()} users found.`}
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
                  {filteredUsers.map(user => (
                    <tr key={user.openId}>
                      <td className="font-medium text-[var(--fg)]">
                        <Link
                          href={`/admin/users/${encodeURIComponent(user.openId)}`}
                          className="text-[var(--brand)] underline underline-offset-4 hover:text-[#5c4513]"
                        >
                          {user.name ?? "—"}
                        </Link>
                      </td>
                      <td className="text-[var(--fg-muted)]">{user.email}</td>
                      <td>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            user.role === "admin"
                              ? "bg-[var(--brand)]/15 text-[var(--brand)]"
                              : user.role === "staff"
                                ? "bg-[#dbeafe] text-[#1e40af]"
                                : "bg-[#f1f5f9] text-[var(--fg-muted)]"
                          }`}
                        >
                          {user.role === "user" ? "learner" : user.role}
                        </span>
                      </td>
                      <td className="text-[var(--fg-muted)]">
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
