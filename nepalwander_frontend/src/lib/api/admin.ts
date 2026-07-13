import api from "./axios";
import { User } from "@/types";

export const adminApi = {
  getUsers: async (params?: Record<string, string>) => {
    const res = await api.get("/admin/users", { params });
    return res.data.data as { users: User[]; total: number };
  },

  updateUserStatus: async (id: string, isActive: boolean) => {
    const res = await api.patch(`/admin/users/${id}/status`, { isActive });
    return res.data.data as User;
  },

  deleteUser: async (id: string) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  getPendingAccounts: async () => {
    const res = await api.get("/admin/pending");
    return res.data.data as User[];
  },

  approveAccount: async (id: string) => {
    const res = await api.patch(`/admin/accounts/${id}/approve`);
    return res.data;
  },

  rejectAccount: async (id: string, reason: string) => {
    const res = await api.patch(`/admin/accounts/${id}/reject`, { reason });
    return res.data;
  },

  verifyNma: async (id: string) => {
    const res = await api.patch(`/admin/guides/${id}/verify-nma`);
    return res.data;
  },

  toggleGuideStatus: async (id: string) => {
    const res = await api.patch(`/admin/guides/${id}/toggle-status`);
    return res.data;
  },
};