/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { User } from "@/types";

const ROLE_COLORS: Record<string, string> = {
  admin: "badge-info",
  guide: "badge-warning",
  operator: "badge-success",
  tourist: "badge-success",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data.users ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    setActionLoading(id + "_status");
    try {
      await adminApi.updateUserStatus(id, !isActive);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: !isActive } : u));
    } catch {
      alert("Failed to update user.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id + "_approve");
    try {
      await adminApi.approveAccount(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, accountStatus: "approved" as any } : u));
    } catch {
      alert("Failed to approve account.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim() || rejectReason.length < 10) {
      alert("Please provide a reason (min 10 characters).");
      return;
    }
    setActionLoading(id + "_reject");
    try {
      await adminApi.rejectAccount(id, rejectReason);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, accountStatus: "rejected" as any } : u));
      setRejectId(null);
      setRejectReason("");
    } catch {
      alert("Failed to reject account.");
    } finally {
      setActionLoading(null);
    }
  };

  const isPending = (user: User) => user.accountStatus === "pending";

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4">
      <p className="text-sm" style={{ color: "var(--color-outline)" }}>
        {users.length} user{users.length !== 1 ? "s" : ""}
      </p>

      {/* Reject reason modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="card" style={{ padding: 24, width: 400 }}>
            <h3 className="font-bold text-sm mb-3" style={{ color: "var(--color-on-surface)" }}>Reject Account</h3>
            <p className="text-xs mb-3" style={{ color: "var(--color-outline)" }}>Provide a reason for rejection (min 10 characters):</p>
            <textarea
              className="input-field mb-4"
              style={{ height: 80, paddingTop: 10, resize: "none" }}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Does not meet requirements..."
            />
            <div className="flex gap-2">
              <button onClick={() => { setRejectId(null); setRejectReason(""); }}
                className="btn-secondary flex-1" style={{ height: 40 }}>Cancel</button>
              <button onClick={() => handleReject(rejectId)}
                disabled={actionLoading === rejectId + "_reject"}
                className="flex-1 h-10 rounded-lg font-semibold text-sm text-white transition-all"
                style={{ backgroundColor: "var(--color-danger)" }}>
                {actionLoading === rejectId + "_reject" ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm" style={{ color: "var(--color-outline)" }}>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold" style={{ color: "var(--color-on-surface)" }}>No users yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-outline-variant)", backgroundColor: "var(--color-surface-low)" }}>
                {["User", "Email", "Role", "Status", "Account", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-outline)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user._id} style={{ borderBottom: i < users.length - 1 ? "1px solid var(--color-surface-high)" : "none" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: "var(--color-primary)" }}>
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${ROLE_COLORS[user.role] ?? "badge-success"}`}>{user.role.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.isActive ? "badge-success" : "badge-danger"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      user.accountStatus === "approved" ? "badge-success" :
                      user.accountStatus === "pending" ? "badge-warning" :
                      user.accountStatus === "rejected" ? "badge-danger" : "badge-info"
                    }`}>
                      {user.accountStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Approve/Reject for pending guide/operator */}
                      {isPending(user) && user.role !== "admin" && (
                        <>
                          <button
                            onClick={() => handleApprove(user._id)}
                            disabled={actionLoading === user._id + "_approve"}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                            style={{ backgroundColor: "rgba(29,158,117,0.1)", color: "var(--color-success)" }}
                          >
                            {actionLoading === user._id + "_approve" ? "..." : "✓ Approve"}
                          </button>
                          <button
                            onClick={() => { setRejectId(user._id); setRejectReason(""); }}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                            style={{ backgroundColor: "rgba(216,90,48,0.1)", color: "var(--color-danger)" }}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}

                      {/* Activate/Deactivate for non-admin */}
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          disabled={actionLoading === user._id + "_status"}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                          style={{
                            backgroundColor: user.isActive ? "rgba(216,90,48,0.1)" : "rgba(29,158,117,0.1)",
                            color: user.isActive ? "var(--color-danger)" : "var(--color-success)",
                          }}
                        >
                          {actionLoading === user._id + "_status" ? "..." : user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}